/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-27
 */
package setting

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zaptest/observer"
	"likeadmin/admin/schemas/req"
	service "likeadmin/admin/service/setting"
	"likeadmin/core"
	"likeadmin/core/response"
)

type websiteBindingServiceStub struct {
	service.ISettingWebsiteService
	saves       []req.SettingWebsiteReq
	saveError   error
	detailError error
	detailData  map[string]string
	detailReads int
}

type websiteSaveTestResponse struct {
	response.Response
	Show              bool `json:"show"`
	HandlerErrorCount int  `json:"-"`
}

// Save 函数说明：只记录真实路由绑定后的配置补丁，不访问数据库。
func (stub *websiteBindingServiceStub) Save(value req.SettingWebsiteReq) error {
	stub.saves = append(stub.saves, value)
	return stub.saveError
}

// Detail 函数说明：按测试场景返回隔离的配置或注入读取失败，记录保存后的真实回读次数。
func (stub *websiteBindingServiceStub) Detail() (map[string]string, error) {
	stub.detailReads++
	if stub.detailData == nil {
		return map[string]string{}, stub.detailError
	}
	return stub.detailData, stub.detailError
}

// requestWebsiteBinding 函数说明：运行网站保存处理器的 JSON 绑定与响应，仅替换持久化服务边界。
func requestWebsiteBinding(t *testing.T, payload string) (*websiteBindingServiceStub, response.Response) {
	t.Helper()
	stub := &websiteBindingServiceStub{}
	result := requestWebsiteSaveWithStub(t, payload, stub)
	return stub, result.Response
}

// requestWebsiteSaveWithStub 函数说明：用可控的保存和回读结果调用真实处理器，解析正常响应及回读失败提示，不访问真实数据库。
func requestWebsiteSaveWithStub(t *testing.T, payload string, stub *websiteBindingServiceStub) websiteSaveTestResponse {
	t.Helper()
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest(http.MethodPost, "/setting/website/save", strings.NewReader(payload))
	context.Request.Header.Set("Content-Type", "application/json")
	websiteHandler{srv: stub}.save(context)
	var result websiteSaveTestResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	result.HandlerErrorCount = len(context.Errors)
	return result
}

// TestWebsiteBindingRejectsInvalidTypes 函数说明：数组、对象、数值和布尔类型不能误入只接受字符串补丁的保存服务。
func TestWebsiteBindingRejectsInvalidTypes(t *testing.T) {
	for _, payload := range []string{
		`{"toolsCategoryTree":[]}`, `{"toolsSeoPages":{}}`, `{"toolsHeaderLinks":true}`,
		`{"name":123}`, `[]`, `false`, `{"toolsHeaderLinks":`,
	} {
		t.Run(payload, func(t *testing.T) {
			stub, result := requestWebsiteBinding(t, payload)
			if result.Code == 200 || len(stub.saves) != 0 {
				t.Fatalf("坏类型进入配置保存服务: response=%+v saves=%d", result, len(stub.saves))
			}
		})
	}
}

// TestWebsiteBindingKeepsPartialRequest 函数说明：单字段补丁保留字符串原文，未传和 null 字段继续为 nil，未知字段不能生成可写配置。
func TestWebsiteBindingKeepsPartialRequest(t *testing.T) {
	stub, result := requestWebsiteBinding(t, `{"toolsHeaderLinks":"  []  ","toolsSeoPages":null,"apiKey":"ignored"}`)
	if result.Code != 200 || len(stub.saves) != 1 {
		t.Fatalf("合法补丁未进入保存服务: response=%+v saves=%d", result, len(stub.saves))
	}
	actual := stub.saves[0]
	if actual.ToolsHeaderLinks == nil || *actual.ToolsHeaderLinks != "  []  " || actual.ToolsSeoPages != nil || actual.Name != nil || actual.ToolsCategoryTree != nil {
		t.Fatalf("部分更新被转换或增加未提交字段: %+v", actual)
	}
}

// TestWebsiteSaveKeepsFullSuccessfulResponse 函数说明：保存和回读均成功时继续返回完整详情，不增加回读提示或改变原有正常成功契约。
func TestWebsiteSaveKeepsFullSuccessfulResponse(t *testing.T) {
	stub := &websiteBindingServiceStub{detailData: map[string]string{"name": "完整站点配置", "toolsHeaderLinks": "[]"}}
	result := requestWebsiteSaveWithStub(t, `{"name":"完整站点配置"}`, stub)
	data, ok := result.Data.(map[string]interface{})
	if result.Code != 200 || result.Msg != "成功" || result.Show || result.HandlerErrorCount != 0 || !ok || len(data) != 2 || data["name"] != stub.detailData["name"] || data["toolsHeaderLinks"] != "[]" || len(stub.saves) != 1 || stub.detailReads != 1 {
		t.Fatalf("正常保存响应契约发生变化: response=%+v saves=%d reads=%d", result, len(stub.saves), stub.detailReads)
	}
}

// TestWebsiteSaveReadFailureReportsCommittedSuccess 函数说明：已保存后的回读失败必须明确提示已保存和重载，不暴露内部错误，不使请求或操作日志变成保存失败。
func TestWebsiteSaveReadFailureReportsCommittedSuccess(t *testing.T) {
	logCore, logs := observer.New(zap.WarnLevel)
	originalLogger := core.Logger
	core.Logger = zap.New(logCore).Sugar()
	t.Cleanup(func() { core.Logger = originalLogger })
	privateDetail := "database read failed: private-password-placeholder"
	stub := &websiteBindingServiceStub{detailError: errors.New(privateDetail), detailData: map[string]string{"name": "不完整数据不能返回"}}
	result := requestWebsiteSaveWithStub(t, `{"name":"已提交配置"}`, stub)
	data, ok := result.Data.(map[string]interface{})
	if result.Code != 200 || !result.Show || result.HandlerErrorCount != 0 || result.Msg != "配置已保存，请重新加载查看，无需重复提交" || !ok || len(data) != 2 || data["saved"] != true || data["reloadRequired"] != true || len(stub.saves) != 1 || stub.detailReads != 1 {
		t.Fatalf("回读失败被误报为保存失败或未明确重载: response=%+v saves=%d reads=%d", result, len(stub.saves), stub.detailReads)
	}
	encoded, err := json.Marshal(result)
	if err != nil || strings.Contains(string(encoded), privateDetail) || strings.Contains(string(encoded), "不完整数据") {
		t.Fatalf("内部错误或不完整详情泄漏到响应: response=%s err=%v", encoded, err)
	}
	entries := logs.All()
	if len(entries) != 1 || !strings.Contains(entries[0].Message, privateDetail) || !strings.Contains(entries[0].Message, "/setting/website/save") {
		t.Fatalf("保存后回读错误缺少服务器诊断: logs=%+v", entries)
	}
}

// TestWebsiteSaveFailureSkipsReadback 函数说明：实际保存失败继续返回既有错误响应，不回读详情，也不能使用已保存提示掩盖写入失败。
func TestWebsiteSaveFailureSkipsReadback(t *testing.T) {
	stub := &websiteBindingServiceStub{saveError: response.AssertArgumentError.Make("配置参数不合法")}
	result := requestWebsiteSaveWithStub(t, `{"name":"拒绝写入"}`, stub)
	if result.Code != response.AssertArgumentError.Code() || result.Msg != "配置参数不合法" || result.Show || result.HandlerErrorCount == 0 || len(stub.saves) != 1 || stub.detailReads != 0 {
		t.Fatalf("实际保存失败被当作成功或仍进行了回读: response=%+v saves=%d reads=%d", result, len(stub.saves), stub.detailReads)
	}
}
