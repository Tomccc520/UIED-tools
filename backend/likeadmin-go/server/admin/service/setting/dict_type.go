package setting

import (
	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/schemas/resp"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/model/setting"
	"strings"
	"time"
)

type ISettingDictTypeService interface {
	All() (res []resp.SettingDictTypeResp, e error)
	List(page request.PageReq, listReq req.SettingDictTypeListReq) (res response.PageResp, e error)
	Detail(id uint) (res resp.SettingDictTypeResp, e error)
	Add(addReq req.SettingDictTypeAddReq) (e error)
	Edit(editReq req.SettingDictTypeEditReq) (e error)
	Del(delReq req.SettingDictTypeDelReq) (e error)
}

// NewSettingDictTypeService 初始化
func NewSettingDictTypeService(db *gorm.DB) ISettingDictTypeService {
	return &settingDictTypeService{db: db}
}

// settingDictTypeService 字典类型服务实现类
type settingDictTypeService struct {
	db *gorm.DB
}

// All 字典类型所有
func (dtSrv settingDictTypeService) All() (res []resp.SettingDictTypeResp, e error) {
	var dictTypes []setting.DictType
	err := dtSrv.db.Where("is_delete = ?", 0).Order("id desc").Find(&dictTypes).Error
	if e = response.CheckErr(err, "All Find err"); e != nil {
		return
	}
	res = []resp.SettingDictTypeResp{}
	response.Copy(&res, dictTypes)
	return
}

// List 字典类型列表
func (dtSrv settingDictTypeService) List(page request.PageReq, listReq req.SettingDictTypeListReq) (res response.PageResp, e error) {
	limit := page.PageSize
	offset := page.PageSize * (page.PageNo - 1)
	dtModel := dtSrv.db.Model(&setting.DictType{}).Where("is_delete = ?", 0)
	dictName := strings.TrimSpace(listReq.DictName)
	dictType := strings.TrimSpace(listReq.DictType)
	if dictName != "" {
		dtModel = dtModel.Where("dict_name like ?", "%"+dictName+"%")
	}
	if dictType != "" {
		dtModel = dtModel.Where("dict_type like ?", "%"+dictType+"%")
	}
	if listReq.DictStatus >= 0 {
		dtModel = dtModel.Where("dict_status = ?", listReq.DictStatus)
	}
	var count int64
	err := dtModel.Count(&count).Error
	if e = response.CheckErr(err, "List Count err"); e != nil {
		return
	}
	var dts []setting.DictType
	err = dtModel.Limit(limit).Offset(offset).Order("id desc").Find(&dts).Error
	if e = response.CheckErr(err, "List Find err"); e != nil {
		return
	}
	dtResp := []resp.SettingDictTypeResp{}
	response.Copy(&dtResp, dts)
	return response.PageResp{
		PageNo:   page.PageNo,
		PageSize: page.PageSize,
		Count:    count,
		Lists:    dtResp,
	}, nil
}

// Detail 字典类型详情
func (dtSrv settingDictTypeService) Detail(id uint) (res resp.SettingDictTypeResp, e error) {
	var dt setting.DictType
	err := dtSrv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).First(&dt).Error
	if e = response.CheckErrDBNotRecord(err, "字典类型不存在！"); e != nil {
		return
	}
	if e = response.CheckErr(err, "Detail First err"); e != nil {
		return
	}
	response.Copy(&res, dt)
	return
}

// readDictTypeStatus 校验并读取显式提交的字典状态，合法零值不会被当作缺失。
func readDictTypeStatus(value *int8) (uint8, error) {
	if value == nil || (*value != 0 && *value != 1) {
		return 0, response.AssertArgumentError.Make("字典状态必须为 0 或 1")
	}
	return uint8(*value), nil
}

// Add 新增字典类型，显式列值确保停用状态不会被 GORM 的默认值 1 替换。
func (dtSrv settingDictTypeService) Add(addReq req.SettingDictTypeAddReq) (e error) {
	status, err := readDictTypeStatus(addReq.DictStatus)
	if err != nil {
		return err
	}
	if r := dtSrv.db.Where("dict_name = ? AND is_delete = ?", addReq.DictName, 0).Limit(1).First(&setting.DictType{}); r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("字典名称已存在！")
	}
	if r := dtSrv.db.Where("dict_type = ? AND is_delete = ?", addReq.DictType, 0).Limit(1).First(&setting.DictType{}); r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("字典类型已存在！")
	}
	now := time.Now().Unix()
	values := map[string]interface{}{
		"dict_name": addReq.DictName, "dict_type": addReq.DictType, "dict_remark": addReq.DictRemark,
		"dict_status": status, "create_time": now, "update_time": now,
	}
	err = dtSrv.db.Model(&setting.DictType{}).Create(values).Error
	e = response.CheckErr(err, "Add Create err")
	return
}

// Edit 编辑字典类型，状态经过显式校验和解引用后按原有保存流程写入。
func (dtSrv settingDictTypeService) Edit(editReq req.SettingDictTypeEditReq) (e error) {
	status, err := readDictTypeStatus(editReq.DictStatus)
	if err != nil {
		return err
	}
	err = dtSrv.db.Where("id = ? AND is_delete = ?", editReq.ID, 0).Limit(1).First(&setting.DictType{}).Error
	if e = response.CheckErrDBNotRecord(err, "字典类型不存在！"); e != nil {
		return
	}
	if e = response.CheckErr(err, "Edit First err"); e != nil {
		return
	}
	if r := dtSrv.db.Where("id != ? AND dict_name = ? AND is_delete = ?", editReq.ID, editReq.DictName, 0).Limit(1).First(&setting.DictType{}); r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("字典名称已存在！")
	}
	if r := dtSrv.db.Where("id != ? AND dict_type = ? AND is_delete = ?", editReq.ID, editReq.DictType, 0).Limit(1).First(&setting.DictType{}); r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("字典类型已存在！")
	}
	dt := setting.DictType{ID: editReq.ID, DictName: editReq.DictName, DictType: editReq.DictType, DictRemark: editReq.DictRemark, DictStatus: status}
	err = dtSrv.db.Save(&dt).Error
	e = response.CheckErr(err, "Edit Save err")
	return
}

// Del 字典类型删除
func (dtSrv settingDictTypeService) Del(delReq req.SettingDictTypeDelReq) (e error) {
	err := dtSrv.db.Model(&setting.DictType{}).Where("id IN ?", delReq.Ids).Updates(
		setting.DictType{IsDelete: 1, DeleteTime: time.Now().Unix()}).Error
	return response.CheckErr(err, "Del Update err")
}
