package common

import (
	"gorm.io/gorm"
	servicedefaults "likeadmin/admin/service/defaults"
	"likeadmin/config"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/util"
	"net/url"
	"strings"
	"time"
)

const toolsWebsiteNameDefaultValue = "UIED-Tools"

type IIndexService interface {
	Console() (res map[string]interface{}, e error)
	Config() (res map[string]interface{}, e error)
	LearningRSS() (res map[string]interface{}, e error)
}

// NewIndexService 初始化
func NewIndexService(db *gorm.DB) IIndexService {
	return &indexService{db: db}
}

// indexService 主页服务实现类
type indexService struct {
	db *gorm.DB
}

/**
 * 函数说明：解析网站配置中的 JSON 数组字符串，异常时返回空数组避免影响主流程
 */
func parseWebsiteJsonArray(data map[string]string, key string) []map[string]interface{} {
	raw := strings.TrimSpace(data[key])
	if raw == "" {
		return []map[string]interface{}{}
	}
	var items []map[string]interface{}
	if err := util.ToolsUtil.JsonToObj(raw, &items); err != nil {
		return []map[string]interface{}{}
	}
	return items
}

/**
 * 函数说明：返回热门工具默认配置，供未配置数据库时前端直接渲染
 */
func getDefaultToolsHotTools() []map[string]interface{} {
	return []map[string]interface{}{
		{"title": "Adobe 正版全家桶可用AI", "desc": "Adobe 正版全家桶可用AI", "link": "https://universalbus.cn/?s=lPLG02aydo"},
		{"title": "Gemini3 可用 nanobanana", "desc": "Gemini3 可用 nanobanana", "link": "https://universalbus.cn/?s=lPLG02aydo"},
		{"title": "AI学习网站", "desc": "每天逛一逛", "link": "https://www.uied.cn/category/aigc/ai"},
		{"title": "免费AI生成PPT", "desc": "AI智能生成PPT", "link": "https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047"},
		{"title": "AIGC学习网站", "desc": "UIED技术团队官网", "link": "https://uied.cn/"},
		{"title": "AIGC工具", "desc": "AI智能工具集合", "link": "https://universalbus.cn/?s=lPLG02aydo"},
		{"title": "Midjourney绘画", "desc": "AI绘画生成工具", "link": "https://nf.video/czybtp/?gid=26"},
		{"title": "GPT-5.2", "desc": "最新版GPT-5.2智能对话工具", "link": "https://nf.video/oemcwv/?gid=18"},
		{"title": "ChatExcel表格", "desc": "AI Excel 数据分析辅助工具", "link": "https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6"},
	}
}

/**
 * 函数说明：返回顶部 Banner 默认配置，供前端布局未配置时兜底渲染
 */
func getDefaultToolsBannerSlides() []map[string]interface{} {
	return []map[string]interface{}{
		{"badge": "推荐", "text": "一人企业Vibe Coding社区！", "link": "https://fsuied.com", "gradient": "linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"},
		{"badge": "热门", "text": "GPT-5.4重回巅峰 智能对话", "link": "https://nf.video/mbx1u6/?gid=18", "gradient": "linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)"},
		{"badge": "新品", "text": "免费AI编程工具 Trae - 智能编码助手", "link": "https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied", "gradient": "linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)"},
		{"badge": "新品", "text": "腾讯元宝 智能对话新体验", "link": "https://yuanbao.paluai.com/uied", "gradient": "linear-gradient(to right,#ffc800,#ffed99,#fff8cc,#ffaa00)"},
		{"badge": "高效", "text": "免费AI生成PPT - 一键生成演示文稿", "link": "https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047", "gradient": "linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)"},
		{"badge": "特惠", "text": "Adobe 正版全家桶可用AI", "link": "https://universalbus.cn/?s=lPLG02aydo", "gradient": "linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)"},
		{"badge": "新品", "text": "Gemini3 可用 nanobanana", "link": "https://universalbus.cn/?s=lPLG02aydo", "gradient": "linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)"},
	}
}

/**
 * 函数说明：返回搜索面板快捷入口默认配置，供搜索弹层未配置时兜底渲染。
 */
func getDefaultToolsSearchQuickTools() []map[string]interface{} {
	return []map[string]interface{}{
		{"name": "DeepSeek R1对话", "desc": "基于 DeepSeek-R1 推理模型的智能对话", "link": "/tools/ai/deepseek-r1"},
		{"name": "DeepSeek AI对话", "desc": "基础智能对话服务", "link": "/tools/ai/deepseek"},
		{"name": "DeepSeek提示词", "desc": "专业的 Prompt 提示词指南", "link": "/tools/ai/deepseek-prompt"},
		{"name": "DeepSeek导航", "desc": "DeepSeek 模型与工具导航", "link": "/tools/ai/deepseek-nav"},
		{"name": "AI封面设计", "desc": "AI智能生成封面图片", "link": "/tools/ai-design-cover"},
		{"name": "AI产品榜", "desc": "跳转至 AI 产品导航站", "link": "https://hao.uied.cn/"},
	}
}

/**
 * 函数说明：返回页脚备案与版权默认链接，供前端布局未配置时兜底渲染
 */
