/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */
package common

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
	"likeadmin/core/response"
)

const videoCompressMultipartOverhead int64 = 2 * 1024 * 1024

var VideoCompressGroup = core.Group("/common", newVideoCompressHandler, regVideoCompress)

// newVideoCompressHandler 初始化前台视频压缩处理器。
func newVideoCompressHandler(srv serviceCommon.IVideoCompressService) *videoCompressHandler {
	return &videoCompressHandler{srv: srv}
}

// regVideoCompress 注册免登录的视频压缩配置与执行接口。
func regVideoCompress(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *videoCompressHandler) {
		rg.GET("/video/compress/config", handle.config)
		rg.POST("/video/compress", handle.compress)
	})
}

type videoCompressHandler struct {
	srv serviceCommon.IVideoCompressService
}

// config 返回服务端视频压缩能力和固定参数。
func (h videoCompressHandler) config(c *gin.Context) {
	response.OkWithData(c, h.srv.Config())
}

// compress 接收视频并以附件形式返回压缩结果或原视频回退结果。
func (h videoCompressHandler) compress(c *gin.Context) {
	maxBodySize := serviceCommon.VideoCompressMaxFileSize + videoCompressMultipartOverhead
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBodySize)
	file, err := c.FormFile("file")
	if err != nil {
		response.FailWithMsg(c, response.AssertArgumentError, "请选择 220MB 以内的视频文件")
		return
	}

	result, err := h.srv.Compress(c.Request.Context(), file)
	if response.IsFailWithResp(c, err) {
		return
	}
	if result.Cleanup != nil {
		defer result.Cleanup()
	}

	c.Header("Access-Control-Expose-Headers", strings.Join([]string{
		"Content-Disposition",
		"X-Video-Compressed",
		"X-Video-Original-Size",
		"X-Video-Output-Size",
		"X-Video-Elapsed-Ms",
	}, ", "))
	c.Header("X-Video-Compressed", strconv.FormatBool(result.Compressed))
	c.Header("X-Video-Original-Size", strconv.FormatInt(result.OriginalSize, 10))
	c.Header("X-Video-Output-Size", strconv.FormatInt(result.OutputSize, 10))
	c.Header("X-Video-Elapsed-Ms", strconv.FormatInt(result.Elapsed.Milliseconds(), 10))
	c.Header("Content-Type", result.ContentType)
	c.FileAttachment(result.Path, result.FileName)
}
