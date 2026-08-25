package system

import (
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/schemas/resp"
	settingService "likeadmin/admin/service/setting"
	"likeadmin/config"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/model/system"
	"likeadmin/util"
	"math/rand"
	"runtime/debug"
	"strconv"
	"strings"
	"time"
)

type ISystemLoginService interface {
	Captcha(c *gin.Context) (res resp.SystemCaptchaResp, e error)
	Login(c *gin.Context, req *req.SystemLoginReq) (res resp.SystemLoginResp, e error)
	Logout(req *req.SystemLogoutReq) (e error)
	RecordLoginLog(c *gin.Context, adminId uint, username string, errStr string) (e error)
}

const (
	captchaRedisKeyPrefix      = "admin:login:captcha:"
	captchaExpireSeconds       = 300
	captchaCodeLength          = 4
	loginFailedRedisKeyPrefix  = "admin:login:failed:"
	loginFailedLockMessageMask = "登录失败次数过多，请 %d 秒后再试"
)

// NewSystemLoginService 初始化
func NewSystemLoginService(db *gorm.DB, adminSrv ISystemAuthAdminService) ISystemLoginService {
	return &systemLoginService{db: db, adminSrv: adminSrv}
}

// systemLoginService 系统登录服务实现类
type systemLoginService struct {
	db       *gorm.DB
	adminSrv ISystemAuthAdminService
}

// loadAdminLoginSecurityConfig 函数说明：读取后台登录安全配置，读取失败时降级为默认值并输出日志。
func (loginSrv systemLoginService) loadAdminLoginSecurityConfig() (cfg settingService.AdminLoginSecurityConfig) {
	cfg = settingService.AdminLoginSecurityConfig{
		CaptchaOn:  1,
		FailLimit:  5,
		FailWindow: 900,
	}
	loaded, err := settingService.GetAdminLoginSecurityConfig(loginSrv.db)
	if err != nil {
		core.Logger.Errorf("loadAdminLoginSecurityConfig err: err=[%+v]", err)
		return
	}
	return loaded
}

// Captcha 函数说明：生成后台登录图形验证码并写入 Redis，前端按 captchaKey + captchaCode 提交登录。
func (loginSrv systemLoginService) Captcha(c *gin.Context) (res resp.SystemCaptchaResp, e error) {
	securityCfg := loginSrv.loadAdminLoginSecurityConfig()
	res.CaptchaOn = securityCfg.CaptchaOn
	if securityCfg.CaptchaOn != 1 {
		return
	}
	captchaCode := generateLoginCaptchaCode(captchaCodeLength)
	captchaKey := util.ToolsUtil.MakeToken()
	cacheKey := captchaRedisKeyPrefix + captchaKey
	if ok := util.RedisUtil.Set(cacheKey, captchaCode, captchaExpireSeconds); !ok {
		return res, response.SystemError
	}
	return resp.SystemCaptchaResp{
		CaptchaOn:     1,
		CaptchaKey:    captchaKey,
		CaptchaImage:  buildLoginCaptchaImage(captchaCode),
		ExpireSeconds: captchaExpireSeconds,
	}, nil
}

