package common

import (
	"bytes"
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/subtle"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"likeadmin/admin/schemas/req"
	"likeadmin/config"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	frontendUserTokenRedisKeyPrefix   = "frontend:user:token:"
	frontendUserTokenTTLSeconds       = 7 * 24 * 60 * 60
	loginConfigType                   = "login"
	loginConfigFrontendEnabledKey     = "frontendLoginEnabled"
	loginConfigDailyGiftPointsKey     = "dailyGiftPoints"
	loginConfigToolConsumePointsKey   = "toolConsumePoints"
	loginConfigToolConsumeRulesKey    = "toolConsumeRules"
	loginConfigConsumeRiskRulesKey    = "consumeRiskRules"
	loginConfigMemberEnabledKey       = "memberEnabled"
	loginConfigMemberTrialDaysKey     = "memberTrialDays"
	loginConfigMemberPlansKey         = "memberPlans"
	loginConfigPointsPacksKey         = "pointsPacks"
	loginConfigMemberRightsIntroKey   = "memberRightsIntro"
	loginConfigPaymentChannelsKey     = "paymentChannels"
	loginConfigPaymentWechatURLKey    = "paymentWechatUrl"
	loginConfigPaymentWechatCreateKey = "paymentWechatCreateApi"
	loginConfigPaymentWechatMchIDKey  = "paymentWechatMchId"
	loginConfigPaymentWechatAppIDKey  = "paymentWechatAppId"
	loginConfigPaymentWechatSerialKey = "paymentWechatSerialNo"
	loginConfigPaymentWechatV3Key     = "paymentWechatApiV3Key"
	loginConfigPaymentWechatPriKey    = "paymentWechatPrivateKey"
	loginConfigPaymentWechatPlatKey   = "paymentWechatPlatformCert"
	loginConfigPaymentWechatNotifyKey = "paymentWechatNotifyUrl"
	loginConfigPaymentAlipayURLKey    = "paymentAlipayUrl"
	loginConfigPaymentAlipayCreateKey = "paymentAlipayCreateApi"
	loginConfigPaymentCallbackKey     = "paymentCallbackSecret"
	loginConfigPaymentRequestKey      = "paymentRequestSecret"
	loginConfigPaymentAuthTypeKey     = "paymentRequestAuthType"
	loginConfigPaymentAuthHeaderKey   = "paymentRequestHeader"
	loginConfigPaymentAuthTokenKey    = "paymentRequestToken"
	loginConfigPaymentTimeoutKey      = "paymentRequestTimeout"
	defaultDailyGiftPoints            = 50
	defaultFrontendLoginEnabled       = false
	defaultToolConsumePoints          = 1
	defaultToolConsumeRulesJSON       = "[]"
	defaultConsumeRiskRulesJSON       = `{"perMinute":30,"perHour":600,"perDay":3000}`
	defaultMemberEnabled              = false
	defaultMemberTrialDays            = 0
	frontendMemberLevelFree           = "free"
	frontendMemberLevelVip            = "vip"
	defaultMemberRightsIntro          = "会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。"
	defaultPaymentChannels            = "mock"
	defaultPaymentAuthType            = "none"
	defaultPaymentAuthHeader          = "X-Payment-Token"
	defaultPaymentTimeoutSeconds      = 12
	defaultWechatPayV3H5OrderAPI      = "https://api.mch.weixin.qq.com/v3/pay/transactions/h5"
)

const (
	frontendUserConsumeRiskRedisKeyPrefix = "frontend:user:consume:risk:"
)

const (
	defaultMemberPlansJSON = `[{"code":"vip_month","name":"VIP月卡","price":29,"memberDays":30,"giftPoints":80,"sort":1,"status":1,"badge":"热卖"},{"code":"vip_quarter","name":"VIP季卡","price":79,"memberDays":90,"giftPoints":300,"sort":2,"status":1,"badge":"推荐"},{"code":"vip_year","name":"VIP年卡","price":299,"memberDays":365,"giftPoints":1500,"sort":3,"status":1,"badge":"省钱"}]`
	defaultPointsPacksJSON = `[{"code":"points_100","name":"100积分包","price":9.9,"points":100,"giftPoints":0,"sort":1,"status":1},{"code":"points_500","name":"500积分包","price":39.9,"points":500,"giftPoints":50,"sort":2,"status":1},{"code":"points_1000","name":"1000积分包","price":69.9,"points":1000,"giftPoints":200,"sort":3,"status":1}]`
)

const (
	frontendOrderStatusPending uint8 = 0
	frontendOrderStatusPaid    uint8 = 1
	frontendOrderStatusClosed  uint8 = 2
)

const (
	frontendOrderCallbackStatusPending    uint8 = 0
	frontendOrderCallbackStatusProcessing uint8 = 3
	frontendOrderCallbackStatusSuccess    uint8 = 1
	frontendOrderCallbackStatusFailed     uint8 = 2
)

const (
	frontendPayChannelMock     = "mock"
	frontendPayChannelWechatH5 = "wechat_h5"
	frontendPayChannelAlipayH5 = "alipay_h5"
)

const (
	frontendPaymentCallbackResultSuccess    = "success"
	frontendPaymentCallbackResultFailed     = "failed"
	frontendPaymentCallbackResultClosed     = "closed"
	frontendPaymentCallbackResultProcessing = "processing"
)

const (
	frontendOrderAutoCloseTimeoutMinutes       int64 = 30
	frontendPaymentCallbackAllowedSkewSeconds  int64 = 30 * 60
	frontendPaymentCallbackNonceTTLSeconds     int   = 30 * 60
	frontendPaymentCallbackEventTTLSeconds     int   = 7 * 24 * 60 * 60
	frontendPaymentCallbackLockTTLSeconds      int   = 30
	frontendPointsConsumeReservationTTLSeconds int64 = 2 * 60 * 60
	frontendPaymentCallbackNonceRedisKeyPrefix       = "frontend:payment:callback:nonce:"
	frontendPaymentCallbackEventRedisKeyPrefix       = "frontend:payment:callback:event:"
	frontendPaymentCallbackLockRedisKeyPrefix        = "frontend:payment:callback:lock:"
)

const (
	frontendPointsConsumeStatusReserved  = "reserved"
	frontendPointsConsumeStatusCommitted = "committed"
	frontendPointsConsumeStatusRefunded  = "refunded"
	frontendPointsConsumeStatusExpired   = "expired"
)

var qqEmailRegexp = regexp.MustCompile(`^[1-9]\d{4,10}@qq\.com$`)
var pointsConsumeRequestIDRegexp = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9_-]{7,39}$`)

type IFrontendUserService interface {
	Login(c *gin.Context, loginReq req.CommonFrontendUserLoginReq) (res map[string]interface{}, e error)
	Profile(frontendToken string) (res map[string]interface{}, e error)
	SaveProfile(frontendToken string, saveReq req.CommonFrontendUserProfileSaveReq) (res map[string]interface{}, e error)
	ConsumePoints(frontendToken string, consumeReq req.CommonFrontendUserPointsConsumeReq) (res map[string]interface{}, e error)
	ResolvePointsConsume(frontendToken string, resolveReq req.CommonFrontendUserPointsConsumeResolveReq) (res map[string]interface{}, e error)
	Products() (res map[string]interface{}, e error)
	Purchase(frontendToken string, purchaseReq req.CommonFrontendUserPurchaseReq) (res map[string]interface{}, e error)
	PurchasePay(frontendToken string, payReq req.CommonFrontendUserPurchasePayReq) (res map[string]interface{}, e error)
	PurchaseCallback(frontendToken string, callbackReq req.CommonFrontendUserPurchaseCallbackReq) (res map[string]interface{}, e error)
	PurchaseWechatCallback(c *gin.Context) (res map[string]interface{}, e error)
	CloseOrder(frontendToken string, closeReq req.CommonFrontendUserOrderCloseReq) (res map[string]interface{}, e error)
	OrderStatus(frontendToken string, statusReq req.CommonFrontendUserOrderStatusReq) (res map[string]interface{}, e error)
	Orders(frontendToken string, listReq req.CommonFrontendUserOrderListReq) (res map[string]interface{}, e error)
	PointsLogs(frontendToken string, listReq req.CommonFrontendUserPointsLogListReq) (res map[string]interface{}, e error)
	Logout(frontendToken string) (e error)
}

// isFrontendLoginEnabled 函数说明：读取前台登录总开关，缺省时保持关闭以支持免登录工具模式。
func (srv frontendUserService) isFrontendLoginEnabled() (bool, error) {
	data, err := util.ConfigUtil.Get(srv.db, loginConfigType)
	if err := response.CheckErr(err, "isFrontendLoginEnabled Config Get err"); err != nil {
		return false, err
	}
	return parseBoolFlag(data[loginConfigFrontendEnabledKey], defaultFrontendLoginEnabled), nil
}

// NewFrontendUserService 函数说明：初始化前台用户中心服务（登录、资料读取、QQ邮箱绑定保存）
func NewFrontendUserService(db *gorm.DB) IFrontendUserService {
	return &frontendUserService{db: db}
}

// frontendUserService 函数说明：前台用户中心服务实现类
type frontendUserService struct {
	db *gorm.DB
}

// frontendUserEntity 函数说明：映射 la_user 表字段，补齐 qq_email 用于持久化 QQ 邮箱绑定
type frontendUserEntity struct {
	ID               uint   `gorm:"column:id"`
	SN               uint   `gorm:"column:sn"`
	Avatar           string `gorm:"column:avatar"`
	RealName         string `gorm:"column:real_name"`
	Nickname         string `gorm:"column:nickname"`
	Username         string `gorm:"column:username"`
	Password         string `gorm:"column:password"`
	Mobile           string `gorm:"column:mobile"`
	QqEmail          string `gorm:"column:qq_email"`
	PointsBalance    int64  `gorm:"column:points_balance"`
	PointsGiftDay    string `gorm:"column:points_daily_grant_date"`
	PointsEarned     int64  `gorm:"column:points_total_earned"`
	PointsUsed       int64  `gorm:"column:points_total_consumed"`
	MemberLevel      string `gorm:"column:member_level"`
	MemberExpireTime int64  `gorm:"column:member_expire_time"`
	Salt             string `gorm:"column:salt"`
	Sex              uint8  `gorm:"column:sex"`
	Channel          uint8  `gorm:"column:channel"`
	IsDisable        uint8  `gorm:"column:is_disable"`
	IsDelete         uint8  `gorm:"column:is_delete"`
	LastLoginIP      string `gorm:"column:last_login_ip"`
	LastLoginTime    int64  `gorm:"column:last_login_time"`
	CreateTime       int64  `gorm:"column:create_time"`
	UpdateTime       int64  `gorm:"column:update_time"`
}

// TableName 函数说明：声明前台用户实体对应表名
func (frontendUserEntity) TableName() string {
	return "la_user"
}

// frontendUserOrderEntity 函数说明：映射用户购买记录表，统一承载会员套餐与积分包订单。
type frontendUserOrderEntity struct {
	ID                   uint    `gorm:"column:id"`
	OrderSN              string  `gorm:"column:order_sn"`
	UserID               uint    `gorm:"column:user_id"`
	ProductType          string  `gorm:"column:product_type"`
	ProductCode          string  `gorm:"column:product_code"`
	ProductName          string  `gorm:"column:product_name"`
	Amount               float64 `gorm:"column:amount"`
	Currency             string  `gorm:"column:currency"`
	Status               uint8   `gorm:"column:status"`
	PayChannel           string  `gorm:"column:pay_channel"`
	TradeNo              string  `gorm:"column:trade_no"`
	CallbackStatus       uint8   `gorm:"column:callback_status"`
	CallbackTime         int64   `gorm:"column:callback_time"`
	CallbackError        string  `gorm:"column:callback_error"`
	MemberDays           int64   `gorm:"column:member_days"`
	Points               int64   `gorm:"column:points"`
	GiftPoints           int64   `gorm:"column:gift_points"`
	DeliveryStatus       uint8   `gorm:"column:delivery_status"`
	LicenseBoundDomain   string  `gorm:"column:license_bound_domain"`
	LicenseKey           string  `gorm:"column:license_key"`
	DownloadURL          string  `gorm:"column:download_url"`
	DownloadCheckStatus  uint8   `gorm:"column:download_check_status"`
	DownloadCheckTime    int64   `gorm:"column:download_check_time"`
	DownloadCheckMessage string  `gorm:"column:download_check_message"`
	DeliveryNote         string  `gorm:"column:delivery_note"`
	DeliveredTime        int64   `gorm:"column:delivered_time"`
	Remark               string  `gorm:"column:remark"`
	PaidTime             int64   `gorm:"column:paid_time"`
	CreateTime           int64   `gorm:"column:create_time"`
	UpdateTime           int64   `gorm:"column:update_time"`
	DeleteTime           int64   `gorm:"column:delete_time"`
}

// TableName 函数说明：声明购买记录实体对应表名。
func (frontendUserOrderEntity) TableName() string {
	return "la_user_purchase_order"
}

// frontendUserPointsLogEntity 函数说明：映射积分流水表，记录每日赠送、扣次和购买赠送等变化。
type frontendUserPointsLogEntity struct {
	ID           uint   `gorm:"column:id"`
	UserID       uint   `gorm:"column:user_id"`
	ChangeType   string `gorm:"column:change_type"`
	ChangeAmount int64  `gorm:"column:change_amount"`
	BalanceAfter int64  `gorm:"column:balance_after"`
	ToolKey      string `gorm:"column:tool_key"`
	Action       string `gorm:"column:action"`
	OrderSN      string `gorm:"column:order_sn"`
	Remark       string `gorm:"column:remark"`
	CreateTime   int64  `gorm:"column:create_time"`
}

// TableName 函数说明：声明积分流水实体对应表名。
func (frontendUserPointsLogEntity) TableName() string {
	return "la_user_points_log"
}

// frontendUserPointsConsumeEntity 函数说明：映射工具积分预扣状态表，提供跨刷新幂等和失败退款依据。
type frontendUserPointsConsumeEntity struct {
	ID            uint   `gorm:"column:id"`
	UserID        uint   `gorm:"column:user_id"`
	RequestID     string `gorm:"column:request_id"`
	ToolKey       string `gorm:"column:tool_key"`
	Action        string `gorm:"column:action"`
	ConsumePoints int64  `gorm:"column:consume_points"`
	Status        string `gorm:"column:status"`
	ExpiresAt     int64  `gorm:"column:expires_at"`
	Reason        string `gorm:"column:reason"`
	CreateTime    int64  `gorm:"column:create_time"`
	UpdateTime    int64  `gorm:"column:update_time"`
}

// TableName 函数说明：声明工具积分预扣状态实体对应表名。
func (frontendUserPointsConsumeEntity) TableName() string {
	return "la_user_points_consume"
}

// frontendPaymentCallbackAuditEntity 函数说明：映射支付回调审计日志表，记录验签、幂等与处理结果，便于售后排查重放问题。
type frontendPaymentCallbackAuditEntity struct {
	ID                uint   `gorm:"column:id"`
	OrderSN           string `gorm:"column:order_sn"`
	PayChannel        string `gorm:"column:pay_channel"`
	TradeNo           string `gorm:"column:trade_no"`
	CallbackResult    string `gorm:"column:callback_result"`
	CallbackMessage   string `gorm:"column:callback_message"`
	CallbackTimestamp int64  `gorm:"column:callback_timestamp"`
	CallbackNonce     string `gorm:"column:callback_nonce"`
	SignDigest        string `gorm:"column:sign_digest"`
	SignVerified      uint8  `gorm:"column:sign_verified"`
	ReplayDetected    uint8  `gorm:"column:replay_detected"`
	ReplayKind        string `gorm:"column:replay_kind"`
	LockAcquired      uint8  `gorm:"column:lock_acquired"`
	ProcessStage      string `gorm:"column:process_stage"`
	ProcessResult     string `gorm:"column:process_result"`
	RequestPayload    string `gorm:"column:request_payload"`
	CreateTime        int64  `gorm:"column:create_time"`
}

// TableName 函数说明：声明支付回调审计实体对应表名。
func (frontendPaymentCallbackAuditEntity) TableName() string {
	return "la_user_purchase_callback_audit"
}

// frontendPointsConfig 函数说明：前台积分规则配置结构体，用于统一传递“每日赠送/单次扣减”参数。
type frontendPointsConfig struct {
	DailyGiftPoints   int64
	ToolConsumePoints int64
	ToolConsumeRules  []frontendToolConsumeRule
	ConsumeRiskRule   frontendConsumeRiskRule
	MemberEnabled     bool
	MemberTrialDays   int64
}

// frontendToolConsumeRule 函数说明：按工具覆盖积分策略配置项，支持“每次扣分+会员是否免扣”。
type frontendToolConsumeRule struct {
	ToolKey       string `json:"toolKey"`
	Name          string `json:"name"`
	ConsumePoints int64  `json:"consumePoints"`
	MemberFree    bool   `json:"memberFree"`
	Status        bool   `json:"status"`
	Sort          int64  `json:"sort"`
	Remark        string `json:"remark"`
}

// frontendConsumeRiskRule 函数说明：积分扣减风控规则，按用户限制分钟/小时/每日最大调用次数。
type frontendConsumeRiskRule struct {
	PerMinute int64 `json:"perMinute"`
	PerHour   int64 `json:"perHour"`
	PerDay    int64 `json:"perDay"`
}

// frontendMemberPlan 函数说明：前台会员套餐配置结构，支持后台动态配置。
type frontendMemberPlan struct {
	Code       string  `json:"code"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	MemberDays int64   `json:"memberDays"`
	GiftPoints int64   `json:"giftPoints"`
	Sort       int64   `json:"sort"`
	Status     int     `json:"status"`
	Badge      string  `json:"badge"`
}

