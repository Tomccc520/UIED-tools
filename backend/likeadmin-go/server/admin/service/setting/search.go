package setting

import (
	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	"likeadmin/core/response"
	"likeadmin/util"
	"strconv"
	"strings"
)

const (
	searchConfigType           = "search"
	searchConfigIsHotSearchKey = "isHotSearch"
	searchConfigListKey        = "list"
)

type ISettingSearchService interface {
	Detail() (res map[string]interface{}, e error)
	Save(searchReq req.SettingSearchReq) (e error)
}

// NewSettingSearchService 初始化
func NewSettingSearchService(db *gorm.DB) ISettingSearchService {
	return &settingSearchService{db: db}
}

// settingSearchService 搜索设置服务
type settingSearchService struct {
	db *gorm.DB
}

/**
 * 函数说明：清洗热门搜索列表，去掉空关键词并规范排序值。
 */
func normalizeSearchItems(items []req.SettingSearchItemReq) []req.SettingSearchItemReq {
	result := make([]req.SettingSearchItemReq, 0, len(items))
	for _, item := range items {
		name := strings.TrimSpace(item.Name)
		if name == "" {
			continue
		}
		sort := item.Sort
		if sort < 0 {
			sort = 0
		}
		result = append(result, req.SettingSearchItemReq{
			Name: name,
			Sort: sort,
		})
	}
	return result
}

// Detail 获取搜索设置
func (sSrv settingSearchService) Detail() (res map[string]interface{}, e error) {
	isHotSearchRaw, err := util.ConfigUtil.GetVal(sSrv.db, searchConfigType, searchConfigIsHotSearchKey, "1")
	if e = response.CheckErr(err, "Detail Get isHotSearch err"); e != nil {
		return
	}
	isHotSearch, _ := strconv.Atoi(strings.TrimSpace(isHotSearchRaw))
	if isHotSearch != 0 && isHotSearch != 1 {
		isHotSearch = 1
	}

	listRaw, err := util.ConfigUtil.GetVal(sSrv.db, searchConfigType, searchConfigListKey, "[]")
	if e = response.CheckErr(err, "Detail Get list err"); e != nil {
		return
	}

	list := make([]req.SettingSearchItemReq, 0)
	if strings.TrimSpace(listRaw) != "" {
		if parseErr := util.ToolsUtil.JsonToObj(listRaw, &list); parseErr != nil {
			list = make([]req.SettingSearchItemReq, 0)
		}
	}

	return map[string]interface{}{
		"isHotSearch": isHotSearch,
		"list":        list,
	}, nil
}

// Save 函数说明：在同一事务内保存热门搜索状态与词条，任一写入失败则整体回滚。
func (sSrv settingSearchService) Save(searchReq req.SettingSearchReq) (e error) {
	isHotSearch := 0
	if searchReq.IsHotSearch == 1 {
		isHotSearch = 1
	}

	cleanList := normalizeSearchItems(searchReq.List)
	listJSON, err := util.ToolsUtil.ObjToJson(cleanList)
	if e = response.CheckErr(err, "Save ObjToJson list err"); e != nil {
		return
	}

	return sSrv.db.Transaction(func(tx *gorm.DB) error {
		if err := util.ConfigUtil.Set(tx, searchConfigType, searchConfigIsHotSearchKey, strconv.Itoa(isHotSearch)); err != nil {
			return response.CheckErr(err, "Save Set isHotSearch err")
		}
		return response.CheckErr(util.ConfigUtil.Set(tx, searchConfigType, searchConfigListKey, listJSON), "Save Set list err")
	})
}
