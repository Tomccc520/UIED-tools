package consumer

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"likeadmin/admin/schemas/req"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	adminOrderStatusPending uint8 = 0
	adminOrderStatusPaid    uint8 = 1
	adminOrderStatusClosed  uint8 = 2
)

const (
	adminOrderCallbackStatusPending    uint8 = 0
	adminOrderCallbackStatusSuccess    uint8 = 1
	adminOrderCallbackStatusFailed     uint8 = 2
	adminOrderCallbackStatusProcessing uint8 = 3
)

const (
	adminOrderDeliveryStatusPending uint8 = 0
	adminOrderDeliveryStatusDone    uint8 = 1
	adminOrderDeliveryStatusNeedFix uint8 = 2
	adminOrderDeliveryStatusInvalid uint8 = 3
)

const (
	adminOrderReissueLockTTLSeconds     = 30
	adminOrderReissueLockRedisKeyPrefix = "admin:order:reissue:lock:"
)

type IOrderService interface {
	List(page request.PageReq, listReq req.UserOrderListReq) (res response.PageResp, e error)
	Export(listReq req.UserOrderListReq) (res map[string]interface{}, e error)
	CallbackAuditList(page request.PageReq, listReq req.UserOrderCallbackAuditListReq) (res response.PageResp, e error)
	LinkageSummary() (res map[string]interface{}, e error)
	Reissue(reissueReq req.UserOrderReissueReq) (res map[string]interface{}, e error)
	Close(closeReq req.UserOrderCloseReq) (res map[string]interface{}, e error)
	SaveDelivery(saveReq req.UserOrderDeliverySaveReq) (res map[string]interface{}, e error)
	CheckDownload(checkReq req.UserOrderCheckDownloadReq) (res map[string]interface{}, e error)
}

// NewOrderService 函数说明：初始化后台会员订单服务。
func NewOrderService(db *gorm.DB) IOrderService {
	return &orderService{db: db}
}

// orderService 函数说明：后台会员订单服务实现。
type orderService struct {
	db *gorm.DB
}

// orderEntity 函数说明：映射 la_user_purchase_order 表。
type orderEntity struct {
	ID                   uint    `gorm:"column:id"`
	OrderSN              string  `gorm:"column:order_sn"`
	UserID               uint    `gorm:"column:user_id"`
	ProductType          string  `gorm:"column:product_type"`
	ProductCode          string  `gorm:"column:product_code"`
	ProductName          string  `gorm:"column:product_name"`
	Amount               float64 `gorm:"column:amount"`
	Currency             string  `gorm:"column:currency"`
	Status               uint8   `gorm:"column:status"`
	PayChannel           string  `gorm:"column:pay_channel"`
	TradeNo              string  `gorm:"column:trade_no"`
	CallbackStatus       uint8   `gorm:"column:callback_status"`
	CallbackTime         int64   `gorm:"column:callback_time"`
	CallbackError        string  `gorm:"column:callback_error"`
	MemberDays           int64   `gorm:"column:member_days"`
	Points               int64   `gorm:"column:points"`
	GiftPoints           int64   `gorm:"column:gift_points"`
	DeliveryStatus       uint8   `gorm:"column:delivery_status"`
	LicenseBoundDomain   string  `gorm:"column:license_bound_domain"`
	LicenseKey           string  `gorm:"column:license_key"`
	DownloadURL          string  `gorm:"column:download_url"`
	DownloadCheckStatus  uint8   `gorm:"column:download_check_status"`
	DownloadCheckTime    int64   `gorm:"column:download_check_time"`
	DownloadCheckMessage string  `gorm:"column:download_check_message"`
	DeliveryNote         string  `gorm:"column:delivery_note"`
	DeliveredTime        int64   `gorm:"column:delivered_time"`
	Remark               string  `gorm:"column:remark"`
	PaidTime             int64   `gorm:"column:paid_time"`
	CreateTime           int64   `gorm:"column:create_time"`
	UpdateTime           int64   `gorm:"column:update_time"`
	DeleteTime           int64   `gorm:"column:delete_time"`
}

// TableName 函数说明：声明订单实体对应的数据表名。
func (orderEntity) TableName() string {
	return "la_user_purchase_order"
}

// orderCallbackAuditEntity 函数说明：映射支付回调审计日志表，供后台查询重放与验签排障记录。
type orderCallbackAuditEntity struct {
	ID                uint   `gorm:"column:id"`
	OrderSN           string `gorm:"column:order_sn"`
	PayChannel        string `gorm:"column:pay_channel"`
	TradeNo           string `gorm:"column:trade_no"`
	CallbackResult    string `gorm:"column:callback_result"`
	CallbackMessage   string `gorm:"column:callback_message"`
	CallbackTimestamp int64  `gorm:"column:callback_timestamp"`
	CallbackNonce     string `gorm:"column:callback_nonce"`
	SignDigest        string `gorm:"column:sign_digest"`
	SignVerified      uint8  `gorm:"column:sign_verified"`
	ReplayDetected    uint8  `gorm:"column:replay_detected"`
	ReplayKind        string `gorm:"column:replay_kind"`
	LockAcquired      uint8  `gorm:"column:lock_acquired"`
	ProcessStage      string `gorm:"column:process_stage"`
	ProcessResult     string `gorm:"column:process_result"`
	RequestPayload    string `gorm:"column:request_payload"`
	CreateTime        int64  `gorm:"column:create_time"`
}

// TableName 函数说明：声明支付回调审计实体对应表名。
func (orderCallbackAuditEntity) TableName() string {
	return "la_user_purchase_callback_audit"
}

// pointsLogEntity 函数说明：映射积分流水表，补单时记录积分变更。
type pointsLogEntity struct {
	ID           uint   `gorm:"column:id"`
	UserID       uint   `gorm:"column:user_id"`
	ChangeType   string `gorm:"column:change_type"`
	ChangeAmount int64  `gorm:"column:change_amount"`
	BalanceAfter int64  `gorm:"column:balance_after"`
	ToolKey      string `gorm:"column:tool_key"`
	Action       string `gorm:"column:action"`
	OrderSN      string `gorm:"column:order_sn"`
	Remark       string `gorm:"column:remark"`
	CreateTime   int64  `gorm:"column:create_time"`
}

