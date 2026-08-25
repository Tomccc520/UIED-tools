package channel

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	"likeadmin/core/response"
	"likeadmin/util"
)

const oaMenuConfigName = "menu"

// IOaMenuService 函数说明：定义公众号菜单本地保存与微信平台发布能力。
type IOaMenuService interface {
	Detail() (res []req.ChannelOaMenuItemReq, e error)
	Save(menuList []req.ChannelOaMenuItemReq) (e error)
	Publish(menuList []req.ChannelOaMenuItemReq) (e error)
}

// NewOaMenuService 函数说明：初始化公众号菜单服务。
func NewOaMenuService(db *gorm.DB) IOaMenuService {
	return &oaMenuService{
		db:     db,
		client: &http.Client{Timeout: 12 * time.Second},
	}
}

// oaMenuService 函数说明：公众号菜单服务实现。
type oaMenuService struct {
	db     *gorm.DB
	client *http.Client
}

// wechatAccessTokenResponse 函数说明：承接微信 access_token 接口响应。
type wechatAccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	ErrCode     int    `json:"errcode"`
	ErrMsg      string `json:"errmsg"`
}

// wechatMenuResponse 函数说明：承接微信菜单发布接口响应。
type wechatMenuResponse struct {
	ErrCode int    `json:"errcode"`
	ErrMsg  string `json:"errmsg"`
}

// wechatMenuItem 函数说明：转换后台菜单结构为微信自定义菜单字段。
type wechatMenuItem struct {
	Name      string           `json:"name"`
	Type      string           `json:"type,omitempty"`
	URL       string           `json:"url,omitempty"`
	AppID     string           `json:"appid,omitempty"`
	PagePath  string           `json:"pagepath,omitempty"`
	SubButton []wechatMenuItem `json:"sub_button,omitempty"`
}

// normalizeOaMenuItem 函数说明：清理单个菜单项字段，保证保存与发布结构一致。
func normalizeOaMenuItem(item req.ChannelOaMenuItemReq) req.ChannelOaMenuItemReq {
	item.Name = strings.TrimSpace(item.Name)
	item.VisitType = strings.ToLower(strings.TrimSpace(item.VisitType))
	item.URL = strings.TrimSpace(item.URL)
	item.AppID = strings.TrimSpace(item.AppID)
	item.PagePath = strings.TrimSpace(item.PagePath)
	if item.MenuType != 2 {
		item.MenuType = 1
		item.SubButtons = []req.ChannelOaMenuItemReq{}
	}
	if item.VisitType == "" {
		item.VisitType = "view"
	}
	for index := range item.SubButtons {
		item.SubButtons[index] = normalizeOaMenuItem(item.SubButtons[index])
		item.SubButtons[index].MenuType = 1
		item.SubButtons[index].SubButtons = []req.ChannelOaMenuItemReq{}
	}
	return item
}

// validateOaMenuURL 函数说明：校验公众号菜单链接必须使用 HTTP 或 HTTPS 协议。
func validateOaMenuURL(rawURL string) bool {
	parsedURL, err := url.ParseRequestURI(strings.TrimSpace(rawURL))
	if err != nil || parsedURL.Host == "" {
		return false
	}
	return parsedURL.Scheme == "http" || parsedURL.Scheme == "https"
}

// validateOaDirectMenuItem 函数说明：校验网页或小程序直达菜单的必要参数。
func validateOaDirectMenuItem(item req.ChannelOaMenuItemReq, label string) error {
	if item.VisitType != "view" && item.VisitType != "miniprogram" {
		return response.AssertArgumentError.Make(label + "访问类型不合法")
	}
	if !validateOaMenuURL(item.URL) {
		return response.AssertArgumentError.Make(label + "请填写有效的 HTTP/HTTPS 地址")
	}
	if item.VisitType == "miniprogram" {
		if item.AppID == "" || item.PagePath == "" {
			return response.AssertArgumentError.Make(label + "小程序 AppID 和页面路径不能为空")
		}
	}
	return nil
}

