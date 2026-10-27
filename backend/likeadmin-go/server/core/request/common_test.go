/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-27
 */
package request_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"likeadmin/core/request"
	"likeadmin/util"
)

// bindPageQuery 函数说明：使用真实 Gin 查询绑定和项目校验入口解析分页参数，全程不访问数据库或外部服务。
func bindPageQuery(query string) (request.PageReq, error) {
	gin.SetMode(gin.TestMode)
	context, _ := gin.CreateTestContext(httptest.NewRecorder())
	context.Request = httptest.NewRequest(http.MethodGet, "/list"+query, nil)
	var page request.PageReq
	err := util.VerifyUtil.VerifyQuery(context, &page)
	return page, err
}

// TestPageQueryKeepsDefaultsAndValidBounds 函数说明：不传分页和传入合法边界时，全部列表路由继续使用既有默认值与有效参数。
func TestPageQueryKeepsDefaultsAndValidBounds(t *testing.T) {
	for _, test := range []struct {
		query string
		want  request.PageReq
	}{
		{"", request.PageReq{PageNo: 1, PageSize: 20}},
		{"?pageNo=2", request.PageReq{PageNo: 2, PageSize: 20}},
		{"?pageNo=1&pageSize=1", request.PageReq{PageNo: 1, PageSize: 1}},
		{"?pageNo=10&pageSize=60", request.PageReq{PageNo: 10, PageSize: 60}},
	} {
		t.Run(test.query, func(t *testing.T) {
			actual, err := bindPageQuery(test.query)
			if err != nil || actual != test.want {
				t.Fatalf("合法分页被改变: page=%+v want=%+v err=%v", actual, test.want, err)
			}
		})
	}
}

// TestPageQueryRejectsInvalidValues 函数说明：零值、负数、超大分页和错误类型必须在真实查询校验入口被拒绝，避免进入取消 LIMIT 的查询。
func TestPageQueryRejectsInvalidValues(t *testing.T) {
	for _, query := range []string{
		"?pageNo=", "?pageSize=", "?pageNo=&pageSize=",
		"?pageNo=0", "?pageNo=-1", "?pageNo=bad", "?pageNo=1.5",
		"?pageSize=0", "?pageSize=-1", "?pageSize=61", "?pageSize=1000000",
		"?pageSize=bad", "?pageSize=1.5", "?pageSize=999999999999999999999999",
	} {
		t.Run(query, func(t *testing.T) {
			if page, err := bindPageQuery(query); err == nil {
				t.Fatalf("无效分页通过绑定并进入服务层: query=%s page=%+v", query, page)
			}
		})
	}
}
