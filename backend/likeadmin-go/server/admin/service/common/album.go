package common

import (
	"fmt"
	"gorm.io/gorm"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/schemas/resp"
	"likeadmin/config"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/model/common"
	"likeadmin/model/system"
	"likeadmin/util"
	"mime"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type IAlbumService interface {
	AlbumList(page request.PageReq, listReq req.CommonAlbumListReq) (res response.PageResp, e error)
	AlbumRename(id uint, name string) (e error)
	AlbumMetaSave(saveReq req.CommonAlbumMetaSaveReq) (res resp.CommonAlbumListResp, e error)
	AlbumCompressConfig() (res map[string]interface{}, e error)
	AlbumCompressConfigSave(saveReq req.CommonAlbumCompressConfigSaveReq) (e error)
	AlbumMove(ids []uint, cid int) (e error)
	AlbumAdd(addReq req.CommonAlbumAddReq) (res uint, e error)
	AlbumDel(ids []uint) (e error)
	CateList(listReq req.CommonCateListReq) (mapList []interface{}, e error)
	CateAdd(addReq req.CommonCateAddReq) (e error)
	CateRename(id uint, name string) (e error)
	CateDel(id uint) (e error)
}

// NewAlbumService 初始化
func NewAlbumService(db *gorm.DB) IAlbumService {
	return &albumService{db: db}
}

// albumService 相册服务实现类
type albumService struct {
	db *gorm.DB
}

const (
	materialCompressEnabledConfigName     = "imageCompressEnabled"
	materialCompressMinSizeKBConfigName   = "imageCompressMinSizeKB"
	materialCompressJpegQualityConfigName = "imageCompressJpegQuality"
	materialCompressPngLevelConfigName    = "imageCompressPngCompressionLevel"
)

// AlbumList 相册文件列表
func (albSrv albumService) AlbumList(page request.PageReq, listReq req.CommonAlbumListReq) (res response.PageResp, e error) {
	// 分页信息
	limit := page.PageSize
	offset := page.PageSize * (page.PageNo - 1)
	// 查询
	albumModel := albSrv.db.Model(&common.Album{}).Where("is_delete = ?", 0)
	if listReq.Cid > 0 {
		albumModel = albumModel.Where("cid = ?", listReq.Cid)
	}
	name := strings.TrimSpace(listReq.Name)
	if name != "" {
		albumModel = albumModel.Where("name like ?", "%"+name+"%")
	}
	if listReq.Type > 0 {
		albumModel = albumModel.Where("type = ?", listReq.Type)
	}
	if strings.TrimSpace(listReq.BindType) != "" {
		/**
		 * 函数说明：素材列表支持按业务对象类型筛选，便于运营快速定位某类内容的素材。
		 */
		albumModel = albumModel.Where("bind_type = ?", strings.TrimSpace(listReq.BindType))
	}
	if listReq.BindID > 0 {
		/**
		 * 函数说明：素材列表支持按业务对象 ID 精确筛选。
		 */
		albumModel = albumModel.Where("bind_id = ?", listReq.BindID)
	}
	// 总数
	var count int64
	err := albumModel.Count(&count).Error
	if e = response.CheckErr(err, "AlbumList Count err"); e != nil {
		return
	}
	// 数据
	var albums []common.Album
	err = albumModel.Limit(limit).Offset(offset).Order("id desc").Find(&albums).Error
	if e = response.CheckErr(err, "AlbumList Find err"); e != nil {
		return
	}

	/**
	 * 函数说明：素材列表补充媒体库详情字段（上传者、分组、MIME、分辨率、替代文本等），用于后台素材中心右侧参数面板。
	 */
	albumResps := make([]resp.CommonAlbumListResp, 0, len(albums))
	cateNameMap, err := albSrv.queryCateNameMap(albums)
	if e = response.CheckErr(err, "AlbumList queryCateNameMap err"); e != nil {
		return
	}
	uploaderNameMap, err := albSrv.queryUploaderNameMap(albums)
	if e = response.CheckErr(err, "AlbumList queryUploaderNameMap err"); e != nil {
		return
	}
	for _, albumItem := range albums {
		albumResps = append(albumResps, albSrv.buildAlbumListResp(albumItem, cateNameMap, uploaderNameMap))
	}
	return response.PageResp{
		PageNo:   page.PageNo,
		PageSize: page.PageSize,
		Count:    count,
		Lists:    albumResps,
	}, nil
}

// AlbumRename 相册文件重命名
func (albSrv albumService) AlbumRename(id uint, name string) (e error) {
	var album common.Album
	err := albSrv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).First(&album).Error
	if e = response.CheckErrDBNotRecord(err, "文件丢失！"); e != nil {
		return
	}
	if e = response.CheckErr(err, "AlbumRename First err"); e != nil {
		return
	}
	album.Name = name
	err = albSrv.db.Save(&album).Error
	e = response.CheckErr(err, "AlbumRename Save err")
	return
}

