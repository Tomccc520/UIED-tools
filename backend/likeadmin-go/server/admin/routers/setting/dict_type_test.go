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

type dictTypeBindingServiceStub struct {
	service.ISettingDictTypeService
	adds  []req.SettingDictTypeAddReq
	edits []req.SettingDictTypeEditReq
}

// Add 记录路由实际传入的新增状态，不连接数据库。
func (stub *dictTypeBindingServiceStub) Add(value req.SettingDictTypeAddReq) error {
	stub.adds = append(stub.adds, value)
	return nil
}

// Edit 记录路由实际传入的编辑状态，不连接数据库。
func (stub *dictTypeBindingServiceStub) Edit(value req.SettingDictTypeEditReq) error {
	stub.edits = append(stub.edits, value)
	return nil
}

// requestDictTypeBinding 运行真实路由绑定及校验，仅隔离持久化边界。
func requestDictTypeBinding(t *testing.T, action, payload string) (*dictTypeBindingServiceStub, response.Response) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest(http.MethodPost, "/setting/dict/type/"+action, strings.NewReader(payload))
	context.Request.Header.Set("Content-Type", "application/json")
	stub := &dictTypeBindingServiceStub{}
	handler := dictTypeHandler{srv: stub}
	if action == "add" {
		handler.add(context)
	} else {
		handler.edit(context)
	}
	var result response.Response
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	return stub, result
}

// TestDictTypeBindingAllowsExplicitZeroAndOne 合法开关零值必须交给新增和编辑服务，JSON字段不改变。
func TestDictTypeBindingAllowsExplicitZeroAndOne(t *testing.T) {
	for _, action := range []string{"add", "edit"} {
		for _, status := range []string{"0", "1"} {
			t.Run(action+status, func(t *testing.T) {
				stub, result := requestDictTypeBinding(t, action, `{"id":3,"dictName":"示例","dictType":"example","dictStatus":`+status+`}`)
				if result.Code != 200 {
					t.Fatalf("合法状态被拒绝: code=%d body=%+v", result.Code, result)
				}
				var actual *int8
				if action == "add" {
					if len(stub.adds) != 1 {
						t.Fatal("未调用新增服务")
					}
					actual = stub.adds[0].DictStatus
				} else {
					if len(stub.edits) != 1 {
						t.Fatal("未调用编辑服务")
					}
					actual = stub.edits[0].DictStatus
				}
				if actual == nil || int(*actual) != int(status[0]-'0') {
					t.Fatalf("显式状态未保留: %v", actual)
				}
			})
		}
	}
}

// TestDictTypeBindingRejectsInvalidAndMissingStatus 缺失、null或非法状态不能作为关闭状态默默保存。
func TestDictTypeBindingRejectsInvalidAndMissingStatus(t *testing.T) {
	for _, action := range []string{"add", "edit"} {
		for _, field := range []string{``, `,"dictStatus":null`, `,"dictStatus":-1`, `,"dictStatus":2`, `,"dictStatus":"0"`} {
			t.Run(action+field, func(t *testing.T) {
				stub, result := requestDictTypeBinding(t, action, `{"id":3,"dictName":"示例","dictType":"example"`+field+`}`)
				if result.Code == 200 || len(stub.adds) != 0 || len(stub.edits) != 0 {
					t.Fatalf("无效状态进入服务层: code=%d adds=%d edits=%d", result.Code, len(stub.adds), len(stub.edits))
				}
			})
		}
	}
}
