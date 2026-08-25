package setting

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	req "likeadmin/admin/schemas/req"
	"likeadmin/config"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	licenseConfigType                    = "license"
	licenseConfigEnforceKey              = "enforce"
	licenseConfigVerifyApiURLKey         = "verifyApiUrl"
	licenseConfigVerifyApiTokenKey       = "verifyApiToken"
	licenseConfigVerifyApiMethodKey      = "verifyApiMethod"
	licenseConfigVerifyApiTimeoutKey     = "verifyApiTimeout"
	licenseConfigVerifyApiAllowTLSKey    = "verifyApiAllowInsecureTls"
	licenseConfigApiSignSecretKey        = "apiSignSecret"
	licenseDefaultEnforce                = "0"
	licenseDefaultVerifyApiURL           = "https://fsuied.com/api/license/detail"
	licenseDefaultVerifyApiMethod        = "GET"
	licenseDefaultVerifyApiTimeout       = "10000"
	licenseDefaultVerifyApiAllowInsecure = "0"
	licenseDefaultProductCode            = "uiedtool-commercial"
	licenseRequestSource                 = "uiedtool-commercial-client"
	licenseRequestVersion                = "1.0.1"
)

const (
	licenseStatusInactive uint8 = 0
	licenseStatusActive   uint8 = 1
	licenseStatusExpired  uint8 = 2
	licenseStatusBlocked  uint8 = 3
)

// ISettingLicenseService 函数说明：统一定义后台授权管理与客户端授权消费端能力。
type ISettingLicenseService interface {
	Detail() (res map[string]interface{}, e error)
	Save(saveReq req.SettingLicenseSaveReq) (e error)
	Verify(verifyReq req.SettingLicenseVerifyReq) (res map[string]interface{}, e error)
	ClientInfo(infoReq req.CommonUiedLicenseInfoReq, requestHost string) (res map[string]interface{}, e error)
	ClientActivate(activateReq req.CommonUiedLicenseActivateReq, requestHost string) (res map[string]interface{}, remoteCode int, e error)
	ClientVerifyPayload(verifyReq req.CommonUiedLicenseVerifyReq, requestHost string) (res map[string]interface{}, e error)
	ClientSavePayload(saveReq req.CommonUiedLicenseSaveReq, requestHost string) (res map[string]interface{}, e error)
}

// NewSettingLicenseService 函数说明：初始化源码授权配置服务。
func NewSettingLicenseService(db *gorm.DB) ISettingLicenseService {
	return &settingLicenseService{db: db}
}

// settingLicenseService 函数说明：源码授权配置服务实现。
type settingLicenseService struct {
	db *gorm.DB
}

// systemLicenseEntity 函数说明：映射 la_system_license 授权表。
type systemLicenseEntity struct {
	ID                uint   `gorm:"column:id"`
	LicenseKey        string `gorm:"column:license_key"`
	CustomerName      string `gorm:"column:customer_name"`
	ContactName       string `gorm:"column:contact_name"`
	ContactMobile     string `gorm:"column:contact_mobile"`
	ContactEmail      string `gorm:"column:contact_email"`
	ProductCode       string `gorm:"column:product_code"`
	BoundDomain       string `gorm:"column:bound_domain"`
	MachineCode       string `gorm:"column:machine_code"`
	Edition           string `gorm:"column:edition"`
	RawStatus         string `gorm:"column:raw_status"`
	CompanyName       string `gorm:"column:company_name"`
	DomainLimit       int    `gorm:"column:domain_limit"`
	DomainWhitelist   string `gorm:"column:domain_whitelist"`
	Signature         string `gorm:"column:signature"`
	SignVersion       string `gorm:"column:sign_version"`
	IsSignatureValid  uint8  `gorm:"column:is_signature_valid"`
	Status            uint8  `gorm:"column:status"`
	ExpireTime        int64  `gorm:"column:expire_time"`
	ActivatedTime     int64  `gorm:"column:activated_time"`
	LastVerifyTime    int64  `gorm:"column:last_verify_time"`
	LastVerifyMessage string `gorm:"column:last_verify_message"`
	LastVerifyPayload string `gorm:"column:last_verify_payload"`
	Remark            string `gorm:"column:remark"`
	CreateTime        int64  `gorm:"column:create_time"`
	UpdateTime        int64  `gorm:"column:update_time"`
}

// TableName 函数说明：声明授权实体对应的数据表名。
func (systemLicenseEntity) TableName() string {
	return "la_system_license"
}

// licenseVerifyConfig 函数说明：承载授权中心激活配置与运行时开关。
type licenseVerifyConfig struct {
	Enforce           int
	VerifyApiURL      string
	VerifyApiToken    string
	VerifyApiMethod   string
	VerifyApiTimeout  int
	VerifyApiAllowTLS bool
	ApiSignSecret     string
}

// licenseVerifyRemotePayload 函数说明：客户端向 FSUIED 授权中心请求激活时的参数结构。
type licenseVerifyRemotePayload struct {
	LicenseKey    string `json:"licenseKey"`
	BindDomain    string `json:"bindDomain"`
	ProjectCode   string `json:"projectCode"`
	ProductCode   string `json:"productCode,omitempty"`
	Domain        string `json:"domain,omitempty"`
	RuntimeDomain string `json:"runtimeDomain,omitempty"`
	Source        string `json:"source,omitempty"`
	Version       string `json:"version,omitempty"`
	Timestamp     string `json:"timestamp,omitempty"`
}

// fsuiedLicensePayload 函数说明：FSUIED 授权中心返回的签名授权载荷结构。
type fsuiedLicensePayload struct {
	Edition          string   `json:"edition"`
	Status           string   `json:"status"`
	LicenseKey       string   `json:"licenseKey"`
	ProjectCode      string   `json:"projectCode"`
	CustomerName     string   `json:"customerName"`
	CompanyName      string   `json:"companyName"`
	ContactEmail     string   `json:"contactEmail"`
	DomainLimit      int      `json:"domainLimit"`
	DomainWhitelist  []string `json:"domainWhitelist"`
	IssuedAt         int64    `json:"issuedAt"`
	ExpiresAt        int64    `json:"expiresAt"`
	Note             string   `json:"note"`
	SignVersion      string   `json:"signVersion"`
	UpdatedAt        int64    `json:"updatedAt"`
	Signature        string   `json:"signature"`
	IsSignatureValid bool     `json:"isSignatureValid"`
}

