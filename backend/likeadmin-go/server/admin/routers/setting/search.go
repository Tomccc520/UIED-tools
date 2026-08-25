package setting

import (
	"github.com/gin-gonic/gin"
	"likeadmin/admin/schemas/req"
	serviceSetting "likeadmin/admin/service/setting"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var SearchGroup = core.Group("/setting", newSearchHandler, regSearch, middleware.TokenAuth())

func newSearchHandler(srv serviceSetting.ISettingSearchService) *searchHandler {
	return &searchHandler{srv: srv}
}

func regSearch(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *searchHandler) {
		rg.GET("/search/detail", handle.detail)
		rg.POST("/search/save", handle.save)
	})
}

type searchHandler struct {
	srv serviceSetting.ISettingSearchService
}

// detail 获取热门搜索配置
func (sh searchHandler) detail(c *gin.Context) {
	res, err := sh.srv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// save 保存热门搜索配置
func (sh searchHandler) save(c *gin.Context) {
	var searchReq req.SettingSearchReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &searchReq)) {
		return
	}
	response.CheckAndResp(c, sh.srv.Save(searchReq))
}