// validateAndNormalizeOaMenus 函数说明：校验公众号一级菜单和子菜单数量、名称与访问参数。
func validateAndNormalizeOaMenus(menuList []req.ChannelOaMenuItemReq) ([]req.ChannelOaMenuItemReq, error) {
	if len(menuList) > 3 {
		return nil, response.AssertArgumentError.Make("公众号一级菜单不能超过 3 个")
	}
	normalizedList := make([]req.ChannelOaMenuItemReq, 0, len(menuList))
	for menuIndex, rawItem := range menuList {
		item := normalizeOaMenuItem(rawItem)
		label := fmt.Sprintf("第 %d 个一级菜单：", menuIndex+1)
		if item.Name == "" || utf8.RuneCountInString(item.Name) > 12 {
			return nil, response.AssertArgumentError.Make(label + "名称需为 1-12 个字符")
		}
		if item.MenuType == 2 {
			if len(item.SubButtons) == 0 || len(item.SubButtons) > 5 {
				return nil, response.AssertArgumentError.Make(label + "子菜单数量需为 1-5 个")
			}
			for subIndex, subItem := range item.SubButtons {
				subLabel := fmt.Sprintf("第 %d 个一级菜单的第 %d 个子菜单：", menuIndex+1, subIndex+1)
				if subItem.Name == "" || utf8.RuneCountInString(subItem.Name) > 12 {
					return nil, response.AssertArgumentError.Make(subLabel + "名称需为 1-12 个字符")
				}
				if err := validateOaDirectMenuItem(subItem, subLabel); err != nil {
					return nil, err
				}
			}
		} else if err := validateOaDirectMenuItem(item, label); err != nil {
			return nil, err
		}
		normalizedList = append(normalizedList, item)
	}
	return normalizedList, nil
}

// buildWechatMenuItem 函数说明：把后台菜单项转换为微信菜单发布结构。
func buildWechatMenuItem(item req.ChannelOaMenuItemReq) wechatMenuItem {
	result := wechatMenuItem{Name: item.Name}
	if item.MenuType == 2 {
		result.SubButton = make([]wechatMenuItem, 0, len(item.SubButtons))
		for _, subItem := range item.SubButtons {
			result.SubButton = append(result.SubButton, buildWechatMenuItem(subItem))
		}
		return result
	}
	result.Type = item.VisitType
	result.URL = item.URL
	if item.VisitType == "miniprogram" {
		result.AppID = item.AppID
		result.PagePath = item.PagePath
	}
	return result
}

// decodeWechatResponse 函数说明：读取并解析微信接口响应，统一处理 HTTP 与 JSON 异常。
func decodeWechatResponse(httpResponse *http.Response, target interface{}) error {
	defer httpResponse.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(httpResponse.Body, 1<<20))
	if err != nil {
		return err
	}
	if httpResponse.StatusCode < 200 || httpResponse.StatusCode >= 300 {
		return fmt.Errorf("微信接口请求失败（HTTP %d）", httpResponse.StatusCode)
	}
	if err := json.Unmarshal(responseBody, target); err != nil {
		return fmt.Errorf("微信接口响应格式错误")
	}
	return nil
}

// fetchWechatAccessToken 函数说明：使用公众号 AppID 和 AppSecret 获取微信接口令牌。
func (srv oaMenuService) fetchWechatAccessToken(appID string, appSecret string) (string, error) {
	requestURL := "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
		url.QueryEscape(appID) + "&secret=" + url.QueryEscape(appSecret)
	httpResponse, err := srv.client.Get(requestURL)
	if err != nil {
		return "", fmt.Errorf("微信 access_token 请求失败：%w", err)
	}
	var tokenResponse wechatAccessTokenResponse
	if err := decodeWechatResponse(httpResponse, &tokenResponse); err != nil {
		return "", err
	}
	if tokenResponse.ErrCode != 0 || strings.TrimSpace(tokenResponse.AccessToken) == "" {
		return "", fmt.Errorf("微信 access_token 获取失败（%d）：%s", tokenResponse.ErrCode, tokenResponse.ErrMsg)
	}
	return strings.TrimSpace(tokenResponse.AccessToken), nil
}

