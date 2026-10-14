/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */
package common

import (
	"mime/multipart"
	"strings"
	"testing"
)

// TestBuildVideoCompressArgs 校验视频编码、清晰度和快速起播参数不会回退。
func TestBuildVideoCompressArgs(t *testing.T) {
	args := strings.Join(buildVideoCompressArgs("source.mov", "result.mp4"), " ")
	wants := []string{
		"-c:v libx264",
		"-preset medium",
		"-crf 26",
		"-fpsmax 30",
		"scale=w='min(1920,iw)':h='min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
		"-c:a aac",
		"-b:a 128k",
		"-movflags +faststart",
	}
	for _, want := range wants {
		if !strings.Contains(args, want) {
			t.Fatalf("视频压缩参数缺少 %q: %s", want, args)
		}
	}
}

// TestValidateVideoCompressFile 校验格式和 500MB 上传边界。
func TestValidateVideoCompressFile(t *testing.T) {
	valid := &multipart.FileHeader{Filename: "demo.mov", Size: VideoCompressMaxFileSize}
	if err := validateVideoCompressFile(valid); err != nil {
		t.Fatalf("合法视频不应被拒绝: %v", err)
	}

	tooLarge := &multipart.FileHeader{Filename: "demo.mp4", Size: VideoCompressMaxFileSize + 1}
	if err := validateVideoCompressFile(tooLarge); err == nil {
		t.Fatal("超过 500MB 的视频应被拒绝")
	}

	invalidFormat := &multipart.FileHeader{Filename: "demo.txt", Size: 1024}
	if err := validateVideoCompressFile(invalidFormat); err == nil {
		t.Fatal("非视频格式应被拒绝")
	}
}

// TestShouldKeepOriginalVideo 校验无明显压缩收益时保留原文件。
func TestShouldKeepOriginalVideo(t *testing.T) {
	if !shouldKeepOriginalVideo(1000, 980) {
		t.Fatal("输出达到原文件 98% 时应保留原视频")
	}
	if shouldKeepOriginalVideo(1000, 500) {
		t.Fatal("输出明显变小时不应回退原视频")
	}
}

// TestBuildCompressedVideoName 校验下载文件名统一为 MP4。
func TestBuildCompressedVideoName(t *testing.T) {
	if got := buildCompressedVideoName("演示视频.MOV"); got != "演示视频_compressed.mp4" {
		t.Fatalf("压缩文件名不符合预期: %s", got)
	}
}

// TestBuildVideoCompressError 校验 FFmpeg 失败信息会收敛为安全且可操作的提示。
func TestBuildVideoCompressError(t *testing.T) {
	if got := buildVideoCompressError("/tmp/private/source.mov: Invalid data found when processing input", nil); got != "视频格式或编码不受支持，请更换视频文件" {
		t.Fatalf("格式错误提示不符合预期: %s", got)
	}
	if got := buildVideoCompressError("command failed at /tmp/private", nil); got != "视频压缩失败，请稍后重试" {
		t.Fatalf("通用错误提示不符合预期: %s", got)
	}
}
