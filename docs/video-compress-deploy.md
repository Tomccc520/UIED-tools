<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */
-->

# 视频压缩服务部署

## 压缩参数

- 接口：`POST /api/common/video/compress`
- 上传字段：`file`
- 速度字段：`speed=fast|balanced`；省略或留空默认 `fast`，其他值返回参数错误
- 单文件限制：500MB
- 输出：H.264 MP4、AAC 128K
- 快速压缩（默认）：CRF 26、`veryfast`，优先缩短编码时间
- 均衡压缩：CRF 26、`medium`，通常花费更多时间换取更高编码效率；相同 CRF 不保证两种模式的输出体积或画面完全一致
- 尺寸：最长边不超过 1920，保持比例并确保偶数尺寸
- 帧率：最高 30fps
- 播放：`+faststart`
- 并发：单进程串行执行 1 个转码任务
- 排队：最多等待 30 秒，繁忙时明确返回“视频压缩服务繁忙，请稍后重试”；取消请求立即退出等待
- 总预算：服务层任务（含排队、临时文件复制和转码）最多 9 分 30 秒；排队另限 30 秒，为 HTTP 十分钟超时保留收尾时间
- 回退：输出体积达到原文件 98% 时返回原视频

## 计费策略

前台目前复用积分消费中心：220MB 以内使用 `video-compress`，超过 220MB 使用 `video-compress-large`。后台“登录注册设置 → 工具积分规则”可以分别配置两条规则；默认普通压缩 0 积分，大文件 5 积分。`memberFree` 只表示会员免积分，不代表独立的会员次数配额。真正的会员次数需要另建额度余额、消费流水和服务端预扣结算模块。

同一未完成任务使用稳定 `requestId` 预扣；专业失败后重试或切换本地沿用授权，不重复扣费。成功确认消费，最终失败、取消、换文件或主动结束任务请求退款，网络失败复用现有结算补偿机制。具体回归范围见 [视频压缩计费修复记录](./video-compress-billing-regression-2026-10-29.md)。

## FFmpeg 依赖

部署或更新后执行：

```bash
cd backend/likeadmin-go
./scripts/ensure-ffmpeg.sh
```

脚本会在 macOS 使用 Homebrew，在 Debian/Ubuntu、Fedora 或 CentOS 系统使用对应包管理器安装 FFmpeg；已安装时只执行版本检查。

## Nginx

上传 500MB 视频时必须同步提高 Nginx 限制和超时：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8003;
    client_max_body_size 520m;
    proxy_connect_timeout 30s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
    proxy_request_buffering on;
}
```

修改后执行 `nginx -t`，确认无误再重载 Nginx。

## 健康检查

```bash
curl -sS http://127.0.0.1:8003/api/common/video/compress/config
```

返回数据中的 `available=true` 表示 FFmpeg 在服务进程的 PATH 中可找到，`defaultSpeed=fast`、`preset=veryfast` 表示默认快速编码。实际可转码的编码器仍以运行结果为准。

前端在服务不可用、繁忙或转码失败时明确提示用户，并提供重新尝试或手动改用浏览器本地压缩的入口，避免等待服务端之后又自动完整播放转码一次。本地压缩通常需要接近视频时长的处理时间。

该接口在上传、排队、转码完成后才返回视频附件；上传百分比不代表编码进度。当前接口不提供实时编码百分比，前端需分别展示上传中、等待服务端处理和下载结果的状态。
