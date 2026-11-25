package setting

import (
	"fmt"
	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	"likeadmin/core/response"
	"likeadmin/util"
)

type ISettingStorageService interface {
	List() ([]map[string]interface{}, error)
	Detail(alias string) (res map[string]interface{}, e error)
	Edit(editReq req.SettingStorageEditReq) (e error)
	Change(alias string, status int) (e error)
}

// NewSettingStorageService 初始化
func NewSettingStorageService(db *gorm.DB) ISettingStorageService {
	return &settingStorageService{db: db}
}

// settingStorageService 存储配置服务实现类
type settingStorageService struct {
	db *gorm.DB
}

// List 返回上传驱动实际支持的引擎，每次分配独立的列表行供请求读取。
func (sSrv settingStorageService) List() ([]map[string]interface{}, error) {
	return []map[string]interface{}{
		{"name": "本地存储", "alias": "local", "describe": "存储在本地服务器", "status": 1},
	}, nil
}

// Detail 存储详情
func (sSrv settingStorageService) Detail(alias string) (res map[string]interface{}, e error) {
	// TODO: engine默认local
	engine := "local"
	cnf, err := util.ConfigUtil.GetMap(sSrv.db, "storage", alias)
	if e = response.CheckErr(err, "Detail GetMap err"); e != nil {
		return
	}
	status := 0
	if engine == alias {
		status = 1
	}
	return map[string]interface{}{
		"name":   cnf["name"],
		"alias":  alias,
		"status": status,
	}, nil
}

// validateStorageSelection 校验当前上传驱动能实际执行的设置，拒绝停用唯一可用引擎。
func validateStorageSelection(alias string, status int) error {
	if alias != "local" {
		return response.Failed.Make(fmt.Sprintf("engine:%s 暂时不支持", alias))
	}
	if status != 1 {
		return response.Failed.Make("本地存储是当前唯一可用的上传引擎，无法关闭")
	}
	return nil
}

// Edit 兼容已有调用方的本地存储启用请求，同一事务保存引擎信息和默认选择。
func (sSrv settingStorageService) Edit(editReq req.SettingStorageEditReq) error {
	if err := validateStorageSelection(editReq.Alias, editReq.Status); err != nil {
		return err
	}
	return sSrv.db.Transaction(func(tx *gorm.DB) error {
		if err := util.ConfigUtil.Set(tx, "storage", "local", `{"name":"本地存储"}`); err != nil {
			return response.CheckErr(err, "Edit Set alias err")
		}
		return response.CheckErr(util.ConfigUtil.Set(tx, "storage", "default", "local"), "Edit Set default err")
	})
}

// Change 保存经过校验的默认引擎，并向调用方返回实际写入结果。
func (sSrv settingStorageService) Change(alias string, status int) error {
	if err := validateStorageSelection(alias, status); err != nil {
		return err
	}
	return response.CheckErr(util.ConfigUtil.Set(sSrv.db, "storage", "default", alias), "Change Set default err")
}
