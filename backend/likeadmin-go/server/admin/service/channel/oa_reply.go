package channel

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

import (
	"strings"
	"time"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	"likeadmin/core/request"
	"likeadmin/core/response"
)

const (
	oaReplyTypeFollow  uint8 = 1
	oaReplyTypeKeyword uint8 = 2
	oaReplyTypeDefault uint8 = 3
)

// IOaReplyService 函数说明：定义微信公众号回复规则的真实增删改查能力。
type IOaReplyService interface {
	List(page request.PageReq, replyType string) (res response.PageResp, e error)
	Detail(id uint, replyType string) (res map[string]interface{}, e error)
	Add(saveReq req.ChannelOaReplySaveReq, replyType string) (e error)
	Edit(saveReq req.ChannelOaReplySaveReq, replyType string) (e error)
	Del(id uint, replyType string) (e error)
	ChangeStatus(id uint, replyType string) (e error)
}

// NewOaReplyService 函数说明：初始化微信公众号回复规则服务。
func NewOaReplyService(db *gorm.DB) IOaReplyService {
	return &oaReplyService{db: db}
}

// oaReplyService 函数说明：微信公众号回复规则服务实现。
type oaReplyService struct {
	db *gorm.DB
}

// officialReplyEntity 函数说明：映射公众号回复规则数据表。
type officialReplyEntity struct {
	ID           uint   `gorm:"column:id;primaryKey"`
	Name         string `gorm:"column:name"`
	Keyword      string `gorm:"column:keyword"`
	ReplyType    uint8  `gorm:"column:reply_type"`
	MatchingType uint8  `gorm:"column:matching_type"`
	ContentType  uint8  `gorm:"column:content_type"`
	Status       uint8  `gorm:"column:status"`
	Content      string `gorm:"column:content"`
	Sort         uint   `gorm:"column:sort"`
	IsDelete     uint8  `gorm:"column:is_delete"`
	CreateTime   int64  `gorm:"column:create_time"`
	UpdateTime   int64  `gorm:"column:update_time"`
	DeleteTime   int64  `gorm:"column:delete_time"`
}

// TableName 函数说明：声明公众号回复规则对应的数据表名。
func (officialReplyEntity) TableName() string {
	return "la_official_reply"
}

// resolveOaReplyType 函数说明：将前端回复类型转换为数据库类型编码。
func resolveOaReplyType(replyType string) (uint8, error) {
	switch strings.ToLower(strings.TrimSpace(replyType)) {
	case "follow":
		return oaReplyTypeFollow, nil
	case "keyword":
		return oaReplyTypeKeyword, nil
	case "default":
		return oaReplyTypeDefault, nil
	default:
		return 0, response.AssertArgumentError.Make("公众号回复类型不合法")
	}
}

// normalizeOaReplyPage 函数说明：限制回复规则分页参数，避免异常请求一次读取过多数据。
func normalizeOaReplyPage(page request.PageReq) (pageNo int, pageSize int) {
	pageNo = page.PageNo
	if pageNo <= 0 {
		pageNo = 1
	}
	pageSize = page.PageSize
	if pageSize <= 0 {
		pageSize = 15
	}
	if pageSize > 100 {
		pageSize = 100
	}
	return
}

// buildOaReplyResponse 函数说明：把数据库字段转换为后台页面使用的驼峰结构。
func buildOaReplyResponse(item officialReplyEntity, replyType string) map[string]interface{} {
	return map[string]interface{}{
		"id":           item.ID,
		"name":         item.Name,
		"type":         replyType,
		"keyword":      item.Keyword,
		"matchingType": item.MatchingType,
		"contentType":  item.ContentType,
		"content":      item.Content,
		"status":       item.Status,
		"sort":         item.Sort,
		"createTime":   item.CreateTime,
		"updateTime":   item.UpdateTime,
	}
}

