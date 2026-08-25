package util

import (
	"gorm.io/gorm"
	"likeadmin/model/system"
)

var ConfigUtil = configUtil{}

// convertUtil 数据库配置操作工具
type configUtil struct{}

// Get 根据类型和名称获取配置字典
func (cu configUtil) Get(db *gorm.DB, cnfType string, names ...string) (data map[string]string, err error) {
	chain := db.Where("type = ?", cnfType)
	if len(names) > 0 {
		chain = chain.Where("name = ?", names[0])
	}
	var configs []system.SystemConfig
	err = chain.Order("id ASC").Find(&configs).Error
	if err != nil {
		return nil, err
	}
	data = make(map[string]string)
	for i := 0; i < len(configs); i++ {
		data[configs[i].Name] = configs[i].Value
	}
	return data, nil
}

// GetVal 根据类型和名称获取配置值
func (cu configUtil) GetVal(db *gorm.DB, cnfType string, name string, defaultVal string) (data string, err error) {
	config, err := cu.Get(db, cnfType, name)
	if err != nil {
		return data, err
	}
	data, ok := config[name]
	if !ok {
		data = defaultVal
	}
	return data, nil
}

// GetMap 根据类型和名称获取配置值(Json字符串转dict)
func (cu configUtil) GetMap(db *gorm.DB, cnfType string, name string) (data map[string]string, err error) {
	val, err := cu.GetVal(db, cnfType, name, "")
	if err != nil {
		return data, err
	}
	if val == "" {
		return map[string]string{}, nil
	}
	err = ToolsUtil.JsonToObj(val, &data)
	return data, err
}

// Set 设置配置的值
func (cu configUtil) Set(db *gorm.DB, cnfType string, name string, val string) (err error) {
	/**
	 * 函数说明：先更新同键所有配置行（兼容历史重复脏数据），若不存在再插入新记录。
	 */
	updateResult := db.Model(&system.SystemConfig{}).
		Where("type = ? AND name = ?", cnfType, name).
		Update("value", val)
	if updateResult.Error != nil {
		return updateResult.Error
	}
	if updateResult.RowsAffected > 0 {
		return nil
	}

	config := system.SystemConfig{
		Type:  cnfType,
		Name:  name,
		Value: val,
	}
	if err = db.Create(&config).Error; err != nil {
		return err
	}
	return nil
}
