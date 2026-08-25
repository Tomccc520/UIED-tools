/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package system

import (
	modelSystem "likeadmin/model/system"
	"testing"
)

// TestBuildAdminPasswordCredential 函数说明：验证新密码会生成可回读核对的盐值和哈希。
func TestBuildAdminPasswordCredential(t *testing.T) {
	credential, err := buildAdminPasswordCredential("  new-password-123  ")
	if err != nil {
		t.Fatalf("build credential failed: %v", err)
	}
	if credential.salt == "" || credential.hash == "" {
		t.Fatalf("credential fields must not be empty: %+v", credential)
	}
	if !credential.matches(modelSystem.SystemAuthAdmin{
		Salt:     credential.salt,
		Password: credential.hash,
	}) {
		t.Fatal("persisted credential should pass read-back verification")
	}
}

// TestAdminPasswordCredentialRejectsMismatch 函数说明：验证旧哈希或错误盐值不能通过改密落库校验。
func TestAdminPasswordCredentialRejectsMismatch(t *testing.T) {
	credential, err := buildAdminPasswordCredential("new-password-123")
	if err != nil {
		t.Fatalf("build credential failed: %v", err)
	}
	if credential.matches(modelSystem.SystemAuthAdmin{
		Salt:     credential.salt,
		Password: "old-password-hash",
	}) {
		t.Fatal("stale password hash must not pass verification")
	}
	if credential.matches(modelSystem.SystemAuthAdmin{
		Salt:     "wrong-salt",
		Password: credential.hash,
	}) {
		t.Fatal("wrong salt must not pass verification")
	}
}

// TestBuildAdminPasswordCredentialValidatesLength 函数说明：验证过短、过长及空密码会被服务端拒绝。
func TestBuildAdminPasswordCredentialValidatesLength(t *testing.T) {
	invalidPasswords := []string{"", "12345", "123456789012345678901"}
	for _, password := range invalidPasswords {
		if _, err := buildAdminPasswordCredential(password); err == nil {
			t.Fatalf("password %q should be rejected", password)
		}
	}
}