// frontendPointsPack 函数说明：前台积分包配置结构，支持后台动态配置。
type frontendPointsPack struct {
	Code       string  `json:"code"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	Points     int64   `json:"points"`
	GiftPoints int64   `json:"giftPoints"`
	Sort       int64   `json:"sort"`
	Status     int     `json:"status"`
}

// frontendCommerceConfig 函数说明：聚合“会员套餐 + 积分包 + 权益说明”配置。
type frontendCommerceConfig struct {
	MemberPlans          []frontendMemberPlan
	PointsPacks          []frontendPointsPack
	MemberRightsIntro    string
	PaymentChannels      []frontendPaymentChannel
	PaymentSecret        string
	PaymentRequestSecret string
	PaymentAuthType      string
	PaymentAuthHeader    string
	PaymentAuthToken     string
	PaymentTimeout       int
	WechatV3             frontendWechatV3Config
}

// frontendPaymentChannel 函数说明：前台可用支付渠道配置，支持运营动态启停与支付地址设置。
type frontendPaymentChannel struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	PayUrl      string `json:"payUrl"`
	CreateApi   string `json:"-"`
	Configured  bool   `json:"configured"`
}

// frontendWechatV3Config 函数说明：微信支付V3配置结构，支持官方统一下单与回调验签/解密。
type frontendWechatV3Config struct {
	MchID             string
	AppID             string
	SerialNo          string
	ApiV3Key          string
	PrivateKeyPEM     string
	PlatformCertPEM   string
	NotifyURL         string
	UnifiedOrderAPI   string
	PlatformCertReady bool
	Enabled           bool
}

type wechatPayNotifyPayload struct {
	ID         string `json:"id"`
	CreateTime string `json:"create_time"`
	EventType  string `json:"event_type"`
	Summary    string `json:"summary"`
	Resource   struct {
		Algorithm      string `json:"algorithm"`
		Ciphertext     string `json:"ciphertext"`
		AssociatedData string `json:"associated_data"`
		Nonce          string `json:"nonce"`
		OriginalType   string `json:"original_type"`
	} `json:"resource"`
}

type wechatPayTransactionPayload struct {
	OutTradeNo     string `json:"out_trade_no"`
	TransactionID  string `json:"transaction_id"`
	TradeState     string `json:"trade_state"`
	TradeStateDesc string `json:"trade_state_desc"`
	MchID          string `json:"mchid"`
	AppID          string `json:"appid"`
	Amount         struct {
		Total    int64  `json:"total"`
		Currency string `json:"currency"`
	} `json:"amount"`
}

// frontendTrustedPaymentContext 函数说明：承载已验签官方回调中的账务绑定字段，不对通用回调入参暴露。
type frontendTrustedPaymentContext struct {
	AmountCents int64
	Currency    string
	MchID       string
	AppID       string
}

// validateTrustedPaymentOrderBinding 函数说明：校验已验签支付成功回调的金额与币种必须和本地订单一致。
func validateTrustedPaymentOrderBinding(order frontendUserOrderEntity, callbackResult string, trustedContext *frontendTrustedPaymentContext) error {
	if trustedContext == nil || callbackResult != frontendPaymentCallbackResultSuccess {
		return nil
	}
	expectedCurrency := strings.ToUpper(strings.TrimSpace(order.Currency))
	actualCurrency := strings.ToUpper(strings.TrimSpace(trustedContext.Currency))
	expectedAmountCents := int64(math.Round(order.Amount * 100))
	if expectedCurrency == "" || actualCurrency == "" || expectedCurrency != actualCurrency {
		return response.AssertArgumentError.Make("支付回调币种与订单不匹配，回调已拒绝")
	}
	if expectedAmountCents < 0 || trustedContext.AmountCents != expectedAmountCents {
		return response.AssertArgumentError.Make("支付回调金额与订单不匹配，回调已拒绝")
	}
	return nil
}

// normalizeFrontendNickname 函数说明：统一清洗昵称参数并做长度校验。
func normalizeFrontendNickname(raw string) (nickname string, e error) {
	nickname = strings.TrimSpace(raw)
	nicknameLen := len([]rune(nickname))
	if nicknameLen < 2 || nicknameLen > 24 {
		return "", response.AssertArgumentError.Make("昵称长度需在 2-24 个字符之间")
	}
	return nickname, nil
}

// normalizeFrontendQqEmail 函数说明：统一清洗 QQ 邮箱参数并做格式校验。
func normalizeFrontendQqEmail(raw string) (qqEmail string, e error) {
	qqEmail = strings.ToLower(strings.TrimSpace(raw))
	if qqEmail == "" {
		return "", nil
	}
	if !qqEmailRegexp.MatchString(qqEmail) {
		return "", response.AssertArgumentError.Make("请输入正确的 QQ 邮箱，例如 123456@qq.com")
	}
	return qqEmail, nil
}

// buildFrontendTokenRedisKey 函数说明：统一生成前台用户登录态 Redis Key。
func buildFrontendTokenRedisKey(frontendToken string) string {
	return frontendUserTokenRedisKeyPrefix + strings.TrimSpace(frontendToken)
}

// parsePositiveInt 函数说明：将字符串安全转换成正整数，不合法时回退默认值。
func parsePositiveInt(raw string, fallback int64) int64 {
	value, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

// parseNonNegativeInt 函数说明：将字符串安全转换成非负整数，不合法时回退默认值。
func parseNonNegativeInt(raw string, fallback int64) int64 {
	value, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil || value < 0 {
		return fallback
	}
	return value
}

// parseAnyInt64 函数说明：兼容 number/string/json 数字类型解析为 int64，非法值回退默认值。
func parseAnyInt64(value interface{}, fallback int64) int64 {
	switch typed := value.(type) {
	case float64:
		return int64(typed)
	case float32:
		return int64(typed)
	case int:
		return int64(typed)
	case int64:
		return typed
	case int32:
		return int64(typed)
	case json.Number:
		parsed, err := typed.Int64()
		if err != nil {
			return fallback
		}
		return parsed
	case string:
		parsed, err := strconv.ParseInt(strings.TrimSpace(typed), 10, 64)
		if err != nil {
			return fallback
		}
		return parsed
	default:
		return fallback
	}
}

// parseAnyBoolFlag 函数说明：兼容 bool/number/string 配置解析为布尔开关，非法值回退默认值。
func parseAnyBoolFlag(value interface{}, fallback bool) bool {
	switch typed := value.(type) {
	case bool:
		return typed
	case int:
		return typed == 1
	case int32:
		return typed == 1
	case int64:
		return typed == 1
	case float64:
		return int64(typed) == 1
	case float32:
		return int64(typed) == 1
	case string:
		return parseBoolFlag(typed, fallback)
	default:
		return fallback
	}
}

// parseAnyString 函数说明：兼容任意类型值转字符串，nil 将回退为空字符串。
func parseAnyString(value interface{}) string {
	if value == nil {
		return ""
	}
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	default:
		return strings.TrimSpace(fmt.Sprintf("%v", typed))
	}
}

// buildCallbackSignDigest 函数说明：对回调签名做脱敏摘要，避免审计日志直接存储完整签名原文。
func buildCallbackSignDigest(rawSign string) string {
	sign := strings.ToLower(strings.TrimSpace(rawSign))
	if sign == "" {
		return ""
	}
	runes := []rune(sign)
	if len(runes) <= 12 {
		return string(runes[:4]) + "****"
	}
	return string(runes[:8]) + "****" + string(runes[len(runes)-4:])
}

// marshalPaymentCallbackAuditPayload 函数说明：序列化回调请求体到审计日志字段，并限制最大长度避免异常膨胀。
func marshalPaymentCallbackAuditPayload(callbackReq req.CommonFrontendUserPurchaseCallbackReq) string {
	payloadBytes, err := json.Marshal(callbackReq)
	if err != nil {
		return ""
	}
	payload := strings.TrimSpace(string(payloadBytes))
	if len(payload) > 4000 {
		return payload[:4000]
	}
	return payload
}

// parseBoolFlag 函数说明：将配置值解析为布尔开关，兼容 1/true/on 等写法。
func parseBoolFlag(raw string, fallback bool) bool {
	trimmed := strings.ToLower(strings.TrimSpace(raw))
	if trimmed == "" {
		return fallback
	}
	return trimmed == "1" || trimmed == "true" || trimmed == "on" || trimmed == "yes"
}

// normalizeToolConsumeRuleToolKey 函数说明：规范工具规则的 toolKey（去空格+小写），避免重复配置命中异常。
func normalizeToolConsumeRuleToolKey(raw string) string {
	return strings.ToLower(strings.TrimSpace(raw))
}

// normalizePointsConsumeRequestID 函数说明：校验核心工具单次运行幂等标识，空值表示沿用旧版即时扣分模式。
func normalizePointsConsumeRequestID(raw string) (string, error) {
	requestID := strings.TrimSpace(raw)
	if requestID == "" {
		return "", nil
	}
	if !pointsConsumeRequestIDRegexp.MatchString(requestID) {
		return "", response.AssertArgumentError.Make("积分消费 requestId 格式不合法")
	}
	return requestID, nil
}

// parseToolConsumeRulesConfig 函数说明：解析按工具计费规则配置，过滤非法项并做基础归一化。
func parseToolConsumeRulesConfig(raw string) []frontendToolConsumeRule {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return []frontendToolConsumeRule{}
	}
	rawList := make([]map[string]interface{}, 0)
	if err := json.Unmarshal([]byte(trimmed), &rawList); err != nil {
		return []frontendToolConsumeRule{}
	}
	result := make([]frontendToolConsumeRule, 0, len(rawList))
	seen := make(map[string]struct{}, len(rawList))
	for index, item := range rawList {
		toolKey := normalizeToolConsumeRuleToolKey(parseAnyString(item["toolKey"]))
		if toolKey == "" {
			continue
		}
		if _, ok := seen[toolKey]; ok {
			continue
		}
		seen[toolKey] = struct{}{}
		consumePoints := parseAnyInt64(item["consumePoints"], defaultToolConsumePoints)
		if consumePoints < 0 {
			consumePoints = 0
		}
		memberFree := parseAnyBoolFlag(item["memberFree"], true)
		status := parseAnyBoolFlag(item["status"], true)
		sortValue := parseAnyInt64(item["sort"], int64(index+1))
		if sortValue < 0 {
			sortValue = 0
		}
		result = append(result, frontendToolConsumeRule{
			ToolKey:       toolKey,
			Name:          parseAnyString(item["name"]),
			ConsumePoints: consumePoints,
			MemberFree:    memberFree,
			Status:        status,
			Sort:          sortValue,
			Remark:        parseAnyString(item["remark"]),
		})
	}
	return result
}

// parseConsumeRiskRuleConfig 函数说明：解析风控限流规则配置，非法值回退到默认规则。
func parseConsumeRiskRuleConfig(raw string) frontendConsumeRiskRule {
	rule := frontendConsumeRiskRule{
		PerMinute: 30,
		PerHour:   600,
		PerDay:    3000,
	}
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return rule
	}
	parsed := make(map[string]interface{})
	if err := json.Unmarshal([]byte(trimmed), &parsed); err != nil {
		return rule
	}
	rule.PerMinute = parseAnyInt64(parsed["perMinute"], rule.PerMinute)
	rule.PerHour = parseAnyInt64(parsed["perHour"], rule.PerHour)
	rule.PerDay = parseAnyInt64(parsed["perDay"], rule.PerDay)
	if rule.PerMinute < 0 {
		rule.PerMinute = 0
	}
	if rule.PerHour < 0 {
		rule.PerHour = 0
	}
	if rule.PerDay < 0 {
		rule.PerDay = 0
	}
	return rule
}

// normalizePaymentChannelCode 函数说明：统一支付渠道编码，只允许约定枚举值。
func normalizePaymentChannelCode(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case frontendPayChannelWechatH5:
		return frontendPayChannelWechatH5
	case frontendPayChannelAlipayH5:
		return frontendPayChannelAlipayH5
	case frontendPayChannelMock:
		return frontendPayChannelMock
	default:
		return ""
	}
}

// normalizePaymentCallbackResult 函数说明：标准化支付回调结果状态，空值或未知状态直接判为非法。
func normalizePaymentCallbackResult(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case frontendPaymentCallbackResultSuccess:
		return frontendPaymentCallbackResultSuccess
	case frontendPaymentCallbackResultFailed:
		return frontendPaymentCallbackResultFailed
	case frontendPaymentCallbackResultClosed:
		return frontendPaymentCallbackResultClosed
	case frontendPaymentCallbackResultProcessing:
		return frontendPaymentCallbackResultProcessing
	default:
		return ""
	}
}

// parsePaymentChannels 函数说明：解析支付渠道配置，过滤非法值并保持顺序去重。
func parsePaymentChannels(raw string) []string {
	parts := strings.Split(strings.TrimSpace(raw), ",")
	result := make([]string, 0, len(parts))
	seen := make(map[string]struct{}, len(parts))
	for _, item := range parts {
		code := normalizePaymentChannelCode(item)
		if code == "" {
			continue
		}
		if _, ok := seen[code]; ok {
			continue
		}
		seen[code] = struct{}{}
		result = append(result, code)
	}
	return filterRuntimePaymentChannels(result)
}

// isProductionRuntimeMode 函数说明：判断当前是否为生产运行模式（release/prod/production）。
func isProductionRuntimeMode() bool {
	mode := strings.ToLower(strings.TrimSpace(config.Config.GinMode))
	return mode == "release" || mode == "prod" || mode == "production"
}

// isMockPaymentAllowed 函数说明：判断当前运行模式是否允许 mock 支付渠道。
func isMockPaymentAllowed() bool {
	return !isProductionRuntimeMode()
}

// filterRuntimePaymentChannels 函数说明：按运行时策略过滤支付渠道，生产环境禁用 mock。
func filterRuntimePaymentChannels(channels []string) []string {
	result := make([]string, 0, len(channels))
	for _, channel := range channels {
		normalized := normalizePaymentChannelCode(channel)
		if normalized == "" {
			continue
		}
		if normalized == frontendPayChannelMock && !isMockPaymentAllowed() {
			continue
		}
		result = append(result, normalized)
	}
	return result
}

// defaultRuntimePaymentChannels 函数说明：返回当前运行模式下的默认支付渠道集合。
func defaultRuntimePaymentChannels() []string {
	if isMockPaymentAllowed() {
		return []string{frontendPayChannelMock}
	}
	return []string{frontendPayChannelWechatH5, frontendPayChannelAlipayH5}
}

// resolveDefaultPayChannel 函数说明：按运行时支付策略选择默认支付渠道，优先可用且已配置渠道。
func resolveDefaultPayChannel(cfg frontendCommerceConfig) string {
	for _, item := range cfg.PaymentChannels {
		channelCode := normalizePaymentChannelCode(item.Code)
		if channelCode == "" {
			continue
		}
		if channelCode == frontendPayChannelMock && !isMockPaymentAllowed() {
			continue
		}
		if item.Configured {
			return channelCode
		}
	}
	for _, item := range cfg.PaymentChannels {
		channelCode := normalizePaymentChannelCode(item.Code)
		if channelCode == "" {
			continue
		}
		if channelCode == frontendPayChannelMock && !isMockPaymentAllowed() {
			continue
		}
		return channelCode
	}
	if isMockPaymentAllowed() {
		return frontendPayChannelMock
	}
	return ""
}

// normalizePaymentGatewayAuthType 函数说明：标准化支付网关鉴权模式，只允许 none / bearer / header。
func normalizePaymentGatewayAuthType(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "bearer":
		return "bearer"
	case "header":
		return "header"
	default:
		return "none"
	}
}

// normalizePaymentGatewayAuthHeader 函数说明：清洗自定义鉴权请求头，非法字符时回退默认值。
func normalizePaymentGatewayAuthHeader(raw string) string {
	header := strings.TrimSpace(raw)
	if header == "" {
		return defaultPaymentAuthHeader
	}
	for _, char := range header {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '-' {
			continue
		}
		return defaultPaymentAuthHeader
	}
	return header
}

// normalizePaymentGatewayTimeout 函数说明：标准化支付网关请求超时秒数，防止过短或过长导致异常。
func normalizePaymentGatewayTimeout(raw string) int {
	timeout, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil {
		return defaultPaymentTimeoutSeconds
	}
	if timeout < 3 {
		return defaultPaymentTimeoutSeconds
	}
	if timeout > 60 {
		return 60
	}
	return timeout
}

// resolveFrontendWechatNotifyURL 函数说明：解析微信支付回调地址，优先使用后台配置，未配置时回退站内默认回调路径。
func resolveFrontendWechatNotifyURL(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed != "" {
		return trimmed
	}
	return "/api/common/frontend-user/purchase/wechat/callback"
}

// buildFrontendWechatV3Config 函数说明：从登录配置中构造微信支付V3配置，并判断是否可用于官方直连。
func buildFrontendWechatV3Config(data map[string]string) frontendWechatV3Config {
	cfg := frontendWechatV3Config{
		MchID:           strings.TrimSpace(data[loginConfigPaymentWechatMchIDKey]),
		AppID:           strings.TrimSpace(data[loginConfigPaymentWechatAppIDKey]),
		SerialNo:        strings.TrimSpace(data[loginConfigPaymentWechatSerialKey]),
		ApiV3Key:        strings.TrimSpace(data[loginConfigPaymentWechatV3Key]),
		PrivateKeyPEM:   strings.TrimSpace(data[loginConfigPaymentWechatPriKey]),
		PlatformCertPEM: strings.TrimSpace(data[loginConfigPaymentWechatPlatKey]),
		NotifyURL:       resolveFrontendWechatNotifyURL(data[loginConfigPaymentWechatNotifyKey]),
		UnifiedOrderAPI: defaultWechatPayV3H5OrderAPI,
	}
	cfg.PlatformCertReady = cfg.PlatformCertPEM != ""
	cfg.Enabled = cfg.MchID != "" && cfg.AppID != "" && cfg.SerialNo != "" && cfg.ApiV3Key != "" && cfg.PrivateKeyPEM != "" && cfg.NotifyURL != ""
	return cfg
}

// buildWechatPayRequestSignMessage 函数说明：按微信支付V3规范拼接签名明文。
func buildWechatPayRequestSignMessage(method string, canonicalURL string, timestamp string, nonce string, body string) string {
	return strings.Join([]string{
		strings.ToUpper(strings.TrimSpace(method)),
		strings.TrimSpace(canonicalURL),
		strings.TrimSpace(timestamp),
		strings.TrimSpace(nonce),
		body,
	}, "\n") + "\n"
}

// parseWechatPrivateKeyPEM 函数说明：解析微信商户私钥（支持 PKCS1 / PKCS8）用于请求签名。
func parseWechatPrivateKeyPEM(rawPEM string) (privateKey *rsa.PrivateKey, e error) {
	block, _ := pem.Decode([]byte(strings.TrimSpace(rawPEM)))
	if block == nil {
		return nil, response.AssertArgumentError.Make("微信支付商户私钥格式无效")
	}
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}
	parsedKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, response.AssertArgumentError.Make("微信支付商户私钥解析失败，请检查 PEM 内容")
	}
	rsaKey, ok := parsedKey.(*rsa.PrivateKey)
	if !ok {
		return nil, response.AssertArgumentError.Make("微信支付商户私钥必须为 RSA 私钥")
	}
	return rsaKey, nil
}

// parseWechatPlatformCertificatePEM 函数说明：解析微信支付平台证书 PEM，用于回调验签。
func parseWechatPlatformCertificatePEM(rawPEM string) (certificate *x509.Certificate, e error) {
	block, _ := pem.Decode([]byte(strings.TrimSpace(rawPEM)))
	if block == nil {
		return nil, response.AssertArgumentError.Make("微信支付平台证书格式无效")
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, response.AssertArgumentError.Make("微信支付平台证书解析失败，请检查 PEM 内容")
	}
	return cert, nil
}

// signWechatPayRequest 函数说明：使用商户私钥生成微信支付V3请求签名（SHA256withRSA）。
func signWechatPayRequest(privateKey *rsa.PrivateKey, message string) (signature string, e error) {
	digest := sha256.Sum256([]byte(message))
	signatureBytes, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, digest[:])
	if err != nil {
		return "", response.CheckErr(err, "signWechatPayRequest SignPKCS1v15 err")
	}
	return base64.StdEncoding.EncodeToString(signatureBytes), nil
}

// buildWechatPayAuthorization 函数说明：构造微信支付V3 Authorization 请求头。
func buildWechatPayAuthorization(cfg frontendWechatV3Config, nonce string, timestamp string, signature string) string {
	return fmt.Sprintf(
		`WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",signature="%s",timestamp="%s",serial_no="%s"`,
		strings.TrimSpace(cfg.MchID),
		strings.TrimSpace(nonce),
		strings.TrimSpace(signature),
		strings.TrimSpace(timestamp),
		strings.TrimSpace(cfg.SerialNo),
	)
}

// extractWechatPayCanonicalURL 函数说明：提取微信V3签名所需 canonicalURL（path + query）。
func extractWechatPayCanonicalURL(rawURL string) string {
	parsedURL, err := url.Parse(strings.TrimSpace(rawURL))
	if err != nil {
		return "/v3/pay/transactions/h5"
	}
	canonicalURL := parsedURL.EscapedPath()
	if canonicalURL == "" {
		canonicalURL = "/v3/pay/transactions/h5"
	}
	if strings.TrimSpace(parsedURL.RawQuery) != "" {
		canonicalURL = canonicalURL + "?" + strings.TrimSpace(parsedURL.RawQuery)
	}
	return canonicalURL
}

// resolveWechatPayPayerClientIP 函数说明：解析微信H5下单所需 payer_client_ip，优先使用服务端出口IP并回退本地地址。
func resolveWechatPayPayerClientIP() string {
	hostIP := strings.TrimSpace(util.IpUtil.GetHostIp())
	if hostIP != "" {
		return hostIP
	}
	return "127.0.0.1"
}

// verifyWechatPayCallbackSignature 函数说明：按微信支付V3规范校验回调签名，防止伪造通知。
func verifyWechatPayCallbackSignature(platformCertPEM string, timestamp string, nonce string, rawBody []byte, signature string) (e error) {
	certificate, err := parseWechatPlatformCertificatePEM(platformCertPEM)
	if err != nil {
		return err
	}
	publicKey, ok := certificate.PublicKey.(*rsa.PublicKey)
	if !ok {
		return response.AssertArgumentError.Make("微信支付平台证书公钥类型异常")
	}
	signatureBytes, err := base64.StdEncoding.DecodeString(strings.TrimSpace(signature))
	if err != nil {
		return response.AssertArgumentError.Make("微信支付回调签名格式无效")
	}
	signMessage := strings.Join([]string{
		strings.TrimSpace(timestamp),
		strings.TrimSpace(nonce),
		string(rawBody),
	}, "\n") + "\n"
	digest := sha256.Sum256([]byte(signMessage))
	if err = rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, digest[:], signatureBytes); err != nil {
		return response.AssertArgumentError.Make("微信支付回调签名校验失败")
	}
	return nil
}

