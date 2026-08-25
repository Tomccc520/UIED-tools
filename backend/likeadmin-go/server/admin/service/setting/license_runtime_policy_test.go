package setting

import "testing"

// TestIsRuntimeLicenseEnforcementEnabled 函数说明：验证授权开关关闭时不会误拦截生产后台业务接口。
func TestIsRuntimeLicenseEnforcementEnabled(t *testing.T) {
	testCases := []struct {
		name     string
		enforce  int
		expected bool
	}{
		{name: "关闭授权拦截", enforce: 0, expected: false},
		{name: "开启授权拦截", enforce: 1, expected: true},
		{name: "异常值按关闭处理", enforce: 2, expected: false},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			actual := isRuntimeLicenseEnforcementEnabled(testCase.enforce)
			if actual != testCase.expected {
				t.Fatalf("expected %v, got %v", testCase.expected, actual)
			}
		})
	}
}