func getDefaultToolsFooterRecordLinks() []map[string]interface{} {
	return []map[string]interface{}{
		{"name": "粤ICP备2022056875号", "link": "https://beian.miit.gov.cn/"},
		{"name": "网站地图", "link": "/sitemap.xml"},
	}
}

/**
 * 函数说明：返回侧边栏分类菜单默认配置，供运营后台未配置时兜底渲染
 */
func getDefaultToolsSidebarCategoryMenus() []map[string]interface{} {
	return []map[string]interface{}{
		{"key": "ai", "title": "AI工具箱", "cateTitle": "AI工具箱", "link": "/tools/ai/toolbox", "icon": "/icons/sidebar/ai.svg"},
		{"key": "design", "title": "设计工具", "cateTitle": "设计工具", "icon": "/icons/sidebar/design.svg"},
		{"key": "image", "title": "图片处理", "cateTitle": "图片处理", "icon": "/icons/sidebar/image.svg"},
		{"key": "office", "title": "办公工具", "cateTitle": "办公工具", "icon": "/icons/sidebar/office.svg"},
		{"key": "daily", "title": "生活常用", "cateTitle": "生活常用", "icon": "/icons/sidebar/daily.svg"},
		{"key": "copywriting", "title": "文案工具", "cateTitle": "文案工具", "icon": "/icons/sidebar/copywriting.svg"},
		{"key": "psychology", "title": "潜能测试", "cateTitle": "潜能测试", "icon": "/icons/sidebar/psychology.svg"},
		{"key": "video", "title": "剪辑工具", "cateTitle": "剪辑工具", "icon": "/icons/sidebar/video.svg"},
		{"key": "dev", "title": "开发工具", "cateTitle": "开发工具", "icon": "/icons/sidebar/dev.svg"},
		{"key": "slacking", "title": "摸鱼工具", "cateTitle": "摸鱼工具", "icon": "/icons/sidebar/slacking.svg"},
		{"key": "efficiency", "title": "效率工具", "cateTitle": "效率工具", "icon": "/icons/sidebar/efficiency.svg"},
	}
}

/**
 * 函数说明：返回侧边栏菜单样式模块默认配置，供运营后台未配置时兜底渲染。
 */
func getDefaultToolsSidebarMenuBlocks() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"key":   "menu-dropdown",
			"title": "下拉菜单",
			"type":  "dropdown",
			"icon":  "/icons/sidebar/dev.svg",
			"items": []map[string]interface{}{
				{"name": "随机推荐", "link": "/tools/random-tools"},
				{"name": "每日热榜", "link": "/tools/hot-ranking"},
				{"name": "实时资讯", "link": "/tools/ai-news"},
			},
		},
		{
			"key":   "menu-list",
			"title": "列表菜单",
			"type":  "list",
			"icon":  "/icons/sidebar/office.svg",
			"items": []map[string]interface{}{
				{"name": "设计工具", "link": "#design"},
				{"name": "图片处理", "link": "#image"},
				{"name": "办公工具", "link": "#office"},
				{"name": "开发工具", "link": "#dev"},
			},
		},
		{
			"key":   "menu-image",
			"title": "图片菜单",
			"type":  "image",
			"icon":  "/icons/sidebar/image.svg",
			"items": []map[string]interface{}{
				{"name": "AI抠图", "link": "/tools/photo/background", "image": "/icons/sidebar/image.svg"},
				{"name": "视频压缩", "link": "/tools/video/compress", "image": "/icons/sidebar/video.svg"},
				{"name": "PDF压缩", "link": "/tools/pdf-compress", "image": "/icons/sidebar/office.svg"},
			},
		},
		{
			"key":   "menu-category",
			"title": "分类菜单",
			"type":  "category",
			"icon":  "/icons/sidebar/ai.svg",
			"items": []map[string]interface{}{
				{"name": "AI工具箱", "link": "/tools/ai/toolbox", "category": "AI", "desc": "智能问答/写作/图像"},
				{"name": "设计工具", "link": "#design", "category": "设计", "desc": "配色/阴影/布局"},
				{"name": "开发工具", "link": "#dev", "category": "开发", "desc": "JSON/正则/编码"},
			},
		},
	}
}

/**
 * 函数说明：返回侧边栏底部链接默认配置，供运营后台未配置时兜底渲染
 */
func getDefaultToolsSidebarBottomLinks() []map[string]interface{} {
	return []map[string]interface{}{
		{"name": "更新记录", "link": "/changelog"},
		{"name": "意见反馈", "link": "https://uiedtool.com/"},
		{"name": "关于我们", "link": "/about"},
	}
}

/**
 * 函数说明：返回 AI 工具箱页侧栏默认菜单，供运营后台未配置时兜底渲染
 */
func getDefaultToolsAiToolboxSidebarMenus() []map[string]interface{} {
	return []map[string]interface{}{
		{"name": "AI精选工具", "link": "#ai-highlight"},
		{"name": "AI分组总览", "link": "#ai-groups"},
	}
}

/**
 * 函数说明：返回更新记录页顶部快捷链接默认配置，供运营后台未配置时兜底渲染
 */
