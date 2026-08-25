package channel

import (
	"net/url"
	"strconv"
	"strings"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	"likeadmin/config"
	"likeadmin/core/response"
	"likeadmin/util"
)

type IChannelService interface {
	H5Detail() (res map[string]interface{}, e error)
	H5Save(saveReq req.ChannelH5SaveReq) (e error)
	MpDetail() (res map[string]interface{}, e error)
	MpSave(saveReq req.ChannelMpSaveReq) (e error)
	WxDetail() (res map[string]interface{}, e error)
	WxSave(saveReq req.ChannelWxSaveReq) (e error)
	OaDetail() (res map[string]interface{}, e error)
	OaSave(saveReq req.ChannelOaSaveReq) (e error)
}

// NewChannelService 函数说明：初始化渠道配置服务
func NewChannelService(db *gorm.DB) IChannelService {
	return &channelService{db: db}
}

// channelService 函数说明：渠道配置服务实现
type channelService struct {
	db *gorm.DB
}

// parseConfigInt 函数说明：将配置字符串安全转换为整型，不可解析时使用默认值
func parseConfigInt(raw string, fallback int) int {
	v, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil {
		return fallback
	}
	return v
}

// resolvePublicDomain 函数说明：解析服务公网地址，生成渠道配置的域名兜底值
func resolvePublicDomain() (scheme string, host string) {
	scheme = "http"
	host = "127.0.0.1"
	raw := strings.TrimSpace(config.Config.PublicUrl)
	if raw == "" {
		return
	}
	parsed, err := url.Parse(raw)
	if err != nil || strings.TrimSpace(parsed.Host) == "" {
		return
	}
	if strings.TrimSpace(parsed.Scheme) != "" {
		scheme = strings.TrimSpace(parsed.Scheme)
	}
	host = strings.TrimSpace(parsed.Host)
	return
}

// buildDomainDefaults 函数说明：统一计算渠道页展示用的域名默认配置
func buildDomainDefaults() map[string]string {
	scheme, host := resolvePublicDomain()
	socketScheme := "ws"
	if scheme == "https" {
		socketScheme = "wss"
	}
	baseURL := scheme + "://" + host
	return map[string]string{
		"businessDomain":     host,
		"requestDomain":      baseURL,
		"socketDomain":       socketScheme + "://" + host,
		"uploadFileDomain":   baseURL,
		"downloadFileDomain": baseURL,
		"tcpDomain":          host,
		"udpDomain":          host,
		"jsDomain":           host,
		"webDomain":          host,
	}
}

// saveBatch 函数说明：批量保存渠道配置键值，保障同一页面一次提交完整落库
func (srv channelService) saveBatch(configType string, values map[string]string) (e error) {
	for name, value := range values {
		err := util.ConfigUtil.Set(srv.db, configType, name, value)
		if e = response.CheckErr(err, "saveBatch Set err"); e != nil {
			return
		}
	}
	return
}

// H5Detail 函数说明：读取 H5 渠道配置详情
func (srv channelService) H5Detail() (res map[string]interface{}, e error) {
	data, err := util.ConfigUtil.Get(srv.db, "h5_channel")
	if e = response.CheckErr(err, "H5Detail Get err"); e != nil {
		return
	}
	urlValue := strings.TrimSpace(data["url"])
	return map[string]interface{}{
		"status":     parseConfigInt(data["status"], 1),
		"close":      parseConfigInt(data["close"], 0),
		"url":        urlValue,
		"accessLink": urlValue,
	}, nil
}

// H5Save 函数说明：保存 H5 渠道配置
func (srv channelService) H5Save(saveReq req.ChannelH5SaveReq) (e error) {
	return srv.saveBatch("h5_channel", map[string]string{
		"status": strconv.Itoa(int(saveReq.Status)),
		"close":  strconv.Itoa(int(saveReq.Close)),
		"url":    strings.TrimSpace(saveReq.Url),
	})
}

