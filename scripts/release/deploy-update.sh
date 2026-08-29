#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-08-23

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="${UIEDTOOL_SITE_ROOT:-/www/wwwroot/uiedtool.com}"
APP_ROOT="${SITE_ROOT}/app"
PUBLIC_DIR="${SITE_ROOT}/public"
CONTAINER_NAME="${UIEDTOOL_CONTAINER_NAME:-uiedtool-api-v301-live}"
CONTAINER_IMAGE="${UIEDTOOL_CONTAINER_IMAGE:-node:20}"
CONTAINER_ENV="${APP_ROOT}/shared/.env.container"
RUNTIME_ARCHIVE="$(find "${SCRIPT_DIR}" -maxdepth 1 -type f -name 'uiedtool-*-runtime.tar.gz' | sort | head -n 1)"
APPLY_DB_PATCHES="${UIEDTOOL_APPLY_DB_PATCHES:-0}"

DB_USER=""
DB_PASSWORD=""
DB_HOST=""
DB_PORT=""
DB_NAME=""

# 函数说明：输出部署阶段信息，便于在宝塔终端快速定位进度。
log_step() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

# 函数说明：检查部署依赖与固定目录，避免误操作其他站点。
check_requirements() {
  local required_commands=(tar rsync docker curl mysql sha1sum sha256sum)
  local command_name

  if [[ "${APPLY_DB_PATCHES}" == "1" ]]; then
    required_commands+=(mysqldump)
  fi
  [[ "${APPLY_DB_PATCHES}" == "0" || "${APPLY_DB_PATCHES}" == "1" ]] || {
    printf 'UIEDTOOL_APPLY_DB_PATCHES 只能设置为 0 或 1\n' >&2
    return 1
  }

  [[ -n "${RUNTIME_ARCHIVE}" && -f "${RUNTIME_ARCHIVE}" ]] || {
    printf '未找到 uiedtool 运行包\n' >&2
    return 1
  }
  [[ -f "${RUNTIME_ARCHIVE}.sha256" ]] || {
    printf '缺少运行包校验文件\n' >&2
    return 1
  }
  [[ -f "${APP_ROOT}/shared/.env" ]] || {
    printf '缺少生产环境配置: %s\n' "${APP_ROOT}/shared/.env" >&2
    return 1
  }
  [[ -d "${PUBLIC_DIR}" ]] || {
    printf '缺少站点公开目录: %s\n' "${PUBLIC_DIR}" >&2
    return 1
  }

  for command_name in "${required_commands[@]}"; do
    command -v "${command_name}" >/dev/null 2>&1 || {
      printf '缺少命令: %s\n' "${command_name}" >&2
      return 1
    }
  done
}

# 函数说明：解析宝塔升级参数，默认仅发布代码，只有显式参数才执行数据库补丁。
parse_arguments() {
  local argument
  for argument in "$@"; do
    case "${argument}" in
      --apply-db-patches)
        APPLY_DB_PATCHES="1"
        ;;
      --code-only)
        APPLY_DB_PATCHES="0"
        ;;
      -h|--help)
        printf '用法: bash deploy-update.sh [--code-only|--apply-db-patches]\n'
        printf '默认模式: 仅更新主站、管理端和 Go API，不执行数据库补丁。\n'
        printf '数据库模式: 先备份数据库，再按 la_system_upgrade_log 跳过已成功补丁。\n'
        exit 0
        ;;
      *)
        printf '未知参数: %s\n' "${argument}" >&2
        printf '用法: bash deploy-update.sh [--code-only|--apply-db-patches]\n' >&2
        return 1
        ;;
    esac
  done
}