// normalizeOaReplySaveReq 函数说明：清理回复规则输入，并校验关键词回复专属字段。
func normalizeOaReplySaveReq(saveReq req.ChannelOaReplySaveReq, replyTypeCode uint8) (req.ChannelOaReplySaveReq, error) {
	saveReq.Name = strings.TrimSpace(saveReq.Name)
	saveReq.Keyword = strings.TrimSpace(saveReq.Keyword)
	saveReq.Content = strings.TrimSpace(saveReq.Content)
	if saveReq.Name == "" {
		return saveReq, response.AssertArgumentError.Make("规则名称不能为空")
	}
	if saveReq.Content == "" {
		return saveReq, response.AssertArgumentError.Make("回复内容不能为空")
	}
	if replyTypeCode == oaReplyTypeKeyword && saveReq.Keyword == "" {
		return saveReq, response.AssertArgumentError.Make("关键词不能为空")
	}
	if replyTypeCode != oaReplyTypeKeyword {
		saveReq.Keyword = ""
		saveReq.MatchingType = 1
	}
	return saveReq, nil
}

// disableOtherExclusiveReplies 函数说明：启用关注或默认回复时关闭同类型其他规则，确保运行态唯一生效。
func disableOtherExclusiveReplies(tx *gorm.DB, replyTypeCode uint8, excludeID uint) error {
	if replyTypeCode == oaReplyTypeKeyword {
		return nil
	}
	chain := tx.Model(&officialReplyEntity{}).
		Where("reply_type = ? AND is_delete = ? AND status = ?", replyTypeCode, 0, 1)
	if excludeID > 0 {
		chain = chain.Where("id <> ?", excludeID)
	}
	return chain.Updates(map[string]interface{}{
		"status":      0,
		"update_time": time.Now().Unix(),
	}).Error
}

// List 函数说明：分页读取指定类型的公众号回复规则。
func (srv oaReplyService) List(page request.PageReq, replyType string) (res response.PageResp, e error) {
	replyTypeCode, err := resolveOaReplyType(replyType)
	if err != nil {
		return response.PageResp{}, err
	}
	pageNo, pageSize := normalizeOaReplyPage(page)
	chain := srv.db.Model(&officialReplyEntity{}).
		Where("reply_type = ? AND is_delete = ?", replyTypeCode, 0)

	var count int64
	if e = response.CheckErr(chain.Count(&count).Error, "OaReply List Count err"); e != nil {
		return
	}

	items := make([]officialReplyEntity, 0)
	if e = response.CheckErr(
		chain.Order("sort ASC, id DESC").Limit(pageSize).Offset((pageNo-1)*pageSize).Find(&items).Error,
		"OaReply List Find err",
	); e != nil {
		return
	}
	lists := make([]map[string]interface{}, 0, len(items))
	for _, item := range items {
		lists = append(lists, buildOaReplyResponse(item, replyType))
	}
	return response.PageResp{
		Lists:    lists,
		Count:    count,
		PageNo:   pageNo,
		PageSize: pageSize,
	}, nil
}

// Detail 函数说明：读取指定类型的公众号回复规则详情。
func (srv oaReplyService) Detail(id uint, replyType string) (res map[string]interface{}, e error) {
	replyTypeCode, err := resolveOaReplyType(replyType)
	if err != nil {
		return nil, err
	}
	var item officialReplyEntity
	err = srv.db.Where("id = ? AND reply_type = ? AND is_delete = ?", id, replyTypeCode, 0).First(&item).Error
	if e = response.CheckErrDBNotRecord(err, "回复规则不存在"); e != nil {
		return
	}
	if e = response.CheckErr(err, "OaReply Detail First err"); e != nil {
		return
	}
	return buildOaReplyResponse(item, replyType), nil
}

// Add 函数说明：新增公众号回复规则并按类型维护唯一生效状态。
func (srv oaReplyService) Add(saveReq req.ChannelOaReplySaveReq, replyType string) (e error) {
	replyTypeCode, err := resolveOaReplyType(replyType)
	if err != nil {
		return err
	}
	normalizedReq, err := normalizeOaReplySaveReq(saveReq, replyTypeCode)
	if err != nil {
		return err
	}
	now := time.Now().Unix()
	item := officialReplyEntity{
		Name:         normalizedReq.Name,
		Keyword:      normalizedReq.Keyword,
		ReplyType:    replyTypeCode,
		MatchingType: normalizedReq.MatchingType,
		ContentType:  normalizedReq.ContentType,
		Status:       normalizedReq.Status,
		Content:      normalizedReq.Content,
		Sort:         normalizedReq.Sort,
		CreateTime:   now,
		UpdateTime:   now,
	}
	return srv.db.Transaction(func(tx *gorm.DB) error {
		if item.Status == 1 {
			if txErr := disableOtherExclusiveReplies(tx, replyTypeCode, 0); txErr != nil {
				return response.CheckErr(txErr, "OaReply Add disable others err")
			}
		}
		return response.CheckErr(tx.Create(&item).Error, "OaReply Add Create err")
	})
}

