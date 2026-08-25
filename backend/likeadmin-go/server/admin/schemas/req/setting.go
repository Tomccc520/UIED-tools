package req

// SettingWebsiteReq 保存网站信息参数
type SettingWebsiteReq struct {
	Name                              *string `form:"name" json:"name"`                                                           // 网站名称（支持部分字段更新）
	Logo                              *string `form:"logo" json:"logo"`                                                           // 网站图标（支持部分字段更新）
	Favicon                           *string `form:"favicon" json:"favicon"`                                                     // 网站LOGO（支持部分字段更新）
	Backdrop                          *string `form:"backdrop" json:"backdrop"`                                                   // 登录页广告图（支持部分字段更新）
	ShopName                          *string `form:"shopName" json:"shopName"`                                                   // 商城名称（支持部分字段更新）
	ShopLogo                          *string `form:"shopLogo" json:"shopLogo"`                                                   // 商城Logo（支持部分字段更新）
	ToolsSiteSlogan                   *string `form:"toolsSiteSlogan" json:"toolsSiteSlogan"`                                     // tools侧栏品牌标语（支持部分字段更新）
	ToolsSidebarRecommendTitle        *string `form:"toolsSidebarRecommendTitle" json:"toolsSidebarRecommendTitle"`               // tools侧栏推荐区标题（支持部分字段更新）
	ToolsSidebarBrandLogo             *string `form:"toolsSidebarBrandLogo" json:"toolsSidebarBrandLogo"`                         // tools侧栏品牌Logo（支持SVG地址/URL，支持部分字段更新）
	ToolsSidebarBrandText             *string `form:"toolsSidebarBrandText" json:"toolsSidebarBrandText"`                         // tools侧栏品牌文案（支持部分字段更新）
	ToolsFooterIntro                  *string `form:"toolsFooterIntro" json:"toolsFooterIntro"`                                   // tools页脚介绍文案（支持部分字段更新）
	ToolsFooterQuickTitle             *string `form:"toolsFooterQuickTitle" json:"toolsFooterQuickTitle"`                         // tools页脚快捷入口标题（支持部分字段更新）
	ToolsFooterFriendTitle            *string `form:"toolsFooterFriendTitle" json:"toolsFooterFriendTitle"`                       // tools页脚友情链接标题（支持部分字段更新）
	ToolsOfficialMediaTitle           *string `form:"toolsOfficialMediaTitle" json:"toolsOfficialMediaTitle"`                     // tools页脚官方媒体标题（支持部分字段更新）
	ToolsFooterSupportLabel           *string `form:"toolsFooterSupportLabel" json:"toolsFooterSupportLabel"`                     // tools页脚技术支持标签（支持部分字段更新）
	ToolsFooterSupportLinks           *string `form:"toolsFooterSupportLinks" json:"toolsFooterSupportLinks"`                     // tools页脚技术支持链接(JSON, 支持部分字段更新)
	ToolsFooterRecordLinks            *string `form:"toolsFooterRecordLinks" json:"toolsFooterRecordLinks"`                       // tools页脚备案/版权链接(JSON, 支持部分字段更新)
	ToolsHotTools                     *string `form:"toolsHotTools" json:"toolsHotTools"`                                         // tools热门工具(JSON, 支持部分字段更新)
	ToolsBannerSlides                 *string `form:"toolsBannerSlides" json:"toolsBannerSlides"`                                 // tools顶部Banner轮播(JSON, 支持部分字段更新)
	ToolsHeaderLinks                  *string `form:"toolsHeaderLinks" json:"toolsHeaderLinks"`                                   // tools头部快捷链接(JSON, 支持部分字段更新)
	ToolsSearchQuickTools             *string `form:"toolsSearchQuickTools" json:"toolsSearchQuickTools"`                         // tools搜索面板快捷入口(JSON, 支持部分字段更新)
	ToolsSearchProviderLabel          *string `form:"toolsSearchProviderLabel" json:"toolsSearchProviderLabel"`                   // tools搜索面板服务方名称（支持部分字段更新）
	ToolsSearchProviderLink           *string `form:"toolsSearchProviderLink" json:"toolsSearchProviderLink"`                     // tools搜索面板服务方链接（支持部分字段更新）
	ToolsSidebarRecommend             *string `form:"toolsSidebarRecommend" json:"toolsSidebarRecommend"`                         // tools侧栏推荐链接(JSON, 支持部分字段更新)
	ToolsSidebarCategoryMenus         *string `form:"toolsSidebarCategoryMenus" json:"toolsSidebarCategoryMenus"`                 // tools侧栏分类菜单(JSON, 支持部分字段更新)
	ToolsSidebarMenuBlocks            *string `form:"toolsSidebarMenuBlocks" json:"toolsSidebarMenuBlocks"`                       // tools侧栏菜单样式模块(JSON, 支持部分字段更新)
	ToolsCategoryTree                 *string `form:"toolsCategoryTree" json:"toolsCategoryTree"`                                 // tools工具分类与工具列表(JSON, 支持部分字段更新)
	ToolsSidebarBottomLinks           *string `form:"toolsSidebarBottomLinks" json:"toolsSidebarBottomLinks"`                     // tools侧栏底部链接(JSON, 支持部分字段更新)
	ToolsAiToolboxSidebarMenus        *string `form:"toolsAiToolboxSidebarMenus" json:"toolsAiToolboxSidebarMenus"`               // AI工具箱页左侧菜单(JSON, 支持部分字段更新)
	ToolsChangelogHeaderLinks         *string `form:"toolsChangelogHeaderLinks" json:"toolsChangelogHeaderLinks"`                 // 更新记录页顶部快捷链接(JSON, 支持部分字段更新)
	ToolsChangelogIntroText           *string `form:"toolsChangelogIntroText" json:"toolsChangelogIntroText"`                     // 更新记录页顶部说明文案（支持部分字段更新）
	ToolsChangelogMetaLinks           *string `form:"toolsChangelogMetaLinks" json:"toolsChangelogMetaLinks"`                     // 更新记录页资料链接(JSON, 支持部分字段更新)
	ToolsChangelogSplitTitle          *string `form:"toolsChangelogSplitTitle" json:"toolsChangelogSplitTitle"`                   // 更新记录页开源说明标题（兼容旧字段名，支持部分字段更新）
	ToolsChangelogSplitDesc           *string `form:"toolsChangelogSplitDesc" json:"toolsChangelogSplitDesc"`                     // 更新记录页开源说明正文（兼容旧字段名，支持部分字段更新）
	ToolsChangelogSplitLink           *string `form:"toolsChangelogSplitLink" json:"toolsChangelogSplitLink"`                     // 更新记录页源码链接（兼容旧字段名，支持部分字段更新）
	ToolsChangelogSplitLinkText       *string `form:"toolsChangelogSplitLinkText" json:"toolsChangelogSplitLinkText"`             // 更新记录页源码链接文案（兼容旧字段名，支持部分字段更新）
	ToolsChangelogStatsText           *string `form:"toolsChangelogStatsText" json:"toolsChangelogStatsText"`                     // 更新记录页顶部统计说明（支持部分字段更新）
	ToolsChangelogTimeline            *string `form:"toolsChangelogTimeline" json:"toolsChangelogTimeline"`                       // 更新记录页正文时间线(JSON, 支持部分字段更新)
	ToolsAiChatHeaderLinks            *string `form:"toolsAiChatHeaderLinks" json:"toolsAiChatHeaderLinks"`                       // AI对话/DeepSeek页顶部快捷链接(JSON, 支持部分字段更新)
	ToolsAiCommonHeaderLinks          *string `form:"toolsAiCommonHeaderLinks" json:"toolsAiCommonHeaderLinks"`                   // AI通用工具页顶部快捷链接(JSON, 支持部分字段更新)
	ToolsFooterQuickSections          *string `form:"toolsFooterQuickSections" json:"toolsFooterQuickSections"`                   // tools页脚快捷入口(JSON, 支持部分字段更新)
	ToolsFooterFriendSections         *string `form:"toolsFooterFriendSections" json:"toolsFooterFriendSections"`                 // tools页脚友情链接(JSON, 支持部分字段更新)
	ToolsOfficialMediaLinks           *string `form:"toolsOfficialMediaLinks" json:"toolsOfficialMediaLinks"`                     // tools页脚官方媒体(JSON, 支持部分字段更新)
	ToolsSeoDefaultTitle              *string `form:"toolsSeoDefaultTitle" json:"toolsSeoDefaultTitle"`                           // tools全站默认SEO标题（支持部分字段更新）
	ToolsSeoDefaultKeywords           *string `form:"toolsSeoDefaultKeywords" json:"toolsSeoDefaultKeywords"`                     // tools全站默认SEO关键词（支持部分字段更新）
	ToolsSeoDefaultDescription        *string `form:"toolsSeoDefaultDescription" json:"toolsSeoDefaultDescription"`               // tools全站默认SEO描述（支持部分字段更新）
	ToolsSeoDefaultImage              *string `form:"toolsSeoDefaultImage" json:"toolsSeoDefaultImage"`                           // tools全站默认SEO分享图（支持部分字段更新）
	ToolsSeoPages                     *string `form:"toolsSeoPages" json:"toolsSeoPages"`                                         // tools页面级SEO配置(JSON, 支持部分字段更新)
	ToolsHomepageLearningEnabled      *string `form:"toolsHomepageLearningEnabled" json:"toolsHomepageLearningEnabled"`           // 首页每日学习开关（0/1，支持部分字段更新）
	ToolsHomepageLearningTitle        *string `form:"toolsHomepageLearningTitle" json:"toolsHomepageLearningTitle"`               // 首页每日学习标题（支持部分字段更新）
	ToolsHomepageLearningRssURL       *string `form:"toolsHomepageLearningRssUrl" json:"toolsHomepageLearningRssUrl"`             // 首页每日学习 RSS 地址（仅允许 uied.cn，支持部分字段更新）
	ToolsHomepageLearningFilterType   *string `form:"toolsHomepageLearningFilterType" json:"toolsHomepageLearningFilterType"`     // RSS 筛选方式 all/category_slug/categories
	ToolsHomepageLearningCategorySlug *string `form:"toolsHomepageLearningCategorySlug" json:"toolsHomepageLearningCategorySlug"` // RSS 分类别名
	ToolsHomepageLearningCategoryIDs  *string `form:"toolsHomepageLearningCategoryIds" json:"toolsHomepageLearningCategoryIds"`   // RSS 分类 ID，支持逗号多值
	ToolsHomepageLearningLimit        *string `form:"toolsHomepageLearningLimit" json:"toolsHomepageLearningLimit"`               // 首页每日学习展示数量
}

