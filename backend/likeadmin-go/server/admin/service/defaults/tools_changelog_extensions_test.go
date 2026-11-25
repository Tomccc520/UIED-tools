package defaults

import (
	"encoding/json"
	"strings"
	"testing"
)

// TestChangelogExtensionsRoundTrip 验证网站配置保存、再次读取和公共接口数组保留版本与分组的拓展字段。
func TestChangelogExtensionsRoundTrip(t *testing.T) {
	raw := `[{"version":"custom","title":"公告","date":"2026-11-20","extension":{"note":"保留"},"features":[{"title":"功能","points":["一"],"icon":"star"}]},{"version":"custom","title":"公告","date":"2026-11-20","extension":"不应覆盖","archived":false,"features":[{"title":"功能","points":["二"],"icon":"other","audience":null}]}]`
	saved := NormalizeToolsChangelogTimelineJSON(raw)
	if got := NormalizeToolsChangelogTimelineJSON(saved); got != saved {
		t.Fatal("反复读写结果不稳定")
	}
	var stored []map[string]interface{}
	if err := json.Unmarshal([]byte(saved), &stored); err != nil {
		t.Fatal(err)
	}
	for _, rows := range [][]map[string]interface{}{stored, NormalizeToolsChangelogTimelineItems(saved)} {
		found := false
		for _, row := range rows {
			if row["version"] != "custom" {
				continue
			}
			found = true
			ext, ok := row["extension"].(map[string]interface{})
			if !ok || ext["note"] != "保留" || row["archived"] != false {
				t.Fatalf("版本扩展字段丢失或被覆盖: %#v", row)
			}
			groups := row["features"].([]interface{})
			feature := groups[0].(map[string]interface{})
			audience, ok := feature["audience"]
			if len(groups) != 1 || feature["icon"] != "star" || !ok || audience != nil || len(feature["points"].([]interface{})) != 2 {
				t.Fatalf("分组扩展字段丢失或合并错误: %#v", groups)
			}
		}
		if !found {
			t.Fatal("自定义版本不存在")
		}
	}
}

// TestChangelogPublicFallbackKeepsHistory 验证空数组或只有无效条目时仍下发完整历史。
func TestChangelogPublicFallbackKeepsHistory(t *testing.T) {
	want := NormalizeToolsChangelogTimelineJSON("")
	for _, input := range []string{"[]", `[{"version":"缺少日期和内容"}]`} {
		if got := NormalizeToolsChangelogTimelineJSON(input); got != want {
			t.Fatalf("空或无效配置没有回退到完整时间线：%s", input)
		}
	}
}

// TestChangelogPublicNumbersRemainExact 验证转成公共配置数组时不会将大整数舍入。
func TestChangelogPublicNumbersRemainExact(t *testing.T) {
	input := `[{"version":"custom","title":"公告","date":"2026-11-20","extension":{"identifier":9007199254740993,"big":1e400},"features":[{"title":"功能","points":["一"]}]}]`
	output, err := json.Marshal(NormalizeToolsChangelogTimelineItems(input))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(output), `"identifier":9007199254740993`) || !strings.Contains(string(output), `"big":1e400`) {
		t.Fatal("公共配置的扩展字段数值被舍入或丢弃")
	}
}
