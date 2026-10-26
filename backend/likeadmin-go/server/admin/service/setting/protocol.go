package setting

import (
	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	"likeadmin/core/response"
	"likeadmin/util"
)

type ISettingProtocolService interface {
	Detail() (res map[string]interface{}, e error)
	Save(pReq req.SettingProtocolReq) (e error)
}

// NewSettingProtocolService 初始化
func NewSettingProtocolService(db *gorm.DB) ISettingProtocolService {
	return &settingProtocolService{db: db}
}

// settingProtocolService 政策协议服务实现类
type settingProtocolService struct {
	db *gorm.DB
}

// Detail 获取政策协议信息
func (cSrv settingProtocolService) Detail() (res map[string]interface{}, e error) {
	defaultVal := `{"name":"","content":""}`
	json, err := util.ConfigUtil.GetVal(cSrv.db, "protocol", "service", defaultVal)
	if e = response.CheckErr(err, "Detail GetVal service err"); e != nil {
		return
	}
	var service map[string]interface{}
	if e = response.CheckErr(util.ToolsUtil.JsonToObj(json, &service), "Detail JsonToObj service err"); e != nil {
		return
	}
	json, err = util.ConfigUtil.GetVal(cSrv.db, "protocol", "privacy", defaultVal)
	if e = response.CheckErr(err, "Detail GetVal privacy err"); e != nil {
		return
	}
	var privacy map[string]interface{}
	if e = response.CheckErr(util.ToolsUtil.JsonToObj(json, &privacy), "Detail JsonToObj privacy err"); e != nil {
		return
	}
	return map[string]interface{}{
		"service": service,
		"privacy": privacy,
	}, nil
}

// Save 函数说明：在同一事务内保存两项协议，任何写入失败均回滚，保留原始正文与空白。
func (cSrv settingProtocolService) Save(pReq req.SettingProtocolReq) (e error) {
	serviceJson, err := util.ToolsUtil.ObjToJson(pReq.Service)
	if e = response.CheckErr(err, "Save ObjToJson service err"); e != nil {
		return
	}
	privacyJson, err := util.ToolsUtil.ObjToJson(pReq.Privacy)
	if e = response.CheckErr(err, "Save ObjToJson privacy err"); e != nil {
		return
	}
	return cSrv.db.Transaction(func(tx *gorm.DB) error {
		if err := util.ConfigUtil.Set(tx, "protocol", "service", serviceJson); err != nil {
			return response.CheckErr(err, "Save Set service err")
		}
		return response.CheckErr(util.ConfigUtil.Set(tx, "protocol", "privacy", privacyJson), "Save Set privacy err")
	})
}