// SettingWebsiteCatalogSyncReq 工具主数据批量同步参数
type SettingWebsiteCatalogSyncReq struct {
	Force                int `form:"force" json:"force" binding:"oneof=0 1"`                               // 是否强制覆盖同步 0/1
	SyncToolConsumeRules int `form:"syncToolConsumeRules" json:"syncToolConsumeRules" binding:"oneof=0 1"` // 是否同步写入工具积分策略 0/1
}

// SettingToolRankingListReq 工具热榜后台列表查询参数
type SettingToolRankingListReq struct {
	Keyword   string `form:"keyword" json:"keyword" binding:"max=120"`                                         // 关键词（工具标题 / toolKey / 链接）
	CateTitle string `form:"cateTitle" json:"cateTitle" binding:"max=120"`                                     // 分类标题
	Period    string `form:"period" json:"period" binding:"omitempty,oneof=day week month all"`                // 榜单周期
	SortBy    string `form:"sortBy" json:"sortBy" binding:"omitempty,oneof=score view start success download"` // 排序字段
}

// SettingToolRankingConfigSaveReq 工具热榜榜单配置保存参数
type SettingToolRankingConfigSaveReq struct {
	Enabled         int    `form:"enabled" json:"enabled" binding:"oneof=0 1"`                                      // 是否启用工具热榜
	PageTitle       string `form:"pageTitle" json:"pageTitle" binding:"max=120"`                                    // 独立热榜页标题
	PageDescription string `form:"pageDescription" json:"pageDescription" binding:"max=255"`                        // 独立热榜页说明
	DefaultPeriod   string `form:"defaultPeriod" json:"defaultPeriod" binding:"omitempty,oneof=day week month all"` // 独立热榜页默认周期
	PageLimit       int    `form:"pageLimit" json:"pageLimit" binding:"gte=1,lte=20"`                               // 独立热榜页默认数量
	ShowOnSidebar   int    `form:"showOnSidebar" json:"showOnSidebar" binding:"oneof=0 1"`                          // 右侧栏是否展示
	SidebarTitle    string `form:"sidebarTitle" json:"sidebarTitle" binding:"max=120"`                              // 右侧栏模块标题
	SidebarPeriod   string `form:"sidebarPeriod" json:"sidebarPeriod" binding:"omitempty,oneof=day week month all"` // 右侧栏模块周期
}

