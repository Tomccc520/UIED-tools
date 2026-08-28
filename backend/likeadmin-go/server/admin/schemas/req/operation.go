/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package req

// OperationAdvertisingItemReq 广告内容保存项。
type OperationAdvertisingItemReq struct {
	RenderMode string `form:"renderMode" json:"renderMode" binding:"omitempty,max=10"` // 渲染模式：image/html
	Text       string `form:"text" json:"text" binding:"omitempty,max=120"`            // 广告名称
	Image      string `form:"image" json:"image" binding:"omitempty,max=1000"`         // 图片广告素材
	HTMLCode   string `form:"htmlCode" json:"htmlCode" binding:"omitempty,max=50000"`  // HTML 广告代码
	Link       string `form:"link" json:"link" binding:"omitempty,max=500"`            // 图片广告跳转链接
	Target     string `form:"target" json:"target" binding:"omitempty,max=10"`         // 链接打开方式
	Height     int    `form:"height" json:"height" binding:"omitempty,gte=32,lte=600"` // 广告高度
	Badge      string `form:"badge" json:"badge" binding:"omitempty,max=20"`           // 历史角标，用于自动迁移
	Gradient   string `form:"gradient" json:"gradient" binding:"omitempty,max=500"`    // 历史渐变，用于自动迁移
}

// OperationAdvertisingHotToolItemReq 热门工具原生广告保存项。
type OperationAdvertisingHotToolItemReq struct {
	Title string `form:"title" json:"title" binding:"omitempty,max=120"` // 展示标题
	Desc  string `form:"desc" json:"desc" binding:"omitempty,max=240"`   // 展示简介
	Link  string `form:"link" json:"link" binding:"omitempty,max=500"`   // 跳转链接
}

// OperationAdvertisingSaveReq 广告管理保存参数。
type OperationAdvertisingSaveReq struct {
	Items    []OperationAdvertisingItemReq        `form:"items" json:"items" binding:"required,min=1,max=20,dive"`  // 顶部广告列表
	HotTools []OperationAdvertisingHotToolItemReq `form:"hotTools" json:"hotTools" binding:"omitempty,max=20,dive"` // 热门工具原生广告列表；缺省时兼容旧管理端且不覆盖原配置
}
