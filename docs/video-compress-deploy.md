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
- 单文件限制：500MB
- 输出：H.264 MP4、AAC 128K
- 画质：CRF 26、`medium`
- 尺寸：最长边不超过 1920，保持比例并确保偶数尺寸
- 帧率：最高 30fps
- 播放：`+faststart`
- 并发：单进程串行执行 1 个转码任务
- 回退：输出体积达到原文件 98% 时返回原视频

## 计费策略

前台目前复用积分消费中心：220MB 以内使用 `video-compress`，超过 220MB 使用 `video-compress-large`。后台“登录注册设置 → 工具积分规则”可以分别配置两条规则；默认普通压缩 0 积分，大文件 5 积分。`memberFree` 只表示会员免积分，不代表独立的会员次数配额。真正的会员次数需要另建额度余额、消费流水和服务端预扣结算模块。

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

返回数据中的 `available=true` 表示 FFmpeg 已可用。前端在 `available=false` 或服务端压缩失败时会自动切换浏览器本地模式。
