package common

import "testing"

/**
 * 函数说明：验证网站信息抓取目标会拒绝本机、内网和云元数据地址。
 */
func TestIsPrivateWebInfoHost(t *testing.T) {
	privateHosts := []string{
		"localhost",
		"service.local",
		"127.0.0.1",
		"10.0.0.8",
		"172.16.0.4",
		"192.168.1.12",
		"169.254.169.254",
		"::1",
		"fe80::1%lo0",
	}
	for _, host := range privateHosts {
		if !isPrivateWebInfoHost(host) {
			t.Errorf("主机 %q 应被判定为受限地址", host)
		}
	}

	publicHosts := []string{"example.com", "www.uied.cn", "8.8.8.8"}
	for _, host := range publicHosts {
		if isPrivateWebInfoHost(host) {
			t.Errorf("主机 %q 不应被判定为受限地址", host)
		}
	}
}

/**
 * 函数说明：验证网站信息输入只接受 HTTP/HTTPS 公网目标，并拒绝认证信息。
 */
func TestNormalizeWebInfoInputRejectsUnsafeURL(t *testing.T) {
	unsafeURLs := []string{
		"http://127.0.0.1:8003/health",
		"http://169.254.169.254/latest/meta-data/",
		"ftp://example.com/file",
		"https://user:password@example.com/",
	}
	for _, rawURL := range unsafeURLs {
		if _, err := normalizeWebInfoInput(rawURL); err == nil {
			t.Errorf("URL %q 应被拒绝", rawURL)
		}
	}

	parsed, err := normalizeWebInfoInput("https://example.com/path?q=1#section")
	if err != nil {
		t.Fatalf("公网 HTTPS 地址不应被拒绝: %v", err)
	}
	if parsed.Path != "/" || parsed.RawQuery != "" || parsed.Fragment != "" {
		t.Fatalf("网站信息目标未标准化: %#v", parsed)
	}
}