# 函数说明：从现有 DATABASE_URL 解析数据库连接，供备份、补丁和升级日志共用。
load_database_connection() {
  local database_url credentials host_port

  database_url="$(sed -n 's/^DATABASE_URL=//p' "${APP_ROOT}/shared/.env" | head -n 1)"
  database_url="${database_url#\'}"
  database_url="${database_url%\'}"
  database_url="${database_url#\"}"
  database_url="${database_url%\"}"
  [[ -n "${database_url}" ]] || {
    printf '无法从 .env 读取 DATABASE_URL\n' >&2
    return 1
  }

  credentials="${database_url%%@tcp(*}"
  host_port="${database_url#*@tcp(}"
  host_port="${host_port%%)*}"
  DB_USER="${credentials%%:*}"
  DB_PASSWORD="${credentials#*:}"
  DB_HOST="${host_port%%:*}"
  DB_PORT="${host_port##*:}"
  DB_NAME="${database_url#*)/}"
  DB_NAME="${DB_NAME%%\?*}"
  [[ -n "${DB_USER}" && -n "${DB_HOST}" && -n "${DB_PORT}" && -n "${DB_NAME}" ]] || {
    printf 'DATABASE_URL 格式不正确，无法解析数据库连接\n' >&2
    return 1
  }
}

# 函数说明：执行数据库备份，只有显式执行补丁时才会调用，避免普通代码发布增加数据库负担。
backup_database() {
  local backup_file="$1"
  load_database_connection
  printf '导出数据库备份: %s\n' "${backup_file}"
  MYSQL_PWD="${DB_PASSWORD}" mysqldump \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --default-character-set=utf8mb4 \
    -u "${DB_USER}" \
    -h "${DB_HOST}" \
    -P "${DB_PORT}" \
    "${DB_NAME}" | gzip > "${backup_file}"
}

# 函数说明：执行单条数据库查询，统一使用当前生产环境连接参数。
database_query() {
  local sql="$1"
  MYSQL_PWD="${DB_PASSWORD}" mysql \
    --default-character-set=utf8mb4 \
    -Nse "${sql}" \
    -u "${DB_USER}" \
    -h "${DB_HOST}" \
    -P "${DB_PORT}" \
    "${DB_NAME}"
}

# 函数说明：创建升级日志表，用于记录补丁文件哈希并跳过已成功执行的补丁。
ensure_upgrade_log_table() {
  database_query "CREATE TABLE IF NOT EXISTS la_system_upgrade_log (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    patch_key VARCHAR(255) NOT NULL,
    patch_type VARCHAR(32) NOT NULL DEFAULT '',
    file_name VARCHAR(255) NOT NULL DEFAULT '',
    file_path VARCHAR(500) NOT NULL DEFAULT '',
    sha1 VARCHAR(64) NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'success',
    remark VARCHAR(500) NOT NULL DEFAULT '',
    applied_at BIGINT NOT NULL DEFAULT 0,
    create_time BIGINT NOT NULL DEFAULT 0,
    update_time BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_patch_key (patch_key)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
}

# 函数说明：转义升级日志 SQL 字符串，避免文件名或备注破坏查询语法。
escape_sql_value() {
  printf "%s" "$1" | sed "s/'/''/g"
}

# 函数说明：记录补丁执行结果，便于后续升级跳过成功补丁并追溯发布时间。
record_patch_status() {
  local patch_key="$1"
  local patch_name="$2"
  local patch_sha1="$3"
  local now_ts
  now_ts="$(date +%s)"
  database_query "INSERT INTO la_system_upgrade_log
    (patch_key, patch_type, file_name, file_path, sha1, status, remark, applied_at, create_time, update_time)
    VALUES ('$(escape_sql_value "${patch_key}")', 'patch', '$(escape_sql_value "${patch_name}")', '$(escape_sql_value "${patch_name}")', '$(escape_sql_value "${patch_sha1}")', 'success', 'baota_deploy', ${now_ts}, ${now_ts}, ${now_ts})
    ON DUPLICATE KEY UPDATE sha1=VALUES(sha1), status='success', remark='baota_deploy', applied_at=VALUES(applied_at), update_time=VALUES(update_time);"
}

# 函数说明：从升级日志读取补丁状态和哈希，查询失败时按未执行处理并交给后续 SQL 报错兜底。
get_patch_record() {
  local patch_key="$1"
  database_query "SELECT CONCAT(COALESCE(status,''), '|', COALESCE(sha1,'')) FROM la_system_upgrade_log WHERE patch_key='$(escape_sql_value "${patch_key}")' LIMIT 1;" 2>/dev/null || true
}

