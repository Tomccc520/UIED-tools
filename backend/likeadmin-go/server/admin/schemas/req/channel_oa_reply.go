package req

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

// ChannelOaReplyDetailReq 公众号回复规则详情参数
type ChannelOaReplyDetailReq struct {
	ID uint `form:"id" json:"id" binding:"required"` // 回复规则 ID
}

// ChannelOaReplySaveReq 公众号回复规则新增与编辑参数
type ChannelOaReplySaveReq struct {
	ID           uint   `form:"id" json:"id"`                                                      // 回复规则 ID，编辑时必填
	Name         string `form:"name" json:"name" binding:"required,max=64"`                        // 规则名称
	Type         string `form:"type" json:"type" binding:"omitempty,oneof=follow keyword default"` // 回复类型，由接口路径最终约束
	Keyword      string `form:"keyword" json:"keyword" binding:"max=64"`                           // 关键词回复匹配词
	MatchingType uint8  `form:"matchingType" json:"matchingType" binding:"oneof=1 2"`              // 匹配方式：1=全匹配，2=模糊匹配
	ContentType  uint8  `form:"contentType" json:"contentType" binding:"required,oneof=1"`         // 内容类型：1=文本
	Content      string `form:"content" json:"content" binding:"required,max=5000"`                // 回复内容
	Status       uint8  `form:"status" json:"status" binding:"oneof=0 1"`                          // 启用状态：0=关闭，1=开启
	Sort         uint   `form:"sort" json:"sort" binding:"lte=9999"`                               // 排序值
}

// ChannelOaReplyActionReq 公众号回复规则状态与删除参数
type ChannelOaReplyActionReq struct {
	ID uint `form:"id" json:"id" binding:"required"` // 回复规则 ID
}