// Login 登录
func (loginSrv systemLoginService) Login(c *gin.Context, req *req.SystemLoginReq) (res resp.SystemLoginResp, e error) {
	securityCfg := loginSrv.loadAdminLoginSecurityConfig()

	/**
	 * 函数说明：优先检查登录失败锁定状态，避免恶意重复撞库。
	 */
	if lockTtl := loginSrv.getLoginFailedLockTTL(req.Username, c.ClientIP(), securityCfg.FailLimit, securityCfg.FailWindow); lockTtl > 0 {
		e = response.AssertArgumentError.Make(fmt.Sprintf(loginFailedLockMessageMask, lockTtl))
		return
	}

	/**
	 * 函数说明：登录前必须完成图形验证码校验，验证码通过后才进入账号密码校验链路。
	 */
	if securityCfg.CaptchaOn == 1 {
		if e = loginSrv.verifyLoginCaptcha(req.CaptchaKey, req.CaptchaCode); e != nil {
			loginSrv.RecordLoginLog(c, 0, req.Username, e.Error())
			if lockTtl := loginSrv.incrLoginFailedCount(req.Username, c.ClientIP(), securityCfg.FailLimit, securityCfg.FailWindow); lockTtl > 0 {
				e = response.AssertArgumentError.Make(fmt.Sprintf(loginFailedLockMessageMask, lockTtl))
			}
			return
		}
	}

	sysAdmin, err := loginSrv.adminSrv.FindByUsername(req.Username)
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		e = loginSrv.recordFailedLoginAndBuildError(c, 0, req.Username, response.LoginAccountError, securityCfg.FailLimit, securityCfg.FailWindow)
		return
	} else if err != nil {
		core.Logger.Errorf("Login FindByUsername err: err=[%+v]", err)
		if e = loginSrv.RecordLoginLog(c, 0, req.Username, response.Failed.Msg()); e != nil {
			return
		}
		e = response.Failed
		return
	}
	if sysAdmin.IsDelete == 1 {
		e = loginSrv.recordFailedLoginAndBuildError(c, 0, req.Username, response.LoginAccountError, securityCfg.FailLimit, securityCfg.FailWindow)
		return
	}
	if sysAdmin.IsDisable == 1 {
		e = loginSrv.recordFailedLoginAndBuildError(c, sysAdmin.ID, req.Username, response.LoginDisableError, securityCfg.FailLimit, securityCfg.FailWindow)
		return
	}
	md5Pwd := util.ToolsUtil.MakeMd5(req.Password + sysAdmin.Salt)
	if sysAdmin.Password != md5Pwd {
		e = loginSrv.recordFailedLoginAndBuildError(c, sysAdmin.ID, req.Username, response.LoginAccountError, securityCfg.FailLimit, securityCfg.FailWindow)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			switch r.(type) {
			// 自定义类型
			case response.RespType:
				panic(r)
			// 其他类型
			default:
				core.Logger.Errorf("stacktrace from panic: %+v\n%s", r, string(debug.Stack()))
				loginSrv.RecordLoginLog(c, sysAdmin.ID, req.Username, response.Failed.Msg())
				panic(response.Failed)
			}
		}
	}()
	token := util.ToolsUtil.MakeToken()
	adminIdStr := strconv.FormatUint(uint64(sysAdmin.ID), 10)

	//非多处登录
	if sysAdmin.IsMultipoint == 0 {
		sysAdminSetKey := config.AdminConfig.BackstageTokenSet + adminIdStr
		ts := util.RedisUtil.SGet(sysAdminSetKey)
		if len(ts) > 0 {
			var keys []string
			for _, t := range ts {
				keys = append(keys, config.AdminConfig.BackstageTokenKey+t)
			}
			util.RedisUtil.Del(keys...)
		}
		util.RedisUtil.Del(sysAdminSetKey)
		util.RedisUtil.SSet(sysAdminSetKey, token)
	}

	// 缓存登录信息
	util.RedisUtil.Set(config.AdminConfig.BackstageTokenKey+token, adminIdStr, 7200)
	loginSrv.adminSrv.CacheAdminUserByUid(sysAdmin.ID)

	// 更新登录信息
	err = loginSrv.db.Model(&sysAdmin).Updates(
		system.SystemAuthAdmin{LastLoginIp: c.ClientIP(), LastLoginTime: time.Now().Unix()}).Error
	if err != nil {
		if e = loginSrv.RecordLoginLog(c, sysAdmin.ID, req.Username, response.SystemError.Msg()); e != nil {
			return
		}
		if e = response.CheckErr(err, "Login Updates err"); e != nil {
			return
		}
	}
	// 记录登录日志
	if e = loginSrv.RecordLoginLog(c, sysAdmin.ID, req.Username, ""); e != nil {
		return
	}
	// 登录成功后清理失败计数
	loginSrv.clearLoginFailedCount(req.Username, c.ClientIP())
	// 返回登录信息
	return resp.SystemLoginResp{Token: token}, nil
}

