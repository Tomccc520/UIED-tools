/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */
package common

import (
	"context"
	"encoding/json"
	"mime/multipart"
	"strings"
	"testing"
	"time"
)

// TestBuildVideoCompressArgs 校验视频编码、清晰度和快速起播参数不会回退。
func TestBuildVideoCompressArgs(t *testing.T) {
	args := strings.Join(buildVideoCompressArgs("source.mov", "result.mp4"), " ")
	wants := []string{
		"-c:v libx264",
		"-preset veryfast",
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

// TestVideoCompressSpeedOptions 验证旧调用默认快速模式、均衡模式和任意参数注入的拒绝行为。
func TestVideoCompressSpeedOptions(t *testing.T) {
	for _, test := range []struct {
		name    string
		options []VideoCompressOptions
		speed   string
		preset  string
	}{
		{name: "旧调用默认快速", speed: "fast", preset: "veryfast"},
		{name: "空选项默认快速", options: []VideoCompressOptions{{Speed: ""}}, speed: "fast", preset: "veryfast"},
		{name: "快速", options: []VideoCompressOptions{{Speed: "fast"}}, speed: "fast", preset: "veryfast"},
		{name: "均衡", options: []VideoCompressOptions{{Speed: "balanced"}}, speed: "balanced", preset: "medium"},
	} {
		t.Run(test.name, func(t *testing.T) {
			option, err := resolveVideoCompressOptions(test.options...)
			if err != nil || option.Speed != test.speed {
				t.Fatalf("速度选项不正确: %+v %v", option, err)
			}
			args := strings.Join(buildVideoCompressArgs("source.mov", "result.mp4", option), " ")
			if !strings.Contains(args, "-preset "+test.preset) || !strings.Contains(args, "-crf 26") {
				t.Fatalf("速度不得意外更改画质参数: %s", args)
			}
		})
	}
	for _, speed := range []string{"slow", "ultrafast", "fast -crf 51", "balanced;rm"} {
		if _, err := resolveVideoCompressOptions(VideoCompressOptions{Speed: speed}); err == nil {
			t.Fatalf("非法速度应被拒绝: %q", speed)
		}
		if _, err := (videoCompressService{}).Compress(context.Background(), &multipart.FileHeader{Filename: "demo.mp4", Size: 1}, VideoCompressOptions{Speed: speed}); err == nil || !strings.Contains(err.Error(), "请选择快速压缩或均衡压缩模式") {
			t.Fatalf("服务必须先拒绝非法速度，不应启动 FFmpeg: %q %v", speed, err)
		}
	}
}

// TestVideoCompressQueueTimeout 验证占满的转码名额会在有限等待后返回繁忙，且不会挤占正在运行的名额。
func TestVideoCompressQueueTimeout(t *testing.T) {
	if videoCompressQueueTimeout != 30*time.Second {
		t.Fatalf("生产队列等待应限制为30秒: %s", videoCompressQueueTimeout)
	}
	slots := make(chan struct{}, 1)
	slots <- struct{}{}
	release, err := acquireVideoCompressSlot(context.Background(), slots, 5*time.Millisecond)
	if err == nil || !strings.Contains(err.Error(), "视频压缩服务繁忙，请稍后重试") || release != nil || len(slots) != 1 {
		t.Fatalf("排队超时反馈或名额不正确: err=%v slots=%d", err, len(slots))
	}
}

// TestVideoCompressQueueCancellation 验证排队中取消和已取消请求不会占用或泄漏转码名额。
func TestVideoCompressQueueCancellation(t *testing.T) {
	for _, alreadyCanceled := range []bool{false, true} {
		slots := make(chan struct{}, 1)
		ctx, cancel := context.WithCancel(context.Background())
		if alreadyCanceled {
			cancel()
		} else {
			slots <- struct{}{}
			timer := time.AfterFunc(5*time.Millisecond, cancel)
			defer timer.Stop()
		}
		release, err := acquireVideoCompressSlot(ctx, slots, time.Second)
		cancel()
		if err == nil || !strings.Contains(err.Error(), "视频压缩任务已取消") || release != nil {
			t.Fatalf("取消排队后应立即退出: alreadyCanceled=%v err=%v", alreadyCanceled, err)
		}
		want := 1
		if alreadyCanceled {
			want = 0
		}
		if len(slots) != want {
			t.Fatalf("取消后名额被误占用或释放: got=%d want=%d", len(slots), want)
		}
	}
}

// TestVideoCompressQueueRelease 验证取得转码名额后可以释放，下一任务无需等待旧任务的超时。
func TestVideoCompressQueueRelease(t *testing.T) {
	slots := make(chan struct{}, 1)
	for i := 0; i < 2; i++ {
		release, err := acquireVideoCompressSlot(context.Background(), slots, time.Second)
		if err != nil || release == nil || len(slots) != 1 {
			t.Fatalf("无法取得空闲转码名额: %v", err)
		}
		release()
		if len(slots) != 0 {
			t.Fatal("转码结束后名额未释放")
		}
	}
}

// TestVideoCompressConfigDefaultSpeed 验证前端读取到默认快速模式和真实编码预设。
func TestVideoCompressConfigDefaultSpeed(t *testing.T) {
	encoded, err := json.Marshal(videoCompressService{}.Config())
	if err != nil {
		t.Fatal(err)
	}
	var config map[string]interface{}
	if err := json.Unmarshal(encoded, &config); err != nil {
		t.Fatal(err)
	}
	if config["defaultSpeed"] != "fast" || config["preset"] != "veryfast" || config["crf"] != float64(26) {
		t.Fatalf("默认速度、编码预设或CRF不正确: %s", encoded)
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