// SettingUserSetupReq 用户设置参数
type SettingUserSetupReq struct {
	DefaultAvatar string `form:"defaultAvatar" json:"defaultAvatar"` // 默认头像
}

// SettingLoginReq 登录注册配置参数
type SettingLoginReq struct {
	FrontendLoginEnabled      int    `form:"frontendLoginEnabled" json:"frontendLoginEnabled" binding:"oneof=0 1"` // 前台登录总开关 0/1
	LoginWay                  any    `form:"loginWay" json:"loginWay"`                                             // 登录方式（兼容字符串/数组）
	ForceBindMobile           int    `form:"forceBindMobile" json:"forceBindMobile"`                               // 强制绑定手机 0/1
	OpenAgreement             int    `form:"openAgreement" json:"openAgreement"`                                   // 协议开关 0/1
	OpenOtherAuth             int    `form:"openOtherAuth" json:"openOtherAuth"`                                   // 第三方登录开关 0/1
	AutoLoginAuth             any    `form:"autoLoginAuth" json:"autoLoginAuth"`                                   // 自动登录方式（兼容字符串/数组）
	OpenWechatAuth            int    `form:"openWechatAuth" json:"openWechatAuth"`                                 // 微信登录开关 0/1
	OpenQqAuth                int    `form:"openQqAuth" json:"openQqAuth"`                                         // QQ登录开关 0/1
	WechatAppId               string `form:"wechatAppId" json:"wechatAppId"`                                       // 微信开放平台 AppID
	WechatAppSecret           string `form:"wechatAppSecret" json:"wechatAppSecret"`                               // 微信开放平台 AppSecret
	WechatRedirectUrl         string `form:"wechatRedirectUrl" json:"wechatRedirectUrl"`                           // 微信登录回调地址
	QqAppId                   string `form:"qqAppId" json:"qqAppId"`                                               // QQ互联 AppID
	QqAppKey                  string `form:"qqAppKey" json:"qqAppKey"`                                             // QQ互联 AppKey
	QqRedirectUrl             string `form:"qqRedirectUrl" json:"qqRedirectUrl"`                                   // QQ登录回调地址
	UserCenterEnabled         int    `form:"userCenterEnabled" json:"userCenterEnabled"`                           // 用户中心入口开关 0/1
	UserCenterTitle           string `form:"userCenterTitle" json:"userCenterTitle"`                               // 用户中心入口名称
	UserCenterLink            string `form:"userCenterLink" json:"userCenterLink"`                                 // 用户中心入口链接
	DailyGiftPoints           int    `form:"dailyGiftPoints" json:"dailyGiftPoints"`                               // 每日赠送积分
	ToolConsumePoints         int    `form:"toolConsumePoints" json:"toolConsumePoints"`                           // 单次工具消耗积分
	ToolConsumeRules          any    `form:"toolConsumeRules" json:"toolConsumeRules"`                             // 按工具计费规则（支持数组/JSON字符串）
	ConsumeRiskRules          any    `form:"consumeRiskRules" json:"consumeRiskRules"`                             // 工具调用风控规则（支持对象/JSON字符串）
	MemberEnabled             int    `form:"memberEnabled" json:"memberEnabled"`                                   // 会员功能开关 0/1
	MemberTrialDays           int    `form:"memberTrialDays" json:"memberTrialDays"`                               // 会员试用天数（新用户）
	MemberPlans               any    `form:"memberPlans" json:"memberPlans"`                                       // 会员套餐配置（支持数组/JSON字符串）
	PointsPacks               any    `form:"pointsPacks" json:"pointsPacks"`                                       // 积分包配置（支持数组/JSON字符串）
	MemberRightsIntro         string `form:"memberRightsIntro" json:"memberRightsIntro"`                           // 会员权益说明文案
	PaymentChannels           any    `form:"paymentChannels" json:"paymentChannels"`                               // 支付渠道（逗号字符串或数组，支持 mock/wechat_h5/alipay_h5）
	PaymentWechatUrl          string `form:"paymentWechatUrl" json:"paymentWechatUrl"`                             // 微信支付跳转地址
	PaymentWechatCreateApi    string `form:"paymentWechatCreateApi" json:"paymentWechatCreateApi"`                 // 微信下单接口地址（服务端调用）
	PaymentWechatMchId        string `form:"paymentWechatMchId" json:"paymentWechatMchId"`                         // 微信支付商户号（mchid）
	PaymentWechatAppId        string `form:"paymentWechatAppId" json:"paymentWechatAppId"`                         // 微信支付 AppID（JSAPI/H5 使用）
	PaymentWechatSerialNo     string `form:"paymentWechatSerialNo" json:"paymentWechatSerialNo"`                   // 微信支付商户证书序列号（serial_no）
	PaymentWechatApiV3Key     string `form:"paymentWechatApiV3Key" json:"paymentWechatApiV3Key"`                   // 微信支付 APIv3 密钥
	PaymentWechatPrivateKey   string `form:"paymentWechatPrivateKey" json:"paymentWechatPrivateKey"`               // 微信支付商户私钥（PEM）
	PaymentWechatPlatformCert string `form:"paymentWechatPlatformCert" json:"paymentWechatPlatformCert"`           // 微信支付平台证书（PEM，可选）
	PaymentWechatNotifyUrl    string `form:"paymentWechatNotifyUrl" json:"paymentWechatNotifyUrl"`                 // 微信支付回调通知地址
	PaymentAlipayUrl          string `form:"paymentAlipayUrl" json:"paymentAlipayUrl"`                             // 支付宝支付跳转地址
	PaymentAlipayCreateApi    string `form:"paymentAlipayCreateApi" json:"paymentAlipayCreateApi"`                 // 支付宝下单接口地址（服务端调用）
	PaymentCallbackSecret     string `form:"paymentCallbackSecret" json:"paymentCallbackSecret"`                   // 支付回调签名密钥
	PaymentRequestSecret      string `form:"paymentRequestSecret" json:"paymentRequestSecret"`                     // 支付下单请求签名密钥
	PaymentRequestAuthType    string `form:"paymentRequestAuthType" json:"paymentRequestAuthType"`                 // 支付网关鉴权模式（none/bearer/header）
	PaymentRequestHeader      string `form:"paymentRequestHeader" json:"paymentRequestHeader"`                     // 支付网关自定义鉴权Header名称
	PaymentRequestToken       string `form:"paymentRequestToken" json:"paymentRequestToken"`                       // 支付网关鉴权令牌
	PaymentRequestTimeout     int    `form:"paymentRequestTimeout" json:"paymentRequestTimeout"`                   // 支付网关下单请求超时（秒）
	AdminLoginCaptchaOn       int    `form:"adminLoginCaptchaOn" json:"adminLoginCaptchaOn"`                       // 后台登录验证码开关 0/1
	AdminLoginFailLimit       int    `form:"adminLoginFailLimit" json:"adminLoginFailLimit"`                       // 后台登录失败锁定阈值（次数）
	AdminLoginFailWindow      int    `form:"adminLoginFailWindow" json:"adminLoginFailWindow"`                     // 后台登录失败锁定窗口（秒）
}