// decryptWechatPayNotifyCiphertext 函数说明：解密微信支付V3回调密文资源，输出交易明文JSON。
func decryptWechatPayNotifyCiphertext(apiV3Key string, associatedData string, nonce string, ciphertext string) (plainText []byte, e error) {
	keyBytes := []byte(strings.TrimSpace(apiV3Key))
	if len(keyBytes) != 32 {
		return nil, response.AssertArgumentError.Make("微信支付 APIv3 密钥长度必须为 32 字节")
	}
	ciphertextBytes, err := base64.StdEncoding.DecodeString(strings.TrimSpace(ciphertext))
	if err != nil {
		return nil, response.AssertArgumentError.Make("微信支付回调密文格式无效")
	}
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return nil, response.CheckErr(err, "decryptWechatPayNotifyCiphertext NewCipher err")
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, response.CheckErr(err, "decryptWechatPayNotifyCiphertext NewGCM err")
	}
	plainBytes, err := gcm.Open(nil, []byte(strings.TrimSpace(nonce)), ciphertextBytes, []byte(associatedData))
	if err != nil {
		return nil, response.AssertArgumentError.Make("微信支付回调密文解密失败")
	}
	return plainBytes, nil
}

// mapWechatTradeStateToCallbackStatus 函数说明：将微信交易状态映射到系统统一回调状态。
func mapWechatTradeStateToCallbackStatus(tradeState string, eventType string) string {
	event := strings.ToUpper(strings.TrimSpace(eventType))
	if event == "TRANSACTION.SUCCESS" {
		return frontendPaymentCallbackResultSuccess
	}
	if event == "TRANSACTION.CLOSED" {
		return frontendPaymentCallbackResultClosed
	}
	state := strings.ToUpper(strings.TrimSpace(tradeState))
	switch state {
	case "SUCCESS":
		return frontendPaymentCallbackResultSuccess
	case "CLOSED", "REVOKED":
		return frontendPaymentCallbackResultClosed
	case "NOTPAY", "USERPAYING":
		return frontendPaymentCallbackResultProcessing
	default:
		return frontendPaymentCallbackResultFailed
	}
}

// parseWechatHeaderTimestamp 函数说明：解析微信回调头时间戳，非法时返回当前时间戳作为兜底。
func parseWechatHeaderTimestamp(raw string) int64 {
	parsed, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil || parsed <= 0 {
		return time.Now().Unix()
	}
	return parsed
}

// paymentChannelName 函数说明：返回支付渠道展示名称，前端可直接展示无需再次映射。
func paymentChannelName(code string) string {
	switch normalizePaymentChannelCode(code) {
	case frontendPayChannelWechatH5:
		return "微信支付"
	case frontendPayChannelAlipayH5:
		return "支付宝"
	default:
		return "测试支付"
	}
}

// paymentChannelDescription 函数说明：返回渠道说明，便于前端展示“是否需要跳转支付页”。
func paymentChannelDescription(code string) string {
	switch normalizePaymentChannelCode(code) {
	case frontendPayChannelWechatH5:
		return "下单后跳转微信支付页，支付成功后由支付回调自动到账。"
	case frontendPayChannelAlipayH5:
		return "下单后跳转支付宝支付页，支付成功后由支付回调自动到账。"
	default:
		return "开发测试渠道：下单后可直接模拟支付完成。"
	}
}

// requiresPayURL 函数说明：判断渠道是否依赖支付跳转地址。
func requiresPayURL(code string) bool {
	channelCode := normalizePaymentChannelCode(code)
	return channelCode == frontendPayChannelWechatH5 || channelCode == frontendPayChannelAlipayH5
}

// findPaymentChannel 函数说明：按编码查找可用支付渠道配置。
func (cfg frontendCommerceConfig) findPaymentChannel(code string) (frontendPaymentChannel, bool) {
	targetCode := normalizePaymentChannelCode(code)
	for _, item := range cfg.PaymentChannels {
		if normalizePaymentChannelCode(item.Code) == targetCode {
			return item, true
		}
	}
	return frontendPaymentChannel{}, false
}

// buildFrontendPaymentURL 函数说明：按订单号构造支付跳转地址，兼容 query 拼接与占位符替换。
func buildFrontendPaymentURL(rawURL string, payChannel string, orderSN string) string {
	baseURL := strings.TrimSpace(rawURL)
	if baseURL == "" {
		return ""
	}
	baseURL = strings.ReplaceAll(baseURL, "{orderSn}", strings.TrimSpace(orderSN))
	baseURL = strings.ReplaceAll(baseURL, "{payChannel}", strings.TrimSpace(payChannel))
	parsedURL, err := url.Parse(baseURL)
	if err != nil {
		return baseURL
	}
	query := parsedURL.Query()
	if strings.TrimSpace(orderSN) != "" {
		query.Set("orderSn", strings.TrimSpace(orderSN))
	}
	if strings.TrimSpace(payChannel) != "" {
		query.Set("payChannel", strings.TrimSpace(payChannel))
	}
	parsedURL.RawQuery = query.Encode()
	return parsedURL.String()
}

// buildFrontendPaymentPayload 函数说明：构造前台支付引导数据（跳转地址/回调接口/渠道说明）。
func buildFrontendPaymentPayload(cfg frontendCommerceConfig, payChannel string, orderSN string) map[string]interface{} {
	channel, ok := cfg.findPaymentChannel(payChannel)
	if !ok {
		return nil
	}
	callbackAPI := "/api/common/frontend-user/purchase/callback"
	if normalizePaymentChannelCode(channel.Code) == frontendPayChannelWechatH5 {
		callbackAPI = resolveFrontendWechatNotifyURL(cfg.WechatV3.NotifyURL)
	}
	payload := map[string]interface{}{
		"mode":        channel.Code,
		"modeText":    channel.Name,
		"description": channel.Description,
		"configured":  channel.Configured,
		"orderSn":     strings.TrimSpace(orderSN),
		"callbackApi": callbackAPI,
	}
	payURL := buildFrontendPaymentURL(channel.PayUrl, channel.Code, orderSN)
	if payURL != "" {
		payload["payUrl"] = payURL
	}
	return payload
}

// buildPaymentCallbackLegacySign 函数说明：构造支付回调旧版签名（兼容历史网关：orderSn|payChannel|tradeNo|secret）。
func buildPaymentCallbackLegacySign(orderSN string, payChannel string, tradeNo string, secret string) string {
	source := strings.Join([]string{
		strings.TrimSpace(orderSN),
		strings.TrimSpace(payChannel),
		strings.TrimSpace(tradeNo),
		strings.TrimSpace(secret),
	}, "|")
	sum := sha256.Sum256([]byte(source))
	return hex.EncodeToString(sum[:])
}

// buildPaymentCallbackSecureSign 函数说明：构造支付回调安全签名（含 status/timestamp/nonce），用于防重放与防篡改。
func buildPaymentCallbackSecureSign(orderSN string, payChannel string, tradeNo string, status string, timestamp int64, nonce string, secret string) string {
	source := strings.Join([]string{
		strings.TrimSpace(orderSN),
		strings.TrimSpace(payChannel),
		strings.TrimSpace(tradeNo),
		strings.TrimSpace(status),
		strconv.FormatInt(timestamp, 10),
		strings.TrimSpace(nonce),
		strings.TrimSpace(secret),
	}, "|")
	sum := sha256.Sum256([]byte(source))
	return hex.EncodeToString(sum[:])
}

// normalizePaymentCallbackNonce 函数说明：标准化回调随机串，统一做 trim + 大写，避免大小写导致幂等键不一致。
func normalizePaymentCallbackNonce(raw string) string {
	return strings.ToUpper(strings.TrimSpace(raw))
}

// buildPaymentCallbackNonceRedisKey 函数说明：生成回调 nonce 幂等键，防止同一随机串被重复使用。
func buildPaymentCallbackNonceRedisKey(orderSN string, nonce string) string {
	source := strings.Join([]string{
		strings.TrimSpace(orderSN),
		strings.TrimSpace(nonce),
	}, "|")
	sum := sha256.Sum256([]byte(source))
	return frontendPaymentCallbackNonceRedisKeyPrefix + hex.EncodeToString(sum[:16])
}

// buildPaymentCallbackEventRedisKey 函数说明：生成回调事件幂等键（订单号+渠道+交易号+状态），用于防止重复回调重复入账。
func buildPaymentCallbackEventRedisKey(orderSN string, payChannel string, tradeNo string, callbackResult string) string {
	source := strings.Join([]string{
		strings.TrimSpace(orderSN),
		strings.TrimSpace(payChannel),
		strings.TrimSpace(tradeNo),
		strings.TrimSpace(callbackResult),
	}, "|")
	sum := sha256.Sum256([]byte(source))
	return frontendPaymentCallbackEventRedisKeyPrefix + hex.EncodeToString(sum[:16])
}

// buildPaymentCallbackLockRedisKey 函数说明：生成回调处理锁键，避免并发回调同时入账导致重复发权益。
func buildPaymentCallbackLockRedisKey(orderSN string, payChannel string, tradeNo string) string {
	source := strings.Join([]string{
		strings.TrimSpace(orderSN),
		strings.TrimSpace(payChannel),
		strings.TrimSpace(tradeNo),
	}, "|")
	sum := sha256.Sum256([]byte(source))
	return frontendPaymentCallbackLockRedisKeyPrefix + hex.EncodeToString(sum[:16])
}

// validatePaymentCallbackTimestamp 函数说明：校验回调时间戳与服务端时间偏差，避免过旧请求重放。
func validatePaymentCallbackTimestamp(timestamp int64) error {
	if timestamp <= 0 {
		return nil
	}
	now := time.Now().Unix()
	diff := now - timestamp
	if diff < 0 {
		diff = -diff
	}
	if diff > frontendPaymentCallbackAllowedSkewSeconds {
		return response.AssertArgumentError.Make("支付回调时间戳已过期，请使用最新回调重试")
	}
	return nil
}

// resolvePaymentCallbackReplayKeys 函数说明：根据回调参数生成事件幂等键与 nonce 防重放键。
func resolvePaymentCallbackReplayKeys(orderSN string, payChannel string, tradeNo string, callbackResult string, timestamp int64, nonce string) (eventKey string, nonceKey string) {
	eventKey = buildPaymentCallbackEventRedisKey(orderSN, payChannel, tradeNo, callbackResult)
	if timestamp > 0 && strings.TrimSpace(nonce) != "" {
		nonceKey = buildPaymentCallbackNonceRedisKey(orderSN, nonce)
	}
	return eventKey, nonceKey
}

// buildPaymentRequestSign 函数说明：构造“服务端下单请求”签名，避免支付网关接口被伪造调用。
func buildPaymentRequestSign(orderSN string, payChannel string, amountText string, timestamp string, nonce string, secret string) string {
	source := strings.Join([]string{
		strings.TrimSpace(orderSN),
		strings.TrimSpace(payChannel),
		strings.TrimSpace(amountText),
		strings.TrimSpace(timestamp),
		strings.TrimSpace(nonce),
		strings.TrimSpace(secret),
	}, "|")
	sum := sha256.Sum256([]byte(source))
	return hex.EncodeToString(sum[:])
}

// requestThirdPartyPaymentCreate 函数说明：调用外部支付下单网关，返回 payUrl 与可选 tradeNo。
func requestThirdPartyPaymentCreate(channel frontendPaymentChannel, cfg frontendCommerceConfig, order frontendUserOrderEntity) (payURL string, tradeNo string, e error) {
	createAPI := strings.TrimSpace(channel.CreateApi)
	if createAPI == "" {
		return "", "", nil
	}
	amountText := strconv.FormatFloat(order.Amount, 'f', 2, 64)
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	nonce := strings.ToUpper(util.ToolsUtil.RandomString(16))
	sign := ""
	if strings.TrimSpace(cfg.PaymentRequestSecret) != "" {
		sign = buildPaymentRequestSign(order.OrderSN, channel.Code, amountText, timestamp, nonce, cfg.PaymentRequestSecret)
	}

	requestPayload := map[string]interface{}{
		"orderSn":     strings.TrimSpace(order.OrderSN),
		"payChannel":  strings.TrimSpace(channel.Code),
		"productType": strings.TrimSpace(order.ProductType),
		"productCode": strings.TrimSpace(order.ProductCode),
		"productName": strings.TrimSpace(order.ProductName),
		"amount":      amountText,
		"currency":    strings.TrimSpace(order.Currency),
		"timestamp":   timestamp,
		"nonce":       nonce,
		"notifyApi":   "/api/common/frontend-user/purchase/callback",
	}
	if normalizePaymentChannelCode(channel.Code) == frontendPayChannelWechatH5 {
		requestPayload["notifyApi"] = resolveFrontendWechatNotifyURL(cfg.WechatV3.NotifyURL)
	}
	if sign != "" {
		requestPayload["sign"] = sign
	}

	body, err := json.Marshal(requestPayload)
	if err != nil {
		return "", "", response.CheckErr(err, "requestThirdPartyPaymentCreate Marshal err")
	}
	request, err := http.NewRequest(http.MethodPost, createAPI, bytes.NewReader(body))
	if err != nil {
		return "", "", response.CheckErr(err, "requestThirdPartyPaymentCreate NewRequest err")
	}
	request.Header.Set("Content-Type", "application/json")
	if sign != "" {
		request.Header.Set("X-Payment-Sign", sign)
	}
	authType := normalizePaymentGatewayAuthType(cfg.PaymentAuthType)
	authToken := strings.TrimSpace(cfg.PaymentAuthToken)
	switch authType {
	case "bearer":
		if authToken != "" {
			request.Header.Set("Authorization", "Bearer "+authToken)
		}
	case "header":
		if authToken != "" {
			request.Header.Set(normalizePaymentGatewayAuthHeader(cfg.PaymentAuthHeader), authToken)
		}
	}
	timeoutSeconds := cfg.PaymentTimeout
	if timeoutSeconds < 3 || timeoutSeconds > 60 {
		timeoutSeconds = defaultPaymentTimeoutSeconds
	}
	client := &http.Client{Timeout: time.Duration(timeoutSeconds) * time.Second}
	resp, err := client.Do(request)
	if err != nil {
		return "", "", response.CheckErr(err, "requestThirdPartyPaymentCreate Do err")
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 2*1024*1024))
	if err != nil {
		return "", "", response.CheckErr(err, "requestThirdPartyPaymentCreate ReadAll err")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", "", response.AssertArgumentError.Make(fmt.Sprintf("支付下单接口请求失败（HTTP %d）", resp.StatusCode))
	}

	respData := make(map[string]interface{})
	if err = json.Unmarshal(respBody, &respData); err != nil {
		return "", "", response.AssertArgumentError.Make("支付下单接口响应格式错误，请检查网关返回")
	}

	if rawCode, ok := respData["code"]; ok {
		codeText := strings.ToLower(strings.TrimSpace(parseAnyString(rawCode)))
		codeValue := parseAnyInt64(rawCode, -1)
		if codeText != "ok" && codeText != "success" && codeValue != 0 && codeValue != 200 {
			return "", "", response.AssertArgumentError.Make("支付下单接口返回失败：" + strings.TrimSpace(parseAnyString(respData["msg"])))
		}
	}

	payloadData := respData
	if rawData, ok := respData["data"]; ok {
		if dataMap, ok := rawData.(map[string]interface{}); ok {
			payloadData = dataMap
		}
	}
	payURL = strings.TrimSpace(parseAnyString(payloadData["payUrl"]))
	if payURL == "" {
		payURL = strings.TrimSpace(parseAnyString(payloadData["pay_url"]))
	}
	if payURL == "" {
		payURL = strings.TrimSpace(parseAnyString(payloadData["mwebUrl"]))
	}
	if payURL == "" {
		payURL = strings.TrimSpace(parseAnyString(payloadData["url"]))
	}
	tradeNo = strings.TrimSpace(parseAnyString(payloadData["tradeNo"]))
	if tradeNo == "" {
		tradeNo = strings.TrimSpace(parseAnyString(payloadData["trade_no"]))
	}
	if tradeNo == "" {
		tradeNo = strings.TrimSpace(parseAnyString(payloadData["prepayId"]))
	}
	return payURL, tradeNo, nil
}

// requestWechatPayV3H5Create 函数说明：使用微信支付V3官方接口创建H5支付单，返回 h5_url 与可选交易号。
func requestWechatPayV3H5Create(cfg frontendCommerceConfig, order frontendUserOrderEntity) (payURL string, tradeNo string, e error) {
	wechatCfg := cfg.WechatV3
	if !wechatCfg.Enabled {
		return "", "", nil
	}
	privateKey, err := parseWechatPrivateKeyPEM(wechatCfg.PrivateKeyPEM)
	if err != nil {
		return "", "", err
	}
	amountFen := int64(math.Round(order.Amount * 100))
	if amountFen <= 0 {
		return "", "", response.AssertArgumentError.Make("微信支付下单金额无效")
	}
	requestBodyMap := map[string]interface{}{
		"appid":        strings.TrimSpace(wechatCfg.AppID),
		"mchid":        strings.TrimSpace(wechatCfg.MchID),
		"description":  strings.TrimSpace(order.ProductName),
		"out_trade_no": strings.TrimSpace(order.OrderSN),
		"notify_url":   resolveFrontendWechatNotifyURL(wechatCfg.NotifyURL),
		"amount": map[string]interface{}{
			"total":    amountFen,
			"currency": "CNY",
		},
		"scene_info": map[string]interface{}{
			"payer_client_ip": resolveWechatPayPayerClientIP(),
			"h5_info": map[string]interface{}{
				"type": "Wap",
			},
		},
	}
	requestBody, err := json.Marshal(requestBodyMap)
	if err != nil {
		return "", "", response.CheckErr(err, "requestWechatPayV3H5Create Marshal err")
	}
	orderAPI := strings.TrimSpace(wechatCfg.UnifiedOrderAPI)
	if orderAPI == "" {
		orderAPI = defaultWechatPayV3H5OrderAPI
	}
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	nonce := strings.ToUpper(util.ToolsUtil.RandomString(16))
	signMessage := buildWechatPayRequestSignMessage(http.MethodPost, extractWechatPayCanonicalURL(orderAPI), timestamp, nonce, string(requestBody))
	signature, err := signWechatPayRequest(privateKey, signMessage)
	if err != nil {
		return "", "", err
	}
	request, err := http.NewRequest(http.MethodPost, orderAPI, bytes.NewReader(requestBody))
	if err != nil {
		return "", "", response.CheckErr(err, "requestWechatPayV3H5Create NewRequest err")
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")
	request.Header.Set("User-Agent", "uiedtool/1.0")
	request.Header.Set("Authorization", buildWechatPayAuthorization(wechatCfg, nonce, timestamp, signature))
	client := &http.Client{Timeout: time.Duration(cfg.PaymentTimeout) * time.Second}
	responseEntity, err := client.Do(request)
	if err != nil {
		return "", "", response.CheckErr(err, "requestWechatPayV3H5Create Do err")
	}
	defer responseEntity.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(responseEntity.Body, 2*1024*1024))
	if err != nil {
		return "", "", response.CheckErr(err, "requestWechatPayV3H5Create ReadAll err")
	}
	responseData := make(map[string]interface{})
	if len(responseBody) > 0 {
		_ = json.Unmarshal(responseBody, &responseData)
	}
	if responseEntity.StatusCode < 200 || responseEntity.StatusCode >= 300 {
		errCode := strings.TrimSpace(parseAnyString(responseData["code"]))
		errMessage := strings.TrimSpace(parseAnyString(responseData["message"]))
		if errMessage == "" {
			errMessage = strings.TrimSpace(string(responseBody))
		}
		if errCode != "" {
			return "", "", response.AssertArgumentError.Make(fmt.Sprintf("微信支付下单失败（%s）：%s", errCode, errMessage))
		}
		return "", "", response.AssertArgumentError.Make("微信支付下单失败：" + errMessage)
	}
	payURL = strings.TrimSpace(parseAnyString(responseData["h5_url"]))
	if payURL == "" {
		payURL = strings.TrimSpace(parseAnyString(responseData["h5Url"]))
	}
	tradeNo = strings.TrimSpace(parseAnyString(responseData["transaction_id"]))
	if payURL == "" {
		return "", "", response.AssertArgumentError.Make("微信支付下单成功但未返回 h5_url")
	}
	return payURL, tradeNo, nil
}

