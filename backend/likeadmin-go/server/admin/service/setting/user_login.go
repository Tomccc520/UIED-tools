package setting

import (
	"bytes"
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"gorm.io/gorm"
	"io"
	"likeadmin/admin/schemas/req"
	"likeadmin/core/response"
	"likeadmin/util"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const (
	userConfigType                 = "user"
	userConfigDefaultAvatarKey     = "defaultAvatar"
	loginConfigType                = "login"
	loginConfigFrontendEnabledKey  = "frontendLoginEnabled"
	loginConfigLoginWayKey         = "loginWay"
	loginConfigForceBindMobileKey  = "forceBindMobile"
	loginConfigOpenAgreementKey    = "openAgreement"
	loginConfigOpenOtherAuthKey    = "openOtherAuth"
	loginConfigAutoLoginAuthKey    = "autoLoginAuth"
	loginConfigOpenWechatAuthKey   = "openWechatAuth"
	loginConfigOpenQqAuthKey       = "openQqAuth"
	loginConfigWechatAppIdKey      = "wechatAppId"
	loginConfigWechatAppSecretKey  = "wechatAppSecret"
	loginConfigWechatRedirectKey   = "wechatRedirectUrl"
	loginConfigQqAppIdKey          = "qqAppId"
	loginConfigQqAppKey            = "qqAppKey"
	loginConfigQqRedirectKey       = "qqRedirectUrl"
	loginConfigUserCenterOpenKey   = "userCenterEnabled"
	loginConfigUserCenterTitleKey  = "userCenterTitle"
	loginConfigUserCenterLinkKey   = "userCenterLink"
	loginConfigDailyGiftPointsKey  = "dailyGiftPoints"
	loginConfigToolConsumeKey      = "toolConsumePoints"
	loginConfigToolConsumeRulesKey = "toolConsumeRules"
	loginConfigConsumeRiskRulesKey = "consumeRiskRules"
	loginConfigMemberEnabledKey    = "memberEnabled"
	loginConfigMemberTrialDaysKey  = "memberTrialDays"
	loginConfigMemberPlansKey      = "memberPlans"
	loginConfigPointsPacksKey      = "pointsPacks"
	loginConfigMemberRightsKey     = "memberRightsIntro"
	loginConfigPaymentChannelsKey  = "paymentChannels"
	loginConfigPaymentWechatKey    = "paymentWechatUrl"
	loginConfigPaymentWechatCreate = "paymentWechatCreateApi"
	loginConfigPaymentWechatMchId  = "paymentWechatMchId"
	loginConfigPaymentWechatAppId  = "paymentWechatAppId"
	loginConfigPaymentWechatSerial = "paymentWechatSerialNo"
	loginConfigPaymentWechatV3Key  = "paymentWechatApiV3Key"
	loginConfigPaymentWechatPriKey = "paymentWechatPrivateKey"
	loginConfigPaymentWechatPlatCa = "paymentWechatPlatformCert"
	loginConfigPaymentWechatPlatSN = "paymentWechatPlatformSerialNo"
	loginConfigPaymentWechatPlatET = "paymentWechatPlatformEffectiveTime"
	loginConfigPaymentWechatPlatXP = "paymentWechatPlatformExpireTime"
	loginConfigPaymentWechatSyncAt = "paymentWechatPlatformSyncedAt"
	loginConfigPaymentWechatNotify = "paymentWechatNotifyUrl"
	loginConfigPaymentAlipayKey    = "paymentAlipayUrl"
	loginConfigPaymentAlipayCreate = "paymentAlipayCreateApi"
	loginConfigPaymentSecretKey    = "paymentCallbackSecret"
	loginConfigPaymentRequestKey   = "paymentRequestSecret"
	loginConfigPaymentAuthTypeKey  = "paymentRequestAuthType"
	loginConfigPaymentAuthHeader   = "paymentRequestHeader"
	loginConfigPaymentAuthToken    = "paymentRequestToken"
	loginConfigPaymentTimeoutKey   = "paymentRequestTimeout"
	loginConfigAdminCaptchaOnKey   = "adminLoginCaptchaOn"
	loginConfigAdminFailLimitKey   = "adminLoginFailLimit"
	loginConfigAdminFailWindowKey  = "adminLoginFailWindow"
	defaultLoginWayValue           = "1"
	defaultFrontendLoginValue      = "0"
	defaultForceBindMobileValue    = "0"
	defaultOpenAgreementValue      = "0"
	defaultOpenOtherAuthValue      = "0"
	defaultAutoLoginAuthValue      = "1"
	defaultOpenWechatAuthValue     = "1"
	defaultOpenQqAuthValue         = "0"
	defaultUserCenterOpenValue     = "0"
	defaultUserCenterTitleValue    = "用户中心"
	defaultDailyGiftPointsValue    = "50"
	defaultToolConsumePointsValue  = "1"
	defaultToolConsumeRulesValue   = "[]"
	defaultConsumeRiskRulesValue   = `{"perMinute":30,"perHour":600,"perDay":3000}`
	defaultMemberEnabledValue      = "0"
	defaultMemberTrialDaysValue    = "0"
	defaultMemberRightsValue       = "会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。"
	defaultMemberPlansValue        = `[{"code":"vip_month","name":"VIP月卡","price":29,"memberDays":30,"giftPoints":80,"sort":1,"status":1,"badge":"热卖"},{"code":"vip_quarter","name":"VIP季卡","price":79,"memberDays":90,"giftPoints":300,"sort":2,"status":1,"badge":"推荐"},{"code":"vip_year","name":"VIP年卡","price":299,"memberDays":365,"giftPoints":1500,"sort":3,"status":1,"badge":"省钱"}]`
	defaultPointsPacksValue        = `[{"code":"points_100","name":"100积分包","price":9.9,"points":100,"giftPoints":0,"sort":1,"status":1},{"code":"points_500","name":"500积分包","price":39.9,"points":500,"giftPoints":50,"sort":2,"status":1},{"code":"points_1000","name":"1000积分包","price":69.9,"points":1000,"giftPoints":200,"sort":3,"status":1}]`
	defaultPaymentChannelsValue    = "mock"
	defaultPaymentAuthTypeValue    = "none"
	defaultPaymentAuthHeaderValue  = "X-Payment-Token"
	defaultPaymentTimeoutValue     = "12"
	defaultAdminCaptchaOnValue     = "1"
	defaultAdminFailLimitValue     = "5"
	defaultAdminFailWindowValue    = "900"
	wechatPayPlatformCertAPI       = "https://api.mch.weixin.qq.com/v3/certificates"
)

type ISettingUserService interface {
	Detail() (res map[string]interface{}, e error)
	Save(userReq req.SettingUserSetupReq) (e error)
}

type ISettingLoginService interface {
	Detail() (res map[string]interface{}, e error)
	Save(loginReq req.SettingLoginReq) (e error)
	SyncWechatPlatformCert() (res map[string]interface{}, e error)
}

// AdminLoginSecurityConfig 后台登录安全配置
type AdminLoginSecurityConfig struct {
	CaptchaOn  int // 图形验证码开关 0/1
	FailLimit  int // 登录失败锁定阈值（次数）
	FailWindow int // 登录失败锁定窗口（秒）
}

// buildDefaultAdminLoginSecurityConfig 函数说明：返回后台登录安全默认配置，作为缺省兜底。
func buildDefaultAdminLoginSecurityConfig() AdminLoginSecurityConfig {
	return AdminLoginSecurityConfig{
		CaptchaOn:  1,
		FailLimit:  5,
		FailWindow: 900,
	}
}

// GetAdminLoginSecurityConfig 函数说明：读取后台登录安全配置，供登录接口实时判定验证码和失败锁定策略。
func GetAdminLoginSecurityConfig(db *gorm.DB) (cfg AdminLoginSecurityConfig, e error) {
	cfg = buildDefaultAdminLoginSecurityConfig()
	data, err := util.ConfigUtil.Get(db, loginConfigType)
	if e = response.CheckErr(err, "GetAdminLoginSecurityConfig Get login config err"); e != nil {
		return
	}
	cfg.CaptchaOn = normalizeBinaryFlag(parsePositiveIntWithDefault(data[loginConfigAdminCaptchaOnKey], cfg.CaptchaOn))
	cfg.FailLimit = normalizeIntRangeWithDefault(data[loginConfigAdminFailLimitKey], cfg.FailLimit, 3, 20)
	cfg.FailWindow = normalizeIntRangeWithDefault(data[loginConfigAdminFailWindowKey], cfg.FailWindow, 60, 86400)
	return
}

// NewSettingUserService 初始化
func NewSettingUserService(db *gorm.DB) ISettingUserService {
	return &settingUserService{db: db}
}

// NewSettingLoginService 初始化
func NewSettingLoginService(db *gorm.DB) ISettingLoginService {
	return &settingLoginService{db: db}
}

// settingUserService 用户设置服务
type settingUserService struct {
	db *gorm.DB
}

// settingLoginService 登录设置服务
type settingLoginService struct {
	db *gorm.DB
}

/**
 * 函数说明：工具计费规则配置项（标准化后的结构），用于“按工具覆盖积分策略”。
 */
type toolConsumeRuleConfigItem struct {
	ToolKey       string `json:"toolKey"`
	Name          string `json:"name"`
	ConsumePoints int    `json:"consumePoints"`
	MemberFree    int    `json:"memberFree"`
	Status        int    `json:"status"`
	Sort          int    `json:"sort"`
	Remark        string `json:"remark"`
}

/**
 * 函数说明：工具计费规则原始输入结构（带指针），用于区分“未传值”与“传了0”。
 */
type toolConsumeRuleConfigRawItem struct {
	ToolKey       string `json:"toolKey"`
	Name          string `json:"name"`
	ConsumePoints *int   `json:"consumePoints"`
	MemberFree    *int   `json:"memberFree"`
	Status        *int   `json:"status"`
	Sort          *int   `json:"sort"`
	Remark        string `json:"remark"`
}

/**
 * 函数说明：工具调用风控规则配置结构，控制分钟/小时/每日调用上限。
 */
type consumeRiskRulesConfig struct {
	PerMinute int `json:"perMinute"`
	PerHour   int `json:"perHour"`
	PerDay    int `json:"perDay"`
}

/**
 * 函数说明：兼容字符串/数字/数组输入，统一序列化成逗号分隔字符串。
 */
func normalizeMultiValueString(value any) string {
	switch typed := value.(type) {
	case string:
		return strings.Trim(strings.Join(strings.FieldsFunc(typed, func(r rune) bool {
			return r == ',' || r == ' '
		}), ","), ",")
	case []interface{}:
		list := make([]string, 0, len(typed))
		for _, item := range typed {
			itemText := strings.TrimSpace(normalizeMultiValueString(item))
			if itemText == "" {
				continue
			}
			list = append(list, itemText)
		}
		return strings.Join(list, ",")
	case []string:
		list := make([]string, 0, len(typed))
		for _, item := range typed {
			item = strings.TrimSpace(item)
			if item == "" {
				continue
			}
			list = append(list, item)
		}
		return strings.Join(list, ",")
	case int:
		return strconv.Itoa(typed)
	case int32:
		return strconv.Itoa(int(typed))
	case int64:
		return strconv.FormatInt(typed, 10)
	case float64:
		return strconv.Itoa(int(typed))
	default:
		return ""
	}
}

/**
 * 函数说明：判断逗号分隔字符串中是否包含目标值（兼容空格与空字符串）。
 */
func containsMultiValueItem(value string, target string) bool {
	target = strings.TrimSpace(target)
	if target == "" {
		return false
	}
	items := strings.Split(normalizeMultiValueString(value), ",")
	for _, item := range items {
		if strings.TrimSpace(item) == target {
			return true
		}
	}
	return false
}

/**
 * 函数说明：根据微信/QQ开关构建自动登录方式字段，保持与旧字段 autoLoginAuth 兼容。
 */
func buildAutoLoginAuthByOpenStatus(openWechat int, openQq int, fallback string) string {
	items := make([]string, 0, 2)
	if openWechat == 1 {
		items = append(items, "1")
	}
	if openQq == 1 {
		items = append(items, "2")
	}
	if len(items) > 0 {
		return strings.Join(items, ",")
	}
	return normalizeMultiValueString(fallback)
}

/**
 * 函数说明：将任意整数规范为非负值，避免运营配置出现负积分导致业务异常。
 */
func normalizeNonNegativeInt(value int) int {
	if value < 0 {
		return 0
	}
	return value
}

// parsePositiveIntWithDefault 函数说明：将字符串安全解析为正整数，解析失败时返回默认值。
func parsePositiveIntWithDefault(value string, defaultValue int) int {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return defaultValue
	}
	parsed, err := strconv.Atoi(trimmed)
	if err != nil {
		return defaultValue
	}
	return parsed
}