// SettingLicenseSaveReq 授权配置保存参数
type SettingLicenseSaveReq struct {
	LicenseKey                string `form:"licenseKey" json:"licenseKey" binding:"max=255"`                                 // 授权码
	CustomerName              string `form:"customerName" json:"customerName" binding:"max=120"`                             // 客户名称
	ContactName               string `form:"contactName" json:"contactName" binding:"max=120"`                               // 联系人
	ContactMobile             string `form:"contactMobile" json:"contactMobile" binding:"max=60"`                            // 联系电话
	ContactEmail              string `form:"contactEmail" json:"contactEmail" binding:"max=120"`                             // 联系邮箱
	ProductCode               string `form:"productCode" json:"productCode" binding:"max=120"`                               // 产品编码
	BoundDomain               string `form:"boundDomain" json:"boundDomain" binding:"max=255"`                               // 绑定域名
	MachineCode               string `form:"machineCode" json:"machineCode" binding:"max=255"`                               // 机器码
	ExpireTime                int64  `form:"expireTime" json:"expireTime"`                                                   // 过期时间（秒）
	Remark                    string `form:"remark" json:"remark" binding:"max=500"`                                         // 备注
	Enforce                   int    `form:"enforce" json:"enforce" binding:"oneof=0 1"`                                     // 强制授权开关 0/1
	VerifyApiUrl              string `form:"verifyApiUrl" json:"verifyApiUrl" binding:"max=255"`                             // 授权中心激活地址
	VerifyApiToken            string `form:"verifyApiToken" json:"verifyApiToken" binding:"max=255"`                         // 授权中心激活令牌
	VerifyApiMethod           string `form:"verifyApiMethod" json:"verifyApiMethod" binding:"omitempty,oneof=GET POST"`      // 授权中心激活方法
	VerifyApiTimeout          int    `form:"verifyApiTimeout" json:"verifyApiTimeout" binding:"gte=1000,lte=60000"`          // 授权中心激活超时（毫秒）
	VerifyApiAllowInsecureTls int    `form:"verifyApiAllowInsecureTls" json:"verifyApiAllowInsecureTls" binding:"oneof=0 1"` // 是否允许跳过 TLS 校验 0/1
	ApiSignSecret             string `form:"apiSignSecret" json:"apiSignSecret" binding:"max=255"`                           // 授权中心接口签名密钥
}