// TableName 函数说明：声明积分流水实体对应的数据表名。
func (pointsLogEntity) TableName() string {
	return "la_user_points_log"
}

// orderSystemLicenseEntity 函数说明：映射系统授权表，供订单交付联动读取当前系统授权状态。
type orderSystemLicenseEntity struct {
	ID          uint   `gorm:"column:id"`
	Status      uint8  `gorm:"column:status"`
	BoundDomain string `gorm:"column:bound_domain"`
	ExpireTime  int64  `gorm:"column:expire_time"`
	RawStatus   string `gorm:"column:raw_status"`
}

// TableName 函数说明：声明订单联动读取的系统授权表名。
func (orderSystemLicenseEntity) TableName() string {
	return "la_system_license"
}

type orderListRow struct {
	ID                   uint    `gorm:"column:id"`
	OrderSN              string  `gorm:"column:order_sn"`
	UserID               uint    `gorm:"column:user_id"`
	ProductType          string  `gorm:"column:product_type"`
	ProductCode          string  `gorm:"column:product_code"`
	ProductName          string  `gorm:"column:product_name"`
	Amount               float64 `gorm:"column:amount"`
	Currency             string  `gorm:"column:currency"`
	Status               uint8   `gorm:"column:status"`
	PayChannel           string  `gorm:"column:pay_channel"`
	TradeNo              string  `gorm:"column:trade_no"`
	CallbackStatus       uint8   `gorm:"column:callback_status"`
	CallbackTime         int64   `gorm:"column:callback_time"`
	CallbackError        string  `gorm:"column:callback_error"`
	MemberDays           int64   `gorm:"column:member_days"`
	Points               int64   `gorm:"column:points"`
	GiftPoints           int64   `gorm:"column:gift_points"`
	DeliveryStatus       uint8   `gorm:"column:delivery_status"`
	LicenseBoundDomain   string  `gorm:"column:license_bound_domain"`
	LicenseKey           string  `gorm:"column:license_key"`
	DownloadURL          string  `gorm:"column:download_url"`
	DownloadCheckStatus  uint8   `gorm:"column:download_check_status"`
	DownloadCheckTime    int64   `gorm:"column:download_check_time"`
	DownloadCheckMessage string  `gorm:"column:download_check_message"`
	DeliveryNote         string  `gorm:"column:delivery_note"`
	DeliveredTime        int64   `gorm:"column:delivered_time"`
	Remark               string  `gorm:"column:remark"`
	PaidTime             int64   `gorm:"column:paid_time"`
	CreateTime           int64   `gorm:"column:create_time"`
	UpdateTime           int64   `gorm:"column:update_time"`
	DeleteTime           int64   `gorm:"column:delete_time"`
	UserNickname         string  `gorm:"column:user_nickname"`
	UserUsername         string  `gorm:"column:user_username"`
	UserMobile           string  `gorm:"column:user_mobile"`
}

// orderStatusText 函数说明：将订单状态转为中文文案。
func orderStatusText(status uint8) string {
	switch status {
	case adminOrderStatusPaid:
		return "已支付"
	case adminOrderStatusClosed:
		return "已关闭"
	default:
		return "待支付"
	}
}

// orderCallbackStatusText 函数说明：将订单回调状态转为中文文案。
func orderCallbackStatusText(status uint8) string {
	switch status {
	case adminOrderCallbackStatusProcessing:
		return "支付处理中"
	case adminOrderCallbackStatusSuccess:
		return "回调成功"
	case adminOrderCallbackStatusFailed:
		return "回调失败"
	default:
		return "未回调"
	}
}

// orderTypeText 函数说明：将商品类型转为中文文案。
func orderTypeText(productType string) string {
	if strings.TrimSpace(productType) == "member_plan" {
		return "会员套餐"
	}
	return "积分包"
}

// orderDeliveryStatusText 函数说明：将订单交付状态转为中文文案，便于后台与前台统一展示。
func orderDeliveryStatusText(status uint8) string {
	switch status {
	case adminOrderDeliveryStatusDone:
		return "已交付"
	case adminOrderDeliveryStatusNeedFix:
		return "待补充"
	case adminOrderDeliveryStatusInvalid:
		return "已失效"
	default:
		return "未交付"
	}
}

// normalizeAdminReissuePayChannel 函数说明：标准化后台补单支付渠道，仅允许白名单渠道入库。
func normalizeAdminReissuePayChannel(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "", "admin_manual":
		return "admin_manual"
	case "mock":
		return "mock"
	case "wechat_h5":
		return "wechat_h5"
	case "alipay_h5":
		return "alipay_h5"
	default:
		return ""
	}
}

// buildAdminOrderReissueLockKey 函数说明：生成后台补单幂等锁键，防止同一订单被并发重复补单。
func buildAdminOrderReissueLockKey(orderSN string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(orderSN)))
	return adminOrderReissueLockRedisKeyPrefix + hex.EncodeToString(sum[:16])
}

// maskOrderLicenseKey 函数说明：脱敏订单授权码，避免在列表和前台订单区直接暴露完整密钥。
func maskOrderLicenseKey(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	runes := []rune(trimmed)
	if len(runes) <= 8 {
		return string(runes[:2]) + "****"
	}
	return string(runes[:4]) + "****" + string(runes[len(runes)-4:])
}

// loadOrderLicenseSnapshot 函数说明：读取当前系统授权快照，供订单交付联动状态判断复用。
func loadOrderLicenseSnapshot(db *gorm.DB) orderLicenseSnapshot {
	var entity orderSystemLicenseEntity
	if err := db.Where("id = ?", 1).Limit(1).First(&entity).Error; err != nil {
		return orderLicenseSnapshot{}
	}
	return orderLicenseSnapshot{
		Status:      entity.Status,
		BoundDomain: entity.BoundDomain,
		ExpireTime:  entity.ExpireTime,
		RawStatus:   entity.RawStatus,
	}
}

