<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-08-22
-->

# UIED-Tools 3.0.1 宝塔全栈部署

本次发布包含主站静态前端、`/admin` 管理端、Go API 和全新数据库初始化脚本。AI 简历 Next.js 服务本次暂不部署，生产主站不会展示其入口；抠图独立代理服务也不在本包内，后续配置 API Provider 时再单独启用。

## 一、发布目录

```text
uiedtool-3.0.1/
├── web/                         主站静态文件
├── admin/                       管理后台静态文件
├── server/
│   ├── uiedtool-api             Linux amd64 静态二进制
│   ├── static/                  Go 服务默认静态资源
│   ├── .env.example             生产配置模板
│   └── uiedtool-api.service     systemd 服务
├── nginx/                       宝塔 Nginx 扩展配置
├── sql/install.sql              全新数据库初始化脚本
├── docs/DEPLOY.md               本文档
└── RELEASE-MANIFEST.txt         文件 SHA-256 清单
```

## 二、部署前备份

以下命令在服务器执行。发布文件统一放在站点目录的 `app` 中，避免和其他项目、公开静态文件混放。

```bash
export SITE_DIR=/www/wwwroot/uiedtool.com
export APP_DIR="$SITE_DIR/app"
export RELEASE_DIR="$APP_DIR/releases/3.0.1"
export BACKUP_DIR="$APP_DIR/backups/initial-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR" "$APP_DIR/packages" "$APP_DIR/releases" \
  "$APP_DIR/shared/uploads" "$APP_DIR/shared/logs" "$SITE_DIR/public/admin"
tar -czf "$BACKUP_DIR/public.tar.gz" -C "$SITE_DIR" public 2>/dev/null || true
cp -a /www/server/panel/vhost/nginx/uiedtool.com.conf "$BACKUP_DIR/"

# 如果已有 uiedtool 数据库，再执行数据库备份；首次全栈部署可跳过。
mysqldump -uroot -p --single-transaction --default-character-set=utf8mb4 uiedtool \
  > "$BACKUP_DIR/uiedtool.sql"
```

## 三、初始化数据库

当前正式环境只有旧前端时，按全新数据库安装。数据库密码建议使用只包含大小写字母和数字的长随机值，避免 MySQL DSN 中的特殊字符需要转义。

```bash
mysql -uroot -p
```

```sql
CREATE DATABASE `uiedtool` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'uiedtool'@'127.0.0.1' IDENTIFIED BY '替换为强密码';
GRANT ALL PRIVILEGES ON `uiedtool`.* TO 'uiedtool'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

```bash
mysql -uuiedtool -p -h127.0.0.1 uiedtool < "$RELEASE_DIR/sql/install.sql"
```

`install.sql` 面向全新数据库，会重建同名表，不要对已有正式数据库重复执行。

## 四、准备 Go API

```bash
mkdir -p "$APP_DIR/current/backend" "$APP_DIR/shared/uploads"
install -m 0755 "$RELEASE_DIR/server/uiedtool-api" "$APP_DIR/current/backend/uiedtool-api"
cp -a "$RELEASE_DIR/server/static" "$APP_DIR/current/backend/"

test -f "$APP_DIR/shared/.env" || \
  cp "$RELEASE_DIR/server/.env.example" "$APP_DIR/shared/.env"

sed -i "s#^UPLOAD_DIRECTORY=.*#UPLOAD_DIRECTORY='$APP_DIR/shared/uploads/'#" "$APP_DIR/shared/.env"
chown -R www:www "$APP_DIR/current/backend" "$APP_DIR/shared"
chmod 0755 "$APP_DIR/current/backend/uiedtool-api"
chmod 0640 "$APP_DIR/shared/.env"
```

编辑 `$APP_DIR/shared/.env`：

- 将 `DATABASE_URL` 的密码替换为刚创建的数据库密码。
- 用 `openssl rand -hex 32` 生成 `MATTING_INTERNAL_TOKEN`。
- 保持 `SERVER_PORT=8003`、`GIN_MODE=release` 和 `PUBLIC_URL=https://uiedtool.com`。

当前 CentOS 7 宝塔环境使用已有 `node:20` 镜像承载静态 Go 二进制，不需要下载新镜像，也不会启动 Node 进程：