// MpDetail 函数说明：读取微信小程序渠道配置详情
func (srv channelService) MpDetail() (res map[string]interface{}, e error) {
	data, err := util.ConfigUtil.Get(srv.db, "mp_channel")
	if e = response.CheckErr(err, "MpDetail Get err"); e != nil {
		return
	}
	domains := buildDomainDefaults()
	return map[string]interface{}{
		"name":               strings.TrimSpace(data["name"]),
		"primaryId":          strings.TrimSpace(data["primaryId"]),
		"qrCode":             util.UrlUtil.ToAbsoluteUrl(data["qrCode"]),
		"appId":              strings.TrimSpace(data["appId"]),
		"appSecret":          strings.TrimSpace(data["appSecret"]),
		"businessDomain":     domains["businessDomain"],
		"requestDomain":      domains["requestDomain"],
		"socketDomain":       domains["socketDomain"],
		"uploadFileDomain":   domains["uploadFileDomain"],
		"downloadFileDomain": domains["downloadFileDomain"],
		"tcpDomain":          domains["tcpDomain"],
		"udpDomain":          domains["udpDomain"],
	}, nil
}

// MpSave 函数说明：保存微信小程序渠道配置
func (srv channelService) MpSave(saveReq req.ChannelMpSaveReq) (e error) {
	return srv.saveBatch("mp_channel", map[string]string{
		"name":      strings.TrimSpace(saveReq.Name),
		"primaryId": strings.TrimSpace(saveReq.PrimaryId),
		"qrCode":    util.UrlUtil.ToRelativeUrl(strings.TrimSpace(saveReq.QrCode)),
		"appId":     strings.TrimSpace(saveReq.AppId),
		"appSecret": strings.TrimSpace(saveReq.AppSecret),
	})
}

// WxDetail 函数说明：读取微信开放平台配置详情
func (srv channelService) WxDetail() (res map[string]interface{}, e error) {
	data, err := util.ConfigUtil.Get(srv.db, "wx_channel")
	if e = response.CheckErr(err, "WxDetail Get err"); e != nil {
		return
	}
	return map[string]interface{}{
		"appId":     strings.TrimSpace(data["appId"]),
		"appSecret": strings.TrimSpace(data["appSecret"]),
	}, nil
}

// WxSave 函数说明：保存微信开放平台配置
func (srv channelService) WxSave(saveReq req.ChannelWxSaveReq) (e error) {
	return srv.saveBatch("wx_channel", map[string]string{
		"appId":     strings.TrimSpace(saveReq.AppId),
		"appSecret": strings.TrimSpace(saveReq.AppSecret),
	})
}

// OaDetail 函数说明：读取微信公众号配置详情
func (srv channelService) OaDetail() (res map[string]interface{}, e error) {
	data, err := util.ConfigUtil.Get(srv.db, "oa_channel")
	if e = response.CheckErr(err, "OaDetail Get err"); e != nil {
		return
	}
	domains := buildDomainDefaults()
	serverURL := strings.TrimSpace(data["url"])
	if serverURL == "" {
		serverURL = domains["requestDomain"] + "/api/channel/oa/callback"
	}
	token := strings.TrimSpace(data["token"])
	if token == "" {
		token = "likeshop"
	}
	return map[string]interface{}{
		"name":           strings.TrimSpace(data["name"]),
		"primaryId":      strings.TrimSpace(data["primaryId"]),
		"qrCode":         util.UrlUtil.ToAbsoluteUrl(data["qrCode"]),
		"appId":          strings.TrimSpace(data["appId"]),
		"appSecret":      strings.TrimSpace(data["appSecret"]),
		"url":            serverURL,
		"token":          token,
		"encodingAesKey": strings.TrimSpace(data["encodingAesKey"]),
		"encryptionType": parseConfigInt(data["encryptionType"], 1),
		"businessDomain": domains["businessDomain"],
		"jsDomain":       domains["jsDomain"],
		"webDomain":      domains["webDomain"],
	}, nil
}

// OaSave 函数说明：保存微信公众号配置
func (srv channelService) OaSave(saveReq req.ChannelOaSaveReq) (e error) {
	token := strings.TrimSpace(saveReq.Token)
	if token == "" {
		token = "likeshop"
	}
	return srv.saveBatch("oa_channel", map[string]string{
		"name":           strings.TrimSpace(saveReq.Name),
		"primaryId":      strings.TrimSpace(saveReq.PrimaryId),
		"qrCode":         util.UrlUtil.ToRelativeUrl(strings.TrimSpace(saveReq.QrCode)),
		"appId":          strings.TrimSpace(saveReq.AppId),
		"appSecret":      strings.TrimSpace(saveReq.AppSecret),
		"url":            strings.TrimSpace(saveReq.Url),
		"token":          token,
		"encodingAesKey": strings.TrimSpace(saveReq.EncodingAesKey),
		"encryptionType": strconv.Itoa(int(saveReq.EncryptionType)),
	})
}
