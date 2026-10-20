package setting

import (
	"context"
	"encoding/json"
	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	defaults "likeadmin/admin/service/defaults"
	"likeadmin/core/response"
	"likeadmin/util"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

const (
	toolsSiteSloganConfigName               = "toolsSiteSlogan"
	toolsSidebarRecommendTitleConfigName    = "toolsSidebarRecommendTitle"
	toolsSidebarBrandLogoConfigName         = "toolsSidebarBrandLogo"
	toolsSidebarBrandTextConfigName         = "toolsSidebarBrandText"
	toolsSidebarBrandTextDefaultValue       = "UIED-Tools"
	toolsFooterIntroConfigName              = "toolsFooterIntro"
	toolsFooterQuickTitleConfigName         = "toolsFooterQuickTitle"
	toolsFooterFriendTitleConfigName        = "toolsFooterFriendTitle"
	toolsOfficialMediaTitleConfigName       = "toolsOfficialMediaTitle"
	toolsFooterSupportLabelConfigName       = "toolsFooterSupportLabel"
	toolsFooterSupportLinksConfigName       = "toolsFooterSupportLinks"
	toolsFooterRecordLinksConfigName        = "toolsFooterRecordLinks"
	toolsHotToolsConfigName                 = "toolsHotTools"
	toolsBannerSlidesConfigName             = "toolsBannerSlides"
	toolsHeaderLinksConfigName              = "toolsHeaderLinks"
	toolsSearchQuickToolsConfigName         = "toolsSearchQuickTools"
	toolsSearchProviderLabelConfigName      = "toolsSearchProviderLabel"
	toolsSearchProviderLinkConfigName       = "toolsSearchProviderLink"
	toolsSidebarRecommendConfigName         = "toolsSidebarRecommend"
	toolsSidebarCategoryMenusConfigName     = "toolsSidebarCategoryMenus"
	toolsSidebarMenuBlocksConfigName        = "toolsSidebarMenuBlocks"
	toolsCategoryTreeConfigName             = "toolsCategoryTree"
	toolsSidebarBottomLinksConfigName       = "toolsSidebarBottomLinks"
	toolsAiToolboxSidebarMenusConfigName    = "toolsAiToolboxSidebarMenus"
	toolsChangelogHeaderLinksConfigName     = "toolsChangelogHeaderLinks"
	toolsChangelogIntroTextConfigName       = "toolsChangelogIntroText"
	toolsChangelogMetaLinksConfigName       = "toolsChangelogMetaLinks"
	toolsChangelogSplitTitleConfigName      = "toolsChangelogSplitTitle"
	toolsChangelogSplitDescConfigName       = "toolsChangelogSplitDesc"
	toolsChangelogSplitLinkConfigName       = "toolsChangelogSplitLink"
	toolsChangelogSplitLinkTextConfigName   = "toolsChangelogSplitLinkText"
	toolsChangelogStatsTextConfigName       = "toolsChangelogStatsText"
	toolsChangelogTimelineConfigName        = "toolsChangelogTimeline"
	toolsAiChatHeaderLinksConfigName        = "toolsAiChatHeaderLinks"
	toolsAiCommonHeaderLinksConfigName      = "toolsAiCommonHeaderLinks"
	toolsFooterQuickSectionsConfigName      = "toolsFooterQuickSections"
	toolsFooterFriendSectionsConfigName     = "toolsFooterFriendSections"
	toolsOfficialMediaLinksConfigName       = "toolsOfficialMediaLinks"
	toolsSeoDefaultTitleConfigName          = "toolsSeoDefaultTitle"
	toolsSeoDefaultKeywordsConfigName       = "toolsSeoDefaultKeywords"
	toolsSeoDefaultDescriptionConfigName    = "toolsSeoDefaultDescription"
	toolsSeoDefaultImageConfigName          = "toolsSeoDefaultImage"
	toolsSeoPagesConfigName                 = "toolsSeoPages"
	toolsFooterIntroDefaultValue            = "{webName} 是 UIED技术团队运营的 uiedtool.com 在线工具平台"
	toolsHotToolsDefaultJSON                = `[{"title":"Adobe 正版全家桶可用AI","desc":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Gemini3 可用 nanobanana","desc":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"AI学习网站","desc":"每天逛一逛","link":"https://www.uied.cn/category/aigc/ai"},{"title":"免费AI生成PPT","desc":"AI智能生成PPT","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047"},{"title":"AIGC学习网站","desc":"UIED技术团队官网","link":"https://uied.cn/"},{"title":"AIGC工具","desc":"AI智能工具集合","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Midjourney绘画","desc":"AI绘画生成工具","link":"https://nf.video/czybtp/?gid=26"},{"title":"GPT-5.2","desc":"最新版GPT-5.2智能对话工具","link":"https://nf.video/oemcwv/?gid=18"},{"title":"ChatExcel表格","desc":"AI Excel 数据分析辅助工具","link":"https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6"}]`
	toolsBannerSlidesDefaultJSON            = `[{"badge":"推荐","text":"一人企业Vibe Coding社区！","link":"https://fsuied.com","gradient":"linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"},{"badge":"热门","text":"GPT-5.4重回巅峰 智能对话","link":"https://nf.video/mbx1u6/?gid=18","gradient":"linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)"},{"badge":"新品","text":"免费AI编程工具 Trae - 智能编码助手","link":"https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied","gradient":"linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)"},{"badge":"新品","text":"腾讯元宝 智能对话新体验","link":"https://yuanbao.paluai.com/uied","gradient":"linear-gradient(to right,#ffc800,#ffed99,#fff8cc,#ffaa00)"},{"badge":"高效","text":"免费AI生成PPT - 一键生成演示文稿","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047","gradient":"linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)"},{"badge":"特惠","text":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo","gradient":"linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)"},{"badge":"新品","text":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo","gradient":"linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)"}]`
	toolsHeaderLinksDefaultJSON             = `[{"name":"官网首页","link":"https://uiedtool.com/"}]`
	toolsSearchQuickToolsDefaultJSON        = `[{"name":"DeepSeek R1对话","desc":"基于 DeepSeek-R1 推理模型的智能对话","link":"/tools/ai/deepseek-r1"},{"name":"DeepSeek AI对话","desc":"基础智能对话服务","link":"/tools/ai/deepseek"},{"name":"DeepSeek提示词","desc":"专业的 Prompt 提示词指南","link":"/tools/ai/deepseek-prompt"},{"name":"DeepSeek导航","desc":"DeepSeek 模型与工具导航","link":"/tools/ai/deepseek-nav"},{"name":"AI封面设计","desc":"AI智能生成封面图片","link":"/tools/ai-design-cover"},{"name":"AI产品榜","desc":"跳转至 AI 产品导航站","link":"https://hao.uied.cn/"}]`
	toolsSearchProviderLabelDefaultValue    = "硅基流动 x 华为云联合 SiliconFlow"
	toolsSearchProviderLinkDefaultValue     = "https://cloud.siliconflow.cn/i/AZywGNhl"
	toolsSidebarRecommendDefaultJSON        = `[{"name":"热门工具","link":"#recommend-hot"},{"name":"随机推荐","link":"/tools/random-tools"},{"name":"每日热榜","link":"/tools/hot-ranking"},{"name":"每日文章","link":"https://hot.uied.cn/"},{"name":"实时资讯","link":"/tools/ai-news"},{"name":"AI产品榜","link":"https://hao.uied.cn/"}]`
	toolsSidebarCategoryMenusDefaultJSON    = `[{"key":"ai","title":"AI工具箱","cateTitle":"AI工具箱","link":"/tools/ai/toolbox","icon":"/icons/sidebar/ai.svg"},{"key":"design","title":"设计工具","cateTitle":"设计工具","icon":"/icons/sidebar/design.svg"},{"key":"image","title":"图片处理","cateTitle":"图片处理","icon":"/icons/sidebar/image.svg"},{"key":"office","title":"办公工具","cateTitle":"办公工具","icon":"/icons/sidebar/office.svg"},{"key":"daily","title":"生活常用","cateTitle":"生活常用","icon":"/icons/sidebar/daily.svg"},{"key":"copywriting","title":"文案工具","cateTitle":"文案工具","icon":"/icons/sidebar/copywriting.svg"},{"key":"psychology","title":"潜能测试","cateTitle":"潜能测试","icon":"/icons/sidebar/psychology.svg"},{"key":"video","title":"剪辑工具","cateTitle":"剪辑工具","icon":"/icons/sidebar/video.svg"},{"key":"dev","title":"开发工具","cateTitle":"开发工具","icon":"/icons/sidebar/dev.svg"},{"key":"slacking","title":"摸鱼工具","cateTitle":"摸鱼工具","icon":"/icons/sidebar/slacking.svg"},{"key":"efficiency","title":"效率工具","cateTitle":"效率工具","icon":"/icons/sidebar/efficiency.svg"}]`
	toolsSidebarMenuBlocksDefaultJSON       = `[]`
	toolsSidebarBottomLinksDefaultJSON      = `[{"name":"更新记录","link":"/changelog"},{"name":"意见反馈","link":"https://uiedtool.com/"},{"name":"关于我们","link":"/about"}]`
	toolsAiToolboxSidebarMenusDefaultJSON   = `[{"name":"AI精选工具","link":"#ai-highlight"},{"name":"AI分组总览","link":"#ai-groups"}]`
	toolsChangelogHeaderLinksDefaultJSON    = `[{"name":"AI学习平台","link":"https://www.uied.cn/"},{"name":"AI免费工具","link":"https://uiedtool.com"},{"name":"AI资讯热榜","link":"https://hot.uied.cn"},{"name":"AI工具导航","link":"https://hao.uied.cn/ai"},{"name":"AI交流群","link":"https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink"},{"name":"AI知识库","link":"https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink"}]`
	toolsChangelogIntroTextDefaultValue     = "UIED-Tools 现已开放主站、Go API 与管理后台源码，持续以免费工具、内容与社区共建获取长期流量。"
	toolsChangelogMetaLinksDefaultJSON      = `[{"name":"GitHub 源码仓库","link":"https://github.com/Tomccc520/UIED-tools"},{"name":"提交问题","link":"https://github.com/Tomccc520/UIED-tools/issues"},{"name":"CSDN 博客","link":"https://blog.csdn.net/Tomdac?spm=1000.2115.3001.5343"},{"name":"UIED技术团队","link":"https://fsuied.com/"}]`
	toolsChangelogSplitTitleDefaultValue    = "3.0.4 全栈开源说明"
	toolsChangelogSplitDescDefaultValue     = "本版本新增 Go API、Arco Pro 管理后台、数据库脚本与部署工具，并与 Vue 3 主站一起按 MIT 协议开放源码。项目优先服务免费使用、SEO 内容和社区贡献，非必要商业化入口默认不展示。"
	toolsChangelogSplitLinkDefaultValue     = "https://github.com/Tomccc520/UIED-tools"
	toolsChangelogSplitLinkTextDefaultValue = "查看完整源码与部署说明"
	toolsChangelogStatsTextDefaultValue     = "当前版本：3.0.4 全栈开源版 | 当前工具总数：334个 | 最后更新：2026-10-20"
	toolsAiChatHeaderLinksDefaultJSON       = `[{"name":"AI学习平台","link":"https://www.uied.cn/"},{"name":"AI免费工具","link":"https://uiedtool.com"},{"name":"AI资讯热榜","link":"https://hot.uied.cn"},{"name":"AI工具导航","link":"https://hao.uied.cn/ai"},{"name":"AI交流群","link":"https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink"},{"name":"AI知识库","link":"https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink"}]`
	toolsAiCommonHeaderLinksDefaultJSON     = `[{"name":"每日免费分享最新AI资讯","link":"https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink"},{"name":"AI学习平台","link":"https://www.uied.cn/"},{"name":"AI免费工具uiedtool.com","link":"https://uiedtool.com"},{"name":"AI资讯热榜hot.uied.cn","link":"https://hot.uied.cn"},{"name":"AI工具导航","link":"https://hao.uied.cn/ai"}]`
	toolsFooterSupportLinksDefaultJSON      = `[{"name":"uiedtool.com","link":"https://uiedtool.com/"},{"name":"UIED技术团队","link":"https://fsuied.com"}]`
	toolsFooterRecordLinksDefaultJSON       = `[{"name":"粤ICP备2022056875号","link":"https://beian.miit.gov.cn/"},{"name":"网站地图","link":"/sitemap.xml"}]`
	toolsFooterQuickSectionsDefaultJSON     = `[{"title":"设计","items":[{"name":"色彩对比度","link":"/tools/design/contrast-checker"},{"name":"CSS阴影","link":"/tools/design/box-shadow"},{"name":"黄金比例","link":"/tools/design/golden-ratio"},{"name":"Blob生成器","link":"/tools/design/blob-maker"},{"name":"玻璃拟态","link":"/tools/design/glassmorphism"}]},{"title":"图像","items":[{"name":"图片压缩","link":"/tools/image-compress"},{"name":"二维码生成","link":"/tools/qrcode"},{"name":"图片切割","link":"/tools/img-cut"},{"name":"图片处理","link":"/tools/signimage"},{"name":"GIF压缩","link":"/tools/gif-compress"}]},{"title":"PDF","items":[{"name":"图片转PDF","link":"/tools/img-to-pdf"},{"name":"PDF转图片","link":"/tools/pdf-to-images"},{"name":"PDF合并","link":"/tools/pdf-merge"},{"name":"PDF分割","link":"/tools/pdf-split"}]},{"title":"文本","items":[{"name":"文本对比","link":"/tools/diff"},{"name":"Markdown编辑","link":"/tools/markdown"},{"name":"字数统计","link":"/tools/wordcount"}]},{"title":"开发","items":[{"name":"JSON转换","link":"/tools/json"},{"name":"正则测试","link":"/tools/reg"},{"name":"时间戳","link":"/tools/timetran"}]},{"title":"文案","items":[{"name":"疯狂星期四","link":"/tools/copywriting/kfc"},{"name":"今日诗词","link":"/tools/copywriting/daily-poem"},{"name":"舔狗日记","link":"/tools/copywriting/dog-diary"},{"name":"朋友圈文案","link":"/tools/copywriting/moments"}]}]`
	toolsFooterFriendSectionsDefaultJSON    = `[{"title":"官方入口","items":[{"name":"官网首页","link":"https://uiedtool.com/"},{"name":"AI工具箱","link":"https://uiedtool.com/tools/ai/toolbox"},{"name":"视频工具","link":"https://uiedtool.com/tools/video"},{"name":"更新日志","link":"https://uiedtool.com/changelog"}]},{"title":"社区内容","items":[{"name":"AI资讯","link":"https://hot.uied.cn/"},{"name":"设计导航","link":"https://hao.uied.cn/"},{"name":"UIED技术团队","link":"https://fsuied.com"},{"name":"关于我们","link":"https://uiedtool.com/about"}]}]`
	toolsOfficialMediaLinksDefaultJSON      = `[{"name":"知乎","link":"https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi"},{"name":"小红书","link":"https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83"},{"name":"微博","link":"https://weibo.com/u/7542146005"},{"name":"B站","link":"https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0"}]`
	toolsSeoDefaultKeywordsDefaultValue     = "免费在线工具,UIED,UIED-Tools,免费AI工具箱,AI工具,AI工具箱,AI工具大全,AI工具网站,AI工具网站大全,AI工具网站推荐,AI工具网站排行榜"
	toolsSeoDefaultDescriptionDefaultValue  = "UIED免费在线工具大全"
	toolsSeoDefaultImageDefaultValue        = "/favicon.ico"
	toolsSeoPagesDefaultJSON                = `[{"path":"/","title":"首页","keywords":"tools-web,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计","description":"tools-web,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计","image":"/favicon.ico"},{"path":"/changelog","title":"更新日志","keywords":"UIED-Tools更新日志,版本历史,功能更新","description":"UIED-Tools的更新日志，记录了所有版本的功能更新和变更信息","image":"/favicon.ico"},{"path":"/user/login","title":"用户登录","keywords":"用户登录,QQ登录,微信登录,个人中心","description":"UIED Tools 用户登录页，支持登录后进入个人中心，管理账号资料与QQ邮箱绑定。","image":"/favicon.ico"},{"path":"/user/center","title":"个人中心","keywords":"个人中心,QQ邮箱绑定,用户资料","description":"UIED Tools 个人中心，支持维护昵称与QQ邮箱绑定信息。","image":"/favicon.ico"},{"path":"/tools/ai/toolbox","title":"AI工具箱","keywords":"AI工具箱,AI工具导航,AI工具合集,免费AI工具","description":"UIED Tools AI工具箱聚合页，按分类整合对话、写作、图像、办公等高频 AI 工具。","image":"/favicon.ico"}]`
)

var (
	toolsInlineSvgRegex   = regexp.MustCompile(`(?is)<svg[\s\S]*?</svg>`)
	toolsInlineGroupRegex = regexp.MustCompile(`(?is)<g[\s\S]*?</g>`)
)

type ISettingWebsiteService interface {
	Detail() (res map[string]string, e error)
	Save(wsReq req.SettingWebsiteReq) (e error)
	SyncToolsCatalogSeed(syncReq req.SettingWebsiteCatalogSyncReq) (res map[string]interface{}, e error)
}

// NewSettingWebsiteService 初始化
func NewSettingWebsiteService(db *gorm.DB) ISettingWebsiteService {
	return &settingWebsiteService{db: db}
}

// settingWebsiteService 网站信息配置服务实现类
type settingWebsiteService struct {
	db *gorm.DB
}

type websiteToolsCatalogSyncCategoryItem struct {
	List []websiteToolsCatalogSyncSubCategoryItem `json:"list"`
}

type websiteToolsCatalogSyncSubCategoryItem struct {
	List []websiteToolsCatalogSyncToolItem `json:"list"`
}

type websiteToolsCatalogSyncToolItem struct {
	ToolKey       string   `json:"toolKey"`
	Title         string   `json:"title"`
	ConsumePoints *float64 `json:"consumePoints"`
	MemberFree    *bool    `json:"memberFree"`
	Status        *float64 `json:"status"`
	Sort          *float64 `json:"sort"`
	Remark        string   `json:"remark"`
}

/**
 * 函数说明：标准化热门工具配置，空值/空数组/非法JSON统一回退默认配置
 */
func normalizeHotToolsConfig(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return toolsHotToolsDefaultJSON
	}

	var items []map[string]interface{}
	if err := util.ToolsUtil.JsonToObj(trimmed, &items); err != nil {
		return toolsHotToolsDefaultJSON
	}
	if len(items) == 0 {
		return toolsHotToolsDefaultJSON
	}
	return trimmed
}