// formatOrderRow 函数说明：格式化后台订单列表行数据，并附带交付联动校验结果。
func formatOrderRow(item orderListRow, licenseSnapshot orderLicenseSnapshot) map[string]interface{} {
	linkageResult := buildOrderDeliveryLinkageResult(
		item.Status,
		item.DeliveryStatus,
		item.LicenseBoundDomain,
		item.LicenseKey,
		item.DownloadURL,
		item.DownloadCheckStatus,
		item.DownloadCheckMessage,
		licenseSnapshot,
	)
	return map[string]interface{}{
		"id":                       item.ID,
		"orderSn":                  item.OrderSN,
		"userId":                   item.UserID,
		"userNickname":             item.UserNickname,
		"userUsername":             item.UserUsername,
		"userMobile":               item.UserMobile,
		"productType":              item.ProductType,
		"productTypeText":          orderTypeText(item.ProductType),
		"productCode":              item.ProductCode,
		"productName":              item.ProductName,
		"amount":                   item.Amount,
		"currency":                 item.Currency,
		"status":                   item.Status,
		"statusText":               orderStatusText(item.Status),
		"payChannel":               item.PayChannel,
		"tradeNo":                  item.TradeNo,
		"callbackStatus":           item.CallbackStatus,
		"callbackStatusText":       orderCallbackStatusText(item.CallbackStatus),
		"callbackTime":             formatUnixTime(item.CallbackTime),
		"callbackError":            item.CallbackError,
		"memberDays":               item.MemberDays,
		"points":                   item.Points,
		"giftPoints":               item.GiftPoints,
		"deliveryStatus":           item.DeliveryStatus,
		"deliveryStatusText":       orderDeliveryStatusText(item.DeliveryStatus),
		"licenseBoundDomain":       item.LicenseBoundDomain,
		"licenseKey":               item.LicenseKey,
		"licenseKeyMasked":         maskOrderLicenseKey(item.LicenseKey),
		"downloadUrl":              item.DownloadURL,
		"downloadCheckStatus":      item.DownloadCheckStatus,
		"downloadCheckStatusText":  resolveOrderDownloadCheckStatusText(item.DownloadCheckStatus),
		"downloadCheckTime":        formatUnixTime(item.DownloadCheckTime),
		"downloadCheckTimeValue":   item.DownloadCheckTime,
		"downloadCheckMessage":     item.DownloadCheckMessage,
		"deliveryNote":             item.DeliveryNote,
		"deliveredTime":            formatUnixTime(item.DeliveredTime),
		"deliveredTimeValue":       item.DeliveredTime,
		"remark":                   item.Remark,
		"paidTime":                 formatUnixTime(item.PaidTime),
		"createTime":               formatUnixTime(item.CreateTime),
		"isSourceDeliveryOrder":    linkageResult.IsSourceOrder,
		"deliveryCheckStatus":      linkageResult.PrimaryStatus,
		"deliveryCheckText":        linkageResult.PrimaryStatusText,
		"deliveryIssues":           linkageResult.Issues,
		"systemLicenseStatus":      linkageResult.SystemLicenseStatus,
		"systemLicenseStatusText":  linkageResult.SystemLicenseStatusText,
		"systemLicenseBoundDomain": linkageResult.SystemLicenseBoundDomain,
	}
}

// mapOrderEntityToListRow 函数说明：将订单实体映射为列表行结构，供补单/关单接口复用统一响应字段。
func mapOrderEntityToListRow(order orderEntity) orderListRow {
	return orderListRow{
		ID:                   order.ID,
		OrderSN:              order.OrderSN,
		UserID:               order.UserID,
		ProductType:          order.ProductType,
		ProductCode:          order.ProductCode,
		ProductName:          order.ProductName,
		Amount:               order.Amount,
		Currency:             order.Currency,
		Status:               order.Status,
		PayChannel:           order.PayChannel,
		TradeNo:              order.TradeNo,
		CallbackStatus:       order.CallbackStatus,
		CallbackTime:         order.CallbackTime,
		CallbackError:        order.CallbackError,
		MemberDays:           order.MemberDays,
		Points:               order.Points,
		GiftPoints:           order.GiftPoints,
		DeliveryStatus:       order.DeliveryStatus,
		LicenseBoundDomain:   order.LicenseBoundDomain,
		LicenseKey:           order.LicenseKey,
		DownloadURL:          order.DownloadURL,
		DownloadCheckStatus:  order.DownloadCheckStatus,
		DownloadCheckTime:    order.DownloadCheckTime,
		DownloadCheckMessage: order.DownloadCheckMessage,
		DeliveryNote:         order.DeliveryNote,
		DeliveredTime:        order.DeliveredTime,
		Remark:               order.Remark,
		PaidTime:             order.PaidTime,
		CreateTime:           order.CreateTime,
		UpdateTime:           order.UpdateTime,
		DeleteTime:           order.DeleteTime,
	}
}

// formatOrderCallbackAuditRow 函数说明：格式化支付回调审计记录，统一给后台返回易读字段。
func formatOrderCallbackAuditRow(item orderCallbackAuditEntity) map[string]interface{} {
	return map[string]interface{}{
		"id":                item.ID,
		"orderSn":           item.OrderSN,
		"payChannel":        item.PayChannel,
		"tradeNo":           item.TradeNo,
		"callbackResult":    item.CallbackResult,
		"callbackMessage":   item.CallbackMessage,
		"callbackTimestamp": item.CallbackTimestamp,
		"callbackTime":      formatUnixTime(item.CallbackTimestamp),
		"callbackNonce":     item.CallbackNonce,
		"signDigest":        item.SignDigest,
		"signVerified":      item.SignVerified,
		"replayDetected":    item.ReplayDetected,
		"replayKind":        item.ReplayKind,
		"lockAcquired":      item.LockAcquired,
		"processStage":      item.ProcessStage,
		"processResult":     item.ProcessResult,
		"requestPayload":    item.RequestPayload,
		"createTime":        formatUnixTime(item.CreateTime),
		"createTimeValue":   item.CreateTime,
	}
}