// normalizeIntRangeWithDefault 函数说明：将配置值规整到指定区间，越界时回落到默认值。
func normalizeIntRangeWithDefault(value string, defaultValue int, min int, max int) int {
	parsed := parsePositiveIntWithDefault(value, defaultValue)
	if parsed < min || parsed > max {
		return defaultValue
	}
	return parsed
}

/**
 * 函数说明：将开关值规整为 0/1，避免配置层写入非法整数。
 */
func normalizeBinaryFlag(value int) int {
	if value == 1 {
		return 1
	}
	return 0
}

/**
 * 函数说明：规范会员试用天数，避免配置异常导致试用时间过长或为负数。
 */
func normalizeMemberTrialDays(value int) int {
	if value < 0 {
		return 0
	}
	if value > 3650 {
		return 3650
	}
	return value
}

/**
 * 函数说明：将数组或对象配置统一序列化为 JSON 字符串，非法值时回退默认值。
 */
func normalizeJSONConfig(value any, fallback string) string {
	switch typed := value.(type) {
	case string:
		trimmed := strings.TrimSpace(typed)
		if trimmed == "" {
			return fallback
		}
		var tmp interface{}
		if err := json.Unmarshal([]byte(trimmed), &tmp); err != nil {
			return fallback
		}
		return trimmed
	default:
		buf, err := json.Marshal(typed)
		if err != nil {
			return fallback
		}
		serialized := strings.TrimSpace(string(buf))
		if serialized == "" || serialized == "null" {
			return fallback
		}
		return serialized
	}
}