// buildOrderPaymentPayload 函数说明：为订单生成支付引导数据，支持“固定支付页”与“服务端下单网关”两种模式。
func buildOrderPaymentPayload(order frontendUserOrderEntity, channel frontendPaymentChannel, cfg frontendCommerceConfig) (payload map[string]interface{}, tradeNo string, e error) {
	payURL := buildFrontendPaymentURL(channel.PayUrl, channel.Code, order.OrderSN)
	gatewayPayURL, gatewayTradeNo, err := requestThirdPartyPaymentCreate(channel, cfg, order)
	if err != nil {
		return nil, "", err
	}
	if strings.TrimSpace(gatewayPayURL) != "" {
		payURL = strings.TrimSpace(gatewayPayURL)
	}
	if strings.TrimSpace(gatewayTradeNo) != "" {
		tradeNo = strings.TrimSpace(gatewayTradeNo)
	}
	if normalizePaymentChannelCode(channel.Code) == frontendPayChannelWechatH5 && strings.TrimSpace(payURL) == "" {
		wechatPayURL, wechatTradeNo, wechatErr := requestWechatPayV3H5Create(cfg, order)
		if wechatErr != nil {
			return nil, "", wechatErr
		}
		if strings.TrimSpace(wechatPayURL) != "" {
			payURL = strings.TrimSpace(wechatPayURL)
		}
		if strings.TrimSpace(wechatTradeNo) != "" {
			tradeNo = strings.TrimSpace(wechatTradeNo)
		}
	}
	if requiresPayURL(channel.Code) && strings.TrimSpace(payURL) == "" {
		return nil, "", response.AssertArgumentError.Make("支付渠道未返回有效支付链接，请检查支付网关配置")
	}

	payload = buildFrontendPaymentPayload(cfg, channel.Code, order.OrderSN)
	if payload == nil {
		callbackAPI := "/api/common/frontend-user/purchase/callback"
		if normalizePaymentChannelCode(channel.Code) == frontendPayChannelWechatH5 {
			callbackAPI = resolveFrontendWechatNotifyURL(cfg.WechatV3.NotifyURL)
		}
		payload = map[string]interface{}{
			"mode":        channel.Code,
			"modeText":    channel.Name,
			"description": channel.Description,
			"configured":  channel.Configured,
			"orderSn":     strings.TrimSpace(order.OrderSN),
			"callbackApi": callbackAPI,
		}
	}
	if strings.TrimSpace(payURL) != "" {
		payload["payUrl"] = strings.TrimSpace(payURL)
	}
	if strings.TrimSpace(tradeNo) != "" {
		payload["tradeNo"] = strings.TrimSpace(tradeNo)
	}
	return payload, tradeNo, nil
}

// normalizeMemberLevel 函数说明：规范会员等级文本，空值回退为 free。
func normalizeMemberLevel(raw string) string {
	level := strings.ToLower(strings.TrimSpace(raw))
	if level == "" {
		return frontendMemberLevelFree
	}
	return level
}

// isMemberActive 函数说明：判断用户会员是否在有效期内。
func isMemberActive(user frontendUserEntity) bool {
	level := normalizeMemberLevel(user.MemberLevel)
	if level == frontendMemberLevelFree {
		return false
	}
	now := time.Now().Unix()
	return user.MemberExpireTime > now
}

type frontendUserPointsPolicy struct {
	DailyGiftPoints   int64
	ToolConsumePoints int64
	MemberLevel       string
	MemberActive      bool
	AppliedRule       frontendToolConsumeRule
	RuleMatched       bool
}

// matchToolConsumeRule 函数说明：按 toolKey 命中启用中的规则配置，未命中时返回 false。
func matchToolConsumeRule(toolKey string, rules []frontendToolConsumeRule) (frontendToolConsumeRule, bool) {
	normalizedToolKey := normalizeToolConsumeRuleToolKey(toolKey)
	if normalizedToolKey == "" || len(rules) == 0 {
		return frontendToolConsumeRule{}, false
	}
	for _, item := range rules {
		if !item.Status {
			continue
		}
		if normalizeToolConsumeRuleToolKey(item.ToolKey) == normalizedToolKey {
			return item, true
		}
	}
	return frontendToolConsumeRule{}, false
}

// resolveUserPointsPolicy 函数说明：根据用户状态与 toolKey 解析当前生效积分策略（支持按工具覆盖）。
func resolveUserPointsPolicy(user frontendUserEntity, cfg frontendPointsConfig, toolKey string) frontendUserPointsPolicy {
	level := normalizeMemberLevel(user.MemberLevel)
	memberActive := cfg.MemberEnabled && isMemberActive(user)
	toolConsumePoints := cfg.ToolConsumePoints
	appliedRule, ruleMatched := matchToolConsumeRule(toolKey, cfg.ToolConsumeRules)
	memberFree := true
	if ruleMatched {
		toolConsumePoints = appliedRule.ConsumePoints
		memberFree = appliedRule.MemberFree
	}
	if memberActive {
		if memberFree {
			toolConsumePoints = 0
		}
	}
	if toolConsumePoints < 0 {
		toolConsumePoints = 0
	}
	return frontendUserPointsPolicy{
		DailyGiftPoints:   cfg.DailyGiftPoints,
		ToolConsumePoints: toolConsumePoints,
		MemberLevel:       level,
		MemberActive:      memberActive,
		AppliedRule:       appliedRule,
		RuleMatched:       ruleMatched,
	}
}

// normalizeMemberPlans 函数说明：清洗会员套餐配置并按 sort 升序，过滤无效项。
func normalizeMemberPlans(plans []frontendMemberPlan) []frontendMemberPlan {
	result := make([]frontendMemberPlan, 0, len(plans))
	for _, item := range plans {
		item.Code = strings.TrimSpace(item.Code)
		item.Name = strings.TrimSpace(item.Name)
		item.Badge = strings.TrimSpace(item.Badge)
		if item.Status != 0 {
			item.Status = 1
		}
		if item.Code == "" || item.Name == "" || item.MemberDays <= 0 {
			continue
		}
		if item.Price < 0 {
			item.Price = 0
		}
		if item.GiftPoints < 0 {
			item.GiftPoints = 0
		}
		result = append(result, item)
	}
	sort.SliceStable(result, func(i, j int) bool {
		if result[i].Sort == result[j].Sort {
			return result[i].Code < result[j].Code
		}
		return result[i].Sort < result[j].Sort
	})
	return result
}

// normalizePointsPacks 函数说明：清洗积分包配置并按 sort 升序，过滤无效项。
func normalizePointsPacks(packs []frontendPointsPack) []frontendPointsPack {
	result := make([]frontendPointsPack, 0, len(packs))
	for _, item := range packs {
		item.Code = strings.TrimSpace(item.Code)
		item.Name = strings.TrimSpace(item.Name)
		if item.Status != 0 {
			item.Status = 1
		}
		if item.Code == "" || item.Name == "" || item.Points <= 0 {
			continue
		}
		if item.Price < 0 {
			item.Price = 0
		}
		if item.GiftPoints < 0 {
			item.GiftPoints = 0
		}
		result = append(result, item)
	}
	sort.SliceStable(result, func(i, j int) bool {
		if result[i].Sort == result[j].Sort {
			return result[i].Code < result[j].Code
		}
		return result[i].Sort < result[j].Sort
	})
	return result
}

// parseMemberPlansConfig 函数说明：解析会员套餐 JSON 配置，失败时回退空数组。
func parseMemberPlansConfig(raw string) []frontendMemberPlan {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return []frontendMemberPlan{}
	}
	var plans []frontendMemberPlan
	if err := json.Unmarshal([]byte(trimmed), &plans); err != nil {
		return []frontendMemberPlan{}
	}
	return normalizeMemberPlans(plans)
}

// parsePointsPacksConfig 函数说明：解析积分包 JSON 配置，失败时回退空数组。
func parsePointsPacksConfig(raw string) []frontendPointsPack {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return []frontendPointsPack{}
	}
	var packs []frontendPointsPack
	if err := json.Unmarshal([]byte(trimmed), &packs); err != nil {
		return []frontendPointsPack{}
	}
	return normalizePointsPacks(packs)
}

// activeMemberPlans 函数说明：筛选可售卖的会员套餐。
func activeMemberPlans(plans []frontendMemberPlan) []frontendMemberPlan {
	result := make([]frontendMemberPlan, 0, len(plans))
	for _, item := range plans {
		if item.Status == 1 {
			result = append(result, item)
		}
	}
	return result
}

// activePointsPacks 函数说明：筛选可售卖的积分包。
func activePointsPacks(packs []frontendPointsPack) []frontendPointsPack {
	result := make([]frontendPointsPack, 0, len(packs))
	for _, item := range packs {
		if item.Status == 1 {
			result = append(result, item)
		}
	}
	return result
}

// findMemberPlanByCode 函数说明：按编码读取启用的会员套餐。
func findMemberPlanByCode(plans []frontendMemberPlan, code string) (frontendMemberPlan, bool) {
	trimmedCode := strings.TrimSpace(code)
	for _, item := range plans {
		if item.Status == 1 && item.Code == trimmedCode {
			return item, true
		}
	}
	return frontendMemberPlan{}, false
}

// findPointsPackByCode 函数说明：按编码读取启用的积分包。
func findPointsPackByCode(packs []frontendPointsPack, code string) (frontendPointsPack, bool) {
	trimmedCode := strings.TrimSpace(code)
	for _, item := range packs {
		if item.Status == 1 && item.Code == trimmedCode {
			return item, true
		}
	}
	return frontendPointsPack{}, false
}

// getFrontendPointsConfig 函数说明：读取登录配置中的积分规则，缺省时回退默认每日50分/每次1分。
func (srv frontendUserService) getFrontendPointsConfig() (cfg frontendPointsConfig, e error) {
	data, err := util.ConfigUtil.Get(srv.db, loginConfigType)
	if e = response.CheckErr(err, "getFrontendPointsConfig Config Get err"); e != nil {
		return cfg, e
	}
	cfg.DailyGiftPoints = parsePositiveInt(data[loginConfigDailyGiftPointsKey], defaultDailyGiftPoints)
	cfg.ToolConsumePoints = parsePositiveInt(data[loginConfigToolConsumePointsKey], defaultToolConsumePoints)
	toolConsumeRulesRaw := strings.TrimSpace(data[loginConfigToolConsumeRulesKey])
	if toolConsumeRulesRaw == "" {
		toolConsumeRulesRaw = defaultToolConsumeRulesJSON
	}
	consumeRiskRulesRaw := strings.TrimSpace(data[loginConfigConsumeRiskRulesKey])
	if consumeRiskRulesRaw == "" {
		consumeRiskRulesRaw = defaultConsumeRiskRulesJSON
	}
	cfg.ToolConsumeRules = parseToolConsumeRulesConfig(toolConsumeRulesRaw)
	cfg.ConsumeRiskRule = parseConsumeRiskRuleConfig(consumeRiskRulesRaw)
	cfg.MemberEnabled = parseBoolFlag(data[loginConfigMemberEnabledKey], defaultMemberEnabled)
	cfg.MemberTrialDays = parseNonNegativeInt(data[loginConfigMemberTrialDaysKey], defaultMemberTrialDays)
	return cfg, nil
}

// getFrontendCommerceConfig 函数说明：读取会员套餐、积分包和权益说明配置，供前台用户中心展示与购买。
func (srv frontendUserService) getFrontendCommerceConfig() (cfg frontendCommerceConfig, e error) {
	data, err := util.ConfigUtil.Get(srv.db, loginConfigType)
	if e = response.CheckErr(err, "getFrontendCommerceConfig Config Get err"); e != nil {
		return cfg, e
	}
	memberPlansRaw := strings.TrimSpace(data[loginConfigMemberPlansKey])
	if memberPlansRaw == "" {
		memberPlansRaw = defaultMemberPlansJSON
	}
	pointsPacksRaw := strings.TrimSpace(data[loginConfigPointsPacksKey])
	if pointsPacksRaw == "" {
		pointsPacksRaw = defaultPointsPacksJSON
	}
	cfg.MemberPlans = parseMemberPlansConfig(memberPlansRaw)
	cfg.PointsPacks = parsePointsPacksConfig(pointsPacksRaw)
	cfg.MemberRightsIntro = strings.TrimSpace(data[loginConfigMemberRightsIntroKey])
	if cfg.MemberRightsIntro == "" {
		cfg.MemberRightsIntro = defaultMemberRightsIntro
	}
	cfg.WechatV3 = buildFrontendWechatV3Config(data)
	paymentChannelsRaw := strings.TrimSpace(data[loginConfigPaymentChannelsKey])
	if paymentChannelsRaw == "" {
		paymentChannelsRaw = defaultPaymentChannels
	}
	paymentChannelCodes := parsePaymentChannels(paymentChannelsRaw)
	if len(paymentChannelCodes) == 0 {
		paymentChannelCodes = defaultRuntimePaymentChannels()
	}
	wechatPayURL := strings.TrimSpace(data[loginConfigPaymentWechatURLKey])
	wechatCreateAPI := strings.TrimSpace(data[loginConfigPaymentWechatCreateKey])
	alipayPayURL := strings.TrimSpace(data[loginConfigPaymentAlipayURLKey])
	alipayCreateAPI := strings.TrimSpace(data[loginConfigPaymentAlipayCreateKey])
	cfg.PaymentSecret = strings.TrimSpace(data[loginConfigPaymentCallbackKey])
	cfg.PaymentRequestSecret = strings.TrimSpace(data[loginConfigPaymentRequestKey])
	cfg.PaymentAuthType = normalizePaymentGatewayAuthType(data[loginConfigPaymentAuthTypeKey])
	cfg.PaymentAuthHeader = normalizePaymentGatewayAuthHeader(data[loginConfigPaymentAuthHeaderKey])
	cfg.PaymentAuthToken = strings.TrimSpace(data[loginConfigPaymentAuthTokenKey])
	cfg.PaymentTimeout = normalizePaymentGatewayTimeout(data[loginConfigPaymentTimeoutKey])
	cfg.PaymentChannels = make([]frontendPaymentChannel, 0, len(paymentChannelCodes))
	for _, channelCode := range paymentChannelCodes {
		payURL := ""
		createAPI := ""
		switch channelCode {
		case frontendPayChannelWechatH5:
			payURL = wechatPayURL
			createAPI = wechatCreateAPI
		case frontendPayChannelAlipayH5:
			payURL = alipayPayURL
			createAPI = alipayCreateAPI
		}
		channel := frontendPaymentChannel{
			Code:        channelCode,
			Name:        paymentChannelName(channelCode),
			Description: paymentChannelDescription(channelCode),
			PayUrl:      payURL,
			CreateApi:   createAPI,
			Configured:  !requiresPayURL(channelCode) || strings.TrimSpace(payURL) != "" || strings.TrimSpace(createAPI) != "" || (channelCode == frontendPayChannelWechatH5 && cfg.WechatV3.Enabled),
		}
		cfg.PaymentChannels = append(cfg.PaymentChannels, channel)
	}
	return cfg, nil
}

// buildFrontendOrderSN 函数说明：生成前台购买订单号，格式为 UO + 时间 + 随机串。
func buildFrontendOrderSN() string {
	return fmt.Sprintf("UO%s%s", time.Now().Format("20060102150405"), strings.ToUpper(util.ToolsUtil.RandomString(6)))
}

// appendPointsLog 函数说明：写入积分流水记录，统一沉淀赠送与扣减明细。
func appendPointsLog(tx *gorm.DB, userID uint, changeType string, changeAmount int64, balanceAfter int64, toolKey string, action string, orderSN string, remark string) error {
	logModel := frontendUserPointsLogEntity{
		UserID:       userID,
		ChangeType:   strings.TrimSpace(changeType),
		ChangeAmount: changeAmount,
		BalanceAfter: balanceAfter,
		ToolKey:      strings.TrimSpace(toolKey),
		Action:       strings.TrimSpace(action),
		OrderSN:      strings.TrimSpace(orderSN),
		Remark:       strings.TrimSpace(remark),
		CreateTime:   time.Now().Unix(),
	}
	if logModel.ChangeType == "" {
		logModel.ChangeType = "unknown"
	}
	if err := tx.Create(&logModel).Error; err != nil {
		return response.CheckErr(err, "appendPointsLog Create err")
	}
	return nil
}

// applyDailyGiftIfNeeded 函数说明：通过带日期条件的原子更新发放每日积分，避免并发请求重复赠送。
func (srv frontendUserService) applyDailyGiftIfNeeded(tx *gorm.DB, user frontendUserEntity, dailyGiftPoints int64) (nextUser frontendUserEntity, gifted bool, e error) {
	if dailyGiftPoints <= 0 {
		return user, false, nil
	}
	today := time.Now().In(time.Local).Format("2006-01-02")
	if strings.TrimSpace(user.PointsGiftDay) == today {
		return user, false, nil
	}
	now := time.Now().Unix()
	updateResult := tx.Model(&frontendUserEntity{}).
		Where("id = ? AND is_delete = ? AND COALESCE(points_daily_grant_date, '') <> ?", user.ID, 0, today).
		Updates(map[string]interface{}{
			"points_balance":          gorm.Expr("points_balance + ?", dailyGiftPoints),
			"points_total_earned":     gorm.Expr("points_total_earned + ?", dailyGiftPoints),
			"points_daily_grant_date": today,
			"update_time":             now,
		})
	if e = response.CheckErr(updateResult.Error, "applyDailyGiftIfNeeded Updates err"); e != nil {
		return user, false, e
	}

	if err := tx.Where("id = ? AND is_delete = ?", user.ID, 0).Limit(1).First(&nextUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return user, false, response.TokenInvalid
		}
		if e = response.CheckErr(err, "applyDailyGiftIfNeeded First err"); e != nil {
			return user, false, e
		}
	}
	if updateResult.RowsAffected == 0 {
		return nextUser, false, nil
	}
	if err := appendPointsLog(tx, user.ID, "daily_gift", dailyGiftPoints, nextUser.PointsBalance, "", "", "", "每日赠送积分"); err != nil {
		return user, false, err
	}
	return nextUser, true, nil
}

// buildConsumeRiskRedisKey 函数说明：构建积分扣减风控计数键，按用户+工具+动作+时间窗口隔离。
func buildConsumeRiskRedisKey(userID uint, toolKey string, action string, window string, bucket string) string {
	return fmt.Sprintf(
		"%s%d:%s:%s:%s:%s",
		frontendUserConsumeRiskRedisKeyPrefix,
		userID,
		normalizeToolConsumeRuleToolKey(toolKey),
		strings.ToLower(strings.TrimSpace(action)),
		strings.TrimSpace(window),
		strings.TrimSpace(bucket),
	)
}

// applyConsumeRiskWindowLimit 函数说明：执行单个时间窗口限流校验，超限时返回统一业务错误。
func applyConsumeRiskWindowLimit(userID uint, toolKey string, action string, window string, bucket string, windowSeconds int, limit int64, windowText string) error {
	if limit <= 0 {
		return nil
	}
	riskKey := buildConsumeRiskRedisKey(userID, toolKey, action, window, bucket)
	count := util.RedisUtil.IncrWithExpire(riskKey, windowSeconds)
	if count <= 0 {
		// Redis异常时按“降级放行”处理，避免影响核心工具可用性。
		return nil
	}
	if count > limit {
		return response.AssertArgumentError.Make(fmt.Sprintf("操作过于频繁：%s最多允许 %d 次，请稍后重试", strings.TrimSpace(windowText), limit))
	}
	return nil
}

