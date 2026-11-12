/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
)

// TestCopywritingLibraryRoutes 校验四个站内库的真实路由和标准响应无需登录或数据库，未知类型会被拒绝。
func TestCopywritingLibraryRoutes(t *testing.T) {
	if err := core.ProvideForDI(func() serviceCommon.ICopywritingService { return serviceCommon.NewCopywritingService(nil) }); err != nil {
		t.Fatal(err)
	}
	router := gin.New()
	core.RegisterGroup(router.Group("/api"), CopywritingGroup)
	for _, kind := range []string{"kfc", "daily-poem", "dog-diary", "moments"} {
		t.Run(kind, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/common/copywriting/library/"+kind, nil))
			var body struct {
				Code int
				Data serviceCommon.CopywritingLibraryResult
			}
			if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
				t.Fatal(err)
			}
			if recorder.Code != http.StatusOK || body.Code != 200 || body.Data.UpdatedAt == "" || len(body.Data.Items) < 2 {
				t.Fatalf("公开文案库路由返回异常: http=%d code=%d items=%d", recorder.Code, body.Code, len(body.Data.Items))
			}
		})
	}

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/common/copywriting/library/unknown", nil))
	var rejected struct{ Code int }
	if err := json.Unmarshal(recorder.Body.Bytes(), &rejected); err != nil || rejected.Code == 0 || rejected.Code == 200 {
		t.Fatalf("未知类型应返回业务错误: %s", recorder.Body.String())
	}
}