// AlbumMetaSave 相册附件元信息保存
func (albSrv albumService) AlbumMetaSave(saveReq req.CommonAlbumMetaSaveReq) (res resp.CommonAlbumListResp, e error) {
	var album common.Album
	err := albSrv.db.Where("id = ? AND is_delete = ?", saveReq.ID, 0).Limit(1).First(&album).Error
	if e = response.CheckErrDBNotRecord(err, "素材不存在或已删除"); e != nil {
		return
	}
	if e = response.CheckErr(err, "AlbumMetaSave First err"); e != nil {
		return
	}
	updateData := map[string]interface{}{
		"title":       strings.TrimSpace(saveReq.Title),
		"alt_text":    strings.TrimSpace(saveReq.AltText),
		"caption":     strings.TrimSpace(saveReq.Caption),
		"description": strings.TrimSpace(saveReq.Description),
		"bind_type":   strings.TrimSpace(saveReq.BindType),
		"bind_id":     saveReq.BindID,
		"bind_title":  strings.TrimSpace(saveReq.BindTitle),
		"bind_url":    strings.TrimSpace(saveReq.BindURL),
		"update_time": time.Now().Unix(),
	}
	if normalizedUri, valid := normalizeAlbumRelativeURI(saveReq.Uri); valid {
		updateData["uri"] = normalizedUri
	}
	err = albSrv.db.Model(&common.Album{}).Where("id = ?", saveReq.ID).Updates(updateData).Error
	if e = response.CheckErr(err, "AlbumMetaSave Updates err"); e != nil {
		return
	}
	err = albSrv.db.Where("id = ?", saveReq.ID).Limit(1).First(&album).Error
	if e = response.CheckErr(err, "AlbumMetaSave Reload err"); e != nil {
		return
	}
	cateNameMap, err := albSrv.queryCateNameMap([]common.Album{album})
	if e = response.CheckErr(err, "AlbumMetaSave queryCateNameMap err"); e != nil {
		return
	}
	uploaderNameMap, err := albSrv.queryUploaderNameMap([]common.Album{album})
	if e = response.CheckErr(err, "AlbumMetaSave queryUploaderNameMap err"); e != nil {
		return
	}
	res = albSrv.buildAlbumListResp(album, cateNameMap, uploaderNameMap)
	return
}

// AlbumCompressConfig 获取素材图片压缩配置
func (albSrv albumService) AlbumCompressConfig() (res map[string]interface{}, e error) {
	configMap, err := util.ConfigUtil.Get(albSrv.db, "material")
	if e = response.CheckErr(err, "AlbumCompressConfig Get err"); e != nil {
		return
	}
	res = map[string]interface{}{
		"enabled":             parseMaterialCompressEnabled(configMap[materialCompressEnabledConfigName]),
		"minSizeKB":           parseMaterialCompressMinSizeKB(configMap[materialCompressMinSizeKBConfigName]),
		"jpegQuality":         parseMaterialCompressJpegQuality(configMap[materialCompressJpegQualityConfigName]),
		"pngCompressionLevel": parseMaterialCompressPngLevel(configMap[materialCompressPngLevelConfigName]),
	}
	return
}

// AlbumCompressConfigSave 保存素材图片压缩配置
func (albSrv albumService) AlbumCompressConfigSave(saveReq req.CommonAlbumCompressConfigSaveReq) (e error) {
	if err := util.ConfigUtil.Set(albSrv.db, "material", materialCompressEnabledConfigName, fmt.Sprintf("%d", saveReq.Enabled)); err != nil {
		return response.CheckErr(err, "AlbumCompressConfigSave Set enabled err")
	}
	if err := util.ConfigUtil.Set(albSrv.db, "material", materialCompressMinSizeKBConfigName, fmt.Sprintf("%d", saveReq.MinSizeKB)); err != nil {
		return response.CheckErr(err, "AlbumCompressConfigSave Set minSizeKB err")
	}
	if err := util.ConfigUtil.Set(albSrv.db, "material", materialCompressJpegQualityConfigName, fmt.Sprintf("%d", saveReq.JpegQuality)); err != nil {
		return response.CheckErr(err, "AlbumCompressConfigSave Set jpegQuality err")
	}
	if err := util.ConfigUtil.Set(albSrv.db, "material", materialCompressPngLevelConfigName, parseMaterialCompressPngLevel(saveReq.PngCompressionLevel)); err != nil {
		return response.CheckErr(err, "AlbumCompressConfigSave Set pngCompressionLevel err")
	}
	return nil
}