// Logout 退出
func (loginSrv systemLoginService) Logout(req *req.SystemLogoutReq) (e error) {
	util.RedisUtil.Del(config.AdminConfig.BackstageTokenKey + req.Token)
	return
}

// RecordLoginLog 记录登录日志
func (loginSrv systemLoginService) RecordLoginLog(c *gin.Context, adminId uint, username string, errStr string) (e error) {
	ua := core.UAParser.Parse(c.GetHeader("user-agent"))
	var status uint8
	if errStr == "" {
		status = 1
	}
	err := loginSrv.db.Create(&system.SystemLogLogin{
		AdminId: adminId, Username: username, Ip: c.ClientIP(), Os: ua.Os.Family,
		Browser: ua.UserAgent.Family, Status: status}).Error
	e = response.CheckErr(err, "RecordLoginLog Create err")
	return
}

// recordFailedLoginAndBuildError 函数说明：统一处理登录失败日志、失败计数与超限文案。
func (loginSrv systemLoginService) recordFailedLoginAndBuildError(c *gin.Context, adminId uint, username string, respType response.RespType, failLimit int, failWindow int) (e error) {
	if e = loginSrv.RecordLoginLog(c, adminId, username, respType.Msg()); e != nil {
		return
	}
	if lockTtl := loginSrv.incrLoginFailedCount(username, c.ClientIP(), failLimit, failWindow); lockTtl > 0 {
		return response.AssertArgumentError.Make(fmt.Sprintf(loginFailedLockMessageMask, lockTtl))
	}
	return respType
}

// verifyLoginCaptcha 函数说明：校验图形验证码并在成功后销毁验证码，避免重放。
func (loginSrv systemLoginService) verifyLoginCaptcha(captchaKey string, captchaCode string) (e error) {
	key := strings.TrimSpace(captchaKey)
	code := strings.ToUpper(strings.TrimSpace(captchaCode))
	if key == "" || code == "" {
		return response.AssertArgumentError.Make("验证码不能为空")
	}
	cacheKey := captchaRedisKeyPrefix + key
	if util.RedisUtil.Exists(cacheKey) == 0 {
		return response.AssertArgumentError.Make("验证码已过期，请刷新后重试")
	}
	cacheCode := strings.ToUpper(strings.TrimSpace(util.RedisUtil.Get(cacheKey)))
	if cacheCode == "" {
		return response.AssertArgumentError.Make("验证码已过期，请刷新后重试")
	}
	if cacheCode != code {
		return response.AssertArgumentError.Make("验证码错误，请重新输入")
	}
	util.RedisUtil.Del(cacheKey)
	return nil
}

// buildLoginFailedCacheKey 函数说明：构建登录失败次数缓存键，按账号+IP维度限流。
func buildLoginFailedCacheKey(username string, clientIP string) string {
	account := strings.ToLower(strings.TrimSpace(username))
	if account == "" {
		account = "unknown"
	}
	ip := strings.TrimSpace(clientIP)
	if ip == "" {
		ip = "0.0.0.0"
	}
	return loginFailedRedisKeyPrefix + util.ToolsUtil.MakeMd5(account+"|"+ip)
}

// incrLoginFailedCount 函数说明：递增登录失败次数，并返回锁定剩余秒数（0 表示未锁定）。
func (loginSrv systemLoginService) incrLoginFailedCount(username string, clientIP string, failLimit int, failWindow int) (lockTtl int) {
	if failLimit < 1 {
		failLimit = 1
	}
	if failWindow < 60 {
		failWindow = 60
	}
	cacheKey := buildLoginFailedCacheKey(username, clientIP)
	count := util.RedisUtil.IncrWithExpire(cacheKey, failWindow)
	if count >= int64(failLimit) {
		lockTtl = util.RedisUtil.TTL(cacheKey)
		if lockTtl <= 0 {
			lockTtl = failWindow
		}
	}
	return
}