/**
 * 函数说明：标准化支付渠道配置，仅允许 mock/wechat_h5/alipay_h5 并去重。
 */
func normalizePaymentChannels(value any) string {
	raw := normalizeMultiValueString(value)
	if raw == "" {
		return defaultPaymentChannelsValue
	}
	allowed := map[string]bool{
		"mock":      true,
		"wechat_h5": true,
		"alipay_h5": true,
	}
	parts := strings.Split(raw, ",")
	list := make([]string, 0, len(parts))
	seen := map[string]bool{}
	for _, part := range parts {
		code := strings.ToLower(strings.TrimSpace(part))
		if !allowed[code] || seen[code] {
			continue
		}
		seen[code] = true
		list = append(list, code)
	}
	if len(list) == 0 {
		return defaultPaymentChannelsValue
	}
	return strings.Join(list, ",")
}

/**
 * 函数说明：标准化支付网关鉴权模式，仅允许 none / bearer / header。
 */
func normalizePaymentRequestAuthType(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "bearer":
		return "bearer"
	case "header":
		return "header"
	default:
		return "none"
	}
}

/**
 * 函数说明：标准化支付网关自定义请求头名称，非法或空值时回退默认值。
 */
func normalizePaymentRequestHeader(raw string) string {
	header := strings.TrimSpace(raw)
	if header == "" {
		return defaultPaymentAuthHeaderValue
	}
	for _, char := range header {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '-' {
			continue
		}
		return defaultPaymentAuthHeaderValue
	}
	return header
}

/**
 * 函数说明：标准化支付网关下单超时秒数，防止配置过小或过大导致网关请求异常。
 */
func normalizePaymentRequestTimeoutSeconds(value int) int {
	if value < 3 {
		return 12
	}
	if value > 60 {
		return 60
	}
	return value
}

type wechatPayCertificateResponse struct {
	Data []wechatPayCertificateItem `json:"data"`
}

type wechatPayCertificateItem struct {
	SerialNo      string `json:"serial_no"`
	EffectiveTime string `json:"effective_time"`
	ExpireTime    string `json:"expire_time"`
	EncryptCert   struct {
		Algorithm      string `json:"algorithm"`
		Nonce          string `json:"nonce"`
		AssociatedData string `json:"associated_data"`
		Ciphertext     string `json:"ciphertext"`
	} `json:"encrypt_certificate"`
}

// parseWechatMerchantPrivateKey 函数说明：解析微信支付商户私钥（支持 PKCS1 / PKCS8）用于请求签名。
func parseWechatMerchantPrivateKey(rawPEM string) (privateKey *rsa.PrivateKey, e error) {
	block, _ := pem.Decode([]byte(strings.TrimSpace(rawPEM)))
	if block == nil {
		return nil, response.AssertArgumentError.Make("微信支付商户私钥格式无效")
	}
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}
	parsed, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, response.AssertArgumentError.Make("微信支付商户私钥解析失败")
	}
	rsaKey, ok := parsed.(*rsa.PrivateKey)
	if !ok {
		return nil, response.AssertArgumentError.Make("微信支付商户私钥必须为 RSA 类型")
	}
	return rsaKey, nil
}

// buildWechatPaySignMessage 函数说明：按微信支付V3规范构造签名明文。
func buildWechatPaySignMessage(method string, canonicalURL string, timestamp string, nonce string, body string) string {
	return strings.Join([]string{
		strings.ToUpper(strings.TrimSpace(method)),
		strings.TrimSpace(canonicalURL),
		strings.TrimSpace(timestamp),
		strings.TrimSpace(nonce),
		body,
	}, "\n") + "\n"
}

// signWechatPayV3Message 函数说明：使用商户私钥对签名明文进行 SHA256withRSA 签名。
func signWechatPayV3Message(privateKey *rsa.PrivateKey, message string) (signature string, e error) {
	digest := sha256.Sum256([]byte(message))
	signatureBytes, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, digest[:])
	if err != nil {
		return "", response.CheckErr(err, "signWechatPayV3Message SignPKCS1v15 err")
	}
	return base64.StdEncoding.EncodeToString(signatureBytes), nil
}

// buildWechatPayAuthorizationValue 函数说明：生成微信支付V3 Authorization 请求头。
func buildWechatPayAuthorizationValue(mchID string, serialNo string, nonce string, timestamp string, signature string) string {
	return fmt.Sprintf(
		`WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",signature="%s",timestamp="%s",serial_no="%s"`,
		strings.TrimSpace(mchID),
		strings.TrimSpace(nonce),
		strings.TrimSpace(signature),
		strings.TrimSpace(timestamp),
		strings.TrimSpace(serialNo),
	)
}

// decryptWechatPayCertificateCiphertext 函数说明：使用 APIv3 Key 解密微信平台证书密文。
func decryptWechatPayCertificateCiphertext(apiV3Key string, associatedData string, nonce string, ciphertext string) (plainText []byte, e error) {
	keyBytes := []byte(strings.TrimSpace(apiV3Key))
	if len(keyBytes) != 32 {
		return nil, response.AssertArgumentError.Make("微信支付 APIv3 密钥长度必须为 32 字节")
	}
	ciphertextBytes, err := base64.StdEncoding.DecodeString(strings.TrimSpace(ciphertext))
	if err != nil {
		return nil, response.AssertArgumentError.Make("微信平台证书密文格式无效")
	}
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return nil, response.CheckErr(err, "decryptWechatPayCertificateCiphertext NewCipher err")
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, response.CheckErr(err, "decryptWechatPayCertificateCiphertext NewGCM err")
	}
	plainBytes, err := gcm.Open(nil, []byte(strings.TrimSpace(nonce)), ciphertextBytes, []byte(strings.TrimSpace(associatedData)))
	if err != nil {
		return nil, response.AssertArgumentError.Make("微信平台证书解密失败，请检查 APIv3 密钥")
	}
	return plainBytes, nil
}