/**
 * 函数说明：标准化 tools 布局数组配置，空值/空数组/非法JSON统一回退默认配置
 */
func normalizeToolsLayoutArrayConfig(raw string, defaultJSON string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" || trimmed == "[]" {
		return defaultJSON
	}

	var items []map[string]interface{}
	if err := util.ToolsUtil.JsonToObj(trimmed, &items); err != nil {
		return defaultJSON
	}
	if len(items) == 0 {
		return defaultJSON
	}
	return trimmed
}

/**
 * 函数说明：标准化 tools 侧栏菜单样式模块配置，空值/空数组/非法JSON统一回退默认模块。
 */
func normalizeToolsSidebarMenuBlocksConfig(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" || trimmed == "[]" {
		return toolsSidebarMenuBlocksDefaultJSON
	}

	var items []map[string]interface{}
	if err := util.ToolsUtil.JsonToObj(trimmed, &items); err != nil {
		return toolsSidebarMenuBlocksDefaultJSON
	}
	if len(items) == 0 {
		return toolsSidebarMenuBlocksDefaultJSON
	}
	return trimmed
}

/**
 * 函数说明：标准化 tools 工具分类树配置，允许空数组并在非法 JSON 时回退为 []
 */
func normalizeToolsCategoryTreeConfig(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "[]"
	}

	var items []map[string]interface{}
	if err := util.ToolsUtil.JsonToObj(trimmed, &items); err != nil {
		return "[]"
	}
	return trimmed
}

