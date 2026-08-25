package consumer

import (
	"net/url"
	"sort"
	"strings"
	"time"
)

const (
	orderDeliveryCheckStatusOK                 = "ok"
	orderDeliveryCheckStatusPendingDelivery    = "pending_delivery"
	orderDeliveryCheckStatusLicenseInactive    = "license_inactive"
	orderDeliveryCheckStatusDomainMismatch     = "domain_mismatch"
	orderDeliveryCheckStatusDownloadInvalid    = "download_invalid"
	orderDeliveryCheckStatusDeliveryIncomplete = "delivery_incomplete"
	orderDeliveryCheckStatusExpired            = "expired"
	orderDeliveryCheckStatusAbnormal           = "abnormal"
)

const (
	orderDownloadCheckStatusUnchecked uint8 = 0
	orderDownloadCheckStatusOK        uint8 = 1
	orderDownloadCheckStatusInvalid   uint8 = 2
)

const (
	orderSystemLicenseStatusInactive uint8 = 0
	orderSystemLicenseStatusActive   uint8 = 1
	orderSystemLicenseStatusExpired  uint8 = 2
	orderSystemLicenseStatusBlocked  uint8 = 3
)

// orderLicenseSnapshot 函数说明：承载订单交付联动时需要用到的系统授权快照。
type orderLicenseSnapshot struct {
	Status      uint8
	BoundDomain string
	ExpireTime  int64
	RawStatus   string
}

// orderDeliveryLinkageResult 函数说明：统一输出订单交付与系统授权联动后的状态结果。
type orderDeliveryLinkageResult struct {
	IsSourceOrder            bool
	PrimaryStatus            string
	PrimaryStatusText        string
	Issues                   []string
	SystemLicenseStatus      uint8
	SystemLicenseStatusText  string
	SystemLicenseBoundDomain string
	DownloadCheckStatus      uint8
	DownloadCheckStatusText  string
}

// normalizeOrderLinkageDomain 函数说明：统一清洗订单交付与系统授权里使用的域名，避免 http/https 与路径影响比对。
func normalizeOrderLinkageDomain(raw string) string {
	normalized := strings.TrimSpace(strings.ToLower(raw))
	if normalized == "" {
		return ""
	}
	normalized = strings.TrimPrefix(normalized, "http://")
	normalized = strings.TrimPrefix(normalized, "https://")
	normalized = strings.TrimPrefix(normalized, "//")
	normalized = strings.Trim(normalized, "/")
	if idx := strings.Index(normalized, "/"); idx >= 0 {
		normalized = normalized[:idx]
	}
	if idx := strings.Index(normalized, "?"); idx >= 0 {
		normalized = normalized[:idx]
	}
	if idx := strings.Index(normalized, "#"); idx >= 0 {
		normalized = normalized[:idx]
	}
	return normalized
}

// isSourceDeliveryOrder 函数说明：按交付字段与状态判断当前订单是否参与源码交付联动。
func isSourceDeliveryOrder(deliveryStatus uint8, boundDomain string, licenseKey string, downloadURL string) bool {
	if deliveryStatus > adminOrderDeliveryStatusPending {
		return true
	}
	return strings.TrimSpace(boundDomain) != "" || strings.TrimSpace(licenseKey) != "" || strings.TrimSpace(downloadURL) != ""
}

// isDownloadURLFormatValid 函数说明：仅校验下载链接格式与协议是否合法，不发起远程探测。
func isDownloadURLFormatValid(raw string) bool {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return false
	}
	parsed, err := url.Parse(trimmed)
	if err != nil {
		return false
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return false
	}
	return strings.TrimSpace(parsed.Host) != ""
}

// resolveOrderDownloadCheckStatusText 函数说明：输出下载检测状态文案，便于后台统一展示。
func resolveOrderDownloadCheckStatusText(status uint8) string {
	switch status {
	case orderDownloadCheckStatusOK:
		return "链接可访问"
	case orderDownloadCheckStatusInvalid:
		return "下载异常"
	default:
		return "未检测"
	}
}