# 函数说明：按补丁文件哈希执行数据库迁移，已成功且内容未变化的补丁直接跳过。
apply_database_patches() {
  local patch_file patch_name patch_key patch_sha1 patch_record

  load_database_connection
  ensure_upgrade_log_table
  while IFS= read -r patch_file; do
    [[ -n "${patch_file}" ]] || continue
    patch_name="$(basename "${patch_file}")"
    patch_key="patch:${patch_name}"
    patch_sha1="$(sha1sum "${patch_file}" | awk '{print $1}')"
    patch_record="$(get_patch_record "${patch_key}")"
    if [[ "${patch_record}" == "success|${patch_sha1}" ]]; then
      printf '跳过已成功补丁: %s\n' "${patch_name}"
      continue
    fi
    if [[ -n "${patch_record}" ]]; then
      printf '补丁内容已变化，重新执行: %s\n' "${patch_name}"
    else
      printf '执行数据库补丁: %s\n' "${patch_name}"
    fi
    MYSQL_PWD="${DB_PASSWORD}" mysql \
      --default-character-set=utf8mb4 \
      -u "${DB_USER}" \
      -h "${DB_HOST}" \
      -P "${DB_PORT}" \
      "${DB_NAME}" < "${patch_file}"
    record_patch_status "${patch_key}" "${patch_name}" "${patch_sha1}"
  done < <(find "${SCRIPT_DIR}" -maxdepth 1 -type f -name '*.sql' | sort)
}

# 函数说明：按固定配置重建 UIED-Tools API 容器，不会操作其他 Docker 项目。
start_api_container() {
  local attempt

  cp "${APP_ROOT}/shared/.env" "${CONTAINER_ENV}"
  sed -i "s#^UPLOAD_DIRECTORY=.*#UPLOAD_DIRECTORY='/app/uploads/'#" "${CONTAINER_ENV}"
  chown www:www "${CONTAINER_ENV}"
  chmod 640 "${CONTAINER_ENV}"

  if docker container inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
    docker update --restart=no "${CONTAINER_NAME}" >/dev/null
    docker stop --time 10 "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    docker rm -f "${CONTAINER_NAME}" >/dev/null
  fi

  for attempt in $(seq 1 10); do
    if ! docker container inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  if docker container inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
    printf '容器名称未释放: %s\n' "${CONTAINER_NAME}" >&2
    return 1
  fi

  docker run -d \
    --name "${CONTAINER_NAME}" \
    --restart unless-stopped \
    --network host \
    --pull never \
    --user 1001:1001 \
    --workdir /app/backend \
    -v "${APP_ROOT}/current/backend:/app/backend:ro" \
    -v "${CONTAINER_ENV}:/app/config/uiedtool.env:ro" \
    -v "${APP_ROOT}/shared/uploads:/app/uploads" \
    --entrypoint /app/backend/uiedtool-api \
    "${CONTAINER_IMAGE}" \
    -c /app/config/uiedtool.env >/dev/null
}

