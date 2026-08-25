package common

import (
	"errors"
	"sync"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	frontendPaymentReconcileIntervalSeconds         int64 = 60
	frontendPaymentReconcileLockTTLSeconds          int   = 55
	frontendPaymentCallbackProcessingTimeoutMinutes int64 = 30
	frontendPaymentReconcileLockRedisKey                  = "frontend:payment:reconcile:lock"
)

var frontendPaymentReconcileWorkerOnce sync.Once

// frontendPaymentReconcileRoundResult 函数说明：保存每轮定时对账执行结果，便于日志输出和异常定位。
type frontendPaymentReconcileRoundResult struct {
	ClosedPendingCount          int64
	InterruptedProcessingCount  int64
	RefundedExpiredPointsCount  int64
	SkippedByDistributedLocking bool
}

// StartFrontendPaymentReconcileWorker 函数说明：启动支付定时对账任务，周期处理待支付超时关单与回调处理中超时标记。
func StartFrontendPaymentReconcileWorker(db *gorm.DB) {
	if db == nil {
		core.Logger.Warn("StartFrontendPaymentReconcileWorker skipped: db is nil")
		return
	}

	frontendPaymentReconcileWorkerOnce.Do(func() {
		go func() {
			// 函数说明：启动后立即跑一轮，避免服务重启后等待一个周期才修复积压订单。
			runFrontendPaymentReconcileRoundWithLogging(db)

			ticker := time.NewTicker(time.Duration(frontendPaymentReconcileIntervalSeconds) * time.Second)
			defer ticker.Stop()
			for range ticker.C {
				runFrontendPaymentReconcileRoundWithLogging(db)
			}
		}()
		core.Logger.Infof("frontend payment reconcile worker started: interval=%ds", frontendPaymentReconcileIntervalSeconds)
	})
}

// runFrontendPaymentReconcileRoundWithLogging 函数说明：执行一轮对账并输出日志，失败只告警不影响主服务。
func runFrontendPaymentReconcileRoundWithLogging(db *gorm.DB) {
	result, err := runFrontendPaymentReconcileRound(db)
	if err != nil {
		core.Logger.Warnf("runFrontendPaymentReconcileRound err: err=[%+v]", err)
		return
	}
	if result.SkippedByDistributedLocking {
		return
	}
	if result.ClosedPendingCount > 0 || result.InterruptedProcessingCount > 0 || result.RefundedExpiredPointsCount > 0 {
		core.Logger.Infof(
			"frontend payment reconcile round completed: closed_pending=%d interrupted_processing=%d refunded_expired_points=%d",
			result.ClosedPendingCount,
			result.InterruptedProcessingCount,
			result.RefundedExpiredPointsCount,
		)
	}
}

// runFrontendPaymentReconcileRound 函数说明：执行一轮支付对账，含分布式锁保护，避免多实例重复处理。
func runFrontendPaymentReconcileRound(db *gorm.DB) (res frontendPaymentReconcileRoundResult, e error) {
	if !util.RedisUtil.SetNX(frontendPaymentReconcileLockRedisKey, "1", frontendPaymentReconcileLockTTLSeconds) {
		res.SkippedByDistributedLocking = true
		return res, nil
	}
	defer util.RedisUtil.Del(frontendPaymentReconcileLockRedisKey)

	now := time.Now().Unix()
	closedCount, err := closeExpiredPendingOrdersByScheduler(db, now)
	if err != nil {
		return res, err
	}
	interruptedCount, err := markInterruptedProcessingOrdersByScheduler(db, now)
	if err != nil {
		return res, err
	}
	refundedPointsCount, err := refundExpiredPointsConsumesByScheduler(db, now, 500)
	if err != nil {
		return res, err
	}
	res.ClosedPendingCount = closedCount
	res.InterruptedProcessingCount = interruptedCount
	res.RefundedExpiredPointsCount = refundedPointsCount
	return res, nil
}

// refundExpiredPointsConsumesByScheduler 函数说明：定时扫描过期预扣记录并逐条退款，避免用户不再访问时余额长期占用。
func refundExpiredPointsConsumesByScheduler(db *gorm.DB, now int64, limit int) (count int64, e error) {
	if db == nil || now <= 0 {
		return 0, nil
	}
	if limit <= 0 || limit > 2000 {
		limit = 500
	}
	candidates := make([]frontendUserPointsConsumeEntity, 0, limit)
	if err := db.Select("id", "user_id").
		Where("status = ? AND expires_at > ? AND expires_at <= ?", frontendPointsConsumeStatusReserved, 0, now).
		Order("id ASC").
		Limit(limit).
		Find(&candidates).Error; err != nil {
		return 0, response.CheckErr(err, "refundExpiredPointsConsumesByScheduler Find err")
	}
	for _, candidate := range candidates {
		refunded, err := refundExpiredPointsConsumeByScheduler(db, candidate.ID, candidate.UserID, now)
		if err != nil {
			return count, err
		}
		if refunded {
			count++
		}
	}
	return count, nil
}