// publishWechatMenu 函数说明：调用微信自定义菜单接口发布已校验的菜单结构。
func (srv oaMenuService) publishWechatMenu(accessToken string, menuList []req.ChannelOaMenuItemReq) error {
	buttonList := make([]wechatMenuItem, 0, len(menuList))
	for _, item := range menuList {
		buttonList = append(buttonList, buildWechatMenuItem(item))
	}
	payload, err := json.Marshal(map[string]interface{}{"button": buttonList})
	if err != nil {
		return fmt.Errorf("公众号菜单发布参数生成失败")
	}
	requestURL := "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + url.QueryEscape(accessToken)
	httpResponse, err := srv.client.Post(requestURL, "application/json; charset=utf-8", bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("微信菜单发布请求失败：%w", err)
	}
	var publishResponse wechatMenuResponse
	if err := decodeWechatResponse(httpResponse, &publishResponse); err != nil {
		return err
	}
	if publishResponse.ErrCode != 0 {
		return fmt.Errorf("微信菜单发布失败（%d）：%s", publishResponse.ErrCode, publishResponse.ErrMsg)
	}
	return nil
}

// Detail 函数说明：读取本地保存的公众号菜单配置。
func (srv oaMenuService) Detail() (res []req.ChannelOaMenuItemReq, e error) {
	data, err := util.ConfigUtil.Get(srv.db, "oa_channel")
	if e = response.CheckErr(err, "OaMenu Detail Get err"); e != nil {
		return
	}
	menuJSON := strings.TrimSpace(data[oaMenuConfigName])
	if menuJSON == "" {
		return []req.ChannelOaMenuItemReq{}, nil
	}
	if err := json.Unmarshal([]byte(menuJSON), &res); err != nil {
		return nil, response.AssertArgumentError.Make("公众号菜单配置格式错误，请重新保存")
	}
	if res == nil {
		res = []req.ChannelOaMenuItemReq{}
	}
	return res, nil
}

// Save 函数说明：校验并保存公众号菜单到本地配置中心。
func (srv oaMenuService) Save(menuList []req.ChannelOaMenuItemReq) (e error) {
	normalizedList, err := validateAndNormalizeOaMenus(menuList)
	if err != nil {
		return err
	}
	payload, err := json.Marshal(normalizedList)
	if err != nil {
		return response.CheckErr(err, "OaMenu Save Marshal err")
	}
	return response.CheckErr(
		util.ConfigUtil.Set(srv.db, "oa_channel", oaMenuConfigName, string(payload)),
		"OaMenu Save Set err",
	)
}

// Publish 函数说明：保存当前菜单后调用微信平台接口执行真实发布。
func (srv oaMenuService) Publish(menuList []req.ChannelOaMenuItemReq) (e error) {
	normalizedList, err := validateAndNormalizeOaMenus(menuList)
	if err != nil {
		return err
	}
	configData, err := util.ConfigUtil.Get(srv.db, "oa_channel")
	if e = response.CheckErr(err, "OaMenu Publish Config Get err"); e != nil {
		return
	}
	appID := strings.TrimSpace(configData["appId"])
	appSecret := strings.TrimSpace(configData["appSecret"])
	if appID == "" || appSecret == "" {
		return response.AssertArgumentError.Make("请先在公众号配置页填写 AppID 和 AppSecret")
	}
	if e = srv.Save(normalizedList); e != nil {
		return
	}
	accessToken, err := srv.fetchWechatAccessToken(appID, appSecret)
	if err != nil {
		return response.AssertArgumentError.Make(err.Error())
	}
	if err := srv.publishWechatMenu(accessToken, normalizedList); err != nil {
		return response.AssertArgumentError.Make(err.Error())
	}
	return nil
}