func getDefaultToolsChangelogHeaderLinks() []map[string]interface{} {
	return []map[string]interface{}{
		{"name": "AI学习平台", "link": "https://www.uied.cn/"},
		{"name": "AI免费工具", "link": "https://uiedtool.com"},
		{"name": "AI资讯热榜", "link": "https://hot.uied.cn"},
		{"name": "AI工具导航", "link": "https://hao.uied.cn/ai"},
		{"name": "AI交流群", "link": "https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink"},
		{"name": "AI知识库", "link": "https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink"},
	}
}

/**
 * 函数说明：返回更新记录页顶部说明文案默认值，供运营后台未配置时兜底渲染
 */
func getDefaultToolsChangelogIntroText() string {
	return "UIED-Tools 现已开放主站、Go API 与管理后台源码，持续以免费工具、内容与社区共建获取长期流量。"
}

/**
 * 函数说明：返回更新记录页资料链接默认配置，供运营后台未配置时兜底渲染
 */
func getDefaultToolsChangelogMetaLinks() []map[string]interface{} {
	return []map[string]interface{}{
		{"name": "GitHub 源码仓库", "link": "https://github.com/Tomccc520/UIED-tools"},
		{"name": "提交问题", "link": "https://github.com/Tomccc520/UIED-tools/issues"},
		{"name": "CSDN 博客", "link": "https://blog.csdn.net/Tomdac?spm=1000.2115.3001.5343"},
		{"name": "UIED技术团队", "link": "https://fsuied.com/"},
	}
}

/**
 * 函数说明：返回更新记录页顶部统计说明默认值，供运营后台未配置时兜底渲染
 */
func getDefaultToolsChangelogStatsText() string {
	return "当前版本：3.0.1 全栈开源版 | 当前工具总数：334个 | 最后更新：2026-08-25 14:17"
}

/**
 * 函数说明：返回 AI 对话页顶部快捷链接默认配置，供运营后台未配置时兜底渲染
 */
func getDefaultToolsAiChatHeaderLinks() []map[string]interface{} {
	return getDefaultToolsChangelogHeaderLinks()
}

/**
 * 函数说明：返回 AI 通用工具页顶部快捷链接默认配置，供运营后台未配置时兜底渲染
 */
func getDefaultToolsAiCommonHeaderLinks() []map[string]interface{} {
	return []map[string]interface{}{
		{"name": "每日免费分享最新AI资讯", "link": "https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink"},
		{"name": "AI学习平台", "link": "https://www.uied.cn/"},
		{"name": "AI免费工具uiedtool.com", "link": "https://uiedtool.com"},
		{"name": "AI资讯热榜hot.uied.cn", "link": "https://hot.uied.cn"},
		{"name": "AI工具导航", "link": "https://hao.uied.cn/ai"},
	}
}

/**
 * 函数说明：返回页面级 SEO 默认配置，供首页、更新页、登录页等非工具页统一读取。
 */
func getDefaultToolsSeoPages() []map[string]interface{} {
	return []map[string]interface{}{
		{"path": "/", "title": "首页", "keywords": "tools-web,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计", "description": "tools-web,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计", "image": "/favicon.ico"},
		{"path": "/changelog", "title": "更新日志", "keywords": "UIED-Tools更新日志,版本历史,功能更新", "description": "UIED-Tools的更新日志，记录了所有版本的功能更新和变更信息", "image": "/favicon.ico"},
		{"path": "/user/login", "title": "用户登录", "keywords": "用户登录,QQ登录,微信登录,个人中心", "description": "UIED Tools 用户登录页，支持登录后进入个人中心，管理账号资料与QQ邮箱绑定。", "image": "/favicon.ico"},
		{"path": "/user/center", "title": "个人中心", "keywords": "个人中心,QQ邮箱绑定,用户资料", "description": "UIED Tools 个人中心，支持维护昵称与QQ邮箱绑定信息。", "image": "/favicon.ico"},
		{"path": "/tools/ai/toolbox", "title": "AI工具箱", "keywords": "AI工具箱,AI工具导航,AI工具合集,免费AI工具", "description": "UIED Tools AI工具箱聚合页，按分类整合对话、写作、图像、办公等高频 AI 工具。", "image": "/favicon.ico"},
	}
}

/**
 * 函数说明：输出官网 SEO 分享图地址，兼容旧版 /logo.png 并避免把前端根路径误改为 API 地址。
 */
func normalizeToolsSEOImageForOutput(raw string) string {
	candidate := strings.TrimSpace(raw)
	if candidate == "" || candidate == "/logo.png" || candidate == "/api/logo.png" || candidate == "/uploads/logo.png" || candidate == "/api/uploads/logo.png" {
		return "/favicon.ico"
	}
	lowerCandidate := strings.ToLower(candidate)
	if strings.HasPrefix(lowerCandidate, "http://") || strings.HasPrefix(lowerCandidate, "https://") || strings.HasPrefix(lowerCandidate, "data:image/") {
		return candidate
	}
	if strings.HasPrefix(candidate, "/uploads/") || strings.HasPrefix(candidate, "/api/uploads/") {
		return util.UrlUtil.ToAbsoluteUrl(candidate)
	}
	return candidate
}

/**
 * 函数说明：统一清理页面级 SEO 的旧版分享图地址，保证前端回退图可访问。
 */
func normalizeToolsSEOPagesForOutput(items []map[string]interface{}) []map[string]interface{} {
	for _, item := range items {
		image, _ := item["image"].(string)
		if strings.TrimSpace(image) == "/logo.png" {
			item["image"] = "/favicon.ico"
		}
	}
	return items
}