// applyOrderCallbackAuditFilters 函数说明：为支付回调审计查询统一应用筛选条件，便于运营按重放/验签快速定位问题。
func applyOrderCallbackAuditFilters(chain *gorm.DB, listReq req.UserOrderCallbackAuditListReq) *gorm.DB {
	orderSN := strings.TrimSpace(listReq.OrderSn)
	if orderSN != "" {
		chain = chain.Where("order_sn = ?", orderSN)
	}
	keyword := strings.TrimSpace(listReq.Keyword)
	if keyword != "" {
		likeKeyword := "%" + keyword + "%"
		chain = chain.Where(
			"(order_sn LIKE ? OR trade_no LIKE ? OR process_result LIKE ? OR callback_message LIKE ?)",
			likeKeyword,
			likeKeyword,
			likeKeyword,
			likeKeyword,
		)
	}
	payChannel := strings.TrimSpace(listReq.PayChannel)
	if payChannel != "" {
		chain = chain.Where("pay_channel = ?", payChannel)
	}
	if strings.TrimSpace(listReq.ReplayOnly) == "1" {
		chain = chain.Where("replay_detected = ?", 1)
	}
	signVerifiedText := strings.TrimSpace(listReq.SignVerified)
	if signVerifiedText != "" {
		if signVerifiedValue, err := strconv.Atoi(signVerifiedText); err == nil && (signVerifiedValue == 0 || signVerifiedValue == 1) {
			chain = chain.Where("sign_verified = ?", signVerifiedValue)
		}
	}
	processStage := strings.TrimSpace(listReq.ProcessStage)
	if processStage != "" {
		chain = chain.Where("process_stage = ?", processStage)
	}
	if startTime, ok := parseDateStart(listReq.StartTime); ok {
		chain = chain.Where("create_time >= ?", startTime)
	}
	if endTime, ok := parseDateEnd(listReq.EndTime); ok {
		chain = chain.Where("create_time <= ?", endTime)
	}
	return chain
}

// applyOrderFilters 函数说明：为订单查询链路统一应用筛选条件。
func applyOrderFilters(chain *gorm.DB, listReq req.UserOrderListReq) *gorm.DB {
	keyword := strings.TrimSpace(listReq.Keyword)
	if keyword != "" {
		likeKeyword := "%" + keyword + "%"
		chain = chain.Where(
			"(o.order_sn LIKE ? OR o.product_name LIKE ? OR o.product_code LIKE ? OR u.nickname LIKE ? OR u.username LIKE ? OR u.mobile LIKE ?)",
			likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword,
		)
	}
	statusText := strings.TrimSpace(listReq.Status)
	if statusText != "" {
		if status, err := strconv.Atoi(statusText); err == nil && status >= 0 && status <= 2 {
			chain = chain.Where("o.status = ?", status)
		}
	}
	callbackStatusText := strings.TrimSpace(listReq.CallbackStatus)
	if callbackStatusText != "" {
		if callbackStatus, err := strconv.Atoi(callbackStatusText); err == nil && callbackStatus >= 0 && callbackStatus <= 3 {
			chain = chain.Where("o.callback_status = ?", callbackStatus)
		}
	}
	deliveryStatusText := strings.TrimSpace(listReq.DeliveryStatus)
	if deliveryStatusText != "" {
		if deliveryStatus, err := strconv.Atoi(deliveryStatusText); err == nil && deliveryStatus >= 0 && deliveryStatus <= 3 {
			chain = chain.Where("o.delivery_status = ?", deliveryStatus)
		}
	}
	productType := strings.TrimSpace(listReq.ProductType)
	if productType == "member_plan" || productType == "points_pack" {
		chain = chain.Where("o.product_type = ?", productType)
	}
	boundDomain := strings.TrimSpace(listReq.BoundDomain)
	if boundDomain != "" {
		chain = chain.Where("o.license_bound_domain LIKE ?", "%"+boundDomain+"%")
	}
	if startTime, ok := parseDateStart(listReq.StartTime); ok {
		chain = chain.Where("o.create_time >= ?", startTime)
	}
	if endTime, ok := parseDateEnd(listReq.EndTime); ok {
		chain = chain.Where("o.create_time <= ?", endTime)
	}
	return chain
}

// shouldUseDeliveryLinkageFilter 函数说明：判断订单列表是否需要计算交付联动状态筛选。
func shouldUseDeliveryLinkageFilter(listReq req.UserOrderListReq) bool {
	return strings.TrimSpace(listReq.DeliveryCheckStatus) != ""
}

// scanOrderRowsByDeliveryLinkage 函数说明：使用数据库游标逐行计算交付联动筛选，只保留当前页结果，避免一次性加载全部订单。
func scanOrderRowsByDeliveryLinkage(chain *gorm.DB, page request.PageReq, filterStatus string, licenseSnapshot orderLicenseSnapshot) (pageRows []orderListRow, count int64, e error) {
	rows, err := chain.Order("o.id DESC").Rows()
	if err != nil {
		return nil, 0, response.CheckErr(err, "Order List Rows With Delivery Check err")
	}
	defer rows.Close()

	offset := page.PageSize * (page.PageNo - 1)
	pageRows = make([]orderListRow, 0, page.PageSize)
	for rows.Next() {
		var item orderListRow
		if err = chain.ScanRows(rows, &item); err != nil {
			return nil, 0, response.CheckErr(err, "Order List ScanRows With Delivery Check err")
		}
		linkageResult := buildOrderDeliveryLinkageResult(
			item.Status,
			item.DeliveryStatus,
			item.LicenseBoundDomain,
			item.LicenseKey,
			item.DownloadURL,
			item.DownloadCheckStatus,
			item.DownloadCheckMessage,
			licenseSnapshot,
		)
		if !matchOrderDeliveryCheckFilter(filterStatus, linkageResult) {
			continue
		}
		if count >= int64(offset) && len(pageRows) < page.PageSize {
			pageRows = append(pageRows, item)
		}
		count++
	}
	if err = rows.Err(); err != nil {
		return nil, 0, response.CheckErr(err, "Order List Rows Iterate With Delivery Check err")
	}
	return pageRows, count, nil
}

