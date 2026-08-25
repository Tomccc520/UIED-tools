/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */
package common

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"likeadmin/core/response"
)

const (
	VideoCompressMaxFileSize      int64   = 220 * 1024 * 1024
	videoCompressKeepOriginalRate float64 = 0.98
)

var videoCompressSemaphore = make(chan struct{}, 1)

// VideoCompressResult 视频压缩结果，Cleanup 必须在响应文件发送完成后调用。
type VideoCompressResult struct {
	Path         string
	FileName     string
	ContentType  string
	OriginalSize int64
	OutputSize   int64
	Elapsed      time.Duration
	Compressed   bool
	Cleanup      func()
}

// VideoCompressConfig 前台可读的视频压缩能力配置。
type VideoCompressConfig struct {
	Available     bool   `json:"available"`
	MaxSizeMB     int64  `json:"maxSizeMB"`
	OutputFormat  string `json:"outputFormat"`
	VideoCodec    string `json:"videoCodec"`
	AudioCodec    string `json:"audioCodec"`
	MaxResolution int    `json:"maxResolution"`
	MaxFrameRate  int    `json:"maxFrameRate"`
	CRF           int    `json:"crf"`
	AudioBitrate  string `json:"audioBitrate"`
	Concurrency   int    `json:"concurrency"`
}

// IVideoCompressService 定义前台视频压缩服务能力。
type IVideoCompressService interface {
	Config() VideoCompressConfig
	Compress(ctx context.Context, file *multipart.FileHeader) (VideoCompressResult, error)
}

type videoCompressService struct{}

// NewVideoCompressService 初始化视频压缩服务。
func NewVideoCompressService() IVideoCompressService {
	return &videoCompressService{}
}

// Config 返回 FFmpeg 可用状态和固定压缩参数。
func (videoCompressService) Config() VideoCompressConfig {
	_, err := exec.LookPath("ffmpeg")
	return VideoCompressConfig{
		Available:     err == nil,
		MaxSizeMB:     VideoCompressMaxFileSize / 1024 / 1024,
		OutputFormat:  "MP4",
		VideoCodec:    "H.264",
		AudioCodec:    "AAC",
		MaxResolution: 1920,
		MaxFrameRate:  30,
		CRF:           28,
		AudioBitrate:  "128K",
		Concurrency:   1,
	}
}

// Compress 将上传视频串行转码为 H.264 MP4；体积无明显下降时返回原视频。
func (videoCompressService) Compress(ctx context.Context, file *multipart.FileHeader) (VideoCompressResult, error) {
	if err := validateVideoCompressFile(file); err != nil {
		return VideoCompressResult{}, err
	}
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return VideoCompressResult{}, response.SystemError.Make("服务器未安装 FFmpeg，请先执行依赖安装脚本")
	}

	select {
	case videoCompressSemaphore <- struct{}{}:
		defer func() { <-videoCompressSemaphore }()
	case <-ctx.Done():
		return VideoCompressResult{}, response.SystemError.Make("视频压缩任务已取消")
	}

	tempDir, err := os.MkdirTemp("", "uied-video-compress-*")
	if err != nil {
		return VideoCompressResult{}, response.SystemError.Make("无法创建视频转码临时目录")
	}
	cleanup := func() { _ = os.RemoveAll(tempDir) }

	inputExt := strings.ToLower(filepath.Ext(file.Filename))
	inputPath := filepath.Join(tempDir, "source"+inputExt)
	if err := copyMultipartFile(file, inputPath); err != nil {
		cleanup()
		return VideoCompressResult{}, response.SystemError.Make("上传视频写入临时文件失败")
	}

	outputPath := filepath.Join(tempDir, "compressed.mp4")
	startedAt := time.Now()
	command := exec.CommandContext(ctx, "ffmpeg", buildVideoCompressArgs(inputPath, outputPath)...)
	var commandLog bytes.Buffer
	command.Stdout = &commandLog
	command.Stderr = &commandLog
	if err := command.Run(); err != nil {
		cleanup()
		return VideoCompressResult{}, response.SystemError.Make(buildVideoCompressError(commandLog.String(), err))
	}

	outputInfo, err := os.Stat(outputPath)
	if err != nil || outputInfo.Size() <= 0 {
		cleanup()
		return VideoCompressResult{}, response.SystemError.Make("FFmpeg 未生成有效的视频文件")
	}

	result := VideoCompressResult{
		Path:         outputPath,
		FileName:     buildCompressedVideoName(file.Filename),
		ContentType:  "video/mp4",
		OriginalSize: file.Size,
		OutputSize:   outputInfo.Size(),
		Elapsed:      time.Since(startedAt),
		Compressed:   true,
		Cleanup:      cleanup,
	}
	if shouldKeepOriginalVideo(file.Size, outputInfo.Size()) {
		result.Path = inputPath
		result.FileName = filepath.Base(file.Filename)
		result.ContentType = resolveVideoContentType(inputExt)
		result.OutputSize = file.Size
		result.Compressed = false
	}
	return result, nil
}