// licenseVerifyRemoteResponse 函数说明：FSUIED 授权中心统一响应结构。
type licenseVerifyRemoteResponse struct {
	Code    int             `json:"code"`
	Msg     string          `json:"msg"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

// licenseVerifyResult 函数说明：统一封装远程激活/本地缓存回退后的结果。
type licenseVerifyResult struct {
	Valid            bool
	Status           uint8
	RawStatus        string
	Edition          string
	ExpireTime       int64
	Message          string
	VerifyPayload    string
	CustomerName     string
	CompanyName      string
	ContactEmail     string
	BoundDomain      string
	MachineCode      string
	ProductCode      string
	DomainLimit      int
	DomainWhitelist  []string
	Signature        string
	SignVersion      string
	IsSignatureValid bool
}

// licenseRuntimeState 函数说明：统一描述本地授权在当前运行域名下的有效状态。
type licenseRuntimeState struct {
	Edition              string
	EffectiveEdition     string
	Status               string
	RawStatus            string
	IsActive             bool
	IsExpired            bool
	SignatureRequired    bool
	IsSignatureValid     bool
	DomainLimit          int
	DomainUsedCount      int
	DomainRemainingCount int
	RegisteredDomains    []string
	DomainEnforceEnabled bool
	IsDomainAuthorized   bool
	DomainReason         string
	RuntimeDomain        string
	Reason               string
}

// licenseRemoteError 函数说明：保留远程授权中心业务错误码，便于客户端接口透传契约级错误。
type licenseRemoteError struct {
	Code    int
	Message string
}

// Error 函数说明：实现 error 接口，便于统一链路处理远程授权错误。
func (e *licenseRemoteError) Error() string {
	if e == nil {
		return ""
	}
	return strings.TrimSpace(e.Message)
}

// Detail 函数说明：读取授权配置详情并返回给后台授权管理页。
func (s settingLicenseService) Detail() (res map[string]interface{}, e error) {
	licenseRow, err := ensureLicenseRow(s.db)
	if e = response.CheckErr(err, "license detail ensure row err"); e != nil {
		return
	}
	verifyCfg, err := loadLicenseConfig(s.db)
	if e = response.CheckErr(err, "license detail load config err"); e != nil {
		return
	}
	res = map[string]interface{}{
		"id":                        licenseRow.ID,
		"licenseKey":                licenseRow.LicenseKey,
		"licenseKeyMasked":          maskSecretValue(licenseRow.LicenseKey),
		"customerName":              licenseRow.CustomerName,
		"contactName":               licenseRow.ContactName,
		"contactMobile":             licenseRow.ContactMobile,
		"contactEmail":              licenseRow.ContactEmail,
		"productCode":               fillDefaultProductCode(licenseRow.ProductCode),
		"boundDomain":               licenseRow.BoundDomain,
		"machineCode":               licenseRow.MachineCode,
		"edition":                   normalizeLicenseEdition(licenseRow.Edition),
		"rawStatus":                 strings.TrimSpace(licenseRow.RawStatus),
		"companyName":               licenseRow.CompanyName,
		"domainLimit":               licenseRow.DomainLimit,
		"domainWhitelist":           registeredDomainsFromRow(licenseRow),
		"signVersion":               licenseRow.SignVersion,
		"isSignatureValid":          licenseRow.IsSignatureValid == 1,
		"status":                    licenseRow.Status,
		"statusText":                getLicenseStatusText(licenseRow.Status, licenseRow.ExpireTime),
		"expireTime":                licenseRow.ExpireTime,
		"expireTimeText":            formatUnixText(licenseRow.ExpireTime),
		"activatedTime":             licenseRow.ActivatedTime,
		"activatedTimeText":         formatUnixText(licenseRow.ActivatedTime),
		"lastVerifyTime":            licenseRow.LastVerifyTime,
		"lastVerifyTimeText":        formatUnixText(licenseRow.LastVerifyTime),
		"lastVerifyMessage":         licenseRow.LastVerifyMessage,
		"lastVerifyPayload":         licenseRow.LastVerifyPayload,
		"remark":                    licenseRow.Remark,
		"enforce":                   verifyCfg.Enforce,
		"verifyApiUrl":              verifyCfg.VerifyApiURL,
		"verifyApiToken":            verifyCfg.VerifyApiToken,
		"verifyApiTokenMask":        maskSecretValue(verifyCfg.VerifyApiToken),
		"verifyApiMethod":           verifyCfg.VerifyApiMethod,
		"verifyApiTimeout":          verifyCfg.VerifyApiTimeout,
		"verifyApiAllowInsecureTls": boolToInt(verifyCfg.VerifyApiAllowTLS),
		"apiSignSecret":             verifyCfg.ApiSignSecret,
		"apiSignSecretMask":         maskSecretValue(verifyCfg.ApiSignSecret),
	}
	return
}

// Save 函数说明：保存授权基础信息与授权中心激活配置。
func (s settingLicenseService) Save(saveReq req.SettingLicenseSaveReq) (e error) {
	licenseRow, err := ensureLicenseRow(s.db)
	if e = response.CheckErr(err, "license save ensure row err"); e != nil {
		return
	}

	now := time.Now().Unix()
	nextLicenseKey := strings.TrimSpace(saveReq.LicenseKey)
	nextProductCode := fillDefaultProductCode(strings.TrimSpace(saveReq.ProductCode))
	nextBoundDomain := normalizeLicenseDomain(saveReq.BoundDomain)
	nextExpireTime := normalizeLicenseExpireTime(saveReq.ExpireTime)
	currentLicenseKey := strings.TrimSpace(licenseRow.LicenseKey)
	currentProductCode := fillDefaultProductCode(strings.TrimSpace(licenseRow.ProductCode))
	currentBoundDomain := normalizeLicenseDomain(licenseRow.BoundDomain)
	coreFieldsChanged := nextLicenseKey != currentLicenseKey || nextProductCode != currentProductCode || nextBoundDomain != currentBoundDomain

	if nextLicenseKey != "" && nextBoundDomain == "" {
		return response.AssertArgumentError.Make("请先填写绑定域名，商业授权按域名绑定校验。")
	}

	nextStatus := licenseRow.Status
	nextMessage := strings.TrimSpace(licenseRow.LastVerifyMessage)
	if coreFieldsChanged {
		nextStatus = licenseStatusInactive
		nextMessage = "授权核心参数已修改，请点击“立即校验”完成激活。"
	}

	updateMap := map[string]interface{}{
		"license_key":         nextLicenseKey,
		"customer_name":       strings.TrimSpace(saveReq.CustomerName),
		"contact_name":        strings.TrimSpace(saveReq.ContactName),
		"contact_mobile":      strings.TrimSpace(saveReq.ContactMobile),
		"contact_email":       strings.TrimSpace(saveReq.ContactEmail),
		"product_code":        nextProductCode,
		"bound_domain":        nextBoundDomain,
		"machine_code":        strings.TrimSpace(saveReq.MachineCode),
		"expire_time":         nextExpireTime,
		"status":              nextStatus,
		"remark":              strings.TrimSpace(saveReq.Remark),
		"last_verify_message": nextMessage,
		"update_time":         now,
	}
	if coreFieldsChanged {
		updateMap["edition"] = "free"
		updateMap["raw_status"] = "inactive"
		updateMap["company_name"] = ""
		updateMap["domain_limit"] = 0
		updateMap["domain_whitelist"] = "[]"
		updateMap["signature"] = ""
		updateMap["sign_version"] = ""
		updateMap["is_signature_valid"] = 0
		updateMap["activated_time"] = int64(0)
		updateMap["last_verify_time"] = int64(0)
		updateMap["last_verify_payload"] = ""
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return response.SystemError
	}
	if err = tx.Model(&systemLicenseEntity{}).Where("id = ?", licenseRow.ID).Updates(updateMap).Error; err != nil {
		tx.Rollback()
		return response.SystemError
	}

	enforceValue := "0"
	if saveReq.Enforce == 1 {
		enforceValue = "1"
	}
	verifyApiURL := strings.TrimSpace(saveReq.VerifyApiUrl)
	if verifyApiURL == "" {
		verifyApiURL = firstNonEmpty(config.Config.UiedLicenseActivateEndpoint, licenseDefaultVerifyApiURL)
	}
	verifyApiMethod := normalizeVerifyMethod(saveReq.VerifyApiMethod)
	verifyApiTimeout := normalizeVerifyTimeout(int64(saveReq.VerifyApiTimeout))
	verifyApiAllowTLS := "0"
	if saveReq.VerifyApiAllowInsecureTls == 1 {
		verifyApiAllowTLS = "1"
	}
	if err = util.ConfigUtil.Set(tx, licenseConfigType, licenseConfigEnforceKey, enforceValue); err != nil {
		tx.Rollback()
		return response.SystemError
	}
	if err = util.ConfigUtil.Set(tx, licenseConfigType, licenseConfigVerifyApiURLKey, verifyApiURL); err != nil {
		tx.Rollback()
		return response.SystemError
	}
	if err = util.ConfigUtil.Set(tx, licenseConfigType, licenseConfigVerifyApiTokenKey, strings.TrimSpace(saveReq.VerifyApiToken)); err != nil {
		tx.Rollback()
		return response.SystemError
	}
	if err = util.ConfigUtil.Set(tx, licenseConfigType, licenseConfigVerifyApiMethodKey, verifyApiMethod); err != nil {
		tx.Rollback()
		return response.SystemError
	}
	if err = util.ConfigUtil.Set(tx, licenseConfigType, licenseConfigVerifyApiTimeoutKey, strconv.Itoa(verifyApiTimeout)); err != nil {
		tx.Rollback()
		return response.SystemError
	}
	if err = util.ConfigUtil.Set(tx, licenseConfigType, licenseConfigVerifyApiAllowTLSKey, verifyApiAllowTLS); err != nil {
		tx.Rollback()
		return response.SystemError
	}
	if err = util.ConfigUtil.Set(tx, licenseConfigType, licenseConfigApiSignSecretKey, strings.TrimSpace(saveReq.ApiSignSecret)); err != nil {
		tx.Rollback()
		return response.SystemError
	}

	if err = tx.Commit().Error; err != nil {
		return response.SystemError
	}
	return nil
}

// Verify 函数说明：执行后台人工授权校验（优先远程激活，失败时仅允许基于最近成功缓存兜底）。
func (s settingLicenseService) Verify(verifyReq req.SettingLicenseVerifyReq) (res map[string]interface{}, e error) {
	licenseRow, err := ensureLicenseRow(s.db)
	if e = response.CheckErr(err, "license verify ensure row err"); e != nil {
		return
	}
	if strings.TrimSpace(licenseRow.LicenseKey) == "" {
		e = response.AssertArgumentError.Make("请先填写授权码后再执行校验")
		return
	}
	if normalizeLicenseDomain(licenseRow.BoundDomain) == "" {
		e = response.AssertArgumentError.Make("请先填写绑定域名后再执行校验")
		return
	}

	verifyCfg, err := loadLicenseConfig(s.db)
	if e = response.CheckErr(err, "license verify load config err"); e != nil {
		return
	}

	verifyResult := licenseVerifyResult{}
	remoteResult, calledRemote, remoteErr := verifyLicenseByRemote(licenseRow, verifyCfg)
	if calledRemote && remoteErr == nil {
		verifyResult = remoteResult
	} else {
		if verifyReq.ForceRemote == 1 && remoteErr != nil {
			e = response.AssertArgumentError.Make("授权中心校验失败：" + remoteErr.Error())
			return
		}
		verifyResult = verifyLicenseByLocal(licenseRow)
		if remoteErr != nil {
			verifyResult.Message = "授权中心不可用，已回退本地缓存：" + verifyResult.Message
		}
	}

	now := time.Now().Unix()
	if err = s.db.Model(&systemLicenseEntity{}).Where("id = ?", licenseRow.ID).Updates(buildVerifyPersistMap(licenseRow, verifyResult, now)).Error; err != nil {
		e = response.SystemError
		return
	}

	res = map[string]interface{}{
		"valid":                     verifyResult.Valid,
		"status":                    verifyResult.Status,
		"statusText":                getLicenseStatusText(verifyResult.Status, verifyResult.ExpireTime),
		"rawStatus":                 verifyResult.RawStatus,
		"edition":                   verifyResult.Edition,
		"expireTime":                normalizeLicenseExpireTime(verifyResult.ExpireTime),
		"expireTimeText":            formatUnixText(normalizeLicenseExpireTime(verifyResult.ExpireTime)),
		"message":                   verifyResult.Message,
		"enforce":                   verifyCfg.Enforce,
		"verifyApiUrl":              verifyCfg.VerifyApiURL,
		"verifyApiTokenMask":        maskSecretValue(verifyCfg.VerifyApiToken),
		"verifyApiMethod":           verifyCfg.VerifyApiMethod,
		"verifyApiTimeout":          verifyCfg.VerifyApiTimeout,
		"verifyApiAllowInsecureTls": boolToInt(verifyCfg.VerifyApiAllowTLS),
		"apiSignSecretMask":         maskSecretValue(verifyCfg.ApiSignSecret),
		"lastVerifyTime":            now,
		"lastVerifyTimeText":        formatUnixText(now),
		"lastVerifyPayload":         strings.TrimSpace(verifyResult.VerifyPayload),
		"isSignatureValid":          verifyResult.IsSignatureValid,
	}
	return
}

// ClientInfo 函数说明：向客户项目暴露当前本地授权运行态信息。
func (s settingLicenseService) ClientInfo(infoReq req.CommonUiedLicenseInfoReq, requestHost string) (res map[string]interface{}, e error) {
	licenseRow, err := ensureLicenseRow(s.db)
	if e = response.CheckErr(err, "license client info ensure row err"); e != nil {
		return
	}
	verifyCfg, err := loadLicenseConfig(s.db)
	if e = response.CheckErr(err, "license client info load config err"); e != nil {
		return
	}
	projectCode := fillDefaultProductCode(firstNonEmpty(strings.TrimSpace(infoReq.ProjectCode), strings.TrimSpace(licenseRow.ProductCode)))
	licenseRow.ProductCode = projectCode
	res = buildClientLicenseInfo(licenseRow, requestHost, verifyCfg)
	return
}

// ClientActivate 函数说明：客户项目按授权码向 FSUIED 授权中心请求激活并写入本地。
func (s settingLicenseService) ClientActivate(activateReq req.CommonUiedLicenseActivateReq, requestHost string) (res map[string]interface{}, remoteCode int, e error) {
	licenseRow, err := ensureLicenseRow(s.db)
	if e = response.CheckErr(err, "license client activate ensure row err"); e != nil {
		return
	}
	verifyCfg, err := loadLicenseConfig(s.db)
	if e = response.CheckErr(err, "license client activate load config err"); e != nil {
		return
	}

	boundDomain := normalizeActivateDomain(activateReq, requestHost)
	if boundDomain == "" {
		e = response.AssertArgumentError.Make("请提供 bindDomain，或在运行域名下发起激活请求")
		return
	}
	productCode := fillDefaultProductCode(strings.TrimSpace(activateReq.ProjectCode))
	licenseRow.LicenseKey = strings.TrimSpace(activateReq.LicenseKey)
	licenseRow.BoundDomain = boundDomain
	licenseRow.ProductCode = productCode

	verifyResult, _, remoteErr := verifyLicenseByRemote(licenseRow, verifyCfg)
	if remoteErr != nil {
		remoteCode = 500
		var remoteBizErr *licenseRemoteError
		if errors.As(remoteErr, &remoteBizErr) {
			remoteCode = remoteBizErr.Code
		}
		e = remoteErr
		return
	}

	now := time.Now().Unix()
	persistMap := buildVerifyPersistMap(licenseRow, verifyResult, now)
	persistMap["license_key"] = strings.TrimSpace(activateReq.LicenseKey)
	persistMap["product_code"] = productCode
	persistMap["bound_domain"] = boundDomain
	if err = s.db.Model(&systemLicenseEntity{}).Where("id = ?", licenseRow.ID).Updates(persistMap).Error; err != nil {
		e = response.SystemError
		return
	}

	var latestRow systemLicenseEntity
	if err = s.db.Where("id = ?", licenseRow.ID).First(&latestRow).Error; err != nil {
		e = response.SystemError
		return
	}
	res = buildClientLicenseInfo(latestRow, boundDomain, verifyCfg)
	res["activatedBy"] = "license_key"
	return
}

// ClientVerifyPayload 函数说明：验证外部签名授权载荷的基本有效性，供导入前预检使用。
func (s settingLicenseService) ClientVerifyPayload(verifyReq req.CommonUiedLicenseVerifyReq, requestHost string) (res map[string]interface{}, e error) {
	row := buildLicenseRowFromPayloadReq(verifyReq)
	state := evaluateLicenseRuntime(row, requestHost)
	res = buildPayloadVerifyResponse(row, state)
	return
}

// ClientSavePayload 函数说明：直接保存已验证的签名授权载荷到本地授权表。
func (s settingLicenseService) ClientSavePayload(saveReq req.CommonUiedLicenseSaveReq, requestHost string) (res map[string]interface{}, e error) {
	licenseRow, err := ensureLicenseRow(s.db)
	if e = response.CheckErr(err, "license client save ensure row err"); e != nil {
		return
	}
	verifyCfg, err := loadLicenseConfig(s.db)
	if e = response.CheckErr(err, "license client save load config err"); e != nil {
		return
	}

	row := buildLicenseRowFromPayloadReq(saveReq)
	state := evaluateLicenseRuntime(row, requestHost)
	if !isPaidLicenseEdition(row.Edition) {
		e = response.AssertArgumentError.Make("当前仅允许保存 Pro / Enterprise 授权载荷")
		return
	}
	if strings.TrimSpace(row.Signature) == "" {
		e = response.AssertArgumentError.Make("签名授权载荷缺少 signature，禁止直接导入")
		return
	}
	if row.IsSignatureValid != 1 {
		e = response.AssertArgumentError.Make("签名校验未通过，禁止直接导入授权载荷")
		return
	}

	now := time.Now().Unix()
	persistMap := buildPayloadPersistMap(licenseRow, row, state, now, "manual_payload_import")
	if err = s.db.Model(&systemLicenseEntity{}).Where("id = ?", licenseRow.ID).Updates(persistMap).Error; err != nil {
		e = response.SystemError
		return
	}

	var latestRow systemLicenseEntity
	if err = s.db.Where("id = ?", licenseRow.ID).First(&latestRow).Error; err != nil {
		e = response.SystemError
		return
	}
	res = buildClientLicenseInfo(latestRow, requestHost, verifyCfg)
	res["activatedBy"] = "signed_payload"
	return
}

// CheckRuntimeLicense 函数说明：运行时授权校验（仅在后台受保护接口上按开关决定是否拦截）。
func CheckRuntimeLicense(db *gorm.DB, requestHost string) (allowed bool, reason string, e error) {
	verifyCfg, err := loadLicenseConfig(db)
	if err != nil {
		return false, "", err
	}
	if !isRuntimeLicenseEnforcementEnabled(verifyCfg.Enforce) {
		return true, "", nil
	}

	var row systemLicenseEntity
	if err = db.Where("id = ?", 1).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, "授权未激活，请在后台完成授权校验。", nil
		}
		return false, "", err
	}

	state := evaluateLicenseRuntime(row, requestHost)
	if state.IsActive {
		return true, "", nil
	}
	if strings.TrimSpace(state.Reason) == "" {
		return false, "授权无效，请联系 fsuied.com 获取商业授权。", nil
	}
	return false, state.Reason, nil
}

// isRuntimeLicenseEnforcementEnabled 函数说明：仅在运营明确开启强制授权时拦截业务接口，关闭状态在生产环境同样保持可管理。
func isRuntimeLicenseEnforcementEnabled(enforce int) bool {
	return enforce == 1
}

// ensureLicenseRow 函数说明：确保授权主记录存在，避免首次打开授权页时报错。
func ensureLicenseRow(db *gorm.DB) (row systemLicenseEntity, e error) {
	err := db.Where("id = ?", 1).First(&row).Error
	if err == nil {
		row.ProductCode = fillDefaultProductCode(row.ProductCode)
		row.Edition = normalizeLicenseEdition(row.Edition)
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		e = err
		return
	}

	now := time.Now().Unix()
	row = systemLicenseEntity{
		ID:                1,
		ProductCode:       licenseDefaultProductCode,
		Edition:           "free",
		RawStatus:         "inactive",
		DomainWhitelist:   "[]",
		Status:            licenseStatusInactive,
		LastVerifyMessage: "尚未校验授权，请录入授权码后点击“立即校验”。",
		CreateTime:        now,
		UpdateTime:        now,
	}
	e = db.Create(&row).Error
	return
}

// loadLicenseConfig 函数说明：统一读取授权配置开关与授权中心激活服务配置。
func loadLicenseConfig(db *gorm.DB) (cfg licenseVerifyConfig, e error) {
	enforceRaw, err := util.ConfigUtil.GetVal(db, licenseConfigType, licenseConfigEnforceKey, licenseDefaultEnforce)
	if err != nil {
		e = err
		return
	}
	if strings.TrimSpace(enforceRaw) == "1" {
		cfg.Enforce = 1
	}
	cfg.VerifyApiURL, err = util.ConfigUtil.GetVal(db, licenseConfigType, licenseConfigVerifyApiURLKey, firstNonEmpty(config.Config.UiedLicenseActivateEndpoint, licenseDefaultVerifyApiURL))
	if err != nil {
		e = err
		return
	}
	cfg.VerifyApiToken, err = util.ConfigUtil.GetVal(db, licenseConfigType, licenseConfigVerifyApiTokenKey, config.Config.UiedLicenseActivateToken)
	if err != nil {
		e = err
		return
	}
	verifyMethodDefault := firstNonEmpty(strings.ToUpper(strings.TrimSpace(config.Config.UiedLicenseActivateMethod)), licenseDefaultVerifyApiMethod)
	verifyMethodRaw, err := util.ConfigUtil.GetVal(db, licenseConfigType, licenseConfigVerifyApiMethodKey, verifyMethodDefault)
	if err != nil {
		e = err
		return
	}
	verifyTimeoutDefault := licenseDefaultVerifyApiTimeout
	if config.Config.UiedLicenseActivateTimeout > 0 {
		verifyTimeoutDefault = strconv.Itoa(config.Config.UiedLicenseActivateTimeout)
	}
	verifyTimeoutRaw, err := util.ConfigUtil.GetVal(db, licenseConfigType, licenseConfigVerifyApiTimeoutKey, verifyTimeoutDefault)
	if err != nil {
		e = err
		return
	}
	verifyAllowTLSDefault := licenseDefaultVerifyApiAllowInsecure
	if config.Config.UiedLicenseActivateAllowInsecure {
		verifyAllowTLSDefault = "1"
	}
	verifyAllowTLSRaw, err := util.ConfigUtil.GetVal(db, licenseConfigType, licenseConfigVerifyApiAllowTLSKey, verifyAllowTLSDefault)
	if err != nil {
		e = err
		return
	}
	cfg.ApiSignSecret, err = util.ConfigUtil.GetVal(db, licenseConfigType, licenseConfigApiSignSecretKey, config.Config.UiedLicenseApiSignSecret)
	if err != nil {
		e = err
		return
	}

	cfg.VerifyApiURL = strings.TrimSpace(cfg.VerifyApiURL)
	if cfg.VerifyApiURL == "" {
		cfg.VerifyApiURL = firstNonEmpty(config.Config.UiedLicenseActivateEndpoint, licenseDefaultVerifyApiURL)
	}
	cfg.VerifyApiToken = strings.TrimSpace(cfg.VerifyApiToken)
	cfg.VerifyApiMethod = normalizeVerifyMethod(verifyMethodRaw)
	cfg.VerifyApiTimeout = normalizeVerifyTimeout(parseIntValue(verifyTimeoutRaw))
	cfg.VerifyApiAllowTLS = parseBoolValue(verifyAllowTLSRaw)
	cfg.ApiSignSecret = strings.TrimSpace(cfg.ApiSignSecret)
	return
}

// verifyLicenseByRemote 函数说明：请求 FSUIED 授权中心完成激活并获取签名授权载荷。
func verifyLicenseByRemote(row systemLicenseEntity, verifyCfg licenseVerifyConfig) (res licenseVerifyResult, called bool, e error) {
	verifyApiURL := strings.TrimSpace(verifyCfg.VerifyApiURL)
	if verifyApiURL == "" {
		return res, false, nil
	}
	payload := licenseVerifyRemotePayload{
		LicenseKey:    strings.TrimSpace(row.LicenseKey),
		BindDomain:    normalizeLicenseDomain(row.BoundDomain),
		ProjectCode:   fillDefaultProductCode(row.ProductCode),
		ProductCode:   fillDefaultProductCode(row.ProductCode),
		Domain:        normalizeLicenseDomain(row.BoundDomain),
		RuntimeDomain: normalizeLicenseDomain(row.BoundDomain),
		Source:        licenseRequestSource,
		Version:       licenseRequestVersion,
	}
	if payload.LicenseKey == "" {
		return res, true, &licenseRemoteError{Code: 41000, Message: "授权码不能为空"}
	}
	if payload.BindDomain == "" {
		return res, true, &licenseRemoteError{Code: 41000, Message: "绑定域名不能为空"}
	}

	reqObj, requestSnapshot, err := buildLicenseRemoteRequest(verifyApiURL, verifyCfg, payload)
	if err != nil {
		return res, true, err
	}

	client := &http.Client{
		Timeout:   time.Duration(verifyCfg.VerifyApiTimeout) * time.Millisecond,
		Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: verifyCfg.VerifyApiAllowTLS}},
	}
	respObj, err := client.Do(reqObj)
	if err != nil {
		return res, true, err
	}
	defer respObj.Body.Close()

	respBody, err := io.ReadAll(respObj.Body)
	if err != nil {
		return res, true, err
	}

	var remoteResp licenseVerifyRemoteResponse
	if err = json.Unmarshal(respBody, &remoteResp); err != nil {
		return res, true, err
	}

	remoteMessage := firstNonEmpty(strings.TrimSpace(remoteResp.Message), strings.TrimSpace(remoteResp.Msg), extractRemoteDataMessage(remoteResp.Data))
	if remoteResp.Code != 0 && remoteResp.Code != 200 {
		if remoteMessage == "" {
			remoteMessage = "授权中心返回失败状态"
		}
		return res, true, &licenseRemoteError{Code: remoteResp.Code, Message: remoteMessage}
	}
	if respObj.StatusCode >= 400 {
		if remoteMessage == "" {
			remoteMessage = fmt.Sprintf("授权中心返回 HTTP %d", respObj.StatusCode)
		}
		return res, true, &licenseRemoteError{Code: respObj.StatusCode, Message: remoteMessage}
	}
	licensePayload, extractErr := extractRemoteLicensePayload(remoteResp.Data, payload)
	if extractErr != nil {
		return res, true, extractErr
	}

	licensePayload = normalizeRemoteLicensePayload(licensePayload, payload)
	tempRow := buildLicenseRowFromRemotePayload(licensePayload, payload.BindDomain)
	state := evaluateLicenseRuntime(tempRow, payload.BindDomain)
	verifyPayload := buildStoredVerifyPayload("remote_activate", requestSnapshot, remoteResp, licensePayload, state, remoteMessage)
	res = licenseVerifyResult{
		Valid:            state.IsActive,
		Status:           mapRuntimeStatusToCode(state.Status),
		RawStatus:        firstNonEmpty(strings.TrimSpace(licensePayload.Status), state.Status),
		Edition:          normalizeLicenseEdition(licensePayload.Edition),
		ExpireTime:       normalizeLicenseExpireTime(licensePayload.ExpiresAt),
		Message:          buildRuntimeVerifyMessage(state, true, remoteMessage),
		VerifyPayload:    verifyPayload,
		CustomerName:     strings.TrimSpace(licensePayload.CustomerName),
		CompanyName:      strings.TrimSpace(licensePayload.CompanyName),
		ContactEmail:     strings.TrimSpace(licensePayload.ContactEmail),
		BoundDomain:      payload.BindDomain,
		MachineCode:      strings.TrimSpace(row.MachineCode),
		ProductCode:      fillDefaultProductCode(licensePayload.ProjectCode),
		DomainLimit:      licensePayload.DomainLimit,
		DomainWhitelist:  normalizeDomainWhitelist(licensePayload.DomainWhitelist, payload.BindDomain),
		Signature:        strings.TrimSpace(licensePayload.Signature),
		SignVersion:      strings.TrimSpace(licensePayload.SignVersion),
		IsSignatureValid: licensePayload.IsSignatureValid,
	}
	return res, true, nil
}

// verifyLicenseByLocal 函数说明：授权中心不可用时仅基于最近一次成功校验缓存兜底，不做弱规则激活。
func verifyLicenseByLocal(row systemLicenseEntity) (res licenseVerifyResult) {
	state := evaluateLicenseRuntime(row, row.BoundDomain)
	message := "本地缓存不可用：尚未完成一次成功的远程授权校验。"
	if row.LastVerifyTime > 0 && state.IsActive {
		message = "已使用最近一次成功校验缓存继续运行。"
	} else if strings.TrimSpace(state.Reason) != "" {
		message = state.Reason
	}
	localPayload, _ := json.Marshal(map[string]interface{}{
		"mode":              "local_fallback",
		"valid":             state.IsActive,
		"status":            state.Status,
		"rawStatus":         state.RawStatus,
		"edition":           state.Edition,
		"runtimeDomain":     state.RuntimeDomain,
		"registeredDomains": state.RegisteredDomains,
		"message":           message,
	})
	res = licenseVerifyResult{
		Valid:            state.IsActive,
		Status:           mapRuntimeStatusToCode(state.Status),
		RawStatus:        state.RawStatus,
		Edition:          state.Edition,
		ExpireTime:       normalizeLicenseExpireTime(row.ExpireTime),
		Message:          message,
		VerifyPayload:    string(localPayload),
		CustomerName:     strings.TrimSpace(row.CustomerName),
		CompanyName:      strings.TrimSpace(row.CompanyName),
		ContactEmail:     strings.TrimSpace(row.ContactEmail),
		BoundDomain:      normalizeLicenseDomain(row.BoundDomain),
		MachineCode:      strings.TrimSpace(row.MachineCode),
		ProductCode:      fillDefaultProductCode(row.ProductCode),
		DomainLimit:      row.DomainLimit,
		DomainWhitelist:  registeredDomainsFromRow(row),
		Signature:        strings.TrimSpace(row.Signature),
		SignVersion:      strings.TrimSpace(row.SignVersion),
		IsSignatureValid: row.IsSignatureValid == 1,
	}
	return
}

// buildLicenseRemoteRequest 函数说明：按 FSUIED 文档构造带签名头的激活请求。
func buildLicenseRemoteRequest(endpoint string, verifyCfg licenseVerifyConfig, payload licenseVerifyRemotePayload) (reqObj *http.Request, requestSnapshot map[string]interface{}, e error) {
	activateMethod := normalizeVerifyMethod(verifyCfg.VerifyApiMethod)
	parsedURL, err := url.Parse(strings.TrimSpace(endpoint))
	if err != nil {
		e = err
		return
	}

	requestPath := parsedURL.Path
	if requestPath == "" {
		requestPath = "/"
	}
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	nonce := util.ToolsUtil.RandomString(16)
	payload.Timestamp = timestamp
	payload.ProjectCode = fillDefaultProductCode(firstNonEmpty(payload.ProjectCode, payload.ProductCode))
	payload.Source = firstNonEmpty(strings.TrimSpace(payload.Source), licenseRequestSource)
	payload.Version = firstNonEmpty(strings.TrimSpace(payload.Version), licenseRequestVersion)
	payload.ProductCode = fillDefaultProductCode(firstNonEmpty(payload.ProductCode, payload.ProjectCode))
	payload.Domain = firstNonEmpty(normalizeLicenseDomain(payload.Domain), normalizeLicenseDomain(payload.BindDomain))
	payload.RuntimeDomain = firstNonEmpty(normalizeLicenseDomain(payload.RuntimeDomain), normalizeLicenseDomain(payload.BindDomain))
	signature := ""
	if verifyCfg.ApiSignSecret != "" {
		signature = makeLicenseRequestSignature(activateMethod, requestPath, payload, timestamp, nonce, verifyCfg.ApiSignSecret)
	}

	var bodyReader io.Reader
	if activateMethod == http.MethodGet {
		query := parsedURL.Query()
		query.Set("licenseKey", payload.LicenseKey)
		query.Set("bindDomain", payload.BindDomain)
		query.Set("projectCode", payload.ProjectCode)
		query.Set("productCode", payload.ProductCode)
		query.Set("domain", payload.Domain)
		query.Set("runtimeDomain", payload.RuntimeDomain)
		query.Set("source", payload.Source)
		query.Set("version", payload.Version)
		query.Set("timestamp", payload.Timestamp)
		parsedURL.RawQuery = query.Encode()
	} else {
		payloadBytes, marshalErr := json.Marshal(payload)
		if marshalErr != nil {
			e = marshalErr
			return
		}
		bodyReader = bytes.NewReader(payloadBytes)
	}

	reqObj, err = http.NewRequest(activateMethod, parsedURL.String(), bodyReader)
	if err != nil {
		e = err
		return
	}
	if activateMethod == http.MethodPost {
		reqObj.Header.Set("Content-Type", "application/json")
	}
	if verifyCfg.VerifyApiToken != "" {
		reqObj.Header.Set("Authorization", "Bearer "+strings.TrimSpace(verifyCfg.VerifyApiToken))
	}
	reqObj.Header.Set("x-license-timestamp", timestamp)
	reqObj.Header.Set("x-license-nonce", nonce)
	reqObj.Header.Set("x-license-source", payload.Source)
	reqObj.Header.Set("x-license-version", payload.Version)
	if signature != "" {
		reqObj.Header.Set("x-license-signature", signature)
	}

	requestSnapshot = map[string]interface{}{
		"method":        activateMethod,
		"url":           parsedURL.String(),
		"path":          requestPath,
		"licenseKey":    payload.LicenseKey,
		"bindDomain":    payload.BindDomain,
		"projectCode":   payload.ProjectCode,
		"productCode":   payload.ProductCode,
		"domain":        payload.Domain,
		"runtimeDomain": payload.RuntimeDomain,
		"timestamp":     timestamp,
		"nonce":         nonce,
		"signed":        signature != "",
		"source":        payload.Source,
		"version":       payload.Version,
	}
	return
}

// makeLicenseRequestSignature 函数说明：按文档要求生成 HMAC-SHA256 机器签名头。
func makeLicenseRequestSignature(method string, requestPath string, payload licenseVerifyRemotePayload, timestamp string, nonce string, secret string) string {
	projectCode := fillDefaultProductCode(firstNonEmpty(payload.ProjectCode, payload.ProductCode))
	plainText := strings.Join([]string{
		strings.ToUpper(strings.TrimSpace(method)),
		strings.TrimSpace(requestPath),
		strings.TrimSpace(payload.LicenseKey),
		normalizeLicenseDomain(payload.BindDomain),
		projectCode,
		strings.TrimSpace(timestamp),
		strings.TrimSpace(nonce),
	}, "\n")
	h := hmac.New(sha256.New, []byte(strings.TrimSpace(secret)))
	_, _ = h.Write([]byte(plainText))
	return hex.EncodeToString(h.Sum(nil))
}

// buildVerifyPersistMap 函数说明：将授权校验结果收敛为数据库更新字段。
func buildVerifyPersistMap(currentRow systemLicenseEntity, verifyResult licenseVerifyResult, now int64) map[string]interface{} {
	updateMap := map[string]interface{}{
		"status":              verifyResult.Status,
		"raw_status":          normalizeRuntimeStatus(firstNonEmpty(verifyResult.RawStatus, statusCodeToRawStatus(verifyResult.Status))),
		"edition":             normalizeLicenseEdition(verifyResult.Edition),
		"expire_time":         normalizeLicenseExpireTime(verifyResult.ExpireTime),
		"last_verify_time":    now,
		"last_verify_message": strings.TrimSpace(verifyResult.Message),
		"last_verify_payload": strings.TrimSpace(verifyResult.VerifyPayload),
		"update_time":         now,
		"company_name":        strings.TrimSpace(verifyResult.CompanyName),
		"contact_email":       strings.TrimSpace(verifyResult.ContactEmail),
		"domain_limit":        verifyResult.DomainLimit,
		"domain_whitelist":    marshalDomainWhitelist(verifyResult.DomainWhitelist),
		"signature":           strings.TrimSpace(verifyResult.Signature),
		"sign_version":        strings.TrimSpace(verifyResult.SignVersion),
		"is_signature_valid":  boolToInt(verifyResult.IsSignatureValid),
	}
	if verifyResult.Valid {
		updateMap["activated_time"] = now
	} else {
		updateMap["activated_time"] = int64(0)
	}
	if strings.TrimSpace(verifyResult.CustomerName) != "" {
		updateMap["customer_name"] = strings.TrimSpace(verifyResult.CustomerName)
		currentRow.CustomerName = strings.TrimSpace(verifyResult.CustomerName)
	}
	if strings.TrimSpace(verifyResult.BoundDomain) != "" {
		updateMap["bound_domain"] = normalizeLicenseDomain(verifyResult.BoundDomain)
	}
	if strings.TrimSpace(verifyResult.MachineCode) != "" {
		updateMap["machine_code"] = strings.TrimSpace(verifyResult.MachineCode)
	}
	if strings.TrimSpace(verifyResult.ProductCode) != "" {
		updateMap["product_code"] = fillDefaultProductCode(verifyResult.ProductCode)
	}
	return updateMap
}

// buildPayloadPersistMap 函数说明：将已验证签名授权载荷写入本地授权表。
func buildPayloadPersistMap(currentRow systemLicenseEntity, payloadRow systemLicenseEntity, state licenseRuntimeState, now int64, mode string) map[string]interface{} {
	payloadBody, _ := json.Marshal(map[string]interface{}{
		"mode":           mode,
		"verifiedAt":     now,
		"licensePayload": buildLicensePayloadMap(payloadRow),
		"runtimeState":   buildRuntimeStateMap(state),
	})
	updateMap := map[string]interface{}{
		"license_key":         strings.TrimSpace(payloadRow.LicenseKey),
		"customer_name":       strings.TrimSpace(payloadRow.CustomerName),
		"contact_email":       strings.TrimSpace(payloadRow.ContactEmail),
		"product_code":        fillDefaultProductCode(payloadRow.ProductCode),
		"bound_domain":        firstNonEmpty(normalizeLicenseDomain(payloadRow.BoundDomain), normalizeLicenseDomain(currentRow.BoundDomain)),
		"machine_code":        strings.TrimSpace(payloadRow.MachineCode),
		"edition":             normalizeLicenseEdition(payloadRow.Edition),
		"raw_status":          normalizeRuntimeStatus(firstNonEmpty(strings.TrimSpace(payloadRow.RawStatus), state.Status)),
		"company_name":        strings.TrimSpace(payloadRow.CompanyName),
		"domain_limit":        payloadRow.DomainLimit,
		"domain_whitelist":    marshalDomainWhitelist(registeredDomainsFromRow(payloadRow)),
		"signature":           strings.TrimSpace(payloadRow.Signature),
		"sign_version":        strings.TrimSpace(payloadRow.SignVersion),
		"is_signature_valid":  boolToInt(payloadRow.IsSignatureValid == 1),
		"status":              mapRuntimeStatusToCode(state.Status),
		"expire_time":         normalizeLicenseExpireTime(payloadRow.ExpireTime),
		"activated_time":      int64(0),
		"last_verify_time":    now,
		"last_verify_message": buildRuntimeVerifyMessage(state, false, "已根据签名授权载荷完成本地导入。"),
		"last_verify_payload": string(payloadBody),
		"update_time":         now,
	}
	if state.IsActive {
		updateMap["activated_time"] = now
	}
	return updateMap
}

// buildClientLicenseInfo 函数说明：组装 `/api/uied/license/info` 契约返回结构。
func buildClientLicenseInfo(row systemLicenseEntity, requestHost string, verifyCfg licenseVerifyConfig) map[string]interface{} {
	state := evaluateLicenseRuntime(row, requestHost)
	projectCode := fillDefaultProductCode(row.ProductCode)
	return map[string]interface{}{
		"edition":              state.Edition,
		"status":               state.Status,
		"rawStatus":            firstNonEmpty(state.RawStatus, statusCodeToRawStatus(row.Status)),
		"isActive":             state.IsActive,
		"effectiveEdition":     state.EffectiveEdition,
		"isSignatureValid":     state.IsSignatureValid,
		"signatureRequired":    state.SignatureRequired,
		"licenseKey":           strings.TrimSpace(row.LicenseKey),
		"projectCode":          projectCode,
		"currentProject":       map[string]interface{}{"code": projectCode, "name": getLicenseProjectName(projectCode)},
		"domainLimit":          state.DomainLimit,
		"domainUsedCount":      state.DomainUsedCount,
		"domainRemainingCount": state.DomainRemainingCount,
		"registeredDomains":    state.RegisteredDomains,
		"domainEnforceEnabled": state.DomainEnforceEnabled,
		"isDomainAuthorized":   state.IsDomainAuthorized,
		"domainReason":         state.DomainReason,
		"runtimeDomain":        state.RuntimeDomain,
		"remoteSync": map[string]interface{}{
			"enabled":           strings.TrimSpace(verifyCfg.VerifyApiURL) != "",
			"endpoint":          verifyCfg.VerifyApiURL,
			"method":            verifyCfg.VerifyApiMethod,
			"timeout":           verifyCfg.VerifyApiTimeout,
			"lastVerifyTime":    row.LastVerifyTime,
			"lastVerifyMessage": strings.TrimSpace(row.LastVerifyMessage),
		},
		"licenseRules": map[string]interface{}{
			"signatureRequired":         state.SignatureRequired,
			"domainBindingRequired":     true,
			"backendProtectOnly":        true,
			"allowFrontendWhenInactive": true,
		},
		"customerName":      strings.TrimSpace(row.CustomerName),
		"companyName":       strings.TrimSpace(row.CompanyName),
		"contactEmail":      strings.TrimSpace(row.ContactEmail),
		"expiresAt":         normalizeLicenseExpireTime(row.ExpireTime),
		"lastVerifyTime":    row.LastVerifyTime,
		"lastVerifyMessage": strings.TrimSpace(row.LastVerifyMessage),
		"now":               time.Now().Unix(),
	}
}

// buildPayloadVerifyResponse 函数说明：输出外部签名授权载荷的预检结果。
func buildPayloadVerifyResponse(row systemLicenseEntity, state licenseRuntimeState) map[string]interface{} {
	return map[string]interface{}{
		"edition":              state.Edition,
		"status":               state.Status,
		"rawStatus":            state.RawStatus,
		"isActive":             state.IsActive,
		"isExpired":            state.IsExpired,
		"isSignatureValid":     state.IsSignatureValid,
		"signatureRequired":    state.SignatureRequired,
		"effectiveEdition":     state.EffectiveEdition,
		"licenseKey":           strings.TrimSpace(row.LicenseKey),
		"projectCode":          fillDefaultProductCode(row.ProductCode),
		"domainLimit":          state.DomainLimit,
		"domainUsedCount":      state.DomainUsedCount,
		"domainRemainingCount": state.DomainRemainingCount,
		"registeredDomains":    state.RegisteredDomains,
		"domainEnforceEnabled": state.DomainEnforceEnabled,
		"isDomainAuthorized":   state.IsDomainAuthorized,
		"domainReason":         state.DomainReason,
		"runtimeDomain":        state.RuntimeDomain,
		"now":                  time.Now().Unix(),
	}
}

// evaluateLicenseRuntime 函数说明：基于本地授权记录评估当前运行域名下的有效授权状态。
func evaluateLicenseRuntime(row systemLicenseEntity, requestHost string) licenseRuntimeState {
	state := licenseRuntimeState{
		Edition:              normalizeLicenseEdition(row.Edition),
		EffectiveEdition:     "free",
		RawStatus:            normalizeRuntimeStatus(firstNonEmpty(strings.TrimSpace(row.RawStatus), statusCodeToRawStatus(row.Status))),
		IsSignatureValid:     row.IsSignatureValid == 1,
		RuntimeDomain:        normalizeLicenseDomain(requestHost),
		RegisteredDomains:    registeredDomainsFromRow(row),
		DomainLimit:          normalizeDomainLimit(row.DomainLimit),
		DomainEnforceEnabled: true,
	}
	state.SignatureRequired = isPaidLicenseEdition(state.Edition)
	state.DomainUsedCount = len(state.RegisteredDomains)
	if state.DomainLimit > 0 {
		state.DomainRemainingCount = state.DomainLimit - state.DomainUsedCount
		if state.DomainRemainingCount < 0 {
			state.DomainRemainingCount = 0
		}
	}
	state.IsDomainAuthorized, state.DomainReason = evaluateLicenseDomain(state.RegisteredDomains, normalizeLicenseDomain(row.BoundDomain), state.RuntimeDomain)

	if row.ExpireTime > 0 && row.ExpireTime <= time.Now().Unix() {
		state.IsExpired = true
		state.Status = "expired"
		state.Reason = "授权已过期，请联系 fsuied.com 续期授权。"
		return state
	}
	if row.Status == licenseStatusBlocked || state.RawStatus == "blocked" || state.RawStatus == "disabled" || state.RawStatus == "frozen" {
		state.Status = "blocked"
		state.Reason = "授权已冻结，请联系 fsuied.com 处理授权状态。"
		return state
	}
	if state.SignatureRequired && (!state.IsSignatureValid || strings.TrimSpace(row.Signature) == "") {
		state.Status = "invalid_signature"
		state.Reason = "授权签名无效，请重新执行授权校验或联系 fsuied.com 处理。"
		return state
	}
	if row.Status != licenseStatusActive {
		state.Status = normalizeInactiveRuntimeStatus(state.RawStatus)
		state.Reason = buildInactiveReason(state.Status)
		return state
	}
	if state.DomainLimit > 0 && state.DomainUsedCount > state.DomainLimit {
		state.Status = "domain_limit_exceeded"
		state.Reason = "授权域名额度已满，请联系 fsuied.com 调整授权。"
		return state
	}
	if !state.IsDomainAuthorized {
		state.Status = "domain_unauthorized"
		state.Reason = buildDomainRuntimeReason(state.DomainReason)
		return state
	}
	state.Status = "active"
	state.IsActive = true
	state.EffectiveEdition = state.Edition
	if state.EffectiveEdition == "" {
		state.EffectiveEdition = "pro"
	}
	return state
}

// buildLicenseRowFromPayloadReq 函数说明：将签名授权载荷请求转换为本地授权实体骨架。
func buildLicenseRowFromPayloadReq(payload req.CommonUiedLicensePayloadReq) systemLicenseEntity {
	row := systemLicenseEntity{
		LicenseKey:       strings.TrimSpace(payload.LicenseKey),
		CustomerName:     strings.TrimSpace(payload.CustomerName),
		ContactEmail:     strings.TrimSpace(payload.ContactEmail),
		ProductCode:      fillDefaultProductCode(strings.TrimSpace(payload.ProjectCode)),
		Edition:          normalizeLicenseEdition(payload.Edition),
		RawStatus:        normalizeRuntimeStatus(payload.Status),
		CompanyName:      strings.TrimSpace(payload.CompanyName),
		DomainLimit:      normalizeDomainLimit(payload.DomainLimit),
		DomainWhitelist:  marshalDomainWhitelist(payload.DomainWhitelist),
		Signature:        strings.TrimSpace(payload.Signature),
		SignVersion:      strings.TrimSpace(payload.SignVersion),
		IsSignatureValid: uint8(boolToInt(payload.IsSignatureValid != nil && *payload.IsSignatureValid)),
		Status:           normalizePayloadStatusCode(payload.Status),
		ExpireTime:       normalizeLicenseExpireTime(payload.ExpiresAt),
	}
	domains := normalizeDomainWhitelist(payload.DomainWhitelist, "")
	if len(domains) > 0 {
		row.BoundDomain = domains[0]
	}
	return row
}

// buildLicenseRowFromRemotePayload 函数说明：将授权中心返回的签名载荷映射成本地授权实体骨架。
func buildLicenseRowFromRemotePayload(payload fsuiedLicensePayload, bindDomain string) systemLicenseEntity {
	domains := normalizeDomainWhitelist(payload.DomainWhitelist, bindDomain)
	row := systemLicenseEntity{
		LicenseKey:       strings.TrimSpace(payload.LicenseKey),
		CustomerName:     strings.TrimSpace(payload.CustomerName),
		ContactEmail:     strings.TrimSpace(payload.ContactEmail),
		ProductCode:      fillDefaultProductCode(strings.TrimSpace(payload.ProjectCode)),
		Edition:          normalizeLicenseEdition(payload.Edition),
		RawStatus:        normalizeRuntimeStatus(payload.Status),
		CompanyName:      strings.TrimSpace(payload.CompanyName),
		DomainLimit:      normalizeDomainLimit(payload.DomainLimit),
		DomainWhitelist:  marshalDomainWhitelist(domains),
		Signature:        strings.TrimSpace(payload.Signature),
		SignVersion:      strings.TrimSpace(payload.SignVersion),
		IsSignatureValid: uint8(boolToInt(payload.IsSignatureValid)),
		Status:           normalizePayloadStatusCode(payload.Status),
		ExpireTime:       normalizeLicenseExpireTime(payload.ExpiresAt),
		BoundDomain:      firstNonEmpty(normalizeLicenseDomain(bindDomain), firstDomain(domains)),
	}
	return row
}

// buildStoredVerifyPayload 函数说明：持久化最近一次远程校验请求与响应原始载荷，便于售后排查。
func buildStoredVerifyPayload(mode string, requestSnapshot map[string]interface{}, remoteResp licenseVerifyRemoteResponse, payload fsuiedLicensePayload, state licenseRuntimeState, remoteMessage string) string {
	persistBody, _ := json.Marshal(map[string]interface{}{
		"mode":           mode,
		"verifiedAt":     time.Now().Unix(),
		"request":        requestSnapshot,
		"responseCode":   remoteResp.Code,
		"responseMsg":    firstNonEmpty(strings.TrimSpace(remoteResp.Message), strings.TrimSpace(remoteResp.Msg), extractRemoteDataMessage(remoteResp.Data), remoteMessage),
		"responseData":   parseRemoteDataForStore(remoteResp.Data),
		"licensePayload": payload,
		"runtimeState":   buildRuntimeStateMap(state),
	})
	return string(persistBody)
}

// extractRemoteLicensePayload 函数说明：兼容 data.licensePayload、data 直接对象或“核心字段对象”三种回包形态。
func extractRemoteLicensePayload(raw json.RawMessage, fallbackPayload licenseVerifyRemotePayload) (payload fsuiedLicensePayload, e error) {
	trimmed := bytes.TrimSpace(raw)
	if len(trimmed) == 0 || bytes.Equal(trimmed, []byte("null")) {
		return payload, &licenseRemoteError{Code: 41000, Message: "授权中心未返回签名授权载荷"}
	}

	var wrapper struct {
		LicensePayload fsuiedLicensePayload `json:"licensePayload"`
	}
	if err := json.Unmarshal(trimmed, &wrapper); err == nil {
		if strings.TrimSpace(wrapper.LicensePayload.LicenseKey) != "" || strings.TrimSpace(wrapper.LicensePayload.Signature) != "" {
			return wrapper.LicensePayload, nil
		}
	}

	if err := json.Unmarshal(trimmed, &payload); err == nil {
		if strings.TrimSpace(payload.LicenseKey) != "" || strings.TrimSpace(payload.Signature) != "" {
			return payload, nil
		}
	}

	var object map[string]interface{}
	if err := json.Unmarshal(trimmed, &object); err == nil {
		parseMapString := func(key string) string {
			value, ok := object[key]
			if !ok || value == nil {
				return ""
			}
			text := strings.TrimSpace(fmt.Sprintf("%v", value))
			if strings.EqualFold(text, "<nil>") {
				return ""
			}
			return text
		}
		payload = fsuiedLicensePayload{
			Edition:          parseMapString("edition"),
			Status:           parseMapString("status"),
			LicenseKey:       firstNonEmpty(parseMapString("licenseKey"), strings.TrimSpace(fallbackPayload.LicenseKey)),
			ProjectCode:      firstNonEmpty(parseMapString("projectCode"), parseMapString("productCode"), fillDefaultProductCode(firstNonEmpty(fallbackPayload.ProjectCode, fallbackPayload.ProductCode))),
			CustomerName:     parseMapString("customerName"),
			CompanyName:      parseMapString("companyName"),
			ContactEmail:     parseMapString("contactEmail"),
			DomainLimit:      int(parseIntValue(object["domainLimit"])),
			ExpiresAt:        parseIntValue(firstNonEmpty(parseMapString("expiresAt"), parseMapString("expireTime"))),
			SignVersion:      parseMapString("signVersion"),
			Signature:        parseMapString("signature"),
			IsSignatureValid: parseBoolValue(object["isSignatureValid"]),
		}
		if payload.Status == "" {
			if parseBoolValue(object["valid"]) {
				payload.Status = "active"
			} else {
				payload.Status = "inactive"
			}
		}
		boundDomain := firstNonEmpty(
			parseMapString("boundDomain"),
			parseMapString("domain"),
			strings.TrimSpace(fallbackPayload.BindDomain),
			strings.TrimSpace(fallbackPayload.Domain),
		)
		payload.DomainWhitelist = normalizeDomainWhitelist(payload.DomainWhitelist, boundDomain)
		if strings.TrimSpace(payload.LicenseKey) != "" || strings.TrimSpace(payload.Status) != "" || payload.ExpiresAt > 0 {
			return payload, nil
		}
	}

	if message := extractRemoteDataMessage(trimmed); message != "" {
		return payload, &licenseRemoteError{Code: 41000, Message: message}
	}
	return payload, &licenseRemoteError{Code: 41000, Message: "授权中心未返回可识别的签名授权载荷"}
}

// extractRemoteDataMessage 函数说明：从授权中心 data 字段中抽取可读错误文案，兼容字符串或对象错误。
func extractRemoteDataMessage(raw json.RawMessage) string {
	trimmed := bytes.TrimSpace(raw)
	if len(trimmed) == 0 || bytes.Equal(trimmed, []byte("null")) {
		return ""
	}

	var text string
	if err := json.Unmarshal(trimmed, &text); err == nil {
		return strings.TrimSpace(text)
	}

	var object map[string]interface{}
	if err := json.Unmarshal(trimmed, &object); err != nil {
		return ""
	}
	for _, key := range []string{"message", "msg", "error", "reason"} {
		if value, ok := object[key].(string); ok && strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

// parseRemoteDataForStore 函数说明：将授权中心 data 字段转换为便于持久化回看的结构，避免直接丢失原始错误信息。
func parseRemoteDataForStore(raw json.RawMessage) interface{} {
	trimmed := bytes.TrimSpace(raw)
	if len(trimmed) == 0 || bytes.Equal(trimmed, []byte("null")) {
		return map[string]interface{}{}
	}
	var object interface{}
	if err := json.Unmarshal(trimmed, &object); err != nil {
		return string(trimmed)
	}
	return object
}

// buildRuntimeStateMap 函数说明：将运行态结构转换为可持久化的调试载荷。
func buildRuntimeStateMap(state licenseRuntimeState) map[string]interface{} {
	return map[string]interface{}{
		"edition":              state.Edition,
		"effectiveEdition":     state.EffectiveEdition,
		"status":               state.Status,
		"rawStatus":            state.RawStatus,
		"isActive":             state.IsActive,
		"isExpired":            state.IsExpired,
		"signatureRequired":    state.SignatureRequired,
		"isSignatureValid":     state.IsSignatureValid,
		"domainLimit":          state.DomainLimit,
		"domainUsedCount":      state.DomainUsedCount,
		"domainRemainingCount": state.DomainRemainingCount,
		"registeredDomains":    state.RegisteredDomains,
		"domainEnforceEnabled": state.DomainEnforceEnabled,
		"isDomainAuthorized":   state.IsDomainAuthorized,
		"domainReason":         state.DomainReason,
		"runtimeDomain":        state.RuntimeDomain,
		"reason":               state.Reason,
	}
}

// buildLicensePayloadMap 函数说明：输出统一的签名授权载荷结构，供本地导入记录回显。
func buildLicensePayloadMap(row systemLicenseEntity) map[string]interface{} {
	return map[string]interface{}{
		"edition":          normalizeLicenseEdition(row.Edition),
		"status":           normalizeRuntimeStatus(row.RawStatus),
		"licenseKey":       strings.TrimSpace(row.LicenseKey),
		"projectCode":      fillDefaultProductCode(row.ProductCode),
		"customerName":     strings.TrimSpace(row.CustomerName),
		"companyName":      strings.TrimSpace(row.CompanyName),
		"contactEmail":     strings.TrimSpace(row.ContactEmail),
		"domainLimit":      normalizeDomainLimit(row.DomainLimit),
		"domainWhitelist":  registeredDomainsFromRow(row),
		"expiresAt":        normalizeLicenseExpireTime(row.ExpireTime),
		"signVersion":      strings.TrimSpace(row.SignVersion),
		"signature":        strings.TrimSpace(row.Signature),
		"isSignatureValid": row.IsSignatureValid == 1,
	}
}

// normalizeRemoteLicensePayload 函数说明：修正授权中心返回字段中的默认值与域名名单。
func normalizeRemoteLicensePayload(payload fsuiedLicensePayload, requestPayload licenseVerifyRemotePayload) fsuiedLicensePayload {
	payload.Edition = normalizeLicenseEdition(payload.Edition)
	payload.Status = normalizeRuntimeStatus(payload.Status)
	payload.LicenseKey = firstNonEmpty(strings.TrimSpace(payload.LicenseKey), strings.TrimSpace(requestPayload.LicenseKey))
	payload.ProjectCode = fillDefaultProductCode(firstNonEmpty(strings.TrimSpace(payload.ProjectCode), requestPayload.ProjectCode, requestPayload.ProductCode))
	payload.DomainWhitelist = normalizeDomainWhitelist(payload.DomainWhitelist, firstNonEmpty(requestPayload.BindDomain, requestPayload.Domain, requestPayload.RuntimeDomain))
	payload.DomainLimit = normalizeDomainLimit(payload.DomainLimit)
	payload.SignVersion = strings.TrimSpace(payload.SignVersion)
	payload.Signature = strings.TrimSpace(payload.Signature)
	return payload
}

// normalizeActivateDomain 函数说明：兼容 bindDomain/runtimeDomain/domain 三种参数来源，统一为绑定域名。
func normalizeActivateDomain(activateReq req.CommonUiedLicenseActivateReq, requestHost string) string {
	return firstNonEmpty(
		normalizeLicenseDomain(activateReq.BindDomain),
		normalizeLicenseDomain(activateReq.RuntimeDomain),
		normalizeLicenseDomain(activateReq.Domain),
		normalizeLicenseDomain(requestHost),
	)
}

// normalizeLicenseDomain 函数说明：统一规整域名输入，兼容带协议、端口或路径的填法。
func normalizeLicenseDomain(raw string) string {
	trimmed := strings.TrimSpace(strings.ToLower(raw))
	if trimmed == "" {
		return ""
	}

	candidate := trimmed
	if !strings.Contains(candidate, "://") {
		candidate = "https://" + candidate
	}
	parsed, err := url.Parse(candidate)
	if err == nil && parsed.Hostname() != "" {
		return strings.Trim(parsed.Hostname(), ".")
	}

	plain := strings.Trim(strings.Split(trimmed, "/")[0], ".")
	if atIndex := strings.LastIndex(plain, "@"); atIndex >= 0 && atIndex < len(plain)-1 {
		plain = plain[atIndex+1:]
	}
	if colonIndex := strings.LastIndex(plain, ":"); colonIndex > 0 {
		portText := plain[colonIndex+1:]
		if isAllDigits(portText) {
			plain = plain[:colonIndex]
		}
	}
	return strings.Trim(plain, ".")
}

// evaluateLicenseDomain 函数说明：判断当前运行域名是否命中授权域名白名单。
func evaluateLicenseDomain(registeredDomains []string, fallbackDomain string, runtimeDomain string) (matched bool, reason string) {
	runtimeDomain = normalizeLicenseDomain(runtimeDomain)
	if runtimeDomain == "" {
		return false, "runtime_domain_missing"
	}
	domains := normalizeDomainWhitelist(registeredDomains, fallbackDomain)
	if len(domains) == 0 {
		return false, "missing_bound_domain"
	}
	for _, item := range domains {
		if isLicenseDomainMatched(item, runtimeDomain) {
			return true, "matched"
		}
	}
	return false, "domain_mismatch"
}

// isLicenseDomainMatched 函数说明：校验当前请求域名是否命中授权绑定域名，支持子域名继承。
func isLicenseDomainMatched(boundDomain string, requestHost string) bool {
	normalizedBoundDomain := normalizeLicenseDomain(boundDomain)
	normalizedRequestHost := normalizeLicenseDomain(requestHost)
	if normalizedBoundDomain == "" || normalizedRequestHost == "" {
		return false
	}
	if strings.HasPrefix(normalizedBoundDomain, "*.") {
		suffix := strings.TrimPrefix(normalizedBoundDomain, "*.")
		return normalizedRequestHost == suffix || strings.HasSuffix(normalizedRequestHost, "."+suffix)
	}
	return normalizedRequestHost == normalizedBoundDomain || strings.HasSuffix(normalizedRequestHost, "."+normalizedBoundDomain)
}

// registeredDomainsFromRow 函数说明：从授权记录中解析域名白名单，并补齐主绑定域名。
func registeredDomainsFromRow(row systemLicenseEntity) []string {
	return normalizeDomainWhitelist(parseDomainWhitelist(row.DomainWhitelist), row.BoundDomain)
}

// parseDomainWhitelist 函数说明：兼容 JSON 字符串或逗号串两种域名白名单存储格式。
func parseDomainWhitelist(raw string) []string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return []string{}
	}
	var values []string
	if strings.HasPrefix(trimmed, "[") {
		if err := json.Unmarshal([]byte(trimmed), &values); err == nil {
			return values
		}
	}
	segments := strings.Split(trimmed, ",")
	values = make([]string, 0, len(segments))
	for _, segment := range segments {
		segment = strings.TrimSpace(segment)
		if segment != "" {
			values = append(values, segment)
		}
	}
	return values
}

// normalizeDomainWhitelist 函数说明：统一域名白名单，去重并附带主绑定域名兜底。
func normalizeDomainWhitelist(domains []string, fallbackDomain string) []string {
	result := make([]string, 0, len(domains)+1)
	seen := map[string]struct{}{}
	appendDomain := func(domain string) {
		normalized := normalizeLicenseDomain(domain)
		if normalized == "" {
			return
		}
		if _, ok := seen[normalized]; ok {
			return
		}
		seen[normalized] = struct{}{}
		result = append(result, normalized)
	}
	for _, item := range domains {
		appendDomain(item)
	}
	appendDomain(fallbackDomain)
	sort.Strings(result)
	return result
}

// marshalDomainWhitelist 函数说明：将域名白名单序列化为 JSON 字符串保存到数据库。
func marshalDomainWhitelist(domains []string) string {
	normalized := normalizeDomainWhitelist(domains, "")
	payload, err := json.Marshal(normalized)
	if err != nil {
		return "[]"
	}
	return string(payload)
}

// normalizeDomainLimit 函数说明：规整域名上限，避免写入负值。
func normalizeDomainLimit(domainLimit int) int {
	if domainLimit < 0 {
		return 0
	}
	return domainLimit
}

// normalizeLicenseExpireTime 函数说明：规整授权过期时间，避免写入负值。
func normalizeLicenseExpireTime(expireTime int64) int64 {
	if expireTime < 0 {
		return 0
	}
	return expireTime
}

// normalizeLicenseEdition 函数说明：统一授权版本字面量，未识别版本降级为 free。
func normalizeLicenseEdition(edition string) string {
	switch strings.ToLower(strings.TrimSpace(edition)) {
	case "enterprise":
		return "enterprise"
	case "pro":
		return "pro"
	default:
		return "free"
	}
}

// isPaidLicenseEdition 函数说明：判断当前授权版本是否属于需要签名保护的付费版。
func isPaidLicenseEdition(edition string) bool {
	normalized := normalizeLicenseEdition(edition)
	return normalized == "pro" || normalized == "enterprise"
}

// normalizeRuntimeStatus 函数说明：统一远程/本地状态文本格式，避免大小写和空值干扰。
func normalizeRuntimeStatus(rawStatus string) string {
	normalized := strings.TrimSpace(strings.ToLower(rawStatus))
	if normalized == "" {
		return "inactive"
	}
	return normalized
}

// normalizeInactiveRuntimeStatus 函数说明：将非激活态收敛为可读的运行时状态。
func normalizeInactiveRuntimeStatus(rawStatus string) string {
	switch normalizeRuntimeStatus(rawStatus) {
	case "expired":
		return "expired"
	case "blocked", "disabled", "frozen":
		return "blocked"
	case "domain_limit_exceeded":
		return "domain_limit_exceeded"
	case "invalid_signature":
		return "invalid_signature"
	default:
		return "inactive"
	}
}

// normalizePayloadStatusCode 函数说明：将签名授权载荷状态映射为本地状态码。
func normalizePayloadStatusCode(rawStatus string) uint8 {
	switch normalizeRuntimeStatus(rawStatus) {
	case "active":
		return licenseStatusActive
	case "expired":
		return licenseStatusExpired
	case "blocked", "disabled", "frozen":
		return licenseStatusBlocked
	default:
		return licenseStatusInactive
	}
}

// mapRuntimeStatusToCode 函数说明：将运行态状态映射为本地状态码。
func mapRuntimeStatusToCode(status string) uint8 {
	switch normalizeRuntimeStatus(status) {
	case "active":
		return licenseStatusActive
	case "expired":
		return licenseStatusExpired
	case "blocked":
		return licenseStatusBlocked
	default:
		return licenseStatusInactive
	}
}

// statusCodeToRawStatus 函数说明：将本地状态码转换为文本状态，兼容缺失 raw_status 的旧数据。
func statusCodeToRawStatus(status uint8) string {
	switch status {
	case licenseStatusActive:
		return "active"
	case licenseStatusExpired:
		return "expired"
	case licenseStatusBlocked:
		return "blocked"
	default:
		return "inactive"
	}
}

// buildInactiveReason 函数说明：根据非激活态输出统一错误说明。
func buildInactiveReason(status string) string {
	switch normalizeRuntimeStatus(status) {
	case "expired":
		return "授权已过期，请联系 fsuied.com 续期授权。"
	case "blocked":
		return "授权已冻结，请联系 fsuied.com 处理授权状态。"
	case "domain_limit_exceeded":
		return "授权域名额度已满，请联系 fsuied.com 调整授权。"
	case "invalid_signature":
		return "授权签名无效，请重新执行授权校验或联系 fsuied.com 处理。"
	default:
		return "授权未激活，请先完成授权校验。"
	}
}

// buildDomainRuntimeReason 函数说明：根据域名校验结果生成后台/客户端统一提示。
func buildDomainRuntimeReason(domainReason string) string {
	switch strings.TrimSpace(domainReason) {
	case "missing_bound_domain":
		return "授权域名未配置，请先录入绑定域名并重新校验。"
	case "domain_mismatch":
		return "授权域名不匹配，请确认当前域名已加入授权白名单。"
	default:
		return "当前运行域名未被授权。"
	}
}

// buildRuntimeVerifyMessage 函数说明：根据运行态与远程说明生成最近校验结果文案。
func buildRuntimeVerifyMessage(state licenseRuntimeState, remoteSuccess bool, fallbackMessage string) string {
	if remoteSuccess && state.IsActive {
		return firstNonEmpty(strings.TrimSpace(fallbackMessage), "授权中心校验通过，当前域名已生效。")
	}
	if strings.TrimSpace(state.Reason) != "" {
		return state.Reason
	}
	return firstNonEmpty(strings.TrimSpace(fallbackMessage), "授权校验未通过。")
}

// getLicenseStatusText 函数说明：将授权状态码转换为后台可读文案。
func getLicenseStatusText(status uint8, expireTime int64) string {
	switch status {
	case licenseStatusActive:
		if expireTime > 0 && expireTime <= time.Now().Unix() {
			return "已过期"
		}
		return "已授权"
	case licenseStatusExpired:
		return "已过期"
	case licenseStatusBlocked:
		return "已冻结"
	default:
		return "未激活"
	}
}

// fillDefaultProductCode 函数说明：为产品编码提供默认值，避免空编码导致远程激活失败。
func fillDefaultProductCode(productCode string) string {
	trimmed := strings.TrimSpace(productCode)
	if trimmed == "" {
		return licenseDefaultProductCode
	}
	return trimmed
}

// getLicenseProjectName 函数说明：为客户端信息接口提供可读项目名称。
func getLicenseProjectName(projectCode string) string {
	switch fillDefaultProductCode(projectCode) {
	case "uiedtool-commercial":
		return "UIED-Tools 商业版"
	case "uied-tools":
		return "UIED-Tools 商业版"
	default:
		return strings.ToUpper(fillDefaultProductCode(projectCode))
	}
}

// normalizeVerifyMethod 函数说明：规整授权中心调用方法，仅允许 GET / POST。
func normalizeVerifyMethod(method string) string {
	normalized := strings.ToUpper(strings.TrimSpace(method))
	if normalized != http.MethodPost {
		return http.MethodGet
	}
	return http.MethodPost
}

// normalizeVerifyTimeout 函数说明：规整授权中心调用超时时间，避免配置异常导致卡死。
func normalizeVerifyTimeout(timeout int64) int {
	if timeout < 1000 {
		return 10000
	}
	if timeout > 60000 {
		return 60000
	}
	return int(timeout)
}

// formatUnixText 函数说明：将秒级时间戳转为可读时间文本。
func formatUnixText(unixTime int64) string {
	if unixTime <= 0 {
		return "-"
	}
	return time.Unix(unixTime, 0).Format("2006-01-02 15:04:05")
}

// maskSecretValue 函数说明：对密钥类字段进行脱敏，避免后台直接泄露敏感信息。
func maskSecretValue(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	runes := []rune(trimmed)
	if len(runes) <= 6 {
		return "***"
	}
	return string(runes[:3]) + strings.Repeat("*", len(runes)-6) + string(runes[len(runes)-3:])
}

// boolToInt 函数说明：统一将布尔值映射为数据库/前端使用的 0/1 数值。
func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

// parseBoolValue 函数说明：兼容多种类型输入并解析为布尔值。
func parseBoolValue(raw interface{}) bool {
	switch typed := raw.(type) {
	case bool:
		return typed
	case float64:
		return typed == 1
	case int:
		return typed == 1
	case int32:
		return typed == 1
	case int64:
		return typed == 1
	case string:
		text := strings.TrimSpace(strings.ToLower(typed))
		return text == "1" || text == "true" || text == "yes" || text == "ok"
	default:
		return false
	}
}

// parseIntValue 函数说明：兼容字符串/数字输入并解析为 int64。
func parseIntValue(raw interface{}) int64 {
	switch typed := raw.(type) {
	case float64:
		return int64(typed)
	case int:
		return int64(typed)
	case int32:
		return int64(typed)
	case int64:
		return typed
	case string:
		text := strings.TrimSpace(typed)
		if text == "" {
			return 0
		}
		value, err := strconv.ParseInt(text, 10, 64)
		if err != nil {
			return 0
		}
		return value
	default:
		return 0
	}
}

// firstNonEmpty 函数说明：从多个候选值中取第一个非空字符串。
func firstNonEmpty(values ...string) string {
	for _, item := range values {
		trimmed := strings.TrimSpace(item)
		if trimmed != "" {
			return trimmed
		}
	}
	return ""
}

// firstDomain 函数说明：从域名列表中取第一个非空域名。
func firstDomain(domains []string) string {
	for _, item := range domains {
		normalized := normalizeLicenseDomain(item)
		if normalized != "" {
			return normalized
		}
	}
	return ""
}

// isAllDigits 函数说明：判断端口文本是否全部由数字组成。
func isAllDigits(text string) bool {
	if text == "" {
		return false
	}
	for _, item := range text {
		if item < '0' || item > '9' {
			return false
		}
	}
	return true
}