// applyConsumeRiskLimits 函数说明：按分钟/小时/每日风控规则校验工具调用频次，防止异常刷接口。
func applyConsumeRiskLimits(userID uint, toolKey string, action string, riskRule frontendConsumeRiskRule) error {
	now := time.Now().In(time.Local)
	if err := applyConsumeRiskWindowLimit(userID, toolKey, action, "minute", now.Format("200601021504"), 60, riskRule.PerMinute, "1分钟"); err != nil {
		return err
	}
	if err := applyConsumeRiskWindowLimit(userID, toolKey, action, "hour", now.Format("2006010215"), 3600, riskRule.PerHour, "1小时"); err != nil {
		return err
	}
	if err := applyConsumeRiskWindowLimit(userID, toolKey, action, "day", now.Format("20060102"), 86400, riskRule.PerDay, "1天"); err != nil {
		return err
	}
	return nil
}

// resolveFrontendUserIDByToken 函数说明：根据前台登录令牌解析用户ID，并自动续期。
func resolveFrontendUserIDByToken(frontendToken string) (userID uint, e error) {
	trimmedToken := strings.TrimSpace(frontendToken)
	if trimmedToken == "" {
		return 0, response.TokenEmpty
	}
	tokenKey := buildFrontendTokenRedisKey(trimmedToken)
	exists := util.RedisUtil.Exists(tokenKey)
	if exists <= 0 {
		return 0, response.TokenInvalid
	}

	uidText := strings.TrimSpace(util.RedisUtil.Get(tokenKey))
	if uidText == "" {
		return 0, response.TokenInvalid
	}
	parsed, err := strconv.ParseUint(uidText, 10, 32)
	if err != nil || parsed == 0 {
		return 0, response.TokenInvalid
	}

	if util.RedisUtil.TTL(tokenKey) < 1800 {
		util.RedisUtil.Expire(tokenKey, frontendUserTokenTTLSeconds)
	}
	return uint(parsed), nil
}

// toFrontendUserProfile 函数说明：将 la_user 实体转成前台个人中心所需数据结构。
func toFrontendUserProfile(user frontendUserEntity) map[string]interface{} {
	nickname := strings.TrimSpace(user.Nickname)
	if nickname == "" {
		nickname = strings.TrimSpace(user.Username)
	}
	if nickname == "" {
		nickname = "用户"
	}
	memberLevel := normalizeMemberLevel(user.MemberLevel)
	memberActive := isMemberActive(user)
	memberDisplayName := "普通用户"
	if memberLevel == frontendMemberLevelVip {
		memberDisplayName = "VIP会员"
	}
	if memberLevel != frontendMemberLevelFree && memberDisplayName == "普通用户" {
		memberDisplayName = strings.ToUpper(memberLevel) + "会员"
	}
	if !memberActive && memberLevel != frontendMemberLevelFree {
		memberDisplayName += "（已到期）"
	}
	return map[string]interface{}{
		"uid":                  strconv.FormatUint(uint64(user.ID), 10),
		"nickname":             nickname,
		"qqEmail":              strings.TrimSpace(user.QqEmail),
		"avatar":               util.UrlUtil.ToAbsoluteUrl(strings.TrimSpace(user.Avatar)),
		"pointsBalance":        user.PointsBalance,
		"pointsDailyGrantDate": strings.TrimSpace(user.PointsGiftDay),
		"memberLevel":          memberLevel,
		"memberExpireTime":     user.MemberExpireTime * 1000,
		"memberActive":         memberActive,
		"memberDisplayName":    memberDisplayName,
		"createdAt":            user.CreateTime * 1000,
		"updatedAt":            user.UpdateTime * 1000,
	}
}

// withPointsRules 函数说明：将积分与会员规则补充到前台个人资料响应，前端可直接用于展示规则说明。
func withPointsRules(profile map[string]interface{}, cfg frontendPointsConfig, policy frontendUserPointsPolicy) map[string]interface{} {
	profile["dailyGiftPoints"] = policy.DailyGiftPoints
	profile["toolConsumePoints"] = policy.ToolConsumePoints
	profile["memberEnabled"] = cfg.MemberEnabled
	profile["memberTrialDays"] = cfg.MemberTrialDays
	return profile
}

// findFrontendUserByID 函数说明：按用户ID读取有效用户记录，不存在时返回登录失效错误。
func (srv frontendUserService) findFrontendUserByID(userID uint) (user frontendUserEntity, e error) {
	err := srv.db.Where("id = ? AND is_delete = ?", userID, 0).Limit(1).First(&user).Error
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		return user, response.TokenInvalid
	}
	if e = response.CheckErr(err, "findFrontendUserByID First err"); e != nil {
		return user, e
	}
	return user, nil
}

// nextFrontendUserSN 函数说明：计算下一个用户编号，避免新建用户 sn 一直为 0。
func (srv frontendUserService) nextFrontendUserSN() (sn uint, e error) {
	var maxSN uint
	err := srv.db.Model(&frontendUserEntity{}).Select("COALESCE(MAX(sn), 0)").Scan(&maxSN).Error
	if e = response.CheckErr(err, "nextFrontendUserSN Scan err"); e != nil {
		return 0, e
	}
	return maxSN + 1, nil
}

// createFrontendUser 函数说明：首次登录自动创建前台用户并写入加盐密码。
func (srv frontendUserService) createFrontendUser(nickname string, password string) (user frontendUserEntity, e error) {
	now := time.Now().Unix()
	sn, err := srv.nextFrontendUserSN()
	if err != nil {
		return user, err
	}
	cfg, err := srv.getFrontendPointsConfig()
	if err != nil {
		return user, err
	}
	memberLevel := frontendMemberLevelFree
	memberExpireTime := int64(0)
	if cfg.MemberEnabled && cfg.MemberTrialDays > 0 {
		memberLevel = frontendMemberLevelVip
		memberExpireTime = now + cfg.MemberTrialDays*86400
	}
	salt := util.ToolsUtil.RandomString(5)
	user = frontendUserEntity{
		SN:               sn,
		Nickname:         nickname,
		Username:         nickname,
		RealName:         nickname,
		Password:         util.ToolsUtil.MakeMd5(password + salt),
		Salt:             salt,
		Channel:          4,
		PointsBalance:    0,
		PointsGiftDay:    "",
		PointsEarned:     0,
		PointsUsed:       0,
		MemberLevel:      memberLevel,
		MemberExpireTime: memberExpireTime,
		CreateTime:       now,
		UpdateTime:       now,
	}
	err = srv.db.Create(&user).Error
	if e = response.CheckErr(err, "createFrontendUser Create err"); e != nil {
		return frontendUserEntity{}, e
	}
	return user, nil
}

// loginOrCreateUser 函数说明：按昵称登录；若不存在则自动注册，存在则校验密码。
func (srv frontendUserService) loginOrCreateUser(nickname string, password string) (user frontendUserEntity, e error) {
	err := srv.db.Where("is_delete = ? AND username = ?", 0, nickname).Limit(1).First(&user).Error
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		err = srv.db.Where("is_delete = ? AND nickname = ?", 0, nickname).Limit(1).First(&user).Error
	}
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		return srv.createFrontendUser(nickname, password)
	}
	if e = response.CheckErr(err, "loginOrCreateUser First err"); e != nil {
		return frontendUserEntity{}, e
	}
	if user.IsDisable == 1 {
		return frontendUserEntity{}, response.LoginDisableError
	}
	if user.Password != util.ToolsUtil.MakeMd5(password+user.Salt) {
		return frontendUserEntity{}, response.LoginAccountError
	}
	return user, nil
}

// issueFrontendToken 函数说明：签发前台登录令牌并写入 Redis 持久化会话。
func issueFrontendToken(userID uint) string {
	token := util.ToolsUtil.MakeToken()
	util.RedisUtil.Set(buildFrontendTokenRedisKey(token), strconv.FormatUint(uint64(userID), 10), frontendUserTokenTTLSeconds)
	return token
}

// frontendOrderStatusText 函数说明：将订单状态编码映射为前台可读文案。
func frontendOrderStatusText(status uint8) string {
	switch status {
	case frontendOrderStatusPaid:
		return "已支付"
	case frontendOrderStatusClosed:
		return "已关闭"
	default:
		return "待支付"
	}
}

// frontendOrderCallbackStatusText 函数说明：将回调状态编码映射为前台可读文案。
func frontendOrderCallbackStatusText(status uint8) string {
	switch status {
	case frontendOrderCallbackStatusProcessing:
		return "支付处理中"
	case frontendOrderCallbackStatusSuccess:
		return "回调成功"
	case frontendOrderCallbackStatusFailed:
		return "回调失败"
	default:
		return "未回调"
	}
}

// frontendOrderProductTypeText 函数说明：将订单商品类型映射为前台可读文案。
func frontendOrderProductTypeText(productType string) string {
	if strings.TrimSpace(productType) == "member_plan" {
		return "会员套餐"
	}
	return "积分包"
}

// frontendOrderDeliveryStatusText 函数说明：将前台订单交付状态映射为可读文案。
func frontendOrderDeliveryStatusText(status uint8) string {
	switch status {
	case 1:
		return "已交付"
	case 2:
		return "待补充"
	case 3:
		return "已失效"
	default:
		return "未交付"
	}
}

// maskFrontendOrderLicenseKey 函数说明：脱敏前台订单授权码，避免在用户中心直接泄露完整密钥。
func maskFrontendOrderLicenseKey(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	runes := []rune(trimmed)
	if len(runes) <= 8 {
		return string(runes[:2]) + "****"
	}
	return string(runes[:4]) + "****" + string(runes[len(runes)-4:])
}

// formatOrderItem 函数说明：将订单实体转为前端展示结构。
func formatOrderItem(order frontendUserOrderEntity) map[string]interface{} {
	return map[string]interface{}{
		"id":                   order.ID,
		"orderSn":              order.OrderSN,
		"productType":          order.ProductType,
		"productTypeText":      frontendOrderProductTypeText(order.ProductType),
		"productCode":          order.ProductCode,
		"productName":          order.ProductName,
		"amount":               order.Amount,
		"currency":             order.Currency,
		"status":               order.Status,
		"statusText":           frontendOrderStatusText(order.Status),
		"payChannel":           order.PayChannel,
		"tradeNo":              order.TradeNo,
		"callbackStatus":       order.CallbackStatus,
		"callbackStatusText":   frontendOrderCallbackStatusText(order.CallbackStatus),
		"callbackTime":         order.CallbackTime * 1000,
		"callbackError":        order.CallbackError,
		"memberDays":           order.MemberDays,
		"points":               order.Points,
		"giftPoints":           order.GiftPoints,
		"deliveryStatus":       order.DeliveryStatus,
		"deliveryStatusText":   frontendOrderDeliveryStatusText(order.DeliveryStatus),
		"licenseBoundDomain":   order.LicenseBoundDomain,
		"licenseKeyMasked":     maskFrontendOrderLicenseKey(order.LicenseKey),
		"downloadUrl":          order.DownloadURL,
		"downloadCheckStatus":  order.DownloadCheckStatus,
		"downloadCheckTime":    order.DownloadCheckTime * 1000,
		"downloadCheckMessage": order.DownloadCheckMessage,
		"deliveryNote":         order.DeliveryNote,
		"deliveredTime":        order.DeliveredTime * 1000,
		"remark":               order.Remark,
		"paidTime":             order.PaidTime * 1000,
		"createdAt":            order.CreateTime * 1000,
	}
}

// formatOrderItemWithCommerce 函数说明：在订单基础结构上补齐支付引导信息（仅待支付订单返回）。
func formatOrderItemWithCommerce(order frontendUserOrderEntity, commerceCfg frontendCommerceConfig) map[string]interface{} {
	item := formatOrderItem(order)
	if order.Status != frontendOrderStatusPending {
		return item
	}
	payment := buildFrontendPaymentPayload(commerceCfg, order.PayChannel, order.OrderSN)
	if payment != nil {
		item["payment"] = payment
	}
	return item
}

// applyPaidOrderBenefits 函数说明：在事务中给“已支付订单”发放权益（会员有效期/积分到账）并写入流水。
func applyPaidOrderBenefits(tx *gorm.DB, order frontendUserOrderEntity, paidAt int64) (latestUser frontendUserEntity, e error) {
	var user frontendUserEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND is_delete = ?", order.UserID, 0).Limit(1).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return frontendUserEntity{}, response.TokenInvalid
		}
		return frontendUserEntity{}, response.CheckErr(err, "applyPaidOrderBenefits User First err")
	}

	updatePayload := map[string]interface{}{
		"update_time": paidAt,
	}
	if order.ProductType == "member_plan" {
		effectiveStart := paidAt
		if user.MemberExpireTime > paidAt {
			effectiveStart = user.MemberExpireTime
		}
		updatePayload["member_level"] = frontendMemberLevelVip
		updatePayload["member_expire_time"] = effectiveStart + order.MemberDays*86400
		if order.GiftPoints > 0 {
			updatePayload["points_balance"] = gorm.Expr("points_balance + ?", order.GiftPoints)
			updatePayload["points_total_earned"] = gorm.Expr("points_total_earned + ?", order.GiftPoints)
		}
	} else {
		totalPoints := order.Points + order.GiftPoints
		if totalPoints <= 0 {
			return frontendUserEntity{}, response.AssertArgumentError.Make("积分包配置无效，请联系管理员")
		}
		updatePayload["points_balance"] = gorm.Expr("points_balance + ?", totalPoints)
		updatePayload["points_total_earned"] = gorm.Expr("points_total_earned + ?", totalPoints)
	}

	if err := tx.Model(&frontendUserEntity{}).Where("id = ?", order.UserID).Updates(updatePayload).Error; err != nil {
		return frontendUserEntity{}, response.CheckErr(err, "applyPaidOrderBenefits User Updates err")
	}
	if err := tx.Where("id = ? AND is_delete = ?", order.UserID, 0).Limit(1).First(&latestUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return frontendUserEntity{}, response.TokenInvalid
		}
		return frontendUserEntity{}, response.CheckErr(err, "applyPaidOrderBenefits User Latest err")
	}

	if order.ProductType == "member_plan" && order.GiftPoints > 0 {
		if err := appendPointsLog(tx, latestUser.ID, "member_plan_gift", order.GiftPoints, latestUser.PointsBalance, "", "", order.OrderSN, "会员套餐赠送积分"); err != nil {
			return frontendUserEntity{}, err
		}
	}
	if order.ProductType == "points_pack" {
		totalPoints := order.Points + order.GiftPoints
		if err := appendPointsLog(tx, latestUser.ID, "points_pack_recharge", totalPoints, latestUser.PointsBalance, "", "", order.OrderSN, "积分包充值到账"); err != nil {
			return frontendUserEntity{}, err
		}
	}
	return latestUser, nil
}

// markOrderCallbackFailedInTx 函数说明：在事务内记录订单回调失败信息，便于后台快速排查支付异常。
func markOrderCallbackFailedInTx(tx *gorm.DB, order *frontendUserOrderEntity, failedAt int64, callbackError string) (e error) {
	nextError := strings.TrimSpace(callbackError)
	if nextError == "" {
		nextError = "支付回调失败"
	}
	nextRemark := strings.TrimSpace(order.Remark)
	failedRemark := "回调失败：" + nextError
	if nextRemark == "" || !strings.Contains(nextRemark, "回调失败") {
		nextRemark = failedRemark
	}
	if err := tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(map[string]interface{}{
		"callback_status": frontendOrderCallbackStatusFailed,
		"callback_time":   failedAt,
		"callback_error":  nextError,
		"remark":          nextRemark,
		"update_time":     failedAt,
	}).Error; err != nil {
		return response.CheckErr(err, "markOrderCallbackFailedInTx Order Updates err")
	}
	order.CallbackStatus = frontendOrderCallbackStatusFailed
	order.CallbackTime = failedAt
	order.CallbackError = nextError
	order.Remark = nextRemark
	order.UpdateTime = failedAt
	return nil
}

// markOrderPaidInTx 函数说明：在事务内将订单从“待支付”更新为“已支付”，并保证重复回调幂等。
func markOrderPaidInTx(tx *gorm.DB, order *frontendUserOrderEntity, payChannel string, tradeNo string, paidAt int64, remark string) (latestUser frontendUserEntity, changed bool, e error) {
	if order.Status == frontendOrderStatusPaid {
		user, err := (&frontendUserService{db: tx}).findFrontendUserByID(order.UserID)
		if err != nil {
			return frontendUserEntity{}, false, err
		}
		return user, false, nil
	}
	// 真实支付场景下可能出现“前端已关闭订单，但支付渠道回调成功”的并发情况，这里允许 closed 回调入账。

	user, err := applyPaidOrderBenefits(tx, *order, paidAt)
	if err != nil {
		return frontendUserEntity{}, false, err
	}

	nextPayChannel := strings.TrimSpace(payChannel)
	if nextPayChannel == "" {
		nextPayChannel = strings.TrimSpace(order.PayChannel)
	}
	nextRemark := strings.TrimSpace(order.Remark)
	if strings.TrimSpace(remark) != "" {
		nextRemark = strings.TrimSpace(remark)
	}
	nextTradeNo := strings.TrimSpace(tradeNo)
	if nextTradeNo == "" {
		nextTradeNo = strings.TrimSpace(order.TradeNo)
	}
	if err = tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(map[string]interface{}{
		"status":          frontendOrderStatusPaid,
		"pay_channel":     nextPayChannel,
		"trade_no":        nextTradeNo,
		"paid_time":       paidAt,
		"callback_status": frontendOrderCallbackStatusSuccess,
		"callback_time":   paidAt,
		"callback_error":  "",
		"remark":          nextRemark,
		"update_time":     paidAt,
	}).Error; err != nil {
		return frontendUserEntity{}, false, response.CheckErr(err, "markOrderPaidInTx Order Updates err")
	}
	order.Status = frontendOrderStatusPaid
	order.PayChannel = nextPayChannel
	order.TradeNo = nextTradeNo
	order.PaidTime = paidAt
	order.CallbackStatus = frontendOrderCallbackStatusSuccess
	order.CallbackTime = paidAt
	order.CallbackError = ""
	order.Remark = nextRemark
	order.UpdateTime = paidAt
	return user, true, nil
}

// pointsLogTypeText 函数说明：将积分流水类型映射为可读中文文案。
func pointsLogTypeText(changeType string) string {
	switch strings.TrimSpace(changeType) {
	case "daily_gift":
		return "每日赠送"
	case "tool_consume":
		return "工具扣减"
	case "tool_refund":
		return "失败退款"
	case "member_plan_gift":
		return "会员赠送"
	case "points_pack_recharge":
		return "积分充值"
	default:
		return "积分变更"
	}
}

// formatPointsLogItem 函数说明：将积分流水实体转为前端展示结构。
func formatPointsLogItem(logItem frontendUserPointsLogEntity) map[string]interface{} {
	return map[string]interface{}{
		"id":             logItem.ID,
		"changeType":     logItem.ChangeType,
		"changeTypeText": pointsLogTypeText(logItem.ChangeType),
		"changeAmount":   logItem.ChangeAmount,
		"balanceAfter":   logItem.BalanceAfter,
		"toolKey":        logItem.ToolKey,
		"action":         logItem.Action,
		"orderSn":        logItem.OrderSN,
		"remark":         logItem.Remark,
		"createdAt":      logItem.CreateTime * 1000,
	}
}

// normalizePagination 函数说明：规范分页参数，避免非法 pageNo/pageSize 导致异常查询。
func normalizePagination(pageNo int, pageSize int, defaultPageSize int, maxPageSize int) (int, int) {
	if pageNo <= 0 {
		pageNo = 1
	}
	if pageSize <= 0 {
		pageSize = defaultPageSize
	}
	if pageSize > maxPageSize {
		pageSize = maxPageSize
	}
	return pageNo, pageSize
}