// appendOrderPointsLog 函数说明：补单成功后写入积分流水，避免权益变更无审计记录。
func appendOrderPointsLog(tx *gorm.DB, userID uint, changeType string, changeAmount int64, balanceAfter int64, orderSN string, remark string) error {
	logModel := pointsLogEntity{
		UserID:       userID,
		ChangeType:   strings.TrimSpace(changeType),
		ChangeAmount: changeAmount,
		BalanceAfter: balanceAfter,
		OrderSN:      strings.TrimSpace(orderSN),
		Remark:       strings.TrimSpace(remark),
		CreateTime:   time.Now().Unix(),
	}
	if logModel.ChangeType == "" {
		logModel.ChangeType = "unknown"
	}
	if err := tx.Create(&logModel).Error; err != nil {
		return response.CheckErr(err, "appendOrderPointsLog Create err")
	}
	return nil
}

// grantOrderBenefitInTx 函数说明：按订单内容发放用户权益（会员时长或积分到账）。
func grantOrderBenefitInTx(tx *gorm.DB, order orderEntity, paidAt int64) (latestUser userEntity, e error) {
	var user userEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND is_delete = ?", order.UserID, 0).Limit(1).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return userEntity{}, response.AssertArgumentError.Make("订单关联用户不存在")
		}
		return userEntity{}, response.CheckErr(err, "grantOrderBenefitInTx User First err")
	}

	updatePayload := map[string]interface{}{
		"update_time": paidAt,
	}
	if order.ProductType == "member_plan" {
		effectiveStart := paidAt
		if user.MemberExpireTime > paidAt {
			effectiveStart = user.MemberExpireTime
		}
		updatePayload["member_level"] = "vip"
		updatePayload["member_expire_time"] = effectiveStart + order.MemberDays*86400
		if order.GiftPoints > 0 {
			updatePayload["points_balance"] = gorm.Expr("points_balance + ?", order.GiftPoints)
			updatePayload["points_total_earned"] = gorm.Expr("points_total_earned + ?", order.GiftPoints)
		}
	} else {
		totalPoints := order.Points + order.GiftPoints
		if totalPoints <= 0 {
			return userEntity{}, response.AssertArgumentError.Make("积分包配置无效，请检查订单数据")
		}
		updatePayload["points_balance"] = gorm.Expr("points_balance + ?", totalPoints)
		updatePayload["points_total_earned"] = gorm.Expr("points_total_earned + ?", totalPoints)
	}

	if err := tx.Model(&userEntity{}).Where("id = ?", order.UserID).Updates(updatePayload).Error; err != nil {
		return userEntity{}, response.CheckErr(err, "grantOrderBenefitInTx User Updates err")
	}
	if err := tx.Where("id = ? AND is_delete = ?", order.UserID, 0).Limit(1).First(&latestUser).Error; err != nil {
		return userEntity{}, response.CheckErr(err, "grantOrderBenefitInTx User Latest err")
	}
	if order.ProductType == "member_plan" && order.GiftPoints > 0 {
		if err := appendOrderPointsLog(tx, order.UserID, "member_plan_gift", order.GiftPoints, latestUser.PointsBalance, order.OrderSN, "后台补单发放会员赠送积分"); err != nil {
			return userEntity{}, err
		}
	}
	if order.ProductType == "points_pack" {
		totalPoints := order.Points + order.GiftPoints
		if err := appendOrderPointsLog(tx, order.UserID, "points_pack_recharge", totalPoints, latestUser.PointsBalance, order.OrderSN, "后台补单发放积分包"); err != nil {
			return userEntity{}, err
		}
	}
	return latestUser, nil
}

// List 函数说明：分页查询订单列表并返回后台页面所需结构。
func (srv orderService) List(page request.PageReq, listReq req.UserOrderListReq) (res response.PageResp, e error) {
	licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
	chain := srv.db.Table("la_user_purchase_order AS o").
		Select("o.*, u.nickname AS user_nickname, u.username AS user_username, u.mobile AS user_mobile").
		Joins("LEFT JOIN la_user u ON u.id = o.user_id").
		Where("o.delete_time = ?", 0)
	chain = applyOrderFilters(chain, listReq)

	rows := make([]orderListRow, 0)
	if shouldUseDeliveryLinkageFilter(listReq) {
		pageRows, count, err := scanOrderRowsByDeliveryLinkage(chain, page, listReq.DeliveryCheckStatus, licenseSnapshot)
		if err != nil {
			return response.PageResp{}, err
		}
		lists := make([]map[string]interface{}, 0, len(pageRows))
		for _, item := range pageRows {
			lists = append(lists, formatOrderRow(item, licenseSnapshot))
		}
		return response.PageResp{
			PageNo:   page.PageNo,
			PageSize: page.PageSize,
			Count:    count,
			Lists:    lists,
		}, nil
	}

	var count int64
	if err := chain.Count(&count).Error; err != nil {
		return response.PageResp{}, response.CheckErr(err, "Order List Count err")
	}
	limit := page.PageSize
	offset := page.PageSize * (page.PageNo - 1)
	if err := chain.Limit(limit).Offset(offset).Order("o.id DESC").Find(&rows).Error; err != nil {
		return response.PageResp{}, response.CheckErr(err, "Order List Find err")
	}
	lists := make([]map[string]interface{}, 0, len(rows))
	for _, item := range rows {
		lists = append(lists, formatOrderRow(item, licenseSnapshot))
	}
	return response.PageResp{
		PageNo:   page.PageNo,
		PageSize: page.PageSize,
		Count:    count,
		Lists:    lists,
	}, nil
}