// SettingLicenseVerifyReq 授权校验参数
type SettingLicenseVerifyReq struct {
	ForceRemote int `form:"forceRemote" json:"forceRemote" binding:"oneof=0 1"` // 是否强制远程校验 0/1
}

// SettingSearchItemReq 热门搜索项参数
type SettingSearchItemReq struct {
	Name string `form:"name" json:"name"` // 关键词
	Sort int    `form:"sort" json:"sort"` // 排序
}

// SettingSearchReq 热门搜索配置参数
type SettingSearchReq struct {
	IsHotSearch int                    `form:"isHotSearch" json:"isHotSearch"` // 功能状态 0/1
	List        []SettingSearchItemReq `form:"list" json:"list"`               // 热门搜索列表
}

// SettingCopyrightItemReq 保存备案信息参数
type SettingCopyrightItemReq struct {
	Name string `form:"name" json:"name"`  // 名称
	Link string `form:"link"  json:"link"` // 链接
}

// SettingProtocolItem 政策通用参数
type SettingProtocolItem struct {
	Name    string `form:"name" json:"name"`        // 名称
	Content string `form:"content"  json:"content"` // 内容
}

// SettingProtocolReq 保存政策信息参数
type SettingProtocolReq struct {
	Service SettingProtocolItem `form:"service" json:"service"`  // 服务协议
	Privacy SettingProtocolItem `form:"privacy"  json:"privacy"` // 隐私协议
}