// Login 函数说明：前台用户登录，支持自动注册并返回持久化 token + 资料。
func (srv frontendUserService) Login(c *gin.Context, loginReq req.CommonFrontendUserLoginReq) (res map[string]interface{}, e error) {
	loginEnabled, err := srv.isFrontendLoginEnabled()
	if err != nil {
		return nil, err
	}
	if !loginEnabled {
		return nil, response.AssertArgumentError.Make("前台登录功能当前未开启")
	}
	nickname, err := normalizeFrontendNickname(loginReq.Nickname)
	if err != nil {
		return nil, err
	}
	password := strings.TrimSpace(loginReq.Password)
	if len(password) < 6 || len(password) > 32 {
		return nil, response.AssertArgumentError.Make("密码长度需在 6-32 个字符之间")
	}

	user, err := srv.loginOrCreateUser(nickname, password)
	if err != nil {
		return nil, err
	}
	if err = srv.refundExpiredPointsConsumes(user.ID); err != nil {
		return nil, err
	}
	user, err = srv.findFrontendUserByID(user.ID)
	if err != nil {
		return nil, err
	}

	now := time.Now().Unix()
	err = srv.db.Model(&frontendUserEntity{}).Where("id = ?", user.ID).Updates(map[string]interface{}{
		"last_login_ip":   c.ClientIP(),
		"last_login_time": now,
		"update_time":     now,
	}).Error
	if e = response.CheckErr(err, "Login Updates err"); e != nil {
		return nil, e
	}
	user.LastLoginIP = c.ClientIP()
	user.LastLoginTime = now
	user.UpdateTime = now
	cfg, err := srv.getFrontendPointsConfig()
	if err != nil {
		return nil, err
	}
	policy := resolveUserPointsPolicy(user, cfg, "")
	nextUser, dailyGiftApplied, err := srv.applyDailyGiftIfNeeded(srv.db, user, policy.DailyGiftPoints)
	if err != nil {
		return nil, err
	}

	token := issueFrontendToken(user.ID)
	return map[string]interface{}{
		"token":            token,
		"dailyGiftApplied": dailyGiftApplied,
		"profile":          withPointsRules(toFrontendUserProfile(nextUser), cfg, policy),
	}, nil
}

// Profile 函数说明：按前台 token 返回个人中心资料（含 QQ 邮箱绑定状态）。
func (srv frontendUserService) Profile(frontendToken string) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	if err = srv.refundExpiredPointsConsumes(userID); err != nil {
		return nil, err
	}
	user, err := srv.findFrontendUserByID(userID)
	if err != nil {
		return nil, err
	}
	cfg, err := srv.getFrontendPointsConfig()
	if err != nil {
		return nil, err
	}
	policy := resolveUserPointsPolicy(user, cfg, "")
	nextUser, dailyGiftApplied, err := srv.applyDailyGiftIfNeeded(srv.db, user, policy.DailyGiftPoints)
	if err != nil {
		return nil, err
	}
	profile := withPointsRules(toFrontendUserProfile(nextUser), cfg, policy)
	profile["dailyGiftApplied"] = dailyGiftApplied
	return profile, nil
}

// SaveProfile 函数说明：保存昵称与 QQ 邮箱到数据库，实现个人中心持久化。
func (srv frontendUserService) SaveProfile(frontendToken string, saveReq req.CommonFrontendUserProfileSaveReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	user, err := srv.findFrontendUserByID(userID)
	if err != nil {
		return nil, err
	}

	nickname, err := normalizeFrontendNickname(saveReq.Nickname)
	if err != nil {
		return nil, err
	}
	qqEmail, err := normalizeFrontendQqEmail(saveReq.QqEmail)
	if err != nil {
		return nil, err
	}

	var duplicateCount int64
	err = srv.db.Model(&frontendUserEntity{}).
		Where("id <> ? AND is_delete = ? AND username = ?", user.ID, 0, nickname).
		Count(&duplicateCount).Error
	if e = response.CheckErr(err, "SaveProfile duplicate Count err"); e != nil {
		return nil, e
	}
	if duplicateCount > 0 {
		return nil, response.AssertArgumentError.Make("该昵称已被占用，请更换后重试")
	}

	now := time.Now().Unix()
	err = srv.db.Model(&frontendUserEntity{}).Where("id = ?", user.ID).Updates(map[string]interface{}{
		"nickname":    nickname,
		"username":    nickname,
		"real_name":   nickname,
		"qq_email":    qqEmail,
		"update_time": now,
	}).Error
	if e = response.CheckErr(err, "SaveProfile Updates err"); e != nil {
		return nil, e
	}

	nextUser, err := srv.findFrontendUserByID(user.ID)
	if err != nil {
		return nil, err
	}
	cfg, err := srv.getFrontendPointsConfig()
	if err != nil {
		return nil, err
	}
	policy := resolveUserPointsPolicy(nextUser, cfg, "")
	latestUser, _, err := srv.applyDailyGiftIfNeeded(srv.db, nextUser, policy.DailyGiftPoints)
	if err != nil {
		return nil, err
	}
	return withPointsRules(toFrontendUserProfile(latestUser), cfg, policy), nil
}

// ConsumePoints 函数说明：扣减工具积分；带 requestId 时建立可幂等结算的预扣记录，兼容旧版即时扣分调用。
func (srv frontendUserService) ConsumePoints(frontendToken string, consumeReq req.CommonFrontendUserPointsConsumeReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	if err = srv.refundExpiredPointsConsumes(userID); err != nil {
		return nil, err
	}
	requestID, err := normalizePointsConsumeRequestID(consumeReq.RequestID)
	if err != nil {
		return nil, err
	}
	toolKey := strings.TrimSpace(consumeReq.ToolKey)
	action := strings.TrimSpace(consumeReq.Action)
	cfg, err := srv.getFrontendPointsConfig()
	if err != nil {
		return nil, err
	}

	tx := srv.db.Begin()
	if tx.Error != nil {
		return nil, response.CheckErr(tx.Error, "ConsumePoints Begin err")
	}
	defer func() {
		_ = tx.Rollback().Error
	}()

	var user frontendUserEntity
	if err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND is_delete = ?", userID, 0).Limit(1).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.TokenInvalid
		}
		return nil, response.CheckErr(err, "ConsumePoints User First err")
	}
	policy := resolveUserPointsPolicy(user, cfg, toolKey)
	user, dailyGiftApplied, err := srv.applyDailyGiftIfNeeded(tx, user, policy.DailyGiftPoints)
	if err != nil {
		return nil, err
	}

	if requestID != "" {
		var existingConsume frontendUserPointsConsumeEntity
		err = tx.Where("user_id = ? AND request_id = ?", user.ID, requestID).Limit(1).First(&existingConsume).Error
		if err == nil {
			if normalizeToolConsumeRuleToolKey(existingConsume.ToolKey) != normalizeToolConsumeRuleToolKey(toolKey) || strings.TrimSpace(existingConsume.Action) != action {
				return nil, response.AssertArgumentError.Make("积分消费 requestId 与原工具运行不一致")
			}
			if err = tx.Commit().Error; err != nil {
				return nil, response.CheckErr(err, "ConsumePoints Idempotent Commit err")
			}
			return map[string]interface{}{
				"requestId":        existingConsume.RequestID,
				"status":           existingConsume.Status,
				"toolKey":          existingConsume.ToolKey,
				"action":           existingConsume.Action,
				"consumePoints":    existingConsume.ConsumePoints,
				"ruleMatched":      policy.RuleMatched,
				"ruleToolKey":      policy.AppliedRule.ToolKey,
				"dailyGiftApplied": dailyGiftApplied,
				"profile":          withPointsRules(toFrontendUserProfile(user), cfg, policy),
				"remainPoints":     user.PointsBalance,
			}, nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.CheckErr(err, "ConsumePoints Ledger First err")
		}
	}

	if err = applyConsumeRiskLimits(user.ID, toolKey, action, cfg.ConsumeRiskRule); err != nil {
		return nil, err
	}

	now := time.Now().Unix()
	if policy.ToolConsumePoints > 0 {
		updateResult := tx.Model(&frontendUserEntity{}).
			Where("id = ? AND points_balance >= ?", user.ID, policy.ToolConsumePoints).
			Updates(map[string]interface{}{
				"points_balance":        gorm.Expr("points_balance - ?", policy.ToolConsumePoints),
				"points_total_consumed": gorm.Expr("points_total_consumed + ?", policy.ToolConsumePoints),
				"update_time":           now,
			})
		if updateResult.Error != nil {
			return nil, response.CheckErr(updateResult.Error, "ConsumePoints Updates err")
		}
		if updateResult.RowsAffected == 0 {
			return nil, response.AssertArgumentError.Make("积分不足，请明日领取赠送积分后再试")
		}
	}

	var latestUser frontendUserEntity
	if err = tx.Where("id = ? AND is_delete = ?", user.ID, 0).Limit(1).First(&latestUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.TokenInvalid
		}
		return nil, response.CheckErr(err, "ConsumePoints First err")
	}

	if policy.ToolConsumePoints > 0 {
		if err = appendPointsLog(
			tx,
			latestUser.ID,
			"tool_consume",
			-policy.ToolConsumePoints,
			latestUser.PointsBalance,
			toolKey,
			action,
			requestID,
			"工具使用扣减积分",
		); err != nil {
			return nil, err
		}
	}

	consumeStatus := frontendPointsConsumeStatusCommitted
	if requestID != "" {
		consumeStatus = frontendPointsConsumeStatusReserved
		ledger := frontendUserPointsConsumeEntity{
			UserID:        latestUser.ID,
			RequestID:     requestID,
			ToolKey:       toolKey,
			Action:        action,
			ConsumePoints: policy.ToolConsumePoints,
			Status:        consumeStatus,
			ExpiresAt:     now + frontendPointsConsumeReservationTTLSeconds,
			Reason:        "",
			CreateTime:    now,
			UpdateTime:    now,
		}
		if err = tx.Create(&ledger).Error; err != nil {
			return nil, response.CheckErr(err, "ConsumePoints Ledger Create err")
		}
	}

	if err = tx.Commit().Error; err != nil {
		return nil, response.CheckErr(err, "ConsumePoints Commit err")
	}

	profile := withPointsRules(toFrontendUserProfile(latestUser), cfg, policy)
	return map[string]interface{}{
		"requestId":        requestID,
		"status":           consumeStatus,
		"toolKey":          toolKey,
		"action":           action,
		"consumePoints":    policy.ToolConsumePoints,
		"ruleMatched":      policy.RuleMatched,
		"ruleToolKey":      policy.AppliedRule.ToolKey,
		"dailyGiftApplied": dailyGiftApplied,
		"profile":          profile,
		"remainPoints":     latestUser.PointsBalance,
	}, nil
}

// ResolvePointsConsume 函数说明：按 requestId 幂等确认核心工具成功，或在失败/超时时退还预扣积分。
func (srv frontendUserService) ResolvePointsConsume(frontendToken string, resolveReq req.CommonFrontendUserPointsConsumeResolveReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	requestID, err := normalizePointsConsumeRequestID(resolveReq.RequestID)
	if err != nil || requestID == "" {
		if err != nil {
			return nil, err
		}
		return nil, response.AssertArgumentError.Make("积分消费 requestId 不能为空")
	}
	outcome := strings.ToLower(strings.TrimSpace(resolveReq.Outcome))
	if outcome != "success" && outcome != "failed" {
		return nil, response.AssertArgumentError.Make("积分消费结算结果不合法")
	}
	cfg, err := srv.getFrontendPointsConfig()
	if err != nil {
		return nil, err
	}

	tx := srv.db.Begin()
	if tx.Error != nil {
		return nil, response.CheckErr(tx.Error, "ResolvePointsConsume Begin err")
	}
	defer func() {
		_ = tx.Rollback().Error
	}()

	var latestUser frontendUserEntity
	if err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND is_delete = ?", userID, 0).Limit(1).First(&latestUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.TokenInvalid
		}
		return nil, response.CheckErr(err, "ResolvePointsConsume User First err")
	}
	var consume frontendUserPointsConsumeEntity
	if err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ? AND request_id = ?", userID, requestID).Limit(1).First(&consume).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("积分消费记录不存在")
		}
		return nil, response.CheckErr(err, "ResolvePointsConsume Ledger First err")
	}

	now := time.Now().Unix()
	nextStatus := consume.Status
	reason := strings.TrimSpace(resolveReq.Reason)
	if consume.Status == frontendPointsConsumeStatusReserved {
		if consume.ExpiresAt > 0 && consume.ExpiresAt <= now {
			nextStatus = frontendPointsConsumeStatusExpired
			if reason == "" {
				reason = "工具运行超时，系统自动退还积分"
			}
		} else if outcome == "failed" {
			nextStatus = frontendPointsConsumeStatusRefunded
			if reason == "" {
				reason = "工具运行失败，已退还积分"
			}
		} else {
			nextStatus = frontendPointsConsumeStatusCommitted
		}
	}
	if consume.Status == frontendPointsConsumeStatusReserved && (nextStatus == frontendPointsConsumeStatusRefunded || nextStatus == frontendPointsConsumeStatusExpired) && consume.ConsumePoints > 0 {
		if err = tx.Model(&frontendUserEntity{}).Where("id = ?", latestUser.ID).Updates(map[string]interface{}{
			"points_balance":        gorm.Expr("points_balance + ?", consume.ConsumePoints),
			"points_total_consumed": gorm.Expr("GREATEST(points_total_consumed - ?, 0)", consume.ConsumePoints),
			"update_time":           now,
		}).Error; err != nil {
			return nil, response.CheckErr(err, "ResolvePointsConsume Refund Updates err")
		}
		if err = tx.Where("id = ? AND is_delete = ?", latestUser.ID, 0).Limit(1).First(&latestUser).Error; err != nil {
			return nil, response.CheckErr(err, "ResolvePointsConsume Refund User First err")
		}
		if err = appendPointsLog(
			tx,
			latestUser.ID,
			"tool_refund",
			consume.ConsumePoints,
			latestUser.PointsBalance,
			consume.ToolKey,
			consume.Action,
			consume.RequestID,
			reason,
		); err != nil {
			return nil, err
		}
	}
	if consume.Status == frontendPointsConsumeStatusReserved {
		if err = tx.Model(&frontendUserPointsConsumeEntity{}).Where("id = ? AND status = ?", consume.ID, frontendPointsConsumeStatusReserved).Updates(map[string]interface{}{
			"status":      nextStatus,
			"reason":      reason,
			"update_time": now,
		}).Error; err != nil {
			return nil, response.CheckErr(err, "ResolvePointsConsume Ledger Updates err")
		}
		consume.Status = nextStatus
		consume.Reason = reason
		consume.UpdateTime = now
	}
	if err = tx.Commit().Error; err != nil {
		return nil, response.CheckErr(err, "ResolvePointsConsume Commit err")
	}

	policy := resolveUserPointsPolicy(latestUser, cfg, consume.ToolKey)
	return map[string]interface{}{
		"requestId":     consume.RequestID,
		"status":        consume.Status,
		"consumePoints": consume.ConsumePoints,
		"remainPoints":  latestUser.PointsBalance,
		"profile":       withPointsRules(toFrontendUserProfile(latestUser), cfg, policy),
	}, nil
}

// refundExpiredPointsConsumes 函数说明：在用户再次访问时批量回收超时预扣，防止断网或关页造成积分长期占用。
func (srv frontendUserService) refundExpiredPointsConsumes(userID uint) (e error) {
	if userID == 0 {
		return nil
	}
	now := time.Now().Unix()
	tx := srv.db.Begin()
	if tx.Error != nil {
		return response.CheckErr(tx.Error, "refundExpiredPointsConsumes Begin err")
	}
	defer func() {
		_ = tx.Rollback().Error
	}()

	var user frontendUserEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND is_delete = ?", userID, 0).Limit(1).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.TokenInvalid
		}
		return response.CheckErr(err, "refundExpiredPointsConsumes User First err")
	}
	var consumes []frontendUserPointsConsumeEntity
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where(
		"user_id = ? AND status = ? AND expires_at > ? AND expires_at <= ?",
		userID,
		frontendPointsConsumeStatusReserved,
		0,
		now,
	).Order("id ASC").Find(&consumes).Error; err != nil {
		return response.CheckErr(err, "refundExpiredPointsConsumes Ledger Find err")
	}
	if len(consumes) == 0 {
		return response.CheckErr(tx.Commit().Error, "refundExpiredPointsConsumes Empty Commit err")
	}

	var totalRefund int64
	for _, consume := range consumes {
		if consume.ConsumePoints > 0 {
			totalRefund += consume.ConsumePoints
		}
	}
	if totalRefund > 0 {
		if err := tx.Model(&frontendUserEntity{}).Where("id = ?", user.ID).Updates(map[string]interface{}{
			"points_balance":        gorm.Expr("points_balance + ?", totalRefund),
			"points_total_consumed": gorm.Expr("GREATEST(points_total_consumed - ?, 0)", totalRefund),
			"update_time":           now,
		}).Error; err != nil {
			return response.CheckErr(err, "refundExpiredPointsConsumes User Updates err")
		}
	}
	runningBalance := user.PointsBalance
	for _, consume := range consumes {
		runningBalance += consume.ConsumePoints
		if consume.ConsumePoints > 0 {
			if err := appendPointsLog(
				tx,
				user.ID,
				"tool_refund",
				consume.ConsumePoints,
				runningBalance,
				consume.ToolKey,
				consume.Action,
				consume.RequestID,
				"工具运行超时，系统自动退还积分",
			); err != nil {
				return err
			}
		}
		if err := tx.Model(&frontendUserPointsConsumeEntity{}).Where("id = ? AND status = ?", consume.ID, frontendPointsConsumeStatusReserved).Updates(map[string]interface{}{
			"status":      frontendPointsConsumeStatusExpired,
			"reason":      "工具运行超时，系统自动退还积分",
			"update_time": now,
		}).Error; err != nil {
			return response.CheckErr(err, "refundExpiredPointsConsumes Ledger Updates err")
		}
	}
	return response.CheckErr(tx.Commit().Error, "refundExpiredPointsConsumes Commit err")
}

// Products 函数说明：读取前台可售卖的会员套餐、积分包与权益说明。
func (srv frontendUserService) Products() (res map[string]interface{}, e error) {
	pointsCfg, err := srv.getFrontendPointsConfig()
	if err != nil {
		return nil, err
	}
	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"memberEnabled":     pointsCfg.MemberEnabled,
		"memberPlans":       activeMemberPlans(commerceCfg.MemberPlans),
		"pointsPacks":       activePointsPacks(commerceCfg.PointsPacks),
		"memberRightsIntro": commerceCfg.MemberRightsIntro,
		"dailyGiftPoints":   pointsCfg.DailyGiftPoints,
		"toolConsumePoints": pointsCfg.ToolConsumePoints,
		"paymentChannels":   commerceCfg.PaymentChannels,
	}, nil
}

// autoCloseExpiredPendingOrders 函数说明：自动关闭超时未支付订单，避免长期 pending 堆积与重复拉起支付。
func (srv frontendUserService) autoCloseExpiredPendingOrders(userID uint) (closedCount int64, e error) {
	timeoutMinutes := frontendOrderAutoCloseTimeoutMinutes
	if timeoutMinutes <= 0 {
		return 0, nil
	}
	now := time.Now().Unix()
	expireBefore := now - timeoutMinutes*60
	if expireBefore <= 0 {
		return 0, nil
	}
	updatePayload := map[string]interface{}{
		"status":          frontendOrderStatusClosed,
		"callback_status": frontendOrderCallbackStatusFailed,
		"callback_time":   now,
		"callback_error":  fmt.Sprintf("支付超时自动关闭（超时阈值：%d 分钟）", timeoutMinutes),
		"remark":          fmt.Sprintf("支付超时自动关闭（超时阈值：%d 分钟）", timeoutMinutes),
		"update_time":     now,
	}
	chain := srv.db.Model(&frontendUserOrderEntity{}).Where(
		"status = ? AND delete_time = ? AND create_time > 0 AND create_time <= ?",
		frontendOrderStatusPending,
		0,
		expireBefore,
	)
	if userID > 0 {
		chain = chain.Where("user_id = ?", userID)
	}
	result := chain.Updates(updatePayload)
	if result.Error != nil {
		return 0, response.CheckErr(result.Error, "autoCloseExpiredPendingOrders Updates err")
	}
	return result.RowsAffected, nil
}