/**
 * 函数说明：定位 tools-web 根目录，确保后台接口触发同步时能找到根仓脚本。
 */
func resolveToolsProjectRoot() (string, error) {
	currentDir, err := os.Getwd()
	if err != nil {
		return "", err
	}
	candidateList := []string{currentDir}
	for i := 0; i < 6; i++ {
		lastItem := candidateList[len(candidateList)-1]
		parentDir := filepath.Dir(lastItem)
		if parentDir == lastItem {
			break
		}
		candidateList = append(candidateList, parentDir)
	}
	for _, candidateDir := range candidateList {
		scriptPath := filepath.Join(candidateDir, "scripts", "dev", "sync-frontend-tool-menus-to-backend.mjs")
		if _, statErr := os.Stat(scriptPath); statErr == nil {
			return candidateDir, nil
		}
	}
	return "", os.ErrNotExist
}

/**
 * 函数说明：统计当前工具主数据中的分类、工具和策略覆盖数量，便于后台批量同步后即时回显。
 */
func summarizeToolsCategoryTree(raw string) map[string]interface{} {
	var categoryList []websiteToolsCatalogSyncCategoryItem
	if err := json.Unmarshal([]byte(normalizeToolsCategoryTreeConfig(raw)), &categoryList); err != nil {
		return map[string]interface{}{
			"categoryCount":          0,
			"subCategoryCount":       0,
			"toolCount":              0,
			"explicitToolKeyCount":   0,
			"strategyFieldToolCount": 0,
		}
	}

	categoryCount := len(categoryList)
	subCategoryCount := 0
	toolCount := 0
	explicitToolKeyCount := 0
	strategyFieldToolCount := 0

	for _, category := range categoryList {
		subCategoryCount += len(category.List)
		for _, subCategory := range category.List {
			toolCount += len(subCategory.List)
			for _, tool := range subCategory.List {
				if strings.TrimSpace(tool.ToolKey) != "" {
					explicitToolKeyCount++
				}
				if tool.ConsumePoints != nil || tool.MemberFree != nil || tool.Status != nil {
					strategyFieldToolCount++
				}
			}
		}
	}

	return map[string]interface{}{
		"categoryCount":          categoryCount,
		"subCategoryCount":       subCategoryCount,
		"toolCount":              toolCount,
		"explicitToolKeyCount":   explicitToolKeyCount,
		"strategyFieldToolCount": strategyFieldToolCount,
	}
}

