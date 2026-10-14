package common

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var ToolRankingGroup = core.Group("/common", newToolRankingHandler, regToolRanking, middleware.TokenAuth())

const (
	toolRankingTrackRateKeyPrefix = "tool-ranking:track:rate:"
	toolRankingTrackMinuteLimit   = int64(120)
)

// newToolRankingHandler 函数说明：初始化工具排行榜公共接口处理器。
func newToolRankingHandler(srv serviceCommon.IToolRankingService) *toolRankingHandler {
	return &toolRankingHandler{srv: srv}
}

// regToolRanking 函数说明：注册工具排行榜榜单读取与事件埋点接口。
func regToolRanking(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *toolRankingHandler) {
		rg.GET("/tool-ranking/list", handle.list)
		rg.POST("/tool-ranking/track", handle.track)
	})
}

type toolRankingHandler struct {
	srv serviceCommon.IToolRankingService
}

// list 函数说明：读取工具排行榜列表，支持按榜单周期和排序方式查询。
func (h toolRankingHandler) list(c *gin.Context) {
	var listReq req.CommonToolRankingListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.List(listReq)
	response.CheckAndRespWithData(c, res, err)
}

// track 函数说明：写入工具排行榜事件埋点，供前台浏览/开始处理/下载等动作统一聚合。
func (h toolRankingHandler) track(c *gin.Context) {
	var trackReq req.CommonToolRankingTrackReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &trackReq)) {
		return
	}
	if !allowToolRankingTrack(c, trackReq) {
		return
	}
	res, err := h.srv.Track(trackReq)
	response.CheckAndRespWithData(c, res, err)
}

// allowToolRankingTrack 按客户端 IP、工具和事件类型限制排行榜埋点频率，避免公开接口被刷量污染榜单。
func allowToolRankingTrack(c *gin.Context, trackReq req.CommonToolRankingTrackReq) bool {
	eventType := strings.TrimSpace(strings.ToLower(trackReq.EventType))
	if eventType == "" {
		return true
	}
	identitySource := strings.Join([]string{
		strings.TrimSpace(c.ClientIP()),
		strings.TrimSpace(strings.ToLower(trackReq.ToolKey)),
		eventType,
	}, "|")
	identityHash := sha256.Sum256([]byte(identitySource))
	identity := hex.EncodeToString(identityHash[:8])
	bucket := time.Now().Format("200601021504")
	key := toolRankingTrackRateKeyPrefix + identity + ":" + bucket
	count := util.RedisUtil.IncrWithExpire(key, 60)
	if count < 0 {
		// 埋点属于非阻断能力，Redis 暂不可用时放行，避免影响工具主流程。
		return true
	}
	if count > toolRankingTrackMinuteLimit {
		response.FailWithMsg(c, response.AssertArgumentError, "排行榜记录过于频繁，请稍后重试")
		return false
	}
	return true
}