// Export 函数说明：按筛选条件导出订单明细数据（前端可直接转 CSV）。
func (srv orderService) Export(listReq req.UserOrderListReq) (res map[string]interface{}, e error) {
	licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
	chain := srv.db.Table("la_user_purchase_order AS o").
		Select("o.*, u.nickname AS user_nickname, u.username AS user_username, u.mobile AS user_mobile").
		Joins("LEFT JOIN la_user u ON u.id = o.user_id").
		Where("o.delete_time = ?", 0)
	chain = applyOrderFilters(chain, listReq)

	rows := make([]orderListRow, 0)
	if shouldUseDeliveryLinkageFilter(listReq) {
		matchedRows, _, err := scanOrderRowsByDeliveryLinkage(
			chain,
			request.PageReq{PageNo: 1, PageSize: 5000},
			listReq.DeliveryCheckStatus,
			licenseSnapshot,
		)
		if err != nil {
			return nil, err
		}
		rows = matchedRows
	} else if err := chain.Order("o.id DESC").Limit(5000).Find(&rows).Error; err != nil {
		return nil, response.CheckErr(err, "Order Export Find err")
	}
	lists := make([]map[string]interface{}, 0, len(rows))
	for _, item := range rows {
		lists = append(lists, formatOrderRow(item, licenseSnapshot))
	}
	return map[string]interface{}{
		"count": countWithLength(len(lists)),
		"lists": lists,
	}, nil
}

// CallbackAuditList 函数说明：分页读取支付回调审计日志，支持按订单号、重放命中和验签状态筛选。
func (srv orderService) CallbackAuditList(page request.PageReq, listReq req.UserOrderCallbackAuditListReq) (res response.PageResp, e error) {
	chain := srv.db.Model(&orderCallbackAuditEntity{})
	chain = applyOrderCallbackAuditFilters(chain, listReq)

	var count int64
	if err := chain.Count(&count).Error; err != nil {
		return response.PageResp{}, response.CheckErr(err, "Order CallbackAuditList Count err")
	}

	rows := make([]orderCallbackAuditEntity, 0)
	offset := page.PageSize * (page.PageNo - 1)
	if err := chain.Order("id DESC").Limit(page.PageSize).Offset(offset).Find(&rows).Error; err != nil {
		return response.PageResp{}, response.CheckErr(err, "Order CallbackAuditList Find err")
	}

	lists := make([]map[string]interface{}, 0, len(rows))
	for _, item := range rows {
		lists = append(lists, formatOrderCallbackAuditRow(item))
	}

	return response.PageResp{
		PageNo:   page.PageNo,
		PageSize: page.PageSize,
		Count:    count,
		Lists:    lists,
	}, nil
}

// LinkageSummary 函数说明：汇总源码交付订单与系统授权联动状态，供授权页顶部统计卡直接读取。
func (srv orderService) LinkageSummary() (res map[string]interface{}, e error) {
	licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
	rows := make([]orderEntity, 0)
	if err := srv.db.
		Select("id,status,delivery_status,license_bound_domain,license_key,download_url,download_check_status,download_check_message").
		Where("delete_time = 0").
		Where("(delivery_status > 0 OR TRIM(IFNULL(license_bound_domain,'')) <> '' OR TRIM(IFNULL(license_key,'')) <> '' OR TRIM(IFNULL(download_url,'')) <> '')").
		Order("id DESC").
		Find(&rows).Error; err != nil {
		return nil, response.CheckErr(err, "Order LinkageSummary Find err")
	}

	summary := map[string]int64{
		"sourceOrderCount":        0,
		"abnormalCount":           0,
		"okCount":                 0,
		"pendingDeliveryCount":    0,
		"licenseInactiveCount":    0,
		"domainMismatchCount":     0,
		"downloadInvalidCount":    0,
		"deliveryIncompleteCount": 0,
		"expiredCount":            0,
	}

	for _, item := range rows {
		linkageResult := buildOrderDeliveryLinkageResult(
			item.Status,
			item.DeliveryStatus,
			item.LicenseBoundDomain,
			item.LicenseKey,
			item.DownloadURL,
			item.DownloadCheckStatus,
			item.DownloadCheckMessage,
			licenseSnapshot,
		)
		if !linkageResult.IsSourceOrder {
			continue
		}

		summary["sourceOrderCount"]++
		switch linkageResult.PrimaryStatus {
		case orderDeliveryCheckStatusPendingDelivery:
			summary["pendingDeliveryCount"]++
		case orderDeliveryCheckStatusLicenseInactive:
			summary["licenseInactiveCount"]++
		case orderDeliveryCheckStatusDomainMismatch:
			summary["domainMismatchCount"]++
		case orderDeliveryCheckStatusDownloadInvalid:
			summary["downloadInvalidCount"]++
		case orderDeliveryCheckStatusDeliveryIncomplete:
			summary["deliveryIncompleteCount"]++
		case orderDeliveryCheckStatusExpired:
			summary["expiredCount"]++
		default:
			summary["okCount"]++
		}

		if linkageResult.PrimaryStatus != "" && linkageResult.PrimaryStatus != orderDeliveryCheckStatusOK {
			summary["abnormalCount"]++
		}
	}

	return map[string]interface{}{
		"sourceOrderCount":        summary["sourceOrderCount"],
		"abnormalCount":           summary["abnormalCount"],
		"okCount":                 summary["okCount"],
		"pendingDeliveryCount":    summary["pendingDeliveryCount"],
		"licenseInactiveCount":    summary["licenseInactiveCount"],
		"domainMismatchCount":     summary["domainMismatchCount"],
		"downloadInvalidCount":    summary["downloadInvalidCount"],
		"deliveryIncompleteCount": summary["deliveryIncompleteCount"],
		"expiredCount":            summary["expiredCount"],
	}, nil
}

// countWithLength 函数说明：将列表长度安全转换为 int64，避免导出返回结构类型不统一。
func countWithLength(length int) int64 {
	return int64(length)
}

