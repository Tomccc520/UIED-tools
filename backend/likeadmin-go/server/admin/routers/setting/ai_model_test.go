/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package setting

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"likeadmin/admin/schemas/req"
	service "likeadmin/admin/service/setting"
	"likeadmin/core/response"
)

type aiScopeServiceStub struct {
	service.ISettingAiModelService
	saved []req.SettingAiModelSaveReq
}

// Save 函数说明：记录路由传入的范围，不连接数据库或调用真实 AI 服务。
func (stub *aiScopeServiceStub) Save(value req.SettingAiModelSaveReq) error {
	stub.saved = append(stub.saved, value)
	return nil
}

// requestAiScopeSave 函数说明：通过真实保存处理器验证 JSON 契约，仅替换持久化边界。
func requestAiScopeSave(t *testing.T, body string) (*aiScopeServiceStub, response.Response) {
	t.Helper()
	stub := &aiScopeServiceStub{}
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodPost, "/setting/ai/model/save", strings.NewReader(body))
	ctx.Request.Header.Set("Content-Type", "application/json")
	aiModelHandler{srv: stub}.save(ctx)
	var result response.Response
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	return stub, result
}

// TestAiScopeRouteAllowsProviderWithoutMatting 函数说明：文本和工具能力补丁不再被不相关的 modelId 必填校验拦截。
func TestAiScopeRouteAllowsProviderWithoutMatting(t *testing.T) {
	gin.SetMode(gin.TestMode)
	for _, scope := range []string{"provider", "ability"} {
		t.Run(scope, func(t *testing.T) {
			stub, result := requestAiScopeSave(t, `{"scope":"`+scope+`"}`)
			if result.Code != 200 || len(stub.saved) != 1 || stub.saved[0].Scope != scope {
				t.Fatalf("有效 scope 未传给服务层: code=%d", result.Code)
			}
		})
	}
}

// TestAiScopeRouteRejectsUnknownScope 函数说明：未知范围在路由参数校验阶段拒绝，不能降级成全量保存。
func TestAiScopeRouteRejectsUnknownScope(t *testing.T) {
	stub, result := requestAiScopeSave(t, `{"scope":"unknown","modelId":"koukoutu"}`)
	if result.Code == 200 || len(stub.saved) != 0 {
		t.Fatal("无效 scope 不应调用保存服务")
	}
}

// TestAiScopeRouteLegacyPayload 函数说明：旧全量请求无需增加 scope，仍按原契约交给服务层。
func TestAiScopeRouteLegacyPayload(t *testing.T) {
	stub, result := requestAiScopeSave(t, `{"modelId":"koukoutu","providers":[],"imageAbilities":[]}`)
	if result.Code != 200 || len(stub.saved) != 1 || stub.saved[0].Scope != "" || stub.saved[0].ModelId != "koukoutu" {
		t.Fatal("旧全量保存契约被破坏")
	}
}
