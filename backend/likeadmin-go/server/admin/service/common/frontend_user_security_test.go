/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

package common

import "testing"

// TestNormalizePaymentCallbackResultRejectsEmpty 函数说明：确保空回调状态不会再被默认当作支付成功。
func TestNormalizePaymentCallbackResultRejectsEmpty(t *testing.T) {
	if result := normalizePaymentCallbackResult(""); result != "" {
		t.Fatalf("空支付回调状态应被拒绝，实际得到 %q", result)
	}
	if result := normalizePaymentCallbackResult("success"); result != frontendPaymentCallbackResultSuccess {
		t.Fatalf("合法成功状态解析异常，实际得到 %q", result)
	}
}

// TestNormalizePointsConsumeRequestID 函数说明：覆盖积分结算幂等标识的兼容空值、合法 UUID 与非法输入。
func TestNormalizePointsConsumeRequestID(t *testing.T) {
	if requestID, err := normalizePointsConsumeRequestID(""); err != nil || requestID != "" {
		t.Fatalf("旧版空 requestId 应保持兼容，requestId=%q err=%v", requestID, err)
	}
	validRequestID := "019f6035-0ac6-7a40-a1d4-75e4373c9cc9"
	if requestID, err := normalizePointsConsumeRequestID(validRequestID); err != nil || requestID != validRequestID {
		t.Fatalf("合法 UUID 解析失败，requestId=%q err=%v", requestID, err)
	}
	if _, err := normalizePointsConsumeRequestID("bad request id"); err == nil {
		t.Fatal("包含空格的 requestId 应被拒绝")
	}
}

// TestValidateTrustedPaymentOrderBinding 函数说明：确保已验签支付成功回调仍必须通过订单金额与币种绑定校验。
func TestValidateTrustedPaymentOrderBinding(t *testing.T) {
	order := frontendUserOrderEntity{Amount: 29.90, Currency: "CNY"}
	validContext := &frontendTrustedPaymentContext{AmountCents: 2990, Currency: "cny"}
	if err := validateTrustedPaymentOrderBinding(order, frontendPaymentCallbackResultSuccess, validContext); err != nil {
		t.Fatalf("合法金额与币种应通过校验：%v", err)
	}
	if err := validateTrustedPaymentOrderBinding(order, frontendPaymentCallbackResultSuccess, &frontendTrustedPaymentContext{AmountCents: 2991, Currency: "CNY"}); err == nil {
		t.Fatal("支付回调金额不匹配时应拒绝")
	}
	if err := validateTrustedPaymentOrderBinding(order, frontendPaymentCallbackResultSuccess, &frontendTrustedPaymentContext{AmountCents: 2990, Currency: "USD"}); err == nil {
		t.Fatal("支付回调币种不匹配时应拒绝")
	}
	if err := validateTrustedPaymentOrderBinding(order, frontendPaymentCallbackResultFailed, &frontendTrustedPaymentContext{AmountCents: 1, Currency: "USD"}); err != nil {
		t.Fatalf("非成功回调不应触发入账金额校验：%v", err)
	}
}
