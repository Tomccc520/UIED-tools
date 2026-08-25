package config

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

import "testing"

// TestResolveConfigPathFromArgs 函数说明：验证配置路径解析不会被 Go test 的标准参数干扰。
func TestResolveConfigPathFromArgs(t *testing.T) {
	testCases := []struct {
		name     string
		args     []string
		expected string
	}{
		{name: "独立参数", args: []string{"-test.v=true", "-c", "/tmp/uied.env"}, expected: "/tmp/uied.env"},
		{name: "等号参数", args: []string{"-test.run", "TestConfig", "-c=./local.env"}, expected: "./local.env"},
		{name: "不传配置", args: []string{"-test.testlogfile=/tmp/test.log"}, expected: ""},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			actual := resolveConfigPathFromArgs(testCase.args)
			if actual != testCase.expected {
				t.Fatalf("配置路径解析错误：期望 %q，实际 %q", testCase.expected, actual)
			}
		})
	}
}