// AlbumMove 相册文件移动
func (albSrv albumService) AlbumMove(ids []uint, cid int) (e error) {
	var albums []common.Album
	err := albSrv.db.Where("id in ? AND is_delete = ?", ids, 0).Find(&albums).Error
	if e = response.CheckErr(err, "AlbumMove Find err"); e != nil {
		return
	}
	if len(albums) == 0 {
		return response.AssertArgumentError.Make("文件丢失！")
	}
	if cid > 0 {
		err = albSrv.db.Where("id = ? AND is_delete = ?", cid, 0).Limit(1).First(&common.AlbumCate{}).Error
		if e = response.CheckErrDBNotRecord(err, "类目已不存在！"); e != nil {
			return
		}
		if e = response.CheckErr(err, "AlbumMove First err"); e != nil {
			return
		}
	}
	err = albSrv.db.Model(&common.Album{}).Where("id in ?", ids).UpdateColumn("cid", cid).Error
	e = response.CheckErr(err, "AlbumMove UpdateColumn err")
	return
}

// AlbumAdd 相册文件新增
func (albSrv albumService) AlbumAdd(addReq req.CommonAlbumAddReq) (res uint, e error) {
	var alb common.Album
	//var params map[string]interface{}
	//if err := mapstructure.Decode(params, &alb); err != nil {
	//	core.Logger.Errorf("AlbumAdd Decode err: err=[%+v]", err)
	//	return response.SystemError
	//}
	response.Copy(&alb, addReq)
	err := albSrv.db.Create(&alb).Error
	if e = response.CheckErr(err, "AlbumAdd Create err"); e != nil {
		return
	}
	return alb.ID, nil
}

// AlbumDel 相册文件删除
func (albSrv albumService) AlbumDel(ids []uint) (e error) {
	var albums []common.Album
	err := albSrv.db.Where("id in ? AND is_delete = ?", ids, 0).Find(&albums).Error
	if e = response.CheckErr(err, "AlbumDel Find err"); e != nil {
		return
	}
	if len(albums) == 0 {
		return response.AssertArgumentError.Make("文件丢失！")
	}
	err = albSrv.db.Model(&common.Album{}).Where("id in ?", ids).Updates(
		common.Album{IsDelete: 1, DeleteTime: time.Now().Unix()}).Error
	e = response.CheckErr(err, "AlbumDel UpdateColumn err")
	return
}

/**
 * 函数说明：统一组装素材列表响应结构，补齐素材中心“附件详情面板”所需字段。
 */
func (albSrv albumService) buildAlbumListResp(
	albumItem common.Album,
	cateNameMap map[uint]string,
	uploaderNameMap map[uint]string,
) resp.CommonAlbumListResp {
	respItem := resp.CommonAlbumListResp{}
	response.Copy(&respItem, albumItem)
	respItem.Path = path.Join(config.Config.PublicPrefix, albumItem.Uri)
	respItem.Uri = util.UrlUtil.ToAbsoluteUrl(albumItem.Uri)
	respItem.Size = util.ServerUtil.GetFmtSize(uint64(albumItem.Size))
	respItem.SizeBytes = albumItem.Size
	respItem.FileName = strings.TrimSpace(albumItem.Name)
	respItem.MimeType = resolveAlbumMimeType(albumItem.MimeType, albumItem.Ext, albumItem.Type)
	respItem.CateName = "未分组"
	if cateName, ok := cateNameMap[albumItem.Cid]; ok && strings.TrimSpace(cateName) != "" {
		respItem.CateName = cateName
	}
	respItem.UploadToName = respItem.CateName
	if strings.TrimSpace(respItem.BindTitle) != "" {
		respItem.UploadToName = strings.TrimSpace(respItem.BindTitle)
	}
	respItem.UploaderName = "系统上传"
	if uploaderName, ok := uploaderNameMap[albumItem.Aid]; ok && strings.TrimSpace(uploaderName) != "" {
		respItem.UploaderName = uploaderName
	}
	if strings.TrimSpace(respItem.Title) == "" {
		respItem.Title = respItem.FileName
	}
	width := albumItem.Width
	height := albumItem.Height
	if isImageAlbumType(albumItem.Type) && (width == 0 || height == 0) {
		detectedWidth, detectedHeight := detectImageResolution(albumItem.Uri)
		if detectedWidth > 0 && detectedHeight > 0 {
			width = detectedWidth
			height = detectedHeight
		}
	}
	respItem.Width = width
	respItem.Height = height
	if width > 0 && height > 0 {
		respItem.Resolution = fmt.Sprintf("%d×%d 像素", width, height)
	}
	return respItem
}

