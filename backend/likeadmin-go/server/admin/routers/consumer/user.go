package consumer

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	consumerService "likeadmin/admin/service/consumer"
	"likeadmin/core"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var UserGroup = core.Group("/user", newUserHandler, regUser, middleware.TokenAuth())

func newUserHandler(srv consumerService.IUserService) *userHandler {
	return &userHandler{srv: srv}
}

func regUser(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *userHandler) {
		rg.GET("/list", middleware.RecordLog("用户列表"), handle.list)
		rg.GET("/detail", middleware.RecordLog("用户详情"), handle.detail)
		rg.POST("/edit", middleware.RecordLog("用户编辑"), handle.edit)
	})
}

type userHandler struct {
	srv consumerService.IUserService
}

// list 函数说明：分页获取用户列表
func (h userHandler) list(c *gin.Context) {
	var page request.PageReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &page)) {
		return
	}
	var listReq req.UserListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.List(page, listReq)
	response.CheckAndRespWithData(c, res, err)
}

// detail 函数说明：获取用户详情
func (h userHandler) detail(c *gin.Context) {
	var detailReq req.UserDetailReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &detailReq)) {
		return
	}
	res, err := h.srv.Detail(detailReq.ID)
	response.CheckAndRespWithData(c, res, err)
}

// edit 函数说明：按字段更新用户信息
func (h userHandler) edit(c *gin.Context) {
	var editReq req.UserEditReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &editReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.Edit(editReq))
}