# 函数说明：轮询 Go API 健康接口，给容器留出启动时间。
wait_for_health() {
  local attempt
  for attempt in $(seq 1 15); do
    if curl -fsS http://127.0.0.1:8003/health >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

# 函数说明：输出正式环境当前管理端资源和 API 二进制指纹，便于确认新版本确实完成切换。
print_release_fingerprint() {
  local admin_asset api_sha

  admin_asset="$(grep -o 'assets/index\.[a-f0-9]*\.js' "${PUBLIC_DIR}/admin/index.html" | head -n 1 || true)"
  api_sha="$(sha256sum "${APP_ROOT}/current/backend/uiedtool-api" | awk '{print $1}')"
  printf '管理端资源: %s\n' "${admin_asset:-未识别}"
  printf 'API 二进制 SHA256: %s\n' "${api_sha}"
}

# 函数说明：当新 API 启动失败时恢复上一版本链接和静态文件。
rollback_release() {
  local previous_release="$1"
  local backup_dir="$2"

  [[ -n "${previous_release}" && -d "${previous_release}" ]] || return 0
  printf '新版本健康检查失败，正在回滚到: %s\n' "${previous_release}" >&2
  ln -sfn "${previous_release}" "${APP_ROOT}/current"
  tar -xzf "${backup_dir}/public.tar.gz" -C "${SITE_ROOT}"
  chown -R www:www "${PUBLIC_DIR}"
  start_api_container
}

# 函数说明：执行校验、备份、解压、可选数据库补丁、静态发布与 API 切换的完整升级。
main() {
  local archive_name version deploy_id release_dir backup_dir previous_release

  parse_arguments "$@"
  check_requirements

  log_step '校验部署包'
  (
    cd "${SCRIPT_DIR}"
    sha256sum -c "$(basename "${RUNTIME_ARCHIVE}.sha256")"
  )

  archive_name="$(basename "${RUNTIME_ARCHIVE}")"
  version="${archive_name#uiedtool-}"
  version="${version%-runtime.tar.gz}"
  deploy_id="${version}-$(date +%Y%m%d-%H%M%S)"
  release_dir="${APP_ROOT}/releases/${deploy_id}"
  backup_dir="${APP_ROOT}/backups/${deploy_id}"
  previous_release="$(readlink -f "${APP_ROOT}/current" 2>/dev/null || true)"

  log_step '备份当前版本'
  mkdir -p "${release_dir}" "${backup_dir}" "${APP_ROOT}/shared/uploads"
  printf '%s\n' "${previous_release}" > "${backup_dir}/previous-release.txt"
  tar -czf "${backup_dir}/public.tar.gz" -C "${SITE_ROOT}" public
  docker inspect "${CONTAINER_NAME}" > "${backup_dir}/docker-inspect.json" 2>/dev/null || true

  log_step '解压新版本'
  tar -xzf "${RUNTIME_ARCHIVE}" -C "${release_dir}" --strip-components=1
  test -x "${release_dir}/backend/uiedtool-api"
  test -f "${release_dir}/frontend/site/index.html"
  test -f "${release_dir}/frontend/admin/index.html"
  chmod 755 "${release_dir}/backend/uiedtool-api"

  log_step '数据库变更策略'
  if [[ "${APPLY_DB_PATCHES}" == "1" ]]; then
    backup_database "${backup_dir}/database.sql.gz"
    apply_database_patches
  else
    printf '默认代码发布模式：跳过数据库补丁。\n'
    printf '如需执行数据库迁移，请使用: bash deploy-update.sh --apply-db-patches\n'
  fi

  log_step '发布主站和管理端'
  ln -sfn "${release_dir}" "${APP_ROOT}/current"
  rsync -a --delete \
    --exclude='.well-known/' \
    --exclude='admin/' \
    "${release_dir}/frontend/site/" \
    "${PUBLIC_DIR}/"
  rsync -a --delete \
    "${release_dir}/frontend/admin/" \
    "${PUBLIC_DIR}/admin/"
  chown -R www:www "${PUBLIC_DIR}" "${APP_ROOT}/shared/uploads"
  chown www:www "${APP_ROOT}/shared/.env"
  chmod 640 "${APP_ROOT}/shared/.env"

  log_step '切换 Go API'
  start_api_container
  if ! wait_for_health; then
    docker logs --tail 80 "${CONTAINER_NAME}" >&2 || true
    rollback_release "${previous_release}" "${backup_dir}"
    return 1
  fi

  log_step '部署完成'
  curl -fsS http://127.0.0.1:8003/health
  printf '\n'
  print_release_fingerprint
  printf '\n当前版本: %s\n' "$(readlink -f "${APP_ROOT}/current")"
  printf '备份目录: %s\n' "${backup_dir}"
  printf '验收地址: https://uiedtool.com/  https://uiedtool.com/admin/\n'
}

main "$@"
