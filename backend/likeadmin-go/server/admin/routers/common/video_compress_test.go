/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
package common

import (
	"bytes"
	"context"
	"mime"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
	serviceCommon "likeadmin/admin/service/common"
)

type videoAttachmentTestService struct {
	result serviceCommon.VideoCompressResult
}

// Config 返回附件回归所需的固定能力，不依赖数据库或 FFmpeg。
func (srv videoAttachmentTestService) Config() serviceCommon.VideoCompressConfig {
	return serviceCommon.VideoCompressConfig{}
}

// Compress 返回本地测试视频，验证真实处理器的响应头和文件发送流程。
func (srv videoAttachmentTestService) Compress(context.Context, *multipart.FileHeader) (serviceCommon.VideoCompressResult, error) {
	return srv.result, nil
}

// TestVideoCompressAttachmentFilename 验证中文空格、加号、分号和引号能按标准响应头无损往返。
func TestVideoCompressAttachmentFilename(t *testing.T) {
	gin.SetMode(gin.TestMode)
	for _, name := range []string{"测试 视频_compressed.mp4", "测试+视频_compressed.mp4", "demo;v2_compressed.mp4", "demo\"quoted\".mp4"} {
		t.Run(name, func(t *testing.T) {
			filePath := filepath.Join(t.TempDir(), "result.mp4")
			content := []byte("test video output")
			if err := os.WriteFile(filePath, content, 0600); err != nil {
				t.Fatal(err)
			}
			cleaned := false
			handler := videoCompressHandler{srv: videoAttachmentTestService{result: serviceCommon.VideoCompressResult{
				Path: filePath, FileName: name, ContentType: "video/mp4", Compressed: true,
				OriginalSize: 100, OutputSize: int64(len(content)), Cleanup: func() { cleaned = true },
			}}}
			router := gin.New()
			router.POST("/compress", handler.compress)
			var body bytes.Buffer
			writer := multipart.NewWriter(&body)
			part, err := writer.CreateFormFile("file", "input.mp4")
			if err != nil {
				t.Fatal(err)
			}
			if _, err = part.Write([]byte("source")); err != nil {
				t.Fatal(err)
			}
			if err = writer.Close(); err != nil {
				t.Fatal(err)
			}
			request := httptest.NewRequest(http.MethodPost, "/compress", &body)
			request.Header.Set("Content-Type", writer.FormDataContentType())
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			if response.Code != http.StatusOK || !bytes.Equal(response.Body.Bytes(), content) {
				t.Fatalf("响应文件不一致：%d %q", response.Code, response.Body.String())
			}
			_, params, err := mime.ParseMediaType(response.Header().Get("Content-Disposition"))
			if err != nil || params["filename"] != name {
				t.Fatalf("文件名被改写：got=%q want=%q err=%v header=%q", params["filename"], name, err, response.Header().Get("Content-Disposition"))
			}
			if response.Header().Get("Content-Type") != "video/mp4" || !cleaned {
				t.Fatal("MIME 或响应后清理不符合约定")
			}
		})
	}
}
