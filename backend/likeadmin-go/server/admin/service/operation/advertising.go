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
	"html"
	"regexp"
	"strings"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	advertisingConfigType          = "website"
	advertisingConfigName          = "toolsBannerSlides"
	advertisingHotToolsName        = "toolsHotTools"
	advertisingModeImage           = "image"
	advertisingModeHTML            = "html"
	advertisingTargetSelf          = "_self"
	advertisingTargetBlank         = "_blank"
	advertisingDefaultHeight       = 48
	advertisingDefaultJSON         = `[{"badge":"推荐","text":"一人企业Vibe Coding社区！","link":"https://fsuied.com","gradient":"linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"},{"badge":"热门","text":"GPT-5.4重回巅峰 智能对话","link":"https://nf.video/mbx1u6/?gid=18","gradient":"linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)"},{"badge":"新品","text":"免费AI编程工具 Trae - 智能编码助手","link":"https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied","gradient":"linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)"}]`
	advertisingHotToolsDefaultJSON = `[{"title":"Adobe 正版全家桶可用AI","desc":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Gemini3 可用 nanobanana","desc":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"AI学习网站","desc":"每天逛一逛","link":"https://www.uied.cn/category/aigc/ai"},{"title":"免费AI生成PPT","desc":"AI智能生成PPT","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047"},{"title":"AIGC学习网站","desc":"UIED技术团队官网","link":"https://uied.cn/"},{"title":"AIGC工具","desc":"AI智能工具集合","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Midjourney绘画","desc":"AI绘画生成工具","link":"https://nf.video/czybtp/?gid=26"},{"title":"GPT-5.2","desc":"最新版GPT-5.2智能对话工具","link":"https://nf.video/oemcwv/?gid=18"},{"title":"ChatExcel表格","desc":"AI Excel 数据分析辅助工具","link":"https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6"}]`
)

var unsafeAdvertisingHTMLPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?i)<\s*(script|object|embed)\b`),
	regexp.MustCompile(`(?i)\s+on[a-z]+\s*=`),
	regexp.MustCompile(`(?i)\s+srcdoc\s*=`),
	regexp.MustCompile(`(?i)(href|src|action|xlink:href)\s*=\s*["']?\s*(javascript|vbscript|file|blob|data)\s*:`),
	regexp.MustCompile(`(?i)(url|@import)\s*\(?\s*["']?\s*(javascript|vbscript|file|blob|data)\s*:`),
}

var safeLegacyAdvertisingGradientPattern = regexp.MustCompile(`(?i)^linear-gradient\([a-z0-9#%(),.\s-]+\)$`)

// IOperationAdvertisingService 运营广告管理服务接口。
type IOperationAdvertisingService interface {
	Detail() (res map[string]interface{}, e error)
	Save(saveReq req.OperationAdvertisingSaveReq) (e error)
}

// advertisingItem 广告配置持久化结构。
type advertisingItem struct {
	RenderMode string `json:"renderMode,omitempty"`
	Text       string `json:"text"`
	Image      string `json:"image"`
	HTMLCode   string `json:"htmlCode"`
	Link       string `json:"link"`
	Target     string `json:"target"`
	Height     int    `json:"height"`
	Badge      string `json:"badge,omitempty"`
	Gradient   string `json:"gradient,omitempty"`
}