/**
 * 函数说明：根据工具主数据生成登录积分策略规则，只同步显式配置了策略字段的工具，避免把全部工具一次性写入策略中心。
 */
func buildToolConsumeRulesFromCategoryTree(raw string) (string, int, error) {
	var categoryList []websiteToolsCatalogSyncCategoryItem
	if err := json.Unmarshal([]byte(normalizeToolsCategoryTreeConfig(raw)), &categoryList); err != nil {
		return "[]", 0, err
	}

	ruleList := make([]toolConsumeRuleConfigItem, 0)
	seen := make(map[string]bool)
	for _, category := range categoryList {
		for _, subCategory := range category.List {
			for _, tool := range subCategory.List {
				toolKey := normalizeToolKeyForRule(tool.ToolKey)
				if toolKey == "" || seen[toolKey] {
					continue
				}
				if tool.ConsumePoints == nil && tool.MemberFree == nil && tool.Status == nil {
					continue
				}
				seen[toolKey] = true

				consumePoints := 1
				if tool.ConsumePoints != nil {
					consumePoints = normalizeNonNegativeInt(int(*tool.ConsumePoints))
				}
				memberFree := 1
				if tool.MemberFree != nil && !*tool.MemberFree {
					memberFree = 0
				}
				status := 1
				if tool.Status != nil {
					status = normalizeBinaryFlag(int(*tool.Status))
				}
				sortValue := len(ruleList) + 1
				if tool.Sort != nil {
					sortValue = normalizeNonNegativeInt(int(*tool.Sort))
				}

				ruleList = append(ruleList, toolConsumeRuleConfigItem{
					ToolKey:       toolKey,
					Name:          strings.TrimSpace(tool.Title),
					ConsumePoints: consumePoints,
					MemberFree:    memberFree,
					Status:        status,
					Sort:          sortValue,
					Remark:        strings.TrimSpace(tool.Remark),
				})
			}
		}
	}

	buf, err := json.Marshal(ruleList)
	if err != nil {
		return "[]", 0, err
	}
	return string(buf), len(ruleList), nil
}

/**
 * 函数说明：统一处理侧栏品牌 Logo 配置输出，优先使用独立配置，未配置时回退站点 Logo。
 */
func normalizeToolsSidebarBrandLogoForOutput(raw string, fallback string) string {
	candidate := strings.TrimSpace(raw)
	if candidate == "" {
		candidate = strings.TrimSpace(fallback)
	}
	if candidate == "" {
		return ""
	}
	inlineSvg := extractToolsInlineSvgLogo(candidate)
	if inlineSvg != "" {
		return inlineSvg
	}
	lowerCandidate := strings.ToLower(candidate)
	if strings.HasPrefix(lowerCandidate, "data:image/") {
		return candidate
	}
	return util.UrlUtil.ToAbsoluteUrl(candidate)
}

/**
 * 函数说明：输出官网 SEO 分享图地址，站内根路径保持原样，上传资源才转为后端绝对地址。
 */