// pickLatestWechatPlatformCertificate 函数说明：从微信平台证书列表中选择“生效时间最新”的证书。
func pickLatestWechatPlatformCertificate(items []wechatPayCertificateItem) (target wechatPayCertificateItem, ok bool) {
	if len(items) == 0 {
		return wechatPayCertificateItem{}, false
	}
	selectedIndex := -1
	var selectedEffectiveTime time.Time
	for idx, item := range items {
		effectiveTimeText := strings.TrimSpace(item.EffectiveTime)
		parsedTime, err := time.Parse(time.RFC3339, effectiveTimeText)
		if err != nil {
			continue
		}
		if selectedIndex < 0 || parsedTime.After(selectedEffectiveTime) {
			selectedIndex = idx
			selectedEffectiveTime = parsedTime
		}
	}
	if selectedIndex < 0 {
		return items[0], true
	}
	return items[selectedIndex], true
}

/**
 * 函数说明：规范工具唯一标识，统一小写+去空格，避免同一工具重复配置多条规则。
 */
func normalizeToolKeyForRule(raw string) string {
	return strings.ToLower(strings.TrimSpace(raw))
}

/**
 * 函数说明：标准化“按工具计费规则”配置，过滤无效项并输出稳定 JSON。
 */
func normalizeToolConsumeRules(value any) string {
	raw := normalizeJSONConfig(value, defaultToolConsumeRulesValue)
	rules := make([]toolConsumeRuleConfigRawItem, 0)
	if err := json.Unmarshal([]byte(raw), &rules); err != nil {
		return defaultToolConsumeRulesValue
	}

	normalized := make([]toolConsumeRuleConfigItem, 0, len(rules))
	seen := make(map[string]bool, len(rules))
	for index, item := range rules {
		toolKey := normalizeToolKeyForRule(item.ToolKey)
		if toolKey == "" || seen[toolKey] {
			continue
		}
		seen[toolKey] = true

		consumePoints := 1
		if item.ConsumePoints != nil {
			consumePoints = normalizeNonNegativeInt(*item.ConsumePoints)
		}
		memberFree := 1
		if item.MemberFree != nil {
			memberFree = normalizeBinaryFlag(*item.MemberFree)
		}
		status := 1
		if item.Status != nil {
			status = normalizeBinaryFlag(*item.Status)
		}
		sortValue := index + 1
		if item.Sort != nil {
			sortValue = normalizeNonNegativeInt(*item.Sort)
		}

		normalized = append(normalized, toolConsumeRuleConfigItem{
			ToolKey:       toolKey,
			Name:          strings.TrimSpace(item.Name),
			ConsumePoints: consumePoints,
			MemberFree:    memberFree,
			Status:        status,
			Sort:          sortValue,
			Remark:        strings.TrimSpace(item.Remark),
		})
	}
	buf, err := json.Marshal(normalized)
	if err != nil {
		return defaultToolConsumeRulesValue
	}
	return string(buf)
}

/**
 * 函数说明：标准化“工具调用风控规则”配置，统一输出分钟/小时/每日上限。
 */
func normalizeConsumeRiskRules(value any) string {
	defaultRules := consumeRiskRulesConfig{
		PerMinute: 30,
		PerHour:   600,
		PerDay:    3000,
	}
	raw := normalizeJSONConfig(value, defaultConsumeRiskRulesValue)
	var rules consumeRiskRulesConfig
	if err := json.Unmarshal([]byte(raw), &rules); err != nil {
		rules = defaultRules
	}
	rules.PerMinute = normalizeNonNegativeInt(rules.PerMinute)
	rules.PerHour = normalizeNonNegativeInt(rules.PerHour)
	rules.PerDay = normalizeNonNegativeInt(rules.PerDay)
	buf, err := json.Marshal(rules)
	if err != nil {
		return defaultConsumeRiskRulesValue
	}
	return string(buf)
}

// Detail 获取用户设置
func (sSrv settingUserService) Detail() (res map[string]interface{}, e error) {
	defaultAvatar, err := util.ConfigUtil.GetVal(sSrv.db, userConfigType, userConfigDefaultAvatarKey, "")
	if e = response.CheckErr(err, "Detail GetVal err"); e != nil {
		return
	}
	defaultAvatar = strings.TrimSpace(defaultAvatar)
	if defaultAvatar != "" {
		defaultAvatar = util.UrlUtil.ToAbsoluteUrl(defaultAvatar)
	}
	return map[string]interface{}{
		"defaultAvatar": defaultAvatar,
	}, nil
}

// Save 保存用户设置
func (sSrv settingUserService) Save(userReq req.SettingUserSetupReq) (e error) {
	defaultAvatar := strings.TrimSpace(userReq.DefaultAvatar)
	if defaultAvatar != "" {
		defaultAvatar = util.UrlUtil.ToRelativeUrl(defaultAvatar)
	}
	err := util.ConfigUtil.Set(sSrv.db, userConfigType, userConfigDefaultAvatarKey, defaultAvatar)
	e = response.CheckErr(err, "Save Set defaultAvatar err")
	return
}