```bash
cp "$APP_DIR/shared/.env" "$APP_DIR/shared/.env.container"
sed -i "s#^UPLOAD_DIRECTORY=.*#UPLOAD_DIRECTORY='/app/uploads/'#" "$APP_DIR/shared/.env.container"
docker rm -f uiedtool-api-v301-live 2>/dev/null || true
docker run -d --name uiedtool-api-v301-live --restart unless-stopped \
  --network host --pull never --user 1001:1001 --workdir /app/backend \
  -v "$APP_DIR/current/backend:/app/backend:ro" \
  -v "$APP_DIR/shared/.env.container:/app/config/uiedtool.env:ro" \
  -v "$APP_DIR/shared/uploads:/app/uploads" \
  --entrypoint /app/backend/uiedtool-api node:20 \
  -c /app/config/uiedtool.env
curl -fsS http://127.0.0.1:8003/health
```

## 五、发布静态文件

先执行 `--dry-run` 检查清单，再同步到独立的 `public` 目录。`app`、`.well-known` 和 `.user.ini` 不会进入公开目录。

```bash
mkdir -p "$SITE_DIR/public/admin"

rsync -an --delete \
  --exclude='.well-known/' --exclude='admin/' \
  "$RELEASE_DIR/web/" "$SITE_DIR/public/"

rsync -a --delete \
  --exclude='.well-known/' --exclude='admin/' \
  "$RELEASE_DIR/web/" "$SITE_DIR/public/"

rsync -a --delete "$RELEASE_DIR/admin/" "$SITE_DIR/public/admin/"
chown -R www:www "$SITE_DIR/public"
```

## 六、接入 Nginx

现有站点已有 RSS、聊天和收藏代理，不覆盖主配置，只新增扩展文件：

```bash
mkdir -p /www/server/panel/vhost/nginx/extension/uiedtool.com
cp "$RELEASE_DIR/nginx/uiedtool.com.fullstack.locations.conf" \
  /www/server/panel/vhost/nginx/extension/uiedtool.com/uiedtool-fullstack.conf

/www/server/nginx/sbin/nginx -t
/www/server/nginx/sbin/nginx -s reload
```

## 七、上线验收

```bash
curl -fsSI https://uiedtool.com/
curl -fsSI https://uiedtool.com/admin/
curl -fsS https://uiedtool.com/api/health
curl -fsS https://uiedtool.com/api/common/index/config
docker logs --tail 100 uiedtool-api-v301-live
```

浏览器重点检查：

1. 首页、热榜、随机工具、GIF 压缩和视频压缩。
2. `/admin/` 登录、Workbench、工具主数据、前端布局和渠道配置。
3. 后台保存品牌文案或前端布局后，刷新主站确认配置回环。
4. 生产主站不展示 AI 简历入口，访问旧入口不会影响其他工具。
5. 首次登录后台后立即修改默认管理员密码，并关闭不使用的登录、支付和渠道能力。

## 八、回滚

静态页面异常时恢复部署前备份：

```bash
rm -rf "$SITE_DIR/public"
tar -xzf "$BACKUP_DIR/public.tar.gz" -C "$SITE_DIR"
cp -a "$BACKUP_DIR/uiedtool.com.conf" /www/server/panel/vhost/nginx/uiedtool.com.conf
rm -f /www/server/panel/vhost/nginx/extension/uiedtool.com/uiedtool-fullstack.conf
/www/server/nginx/sbin/nginx -t && /www/server/nginx/sbin/nginx -s reload
```

API 异常时先保留日志，再停止新服务：

```bash
docker logs --tail 300 uiedtool-api-v301-live > "$BACKUP_DIR/uiedtool-api.log" 2>&1
docker stop uiedtool-api-v301-live
```

数据库只有在确认新库需要废弃时才回滚，不要直接覆盖仍有新增业务数据的数据库。

## 九、服务器建议

- 当前服务器无 Swap，建议部署前增加 2GB Swap，降低构建外服务同时运行时的内存风险。
- MySQL 当前监听公网 `*:3306`，上线后应通过安全组和防火墙限制访问来源，能改为本机监听时优先本机监听。
- 正式环境不需要 Node 或 Go 编译环境，本包已包含静态文件和 Linux amd64 Go 二进制。
- AI 简历后续静态化并将 AI API 迁移到 Go 后，再纳入主站发布，不需要现在增加 Node 容器。