func normalizeToolsSEOImageForOutput(raw string) string {
	candidate := strings.TrimSpace(raw)
	if candidate == "" || candidate == "/logo.png" || candidate == "/api/logo.png" || candidate == "/uploads/logo.png" || candidate == "/api/uploads/logo.png" {
		return toolsSeoDefaultImageDefaultValue
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
 * 函数说明：统一处理侧栏品牌 Logo 入库存储，图片地址转相对路径，内联 SVG 保持原样。
 */
func normalizeToolsSidebarBrandLogoForStorage(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	inlineSvg := extractToolsInlineSvgLogo(trimmed)
	if inlineSvg != "" {
		return inlineSvg
	}
	if strings.HasPrefix(strings.ToLower(trimmed), "data:image/") {
		return trimmed
	}
	return util.UrlUtil.ToRelativeUrl(trimmed)
}

/**
 * 函数说明：解码常见 HTML 实体，兼容后台文本域中被转义的 SVG 代码。
 */
func decodeToolsHtmlEntities(raw string) string {
	if raw == "" {
		return ""
	}
	replacer := strings.NewReplacer(
		"&lt;", "<",
		"&gt;", ">",
		"&quot;", "\"",
		"&#34;", "\"",
		"&#39;", "'",
		"&apos;", "'",
		"&amp;", "&",
	)
	return replacer.Replace(raw)
}

/**
 * 函数说明：从任意输入中提取可用的内联 SVG，支持 `<svg>...</svg>` 与 `<g>...</g>` 片段。
 */
func extractToolsInlineSvgLogo(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}

	candidateList := []string{trimmed}
	decoded := strings.TrimSpace(decodeToolsHtmlEntities(trimmed))
	if decoded != "" && decoded != trimmed {
		candidateList = append(candidateList, decoded)
	}
	/**
	 * 函数说明：兼容历史错误值（如 /api/uploads/%3Csvg...）并尝试 URL 解码恢复 SVG。
	 */
	if unescaped, err := url.QueryUnescape(trimmed); err == nil {
		unescaped = strings.TrimSpace(unescaped)
		if unescaped != "" && unescaped != trimmed {
			candidateList = append(candidateList, unescaped)
		}
	}

	for _, candidate := range candidateList {
		if candidate == "" {
			continue
		}
		if svgMatch := toolsInlineSvgRegex.FindString(candidate); svgMatch != "" {
			return strings.TrimSpace(svgMatch)
		}
		if groupMatch := toolsInlineGroupRegex.FindString(candidate); groupMatch != "" {
			return `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">` + strings.TrimSpace(groupMatch) + `</svg>`
		}
	}
	return ""
}

// Detail 获取网站信息
func (wSrv settingWebsiteService) Detail() (res map[string]string, e error) {
	data, err := util.ConfigUtil.Get(wSrv.db, "website")
	if e = response.CheckErr(err, "Detail Get err"); e != nil {
		return
	}

	toolsHeaderLinks := normalizeToolsLayoutArrayConfig(data[toolsHeaderLinksConfigName], toolsHeaderLinksDefaultJSON)
	toolsSearchQuickTools := normalizeToolsLayoutArrayConfig(data[toolsSearchQuickToolsConfigName], toolsSearchQuickToolsDefaultJSON)
	toolsSearchProviderLabel := strings.TrimSpace(data[toolsSearchProviderLabelConfigName])
	if toolsSearchProviderLabel == "" {
		toolsSearchProviderLabel = toolsSearchProviderLabelDefaultValue
	}
	toolsSearchProviderLink := strings.TrimSpace(data[toolsSearchProviderLinkConfigName])
	if toolsSearchProviderLink == "" {
		toolsSearchProviderLink = toolsSearchProviderLinkDefaultValue
	}
	toolsSiteSlogan := data[toolsSiteSloganConfigName]
	if toolsSiteSlogan == "" {
		toolsSiteSlogan = "免费在线工具集"
	}
	toolsSidebarRecommendTitle := data[toolsSidebarRecommendTitleConfigName]
	if toolsSidebarRecommendTitle == "" {
		toolsSidebarRecommendTitle = "推荐工具"
	}
	toolsSidebarBrandLogo := normalizeToolsSidebarBrandLogoForOutput(data[toolsSidebarBrandLogoConfigName], "")
	toolsSidebarBrandText := strings.TrimSpace(data[toolsSidebarBrandTextConfigName])
	if toolsSidebarBrandText == "" {
		toolsSidebarBrandText = toolsSidebarBrandTextDefaultValue
	}
	toolsFooterIntro := data[toolsFooterIntroConfigName]
	if toolsFooterIntro == "" {
		toolsFooterIntro = toolsFooterIntroDefaultValue
	}
	toolsFooterQuickTitle := data[toolsFooterQuickTitleConfigName]
	if toolsFooterQuickTitle == "" {
		toolsFooterQuickTitle = "工具快捷入口"
	}
	toolsFooterFriendTitle := data[toolsFooterFriendTitleConfigName]
	if toolsFooterFriendTitle == "" {
		toolsFooterFriendTitle = "友情链接"
	}
	toolsOfficialMediaTitle := data[toolsOfficialMediaTitleConfigName]
	if toolsOfficialMediaTitle == "" {
		toolsOfficialMediaTitle = "官方媒体"
	}
	toolsFooterSupportLabel := data[toolsFooterSupportLabelConfigName]
	if toolsFooterSupportLabel == "" {
		toolsFooterSupportLabel = "技术支持"
	}
	toolsFooterSupportLinks := normalizeToolsLayoutArrayConfig(data[toolsFooterSupportLinksConfigName], toolsFooterSupportLinksDefaultJSON)
	toolsFooterRecordLinks := normalizeToolsLayoutArrayConfig(data[toolsFooterRecordLinksConfigName], toolsFooterRecordLinksDefaultJSON)
	toolsHotTools := normalizeHotToolsConfig(data[toolsHotToolsConfigName])
	toolsBannerSlides := normalizeToolsLayoutArrayConfig(data[toolsBannerSlidesConfigName], toolsBannerSlidesDefaultJSON)
	toolsSidebarRecommend := normalizeToolsLayoutArrayConfig(data[toolsSidebarRecommendConfigName], toolsSidebarRecommendDefaultJSON)
	toolsSidebarCategoryMenus := normalizeToolsLayoutArrayConfig(data[toolsSidebarCategoryMenusConfigName], toolsSidebarCategoryMenusDefaultJSON)
	toolsSidebarMenuBlocks := normalizeToolsSidebarMenuBlocksConfig(data[toolsSidebarMenuBlocksConfigName])
	toolsCategoryTree := normalizeToolsCategoryTreeConfig(data[toolsCategoryTreeConfigName])
	toolsSidebarBottomLinks := normalizeToolsLayoutArrayConfig(data[toolsSidebarBottomLinksConfigName], toolsSidebarBottomLinksDefaultJSON)
	toolsAiToolboxSidebarMenus := normalizeToolsLayoutArrayConfig(data[toolsAiToolboxSidebarMenusConfigName], toolsAiToolboxSidebarMenusDefaultJSON)
	toolsChangelogHeaderLinks := normalizeToolsLayoutArrayConfig(data[toolsChangelogHeaderLinksConfigName], toolsChangelogHeaderLinksDefaultJSON)
	toolsChangelogIntroText := strings.TrimSpace(data[toolsChangelogIntroTextConfigName])
	if toolsChangelogIntroText == "" {
		toolsChangelogIntroText = toolsChangelogIntroTextDefaultValue
	}
	toolsChangelogMetaLinks := normalizeToolsLayoutArrayConfig(data[toolsChangelogMetaLinksConfigName], toolsChangelogMetaLinksDefaultJSON)
	toolsChangelogSplitTitle := strings.TrimSpace(data[toolsChangelogSplitTitleConfigName])
	if toolsChangelogSplitTitle == "" {
		toolsChangelogSplitTitle = toolsChangelogSplitTitleDefaultValue
	}
	toolsChangelogSplitDesc := strings.TrimSpace(data[toolsChangelogSplitDescConfigName])
	if toolsChangelogSplitDesc == "" {
		toolsChangelogSplitDesc = toolsChangelogSplitDescDefaultValue
	}
	toolsChangelogSplitLink := strings.TrimSpace(data[toolsChangelogSplitLinkConfigName])
	if toolsChangelogSplitLink == "" {
		toolsChangelogSplitLink = toolsChangelogSplitLinkDefaultValue
	}
	toolsChangelogSplitLinkText := strings.TrimSpace(data[toolsChangelogSplitLinkTextConfigName])
	if toolsChangelogSplitLinkText == "" {
		toolsChangelogSplitLinkText = toolsChangelogSplitLinkTextDefaultValue
	}
	toolsChangelogStatsText := strings.TrimSpace(data[toolsChangelogStatsTextConfigName])
	if toolsChangelogStatsText == "" {
		toolsChangelogStatsText = toolsChangelogStatsTextDefaultValue
	}
	toolsChangelogStatsText = strings.ReplaceAll(toolsChangelogStatsText, "当前工具总数：333个", "当前工具总数：334个")
	toolsChangelogTimeline := defaults.NormalizeToolsChangelogTimelineJSON(
		normalizeToolsLayoutArrayConfig(data[toolsChangelogTimelineConfigName], defaults.GetToolsChangelogTimelineJSON()),
	)
	toolsAiChatHeaderLinks := normalizeToolsLayoutArrayConfig(data[toolsAiChatHeaderLinksConfigName], toolsAiChatHeaderLinksDefaultJSON)
	toolsAiCommonHeaderLinks := normalizeToolsLayoutArrayConfig(data[toolsAiCommonHeaderLinksConfigName], toolsAiCommonHeaderLinksDefaultJSON)
	toolsFooterQuickSections := normalizeToolsLayoutArrayConfig(data[toolsFooterQuickSectionsConfigName], toolsFooterQuickSectionsDefaultJSON)
	toolsFooterFriendSections := normalizeToolsLayoutArrayConfig(data[toolsFooterFriendSectionsConfigName], toolsFooterFriendSectionsDefaultJSON)
	toolsOfficialMediaLinks := normalizeToolsLayoutArrayConfig(data[toolsOfficialMediaLinksConfigName], toolsOfficialMediaLinksDefaultJSON)
	toolsSeoDefaultTitle := strings.TrimSpace(data[toolsSeoDefaultTitleConfigName])
	toolsSeoDefaultKeywords := strings.TrimSpace(data[toolsSeoDefaultKeywordsConfigName])
	if toolsSeoDefaultKeywords == "" {
		toolsSeoDefaultKeywords = toolsSeoDefaultKeywordsDefaultValue
	}
	toolsSeoDefaultDescription := strings.TrimSpace(data[toolsSeoDefaultDescriptionConfigName])
	if toolsSeoDefaultDescription == "" {
		toolsSeoDefaultDescription = toolsSeoDefaultDescriptionDefaultValue
	}
	toolsSeoDefaultImage := strings.TrimSpace(data[toolsSeoDefaultImageConfigName])
	if toolsSeoDefaultImage == "" {
		toolsSeoDefaultImage = toolsSeoDefaultImageDefaultValue
	}
	toolsSeoPages := normalizeToolsLayoutArrayConfig(data[toolsSeoPagesConfigName], toolsSeoPagesDefaultJSON)
	homepageLearningConfig := defaults.NormalizeHomepageLearningConfig(data)
	homepageLearningValues := defaults.HomepageLearningConfigToWebsiteValues(homepageLearningConfig)

	return map[string]string{
		"name":                                               data["name"],
		"logo":                                               util.UrlUtil.ToAbsoluteUrl(data["logo"]),
		"favicon":                                            util.UrlUtil.ToAbsoluteUrl(data["favicon"]),
		"backdrop":                                           util.UrlUtil.ToAbsoluteUrl(data["backdrop"]),
		"shopName":                                           data["shopName"],
		"shopLogo":                                           util.UrlUtil.ToAbsoluteUrl(data["shopLogo"]),
		toolsSiteSloganConfigName:                            toolsSiteSlogan,
		toolsSidebarRecommendTitleConfigName:                 toolsSidebarRecommendTitle,
		toolsSidebarBrandLogoConfigName:                      toolsSidebarBrandLogo,
		toolsSidebarBrandTextConfigName:                      toolsSidebarBrandText,
		toolsFooterIntroConfigName:                           toolsFooterIntro,
		toolsFooterQuickTitleConfigName:                      toolsFooterQuickTitle,
		toolsFooterFriendTitleConfigName:                     toolsFooterFriendTitle,
		toolsOfficialMediaTitleConfigName:                    toolsOfficialMediaTitle,
		toolsFooterSupportLabelConfigName:                    toolsFooterSupportLabel,
		toolsFooterSupportLinksConfigName:                    toolsFooterSupportLinks,
		toolsFooterRecordLinksConfigName:                     toolsFooterRecordLinks,
		toolsHotToolsConfigName:                              toolsHotTools,
		toolsBannerSlidesConfigName:                          toolsBannerSlides,
		toolsHeaderLinksConfigName:                           toolsHeaderLinks,
		toolsSearchQuickToolsConfigName:                      toolsSearchQuickTools,
		toolsSearchProviderLabelConfigName:                   toolsSearchProviderLabel,
		toolsSearchProviderLinkConfigName:                    toolsSearchProviderLink,
		toolsSidebarRecommendConfigName:                      toolsSidebarRecommend,
		toolsSidebarCategoryMenusConfigName:                  toolsSidebarCategoryMenus,
		toolsSidebarMenuBlocksConfigName:                     toolsSidebarMenuBlocks,
		toolsCategoryTreeConfigName:                          toolsCategoryTree,
		toolsSidebarBottomLinksConfigName:                    toolsSidebarBottomLinks,
		toolsAiToolboxSidebarMenusConfigName:                 toolsAiToolboxSidebarMenus,
		toolsChangelogHeaderLinksConfigName:                  toolsChangelogHeaderLinks,
		toolsChangelogIntroTextConfigName:                    toolsChangelogIntroText,
		toolsChangelogMetaLinksConfigName:                    toolsChangelogMetaLinks,
		toolsChangelogSplitTitleConfigName:                   toolsChangelogSplitTitle,
		toolsChangelogSplitDescConfigName:                    toolsChangelogSplitDesc,
		toolsChangelogSplitLinkConfigName:                    toolsChangelogSplitLink,
		toolsChangelogSplitLinkTextConfigName:                toolsChangelogSplitLinkText,
		toolsChangelogStatsTextConfigName:                    toolsChangelogStatsText,
		toolsChangelogTimelineConfigName:                     toolsChangelogTimeline,
		toolsAiChatHeaderLinksConfigName:                     toolsAiChatHeaderLinks,
		toolsAiCommonHeaderLinksConfigName:                   toolsAiCommonHeaderLinks,
		toolsFooterQuickSectionsConfigName:                   toolsFooterQuickSections,
		toolsFooterFriendSectionsConfigName:                  toolsFooterFriendSections,
		toolsOfficialMediaLinksConfigName:                    toolsOfficialMediaLinks,
		toolsSeoDefaultTitleConfigName:                       toolsSeoDefaultTitle,
		toolsSeoDefaultKeywordsConfigName:                    toolsSeoDefaultKeywords,
		toolsSeoDefaultDescriptionConfigName:                 toolsSeoDefaultDescription,
		toolsSeoDefaultImageConfigName:                       normalizeToolsSEOImageForOutput(toolsSeoDefaultImage),
		toolsSeoPagesConfigName:                              toolsSeoPages,
		defaults.ToolsHomepageLearningEnabledConfigName:      homepageLearningValues[defaults.ToolsHomepageLearningEnabledConfigName],
		defaults.ToolsHomepageLearningTitleConfigName:        homepageLearningValues[defaults.ToolsHomepageLearningTitleConfigName],
		defaults.ToolsHomepageLearningRssURLConfigName:       homepageLearningValues[defaults.ToolsHomepageLearningRssURLConfigName],
		defaults.ToolsHomepageLearningFilterTypeConfigName:   homepageLearningValues[defaults.ToolsHomepageLearningFilterTypeConfigName],
		defaults.ToolsHomepageLearningCategorySlugConfigName: homepageLearningValues[defaults.ToolsHomepageLearningCategorySlugConfigName],
		defaults.ToolsHomepageLearningCategoryIDsConfigName:  homepageLearningValues[defaults.ToolsHomepageLearningCategoryIDsConfigName],
		defaults.ToolsHomepageLearningLimitConfigName:        homepageLearningValues[defaults.ToolsHomepageLearningLimitConfigName],
	}, nil
}

/**
 * 函数说明：触发根仓前端工具主数据同步脚本，仅更新工具分类树与可选积分策略。
 */
func (wSrv settingWebsiteService) SyncToolsCatalogSeed(syncReq req.SettingWebsiteCatalogSyncReq) (res map[string]interface{}, e error) {
	projectRoot, err := resolveToolsProjectRoot()
	if e = response.CheckErr(err, "Sync tools project root err"); e != nil {
		return
	}

	scriptPath := filepath.Join(projectRoot, "scripts", "dev", "sync-frontend-tool-menus-to-backend.mjs")
	commandArgs := []string{scriptPath, "--catalog-only"}
	if syncReq.Force == 1 {
		commandArgs = append(commandArgs, "--force")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	command := exec.CommandContext(ctx, "node", commandArgs...)
	command.Dir = projectRoot
	outputBytes, err := command.CombinedOutput()
	outputText := strings.TrimSpace(string(outputBytes))
	if ctx.Err() == context.DeadlineExceeded {
		e = response.CheckErr(ctx.Err(), "Sync tools catalog seed timeout")
		return
	}
	if e = response.CheckErr(err, "Sync tools catalog seed err"); e != nil {
		if outputText != "" {
			e = response.CheckErr(err, outputText)
		}
		return
	}

	currentConfig, getErr := util.ConfigUtil.Get(wSrv.db, "website")
	if e = response.CheckErr(getErr, "Sync tools catalog seed get website config err"); e != nil {
		return
	}

	summary := summarizeToolsCategoryTree(currentConfig[toolsCategoryTreeConfigName])
	summary["force"] = syncReq.Force == 1
	if syncReq.SyncToolConsumeRules == 1 {
		toolConsumeRules, ruleCount, buildErr := buildToolConsumeRulesFromCategoryTree(currentConfig[toolsCategoryTreeConfigName])
		if e = response.CheckErr(buildErr, "Sync tools catalog seed build consume rules err"); e != nil {
			return
		}
		if setErr := util.ConfigUtil.Set(wSrv.db, loginConfigType, loginConfigToolConsumeRulesKey, toolConsumeRules); setErr != nil {
			e = response.CheckErr(setErr, "Sync tools catalog seed set consume rules err")
			return
		}
		summary["toolConsumeRuleCount"] = ruleCount
	} else {
		summary["toolConsumeRuleCount"] = 0
	}
	summary["output"] = outputText
	return summary, nil
}

type websiteConfigUpdate struct {
	name  string
	value string
}

// buildWebsiteConfigUpdates 函数说明：显式列出可写配置字段，只规范化本次提交的非空指针；未传字段不读取、不写回，显式空字符串仍参与保存。
func buildWebsiteConfigUpdates(wsReq req.SettingWebsiteReq) []websiteConfigUpdate {
	updates := make([]websiteConfigUpdate, 0, 55)
	// 函数说明：将已提交字段规范化后追加为更新；nil 表示保持数据库原值。
	appendUpdate := func(name string, value *string, normalize func(string) string) {
		if value == nil {
			return
		}
		normalizedValue := *value
		if normalize != nil {
			normalizedValue = normalize(normalizedValue)
		}
		updates = append(updates, websiteConfigUpdate{name: name, value: normalizedValue})
	}
	appendUpdate("name", wsReq.Name, nil)
	appendUpdate("logo", wsReq.Logo, util.UrlUtil.ToRelativeUrl)
	appendUpdate("favicon", wsReq.Favicon, util.UrlUtil.ToRelativeUrl)
	appendUpdate("backdrop", wsReq.Backdrop, util.UrlUtil.ToRelativeUrl)
	appendUpdate("shopName", wsReq.ShopName, nil)
	appendUpdate("shopLogo", wsReq.ShopLogo, util.UrlUtil.ToRelativeUrl)
	appendUpdate(toolsSiteSloganConfigName, wsReq.ToolsSiteSlogan, strings.TrimSpace)
	appendUpdate(toolsSidebarRecommendTitleConfigName, wsReq.ToolsSidebarRecommendTitle, strings.TrimSpace)
	appendUpdate(toolsSidebarBrandLogoConfigName, wsReq.ToolsSidebarBrandLogo, normalizeToolsSidebarBrandLogoForStorage)
	appendUpdate(toolsSidebarBrandTextConfigName, wsReq.ToolsSidebarBrandText, strings.TrimSpace)
	appendUpdate(toolsFooterIntroConfigName, wsReq.ToolsFooterIntro, nil)
	appendUpdate(toolsFooterQuickTitleConfigName, wsReq.ToolsFooterQuickTitle, nil)
	appendUpdate(toolsFooterFriendTitleConfigName, wsReq.ToolsFooterFriendTitle, nil)
	appendUpdate(toolsOfficialMediaTitleConfigName, wsReq.ToolsOfficialMediaTitle, nil)
	appendUpdate(toolsFooterSupportLabelConfigName, wsReq.ToolsFooterSupportLabel, nil)
	appendUpdate(toolsFooterSupportLinksConfigName, wsReq.ToolsFooterSupportLinks, nil)
	appendUpdate(toolsFooterRecordLinksConfigName, wsReq.ToolsFooterRecordLinks, nil)
	appendUpdate(toolsHotToolsConfigName, wsReq.ToolsHotTools, normalizeHotToolsConfig)
	appendUpdate(toolsBannerSlidesConfigName, wsReq.ToolsBannerSlides, func(value string) string { return normalizeToolsLayoutArrayConfig(value, toolsBannerSlidesDefaultJSON) })
	appendUpdate(toolsHeaderLinksConfigName, wsReq.ToolsHeaderLinks, nil)
	appendUpdate(toolsSearchQuickToolsConfigName, wsReq.ToolsSearchQuickTools, func(value string) string {
		return normalizeToolsLayoutArrayConfig(value, toolsSearchQuickToolsDefaultJSON)
	})
	appendUpdate(toolsSearchProviderLabelConfigName, wsReq.ToolsSearchProviderLabel, strings.TrimSpace)
	appendUpdate(toolsSearchProviderLinkConfigName, wsReq.ToolsSearchProviderLink, strings.TrimSpace)
	appendUpdate(toolsSidebarRecommendConfigName, wsReq.ToolsSidebarRecommend, nil)
	appendUpdate(toolsSidebarCategoryMenusConfigName, wsReq.ToolsSidebarCategoryMenus, nil)
	appendUpdate(toolsSidebarMenuBlocksConfigName, wsReq.ToolsSidebarMenuBlocks, normalizeToolsSidebarMenuBlocksConfig)
	appendUpdate(toolsCategoryTreeConfigName, wsReq.ToolsCategoryTree, normalizeToolsCategoryTreeConfig)
	appendUpdate(toolsSidebarBottomLinksConfigName, wsReq.ToolsSidebarBottomLinks, nil)
	appendUpdate(toolsAiToolboxSidebarMenusConfigName, wsReq.ToolsAiToolboxSidebarMenus, nil)
	appendUpdate(toolsChangelogHeaderLinksConfigName, wsReq.ToolsChangelogHeaderLinks, func(value string) string {
		return normalizeToolsLayoutArrayConfig(value, toolsChangelogHeaderLinksDefaultJSON)
	})
	appendUpdate(toolsChangelogIntroTextConfigName, wsReq.ToolsChangelogIntroText, strings.TrimSpace)
	appendUpdate(toolsChangelogMetaLinksConfigName, wsReq.ToolsChangelogMetaLinks, func(value string) string {
		return normalizeToolsLayoutArrayConfig(value, toolsChangelogMetaLinksDefaultJSON)
	})
	appendUpdate(toolsChangelogSplitTitleConfigName, wsReq.ToolsChangelogSplitTitle, strings.TrimSpace)
	appendUpdate(toolsChangelogSplitDescConfigName, wsReq.ToolsChangelogSplitDesc, strings.TrimSpace)
	appendUpdate(toolsChangelogSplitLinkConfigName, wsReq.ToolsChangelogSplitLink, strings.TrimSpace)
	appendUpdate(toolsChangelogSplitLinkTextConfigName, wsReq.ToolsChangelogSplitLinkText, strings.TrimSpace)
	appendUpdate(toolsChangelogStatsTextConfigName, wsReq.ToolsChangelogStatsText, func(value string) string {
		return strings.ReplaceAll(
			strings.TrimSpace(value),
			"当前工具总数：333个",
			"当前工具总数：334个",
		)
	})
	appendUpdate(toolsChangelogTimelineConfigName, wsReq.ToolsChangelogTimeline, func(value string) string {
		return defaults.NormalizeToolsChangelogTimelineJSON(
			normalizeToolsLayoutArrayConfig(
				value,
				defaults.GetToolsChangelogTimelineJSON(),
			),
		)
	})
	appendUpdate(toolsAiChatHeaderLinksConfigName, wsReq.ToolsAiChatHeaderLinks, func(value string) string {
		return normalizeToolsLayoutArrayConfig(value, toolsAiChatHeaderLinksDefaultJSON)
	})
	appendUpdate(toolsAiCommonHeaderLinksConfigName, wsReq.ToolsAiCommonHeaderLinks, func(value string) string {
		return normalizeToolsLayoutArrayConfig(value, toolsAiCommonHeaderLinksDefaultJSON)
	})
	appendUpdate(toolsFooterQuickSectionsConfigName, wsReq.ToolsFooterQuickSections, nil)
	appendUpdate(toolsFooterFriendSectionsConfigName, wsReq.ToolsFooterFriendSections, nil)
	appendUpdate(toolsOfficialMediaLinksConfigName, wsReq.ToolsOfficialMediaLinks, nil)
	appendUpdate(toolsSeoDefaultTitleConfigName, wsReq.ToolsSeoDefaultTitle, strings.TrimSpace)
	appendUpdate(toolsSeoDefaultKeywordsConfigName, wsReq.ToolsSeoDefaultKeywords, strings.TrimSpace)
	appendUpdate(toolsSeoDefaultDescriptionConfigName, wsReq.ToolsSeoDefaultDescription, strings.TrimSpace)
	appendUpdate(toolsSeoDefaultImageConfigName, wsReq.ToolsSeoDefaultImage, func(value string) string { return util.UrlUtil.ToRelativeUrl(strings.TrimSpace(value)) })
	appendUpdate(toolsSeoPagesConfigName, wsReq.ToolsSeoPages, func(value string) string { return normalizeToolsLayoutArrayConfig(value, toolsSeoPagesDefaultJSON) })

	// 函数说明：复用每日学习的默认值和边界规则，但只提取本次提交的键，避免默认值覆盖其它配置。
	learningFields := []struct {
		name  string
		value *string
	}{
		{defaults.ToolsHomepageLearningEnabledConfigName, wsReq.ToolsHomepageLearningEnabled},
		{defaults.ToolsHomepageLearningTitleConfigName, wsReq.ToolsHomepageLearningTitle},
		{defaults.ToolsHomepageLearningRssURLConfigName, wsReq.ToolsHomepageLearningRssURL},
		{defaults.ToolsHomepageLearningFilterTypeConfigName, wsReq.ToolsHomepageLearningFilterType},
		{defaults.ToolsHomepageLearningCategorySlugConfigName, wsReq.ToolsHomepageLearningCategorySlug},
		{defaults.ToolsHomepageLearningCategoryIDsConfigName, wsReq.ToolsHomepageLearningCategoryIDs},
		{defaults.ToolsHomepageLearningLimitConfigName, wsReq.ToolsHomepageLearningLimit},
	}
	learningRaw := make(map[string]string, len(learningFields))
	for _, field := range learningFields {
		if field.value != nil {
			learningRaw[field.name] = *field.value
		}
	}
	if len(learningRaw) > 0 {
		normalized := defaults.HomepageLearningConfigToWebsiteValues(defaults.NormalizeHomepageLearningConfig(learningRaw))
		for _, field := range learningFields {
			if field.value != nil {
				updates = append(updates, websiteConfigUpdate{name: field.name, value: normalized[field.name]})
			}
		}
	}
	return updates
}

// saveWebsiteConfigUpdates 函数说明：将本次请求全部配置放入同一事务，任一字段失败全部回滚；空请求不触发数据库写入。
func saveWebsiteConfigUpdates(db *gorm.DB, updates []websiteConfigUpdate) error {
	if len(updates) == 0 {
		return nil
	}
	return db.Transaction(func(tx *gorm.DB) error {
		for _, update := range updates {
			if err := util.ConfigUtil.Set(tx, "website", update.name, update.value); err != nil {
				return err
			}
		}
		return nil
	})
}

// Save 函数说明：校验并按请求字段白名单事务保存官网配置，禁止用读取时的全量快照回写未提交字段。
func (wSrv settingWebsiteService) Save(wsReq req.SettingWebsiteReq) error {
	if wsReq.ToolsHomepageLearningRssURL != nil && strings.TrimSpace(*wsReq.ToolsHomepageLearningRssURL) != "" {
		if err := defaults.ValidateHomepageLearningRSSURL(*wsReq.ToolsHomepageLearningRssURL); err != nil {
			return response.AssertArgumentError.Make(err.Error())
		}
	}
	return response.CheckErr(saveWebsiteConfigUpdates(wSrv.db, buildWebsiteConfigUpdates(wsReq)), "Save website config err")
}