// Detail 获取登录配置
func (lSrv settingLoginService) Detail() (res map[string]interface{}, e error) {
	data, err := util.ConfigUtil.Get(lSrv.db, loginConfigType)
	if e = response.CheckErr(err, "Detail Get login config err"); e != nil {
		return
	}

	frontendLoginEnabled := strings.TrimSpace(data[loginConfigFrontendEnabledKey])
	if frontendLoginEnabled == "" {
		frontendLoginEnabled = defaultFrontendLoginValue
	}
	loginWay := strings.TrimSpace(data[loginConfigLoginWayKey])
	if loginWay == "" {
		loginWay = defaultLoginWayValue
	}
	forceBindMobile := strings.TrimSpace(data[loginConfigForceBindMobileKey])
	if forceBindMobile == "" {
		forceBindMobile = defaultForceBindMobileValue
	}
	openAgreement := strings.TrimSpace(data[loginConfigOpenAgreementKey])
	if openAgreement == "" {
		openAgreement = defaultOpenAgreementValue
	}
	openOtherAuth := strings.TrimSpace(data[loginConfigOpenOtherAuthKey])
	if openOtherAuth == "" {
		openOtherAuth = defaultOpenOtherAuthValue
	}
	autoLoginAuth := strings.TrimSpace(data[loginConfigAutoLoginAuthKey])
	if autoLoginAuth == "" {
		autoLoginAuth = defaultAutoLoginAuthValue
	}
	openWechatAuth := strings.TrimSpace(data[loginConfigOpenWechatAuthKey])
	if openWechatAuth == "" {
		if containsMultiValueItem(autoLoginAuth, "1") {
			openWechatAuth = "1"
		} else {
			openWechatAuth = defaultOpenWechatAuthValue
		}
	}
	openQqAuth := strings.TrimSpace(data[loginConfigOpenQqAuthKey])
	if openQqAuth == "" {
		if containsMultiValueItem(autoLoginAuth, "2") {
			openQqAuth = "1"
		} else {
			openQqAuth = defaultOpenQqAuthValue
		}
	}
	wechatAppId := strings.TrimSpace(data[loginConfigWechatAppIdKey])
	wechatAppSecret := strings.TrimSpace(data[loginConfigWechatAppSecretKey])
	wechatRedirectUrl := strings.TrimSpace(data[loginConfigWechatRedirectKey])
	qqAppId := strings.TrimSpace(data[loginConfigQqAppIdKey])
	qqAppKey := strings.TrimSpace(data[loginConfigQqAppKey])
	qqRedirectUrl := strings.TrimSpace(data[loginConfigQqRedirectKey])
	userCenterEnabled := strings.TrimSpace(data[loginConfigUserCenterOpenKey])
	if userCenterEnabled == "" {
		userCenterEnabled = defaultUserCenterOpenValue
	}
	userCenterTitle := strings.TrimSpace(data[loginConfigUserCenterTitleKey])
	if userCenterTitle == "" {
		userCenterTitle = defaultUserCenterTitleValue
	}
	userCenterLink := strings.TrimSpace(data[loginConfigUserCenterLinkKey])
	dailyGiftPoints := strings.TrimSpace(data[loginConfigDailyGiftPointsKey])
	if dailyGiftPoints == "" {
		dailyGiftPoints = defaultDailyGiftPointsValue
	}
	toolConsumePoints := strings.TrimSpace(data[loginConfigToolConsumeKey])
	if toolConsumePoints == "" {
		toolConsumePoints = defaultToolConsumePointsValue
	}
	toolConsumeRules := strings.TrimSpace(data[loginConfigToolConsumeRulesKey])
	if toolConsumeRules == "" {
		toolConsumeRules = defaultToolConsumeRulesValue
	}
	consumeRiskRules := strings.TrimSpace(data[loginConfigConsumeRiskRulesKey])
	if consumeRiskRules == "" {
		consumeRiskRules = defaultConsumeRiskRulesValue
	}
	memberEnabled := strings.TrimSpace(data[loginConfigMemberEnabledKey])
	if memberEnabled == "" {
		memberEnabled = defaultMemberEnabledValue
	}
	memberTrialDays := strings.TrimSpace(data[loginConfigMemberTrialDaysKey])
	if memberTrialDays == "" {
		memberTrialDays = defaultMemberTrialDaysValue
	}
	memberPlans := strings.TrimSpace(data[loginConfigMemberPlansKey])
	if memberPlans == "" {
		memberPlans = defaultMemberPlansValue
	}
	pointsPacks := strings.TrimSpace(data[loginConfigPointsPacksKey])
	if pointsPacks == "" {
		pointsPacks = defaultPointsPacksValue
	}
	memberRightsIntro := strings.TrimSpace(data[loginConfigMemberRightsKey])
	if memberRightsIntro == "" {
		memberRightsIntro = defaultMemberRightsValue
	}
	paymentChannels := strings.TrimSpace(data[loginConfigPaymentChannelsKey])
	if paymentChannels == "" {
		paymentChannels = defaultPaymentChannelsValue
	}
	paymentWechatUrl := strings.TrimSpace(data[loginConfigPaymentWechatKey])
	paymentWechatCreateApi := strings.TrimSpace(data[loginConfigPaymentWechatCreate])
	paymentWechatMchId := strings.TrimSpace(data[loginConfigPaymentWechatMchId])
	paymentWechatAppId := strings.TrimSpace(data[loginConfigPaymentWechatAppId])
	paymentWechatSerialNo := strings.TrimSpace(data[loginConfigPaymentWechatSerial])
	paymentWechatApiV3Key := strings.TrimSpace(data[loginConfigPaymentWechatV3Key])
	paymentWechatPrivateKey := strings.TrimSpace(data[loginConfigPaymentWechatPriKey])
	paymentWechatPlatformCert := strings.TrimSpace(data[loginConfigPaymentWechatPlatCa])
	paymentWechatPlatformSerialNo := strings.TrimSpace(data[loginConfigPaymentWechatPlatSN])
	paymentWechatPlatformEffectiveTime := strings.TrimSpace(data[loginConfigPaymentWechatPlatET])
	paymentWechatPlatformExpireTime := strings.TrimSpace(data[loginConfigPaymentWechatPlatXP])
	paymentWechatPlatformSyncedAt := strings.TrimSpace(data[loginConfigPaymentWechatSyncAt])
	paymentWechatNotifyUrl := strings.TrimSpace(data[loginConfigPaymentWechatNotify])
	paymentAlipayUrl := strings.TrimSpace(data[loginConfigPaymentAlipayKey])
	paymentAlipayCreateApi := strings.TrimSpace(data[loginConfigPaymentAlipayCreate])
	paymentCallbackSecret := strings.TrimSpace(data[loginConfigPaymentSecretKey])
	paymentRequestSecret := strings.TrimSpace(data[loginConfigPaymentRequestKey])
	paymentRequestAuthType := normalizePaymentRequestAuthType(data[loginConfigPaymentAuthTypeKey])
	if paymentRequestAuthType == "" {
		paymentRequestAuthType = defaultPaymentAuthTypeValue
	}
	paymentRequestHeader := normalizePaymentRequestHeader(data[loginConfigPaymentAuthHeader])
	if strings.TrimSpace(data[loginConfigPaymentAuthHeader]) == "" {
		paymentRequestHeader = defaultPaymentAuthHeaderValue
	}
	paymentRequestToken := strings.TrimSpace(data[loginConfigPaymentAuthToken])
	paymentRequestTimeout := normalizePaymentRequestTimeoutSeconds(parsePositiveIntWithDefault(data[loginConfigPaymentTimeoutKey], 12))
	adminLoginCaptchaOn := strings.TrimSpace(data[loginConfigAdminCaptchaOnKey])
	if adminLoginCaptchaOn == "" {
		adminLoginCaptchaOn = defaultAdminCaptchaOnValue
	}
	adminLoginFailLimit := strings.TrimSpace(data[loginConfigAdminFailLimitKey])
	if adminLoginFailLimit == "" {
		adminLoginFailLimit = defaultAdminFailLimitValue
	}
	adminLoginFailWindow := strings.TrimSpace(data[loginConfigAdminFailWindowKey])
	if adminLoginFailWindow == "" {
		adminLoginFailWindow = defaultAdminFailWindowValue
	}

	return map[string]interface{}{
		"frontendLoginEnabled":               frontendLoginEnabled,
		"loginWay":                           loginWay,
		"forceBindMobile":                    forceBindMobile,
		"openAgreement":                      openAgreement,
		"openOtherAuth":                      openOtherAuth,
		"autoLoginAuth":                      autoLoginAuth,
		"openWechatAuth":                     openWechatAuth,
		"openQqAuth":                         openQqAuth,
		"wechatAppId":                        wechatAppId,
		"wechatAppSecret":                    wechatAppSecret,
		"wechatRedirectUrl":                  wechatRedirectUrl,
		"qqAppId":                            qqAppId,
		"qqAppKey":                           qqAppKey,
		"qqRedirectUrl":                      qqRedirectUrl,
		"userCenterEnabled":                  userCenterEnabled,
		"userCenterTitle":                    userCenterTitle,
		"userCenterLink":                     userCenterLink,
		"dailyGiftPoints":                    dailyGiftPoints,
		"toolConsumePoints":                  toolConsumePoints,
		"toolConsumeRules":                   toolConsumeRules,
		"consumeRiskRules":                   consumeRiskRules,
		"memberEnabled":                      memberEnabled,
		"memberTrialDays":                    memberTrialDays,
		"memberPlans":                        memberPlans,
		"pointsPacks":                        pointsPacks,
		"memberRightsIntro":                  memberRightsIntro,
		"paymentChannels":                    paymentChannels,
		"paymentWechatUrl":                   paymentWechatUrl,
		"paymentWechatCreateApi":             paymentWechatCreateApi,
		"paymentWechatMchId":                 paymentWechatMchId,
		"paymentWechatAppId":                 paymentWechatAppId,
		"paymentWechatSerialNo":              paymentWechatSerialNo,
		"paymentWechatApiV3Key":              paymentWechatApiV3Key,
		"paymentWechatPrivateKey":            paymentWechatPrivateKey,
		"paymentWechatPlatformCert":          paymentWechatPlatformCert,
		"paymentWechatPlatformSerialNo":      paymentWechatPlatformSerialNo,
		"paymentWechatPlatformEffectiveTime": paymentWechatPlatformEffectiveTime,
		"paymentWechatPlatformExpireTime":    paymentWechatPlatformExpireTime,
		"paymentWechatPlatformSyncedAt":      paymentWechatPlatformSyncedAt,
		"paymentWechatNotifyUrl":             paymentWechatNotifyUrl,
		"paymentAlipayUrl":                   paymentAlipayUrl,
		"paymentAlipayCreateApi":             paymentAlipayCreateApi,
		"paymentCallbackSecret":              paymentCallbackSecret,
		"paymentRequestSecret":               paymentRequestSecret,
		"paymentRequestAuthType":             paymentRequestAuthType,
		"paymentRequestHeader":               paymentRequestHeader,
		"paymentRequestToken":                paymentRequestToken,
		"paymentRequestTimeout":              paymentRequestTimeout,
		"adminLoginCaptchaOn":                adminLoginCaptchaOn,
		"adminLoginFailLimit":                adminLoginFailLimit,
		"adminLoginFailWindow":               adminLoginFailWindow,
	}, nil
}