// SettingAiModelSaveReq 保存 AI 抠图 Provider 配置参数，保留 modelId 字段兼容既有接口。
type SettingAiModelSaveReq struct {
	ModelId          string                              `form:"modelId" json:"modelId" binding:"required"` // 抠图 Provider ID
	MattingProviders []SettingAiMattingProviderConfigReq `form:"mattingProviders" json:"mattingProviders"`  // 抠图 Provider 配置
	Providers        []SettingAiProviderConfigReq        `form:"providers" json:"providers"`                // 文本 AI Provider 配置
	ImageAbilities   []SettingAiImageAbilityConfigReq    `form:"imageAbilities" json:"imageAbilities"`      // 图片 AI 能力配置
}

// SettingAiMattingProviderConfigReq 抠图 API Provider 配置参数。
type SettingAiMattingProviderConfigReq struct {
	Provider        string `form:"provider" json:"provider" binding:"required,oneof=aliyun koukoutu"` // Provider 标识
	Label           string `form:"label" json:"label" binding:"required,max=60"`                      // Provider 名称
	Description     string `form:"description" json:"description" binding:"max=255"`                  // Provider 描述
	ApiURL          string `form:"apiUrl" json:"apiUrl" binding:"max=255"`                            // API 地址
	ApiKey          string `form:"apiKey" json:"apiKey" binding:"max=500"`                            // 通用 API Key
	AccessKeyID     string `form:"accessKeyId" json:"accessKeyId" binding:"max=255"`                  // 阿里云 AccessKey ID
	AccessKeySecret string `form:"accessKeySecret" json:"accessKeySecret" binding:"max=500"`          // 阿里云 AccessKey Secret
	Endpoint        string `form:"endpoint" json:"endpoint" binding:"max=255"`                        // 阿里云 Endpoint
	TimeoutSeconds  int    `form:"timeoutSeconds" json:"timeoutSeconds" binding:"gte=10,lte=300"`     // 超时时间
}