// validateVideoCompressFile 校验视频格式和 220MB 上传限制。
func validateVideoCompressFile(file *multipart.FileHeader) error {
	if file == nil || file.Size <= 0 {
		return response.AssertArgumentError.Make("请选择有效的视频文件")
	}
	if file.Size > VideoCompressMaxFileSize {
		return response.AssertArgumentError.Make("视频大小不能超过 220MB")
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{
		".mp4": true, ".mov": true, ".m4v": true, ".avi": true,
		".mkv": true, ".webm": true, ".wmv": true,
	}
	if !allowed[ext] {
		return response.AssertArgumentError.Make("暂不支持该视频格式")
	}
	return nil
}

// copyMultipartFile 将 multipart 上传内容写入独立临时文件。
func copyMultipartFile(file *multipart.FileHeader, targetPath string) error {
	source, err := file.Open()
	if err != nil {
		return err
	}
	defer source.Close()

	target, err := os.Create(targetPath)
	if err != nil {
		return err
	}
	defer target.Close()
	_, err = io.Copy(target, source)
	return err
}

// buildVideoCompressArgs 构建固定的 FFmpeg H.264 压缩参数。
func buildVideoCompressArgs(inputPath string, outputPath string) []string {
	return []string{
		"-hide_banner", "-loglevel", "error", "-y",
		"-i", inputPath,
		"-map", "0:v:0", "-map", "0:a?", "-map_metadata", "-1",
		"-vf", "scale=w='min(1920,iw)':h='min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
		"-fpsmax", "30",
		"-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-pix_fmt", "yuv420p",
		"-c:a", "aac", "-b:a", "128k",
		"-movflags", "+faststart",
		outputPath,
	}
}

// shouldKeepOriginalVideo 判断压缩收益是否足够，低于 2% 时保留原视频。
func shouldKeepOriginalVideo(originalSize int64, outputSize int64) bool {
	if originalSize <= 0 || outputSize <= 0 {
		return true
	}
	return float64(outputSize) >= float64(originalSize)*videoCompressKeepOriginalRate
}

// buildCompressedVideoName 生成安全的 MP4 下载文件名。
func buildCompressedVideoName(originalName string) string {
	baseName := strings.TrimSuffix(filepath.Base(originalName), filepath.Ext(originalName))
	baseName = strings.TrimSpace(baseName)
	if baseName == "" {
		baseName = "video"
	}
	return baseName + "_compressed.mp4"
}

// resolveVideoContentType 根据原视频扩展名返回回退下载 MIME。
func resolveVideoContentType(ext string) string {
	switch strings.ToLower(ext) {
	case ".mp4", ".m4v":
		return "video/mp4"
	case ".mov":
		return "video/quicktime"
	case ".webm":
		return "video/webm"
	case ".avi":
		return "video/x-msvideo"
	case ".wmv":
		return "video/x-ms-wmv"
	default:
		return "application/octet-stream"
	}
}

// buildVideoCompressError 过滤 FFmpeg 日志并返回可操作的失败原因。
func buildVideoCompressError(commandLog string, commandErr error) string {
	logText := strings.TrimSpace(commandLog)
	if len(logText) > 500 {
		logText = logText[len(logText)-500:]
	}
	if logText == "" {
		return fmt.Sprintf("视频压缩失败：%v", commandErr)
	}
	return "视频压缩失败：" + logText
}