/**
 * 函数说明：将后台输入的素材路径统一规整为相对路径，仅接受站内路径，避免写入外链导致素材访问链路异常。
 */
func normalizeAlbumRelativeURI(raw string) (uri string, valid bool) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", false
	}
	normalized := strings.ReplaceAll(trimmed, "\\", "/")
	if strings.Contains(normalized, "://") {
		return "", false
	}
	normalized = strings.TrimPrefix(normalized, config.Config.PublicPrefix)
	normalized = strings.TrimPrefix(normalized, "/")
	normalized = strings.TrimSpace(normalized)
	if normalized == "" {
		return "", false
	}
	return normalized, true
}

/**
 * 函数说明：批量查询素材分类名称，避免列表渲染时对每条记录重复查库。
 */
func (albSrv albumService) queryCateNameMap(albums []common.Album) (map[uint]string, error) {
	cidSet := make(map[uint]struct{})
	for _, albumItem := range albums {
		if albumItem.Cid > 0 {
			cidSet[albumItem.Cid] = struct{}{}
		}
	}
	result := map[uint]string{
		0: "未分组",
	}
	if len(cidSet) == 0 {
		return result, nil
	}
	cateIds := make([]uint, 0, len(cidSet))
	for cateID := range cidSet {
		cateIds = append(cateIds, cateID)
	}
	var cateList []common.AlbumCate
	if err := albSrv.db.Where("id in ? AND is_delete = ?", cateIds, 0).Find(&cateList).Error; err != nil {
		return nil, err
	}
	for _, cateItem := range cateList {
		result[cateItem.ID] = cateItem.Name
	}
	return result, nil
}

/**
 * 函数说明：批量查询素材上传管理员昵称，便于前端显示“上传者”字段。
 */
func (albSrv albumService) queryUploaderNameMap(albums []common.Album) (map[uint]string, error) {
	aidSet := make(map[uint]struct{})
	for _, albumItem := range albums {
		if albumItem.Aid > 0 {
			aidSet[albumItem.Aid] = struct{}{}
		}
	}
	result := map[uint]string{
		0: "系统上传",
	}
	if len(aidSet) == 0 {
		return result, nil
	}
	adminIDs := make([]uint, 0, len(aidSet))
	for adminID := range aidSet {
		adminIDs = append(adminIDs, adminID)
	}
	type adminSimple struct {
		ID       uint
		Nickname string
	}
	var admins []adminSimple
	if err := albSrv.db.Model(&system.SystemAuthAdmin{}).
		Select("id, nickname").
		Where("id in ? AND is_delete = ?", adminIDs, 0).
		Find(&admins).Error; err != nil {
		return nil, err
	}
	for _, adminItem := range admins {
		result[adminItem.ID] = adminItem.Nickname
	}
	return result, nil
}

/**
 * 函数说明：根据扩展名补齐 MIME 类型，兼容历史素材未保存 mime_type 的场景。
 */
func resolveAlbumMimeType(savedMimeType string, ext string, fileType int) string {
	trimmedMimeType := strings.TrimSpace(savedMimeType)
	if trimmedMimeType != "" {
		return trimmedMimeType
	}
	trimmedExt := strings.TrimSpace(ext)
	if trimmedExt != "" {
		mimeTypeByExt := mime.TypeByExtension("." + strings.ToLower(trimmedExt))
		if strings.TrimSpace(mimeTypeByExt) != "" {
			return mimeTypeByExt
		}
	}
	switch fileType {
	case 10, 30:
		return "image/*"
	case 20:
		return "video/*"
	default:
		return "application/octet-stream"
	}
}

/**
 * 函数说明：解析素材压缩开关，默认启用自动压缩。
 */
func parseMaterialCompressEnabled(raw string) int {
	switch strings.TrimSpace(raw) {
	case "0":
		return 0
	default:
		return 1
	}
}

/**
 * 函数说明：解析最小触发压缩体积（KB），默认 300KB。
 */
func parseMaterialCompressMinSizeKB(raw string) int {
	return parseMaterialCompressInt(raw, 300, 0, 102400)
}

/**
 * 函数说明：解析 JPEG 压缩质量，默认 82。
 */
func parseMaterialCompressJpegQuality(raw string) int {
	return parseMaterialCompressInt(raw, 82, 40, 100)
}