// resolveOrderDeliveryCheckStatusText 函数说明：输出交付联动主状态文案，便于前端统一渲染。
func resolveOrderDeliveryCheckStatusText(status string) string {
	switch strings.TrimSpace(status) {
	case orderDeliveryCheckStatusPendingDelivery:
		return "待交付"
	case orderDeliveryCheckStatusLicenseInactive:
		return "授权未激活"
	case orderDeliveryCheckStatusDomainMismatch:
		return "域名不匹配"
	case orderDeliveryCheckStatusDownloadInvalid:
		return "下载异常"
	case orderDeliveryCheckStatusDeliveryIncomplete:
		return "资料不完整"
	case orderDeliveryCheckStatusExpired:
		return "已失效"
	default:
		return "资料完整"
	}
}

// resolveSystemLicenseStatusText 函数说明：输出系统授权状态文案，订单联动提示与授权页保持一致。
func resolveSystemLicenseStatusText(snapshot orderLicenseSnapshot) string {
	if snapshot.Status == orderSystemLicenseStatusActive && snapshot.ExpireTime > 0 && snapshot.ExpireTime < time.Now().Unix() {
		return "已过期"
	}
	switch snapshot.Status {
	case orderSystemLicenseStatusActive:
		return "已授权"
	case orderSystemLicenseStatusExpired:
		return "已过期"
	case orderSystemLicenseStatusBlocked:
		return "已冻结"
	default:
		return "未激活"
	}
}

// resolveSystemLicenseInactiveIssue 函数说明：针对系统授权不可用场景生成可读问题文案。
func resolveSystemLicenseInactiveIssue(snapshot orderLicenseSnapshot) string {
	if snapshot.Status == orderSystemLicenseStatusBlocked {
		return "系统授权已冻结"
	}
	if snapshot.Status == orderSystemLicenseStatusExpired {
		return "系统授权已过期"
	}
	if snapshot.Status == orderSystemLicenseStatusActive && snapshot.ExpireTime > 0 && snapshot.ExpireTime < time.Now().Unix() {
		return "系统授权已过期"
	}
	return "系统授权未激活"
}

// isSystemLicenseActiveForDelivery 函数说明：按当前本地缓存判断系统授权是否可用于源码交付校验。
func isSystemLicenseActiveForDelivery(snapshot orderLicenseSnapshot) bool {
	if snapshot.Status != orderSystemLicenseStatusActive {
		return false
	}
	if snapshot.ExpireTime > 0 && snapshot.ExpireTime < time.Now().Unix() {
		return false
	}
	return true
}

// compareOrderDomains 函数说明：校验订单绑定域名与系统授权域名是否一致，支持子域名继承。
func compareOrderDomains(orderDomain string, systemDomain string) bool {
	normalizedOrder := normalizeOrderLinkageDomain(orderDomain)
	normalizedSystem := normalizeOrderLinkageDomain(systemDomain)
	if normalizedOrder == "" || normalizedSystem == "" {
		return false
	}
	if normalizedOrder == normalizedSystem {
		return true
	}
	return strings.HasSuffix(normalizedOrder, "."+normalizedSystem) || strings.HasSuffix(normalizedSystem, "."+normalizedOrder)
}

// resolveOrderDeliveryPrimaryStatus 函数说明：按固定优先级从问题状态中选出主状态。
func resolveOrderDeliveryPrimaryStatus(statuses []string) string {
	if len(statuses) == 0 {
		return orderDeliveryCheckStatusOK
	}
	priorities := map[string]int{
		orderDeliveryCheckStatusExpired:            70,
		orderDeliveryCheckStatusLicenseInactive:    60,
		orderDeliveryCheckStatusDomainMismatch:     50,
		orderDeliveryCheckStatusDownloadInvalid:    40,
		orderDeliveryCheckStatusDeliveryIncomplete: 30,
		orderDeliveryCheckStatusPendingDelivery:    20,
		orderDeliveryCheckStatusOK:                 10,
	}
	sortedStatuses := append([]string(nil), statuses...)
	sort.SliceStable(sortedStatuses, func(i, j int) bool {
		return priorities[sortedStatuses[i]] > priorities[sortedStatuses[j]]
	})
	return sortedStatuses[0]
}

