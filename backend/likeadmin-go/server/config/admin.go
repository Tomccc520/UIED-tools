package config

import "github.com/gin-gonic/gin"

// AdminConfig 后台公共配置
var AdminConfig = adminConfig{
	// 管理缓存键
	BackstageManageKey: "backstage:manage",
	// 角色缓存键
	BackstageRolesKey: "backstage:roles",
	// 令牌缓存键
	BackstageTokenKey: "backstage:token:",
	// 令牌的集合
	BackstageTokenSet: "backstage:token:set:",

	// 免登录验证
	NotLoginUri: []string{
		"system:login",                      // 登录接口
		"system:captcha",                    // 登录验证码
		"common:index:config",               // 配置接口
		"common:index:learning-rss",         // 首页每日学习 RSS 代理
		"common:tool-ranking:list",          // 工具排行榜列表（前台读取）
		"common:tool-ranking:track",         // 工具排行榜埋点（前台写入）
		"common:ai:model:current",           // AI模型当前配置（前台读取）
		"common:ai:matting:internal-config", // 抠图代理内部配置（由独立内部令牌鉴权）
		"common:ai:provider:current",        // AI Provider 当前配置（前台读取）
		"common:ai:provider:chat",           // AI Provider 对话代理（前台工具调用）
		"common:ai:image:current",           // 图片 AI 能力当前配置（前台读取）
		"common:ai:image:proxy",             // 图片 AI 能力代理（前台工具调用）
		"webinfo",                           // 前台网站信息解析接口
	},

	// 免权限验证
	NotAuthUri: []string{
		"system:logout",         // 退出登录
		"system:menu:menus",     // 系统菜单
		"system:menu:route",     // 菜单路由
		"system:admin:upInfo",   // 管理员更新
		"system:admin:self",     // 管理员信息
		"system:role:all",       // 所有角色
		"system:post:all",       // 所有岗位
		"system:dept:list",      // 所有部门
		"setting:dict:type:all", // 所有字典类型
		"setting:dict:data:all", // 所有字典数据
		"article:cate:all",      // 所有文章分类
	},

	// 演示模式白名单
	ShowWhitelistUri: []string{
		"system:login",   // 登录接口
		"system:captcha", // 登录验证码
		"system:logout",  // 退出登录
	},

	// 请求临时数据
	SuperAdminId:   1,
	ReqAdminIdKey:  "admin_id",
	ReqRoleIdKey:   "role",
	ReqUsernameKey: "username",
	ReqNicknameKey: "nickname",
}

type adminConfig struct {
	BackstageManageKey string
	BackstageRolesKey  string
	BackstageTokenKey  string
	BackstageTokenSet  string
	NotLoginUri        []string
	NotAuthUri         []string
	ShowWhitelistUri   []string
	SuperAdminId       uint
	ReqAdminIdKey      string
	ReqRoleIdKey       string
	ReqUsernameKey     string
	ReqNicknameKey     string
}

func (cnf adminConfig) GetAdminId(c *gin.Context) uint {
	adminId, ok := c.Get(cnf.ReqAdminIdKey)
	if !ok {
		return 0
	}
	return adminId.(uint)
}

func (cnf adminConfig) GetRoleId(c *gin.Context) string {
	roleId, ok := c.Get(cnf.ReqRoleIdKey)
	if !ok {
		return ""
	}
	return roleId.(string)
}

func (cnf adminConfig) GetUsername(c *gin.Context) string {
	username, ok := c.Get(cnf.ReqUsernameKey)
	if !ok {
		return ""
	}
	return username.(string)
}

func (cnf adminConfig) GetNickname(c *gin.Context) string {
	nickname, ok := c.Get(cnf.ReqNicknameKey)
	if !ok {
		return ""
	}
	return nickname.(string)
}