/**
 * 函数说明：判断逗号分隔配置中是否存在目标值，兼容空格和空字符串。
 */
func hasMultiConfigValue(raw string, target string) bool {
	normalized := strings.TrimSpace(raw)
	if normalized == "" {
		return false
	}
	items := strings.Split(normalized, ",")
	for _, item := range items {
		if strings.TrimSpace(item) == target {
			return true
		}
	}
	return false
}

/**
 * 函数说明：根据微信开放平台 AppID 与回调地址生成登录授权 URL。
 */
func buildWechatAuthorizeUrl(appID string, redirectURL string) string {
	appID = strings.TrimSpace(appID)
	redirectURL = strings.TrimSpace(redirectURL)
	if appID == "" || redirectURL == "" {
		return ""
	}
	return "https://open.weixin.qq.com/connect/qrconnect?appid=" + url.QueryEscape(appID) +
		"&redirect_uri=" + url.QueryEscape(redirectURL) +
		"&response_type=code&scope=snsapi_login&state=uiedtool#wechat_redirect"
}

/**
 * 函数说明：根据 QQ 互联 AppID 与回调地址生成登录授权 URL。
 */
func buildQqAuthorizeUrl(appID string, redirectURL string) string {
	appID = strings.TrimSpace(appID)
	redirectURL = strings.TrimSpace(redirectURL)
	if appID == "" || redirectURL == "" {
		return ""
	}
	return "https://graph.qq.com/oauth2.0/authorize?client_id=" + url.QueryEscape(appID) +
		"&redirect_uri=" + url.QueryEscape(redirectURL) +
		"&response_type=code&scope=get_user_info&state=uiedtool"
}

// Console 控制台数据
func (iSrv indexService) Console() (res map[string]interface{}, e error) {
	// 版本信息
	name, err := util.ConfigUtil.GetVal(iSrv.db, "website", "name", toolsWebsiteNameDefaultValue)
	if e = response.CheckErr(err, "Console Get err"); e != nil {
		return
	}
	version := map[string]interface{}{
		"name":    name,
		"version": config.Config.Version,
		"website": "https://uiedtool.com",
		"based":   "Vue3.x、Arco Design Vue、Go、MySQL",
		"channel": map[string]string{
			"gitee":   "https://gitee.com/tomdac/tool",
			"website": "https://uiedtool.com",
		},
	}
	// 今日数据
	today := map[string]interface{}{
		"time":        "2022-08-11 15:08:29",
		"todayVisits": 10,  // 访问量(人)
		"totalVisits": 100, // 总访问量
		"todaySales":  30,  // 销售额(元)
		"totalSales":  65,  // 总销售额
		"todayOrder":  12,  // 订单量(笔)
		"totalOrder":  255, // 总订单量
		"todayUsers":  120, // 新增用户
		"totalUsers":  360, // 总访用户
	}
	// 访客图表
	now := time.Now()
	var date []string
	for i := 14; i >= 0; i-- {
		date = append(date, now.AddDate(0, 0, -i).Format(core.DateFormat))
	}
	visitor := map[string]interface{}{
		"date": date,
		"list": []int{12, 13, 11, 5, 8, 22, 14, 9, 456, 62, 78, 12, 18, 22, 46},
	}
	return map[string]interface{}{
		"version": version,
		"today":   today,
		"visitor": visitor,
	}, nil
}