// probeOrderDownloadURL 函数说明：以短超时检测下载链接是否可访问，先发 HEAD，必要时回退到 GET + Range。
func probeOrderDownloadURL(rawURL string) (status uint8, message string) {
	trimmedURL := strings.TrimSpace(rawURL)
	if !isDownloadURLFormatValid(trimmedURL) {
		return orderDownloadCheckStatusInvalid, "下载链接格式无效，仅支持 http/https"
	}

	client := &http.Client{Timeout: 8 * time.Second}
	headRequest, err := http.NewRequest(http.MethodHead, trimmedURL, nil)
	if err == nil {
		headResponse, headErr := client.Do(headRequest)
		if headErr == nil {
			defer headResponse.Body.Close()
			if headResponse.StatusCode >= 200 && headResponse.StatusCode < 400 {
				return orderDownloadCheckStatusOK, "下载链接可访问"
			}
			if headResponse.StatusCode != http.StatusMethodNotAllowed && headResponse.StatusCode != http.StatusNotImplemented {
				return orderDownloadCheckStatusInvalid, "HEAD 检测返回状态码 " + strconv.Itoa(headResponse.StatusCode)
			}
		}
	}

	getRequest, err := http.NewRequest(http.MethodGet, trimmedURL, nil)
	if err != nil {
		return orderDownloadCheckStatusInvalid, "下载链接请求构造失败"
	}
	getRequest.Header.Set("Range", "bytes=0-0")
	getResponse, err := client.Do(getRequest)
	if err != nil {
		return orderDownloadCheckStatusInvalid, "下载链接检测失败：" + strings.TrimSpace(err.Error())
	}
	defer getResponse.Body.Close()
	if getResponse.StatusCode >= 200 && getResponse.StatusCode < 400 {
		return orderDownloadCheckStatusOK, "下载链接可访问"
	}
	return orderDownloadCheckStatusInvalid, "下载链接检测返回状态码 " + strconv.Itoa(getResponse.StatusCode)
}

// Reissue 函数说明：后台补单，将待支付/已关闭订单改为已支付并发放权益。
func (srv orderService) Reissue(reissueReq req.UserOrderReissueReq) (res map[string]interface{}, e error) {
	orderSN := strings.TrimSpace(reissueReq.OrderSn)
	if orderSN == "" {
		return nil, response.AssertArgumentError.Make("订单号不能为空")
	}
	reissueLockKey := buildAdminOrderReissueLockKey(orderSN)
	if !util.RedisUtil.SetNX(reissueLockKey, "1", adminOrderReissueLockTTLSeconds) {
		return nil, response.AssertArgumentError.Make("订单补单处理中，请稍后再试")
	}
	defer util.RedisUtil.Del(reissueLockKey)

	tx := srv.db.Begin()
	if tx.Error != nil {
		return nil, response.CheckErr(tx.Error, "Order Reissue Begin err")
	}
	defer func() {
		_ = tx.Rollback().Error
	}()

	var order orderEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("order_sn = ? AND delete_time = ?", orderSN, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		return nil, response.CheckErr(err, "Order Reissue First err")
	}
	if order.Status == adminOrderStatusPaid {
		licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
		return map[string]interface{}{
			"order":    formatOrderRow(mapOrderEntityToListRow(order), licenseSnapshot),
			"reissued": false,
		}, nil
	}

	nextPayChannel := normalizeAdminReissuePayChannel(reissueReq.PayChannel)
	if nextPayChannel == "" {
		return nil, response.AssertArgumentError.Make("补单支付渠道不合法")
	}

	paidAt := time.Now().Unix()
	nextTradeNo := strings.TrimSpace(reissueReq.TradeNo)
	if nextTradeNo == "" {
		nextTradeNo = "admin_manual_" + order.OrderSN
	}
	duplicateTradeCount := int64(0)
	if err := tx.Model(&orderEntity{}).
		Where("id <> ? AND delete_time = ? AND status = ? AND trade_no = ?", order.ID, 0, adminOrderStatusPaid, nextTradeNo).
		Count(&duplicateTradeCount).Error; err != nil {
		return nil, response.CheckErr(err, "Order Reissue Trade Count err")
	}
	if duplicateTradeCount > 0 {
		return nil, response.AssertArgumentError.Make("补单交易号已存在，请更换后重试")
	}

	if _, err := grantOrderBenefitInTx(tx, order, paidAt); err != nil {
		return nil, err
	}
	nextRemark := strings.TrimSpace(reissueReq.Remark)
	if nextRemark == "" {
		nextRemark = "后台补单成功"
	}
	if err := tx.Model(&orderEntity{}).Where("id = ?", order.ID).Updates(map[string]interface{}{
		"status":          adminOrderStatusPaid,
		"pay_channel":     nextPayChannel,
		"trade_no":        nextTradeNo,
		"paid_time":       paidAt,
		"callback_status": adminOrderCallbackStatusSuccess,
		"callback_time":   paidAt,
		"callback_error":  "",
		"remark":          nextRemark,
		"update_time":     paidAt,
	}).Error; err != nil {
		return nil, response.CheckErr(err, "Order Reissue Updates err")
	}
	order.Status = adminOrderStatusPaid
	order.PayChannel = nextPayChannel
	order.TradeNo = nextTradeNo
	order.PaidTime = paidAt
	order.CallbackStatus = adminOrderCallbackStatusSuccess
	order.CallbackTime = paidAt
	order.CallbackError = ""
	order.Remark = nextRemark
	order.UpdateTime = paidAt

	if err := tx.Commit().Error; err != nil {
		return nil, response.CheckErr(err, "Order Reissue Commit err")
	}
	licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
	return map[string]interface{}{
		"order":    formatOrderRow(mapOrderEntityToListRow(order), licenseSnapshot),
		"reissued": true,
	}, nil
}