// Purchase 函数说明：创建会员套餐/积分包订单，默认进入待支付状态。
func (srv frontendUserService) Purchase(frontendToken string, purchaseReq req.CommonFrontendUserPurchaseReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	if _, err = srv.autoCloseExpiredPendingOrders(userID); err != nil {
		return nil, err
	}
	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		return nil, err
	}

	productType := strings.TrimSpace(purchaseReq.ProductType)
	productCode := strings.TrimSpace(purchaseReq.ProductCode)
	payChannel := normalizePaymentChannelCode(purchaseReq.PayChannel)
	if payChannel == "" {
		payChannel = resolveDefaultPayChannel(commerceCfg)
	}
	if payChannel == "" {
		return nil, response.AssertArgumentError.Make("当前未配置可用支付渠道，请联系管理员")
	}
	if payChannel == frontendPayChannelMock && !isMockPaymentAllowed() {
		return nil, response.AssertArgumentError.Make("生产环境已禁用 mock 支付，请切换真实支付渠道")
	}
	paymentChannel, hasPaymentChannel := commerceCfg.findPaymentChannel(payChannel)
	if !hasPaymentChannel {
		return nil, response.AssertArgumentError.Make("支付渠道不可用，请联系管理员配置后重试")
	}
	if !paymentChannel.Configured {
		return nil, response.AssertArgumentError.Make("支付渠道尚未配置支付地址，请先到后台设置")
	}

	tx := srv.db.Begin()
	if tx.Error != nil {
		return nil, response.CheckErr(tx.Error, "Purchase Begin err")
	}
	defer func() {
		if e != nil {
			_ = tx.Rollback()
		}
	}()

	var user frontendUserEntity
	if err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND is_delete = ?", userID, 0).Limit(1).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			e = response.TokenInvalid
			return nil, e
		}
		e = response.CheckErr(err, "Purchase User First err")
		return nil, e
	}

	now := time.Now().Unix()
	orderSN := buildFrontendOrderSN()
	order := frontendUserOrderEntity{
		OrderSN:        orderSN,
		UserID:         user.ID,
		ProductType:    productType,
		ProductCode:    productCode,
		Currency:       "CNY",
		Status:         frontendOrderStatusPending,
		PayChannel:     payChannel,
		TradeNo:        "",
		CallbackStatus: frontendOrderCallbackStatusPending,
		CallbackTime:   0,
		CallbackError:  "",
		PaidTime:       0,
		CreateTime:     now,
		UpdateTime:     now,
	}

	if productType == "member_plan" {
		plan, ok := findMemberPlanByCode(commerceCfg.MemberPlans, productCode)
		if !ok {
			e = response.AssertArgumentError.Make("会员套餐不存在或已下线")
			return nil, e
		}
		order.ProductName = plan.Name
		order.Amount = plan.Price
		order.MemberDays = plan.MemberDays
		order.GiftPoints = plan.GiftPoints
	} else {
		pack, ok := findPointsPackByCode(commerceCfg.PointsPacks, productCode)
		if !ok {
			e = response.AssertArgumentError.Make("积分包不存在或已下线")
			return nil, e
		}
		totalPoints := pack.Points + pack.GiftPoints
		if totalPoints <= 0 {
			e = response.AssertArgumentError.Make("积分包配置无效，请联系管理员")
			return nil, e
		}
		order.ProductName = pack.Name
		order.Amount = pack.Price
		order.Points = pack.Points
		order.GiftPoints = pack.GiftPoints
	}

	if err = tx.Create(&order).Error; err != nil {
		e = response.CheckErr(err, "Purchase Order Create err")
		return nil, e
	}

	paymentPayload := buildFrontendPaymentPayload(commerceCfg, payChannel, order.OrderSN)
	if payChannel != frontendPayChannelMock {
		var tradeNo string
		var buildErr error
		paymentPayload, tradeNo, buildErr = buildOrderPaymentPayload(order, paymentChannel, commerceCfg)
		if buildErr != nil {
			e = buildErr
			return nil, e
		}
		updatePayload := map[string]interface{}{
			"callback_status": frontendOrderCallbackStatusProcessing,
			"callback_error":  "",
			"update_time":     now,
		}
		order.CallbackStatus = frontendOrderCallbackStatusProcessing
		order.CallbackError = ""
		if strings.TrimSpace(tradeNo) != "" {
			updatePayload["trade_no"] = strings.TrimSpace(tradeNo)
			order.TradeNo = strings.TrimSpace(tradeNo)
		}
		if err = tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(updatePayload).Error; err != nil {
			e = response.CheckErr(err, "Purchase Order Payment Updates err")
			return nil, e
		}
	}

	if err = tx.Commit().Error; err != nil {
		e = response.CheckErr(err, "Purchase Commit err")
		return nil, e
	}
	orderItem := formatOrderItemWithCommerce(order, commerceCfg)
	if paymentPayload != nil {
		orderItem["payment"] = paymentPayload
	}
	return map[string]interface{}{
		"order":   orderItem,
		"payment": paymentPayload,
	}, nil
}

// PurchasePay 函数说明：为待支付订单重新拉起支付，支持切换支付渠道并刷新 payUrl/tradeNo。
func (srv frontendUserService) PurchasePay(frontendToken string, payReq req.CommonFrontendUserPurchasePayReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	if _, err = srv.autoCloseExpiredPendingOrders(userID); err != nil {
		return nil, err
	}
	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		return nil, err
	}
	orderSN := strings.TrimSpace(payReq.OrderSn)
	if orderSN == "" {
		return nil, response.AssertArgumentError.Make("订单号不能为空")
	}

	tx := srv.db.Begin()
	if tx.Error != nil {
		return nil, response.CheckErr(tx.Error, "PurchasePay Begin err")
	}
	defer func() {
		if e != nil {
			_ = tx.Rollback()
		}
	}()

	var order frontendUserOrderEntity
	if err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("order_sn = ? AND user_id = ? AND delete_time = ?", orderSN, userID, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		return nil, response.CheckErr(err, "PurchasePay Order First err")
	}
	if order.Status == frontendOrderStatusPaid {
		if err = tx.Commit().Error; err != nil {
			return nil, response.CheckErr(err, "PurchasePay Commit Paid err")
		}
		return map[string]interface{}{
			"order":   formatOrderItemWithCommerce(order, commerceCfg),
			"payment": nil,
		}, nil
	}
	if order.Status == frontendOrderStatusClosed {
		return nil, response.AssertArgumentError.Make("订单已关闭，请重新下单")
	}

	targetPayChannel := normalizePaymentChannelCode(payReq.PayChannel)
	if targetPayChannel == "" {
		targetPayChannel = normalizePaymentChannelCode(order.PayChannel)
	}
	if targetPayChannel == "" {
		targetPayChannel = resolveDefaultPayChannel(commerceCfg)
	}
	if targetPayChannel == "" {
		return nil, response.AssertArgumentError.Make("当前未配置可用支付渠道，请联系管理员")
	}
	if targetPayChannel == frontendPayChannelMock && !isMockPaymentAllowed() {
		return nil, response.AssertArgumentError.Make("生产环境已禁用 mock 支付，请切换真实支付渠道")
	}
	paymentChannel, exists := commerceCfg.findPaymentChannel(targetPayChannel)
	if !exists || !paymentChannel.Configured {
		return nil, response.AssertArgumentError.Make("支付渠道不可用，请切换后重试")
	}

	paymentPayload := buildFrontendPaymentPayload(commerceCfg, targetPayChannel, order.OrderSN)
	now := time.Now().Unix()
	updatePayload := map[string]interface{}{
		"pay_channel":    targetPayChannel,
		"callback_error": "",
		"update_time":    now,
	}
	order.PayChannel = targetPayChannel
	order.CallbackError = ""
	order.UpdateTime = now

	if targetPayChannel != frontendPayChannelMock {
		nextPayload, tradeNo, buildErr := buildOrderPaymentPayload(order, paymentChannel, commerceCfg)
		if buildErr != nil {
			e = buildErr
			return nil, e
		}
		paymentPayload = nextPayload
		updatePayload["callback_status"] = frontendOrderCallbackStatusProcessing
		updatePayload["callback_time"] = now
		order.CallbackStatus = frontendOrderCallbackStatusProcessing
		order.CallbackTime = now
		if strings.TrimSpace(tradeNo) != "" {
			updatePayload["trade_no"] = strings.TrimSpace(tradeNo)
			order.TradeNo = strings.TrimSpace(tradeNo)
		}
	} else {
		updatePayload["callback_status"] = frontendOrderCallbackStatusPending
		updatePayload["callback_time"] = int64(0)
		order.CallbackStatus = frontendOrderCallbackStatusPending
		order.CallbackTime = 0
	}

	if err = tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(updatePayload).Error; err != nil {
		return nil, response.CheckErr(err, "PurchasePay Order Updates err")
	}
	if err = tx.Commit().Error; err != nil {
		return nil, response.CheckErr(err, "PurchasePay Commit err")
	}

	orderItem := formatOrderItemWithCommerce(order, commerceCfg)
	if paymentPayload != nil {
		orderItem["payment"] = paymentPayload
	}
	return map[string]interface{}{
		"order":   orderItem,
		"payment": paymentPayload,
	}, nil
}

// appendPaymentCallbackAuditLog 函数说明：写入支付回调审计日志；写入失败仅记录告警，不影响支付主流程响应。
func (srv frontendUserService) appendPaymentCallbackAuditLog(auditLog frontendPaymentCallbackAuditEntity) {
	if srv.db == nil {
		return
	}
	if auditLog.CreateTime <= 0 {
		auditLog.CreateTime = time.Now().Unix()
	}
	if err := srv.db.Create(&auditLog).Error; err != nil {
		core.Logger.Warnf("appendPaymentCallbackAuditLog err: err=[%+v]", err)
	}
}

// PurchaseCallback 函数说明：处理通用支付回调（mock/第三方网关），支持 success/failed/closed/processing 全状态推进。
func (srv frontendUserService) PurchaseCallback(frontendToken string, callbackReq req.CommonFrontendUserPurchaseCallbackReq) (res map[string]interface{}, e error) {
	return srv.purchaseCallbackCore(callbackReq, false, frontendToken, nil)
}

// PurchaseWechatCallback 函数说明：处理微信支付V3官方回调（验签+解密），并转为内部统一回调状态推进。
func (srv frontendUserService) PurchaseWechatCallback(c *gin.Context) (res map[string]interface{}, e error) {
	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		return nil, err
	}
	if !commerceCfg.WechatV3.Enabled {
		return nil, response.AssertArgumentError.Make("微信支付V3配置未完成，请先到后台补齐")
	}
	if !commerceCfg.WechatV3.PlatformCertReady {
		return nil, response.AssertArgumentError.Make("微信支付平台证书未配置，无法校验回调签名")
	}

	rawBody, err := io.ReadAll(io.LimitReader(c.Request.Body, 4*1024*1024))
	if err != nil {
		return nil, response.CheckErr(err, "PurchaseWechatCallback ReadAll err")
	}
	if len(rawBody) == 0 {
		return nil, response.AssertArgumentError.Make("微信支付回调内容为空")
	}
	timestamp := strings.TrimSpace(c.GetHeader("Wechatpay-Timestamp"))
	nonce := strings.TrimSpace(c.GetHeader("Wechatpay-Nonce"))
	signature := strings.TrimSpace(c.GetHeader("Wechatpay-Signature"))
	if timestamp == "" || nonce == "" || signature == "" {
		return nil, response.AssertArgumentError.Make("微信支付回调缺少签名头信息")
	}
	if err = verifyWechatPayCallbackSignature(commerceCfg.WechatV3.PlatformCertPEM, timestamp, nonce, rawBody, signature); err != nil {
		return nil, err
	}

	notifyPayload := wechatPayNotifyPayload{}
	if err = json.Unmarshal(rawBody, &notifyPayload); err != nil {
		return nil, response.AssertArgumentError.Make("微信支付回调JSON格式错误")
	}
	plainBytes, err := decryptWechatPayNotifyCiphertext(
		commerceCfg.WechatV3.ApiV3Key,
		strings.TrimSpace(notifyPayload.Resource.AssociatedData),
		strings.TrimSpace(notifyPayload.Resource.Nonce),
		strings.TrimSpace(notifyPayload.Resource.Ciphertext),
	)
	if err != nil {
		return nil, err
	}
	transactionPayload := wechatPayTransactionPayload{}
	if err = json.Unmarshal(plainBytes, &transactionPayload); err != nil {
		return nil, response.AssertArgumentError.Make("微信支付回调交易数据格式错误")
	}
	if strings.TrimSpace(transactionPayload.MchID) != strings.TrimSpace(commerceCfg.WechatV3.MchID) {
		return nil, response.AssertArgumentError.Make("微信支付回调商户号与当前配置不匹配")
	}
	if strings.TrimSpace(transactionPayload.AppID) != strings.TrimSpace(commerceCfg.WechatV3.AppID) {
		return nil, response.AssertArgumentError.Make("微信支付回调 AppID 与当前配置不匹配")
	}
	if transactionPayload.Amount.Total < 0 || strings.TrimSpace(transactionPayload.Amount.Currency) == "" {
		return nil, response.AssertArgumentError.Make("微信支付回调金额或币种不合法")
	}

	callbackReq := req.CommonFrontendUserPurchaseCallbackReq{
		OrderSn:    strings.TrimSpace(transactionPayload.OutTradeNo),
		PayChannel: frontendPayChannelWechatH5,
		TradeNo:    strings.TrimSpace(transactionPayload.TransactionID),
		Status:     mapWechatTradeStateToCallbackStatus(transactionPayload.TradeState, notifyPayload.EventType),
		Message: strings.TrimSpace(func() string {
			if strings.TrimSpace(transactionPayload.TradeStateDesc) != "" {
				return strings.TrimSpace(transactionPayload.TradeStateDesc)
			}
			if strings.TrimSpace(notifyPayload.Summary) != "" {
				return strings.TrimSpace(notifyPayload.Summary)
			}
			return strings.TrimSpace(notifyPayload.EventType)
		}()),
		Timestamp: parseWechatHeaderTimestamp(timestamp),
		Nonce:     strings.TrimSpace(nonce),
		Sign:      "__wechat_v3_verified__",
	}
	trustedContext := &frontendTrustedPaymentContext{
		AmountCents: transactionPayload.Amount.Total,
		Currency:    strings.ToUpper(strings.TrimSpace(transactionPayload.Amount.Currency)),
		MchID:       strings.TrimSpace(transactionPayload.MchID),
		AppID:       strings.TrimSpace(transactionPayload.AppID),
	}
	return srv.purchaseCallbackCore(callbackReq, true, "", trustedContext)
}

