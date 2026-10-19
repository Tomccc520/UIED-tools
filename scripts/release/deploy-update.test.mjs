/**
 * @description 发布失败恢复回归：使用临时站点与可控 Nginx，避免操作真实服务。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

const deployScript = path.resolve(import.meta.dirname, 'deploy-update.sh')

/** 函数说明：创建独立站点夹具和可控的 Nginx 命令；测试结束删除所有临时文件。 */
const withFixture = (run) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'uied-deploy-test-'))
  try {
    fs.mkdirSync(path.join(root, 'backup'))
    fs.mkdirSync(path.join(root, 'release/nginx'), { recursive: true })
    fs.writeFileSync(path.join(root, 'release/nginx/uiedtool.com.fullstack.locations.conf'), 'new config\n')
    const nginx = path.join(root, 'nginx')
    fs.writeFileSync(nginx, `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$UIEDTOOL_TEST_ROOT/nginx.log"
case "$*" in
  -t) [[ "\${NGINX_TEST_FAIL_TEST:-0}" != 1 ]] ;;
  '-s reload') [[ "\${NGINX_TEST_FAIL_RELOAD:-0}" != 1 ]] ;;
  *) exit 2 ;;
esac
`, { mode: 0o755 })
    /** 函数说明：仅加载发布函数，并用环境变量将配置和站点写入临时目录。 */
    const execute = (script) => spawnSync('bash', ['-c', `source "$1"\n${script}`, 'test', deployScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        UIEDTOOL_TEST_ROOT: root,
        UIEDTOOL_SITE_ROOT: root,
        UIEDTOOL_NGINX_BIN: nginx,
        UIEDTOOL_NGINX_EXTENSION_FILE: path.join(root, 'extension/site.conf')
      }
    })
    run({ root, execute })
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

test('新路由配置通过校验才 reload，并保存升级前文件', () => withFixture(({ root, execute }) => {
  fs.mkdirSync(path.join(root, 'extension'))
  fs.writeFileSync(path.join(root, 'extension/site.conf'), 'old config\n')
  const result = execute('backup_nginx_config "$UIEDTOOL_TEST_ROOT/backup"\npublish_nginx_config "$UIEDTOOL_TEST_ROOT/release"')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.readFileSync(path.join(root, 'extension/site.conf'), 'utf8'), 'new config\n')
  assert.equal(fs.readFileSync(path.join(root, 'backup/nginx-extension.conf'), 'utf8'), 'old config\n')
  assert.equal(fs.readFileSync(path.join(root, 'nginx.log'), 'utf8'), '-t\n-s reload\n')
}))

test('配置校验失败不 reload，恢复升级前配置', () => withFixture(({ root, execute }) => {
  fs.mkdirSync(path.join(root, 'extension'))
  fs.writeFileSync(path.join(root, 'extension/site.conf'), 'old config\n')
  const result = execute(`backup_nginx_config "$UIEDTOOL_TEST_ROOT/backup"
export NGINX_TEST_FAIL_TEST=1
if publish_nginx_config "$UIEDTOOL_TEST_ROOT/release"; then exit 9; fi
restore_nginx_config "$UIEDTOOL_TEST_ROOT/backup"`)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.readFileSync(path.join(root, 'extension/site.conf'), 'utf8'), 'old config\n')
  assert.equal(fs.readFileSync(path.join(root, 'nginx.log'), 'utf8'), '-t\n')
}))

