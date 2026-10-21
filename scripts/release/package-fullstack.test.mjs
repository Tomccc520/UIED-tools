/**
 * @description 发布来源回归：隔离 Go 构建命令，确认根仓提交与最终二进制哈希一致。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

const packageScript = path.resolve(import.meta.dirname, 'package-fullstack.sh')
const sourceRevision = '0123456789abcdef0123456789abcdef01234567'

/** 函数说明：在临时发布目录运行构建函数，使用 Go 替身记录目标平台和编译参数，结束后清理夹具。 */
const withFixture = (run) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'uied-package-test-'))
  try {
    fs.mkdirSync(path.join(root, 'bin'))
    fs.writeFileSync(path.join(root, 'bin/go'), `#!/usr/bin/env bash
set -eu
printf '%s\\n' "$CGO_ENABLED" "$GOOS" "$GOARCH" "$@" > "$UIEDTOOL_TEST_ROOT/go-call.txt"
while [[ $# -gt 0 ]]; do
  if [[ "$1" == -o ]]; then printf 'fixture-api-bytes' > "$2"; exit 0; fi
  shift
done
exit 2
`, { mode: 0o755 })
    /** 函数说明：加载真实发布函数后重定向输出目录和根仓提交，不运行正式打包入口。 */
    const execute = (script) => spawnSync('bash', ['-c', `source "$1"
RELEASE_DIR="$UIEDTOOL_TEST_ROOT/release"
SOURCE_COMMIT="${sourceRevision}"
${script}`, 'test', packageScript], {
      encoding: 'utf8',
      env: { ...process.env, UIEDTOOL_TEST_ROOT: root, PATH: `${path.join(root, 'bin')}:${process.env.PATH}` }
    })
    run({ root, execute })
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

test('API 构建关闭嵌套仓库 VCS 标记，并保留 Linux amd64 无 CGO 目标', () => withFixture(({ root, execute }) => {
  const result = execute('build_server_binary')
  assert.equal(result.status, 0, result.stderr)
  const args = fs.readFileSync(path.join(root, 'go-call.txt'), 'utf8').trim().split('\n')
  assert.deepEqual(args.slice(0, 4), ['0', 'linux', 'amd64', 'build'])
  assert.ok(args.includes('-buildvcs=false'))
  assert.equal(fs.readFileSync(path.join(root, 'release/server/uiedtool-api'), 'utf8'), 'fixture-api-bytes')
}))

test('发布信息使用根仓完整提交和最终 API 字节，且被文件摘要清单覆盖', () => withFixture(({ root, execute }) => {
  const result = execute('build_server_binary\nwrite_release_info\nwrite_release_manifest')
  assert.equal(result.status, 0, result.stderr)
  const infoBytes = fs.readFileSync(path.join(root, 'release/RELEASE-INFO.json'))
  const info = JSON.parse(infoBytes)
  assert.equal(info.sourceRevision, sourceRevision)
  assert.equal(info.apiSha256, crypto.createHash('sha256').update('fixture-api-bytes').digest('hex'))
  assert.equal(info.apiTarget, 'linux/amd64')
  assert.equal(info.cgoEnabled, false)
  const manifest = fs.readFileSync(path.join(root, 'release/RELEASE-MANIFEST.txt'), 'utf8')
  assert.ok(manifest.includes(`源码提交: ${sourceRevision}`))
  assert.ok(manifest.includes(`${crypto.createHash('sha256').update(infoBytes).digest('hex')}  ./RELEASE-INFO.json`))
}))
