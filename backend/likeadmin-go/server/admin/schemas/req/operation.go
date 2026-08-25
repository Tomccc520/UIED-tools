/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package req

// OperationAdvertisingItemReq 广告内容保存项。
type OperationAdvertisingItemReq struct {
	Badge    string `form:"badge" json:"badge" binding:"required,max=20"`        // 广告角标
	Text     string `form:"text" json:"text" binding:"required,max=120"`         // 广告文案
	Link     string `form:"link" json:"link" binding:"required,max=500"`         // 跳转链接
	Gradient string `form:"gradient" json:"gradient" binding:"required,max=500"` // 背景渐变
}

// OperationAdvertisingSaveReq 广告管理保存参数。
type OperationAdvertisingSaveReq struct {
	Items []OperationAdvertisingItemReq `form:"items" json:"items" binding:"required,min=1,max=20,dive"` // 广告列表
}
