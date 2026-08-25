package req

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

// ChannelOaMenuItemReq 公众号自定义菜单项参数
type ChannelOaMenuItemReq struct {
	Name       string                 `form:"name" json:"name"`             // 菜单名称
	MenuType   int                    `form:"menuType" json:"menuType"`     // 菜单类型：1=直接跳转，2=包含子菜单
	VisitType  string                 `form:"visitType" json:"visitType"`   // 访问类型：view/miniprogram
	URL        string                 `form:"url" json:"url"`               // 网页或小程序备用地址
	AppID      string                 `form:"appId" json:"appId"`           // 小程序 AppID
	PagePath   string                 `form:"pagePath" json:"pagePath"`     // 小程序页面路径
	SubButtons []ChannelOaMenuItemReq `form:"subButtons" json:"subButtons"` // 子菜单列表
}