/**
 * 函数说明：解析 PNG 压缩级别，未命中时回退 default。
 */
func parseMaterialCompressPngLevel(raw string) string {
	switch strings.TrimSpace(strings.ToLower(raw)) {
	case "speed":
		return "speed"
	case "best":
		return "best"
	default:
		return "default"
	}
}

/**
 * 函数说明：将图片上传配置中的整数字段做边界保护，避免异常配置导致上传链路不可用。
 */
func parseMaterialCompressInt(raw string, defaultValue int, minValue int, maxValue int) int {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(trimmed)
	if err != nil {
		return defaultValue
	}
	if value < minValue {
		return minValue
	}
	if value > maxValue {
		return maxValue
	}
	return value
}

/**
 * 函数说明：图片素材优先读取本地文件分辨率，兼容历史数据未写入宽高字段。
 */
func detectImageResolution(uri string) (width uint, height uint) {
	trimmedUri := strings.TrimSpace(uri)
	if trimmedUri == "" {
		return 0, 0
	}
	relativeURI := strings.TrimPrefix(trimmedUri, "/")
	fileAbsPath := filepath.Join(config.Config.UploadDirectory, filepath.FromSlash(relativeURI))
	fileInfo, err := os.Stat(fileAbsPath)
	if err != nil || fileInfo.IsDir() {
		return 0, 0
	}
	file, err := os.Open(fileAbsPath)
	if err != nil {
		return 0, 0
	}
	defer file.Close()
	cfg, _, err := image.DecodeConfig(file)
	if err != nil {
		return 0, 0
	}
	if cfg.Width <= 0 || cfg.Height <= 0 {
		return 0, 0
	}
	return uint(cfg.Width), uint(cfg.Height)
}

/**
 * 函数说明：仅图片/图标素材展示分辨率，视频素材不参与该字段计算。
 */
func isImageAlbumType(fileType int) bool {
	return fileType == 10 || fileType == 30
}

// CateList 相册分类列表
func (albSrv albumService) CateList(listReq req.CommonCateListReq) (mapList []interface{}, e error) {
	var cates []common.AlbumCate
	cateModel := albSrv.db.Where("is_delete = ?", 0).Order("id desc")
	if listReq.Type > 0 {
		cateModel = cateModel.Where("type = ?", listReq.Type)
	}
	name := strings.TrimSpace(listReq.Name)
	if name != "" {
		cateModel = cateModel.Where("name like ?", "%"+name+"%")
	}
	err := cateModel.Find(&cates).Error
	if e = response.CheckErr(err, "CateList Find err"); e != nil {
		return
	}
	cateResps := []resp.CommonCateListResp{}
	response.Copy(&cateResps, cates)
	return util.ArrayUtil.ListToTree(
		util.ConvertUtil.StructsToMaps(cateResps), "id", "pid", "children"), nil
}

// CateAdd 分类新增
func (albSrv albumService) CateAdd(addReq req.CommonCateAddReq) (e error) {
	var cate common.AlbumCate
	response.Copy(&cate, addReq)
	err := albSrv.db.Create(&cate).Error
	e = response.CheckErr(err, "CateAdd Create err")
	return
}

// CateRename 分类重命名
func (albSrv albumService) CateRename(id uint, name string) (e error) {
	var cate common.AlbumCate
	err := albSrv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).First(&cate).Error
	if e = response.CheckErrDBNotRecord(err, "分类已不存在！"); e != nil {
		return
	}
	if e = response.CheckErr(err, "CateRename First err"); e != nil {
		return
	}
	cate.Name = name
	err = albSrv.db.Save(&cate).Error
	e = response.CheckErr(err, "CateRename Save err")
	return
}

// CateDel 分类删除
func (albSrv albumService) CateDel(id uint) (e error) {
	var cate common.AlbumCate
	err := albSrv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).First(&cate).Error
	if e = response.CheckErrDBNotRecord(err, "分类已不存在！"); e != nil {
		return
	}
	if e = response.CheckErr(err, "CateDel First err"); e != nil {
		return
	}
	r := albSrv.db.Where("cid = ? AND is_delete = ?", id, 0).Limit(1).Find(&common.Album{})
	if e = response.CheckErr(r.Error, "CateDel Find err"); e != nil {
		return
	}
	if r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("当前分类正被使用中,不能删除！")
	}
	cate.IsDelete = 1
	cate.DeleteTime = time.Now().Unix()
	err = albSrv.db.Save(&cate).Error
	e = response.CheckErr(err, "CateDel Save err")
	return
}