// Config 公共配置
func (iSrv indexService) Config() (res map[string]interface{}, e error) {
	website, err := util.ConfigUtil.Get(iSrv.db, "website")
	if e = response.CheckErr(err, "Config Get err"); e != nil {
		return
	}
	loginConfig, err := util.ConfigUtil.Get(iSrv.db, "login")
	if e = response.CheckErr(err, "Config Get login err"); e != nil {
		return
	}
	copyrightStr, err := util.ConfigUtil.GetVal(iSrv.db, "website", "copyright", "")
	if e = response.CheckErr(err, "Config GetVal err"); e != nil {
		return
	}
	var copyright []map[string]string
	if copyrightStr != "" {
		err = util.ToolsUtil.JsonToObj(copyrightStr, &copyright)
		if e = response.CheckErr(err, "Config JsonToObj err"); e != nil {
			return
		}
	} else {
		copyright = []map[string]string{}
	}

	toolsHeaderLinks := parseWebsiteJsonArray(website, "toolsHeaderLinks")
	toolsSiteSlogan := strings.TrimSpace(website["toolsSiteSlogan"])
	if toolsSiteSlogan == "" {
		toolsSiteSlogan = "免费在线工具集"
	}
	toolsSidebarRecommendTitle := strings.TrimSpace(website["toolsSidebarRecommendTitle"])
	if toolsSidebarRecommendTitle == "" {
		toolsSidebarRecommendTitle = "推荐工具"
	}
	toolsSidebarBrandLogo := strings.TrimSpace(website["toolsSidebarBrandLogo"])
	if toolsSidebarBrandLogo != "" {
		lowerToolsSidebarBrandLogo := strings.ToLower(toolsSidebarBrandLogo)
		if !strings.HasPrefix(lowerToolsSidebarBrandLogo, "<svg") && !strings.HasPrefix(lowerToolsSidebarBrandLogo, "data:") {
			toolsSidebarBrandLogo = util.UrlUtil.ToAbsoluteUrl(toolsSidebarBrandLogo)
		}
	}
	toolsSidebarBrandText := strings.TrimSpace(website["toolsSidebarBrandText"])
	if toolsSidebarBrandText == "" {
		toolsSidebarBrandText = toolsWebsiteNameDefaultValue
	}
	toolsFooterIntro := strings.TrimSpace(website["toolsFooterIntro"])
	if toolsFooterIntro == "" {
		toolsFooterIntro = "在线工具平台"
	}
	toolsFooterQuickTitle := strings.TrimSpace(website["toolsFooterQuickTitle"])
	if toolsFooterQuickTitle == "" {
		toolsFooterQuickTitle = "工具快捷入口"
	}
	toolsFooterFriendTitle := strings.TrimSpace(website["toolsFooterFriendTitle"])
	if toolsFooterFriendTitle == "" {
		toolsFooterFriendTitle = "友情链接"
	}
	toolsOfficialMediaTitle := strings.TrimSpace(website["toolsOfficialMediaTitle"])
	if toolsOfficialMediaTitle == "" {
		toolsOfficialMediaTitle = "官方媒体"
	}
	toolsFooterSupportLabel := strings.TrimSpace(website["toolsFooterSupportLabel"])
	if toolsFooterSupportLabel == "" {
		toolsFooterSupportLabel = "技术支持"
	}
	toolsFooterSupportLinks := parseWebsiteJsonArray(website, "toolsFooterSupportLinks")
	toolsFooterRecordLinks := parseWebsiteJsonArray(website, "toolsFooterRecordLinks")
	if len(toolsFooterRecordLinks) == 0 {
		toolsFooterRecordLinks = getDefaultToolsFooterRecordLinks()
	}
	toolsHotTools := parseWebsiteJsonArray(website, "toolsHotTools")
	if len(toolsHotTools) == 0 {
		toolsHotTools = getDefaultToolsHotTools()
	}
	homepageLearningConfig := servicedefaults.NormalizeHomepageLearningConfig(website)
	toolsToolRankingEnabled := strings.TrimSpace(website["toolsToolRankingEnabled"])
	if toolsToolRankingEnabled == "" {
		toolsToolRankingEnabled = "1"
	}
	toolsToolRankingPageTitle := strings.TrimSpace(website["toolsToolRankingPageTitle"])
	if toolsToolRankingPageTitle == "" {
		toolsToolRankingPageTitle = "站内工具使用排行榜"
	}
	toolsToolRankingPageDescription := strings.TrimSpace(website["toolsToolRankingPageDescription"])
	if toolsToolRankingPageDescription == "" {
		toolsToolRankingPageDescription = "这是工具热榜的独立页面，按站内真实访问、开始处理与下载行为聚合，帮助运营快速判断哪些工具最受欢迎。"
	}
	toolsToolRankingDefaultPeriod := strings.TrimSpace(website["toolsToolRankingDefaultPeriod"])
	if toolsToolRankingDefaultPeriod == "" {
		toolsToolRankingDefaultPeriod = "week"
	}
	toolsToolRankingPageLimit := strings.TrimSpace(website["toolsToolRankingPageLimit"])
	if toolsToolRankingPageLimit == "" {
		toolsToolRankingPageLimit = "12"
	}
	toolsToolRankingShowOnHome := strings.TrimSpace(website["toolsToolRankingShowOnHome"])
	if toolsToolRankingShowOnHome == "" {
		toolsToolRankingShowOnHome = "1"
	}
	toolsToolRankingHomeTitle := strings.TrimSpace(website["toolsToolRankingHomeTitle"])
	if toolsToolRankingHomeTitle == "" {
		toolsToolRankingHomeTitle = "本周工具热榜"
	}
	toolsToolRankingHomePeriod := strings.TrimSpace(website["toolsToolRankingHomePeriod"])
	if toolsToolRankingHomePeriod == "" {
		toolsToolRankingHomePeriod = "week"
	}
	toolsToolRankingShowOnSidebar := strings.TrimSpace(website["toolsToolRankingShowOnSidebar"])
	if toolsToolRankingShowOnSidebar == "" {
		toolsToolRankingShowOnSidebar = "1"
	}
	toolsToolRankingSidebarTitle := strings.TrimSpace(website["toolsToolRankingSidebarTitle"])
	if toolsToolRankingSidebarTitle == "" {
		toolsToolRankingSidebarTitle = "本周热榜"
	}
	toolsToolRankingSidebarPeriod := strings.TrimSpace(website["toolsToolRankingSidebarPeriod"])
	if toolsToolRankingSidebarPeriod == "" {
		toolsToolRankingSidebarPeriod = "week"
	}
	toolsBannerSlides := parseWebsiteJsonArray(website, "toolsBannerSlides")
	if len(toolsBannerSlides) == 0 {
		toolsBannerSlides = getDefaultToolsBannerSlides()
	}
	toolsSearchQuickTools := parseWebsiteJsonArray(website, "toolsSearchQuickTools")
	if len(toolsSearchQuickTools) == 0 {
		toolsSearchQuickTools = getDefaultToolsSearchQuickTools()
	}
	toolsSearchProviderLabel := strings.TrimSpace(website["toolsSearchProviderLabel"])
	if toolsSearchProviderLabel == "" {
		toolsSearchProviderLabel = "硅基流动 x 华为云联合 SiliconFlow"
	}
	toolsSearchProviderLink := strings.TrimSpace(website["toolsSearchProviderLink"])
	if toolsSearchProviderLink == "" {
		toolsSearchProviderLink = "https://cloud.siliconflow.cn/i/AZywGNhl"
	}
	toolsSidebarRecommend := parseWebsiteJsonArray(website, "toolsSidebarRecommend")
	toolsSidebarCategoryMenus := parseWebsiteJsonArray(website, "toolsSidebarCategoryMenus")
	if len(toolsSidebarCategoryMenus) == 0 {
		toolsSidebarCategoryMenus = getDefaultToolsSidebarCategoryMenus()
	}
	toolsSidebarMenuBlocks := parseWebsiteJsonArray(website, "toolsSidebarMenuBlocks")
	toolsCategoryTree := parseWebsiteJsonArray(website, "toolsCategoryTree")
	toolsSidebarBottomLinks := parseWebsiteJsonArray(website, "toolsSidebarBottomLinks")
	if len(toolsSidebarBottomLinks) == 0 {
		toolsSidebarBottomLinks = getDefaultToolsSidebarBottomLinks()
	}
	toolsAiToolboxSidebarMenus := parseWebsiteJsonArray(website, "toolsAiToolboxSidebarMenus")
	if len(toolsAiToolboxSidebarMenus) == 0 {
		toolsAiToolboxSidebarMenus = getDefaultToolsAiToolboxSidebarMenus()
	}
	toolsChangelogHeaderLinks := parseWebsiteJsonArray(website, "toolsChangelogHeaderLinks")
	if len(toolsChangelogHeaderLinks) == 0 {
		toolsChangelogHeaderLinks = getDefaultToolsChangelogHeaderLinks()
	}
	toolsChangelogIntroText := strings.TrimSpace(website["toolsChangelogIntroText"])
	if toolsChangelogIntroText == "" {
		toolsChangelogIntroText = getDefaultToolsChangelogIntroText()
	}
	toolsChangelogMetaLinks := parseWebsiteJsonArray(website, "toolsChangelogMetaLinks")
	if len(toolsChangelogMetaLinks) == 0 {
		toolsChangelogMetaLinks = getDefaultToolsChangelogMetaLinks()
	}
	toolsChangelogSplitTitle := strings.TrimSpace(website["toolsChangelogSplitTitle"])
	if toolsChangelogSplitTitle == "" {
		toolsChangelogSplitTitle = "3.0.1 全栈开源说明"
	}
	toolsChangelogSplitDesc := strings.TrimSpace(website["toolsChangelogSplitDesc"])
	if toolsChangelogSplitDesc == "" {
		toolsChangelogSplitDesc = "本版本新增 Go API、Arco Pro 管理后台、数据库脚本与部署工具，并与 Vue 3 主站一起按 MIT 协议开放源码。项目优先服务免费使用、SEO 内容和社区贡献，非必要商业化入口默认不展示。"
	}
	toolsChangelogSplitLink := strings.TrimSpace(website["toolsChangelogSplitLink"])
	if toolsChangelogSplitLink == "" {
		toolsChangelogSplitLink = "https://github.com/Tomccc520/UIED-tools"
	}
	toolsChangelogSplitLinkText := strings.TrimSpace(website["toolsChangelogSplitLinkText"])
	if toolsChangelogSplitLinkText == "" {
		toolsChangelogSplitLinkText = "查看完整源码与部署说明"
	}
	toolsChangelogStatsText := strings.TrimSpace(website["toolsChangelogStatsText"])
	if toolsChangelogStatsText == "" {
		toolsChangelogStatsText = getDefaultToolsChangelogStatsText()
	}
	toolsChangelogTimeline := parseWebsiteJsonArray(website, "toolsChangelogTimeline")
	if len(toolsChangelogTimeline) == 0 {
		toolsChangelogTimeline = servicedefaults.GetToolsChangelogTimelineItems()
	}
	toolsAiChatHeaderLinks := parseWebsiteJsonArray(website, "toolsAiChatHeaderLinks")
	if len(toolsAiChatHeaderLinks) == 0 {
		toolsAiChatHeaderLinks = getDefaultToolsAiChatHeaderLinks()
	}
	toolsAiCommonHeaderLinks := parseWebsiteJsonArray(website, "toolsAiCommonHeaderLinks")
	if len(toolsAiCommonHeaderLinks) == 0 {
		toolsAiCommonHeaderLinks = getDefaultToolsAiCommonHeaderLinks()
	}
	toolsFooterQuickSections := parseWebsiteJsonArray(website, "toolsFooterQuickSections")
	toolsFooterFriendSections := parseWebsiteJsonArray(website, "toolsFooterFriendSections")
	toolsOfficialMediaLinks := parseWebsiteJsonArray(website, "toolsOfficialMediaLinks")
	toolsSeoDefaultTitle := strings.TrimSpace(website["toolsSeoDefaultTitle"])
	toolsSeoDefaultKeywords := strings.TrimSpace(website["toolsSeoDefaultKeywords"])
	if toolsSeoDefaultKeywords == "" {
		toolsSeoDefaultKeywords = "免费在线工具,UIED,UIED-Tools,免费AI工具箱,AI工具,AI工具箱,AI工具大全,AI工具网站,AI工具网站大全,AI工具网站推荐,AI工具网站排行榜"
	}
	toolsSeoDefaultDescription := strings.TrimSpace(website["toolsSeoDefaultDescription"])
	if toolsSeoDefaultDescription == "" {
		toolsSeoDefaultDescription = "UIED免费在线工具大全"
	}
	toolsSeoDefaultImage := strings.TrimSpace(website["toolsSeoDefaultImage"])
	if toolsSeoDefaultImage == "" {
		toolsSeoDefaultImage = "/favicon.ico"
	}
	toolsSeoPages := parseWebsiteJsonArray(website, "toolsSeoPages")
	if len(toolsSeoPages) == 0 {
		toolsSeoPages = getDefaultToolsSeoPages()
	}
	toolsSeoPages = normalizeToolsSEOPagesForOutput(toolsSeoPages)
	frontendLoginEnabled := strings.TrimSpace(loginConfig["frontendLoginEnabled"])
	if frontendLoginEnabled == "" {
		frontendLoginEnabled = "0"
	}
	openOtherAuth := strings.TrimSpace(loginConfig["openOtherAuth"])
	autoLoginAuth := strings.TrimSpace(loginConfig["autoLoginAuth"])
	openWechatAuth := strings.TrimSpace(loginConfig["openWechatAuth"])
	if openWechatAuth == "" {
		if hasMultiConfigValue(autoLoginAuth, "1") {
			openWechatAuth = "1"
		} else {
			openWechatAuth = "0"
		}
	}
	openQqAuth := strings.TrimSpace(loginConfig["openQqAuth"])
	if openQqAuth == "" {
		if hasMultiConfigValue(autoLoginAuth, "2") {
			openQqAuth = "1"
		} else {
			openQqAuth = "0"
		}
	}
	userCenterEnabled := strings.TrimSpace(loginConfig["userCenterEnabled"])
	if userCenterEnabled == "" {
		userCenterEnabled = "0"
	}
	userCenterTitle := strings.TrimSpace(loginConfig["userCenterTitle"])
	if userCenterTitle == "" {
		userCenterTitle = "用户中心"
	}
	userCenterLink := strings.TrimSpace(loginConfig["userCenterLink"])
	dailyGiftPoints := strings.TrimSpace(loginConfig["dailyGiftPoints"])
	if dailyGiftPoints == "" {
		dailyGiftPoints = "50"
	}
	toolConsumePoints := strings.TrimSpace(loginConfig["toolConsumePoints"])
	if toolConsumePoints == "" {
		toolConsumePoints = "1"
	}
	toolConsumeRules := strings.TrimSpace(loginConfig["toolConsumeRules"])
	if toolConsumeRules == "" {
		toolConsumeRules = "[]"
	}
	consumeRiskRules := strings.TrimSpace(loginConfig["consumeRiskRules"])
	if consumeRiskRules == "" {
		consumeRiskRules = `{"perMinute":30,"perHour":600,"perDay":3000}`
	}
	memberEnabled := strings.TrimSpace(loginConfig["memberEnabled"])
	if memberEnabled == "" {
		memberEnabled = "0"
	}
	memberTrialDays := strings.TrimSpace(loginConfig["memberTrialDays"])
	if memberTrialDays == "" {
		memberTrialDays = "0"
	}
	wechatAppId := strings.TrimSpace(loginConfig["wechatAppId"])
	wechatRedirectUrl := strings.TrimSpace(loginConfig["wechatRedirectUrl"])
	qqAppId := strings.TrimSpace(loginConfig["qqAppId"])
	qqRedirectUrl := strings.TrimSpace(loginConfig["qqRedirectUrl"])
	wechatAuthorizeUrl := buildWechatAuthorizeUrl(wechatAppId, wechatRedirectUrl)
	qqAuthorizeUrl := buildQqAuthorizeUrl(qqAppId, qqRedirectUrl)

	return map[string]interface{}{
		"webName":                           website["name"],
		"webLogo":                           util.UrlUtil.ToAbsoluteUrl(website["logo"]),
		"webFavicon":                        util.UrlUtil.ToAbsoluteUrl(website["favicon"]),
		"webBackdrop":                       util.UrlUtil.ToAbsoluteUrl(website["backdrop"]),
		"ossDomain":                         config.Config.PublicUrl,
		"copyright":                         copyright,
		"toolsSiteSlogan":                   toolsSiteSlogan,
		"toolsSidebarRecommendTitle":        toolsSidebarRecommendTitle,
		"toolsSidebarBrandLogo":             toolsSidebarBrandLogo,
		"toolsSidebarBrandText":             toolsSidebarBrandText,
		"toolsFooterIntro":                  toolsFooterIntro,
		"toolsFooterQuickTitle":             toolsFooterQuickTitle,
		"toolsFooterFriendTitle":            toolsFooterFriendTitle,
		"toolsOfficialMediaTitle":           toolsOfficialMediaTitle,
		"toolsFooterSupportLabel":           toolsFooterSupportLabel,
		"toolsFooterSupportLinks":           toolsFooterSupportLinks,
		"toolsFooterRecordLinks":            toolsFooterRecordLinks,
		"toolsHotTools":                     toolsHotTools,
		"toolsHomepageLearningEnabled":      homepageLearningConfig.Enabled,
		"toolsHomepageLearningTitle":        homepageLearningConfig.Title,
		"toolsHomepageLearningRssUrl":       homepageLearningConfig.RssURL,
		"toolsHomepageLearningFilterType":   homepageLearningConfig.FilterType,
		"toolsHomepageLearningCategorySlug": homepageLearningConfig.CategorySlug,
		"toolsHomepageLearningCategoryIds":  homepageLearningConfig.CategoryIDs,
		"toolsHomepageLearningLimit":        homepageLearningConfig.Limit,
		"toolsToolRankingEnabled":           toolsToolRankingEnabled == "1",
		"toolsToolRankingPageTitle":         toolsToolRankingPageTitle,
		"toolsToolRankingPageDescription":   toolsToolRankingPageDescription,
		"toolsToolRankingDefaultPeriod":     toolsToolRankingDefaultPeriod,
		"toolsToolRankingPageLimit":         toolsToolRankingPageLimit,
		"toolsToolRankingShowOnHome":        toolsToolRankingShowOnHome == "1",
		"toolsToolRankingHomeTitle":         toolsToolRankingHomeTitle,
		"toolsToolRankingHomePeriod":        toolsToolRankingHomePeriod,
		"toolsToolRankingShowOnSidebar":     toolsToolRankingShowOnSidebar == "1",
		"toolsToolRankingSidebarTitle":      toolsToolRankingSidebarTitle,
		"toolsToolRankingSidebarPeriod":     toolsToolRankingSidebarPeriod,
		"toolsBannerSlides":                 toolsBannerSlides,
		"toolsHeaderLinks":                  toolsHeaderLinks,
		"toolsSearchQuickTools":             toolsSearchQuickTools,
		"toolsSearchProviderLabel":          toolsSearchProviderLabel,
		"toolsSearchProviderLink":           toolsSearchProviderLink,
		"toolsSidebarRecommend":             toolsSidebarRecommend,
		"toolsSidebarCategoryMenus":         toolsSidebarCategoryMenus,
		"toolsSidebarMenuBlocks":            toolsSidebarMenuBlocks,
		"toolsCategoryTree":                 toolsCategoryTree,
		"toolsSidebarBottomLinks":           toolsSidebarBottomLinks,
		"toolsAiToolboxSidebarMenus":        toolsAiToolboxSidebarMenus,
		"toolsChangelogHeaderLinks":         toolsChangelogHeaderLinks,
		"toolsChangelogIntroText":           toolsChangelogIntroText,
		"toolsChangelogMetaLinks":           toolsChangelogMetaLinks,
		"toolsChangelogSplitTitle":          toolsChangelogSplitTitle,
		"toolsChangelogSplitDesc":           toolsChangelogSplitDesc,
		"toolsChangelogSplitLink":           toolsChangelogSplitLink,
		"toolsChangelogSplitLinkText":       toolsChangelogSplitLinkText,
		"toolsChangelogStatsText":           toolsChangelogStatsText,
		"toolsChangelogTimeline":            toolsChangelogTimeline,
		"toolsAiChatHeaderLinks":            toolsAiChatHeaderLinks,
		"toolsAiCommonHeaderLinks":          toolsAiCommonHeaderLinks,
		"toolsFooterQuickSections":          toolsFooterQuickSections,
		"toolsFooterFriendSections":         toolsFooterFriendSections,
		"toolsOfficialMediaLinks":           toolsOfficialMediaLinks,
		"toolsSeoDefaultTitle":              toolsSeoDefaultTitle,
		"toolsSeoDefaultKeywords":           toolsSeoDefaultKeywords,
		"toolsSeoDefaultDescription":        toolsSeoDefaultDescription,
		"toolsSeoDefaultImage":              normalizeToolsSEOImageForOutput(toolsSeoDefaultImage),
		"toolsSeoPages":                     toolsSeoPages,
		"loginEnabled":                      frontendLoginEnabled == "1",
		"loginOpenOtherAuth":                openOtherAuth == "1",
		"loginOpenWechatAuth":               openWechatAuth == "1",
		"loginOpenQqAuth":                   openQqAuth == "1",
		"loginWechatAppId":                  wechatAppId,
		"loginWechatRedirectUrl":            wechatRedirectUrl,
		"loginWechatAuthorizeUrl":           wechatAuthorizeUrl,
		"loginQqAppId":                      qqAppId,
		"loginQqRedirectUrl":                qqRedirectUrl,
		"loginQqAuthorizeUrl":               qqAuthorizeUrl,
		"userCenterEnabled":                 userCenterEnabled == "1",
		"userCenterTitle":                   userCenterTitle,
		"userCenterLink":                    userCenterLink,
		"loginDailyGiftPoints":              dailyGiftPoints,
		"loginToolConsumePoints":            toolConsumePoints,
		"loginToolConsumeRules":             toolConsumeRules,
		"loginConsumeRiskRules":             consumeRiskRules,
		"loginMemberEnabled":                memberEnabled == "1",
		"loginMemberTrialDays":              memberTrialDays,
	}, nil
}