// Close 函数说明：后台关闭待支付订单。
func (srv orderService) Close(closeReq req.UserOrderCloseReq) (res map[string]interface{}, e error) {
	orderSN := strings.TrimSpace(closeReq.OrderSn)
	if orderSN == "" {
		return nil, response.AssertArgumentError.Make("订单号不能为空")
	}

	tx := srv.db.Begin()
	if tx.Error != nil {
		return nil, response.CheckErr(tx.Error, "Order Close Begin err")
	}
	defer func() {
		_ = tx.Rollback().Error
	}()

	var order orderEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("order_sn = ? AND delete_time = ?", orderSN, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		return nil, response.CheckErr(err, "Order Close First err")
	}
	if order.Status == adminOrderStatusPaid {
		return nil, response.AssertArgumentError.Make("订单已支付，无法关闭")
	}
	if order.Status == adminOrderStatusClosed {
		licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
		return map[string]interface{}{"order": formatOrderRow(mapOrderEntityToListRow(order), licenseSnapshot)}, nil
	}

	now := time.Now().Unix()
	if err := tx.Model(&orderEntity{}).Where("id = ?", order.ID).Updates(map[string]interface{}{
		"status":      adminOrderStatusClosed,
		"remark":      "后台关闭订单",
		"update_time": now,
	}).Error; err != nil {
		return nil, response.CheckErr(err, "Order Close Updates err")
	}
	order.Status = adminOrderStatusClosed
	order.Remark = "后台关闭订单"
	order.UpdateTime = now

	if err := tx.Commit().Error; err != nil {
		return nil, response.CheckErr(err, "Order Close Commit err")
	}
	licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
	return map[string]interface{}{
		"order": formatOrderRow(mapOrderEntityToListRow(order), licenseSnapshot),
	}, nil
}

// SaveDelivery 函数说明：保存订单交付信息，供源码售卖场景记录绑定域名、授权码和下载链接。
func (srv orderService) SaveDelivery(saveReq req.UserOrderDeliverySaveReq) (res map[string]interface{}, e error) {
	orderSN := strings.TrimSpace(saveReq.OrderSn)
	if orderSN == "" {
		return nil, response.AssertArgumentError.Make("订单号不能为空")
	}

	var order orderEntity
	if err := srv.db.Where("order_sn = ? AND delete_time = ?", orderSN, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		return nil, response.CheckErr(err, "Order SaveDelivery First err")
	}

	now := time.Now().Unix()
	deliveredTime := saveReq.DeliveredTime
	if saveReq.DeliveryStatus == adminOrderDeliveryStatusDone && deliveredTime <= 0 {
		deliveredTime = now
	}
	if saveReq.DeliveryStatus != adminOrderDeliveryStatusDone {
		deliveredTime = 0
	}
	nextDownloadURL := strings.TrimSpace(saveReq.DownloadUrl)
	downloadChanged := nextDownloadURL != strings.TrimSpace(order.DownloadURL)

	updatePayload := map[string]interface{}{
		"delivery_status":      saveReq.DeliveryStatus,
		"license_bound_domain": strings.TrimSpace(saveReq.LicenseBoundDomain),
		"license_key":          strings.TrimSpace(saveReq.LicenseKey),
		"download_url":         nextDownloadURL,
		"delivery_note":        strings.TrimSpace(saveReq.DeliveryNote),
		"delivered_time":       deliveredTime,
		"update_time":          now,
	}
	if downloadChanged || nextDownloadURL == "" {
		updatePayload["download_check_status"] = orderDownloadCheckStatusUnchecked
		updatePayload["download_check_time"] = int64(0)
		updatePayload["download_check_message"] = ""
	}
	if err := srv.db.Model(&orderEntity{}).Where("id = ?", order.ID).Updates(updatePayload).Error; err != nil {
		return nil, response.CheckErr(err, "Order SaveDelivery Updates err")
	}

	order.DeliveryStatus = saveReq.DeliveryStatus
	order.LicenseBoundDomain = strings.TrimSpace(saveReq.LicenseBoundDomain)
	order.LicenseKey = strings.TrimSpace(saveReq.LicenseKey)
	order.DownloadURL = nextDownloadURL
	order.DeliveryNote = strings.TrimSpace(saveReq.DeliveryNote)
	order.DeliveredTime = deliveredTime
	order.UpdateTime = now
	if downloadChanged || nextDownloadURL == "" {
		order.DownloadCheckStatus = orderDownloadCheckStatusUnchecked
		order.DownloadCheckTime = 0
		order.DownloadCheckMessage = ""
	}

	licenseSnapshot := loadOrderLicenseSnapshot(srv.db)
	return map[string]interface{}{
		"order": formatOrderRow(mapOrderEntityToListRow(order), licenseSnapshot),
	}, nil
}

// CheckDownload 函数说明：手动检测订单下载链接是否可访问，并把结果持久化到订单交付记录中。
func (srv orderService) CheckDownload(checkReq req.UserOrderCheckDownloadReq) (res map[string]interface{}, e error) {
	var order orderEntity
	if err := srv.db.Where("id = ? AND delete_time = ?", checkReq.ID, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		return nil, response.CheckErr(err, "Order CheckDownload First err")
	}

	status, message := probeOrderDownloadURL(order.DownloadURL)
	now := time.Now().Unix()
	updatePayload := map[string]interface{}{
		"download_check_status":  status,
		"download_check_time":    now,
		"download_check_message": strings.TrimSpace(message),
		"update_time":            now,
	}
	if err := srv.db.Model(&orderEntity{}).Where("id = ?", order.ID).Updates(updatePayload).Error; err != nil {
		return nil, response.CheckErr(err, "Order CheckDownload Updates err")
	}

	order.DownloadCheckStatus = status
	order.DownloadCheckTime = now
	order.DownloadCheckMessage = strings.TrimSpace(message)
	order.UpdateTime = now
	licenseSnapshot := loadOrderLicenseSnapshot(srv.db)

	return map[string]interface{}{
		"order": formatOrderRow(mapOrderEntityToListRow(order), licenseSnapshot),
	}, nil
}