// SettingAiProviderConfigReq AI Provider 配置参数
type SettingAiProviderConfigReq struct {
	Provider     string `form:"provider" json:"provider" binding:"required"`        // Provider 标识
	Label        string `form:"label" json:"label" binding:"required,max=60"`       // Provider 名称
	Description  string `form:"description" json:"description" binding:"max=255"`   // Provider 描述
	Enabled      bool   `form:"enabled" json:"enabled"`                             // 是否启用
	IsDefault    bool   `form:"isDefault" json:"isDefault"`                         // 是否默认 Provider
	BaseURL      string `form:"baseUrl" json:"baseUrl" binding:"max=255"`           // Provider 基础地址
	ApiKey       string `form:"apiKey" json:"apiKey" binding:"max=500"`             // Provider API Key
	DefaultModel string `form:"defaultModel" json:"defaultModel" binding:"max=255"` // 默认模型
}

// SettingAiImageAbilityConfigReq 图片 AI 能力配置参数
type SettingAiImageAbilityConfigReq struct {
	Ability        string `form:"ability" json:"ability" binding:"required,max=80"`              // 能力标识
	Label          string `form:"label" json:"label" binding:"required,max=60"`                  // 能力名称
	Description    string `form:"description" json:"description" binding:"max=255"`              // 能力描述
	Enabled        bool   `form:"enabled" json:"enabled"`                                        // 是否启用
	Method         string `form:"method" json:"method" binding:"required,oneof=GET POST"`        // 上游调用方法
	UpstreamURL    string `form:"upstreamUrl" json:"upstreamUrl" binding:"required,max=255"`     // 上游地址
	ApiKeyHeader   string `form:"apiKeyHeader" json:"apiKeyHeader" binding:"max=120"`            // API Key 请求头名称
	ApiKey         string `form:"apiKey" json:"apiKey" binding:"max=500"`                        // API Key
	TimeoutSeconds int    `form:"timeoutSeconds" json:"timeoutSeconds" binding:"gte=10,lte=300"` // 超时时间
}

// CommonAiProviderCurrentReq 前台读取当前 AI Provider 的参数
type CommonAiProviderCurrentReq struct {
	Scene string `form:"scene" json:"scene"` // 业务场景，当前默认 chat
}

// CommonAiImageAbilityCurrentReq 前台读取图片 AI 能力配置参数
type CommonAiImageAbilityCurrentReq struct {
	Ability string `form:"ability" json:"ability" binding:"required,max=80"` // 图片 AI 能力标识
}

// CommonAiProviderChatMessageReq AI 对话消息参数
type CommonAiProviderChatMessageReq struct {
	Role    string `form:"role" json:"role" binding:"required"`       // 角色
	Content string `form:"content" json:"content" binding:"required"` // 内容
}

// CommonAiProviderChatReq 前台 AI Provider 代理对话参数
type CommonAiProviderChatReq struct {
	Scene            string                           `form:"scene" json:"scene"`                                     // 业务场景，当前默认 chat
	Model            string                           `form:"model" json:"model"`                                     // 模型ID，未传时走后台默认模型
	Messages         []CommonAiProviderChatMessageReq `form:"messages" json:"messages" binding:"required,min=1"`      // 对话消息列表
	Temperature      *float64                         `form:"temperature" json:"temperature"`                         // 温度
	MaxTokens        *int                             `form:"max_tokens" json:"max_tokens"`                           // 最大输出 token
	Stream           *bool                            `form:"stream" json:"stream"`                                   // 是否流式返回
	PresencePenalty  *float64                         `form:"presence_penalty" json:"presence_penalty"`               // 存在惩罚
	FrequencyPenalty *float64                         `form:"frequency_penalty" json:"frequency_penalty"`             // 频率惩罚
	TopP             *float64                         `form:"top_p" json:"top_p"`                                     // Top P
	ExtraOptions     map[string]interface{}           `form:"extra_options" json:"extra_options"`                     // 扩展参数
	OverrideApiKey   string                           `form:"overrideApiKey" json:"overrideApiKey" binding:"max=500"` // 手动覆盖 API Key（仅本次请求生效）
}

// SettingStorageDetailReq 存储详情参数
type SettingStorageDetailReq struct {
	Alias string `form:"alias" binding:"required,oneof=local qiniu qcloud aliyun"` // 别名: [local,qiniu,qcloud,aliyun]
}

// SettingStorageEditReq 存储编辑参数
type SettingStorageEditReq struct {
	Alias     string `form:"alias" binding:"required,oneof=local qiniu qcloud aliyun"` // 别名: [local,qiniu,qcloud,aliyun]
	Status    int    `form:"status" binding:"oneof=0 1"`                               // 状态: 0/1
	Bucket    string `form:"bucket"`                                                   // 存储空间名
	SecretKey string `form:"secretKey"`                                                // SK
	AccessKey string `form:"accessKey"`                                                // AK
	Domain    string `form:"domain"`                                                   // 访问域名
	Region    string `form:"region"`                                                   // 地区,腾讯存储特有
}

