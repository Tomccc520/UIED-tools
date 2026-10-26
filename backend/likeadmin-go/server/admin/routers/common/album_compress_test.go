/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package common

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"likeadmin/admin/schemas/req"
	service "likeadmin/admin/service/common"
	"likeadmin/core/response"
)

type albumCompressSaveStub struct {
	service.IAlbumService
	saved []req.CommonAlbumCompressConfigSaveReq
}

// AlbumCompressConfigSave 函数说明：记录真实处理器解析后的参数，不访问数据库或重写任何图片。
func (stub *albumCompressSaveStub) AlbumCompressConfigSave(value req.CommonAlbumCompressConfigSaveReq) error {
	stub.saved = append(stub.saved, value)
	return nil
}

// requestAlbumCompressSave 函数说明：通过真实保存处理器校验完整 JSON 契约，仅隔离写入边界。
func requestAlbumCompressSave(t *testing.T, body string) (*albumCompressSaveStub, response.Response) {
	t.Helper()
	stub := &albumCompressSaveStub{}
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodPost, "/common/album/compressConfigSave", strings.NewReader(body))
	ctx.Request.Header.Set("Content-Type", "application/json")
	albumHandler{srv: stub}.albumCompressConfigSave(ctx)
	var result response.Response
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	return stub, result
}

// TestAlbumCompressRouteAcceptsDisabledAndZeroThreshold 函数说明：关闭状态和零阈值必须作为合法显式值传到服务层。
func TestAlbumCompressRouteAcceptsDisabledAndZeroThreshold(t *testing.T) {
	stub, result := requestAlbumCompressSave(t, `{"enabled":0,"minSizeKB":0,"jpegQuality":82,"pngCompressionLevel":"best"}`)
	if result.Code != 200 || len(stub.saved) != 1 || *stub.saved[0].Enabled != 0 || *stub.saved[0].MinSizeKB != 0 {
		t.Fatalf("explicit zero was rejected: code=%d", result.Code)
	}
}

// TestAlbumCompressRouteRejectsMissingAndInvalidValues 函数说明：缺失字段仍不能伪装成零值，范围外值也不应触发保存。
func TestAlbumCompressRouteRejectsMissingAndInvalidValues(t *testing.T) {
	for _, body := range []string{
		`{"minSizeKB":0,"jpegQuality":82,"pngCompressionLevel":"best"}`,
		`{"enabled":0,"jpegQuality":82,"pngCompressionLevel":"best"}`,
		`{"enabled":null,"minSizeKB":0,"jpegQuality":82,"pngCompressionLevel":"best"}`,
		`{"enabled":2,"minSizeKB":0,"jpegQuality":82,"pngCompressionLevel":"best"}`,
		`{"enabled":1,"minSizeKB":-1,"jpegQuality":82,"pngCompressionLevel":"best"}`,
		`{"enabled":1,"minSizeKB":102401,"jpegQuality":82,"pngCompressionLevel":"best"}`,
		`{"enabled":1,"minSizeKB":0,"jpegQuality":39,"pngCompressionLevel":"best"}`,
		`{"enabled":1,"minSizeKB":0,"jpegQuality":82,"pngCompressionLevel":"invalid"}`,
	} {
		stub, result := requestAlbumCompressSave(t, body)
		if result.Code == 200 || len(stub.saved) != 0 {
			t.Fatalf("invalid configuration reached save: body=%s code=%d", body, result.Code)
		}
	}
}