// purchaseCallbackCore 函数说明：支付回调统一处理核心逻辑，支持通用签名校验与“微信V3已验签”可信模式。
func (srv frontendUserService) purchaseCallbackCore(callbackReq req.CommonFrontendUserPurchaseCallbackReq, trustedSignature bool, frontendToken string, trustedContext *frontendTrustedPaymentContext) (res map[string]interface{}, e error) {
	orderSN := strings.TrimSpace(callbackReq.OrderSn)
	callbackPayChannel := normalizePaymentChannelCode(callbackReq.PayChannel)
	tradeNo := strings.TrimSpace(callbackReq.TradeNo)
	callbackResult := normalizePaymentCallbackResult(callbackReq.Status)
	callbackMessage := strings.TrimSpace(callbackReq.Message)
	callbackTimestamp := callbackReq.Timestamp
	callbackNonce := normalizePaymentCallbackNonce(callbackReq.Nonce)
	auditLog := frontendPaymentCallbackAuditEntity{
		OrderSN:           orderSN,
		PayChannel:        callbackPayChannel,
		TradeNo:           tradeNo,
		CallbackResult:    callbackResult,
		CallbackMessage:   callbackMessage,
		CallbackTimestamp: callbackTimestamp,
		CallbackNonce:     callbackNonce,
		SignDigest:        buildCallbackSignDigest(callbackReq.Sign),
		SignVerified:      0,
		ReplayDetected:    0,
		ReplayKind:        "",
		LockAcquired:      0,
		ProcessStage:      "received",
		ProcessResult:     "",
		RequestPayload:    marshalPaymentCallbackAuditPayload(callbackReq),
		CreateTime:        time.Now().Unix(),
	}
	defer func() {
		if strings.TrimSpace(auditLog.ProcessResult) == "" {
			if e != nil {
				auditLog.ProcessResult = strings.TrimSpace(e.Error())
			} else {
				auditLog.ProcessResult = "ok"
			}
		}
		if strings.TrimSpace(auditLog.ProcessStage) == "" {
			if e != nil {
				auditLog.ProcessStage = "failed"
			} else {
				auditLog.ProcessStage = "completed"
			}
		}
		srv.appendPaymentCallbackAuditLog(auditLog)
	}()
	if orderSN == "" {
		auditLog.ProcessStage = "rejected"
		auditLog.ProcessResult = "订单号不能为空"
		return nil, response.AssertArgumentError.Make("订单号不能为空")
	}
	if callbackResult == "" {
		auditLog.ProcessStage = "rejected"
		auditLog.ProcessResult = "支付回调状态不合法"
		return nil, response.AssertArgumentError.Make("支付回调状态不合法")
	}

	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		auditLog.ProcessStage = "config_error"
		auditLog.ProcessResult = strings.TrimSpace(err.Error())
		return nil, err
	}
	var order frontendUserOrderEntity
	if err := srv.db.Where("order_sn = ? AND delete_time = ?", orderSN, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			auditLog.ProcessStage = "not_found"
			auditLog.ProcessResult = "订单不存在"
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		auditLog.ProcessStage = "query_error"
		auditLog.ProcessResult = strings.TrimSpace(err.Error())
		return nil, response.CheckErr(err, "PurchaseCallback Order Preload err")
	}

	payChannel := callbackPayChannel
	if payChannel == "" {
		payChannel = normalizePaymentChannelCode(order.PayChannel)
	}
	if payChannel == "" {
		payChannel = resolveDefaultPayChannel(commerceCfg)
	}
	if payChannel == "" {
		auditLog.ProcessStage = "rejected"
		auditLog.ProcessResult = "当前未配置可用支付渠道"
		return nil, response.AssertArgumentError.Make("当前未配置可用支付渠道")
	}
	if payChannel == frontendPayChannelMock && !isMockPaymentAllowed() {
		auditLog.ProcessStage = "rejected"
		auditLog.ProcessResult = "生产环境已禁用 mock 支付"
		return nil, response.AssertArgumentError.Make("生产环境已禁用 mock 支付回调")
	}
	if payChannel == frontendPayChannelMock {
		callbackUserID, tokenErr := resolveFrontendUserIDByToken(strings.TrimSpace(frontendToken))
		if tokenErr != nil || callbackUserID != order.UserID {
			auditLog.ProcessStage = "rejected"
			auditLog.ProcessResult = "mock 支付回调身份校验失败"
			return nil, response.AssertArgumentError.Make("mock 支付回调身份校验失败，请重新登录后再试")
		}
	}
	auditLog.PayChannel = payChannel
	if strings.TrimSpace(auditLog.TradeNo) == "" {
		auditLog.TradeNo = strings.TrimSpace(order.TradeNo)
	}
	if normalizePaymentChannelCode(order.PayChannel) != "" && normalizePaymentChannelCode(order.PayChannel) != payChannel {
		if order.Status == frontendOrderStatusPending {
			_ = markOrderCallbackFailedInTx(
				srv.db,
				&order,
				time.Now().Unix(),
				fmt.Sprintf("支付渠道不匹配（订单:%s 回调:%s）", normalizePaymentChannelCode(order.PayChannel), payChannel),
			)
		}
		auditLog.ProcessStage = "rejected"
		auditLog.ProcessResult = "支付渠道不匹配"
		return nil, response.AssertArgumentError.Make("支付渠道不匹配，回调已拒绝")
	}
	if err = validateTrustedPaymentOrderBinding(order, callbackResult, trustedContext); err != nil {
		if order.Status == frontendOrderStatusPending {
			_ = markOrderCallbackFailedInTx(srv.db, &order, time.Now().Unix(), strings.TrimSpace(err.Error()))
		}
		auditLog.ProcessStage = "rejected"
		auditLog.ProcessResult = strings.TrimSpace(err.Error())
		return nil, err
	}

	hasSecureReplayPayload := callbackTimestamp > 0 && callbackNonce != ""
	if payChannel != frontendPayChannelMock {
		if _, ok := commerceCfg.findPaymentChannel(payChannel); !ok {
			if order.Status == frontendOrderStatusPending {
				_ = markOrderCallbackFailedInTx(srv.db, &order, time.Now().Unix(), "支付渠道不可用")
			}
			auditLog.ProcessStage = "rejected"
			auditLog.ProcessResult = "支付渠道不可用"
			return nil, response.AssertArgumentError.Make("支付渠道不可用")
		}
		if !hasSecureReplayPayload {
			if order.Status == frontendOrderStatusPending {
				_ = markOrderCallbackFailedInTx(srv.db, &order, time.Now().Unix(), "支付回调缺少 timestamp/nonce")
			}
			auditLog.ProcessStage = "rejected"
			auditLog.ProcessResult = "缺少 timestamp 或 nonce"
			return nil, response.AssertArgumentError.Make("支付回调缺少 timestamp 或 nonce，已拒绝")
		}
		if err = validatePaymentCallbackTimestamp(callbackTimestamp); err != nil {
			if order.Status == frontendOrderStatusPending {
				_ = markOrderCallbackFailedInTx(srv.db, &order, time.Now().Unix(), "支付回调时间戳校验失败")
			}
			auditLog.ProcessStage = "rejected"
			auditLog.ProcessResult = strings.TrimSpace(err.Error())
			return nil, err
		}
		if trustedSignature && payChannel == frontendPayChannelWechatH5 && strings.TrimSpace(callbackReq.Sign) == "__wechat_v3_verified__" {
			auditLog.SignVerified = 1
		} else {
			if strings.TrimSpace(commerceCfg.PaymentSecret) == "" {
				if order.Status == frontendOrderStatusPending {
					_ = markOrderCallbackFailedInTx(srv.db, &order, time.Now().Unix(), "支付回调密钥未配置")
				}
				auditLog.ProcessStage = "rejected"
				auditLog.ProcessResult = "支付回调密钥未配置"
				return nil, response.AssertArgumentError.Make("支付回调密钥未配置，请先在后台补齐")
			}
			sign := strings.ToLower(strings.TrimSpace(callbackReq.Sign))
			expectedSign := buildPaymentCallbackSecureSign(
				orderSN,
				payChannel,
				tradeNo,
				callbackResult,
				callbackTimestamp,
				callbackNonce,
				commerceCfg.PaymentSecret,
			)
			if sign == "" || subtle.ConstantTimeCompare([]byte(sign), []byte(expectedSign)) != 1 {
				if order.Status == frontendOrderStatusPending {
					_ = markOrderCallbackFailedInTx(srv.db, &order, time.Now().Unix(), "支付回调签名校验失败")
				}
				auditLog.ProcessStage = "rejected"
				auditLog.ProcessResult = "支付回调签名校验失败"
				return nil, response.AssertArgumentError.Make("支付回调签名校验失败")
			}
			auditLog.SignVerified = 1
		}
	} else {
		auditLog.SignVerified = 1
	}

	replayTradeNo := strings.TrimSpace(tradeNo)
	if replayTradeNo == "" {
		replayTradeNo = strings.TrimSpace(order.TradeNo)
	}
	eventReplayKey, nonceReplayKey := resolvePaymentCallbackReplayKeys(
		orderSN,
		payChannel,
		replayTradeNo,
		callbackResult,
		callbackTimestamp,
		callbackNonce,
	)
	auditLog.TradeNo = replayTradeNo
	callbackLockKey := buildPaymentCallbackLockRedisKey(orderSN, payChannel, replayTradeNo)
	eventReplayHit := util.RedisUtil.Exists(eventReplayKey) > 0
	nonceReplayHit := nonceReplayKey != "" && util.RedisUtil.Exists(nonceReplayKey) > 0
	if eventReplayHit || nonceReplayHit {
		if err = srv.db.Where("order_sn = ? AND delete_time = ?", orderSN, 0).Limit(1).First(&order).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				auditLog.ProcessStage = "deduplicated"
				auditLog.ProcessResult = "重复回调命中但订单不存在"
				auditLog.ReplayDetected = 1
				if eventReplayHit {
					auditLog.ReplayKind = "event"
				} else {
					auditLog.ReplayKind = "nonce"
				}
				return nil, response.AssertArgumentError.Make("订单不存在")
			}
			auditLog.ProcessStage = "deduplicated"
			auditLog.ProcessResult = strings.TrimSpace(err.Error())
			auditLog.ReplayDetected = 1
			if eventReplayHit {
				auditLog.ReplayKind = "event"
			} else {
				auditLog.ReplayKind = "nonce"
			}
			return nil, response.CheckErr(err, "PurchaseCallback Replay Order First err")
		}
		auditLog.ProcessStage = "deduplicated"
		auditLog.ProcessResult = "重复回调命中，已忽略"
		auditLog.ReplayDetected = 1
		if eventReplayHit {
			auditLog.ReplayKind = "event"
		} else {
			auditLog.ReplayKind = "nonce"
		}
		return map[string]interface{}{
			"order":        formatOrderItemWithCommerce(order, commerceCfg),
			"deduplicated": true,
		}, nil
	}
	if !util.RedisUtil.SetNX(callbackLockKey, "1", frontendPaymentCallbackLockTTLSeconds) {
		eventReplayHit = util.RedisUtil.Exists(eventReplayKey) > 0
		nonceReplayHit = nonceReplayKey != "" && util.RedisUtil.Exists(nonceReplayKey) > 0
		if eventReplayHit || nonceReplayHit {
			if err = srv.db.Where("order_sn = ? AND delete_time = ?", orderSN, 0).Limit(1).First(&order).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					auditLog.ProcessStage = "deduplicated"
					auditLog.ProcessResult = "锁冲突后命中重复回调但订单不存在"
					auditLog.ReplayDetected = 1
					if eventReplayHit {
						auditLog.ReplayKind = "event"
					} else {
						auditLog.ReplayKind = "nonce"
					}
					return nil, response.AssertArgumentError.Make("订单不存在")
				}
				auditLog.ProcessStage = "deduplicated"
				auditLog.ProcessResult = strings.TrimSpace(err.Error())
				auditLog.ReplayDetected = 1
				if eventReplayHit {
					auditLog.ReplayKind = "event"
				} else {
					auditLog.ReplayKind = "nonce"
				}
				return nil, response.CheckErr(err, "PurchaseCallback Replay Lock Order First err")
			}
			auditLog.ProcessStage = "deduplicated"
			auditLog.ProcessResult = "锁冲突后命中重复回调，已忽略"
			auditLog.ReplayDetected = 1
			if eventReplayHit {
				auditLog.ReplayKind = "event"
			} else {
				auditLog.ReplayKind = "nonce"
			}
			return map[string]interface{}{
				"order":        formatOrderItemWithCommerce(order, commerceCfg),
				"deduplicated": true,
			}, nil
		}
		auditLog.ProcessStage = "locked"
		auditLog.ProcessResult = "支付回调处理中，请稍后重试"
		return nil, response.AssertArgumentError.Make("支付回调处理中，请稍后重试")
	}
	auditLog.LockAcquired = 1
	defer util.RedisUtil.Del(callbackLockKey)

	tx := srv.db.Begin()
	if tx.Error != nil {
		auditLog.ProcessStage = "tx_begin_error"
		auditLog.ProcessResult = strings.TrimSpace(tx.Error.Error())
		return nil, response.CheckErr(tx.Error, "PurchaseCallback Begin err")
	}
	defer func() {
		if e != nil {
			_ = tx.Rollback()
		}
	}()
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("order_sn = ? AND delete_time = ?", orderSN, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			auditLog.ProcessStage = "not_found"
			auditLog.ProcessResult = "订单不存在"
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		auditLog.ProcessStage = "query_error"
		auditLog.ProcessResult = strings.TrimSpace(err.Error())
		return nil, response.CheckErr(err, "PurchaseCallback Order First err")
	}
	if callbackResult == frontendPaymentCallbackResultSuccess && strings.TrimSpace(tradeNo) != "" && order.Status != frontendOrderStatusPaid {
		duplicateTradeCount := int64(0)
		if err = tx.Model(&frontendUserOrderEntity{}).
			Where("id <> ? AND delete_time = ? AND status = ? AND trade_no = ?", order.ID, 0, frontendOrderStatusPaid, strings.TrimSpace(tradeNo)).
			Count(&duplicateTradeCount).Error; err != nil {
			auditLog.ProcessStage = "duplicate_trade_check_error"
			auditLog.ProcessResult = strings.TrimSpace(err.Error())
			return nil, response.CheckErr(err, "PurchaseCallback TradeNo Count err")
		}
		if duplicateTradeCount > 0 {
			_ = markOrderCallbackFailedInTx(tx, &order, time.Now().Unix(), "支付回调交易号重复")
			auditLog.ProcessStage = "rejected"
			auditLog.ProcessResult = "支付回调交易号重复"
			return nil, response.AssertArgumentError.Make("支付回调交易号重复，回调已拒绝")
		}
	}

	eventAt := time.Now().Unix()
	switch callbackResult {
	case frontendPaymentCallbackResultProcessing:
		if order.Status != frontendOrderStatusPaid {
			nextError := callbackMessage
			nextRemark := "支付处理中"
			if nextError != "" {
				nextRemark = "支付处理中：" + nextError
			}
			updatePayload := map[string]interface{}{
				"callback_status": frontendOrderCallbackStatusProcessing,
				"callback_time":   eventAt,
				"callback_error":  nextError,
				"remark":          nextRemark,
				"update_time":     eventAt,
			}
			if strings.TrimSpace(tradeNo) != "" {
				updatePayload["trade_no"] = strings.TrimSpace(tradeNo)
				order.TradeNo = strings.TrimSpace(tradeNo)
			}
			if normalizePaymentChannelCode(payChannel) != "" {
				updatePayload["pay_channel"] = payChannel
				order.PayChannel = payChannel
			}
			if err = tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(updatePayload).Error; err != nil {
				return nil, response.CheckErr(err, "PurchaseCallback Processing Updates err")
			}
			order.CallbackStatus = frontendOrderCallbackStatusProcessing
			order.CallbackTime = eventAt
			order.CallbackError = nextError
			order.Remark = nextRemark
			order.UpdateTime = eventAt
		}
		auditLog.ProcessStage = "processing"
		auditLog.ProcessResult = "支付处理中回调已记录"
	case frontendPaymentCallbackResultFailed:
		if order.Status != frontendOrderStatusPaid {
			failMessage := callbackMessage
			if failMessage == "" {
				failMessage = "支付回调失败"
			}
			if err = markOrderCallbackFailedInTx(tx, &order, eventAt, failMessage); err != nil {
				return nil, err
			}
			extraUpdates := map[string]interface{}{}
			if strings.TrimSpace(tradeNo) != "" {
				extraUpdates["trade_no"] = strings.TrimSpace(tradeNo)
				order.TradeNo = strings.TrimSpace(tradeNo)
			}
			if normalizePaymentChannelCode(payChannel) != "" {
				extraUpdates["pay_channel"] = payChannel
				order.PayChannel = payChannel
			}
			if len(extraUpdates) > 0 {
				extraUpdates["update_time"] = eventAt
				if err = tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(extraUpdates).Error; err != nil {
					return nil, response.CheckErr(err, "PurchaseCallback Failed Extra Updates err")
				}
			}
		}
		auditLog.ProcessStage = "failed"
		auditLog.ProcessResult = "支付失败回调已记录"
	case frontendPaymentCallbackResultClosed:
		if order.Status != frontendOrderStatusPaid {
			closeMessage := callbackMessage
			if closeMessage == "" {
				closeMessage = "支付已关闭"
			}
			closeRemark := "支付回调关闭：" + closeMessage
			updatePayload := map[string]interface{}{
				"status":          frontendOrderStatusClosed,
				"callback_status": frontendOrderCallbackStatusFailed,
				"callback_time":   eventAt,
				"callback_error":  closeMessage,
				"remark":          closeRemark,
				"update_time":     eventAt,
			}
			if strings.TrimSpace(tradeNo) != "" {
				updatePayload["trade_no"] = strings.TrimSpace(tradeNo)
				order.TradeNo = strings.TrimSpace(tradeNo)
			}
			if normalizePaymentChannelCode(payChannel) != "" {
				updatePayload["pay_channel"] = payChannel
				order.PayChannel = payChannel
			}
			if err = tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(updatePayload).Error; err != nil {
				return nil, response.CheckErr(err, "PurchaseCallback Closed Updates err")
			}
			order.Status = frontendOrderStatusClosed
			order.CallbackStatus = frontendOrderCallbackStatusFailed
			order.CallbackTime = eventAt
			order.CallbackError = closeMessage
			order.Remark = closeRemark
			order.UpdateTime = eventAt
		}
		auditLog.ProcessStage = "closed"
		auditLog.ProcessResult = "支付关闭回调已记录"
	default:
		paidRemark := "支付回调完成"
		if tradeNo != "" {
			paidRemark = fmt.Sprintf("支付回调完成，交易号：%s", tradeNo)
		}
		if callbackMessage != "" {
			paidRemark = paidRemark + "（" + callbackMessage + "）"
		}
		if _, _, err = markOrderPaidInTx(tx, &order, payChannel, tradeNo, eventAt, paidRemark); err != nil {
			auditLog.ProcessStage = "paid_error"
			auditLog.ProcessResult = strings.TrimSpace(err.Error())
			return nil, err
		}
		auditLog.ProcessStage = "paid"
		auditLog.ProcessResult = "支付成功并已发放权益"
	}
	if err := tx.Commit().Error; err != nil {
		auditLog.ProcessStage = "tx_commit_error"
		auditLog.ProcessResult = strings.TrimSpace(err.Error())
		return nil, response.CheckErr(err, "PurchaseCallback Commit err")
	}
	util.RedisUtil.Set(eventReplayKey, "1", frontendPaymentCallbackEventTTLSeconds)
	if nonceReplayKey != "" {
		util.RedisUtil.Set(nonceReplayKey, "1", frontendPaymentCallbackNonceTTLSeconds)
	}
	return map[string]interface{}{
		"order": formatOrderItemWithCommerce(order, commerceCfg),
	}, nil
}

// CloseOrder 函数说明：关闭当前用户的待支付订单，关闭后不可再直接支付。
func (srv frontendUserService) CloseOrder(frontendToken string, closeReq req.CommonFrontendUserOrderCloseReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		return nil, err
	}
	orderSN := strings.TrimSpace(closeReq.OrderSn)
	if orderSN == "" {
		return nil, response.AssertArgumentError.Make("订单号不能为空")
	}

	tx := srv.db.Begin()
	if tx.Error != nil {
		return nil, response.CheckErr(tx.Error, "CloseOrder Begin err")
	}
	defer func() {
		if e != nil {
			_ = tx.Rollback()
		}
	}()

	var order frontendUserOrderEntity
	if err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("order_sn = ? AND user_id = ? AND delete_time = ?", orderSN, userID, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		return nil, response.CheckErr(err, "CloseOrder Order First err")
	}
	if order.Status == frontendOrderStatusPaid {
		return nil, response.AssertArgumentError.Make("订单已支付，无法关闭")
	}
	if order.Status == frontendOrderStatusClosed {
		return map[string]interface{}{"order": formatOrderItemWithCommerce(order, commerceCfg)}, nil
	}

	now := time.Now().Unix()
	if err = tx.Model(&frontendUserOrderEntity{}).Where("id = ?", order.ID).Updates(map[string]interface{}{
		"status":      frontendOrderStatusClosed,
		"remark":      "用户主动关闭订单",
		"update_time": now,
	}).Error; err != nil {
		return nil, response.CheckErr(err, "CloseOrder Order Updates err")
	}
	order.Status = frontendOrderStatusClosed
	order.Remark = "用户主动关闭订单"
	order.UpdateTime = now

	if err = tx.Commit().Error; err != nil {
		return nil, response.CheckErr(err, "CloseOrder Commit err")
	}
	return map[string]interface{}{
		"order": formatOrderItemWithCommerce(order, commerceCfg),
	}, nil
}

// OrderStatus 函数说明：查询当前登录用户指定订单的最新支付状态（用于支付轮询兜底）。
func (srv frontendUserService) OrderStatus(frontendToken string, statusReq req.CommonFrontendUserOrderStatusReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	if _, err = srv.autoCloseExpiredPendingOrders(userID); err != nil {
		return nil, err
	}
	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		return nil, err
	}
	orderSN := strings.TrimSpace(statusReq.OrderSn)
	if orderSN == "" {
		return nil, response.AssertArgumentError.Make("订单号不能为空")
	}
	var order frontendUserOrderEntity
	if err = srv.db.Where("user_id = ? AND order_sn = ? AND delete_time = ?", userID, orderSN, 0).Limit(1).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.AssertArgumentError.Make("订单不存在")
		}
		return nil, response.CheckErr(err, "OrderStatus First err")
	}
	return map[string]interface{}{
		"order": formatOrderItemWithCommerce(order, commerceCfg),
	}, nil
}

// Orders 函数说明：查询当前登录用户的购买记录（分页）。
func (srv frontendUserService) Orders(frontendToken string, listReq req.CommonFrontendUserOrderListReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	if _, err = srv.autoCloseExpiredPendingOrders(userID); err != nil {
		return nil, err
	}
	commerceCfg, err := srv.getFrontendCommerceConfig()
	if err != nil {
		return nil, err
	}
	pageNo, pageSize := normalizePagination(listReq.PageNo, listReq.PageSize, 10, 100)
	chain := srv.db.Model(&frontendUserOrderEntity{}).Where("user_id = ? AND delete_time = ?", userID, 0)

	var count int64
	if err = chain.Count(&count).Error; err != nil {
		return nil, response.CheckErr(err, "Orders Count err")
	}

	orders := make([]frontendUserOrderEntity, 0)
	offset := (pageNo - 1) * pageSize
	if err = chain.Order("id DESC").Limit(pageSize).Offset(offset).Find(&orders).Error; err != nil {
		return nil, response.CheckErr(err, "Orders Find err")
	}
	lists := make([]map[string]interface{}, 0, len(orders))
	for _, item := range orders {
		lists = append(lists, formatOrderItemWithCommerce(item, commerceCfg))
	}
	return map[string]interface{}{
		"pageNo":   pageNo,
		"pageSize": pageSize,
		"count":    count,
		"lists":    lists,
	}, nil
}

// PointsLogs 函数说明：查询当前登录用户的积分流水（分页）。
func (srv frontendUserService) PointsLogs(frontendToken string, listReq req.CommonFrontendUserPointsLogListReq) (res map[string]interface{}, e error) {
	userID, err := resolveFrontendUserIDByToken(frontendToken)
	if err != nil {
		return nil, err
	}
	pageNo, pageSize := normalizePagination(listReq.PageNo, listReq.PageSize, 10, 100)
	chain := srv.db.Model(&frontendUserPointsLogEntity{}).Where("user_id = ?", userID)

	var count int64
	if err = chain.Count(&count).Error; err != nil {
		return nil, response.CheckErr(err, "PointsLogs Count err")
	}

	logs := make([]frontendUserPointsLogEntity, 0)
	offset := (pageNo - 1) * pageSize
	if err = chain.Order("id DESC").Limit(pageSize).Offset(offset).Find(&logs).Error; err != nil {
		return nil, response.CheckErr(err, "PointsLogs Find err")
	}
	lists := make([]map[string]interface{}, 0, len(logs))
	for _, item := range logs {
		lists = append(lists, formatPointsLogItem(item))
	}
	return map[string]interface{}{
		"pageNo":   pageNo,
		"pageSize": pageSize,
		"count":    count,
		"lists":    lists,
	}, nil
}

// Logout 函数说明：前台用户退出登录，删除 Redis 中对应会话 token。
func (srv frontendUserService) Logout(frontendToken string) (e error) {
	trimmedToken := strings.TrimSpace(frontendToken)
	if trimmedToken == "" {
		return nil
	}
	util.RedisUtil.Del(buildFrontendTokenRedisKey(trimmedToken))
	return nil
}