// SettingStorageChangeReq 存储切换参数
type SettingStorageChangeReq struct {
	Alias  string `form:"alias" binding:"required,oneof=local qiniu qcloud aliyun"` // 别名: [local,qiniu,qcloud,aliyun]
	Status int    `form:"status" binding:"oneof=0 1"`                               // 状态: 0/1
}

// SettingDictTypeListReq 字典类型新增参数
type SettingDictTypeListReq struct {
	DictName   string `form:"dictName" binding:"max=200"`                   // 字典名称
	DictType   string `form:"dictType" binding:"max=200"`                   // 字典类型
	DictStatus int8   `form:"dictStatus,default=-1" binding:"oneof=-1 0 1"` // 字典状态: 0/1
}

// SettingDictTypeDetailReq 字典类型详情参数
type SettingDictTypeDetailReq struct {
	ID uint `form:"id" binding:"required,gt=0"` // 主键
}

// SettingDictTypeAddReq 字典类型新增参数
type SettingDictTypeAddReq struct {
	DictName   string `form:"dictName" binding:"required,max=200"`     // 字典名称
	DictType   string `form:"dictType" binding:"required,max=200"`     // 字典类型
	DictRemark string `form:"dictRemark" binding:"max=200"`            // 字典备注
	DictStatus int8   `form:"dictStatus" binding:"required,oneof=0 1"` // 字典状态: 0/1
}

// SettingDictTypeEditReq 字典类型编辑参数
type SettingDictTypeEditReq struct {
	ID         uint   `form:"id" binding:"required,gt=0"`              // 主键
	DictName   string `form:"dictName" binding:"required,max=200"`     // 字典名称
	DictType   string `form:"dictType" binding:"required,max=200"`     // 字典类型
	DictRemark string `form:"dictRemark" binding:"max=200"`            // 字典备注
	DictStatus int8   `form:"dictStatus" binding:"required,oneof=0 1"` // 字典状态: 0/1
}

// SettingDictTypeDelReq 字典类型删除参数
type SettingDictTypeDelReq struct {
	Ids []uint `form:"ids" binding:"required"` // 主键列表
}

// SettingDictDataListReq 字典数据列表参数
type SettingDictDataListReq struct {
	DictType string `form:"dictType" binding:"max=200"`               // 字典类型
	Name     string `form:"name" binding:"max=100"`                   // 键
	Value    string `form:"value" binding:"max=200"`                  // 值
	Status   int8   `form:"status,default=-1" binding:"oneof=-1 0 1"` // 状态: 0=停用,1=启用
}

// SettingDictDataDetailReq 字典数据详情参数
type SettingDictDataDetailReq struct {
	ID uint `form:"id" binding:"required,gt=0"` // 主键
}

// SettingDictDataAddReq 字典数据新增参数
type SettingDictDataAddReq struct {
	TypeId uint   `form:"typeId" binding:"required,gt=0"`           // 类型
	Name   string `form:"name" binding:"required,max=100"`          // 键
	Value  string `form:"value" binding:"required,max=200"`         // 值
	remark string `form:"remark" binding:"max=200"`                 // 备注
	Sort   int    `form:"sort" binding:"gte=0"`                     // 排序
	Status int8   `form:"status,default=-1" binding:"oneof=-1 0 1"` // 状态: 0=停用,1=启用
}

// SettingDictDataEditReq 字典数据编辑参数
type SettingDictDataEditReq struct {
	ID     uint   `form:"id" binding:"required,gt=0"`               // 主键
	TypeId uint   `form:"typeId" binding:"required,gte=0"`          // 类型
	Name   string `form:"name" binding:"required,max=100"`          // 键
	Value  string `form:"value" binding:"required,max=200"`         // 值
	remark string `form:"remark" binding:"max=200"`                 // 备注
	Sort   int    `form:"sort" binding:"gte=0"`                     // 排序
	Status int8   `form:"status,default=-1" binding:"oneof=-1 0 1"` // 状态: 0=停用,1=启用
}

// SettingDictDataDelReq 字典数据删除参数
type SettingDictDataDelReq struct {
	Ids []uint `form:"ids" binding:"required"` // 主键列表
}