// advertisingHotToolItem 热门工具原生广告持久化结构。
type advertisingHotToolItem struct {
	Title string `json:"title"`
	Desc  string `json:"desc"`
	Link  string `json:"link"`
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

// normalizeAdvertisingImage 校验并清洗图片广告素材地址。
func normalizeAdvertisingImage(image string) (string, error) {
	normalized := strings.TrimSpace(image)
	lower := strings.ToLower(normalized)
	if strings.HasPrefix(normalized, "/") || strings.HasPrefix(lower, "http://") || strings.HasPrefix(lower, "https://") {
		return normalized, nil
	}
	return "", response.AssertArgumentError.Make("图片地址需以 /、http:// 或 https:// 开头")
}

// normalizeAdvertisingTarget 清洗广告链接打开方式，非法值回退新窗口。
func normalizeAdvertisingTarget(target string) string {
	if strings.TrimSpace(target) == advertisingTargetSelf {
		return advertisingTargetSelf
	}
	return advertisingTargetBlank
}

// normalizeAdvertisingHeight 清洗广告高度，未配置时使用历史 Banner 高度。
func normalizeAdvertisingHeight(height int) int {
	if height < 32 || height > 600 {
		return advertisingDefaultHeight
	}
	return height
}

// validateAdvertisingHTML 拦截脚本、事件属性和危险协议，避免广告代码进入前台。
func validateAdvertisingHTML(source string) error {
	for _, pattern := range unsafeAdvertisingHTMLPatterns {
		if pattern.MatchString(source) {
			return response.AssertArgumentError.Make("HTML 广告不允许脚本、事件属性、srcdoc 或危险协议")
		}
	}
	return nil
}

// buildLegacyAdvertisingHTML 将历史渐变文字广告转换为等效 HTML，保证升级后继续展示。
func buildLegacyAdvertisingHTML(item advertisingItem) string {
	gradient := strings.TrimSpace(item.Gradient)
	if !safeLegacyAdvertisingGradientPattern.MatchString(gradient) {
		gradient = "linear-gradient(to right,#e5e7eb,#f8fafc)"
	}
	link := strings.TrimSpace(item.Link)
	if _, err := normalizeAdvertisingLink(link); err != nil {
		link = "#"
	}
	return fmt.Sprintf(
		`<a href="%s" target="_blank" rel="noopener noreferrer" style="display:flex;height:100%%;align-items:center;justify-content:center;gap:8px;padding:0 16px;color:#111827;text-decoration:none;background:%s"><span style="padding:2px 8px;background:rgba(255,255,255,.55);font-size:12px;font-weight:700">%s</span><strong style="font-size:15px">%s</strong></a>`,
		html.EscapeString(link),
		html.EscapeString(gradient),
		html.EscapeString(strings.TrimSpace(item.Badge)),
		html.EscapeString(strings.TrimSpace(item.Text)),
	)
}

// migrateAdvertisingItem 统一新旧广告字段，并自动将历史文字广告迁移为 HTML 模式。
func migrateAdvertisingItem(item advertisingItem) advertisingItem {
	item.RenderMode = strings.ToLower(strings.TrimSpace(item.RenderMode))
	item.Text = strings.TrimSpace(item.Text)
	item.Image = strings.TrimSpace(item.Image)
	item.HTMLCode = strings.TrimSpace(item.HTMLCode)
	item.Link = strings.TrimSpace(item.Link)
	item.Target = normalizeAdvertisingTarget(item.Target)
	item.Height = normalizeAdvertisingHeight(item.Height)
	if item.RenderMode != advertisingModeImage && item.RenderMode != advertisingModeHTML {
		if item.HTMLCode != "" {
			item.RenderMode = advertisingModeHTML
		} else if item.Image != "" {
			item.RenderMode = advertisingModeImage
		} else {
			item.RenderMode = advertisingModeHTML
			item.HTMLCode = buildLegacyAdvertisingHTML(item)
		}
	}
	item.Badge = ""
	item.Gradient = ""
	return item
}

// normalizeAdvertisingItems 清洗广告列表，并按图片或 HTML 模式校验必填内容。
func normalizeAdvertisingItems(input []req.OperationAdvertisingItemReq) ([]advertisingItem, error) {
	if len(input) == 0 {
		return nil, response.AssertArgumentError.Make("请至少配置 1 条广告")
	}
	if len(input) > 20 {
		return nil, response.AssertArgumentError.Make("广告数量不能超过 20 条")
	}

	items := make([]advertisingItem, 0, len(input))
	for index, item := range input {
		text := strings.TrimSpace(item.Text)
		if text == "" {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条广告请填写广告名称", index+1))
		}
		normalized := migrateAdvertisingItem(advertisingItem{
			RenderMode: item.RenderMode,
			Text:       text,
			Image:      item.Image,
			HTMLCode:   item.HTMLCode,
			Link:       item.Link,
			Target:     item.Target,
			Height:     item.Height,
			Badge:      item.Badge,
			Gradient:   item.Gradient,
		})
		if normalized.RenderMode == advertisingModeImage {
			image, err := normalizeAdvertisingImage(normalized.Image)
			if err != nil {
				return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条图片广告的素材地址不正确", index+1))
			}
			normalized.Image = image
			if normalized.Link != "" {
				link, linkErr := normalizeAdvertisingLink(normalized.Link)
				if linkErr != nil {
					return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条图片广告的跳转链接不正确", index+1))
				}
				normalized.Link = link
			}
		} else {
			if normalized.HTMLCode == "" {
				return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条 HTML 广告请填写代码", index+1))
			}
			if err := validateAdvertisingHTML(normalized.HTMLCode); err != nil {
				return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条 HTML 广告包含不安全内容", index+1))
			}
		}
		items = append(items, normalized)
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
	for index := range items {
		items[index] = migrateAdvertisingItem(items[index])
	}
	return items
}

// normalizeAdvertisingHotTools 清洗热门工具原生广告，并校验必填字段与链接。
func normalizeAdvertisingHotTools(input []req.OperationAdvertisingHotToolItemReq) ([]advertisingHotToolItem, error) {
	if len(input) == 0 {
		return nil, response.AssertArgumentError.Make("请至少配置 1 条热门工具原生广告")
	}
	if len(input) > 20 {
		return nil, response.AssertArgumentError.Make("热门工具原生广告不能超过 20 条")
	}

	items := make([]advertisingHotToolItem, 0, len(input))
	for index, item := range input {
		title := strings.TrimSpace(item.Title)
		desc := strings.TrimSpace(item.Desc)
		if title == "" {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条热门工具广告请填写标题", index+1))
		}
		if desc == "" {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条热门工具广告请填写简介", index+1))
		}
		link, err := normalizeAdvertisingLink(item.Link)
		if err != nil {
			return nil, response.AssertArgumentError.Make(fmt.Sprintf("第 %d 条热门工具广告的跳转链接不正确", index+1))
		}
		items = append(items, advertisingHotToolItem{Title: title, Desc: desc, Link: link})
	}
	return items, nil
}

// parseAdvertisingHotTools 解析热门工具原生广告 JSON，异常或空配置时回退默认内容。
func parseAdvertisingHotTools(raw string) []advertisingHotToolItem {
	parse := func(source string) []advertisingHotToolItem {
		items := make([]advertisingHotToolItem, 0)
		if err := json.Unmarshal([]byte(source), &items); err != nil {
			return nil
		}
		return items
	}
	items := parse(strings.TrimSpace(raw))
	if len(items) == 0 {
		items = parse(advertisingHotToolsDefaultJSON)
	}
	for index := range items {
		items[index].Title = strings.TrimSpace(items[index].Title)
		items[index].Desc = strings.TrimSpace(items[index].Desc)
		items[index].Link = strings.TrimSpace(items[index].Link)
	}
	return items
}

// Detail 读取运营广告配置并兼容既有官网 Banner 数据。
func (srv operationAdvertisingService) Detail() (res map[string]interface{}, e error) {
	raw, err := util.ConfigUtil.GetVal(srv.db, advertisingConfigType, advertisingConfigName, advertisingDefaultJSON)
	if e = response.CheckErr(err, "Advertising Detail Get err"); e != nil {
		return
	}
	hotToolsRaw, err := util.ConfigUtil.GetVal(srv.db, advertisingConfigType, advertisingHotToolsName, advertisingHotToolsDefaultJSON)
	if e = response.CheckErr(err, "Advertising Detail Get hotTools err"); e != nil {
		return
	}
	items := parseAdvertisingItems(raw)
	hotTools := parseAdvertisingHotTools(hotToolsRaw)
	return map[string]interface{}{
		"items":         items,
		"total":         len(items),
		"hotTools":      hotTools,
		"hotToolsTotal": len(hotTools),
	}, nil
}

// Save 保存顶部广告及热门工具原生广告，继续写入既有配置键保证前台无缝兼容。
func (srv operationAdvertisingService) Save(saveReq req.OperationAdvertisingSaveReq) (e error) {
	items, err := normalizeAdvertisingItems(saveReq.Items)
	if err != nil {
		return err
	}
	encoded, err := json.Marshal(items)
	if e = response.CheckErr(err, "Advertising Save Marshal err"); e != nil {
		return
	}

	var hotToolsEncoded []byte
	if saveReq.HotTools != nil {
		hotTools, hotToolsErr := normalizeAdvertisingHotTools(saveReq.HotTools)
		if hotToolsErr != nil {
			return hotToolsErr
		}
		hotToolsEncoded, err = json.Marshal(hotTools)
		if e = response.CheckErr(err, "Advertising Save Marshal hotTools err"); e != nil {
			return
		}
	}

	err = srv.db.Transaction(func(tx *gorm.DB) error {
		if setErr := util.ConfigUtil.Set(tx, advertisingConfigType, advertisingConfigName, string(encoded)); setErr != nil {
			return setErr
		}
		if saveReq.HotTools != nil {
			if setErr := util.ConfigUtil.Set(tx, advertisingConfigType, advertisingHotToolsName, string(hotToolsEncoded)); setErr != nil {
				return setErr
			}
		}
		return nil
	})
	return response.CheckErr(err, "Advertising Save Set err")
}