// buildOrderDeliveryLinkageResult 函数说明：根据订单交付资料与系统授权快照生成联动校验结果。
func buildOrderDeliveryLinkageResult(
	orderStatus uint8,
	deliveryStatus uint8,
	boundDomain string,
	licenseKey string,
	downloadURL string,
	downloadCheckStatus uint8,
	downloadCheckMessage string,
	snapshot orderLicenseSnapshot,
) orderDeliveryLinkageResult {
	result := orderDeliveryLinkageResult{
		IsSourceOrder:            isSourceDeliveryOrder(deliveryStatus, boundDomain, licenseKey, downloadURL),
		SystemLicenseStatus:      snapshot.Status,
		SystemLicenseStatusText:  resolveSystemLicenseStatusText(snapshot),
		SystemLicenseBoundDomain: strings.TrimSpace(snapshot.BoundDomain),
		DownloadCheckStatus:      downloadCheckStatus,
		DownloadCheckStatusText:  resolveOrderDownloadCheckStatusText(downloadCheckStatus),
		Issues:                   make([]string, 0),
	}
	if !result.IsSourceOrder {
		result.PrimaryStatus = ""
		result.PrimaryStatusText = "不参与"
		return result
	}

	matchedStatuses := make([]string, 0, 4)
	trimmedDomain := strings.TrimSpace(boundDomain)
	trimmedLicenseKey := strings.TrimSpace(licenseKey)
	trimmedDownloadURL := strings.TrimSpace(downloadURL)
	trimmedDownloadCheckMessage := strings.TrimSpace(downloadCheckMessage)

	if deliveryStatus == adminOrderDeliveryStatusInvalid {
		result.Issues = append(result.Issues, "交付记录已失效")
		matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusExpired)
	} else {
		if deliveryStatus == adminOrderDeliveryStatusNeedFix {
			result.Issues = append(result.Issues, "待补资料")
			matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusDeliveryIncomplete)
		}
		if deliveryStatus == adminOrderDeliveryStatusPending && (trimmedDomain != "" || trimmedLicenseKey != "" || trimmedDownloadURL != "") {
			result.Issues = append(result.Issues, "待交付")
			matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusPendingDelivery)
		}
		if deliveryStatus == adminOrderDeliveryStatusDone {
			if trimmedDomain == "" {
				result.Issues = append(result.Issues, "缺绑定域名")
				matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusDeliveryIncomplete)
			}
			if trimmedLicenseKey == "" {
				result.Issues = append(result.Issues, "缺授权码")
				matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusDeliveryIncomplete)
			}
			if trimmedDownloadURL == "" {
				result.Issues = append(result.Issues, "缺下载链接")
				matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusDeliveryIncomplete)
			} else if !isDownloadURLFormatValid(trimmedDownloadURL) {
				result.Issues = append(result.Issues, "下载链接格式无效")
				matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusDeliveryIncomplete)
			}
			if !isSystemLicenseActiveForDelivery(snapshot) {
				result.Issues = append(result.Issues, resolveSystemLicenseInactiveIssue(snapshot))
				matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusLicenseInactive)
			}
			if trimmedDomain != "" && normalizeOrderLinkageDomain(snapshot.BoundDomain) != "" && !compareOrderDomains(trimmedDomain, snapshot.BoundDomain) {
				result.Issues = append(result.Issues, "系统授权域名与订单绑定域名不一致")
				matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusDomainMismatch)
			}
			if downloadCheckStatus == orderDownloadCheckStatusInvalid {
				if trimmedDownloadCheckMessage != "" {
					result.Issues = append(result.Issues, "下载链接检测失败："+trimmedDownloadCheckMessage)
				} else {
					result.Issues = append(result.Issues, "下载链接检测失败")
				}
				matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusDownloadInvalid)
			}
		}
	}

	if len(matchedStatuses) == 0 && orderStatus == adminOrderStatusPaid && deliveryStatus == adminOrderDeliveryStatusPending {
		result.Issues = append(result.Issues, "待交付")
		matchedStatuses = append(matchedStatuses, orderDeliveryCheckStatusPendingDelivery)
	}

	result.PrimaryStatus = resolveOrderDeliveryPrimaryStatus(matchedStatuses)
	result.PrimaryStatusText = resolveOrderDeliveryCheckStatusText(result.PrimaryStatus)
	return result
}

// matchOrderDeliveryCheckFilter 函数说明：判断当前联动结果是否命中后台筛选项。
func matchOrderDeliveryCheckFilter(filterStatus string, result orderDeliveryLinkageResult) bool {
	normalizedFilter := strings.TrimSpace(filterStatus)
	if normalizedFilter == "" {
		return true
	}
	if !result.IsSourceOrder {
		return false
	}
	if normalizedFilter == orderDeliveryCheckStatusAbnormal {
		return result.PrimaryStatus != "" && result.PrimaryStatus != orderDeliveryCheckStatusOK
	}
	return result.PrimaryStatus == normalizedFilter
}
