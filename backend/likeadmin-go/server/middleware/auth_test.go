/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-26
 */
package middleware

import "testing"

// TestHasCompatiblePermission 函数说明：验证旧角色拥有 Provider 页面权限时可兼容使用新增模型获取接口。
func TestHasCompatiblePermission(t *testing.T) {
	perms := []string{"setting:ai:provider:detail"}
	if !hasCompatiblePermission(perms, "setting:ai:provider:models") {
		t.Fatal("Provider 页面权限应兼容模型获取接口")
	}
	if hasCompatiblePermission(perms, "setting:ai:model:save") {
		t.Fatal("只读页面权限不应越权兼容保存接口")
	}
}