// Save 保存登录配置
func (lSrv settingLoginService) Save(loginReq req.SettingLoginReq) (e error) {
	loginWay := normalizeMultiValueString(loginReq.LoginWay)
	if loginWay == "" {
		loginWay = defaultLoginWayValue
	}
	autoLoginAuth := buildAutoLoginAuthByOpenStatus(loginReq.OpenWechatAuth, loginReq.OpenQqAuth, normalizeMultiValueString(loginReq.AutoLoginAuth))
	if loginReq.OpenOtherAuth == 1 && autoLoginAuth == "" {
		autoLoginAuth = defaultAutoLoginAuthValue
	}
	wechatAppId := strings.TrimSpace(loginReq.WechatAppId)
	wechatAppSecret := strings.TrimSpace(loginReq.WechatAppSecret)
	wechatRedirectUrl := strings.TrimSpace(loginReq.WechatRedirectUrl)
	qqAppId := strings.TrimSpace(loginReq.QqAppId)
	qqAppKey := strings.TrimSpace(loginReq.QqAppKey)
	qqRedirectUrl := strings.TrimSpace(loginReq.QqRedirectUrl)
	userCenterTitle := strings.TrimSpace(loginReq.UserCenterTitle)
	if userCenterTitle == "" {
		userCenterTitle = defaultUserCenterTitleValue
	}
	userCenterLink := strings.TrimSpace(loginReq.UserCenterLink)
	dailyGiftPoints := normalizeNonNegativeInt(loginReq.DailyGiftPoints)
	toolConsumePoints := normalizeNonNegativeInt(loginReq.ToolConsumePoints)
	if toolConsumePoints == 0 {
		toolConsumePoints = 1
	}
	toolConsumeRules := normalizeToolConsumeRules(loginReq.ToolConsumeRules)
	consumeRiskRules := normalizeConsumeRiskRules(loginReq.ConsumeRiskRules)
	memberTrialDays := normalizeMemberTrialDays(loginReq.MemberTrialDays)
	memberPlans := normalizeJSONConfig(loginReq.MemberPlans, defaultMemberPlansValue)
	pointsPacks := normalizeJSONConfig(loginReq.PointsPacks, defaultPointsPacksValue)
	memberRightsIntro := strings.TrimSpace(loginReq.MemberRightsIntro)
	if memberRightsIntro == "" {
		memberRightsIntro = defaultMemberRightsValue
	}
	paymentChannels := normalizePaymentChannels(loginReq.PaymentChannels)
	paymentWechatUrl := strings.TrimSpace(loginReq.PaymentWechatUrl)
	paymentWechatCreateApi := strings.TrimSpace(loginReq.PaymentWechatCreateApi)
	paymentWechatMchId := strings.TrimSpace(loginReq.PaymentWechatMchId)
	paymentWechatAppId := strings.TrimSpace(loginReq.PaymentWechatAppId)
	paymentWechatSerialNo := strings.TrimSpace(loginReq.PaymentWechatSerialNo)
	paymentWechatApiV3Key := strings.TrimSpace(loginReq.PaymentWechatApiV3Key)
	paymentWechatPrivateKey := strings.TrimSpace(loginReq.PaymentWechatPrivateKey)
	paymentWechatPlatformCert := strings.TrimSpace(loginReq.PaymentWechatPlatformCert)
	paymentWechatNotifyUrl := strings.TrimSpace(loginReq.PaymentWechatNotifyUrl)
	paymentAlipayUrl := strings.TrimSpace(loginReq.PaymentAlipayUrl)
	paymentAlipayCreateApi := strings.TrimSpace(loginReq.PaymentAlipayCreateApi)
	paymentCallbackSecret := strings.TrimSpace(loginReq.PaymentCallbackSecret)
	paymentRequestSecret := strings.TrimSpace(loginReq.PaymentRequestSecret)
	paymentRequestAuthType := normalizePaymentRequestAuthType(loginReq.PaymentRequestAuthType)
	paymentRequestHeader := normalizePaymentRequestHeader(loginReq.PaymentRequestHeader)
	paymentRequestToken := strings.TrimSpace(loginReq.PaymentRequestToken)
	paymentRequestTimeout := normalizePaymentRequestTimeoutSeconds(loginReq.PaymentRequestTimeout)
	adminLoginCaptchaOn := normalizeBinaryFlag(loginReq.AdminLoginCaptchaOn)
	adminLoginFailLimit := loginReq.AdminLoginFailLimit
	if adminLoginFailLimit < 3 || adminLoginFailLimit > 20 {
		adminLoginFailLimit = 5
	}
	adminLoginFailWindow := loginReq.AdminLoginFailWindow
	if adminLoginFailWindow < 60 || adminLoginFailWindow > 86400 {
		adminLoginFailWindow = 900
	}

	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigFrontendEnabledKey, strconv.Itoa(normalizeBinaryFlag(loginReq.FrontendLoginEnabled))); err != nil {
		return response.CheckErr(err, "Save Set frontendLoginEnabled err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigLoginWayKey, loginWay); err != nil {
		return response.CheckErr(err, "Save Set loginWay err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigForceBindMobileKey, strconv.Itoa(loginReq.ForceBindMobile)); err != nil {
		return response.CheckErr(err, "Save Set forceBindMobile err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigOpenAgreementKey, strconv.Itoa(loginReq.OpenAgreement)); err != nil {
		return response.CheckErr(err, "Save Set openAgreement err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigOpenOtherAuthKey, strconv.Itoa(loginReq.OpenOtherAuth)); err != nil {
		return response.CheckErr(err, "Save Set openOtherAuth err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigAutoLoginAuthKey, autoLoginAuth); err != nil {
		return response.CheckErr(err, "Save Set autoLoginAuth err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigOpenWechatAuthKey, strconv.Itoa(loginReq.OpenWechatAuth)); err != nil {
		return response.CheckErr(err, "Save Set openWechatAuth err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigOpenQqAuthKey, strconv.Itoa(loginReq.OpenQqAuth)); err != nil {
		return response.CheckErr(err, "Save Set openQqAuth err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigWechatAppIdKey, wechatAppId); err != nil {
		return response.CheckErr(err, "Save Set wechatAppId err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigWechatAppSecretKey, wechatAppSecret); err != nil {
		return response.CheckErr(err, "Save Set wechatAppSecret err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigWechatRedirectKey, wechatRedirectUrl); err != nil {
		return response.CheckErr(err, "Save Set wechatRedirectUrl err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigQqAppIdKey, qqAppId); err != nil {
		return response.CheckErr(err, "Save Set qqAppId err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigQqAppKey, qqAppKey); err != nil {
		return response.CheckErr(err, "Save Set qqAppKey err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigQqRedirectKey, qqRedirectUrl); err != nil {
		return response.CheckErr(err, "Save Set qqRedirectUrl err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigUserCenterOpenKey, strconv.Itoa(loginReq.UserCenterEnabled)); err != nil {
		return response.CheckErr(err, "Save Set userCenterEnabled err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigUserCenterTitleKey, userCenterTitle); err != nil {
		return response.CheckErr(err, "Save Set userCenterTitle err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigUserCenterLinkKey, userCenterLink); err != nil {
		return response.CheckErr(err, "Save Set userCenterLink err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigDailyGiftPointsKey, strconv.Itoa(dailyGiftPoints)); err != nil {
		return response.CheckErr(err, "Save Set dailyGiftPoints err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigToolConsumeKey, strconv.Itoa(toolConsumePoints)); err != nil {
		return response.CheckErr(err, "Save Set toolConsumePoints err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigToolConsumeRulesKey, toolConsumeRules); err != nil {
		return response.CheckErr(err, "Save Set toolConsumeRules err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigConsumeRiskRulesKey, consumeRiskRules); err != nil {
		return response.CheckErr(err, "Save Set consumeRiskRules err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigMemberEnabledKey, strconv.Itoa(normalizeBinaryFlag(loginReq.MemberEnabled))); err != nil {
		return response.CheckErr(err, "Save Set memberEnabled err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigMemberTrialDaysKey, strconv.Itoa(memberTrialDays)); err != nil {
		return response.CheckErr(err, "Save Set memberTrialDays err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigMemberPlansKey, memberPlans); err != nil {
		return response.CheckErr(err, "Save Set memberPlans err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPointsPacksKey, pointsPacks); err != nil {
		return response.CheckErr(err, "Save Set pointsPacks err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigMemberRightsKey, memberRightsIntro); err != nil {
		return response.CheckErr(err, "Save Set memberRightsIntro err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentChannelsKey, paymentChannels); err != nil {
		return response.CheckErr(err, "Save Set paymentChannels err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatKey, paymentWechatUrl); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatUrl err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatCreate, paymentWechatCreateApi); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatCreateApi err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatMchId, paymentWechatMchId); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatMchId err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatAppId, paymentWechatAppId); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatAppId err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatSerial, paymentWechatSerialNo); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatSerialNo err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatV3Key, paymentWechatApiV3Key); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatApiV3Key err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatPriKey, paymentWechatPrivateKey); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatPrivateKey err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatPlatCa, paymentWechatPlatformCert); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatPlatformCert err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatNotify, paymentWechatNotifyUrl); err != nil {
		return response.CheckErr(err, "Save Set paymentWechatNotifyUrl err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentAlipayKey, paymentAlipayUrl); err != nil {
		return response.CheckErr(err, "Save Set paymentAlipayUrl err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentAlipayCreate, paymentAlipayCreateApi); err != nil {
		return response.CheckErr(err, "Save Set paymentAlipayCreateApi err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentSecretKey, paymentCallbackSecret); err != nil {
		return response.CheckErr(err, "Save Set paymentCallbackSecret err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentRequestKey, paymentRequestSecret); err != nil {
		return response.CheckErr(err, "Save Set paymentRequestSecret err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentAuthTypeKey, paymentRequestAuthType); err != nil {
		return response.CheckErr(err, "Save Set paymentRequestAuthType err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentAuthHeader, paymentRequestHeader); err != nil {
		return response.CheckErr(err, "Save Set paymentRequestHeader err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentAuthToken, paymentRequestToken); err != nil {
		return response.CheckErr(err, "Save Set paymentRequestToken err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentTimeoutKey, strconv.Itoa(paymentRequestTimeout)); err != nil {
		return response.CheckErr(err, "Save Set paymentRequestTimeout err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigAdminCaptchaOnKey, strconv.Itoa(adminLoginCaptchaOn)); err != nil {
		return response.CheckErr(err, "Save Set adminLoginCaptchaOn err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigAdminFailLimitKey, strconv.Itoa(adminLoginFailLimit)); err != nil {
		return response.CheckErr(err, "Save Set adminLoginFailLimit err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigAdminFailWindowKey, strconv.Itoa(adminLoginFailWindow)); err != nil {
		return response.CheckErr(err, "Save Set adminLoginFailWindow err")
	}
	return nil
}

// SyncWechatPlatformCert 函数说明：按后台已配置的微信支付V3参数拉取平台证书并自动写回配置。
func (lSrv settingLoginService) SyncWechatPlatformCert() (res map[string]interface{}, e error) {
	data, err := util.ConfigUtil.Get(lSrv.db, loginConfigType)
	if e = response.CheckErr(err, "SyncWechatPlatformCert Get login config err"); e != nil {
		return
	}
	mchID := strings.TrimSpace(data[loginConfigPaymentWechatMchId])
	serialNo := strings.TrimSpace(data[loginConfigPaymentWechatSerial])
	apiV3Key := strings.TrimSpace(data[loginConfigPaymentWechatV3Key])
	privateKeyPEM := strings.TrimSpace(data[loginConfigPaymentWechatPriKey])
	if mchID == "" || serialNo == "" || apiV3Key == "" || privateKeyPEM == "" {
		return nil, response.AssertArgumentError.Make("请先配置微信支付V3关键参数（商户号/证书序列号/APIv3密钥/商户私钥）")
	}
	privateKey, keyErr := parseWechatMerchantPrivateKey(privateKeyPEM)
	if keyErr != nil {
		return nil, keyErr
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	nonce := strings.ToUpper(util.ToolsUtil.RandomString(16))
	signMessage := buildWechatPaySignMessage(http.MethodGet, "/v3/certificates", timestamp, nonce, "")
	signature, signErr := signWechatPayV3Message(privateKey, signMessage)
	if signErr != nil {
		return nil, signErr
	}
	request, reqErr := http.NewRequest(http.MethodGet, wechatPayPlatformCertAPI, bytes.NewReader(nil))
	if reqErr != nil {
		return nil, response.CheckErr(reqErr, "SyncWechatPlatformCert NewRequest err")
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("User-Agent", "uiedtool-admin/1.0")
	request.Header.Set("Authorization", buildWechatPayAuthorizationValue(mchID, serialNo, nonce, timestamp, signature))
	timeoutSeconds := normalizePaymentRequestTimeoutSeconds(parsePositiveIntWithDefault(data[loginConfigPaymentTimeoutKey], 12))
	httpClient := &http.Client{
		Timeout: time.Duration(timeoutSeconds) * time.Second,
	}
	responseEntity, doErr := httpClient.Do(request)
	if doErr != nil {
		return nil, response.CheckErr(doErr, "SyncWechatPlatformCert Do err")
	}
	defer responseEntity.Body.Close()

	responseBody, readErr := io.ReadAll(io.LimitReader(responseEntity.Body, 2*1024*1024))
	if readErr != nil {
		return nil, response.CheckErr(readErr, "SyncWechatPlatformCert ReadAll err")
	}
	if responseEntity.StatusCode < 200 || responseEntity.StatusCode >= 300 {
		errorPayload := map[string]interface{}{}
		_ = json.Unmarshal(responseBody, &errorPayload)
		errorCode := strings.TrimSpace(fmt.Sprintf("%v", errorPayload["code"]))
		errorMessage := strings.TrimSpace(fmt.Sprintf("%v", errorPayload["message"]))
		if errorMessage == "" {
			errorMessage = strings.TrimSpace(string(responseBody))
		}
		if errorCode != "" {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("微信平台证书拉取失败（%s）：%s", errorCode, errorMessage))
		}
		return nil, response.AssertArgumentError.Make("微信平台证书拉取失败：" + errorMessage)
	}

	certResp := wechatPayCertificateResponse{}
	if unmarshalErr := json.Unmarshal(responseBody, &certResp); unmarshalErr != nil {
		return nil, response.AssertArgumentError.Make("微信平台证书接口响应格式错误")
	}
	selectedItem, found := pickLatestWechatPlatformCertificate(certResp.Data)
	if !found {
		return nil, response.AssertArgumentError.Make("微信平台证书列表为空，无法完成同步")
	}
	plainCertBytes, decryptErr := decryptWechatPayCertificateCiphertext(
		apiV3Key,
		selectedItem.EncryptCert.AssociatedData,
		selectedItem.EncryptCert.Nonce,
		selectedItem.EncryptCert.Ciphertext,
	)
	if decryptErr != nil {
		return nil, decryptErr
	}
	platformCertPEM := strings.TrimSpace(string(plainCertBytes))
	if platformCertPEM == "" {
		return nil, response.AssertArgumentError.Make("微信平台证书解密后为空")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatPlatCa, platformCertPEM); err != nil {
		return nil, response.CheckErr(err, "SyncWechatPlatformCert Save paymentWechatPlatformCert err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatPlatSN, strings.TrimSpace(selectedItem.SerialNo)); err != nil {
		return nil, response.CheckErr(err, "SyncWechatPlatformCert Save paymentWechatPlatformSerialNo err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatPlatET, strings.TrimSpace(selectedItem.EffectiveTime)); err != nil {
		return nil, response.CheckErr(err, "SyncWechatPlatformCert Save paymentWechatPlatformEffectiveTime err")
	}
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatPlatXP, strings.TrimSpace(selectedItem.ExpireTime)); err != nil {
		return nil, response.CheckErr(err, "SyncWechatPlatformCert Save paymentWechatPlatformExpireTime err")
	}
	syncedAt := time.Now().Unix()
	if err := util.ConfigUtil.Set(lSrv.db, loginConfigType, loginConfigPaymentWechatSyncAt, strconv.FormatInt(syncedAt, 10)); err != nil {
		return nil, response.CheckErr(err, "SyncWechatPlatformCert Save paymentWechatPlatformSyncedAt err")
	}

	return map[string]interface{}{
		"platformSerialNo": selectedItem.SerialNo,
		"effectiveTime":    selectedItem.EffectiveTime,
		"expireTime":       selectedItem.ExpireTime,
		"platformCertPem":  platformCertPEM,
		"syncedAt":         syncedAt,
	}, nil
}
