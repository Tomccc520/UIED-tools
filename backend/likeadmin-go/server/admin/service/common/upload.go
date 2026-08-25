package common

import (
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/jpeg"
	"image/png"
	_ "image/png"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/schemas/resp"
	"likeadmin/config"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/plugin"
	"likeadmin/util"
	"mime"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

type IUploadService interface {
	UploadImage(file *multipart.FileHeader, cid uint, aid uint, materialType int) (res resp.CommonUploadFileResp, e error)
	UploadVideo(file *multipart.FileHeader, cid uint, aid uint) (res resp.CommonUploadFileResp, e error)
}

// NewUploadService 初始化
func NewUploadService(albSrv IAlbumService) IUploadService {
	return &uploadService{albSrv}
}

// uploadService 上传服务实现类
type uploadService struct {
	albSrv IAlbumService
}

/**
 * 函数说明：上传图片时支持指定素材类型（10=图片，30=图标），用于区分图标库与素材中心数据池。
 */
func (upSrv uploadService) UploadImage(file *multipart.FileHeader, cid uint, aid uint, materialType int) (res resp.CommonUploadFileResp, e error) {
	folder, fileType := resolveImageUploadTarget(materialType)
	return upSrv.uploadFile(file, folder, fileType, cid, aid)
}

// UploadVideo 上传视频
func (upSrv uploadService) UploadVideo(file *multipart.FileHeader, cid uint, aid uint) (res resp.CommonUploadFileResp, e error) {
	return upSrv.uploadFile(file, "video", 20, cid, aid)
}

/**
 * 函数说明：规范化图片上传目标，避免非法类型写入，默认仍归档到图片素材池。
 */
func resolveImageUploadTarget(materialType int) (folder string, fileType int) {
	if materialType == 30 {
		return "icons", 30
	}
	return "image", 10
}

// uploadFile 上传文件
func (upSrv uploadService) uploadFile(file *multipart.FileHeader, folder string, fileType int, cid uint, aid uint) (res resp.CommonUploadFileResp, e error) {
	var upRes *plugin.UploadFile
	if upRes, e = plugin.StorageDriver.Upload(file, folder, fileType); e != nil {
		return
	}
	tryCompressUploadedImage(upRes, fileType)
	var addReq req.CommonAlbumAddReq
	response.Copy(&addReq, upRes)
	addReq.Aid = aid
	addReq.Cid = cid
	/**
	 * 函数说明：上传后补齐素材元信息（MIME、分辨率、标题），方便素材中心直接展示附件参数。
	 */
	fillAlbumUploadMeta(&addReq, file, fileType)
	var albumId uint
	if albumId, e = upSrv.albSrv.AlbumAdd(addReq); e != nil {
		return
	}
	response.Copy(&res, addReq)
	res.ID = albumId
	res.Path = upRes.Path
	return res, nil
}

type uploadImageCompressConfig struct {
	Enabled             bool
	MinSizeBytes        int64
	JpegQuality         int
	PngCompressionLevel string
}

/**
 * 函数说明：根据上传文件头信息补齐素材表需要的基础元信息。
 */
func fillAlbumUploadMeta(addReq *req.CommonAlbumAddReq, file *multipart.FileHeader, fileType int) {
	if addReq == nil || file == nil {
		return
	}
	trimmedName := strings.TrimSpace(addReq.Name)
	addReq.Title = trimmedName
	addReq.MimeType = resolveUploadMimeType(addReq.Ext, fileType)
	if fileType != 10 && fileType != 30 {
		return
	}
	width, height := detectUploadImageResolution(file)
	addReq.Width = width
	addReq.Height = height
}

/**
 * 函数说明：优先通过扩展名推断 MIME 类型，兜底按素材类型返回通用值。
 */
func resolveUploadMimeType(ext string, fileType int) string {
	trimmedExt := strings.TrimSpace(ext)
	if trimmedExt != "" {
		mimeType := mime.TypeByExtension("." + strings.ToLower(trimmedExt))
		if strings.TrimSpace(mimeType) != "" {
			return mimeType
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
 * 函数说明：在不落盘二次读取的前提下，从上传流中解析图片分辨率。
 */
func detectUploadImageResolution(file *multipart.FileHeader) (width uint, height uint) {
	src, err := file.Open()
	if err != nil {
		return 0, 0
	}
	defer src.Close()
	cfg, _, err := image.DecodeConfig(src)
	if err != nil || cfg.Width <= 0 || cfg.Height <= 0 {
		return 0, 0
	}
	return uint(cfg.Width), uint(cfg.Height)
}

/**
 * 函数说明：按后台“素材压缩配置”对已上传图片进行自动压缩，压缩失败时仅记录日志不影响上传流程。
 */
func tryCompressUploadedImage(upRes *plugin.UploadFile, fileType int) {
	if upRes == nil {
		return
	}
	if fileType != 10 && fileType != 30 {
		return
	}
	compressConfig := loadUploadImageCompressConfig()
	if !compressConfig.Enabled {
		return
	}
	if upRes.Size <= 0 || upRes.Size < compressConfig.MinSizeBytes {
		return
	}
	fileExt := strings.ToLower(strings.TrimSpace(upRes.Ext))
	if fileExt != "jpg" && fileExt != "jpeg" && fileExt != "png" {
		return
	}
	relativePath := strings.TrimPrefix(strings.TrimSpace(upRes.Uri), "/")
	if relativePath == "" {
		return
	}
	fileAbsPath := filepath.Join(config.Config.UploadDirectory, filepath.FromSlash(relativePath))
	originInfo, err := os.Stat(fileAbsPath)
	if err != nil || originInfo.IsDir() {
		return
	}
	var compressErr error
	switch fileExt {
	case "jpg", "jpeg":
		compressErr = compressJpegFile(fileAbsPath, compressConfig.JpegQuality)
	case "png":
		compressErr = compressPngFile(fileAbsPath, compressConfig.PngCompressionLevel)
	}
	if compressErr != nil {
		core.Logger.Warnf("tryCompressUploadedImage compress err: file=%s err=%v", fileAbsPath, compressErr)
		return
	}
	newInfo, statErr := os.Stat(fileAbsPath)
	if statErr != nil || newInfo.IsDir() {
		return
	}
	upRes.Size = newInfo.Size()
}

/**
 * 函数说明：读取素材图片压缩配置，配置缺失时使用安全默认值。
 */
func loadUploadImageCompressConfig() uploadImageCompressConfig {
	defaultConfig := uploadImageCompressConfig{
		Enabled:             true,
		MinSizeBytes:        300 * 1024,
		JpegQuality:         82,
		PngCompressionLevel: "default",
	}
	configMap, err := util.ConfigUtil.Get(core.GetDB(), "material")
	if err != nil {
		return defaultConfig
	}
	enabled := strings.TrimSpace(configMap[materialCompressEnabledConfigName]) != "0"
	minSizeKB := parseMaterialCompressInt(configMap[materialCompressMinSizeKBConfigName], 300, 0, 102400)
	jpegQuality := parseMaterialCompressInt(configMap[materialCompressJpegQualityConfigName], 82, 40, 100)
	pngLevel := parseMaterialCompressPngLevel(configMap[materialCompressPngLevelConfigName])
	return uploadImageCompressConfig{
		Enabled:             enabled,
		MinSizeBytes:        int64(minSizeKB) * 1024,
		JpegQuality:         jpegQuality,
		PngCompressionLevel: pngLevel,
	}
}

/**
 * 函数说明：按 JPEG 质量参数重编码图片，仅当新文件更小时替换原图。
 */
func compressJpegFile(filePath string, quality int) error {
	inputFile, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer inputFile.Close()
	sourceImage, _, err := image.Decode(inputFile)
	if err != nil {
		return err
	}
	return encodeImageWithFallback(filePath, func(tempFile *os.File) error {
		return jpeg.Encode(tempFile, sourceImage, &jpeg.Options{Quality: quality})
	})
}

/**
 * 函数说明：按 PNG 压缩级别重编码图片，仅当新文件更小时替换原图。
 */
func compressPngFile(filePath string, level string) error {
	inputFile, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer inputFile.Close()
	sourceImage, _, err := image.Decode(inputFile)
	if err != nil {
		return err
	}
	encoder := png.Encoder{CompressionLevel: png.DefaultCompression}
	switch strings.TrimSpace(strings.ToLower(level)) {
	case "speed":
		encoder.CompressionLevel = png.BestSpeed
	case "best":
		encoder.CompressionLevel = png.BestCompression
	}
	return encodeImageWithFallback(filePath, func(tempFile *os.File) error {
		return encoder.Encode(tempFile, sourceImage)
	})
}

/**
 * 函数说明：统一处理临时文件写入与“仅保留更小文件”的回写逻辑。
 */
func encodeImageWithFallback(filePath string, encodeFn func(tempFile *os.File) error) error {
	originInfo, err := os.Stat(filePath)
	if err != nil {
		return err
	}
	tempPath := filePath + ".compressing"
	tempFile, err := os.Create(tempPath)
	if err != nil {
		return err
	}
	encodeErr := encodeFn(tempFile)
	closeErr := tempFile.Close()
	if encodeErr != nil {
		_ = os.Remove(tempPath)
		return encodeErr
	}
	if closeErr != nil {
		_ = os.Remove(tempPath)
		return closeErr
	}
	newInfo, err := os.Stat(tempPath)
	if err != nil {
		_ = os.Remove(tempPath)
		return err
	}
	if newInfo.Size() >= originInfo.Size() {
		_ = os.Remove(tempPath)
		return nil
	}
	if err = os.Rename(tempPath, filePath); err != nil {
		_ = os.Remove(tempPath)
		return err
	}
	return nil
}