// Edit 函数说明：更新公众号回复规则并防止跨类型修改其他数据。
func (srv oaReplyService) Edit(saveReq req.ChannelOaReplySaveReq, replyType string) (e error) {
	if saveReq.ID == 0 {
		return response.AssertArgumentError.Make("回复规则 ID 不能为空")
	}
	replyTypeCode, err := resolveOaReplyType(replyType)
	if err != nil {
		return err
	}
	normalizedReq, err := normalizeOaReplySaveReq(saveReq, replyTypeCode)
	if err != nil {
		return err
	}
	var item officialReplyEntity
	err = srv.db.Where("id = ? AND reply_type = ? AND is_delete = ?", saveReq.ID, replyTypeCode, 0).First(&item).Error
	if e = response.CheckErrDBNotRecord(err, "回复规则不存在"); e != nil {
		return
	}
	if e = response.CheckErr(err, "OaReply Edit First err"); e != nil {
		return
	}
	updates := map[string]interface{}{
		"name":          normalizedReq.Name,
		"keyword":       normalizedReq.Keyword,
		"matching_type": normalizedReq.MatchingType,
		"content_type":  normalizedReq.ContentType,
		"status":        normalizedReq.Status,
		"content":       normalizedReq.Content,
		"sort":          normalizedReq.Sort,
		"update_time":   time.Now().Unix(),
	}
	return srv.db.Transaction(func(tx *gorm.DB) error {
		if normalizedReq.Status == 1 {
			if txErr := disableOtherExclusiveReplies(tx, replyTypeCode, saveReq.ID); txErr != nil {
				return response.CheckErr(txErr, "OaReply Edit disable others err")
			}
		}
		return response.CheckErr(
			tx.Model(&officialReplyEntity{}).Where("id = ? AND reply_type = ? AND is_delete = ?", saveReq.ID, replyTypeCode, 0).Updates(updates).Error,
			"OaReply Edit Updates err",
		)
	})
}

// Del 函数说明：软删除指定类型的公众号回复规则。
func (srv oaReplyService) Del(id uint, replyType string) (e error) {
	replyTypeCode, err := resolveOaReplyType(replyType)
	if err != nil {
		return err
	}
	now := time.Now().Unix()
	result := srv.db.Model(&officialReplyEntity{}).
		Where("id = ? AND reply_type = ? AND is_delete = ?", id, replyTypeCode, 0).
		Updates(map[string]interface{}{
			"is_delete":   1,
			"status":      0,
			"update_time": now,
			"delete_time": now,
		})
	if e = response.CheckErr(result.Error, "OaReply Del Updates err"); e != nil {
		return
	}
	if result.RowsAffected == 0 {
		return response.AssertArgumentError.Make("回复规则不存在")
	}
	return nil
}

// ChangeStatus 函数说明：切换公众号回复规则状态，并维护关注与默认回复的唯一启用约束。
func (srv oaReplyService) ChangeStatus(id uint, replyType string) (e error) {
	replyTypeCode, err := resolveOaReplyType(replyType)
	if err != nil {
		return err
	}
	var item officialReplyEntity
	err = srv.db.Where("id = ? AND reply_type = ? AND is_delete = ?", id, replyTypeCode, 0).First(&item).Error
	if e = response.CheckErrDBNotRecord(err, "回复规则不存在"); e != nil {
		return
	}
	if e = response.CheckErr(err, "OaReply Status First err"); e != nil {
		return
	}
	nextStatus := uint8(1)
	if item.Status == 1 {
		nextStatus = 0
	}
	return srv.db.Transaction(func(tx *gorm.DB) error {
		if nextStatus == 1 {
			if txErr := disableOtherExclusiveReplies(tx, replyTypeCode, id); txErr != nil {
				return response.CheckErr(txErr, "OaReply Status disable others err")
			}
		}
		return response.CheckErr(
			tx.Model(&officialReplyEntity{}).Where("id = ?", id).Updates(map[string]interface{}{
				"status":      nextStatus,
				"update_time": time.Now().Unix(),
			}).Error,
			"OaReply Status Updates err",
		)
	})
}
