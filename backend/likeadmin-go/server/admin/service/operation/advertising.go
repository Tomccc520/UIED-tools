/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package operation

import (
	"encoding/json"
	"fmt"
	"strings"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	advertisingConfigType  = "website"
	advertisingConfigName  = "toolsBannerSlides"
	advertisingDefaultJSON = `[{"badge":"推荐","text":"一人企业Vibe Coding社区！","link":"https://fsuied.com","gradient":"linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"},{"badge":"热门","text":"GPT-5.4重回巅峰 智能对话","link":"https://nf.video/mbx1u6/?gid=18","gradient":"linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)"},{"badge":"新品","text":"免费AI编程工具 Trae - 智能编码助手","link":"https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied","gradient":"linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)"}]`
)

// IOperationAdvertisingService 运营广告管理服务接口。
type IOperationAdvertisingService interface {
	Detail() (res map[string]interface{}, e error)
	Save(saveReq req.OperationAdvertisingSaveReq) (e error)
}

// advertisingItem 广告配置持久化结构。
type advertisingItem struct {
	Badge    string `json:"badge"`
	Text     string `json:"text"`
	Link     string `json:"link"`
	Gradient string `json:"gradient"`
}

// operationAdvertisingService 运营广告管理服务实现。
type operationAdvertisingService struct {
	db *gorm.DB
}

// NewOperationAdvertisingService 初始化运营广告管理服务。
func NewOperationAdvertisingService(db *gorm.DB) IOperationAdvertisingService {
	return &operationAdvertisingService{db: db}
}

// normalizeAdvertisingLink 校验并清洗广告跳转链接。
func normalizeAdvertisingLink(link string) (string, error) {
	normalized := strings.TrimSpace(link)
	if strings.HasPrefix(normalized, "/") || strings.HasPrefix(normalized, "#") || strings.HasPrefix(strings.ToLower(normalized), "http://") || strings.HasPrefix(strings.ToLower(normalized), "https://") {
		return normalized, nil
	}
	return "", response.AssertArgumentError.Make("广告链接需以 /、# 或 http(s) 开头")
}

// normalizeAdvertisingItems 清洗广告列表并校验必填字段与渐变格式。
func normalizeAdvertisingItems(input []req.OperationAdvertisingItemReq) ([]advertisingItem, error) {
	if len(input) == 0 {
		return nil, response.AssertArgumentError.Make("请至少配置 1 条广告")
	}
	if len(input) > 20 {
		return nil, response.AssertArgumentError.Make("广告数量不能超过 20 条")
	}

	items := make([]advertisingItem, 0, len(input))
	for index, item := range input {
		badge := strings.TrimSpace(item.Badge)
		text := strings.TrimSpace(item.Text)
		gradient := strings.TrimSpace(item.Gradient)
		if badge == "" || text == "" || gradient == "" {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条广告的角标、文案和背景不能为空", index+1))
		}
		if !strings.HasPrefix(strings.ToLower(gradient), "linear-gradient(") {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条广告背景需使用 linear-gradient(...) 格式", index+1))
		}
		link, err := normalizeAdvertisingLink(item.Link)
		if err != nil {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条广告链接格式不正确", index+1))
		}
		items = append(items, advertisingItem{Badge: badge, Text: text, Link: link, Gradient: gradient})
	}
	return items, nil
}

// parseAdvertisingItems 解析历史广告 JSON，异常或空配置时回退默认广告。
func parseAdvertisingItems(raw string) []advertisingItem {
	parse := func(source string) []advertisingItem {
		items := make([]advertisingItem, 0)
		if err := json.Unmarshal([]byte(source), &items); err != nil {
			return nil
		}
		return items
	}
	items := parse(strings.TrimSpace(raw))
	if len(items) == 0 {
		items = parse(advertisingDefaultJSON)
	}
	return items
}

// Detail 读取运营广告配置并兼容既有官网 Banner 数据。
func (srv operationAdvertisingService) Detail() (res map[string]interface{}, e error) {
	raw, err := util.ConfigUtil.GetVal(srv.db, advertisingConfigType, advertisingConfigName, advertisingDefaultJSON)
	if e = response.CheckErr(err, "Advertising Detail Get err"); e != nil {
		return
	}
	items := parseAdvertisingItems(raw)
	return map[string]interface{}{
		"items": items,
		"total": len(items),
	}, nil
}

// Save 保存运营广告配置，继续写入既有 toolsBannerSlides 键保证前台无缝兼容。
func (srv operationAdvertisingService) Save(saveReq req.OperationAdvertisingSaveReq) (e error) {
	items, err := normalizeAdvertisingItems(saveReq.Items)
	if err != nil {
		return err
	}
	encoded, err := json.Marshal(items)
	if e = response.CheckErr(err, "Advertising Save Marshal err"); e != nil {
		return
	}
	err = util.ConfigUtil.Set(srv.db, advertisingConfigType, advertisingConfigName, string(encoded))
	return response.CheckErr(err, "Advertising Save Set err")
}