test('reload 失败后可恢复旧 release、公开文件、API 与路由配置', () => withFixture(({ root, execute }) => {
  fs.mkdirSync(path.join(root, 'public'))
  fs.mkdirSync(path.join(root, 'app/releases/previous'), { recursive: true })
  fs.mkdirSync(path.join(root, 'extension'))
  fs.writeFileSync(path.join(root, 'public/index.html'), 'old page')
  fs.writeFileSync(path.join(root, 'extension/site.conf'), 'old config\n')
  const previous = path.join(root, 'app/releases/previous')
  fs.symlinkSync(path.join(root, 'release'), path.join(root, 'app/current'))
  const result = execute(`backup_nginx_config "$UIEDTOOL_TEST_ROOT/backup"
tar -czf "$UIEDTOOL_TEST_ROOT/backup/public.tar.gz" -C "$UIEDTOOL_TEST_ROOT" public
printf 'new page' > "$UIEDTOOL_TEST_ROOT/public/index.html"
export NGINX_TEST_FAIL_RELOAD=1
if publish_nginx_config "$UIEDTOOL_TEST_ROOT/release"; then exit 9; fi
unset NGINX_TEST_FAIL_RELOAD
# 测试替身只记录 API 重启，不创建容器或更改真实用户权限。
chown() { return 0; }
start_api_container() { printf 'restored' > "$UIEDTOOL_TEST_ROOT/api-restored"; }
wait_for_health() { return 0; }
rollback_release "$UIEDTOOL_TEST_ROOT/app/releases/previous" "$UIEDTOOL_TEST_ROOT/backup"`)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.readlinkSync(path.join(root, 'app/current')), previous)
  assert.equal(fs.readFileSync(path.join(root, 'public/index.html'), 'utf8'), 'old page')
  assert.equal(fs.readFileSync(path.join(root, 'extension/site.conf'), 'utf8'), 'old config\n')
  assert.equal(fs.readFileSync(path.join(root, 'api-restored'), 'utf8'), 'restored')
  assert.equal(fs.readFileSync(path.join(root, 'nginx.log'), 'utf8'), '-t\n-s reload\n-t\n-s reload\n')
}))

test('首次安装失败时删除本轮新建的扩展文件', () => withFixture(({ root, execute }) => {
  const result = execute(`backup_nginx_config "$UIEDTOOL_TEST_ROOT/backup"
export NGINX_TEST_FAIL_TEST=1
if publish_nginx_config "$UIEDTOOL_TEST_ROOT/release"; then exit 9; fi
restore_nginx_config "$UIEDTOOL_TEST_ROOT/backup"`)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.existsSync(path.join(root, 'extension/site.conf')), false)
}))

test('API 环境文件准备失败时返回失败，不继续启动容器', () => withFixture(({ root, execute }) => {
  const result = execute(`cp() { return 1; }
docker() { printf 'unexpected' > "$UIEDTOOL_TEST_ROOT/docker-called"; }
if start_api_container; then exit 9; fi`)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.existsSync(path.join(root, 'docker-called')), false)
}))

test('静态文件复制中断后恢复旧页面与版本链接', () => withFixture(({ root, execute }) => {
  fs.mkdirSync(path.join(root, 'public'))
  fs.mkdirSync(path.join(root, 'app/releases/previous'), { recursive: true })
  fs.writeFileSync(path.join(root, 'public/index.html'), 'old page')
  fs.symlinkSync(path.join(root, 'app/releases/previous'), path.join(root, 'app/current'))
  const result = execute(`backup_nginx_config "$UIEDTOOL_TEST_ROOT/backup"
tar -czf "$UIEDTOOL_TEST_ROOT/backup/public.tar.gz" -C "$UIEDTOOL_TEST_ROOT" public
rsync() { printf 'partial page' > "$PUBLIC_DIR/index.html"; return 1; }
chown() { return 0; }
start_api_container() { return 0; }
wait_for_health() { return 0; }
if publish_frontend_files "$UIEDTOOL_TEST_ROOT/release"; then exit 9; fi
rollback_release "$UIEDTOOL_TEST_ROOT/app/releases/previous" "$UIEDTOOL_TEST_ROOT/backup"`)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.readFileSync(path.join(root, 'public/index.html'), 'utf8'), 'old page')
  assert.equal(fs.readlinkSync(path.join(root, 'app/current')), path.join(root, 'app/releases/previous'))
}))

test('旧 API 回滚后不健康时明确报失败，不误认容器启动就是恢复完成', () => withFixture(({ root, execute }) => {
  fs.mkdirSync(path.join(root, 'public'))
  fs.mkdirSync(path.join(root, 'app/releases/previous'), { recursive: true })
  fs.writeFileSync(path.join(root, 'public/index.html'), 'old page')
  const result = execute(`backup_nginx_config "$UIEDTOOL_TEST_ROOT/backup"
tar -czf "$UIEDTOOL_TEST_ROOT/backup/public.tar.gz" -C "$UIEDTOOL_TEST_ROOT" public
chown() { return 0; }
start_api_container() { return 0; }
wait_for_health() { return 1; }
rollback_release "$UIEDTOOL_TEST_ROOT/app/releases/previous" "$UIEDTOOL_TEST_ROOT/backup"`)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /旧版本 API 尚未恢复健康/)
}))
