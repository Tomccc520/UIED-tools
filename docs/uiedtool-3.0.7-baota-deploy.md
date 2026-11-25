<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-11-20
-->

# UIED-Tools 3.0.7 宝塔升级

适用于已运行 3.0.6 的 uiedtool.com。部署包含主站、管理端、Linux amd64 Go API、站点地图、页面快照和 Nginx 路由配置。专业视频压缩的 FFmpeg 运行环境、独立抠图代理仍由服务器提供。

## 上传和升级

将同次构建的 `uiedtool-3.0.7-baota-deploy-<短提交号>.tar.gz` 和同名 `.sha256` 上传到服务器 `/www/wwwroot/uiedtool.com/app/packages/`。将下面第一行的短提交号替换为交付文件名中的实际值。

```bash
bundle='uiedtool-3.0.7-baota-deploy-<短提交号>'
cd /www/wwwroot/uiedtool.com/app/packages/ &&
sha256sum -c "${bundle}.tar.gz.sha256" &&
tar -xzf "${bundle}.tar.gz" &&
cd "${bundle}" &&
bash deploy-update.sh --code-only
```

沿用现有数据库和生产配置。本次从 3.0.6 更新使用代码模式。脚本备份当前站点、校验运行包，切换主站、管理端和 API，通过健康检查后加载新的 Nginx 配置。若此前通过 `UIEDTOOL_CONTAINER_NAME` 指定了容器名，继续使用同一名称。发布失败时根据脚本输出核对恢复结果和本次备份目录。

## 验收

```bash
curl -fsS https://uiedtool.com/api/health
curl -fsSI https://uiedtool.com/admin/
curl -fsS https://uiedtool.com/tools/qrcode | grep -o '<link[^>]*canonical[^>]*>'
curl -sS -o /dev/null -w '%{http_code}\n' https://uiedtool.com/tools/qa-missing-release-307
```

健康接口应返回业务码 200、版本 3.0.7。管理端返回 200，二维码页的 canonical 指向自身，未知路径返回 404。浏览器再检查管理端登录、疯狂星期四换文案、随机表情包刷新和下载。如果使用 CDN，发布后刷新 HTML、robots 和 sitemap 缓存。运行包中的 `RELEASE-INFO.json` 可核对源码提交及 API 二进制 SHA-256。