// getLoginFailedLockTTL 函数说明：获取当前账号+IP 是否已进入锁定期。
func (loginSrv systemLoginService) getLoginFailedLockTTL(username string, clientIP string, failLimit int, failWindow int) (lockTtl int) {
	if failLimit < 1 {
		failLimit = 1
	}
	if failWindow < 60 {
		failWindow = 60
	}
	cacheKey := buildLoginFailedCacheKey(username, clientIP)
	if util.RedisUtil.Exists(cacheKey) == 0 {
		return 0
	}
	countStr := strings.TrimSpace(util.RedisUtil.Get(cacheKey))
	if countStr == "" {
		return 0
	}
	count, err := strconv.ParseInt(countStr, 10, 64)
	if err != nil {
		return 0
	}
	if count < int64(failLimit) {
		return 0
	}
	lockTtl = util.RedisUtil.TTL(cacheKey)
	if lockTtl <= 0 {
		lockTtl = failWindow
	}
	return
}

// clearLoginFailedCount 函数说明：登录成功后清理失败次数缓存。
func (loginSrv systemLoginService) clearLoginFailedCount(username string, clientIP string) {
	cacheKey := buildLoginFailedCacheKey(username, clientIP)
	util.RedisUtil.Del(cacheKey)
}

// generateLoginCaptchaCode 函数说明：生成易读验证码，避免 0/O、1/I 等易混淆字符。
func generateLoginCaptchaCode(length int) string {
	chars := []rune("23456789ABCDEFGHJKLMNPQRSTUVWXYZ")
	if length <= 0 {
		length = captchaCodeLength
	}
	codeRunes := make([]rune, 0, length)
	for i := 0; i < length; i++ {
		codeRunes = append(codeRunes, chars[rand.Intn(len(chars))])
	}
	return string(codeRunes)
}

// buildLoginCaptchaImage 函数说明：构建 SVG 验证码并返回 dataURL，前端可直接作为 img src 渲染。
func buildLoginCaptchaImage(code string) string {
	const width = 128
	const height = 44
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">`, width, height, width, height))
	sb.WriteString(`<rect width="100%" height="100%" fill="#f7f8ff" rx="8" ry="8"/>`)
	for i := 0; i < 7; i++ {
		sb.WriteString(fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1"/>`,
			rand.Intn(width), rand.Intn(height), rand.Intn(width), rand.Intn(height), randomCaptchaColor(120, 200)))
	}
	runeCodes := []rune(strings.ToUpper(strings.TrimSpace(code)))
	for idx, item := range runeCodes {
		x := 14 + idx*26 + rand.Intn(4)
		y := 30 + rand.Intn(6) - 3
		rotate := rand.Intn(40) - 20
		sb.WriteString(fmt.Sprintf(
			`<text x="%d" y="%d" fill="%s" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="700" transform="rotate(%d %d %d)">%c</text>`,
			x, y, randomCaptchaColor(40, 150), rotate, x, y, item,
		))
	}
	for i := 0; i < 30; i++ {
		sb.WriteString(fmt.Sprintf(`<circle cx="%d" cy="%d" r="%d" fill="%s"/>`,
			rand.Intn(width), rand.Intn(height), rand.Intn(2)+1, randomCaptchaColor(140, 230)))
	}
	sb.WriteString(`</svg>`)
	encoded := base64.StdEncoding.EncodeToString([]byte(sb.String()))
	return "data:image/svg+xml;base64," + encoded
}

// randomCaptchaColor 函数说明：生成验证码绘制颜色，限制颜色范围保证可读性与背景对比。
func randomCaptchaColor(min int, max int) string {
	if min < 0 {
		min = 0
	}
	if max > 255 {
		max = 255
	}
	if max <= min {
		max = min + 1
	}
	r := min + rand.Intn(max-min)
	g := min + rand.Intn(max-min)
	b := min + rand.Intn(max-min)
	return fmt.Sprintf("rgb(%d,%d,%d)", r, g, b)
}