// refundExpiredPointsConsumeByScheduler 函数说明：按用户行、账本行的统一锁顺序幂等退还单条过期预扣。
func refundExpiredPointsConsumeByScheduler(db *gorm.DB, consumeID uint, userID uint, now int64) (refunded bool, e error) {
	if consumeID == 0 || userID == 0 {
		return false, nil
	}
	tx := db.Begin()
	if tx.Error != nil {
		return false, response.CheckErr(tx.Error, "refundExpiredPointsConsumeByScheduler Begin err")
	}
	defer func() {
		_ = tx.Rollback().Error
	}()

	var user frontendUserEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", userID).Limit(1).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, response.CheckErr(err, "refundExpiredPointsConsumeByScheduler User First err")
	}
	var consume frontendUserPointsConsumeEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id = ? AND user_id = ? AND status = ? AND expires_at > ? AND expires_at <= ?", consumeID, userID, frontendPointsConsumeStatusReserved, 0, now).
		Limit(1).
		First(&consume).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, response.CheckErr(tx.Commit().Error, "refundExpiredPointsConsumeByScheduler Empty Commit err")
		}
		return false, response.CheckErr(err, "refundExpiredPointsConsumeByScheduler Ledger First err")
	}
	if consume.ConsumePoints > 0 {
		if err := tx.Model(&frontendUserEntity{}).Where("id = ?", user.ID).Updates(map[string]interface{}{
			"points_balance":        gorm.Expr("points_balance + ?", consume.ConsumePoints),
			"points_total_consumed": gorm.Expr("GREATEST(points_total_consumed - ?, 0)", consume.ConsumePoints),
			"update_time":           now,
		}).Error; err != nil {
			return false, response.CheckErr(err, "refundExpiredPointsConsumeByScheduler User Updates err")
		}
		user.PointsBalance += consume.ConsumePoints
		if err := appendPointsLog(
			tx,
			user.ID,
			"tool_refund",
			consume.ConsumePoints,
			user.PointsBalance,
			consume.ToolKey,
			consume.Action,
			consume.RequestID,
			"工具运行超时，定时任务自动退还积分",
		); err != nil {
			return false, err
		}
	}
	if err := tx.Model(&frontendUserPointsConsumeEntity{}).
		Where("id = ? AND status = ?", consume.ID, frontendPointsConsumeStatusReserved).
		Updates(map[string]interface{}{
			"status":      frontendPointsConsumeStatusExpired,
			"reason":      "工具运行超时，定时任务自动退还积分",
			"update_time": now,
		}).Error; err != nil {
		return false, response.CheckErr(err, "refundExpiredPointsConsumeByScheduler Ledger Updates err")
	}
	if err := tx.Commit().Error; err != nil {
		return false, response.CheckErr(err, "refundExpiredPointsConsumeByScheduler Commit err")
	}
	return true, nil
}

// closeExpiredPendingOrdersByScheduler 函数说明：定时关闭超时待支付订单，避免 pending 订单长期积压。
func closeExpiredPendingOrdersByScheduler(db *gorm.DB, now int64) (count int64, e error) {
	timeoutMinutes := frontendOrderAutoCloseTimeoutMinutes
	if timeoutMinutes <= 0 {
		return 0, nil
	}
	expireBefore := now - timeoutMinutes*60
	if expireBefore <= 0 {
		return 0, nil
	}

	timeoutMessage := "支付超时自动关闭（定时对账）"
	result := db.Model(&frontendUserOrderEntity{}).
		Where("status = ? AND delete_time = ? AND create_time > 0 AND create_time <= ?", frontendOrderStatusPending, 0, expireBefore).
		Where("callback_status <> ?", frontendOrderCallbackStatusSuccess).
		Updates(map[string]interface{}{
			"status":          frontendOrderStatusClosed,
			"callback_status": frontendOrderCallbackStatusFailed,
			"callback_time":   now,
			"callback_error":  timeoutMessage,
			"remark":          timeoutMessage,
			"update_time":     now,
		})
	if result.Error != nil {
		return 0, response.CheckErr(result.Error, "closeExpiredPendingOrdersByScheduler Updates err")
	}
	return result.RowsAffected, nil
}

// markInterruptedProcessingOrdersByScheduler 函数说明：将长时间停留在 processing 的订单标记为回调中断，便于运营补单与排障。
func markInterruptedProcessingOrdersByScheduler(db *gorm.DB, now int64) (count int64, e error) {
	timeoutMinutes := frontendPaymentCallbackProcessingTimeoutMinutes
	if timeoutMinutes <= 0 {
		return 0, nil
	}
	expireBefore := now - timeoutMinutes*60
	if expireBefore <= 0 {
		return 0, nil
	}

	timeoutMessage := "支付回调处理中超时（定时对账）"
	result := db.Model(&frontendUserOrderEntity{}).
		Where("status = ? AND callback_status = ? AND delete_time = ?", frontendOrderStatusPending, frontendOrderCallbackStatusProcessing, 0).
		Where(
			"((callback_time > 0 AND callback_time <= ?) OR (callback_time = 0 AND update_time > 0 AND update_time <= ?))",
			expireBefore,
			expireBefore,
		).
		Updates(map[string]interface{}{
			"callback_status": frontendOrderCallbackStatusFailed,
			"callback_time":   now,
			"callback_error":  timeoutMessage,
			"remark":          gorm.Expr("IF(TRIM(IFNULL(remark,'')) = '', ?, CONCAT(TRIM(remark), ' | ', ?))", timeoutMessage, timeoutMessage),
			"update_time":     now,
		})
	if result.Error != nil {
		return 0, response.CheckErr(result.Error, "markInterruptedProcessingOrdersByScheduler Updates err")
	}
	return result.RowsAffected, nil
}
