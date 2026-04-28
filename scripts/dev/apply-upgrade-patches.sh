#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-04-28

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.runtime"
BACKEND_DIR="${ROOT_DIR}/backend"
LIKEADMIN_DIR="${BACKEND_DIR}/likeadmin-go"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-uiedtool_stack}"
COMPOSE_ENV_FILE="${RUNTIME_DIR}/compose.env"
PORTS_ENV_FILE="${RUNTIME_DIR}/ports.env"
FORCE_REAPPLY="${FORCE_REAPPLY:-0}"
BOOTSTRAP_LEGACY_LOG="${BOOTSTRAP_LEGACY_LOG:-0}"

DB_NAME="${DB_NAME:-}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
MYSQL_PORT="${MYSQL_PORT:-}"
REDIS_PORT="${REDIS_PORT:-}"
MYSQL_USER="${MYSQL_USER:-}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"

PATCHES_APPLIED=0
PATCHES_SKIPPED=0
PATCHES_TOTAL=0

# 函数说明：统一输出信息日志，方便交付时追踪补丁执行进度。
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：统一输出警告日志，用于提示非阻断问题。
log_warn() {
  printf "\033[33m[WARN]\033[0m %s\n" "$1"
}

# 函数说明：输出错误后立即退出，避免补丁执行到一半继续向后污染状态。
log_error_and_exit() {
  printf "\033[31m[ERROR]\033[0m %s\n" "$1" >&2
  exit 1
}

# 函数说明：检查关键命令是否存在，避免交付脚本在客户环境里直接崩掉。
require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_error_and_exit "缺少命令: $1"
  fi
}

# 函数说明：创建运行时目录，确保 compose 环境文件和缓存文件有落点。
init_runtime_dirs() {
  mkdir -p "${RUNTIME_DIR}"
}

# 函数说明：从环境文件读取键值，优先复用当前工作区最近一次运行配置。
read_env_value() {
  local file="$1"
  local key="$2"
  local default_value="$3"

  if [[ ! -f "${file}" ]]; then
    echo "${default_value}"
    return
  fi

  local value
  value="$(grep -E "^${key}=" "${file}" | tail -n 1 | cut -d '=' -f2- || true)"
  echo "${value:-${default_value}}"
}

# 函数说明：加载数据库与端口配置，优先复用 ports.env 中的实际运行参数。
load_runtime_settings() {
  DB_NAME="${DB_NAME:-$(read_env_value "${PORTS_ENV_FILE}" "DB_NAME" "uiedtool")}"
  MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_ROOT_PASSWORD" "root123456")}"
  MYSQL_PORT="${MYSQL_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_PORT" "33069")}"
  REDIS_PORT="${REDIS_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "REDIS_PORT" "16379")}"
  MYSQL_USER="${MYSQL_USER:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_USER" "uiedtool")}"
  MYSQL_PASSWORD="${MYSQL_PASSWORD:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_PASSWORD" "uiedtool123")}"
}

# 函数说明：写入 compose 环境文件，确保单独执行补丁脚本时也能驱动 docker compose。
write_compose_env_file() {
  cat >"${COMPOSE_ENV_FILE}" <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${DB_NAME}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_PORT=${MYSQL_PORT}
REDIS_PORT=${REDIS_PORT}
TZ=Asia/Shanghai
EOF
}

# 函数说明：封装 docker compose 调用，统一项目名与环境文件。
compose_cmd() {
  docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：等待 MySQL 容器可用，避免补丁执行时数据库还未就绪。
wait_for_mysql_ready() {
  local retries=40
  local i
  for ((i = 1; i <= retries; i++)); do
    if compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysqladmin ping -h127.0.0.1 -uroot --silent >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# 函数说明：确保数据库与缓存容器已启动，便于补丁脚本独立执行。
ensure_database_stack() {
  log_info "启动 MySQL + Redis 容器..."
  compose_cmd up -d mysql redis >/dev/null
  if ! wait_for_mysql_ready; then
    log_error_and_exit "MySQL 启动超时，请先检查 Docker 运行状态。"
  fi
}

# 函数说明：执行单条查询并返回纯文本结果，统一处理字符集和认证参数。
mysql_query() {
  local sql="$1"
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot -Nse "${sql}" 2>/dev/null || true
}

# 函数说明：创建升级补丁日志表，确保每个 SQL 文件只会被成功记录一次。
ensure_upgrade_log_table() {
  mysql_query "CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.\`la_system_upgrade_log\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`patch_key\` VARCHAR(255) NOT NULL,
    \`patch_type\` VARCHAR(32) NOT NULL DEFAULT '',
    \`file_name\` VARCHAR(255) NOT NULL DEFAULT '',
    \`file_path\` VARCHAR(500) NOT NULL DEFAULT '',
    \`sha1\` VARCHAR(64) NOT NULL DEFAULT '',
    \`status\` VARCHAR(32) NOT NULL DEFAULT 'success',
    \`remark\` VARCHAR(500) NOT NULL DEFAULT '',
    \`applied_at\` BIGINT NOT NULL DEFAULT 0,
    \`create_time\` BIGINT NOT NULL DEFAULT 0,
    \`update_time\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uniq_patch_key\` (\`patch_key\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" >/dev/null
}

# 函数说明：对 SQL 字符串做最小转义，避免文件路径与备注写入日志表时破坏 SQL 语法。
sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

# 函数说明：读取单个补丁的执行状态，供跳过已执行补丁与变更 hash 复跑判断使用。
get_patch_record() {
  local patch_key="$1"
  mysql_query "SELECT CONCAT(COALESCE(status,''), '|', COALESCE(sha1,'')) FROM \`${DB_NAME}\`.\`la_system_upgrade_log\` WHERE patch_key='$(sql_escape "${patch_key}")' LIMIT 1;"
}

# 函数说明：统计升级日志表里的成功记录数量，用于判断当前数据库是否已经建立补丁基线。
get_upgrade_log_success_count() {
  mysql_query "SELECT COUNT(*) FROM \`${DB_NAME}\`.\`la_system_upgrade_log\` WHERE status='success';"
}

# 函数说明：检查当前数据库是否已存在老项目基础表，用于识别“老库无补丁日志”的迁移场景。
has_existing_installation() {
  local table_count
  table_count="$(mysql_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME IN ('la_system_auth_admin', 'la_system_menu', 'la_dev_tools');")"
  [[ "${table_count:-0}" -ge 1 ]]
}

# 函数说明：记录补丁执行结果，确保交付后能追溯每一条 SQL 的执行状态与时间。
record_patch_status() {
  local patch_key="$1"
  local patch_type="$2"
  local file_name="$3"
  local file_path="$4"
  local patch_sha1="$5"
  local status="$6"
  local remark="$7"
  local now_ts
  now_ts="$(date +%s)"

  mysql_query "INSERT INTO \`${DB_NAME}\`.\`la_system_upgrade_log\`
    (\`patch_key\`, \`patch_type\`, \`file_name\`, \`file_path\`, \`sha1\`, \`status\`, \`remark\`, \`applied_at\`, \`create_time\`, \`update_time\`)
    VALUES
    ('$(sql_escape "${patch_key}")', '$(sql_escape "${patch_type}")', '$(sql_escape "${file_name}")', '$(sql_escape "${file_path}")', '$(sql_escape "${patch_sha1}")', '$(sql_escape "${status}")', '$(sql_escape "${remark}")', ${now_ts}, ${now_ts}, ${now_ts})
    ON DUPLICATE KEY UPDATE
      \`patch_type\`=VALUES(\`patch_type\`),
      \`file_name\`=VALUES(\`file_name\`),
      \`file_path\`=VALUES(\`file_path\`),
      \`sha1\`=VALUES(\`sha1\`),
      \`status\`=VALUES(\`status\`),
      \`remark\`=VALUES(\`remark\`),
      \`applied_at\`=VALUES(\`applied_at\`),
      \`update_time\`=VALUES(\`update_time\`);" >/dev/null
}

# 函数说明：收集 upgrade 与 patches 目录下的 SQL 文件，并按文件名排序为统一升级队列。
collect_upgrade_files() {
  local temp_file
  temp_file="$(mktemp)"

  if [[ -d "${LIKEADMIN_DIR}/sql/upgrade" ]]; then
    while IFS= read -r file_path; do
      printf "%s\tupgrade\t%s\n" "$(basename "${file_path}")" "${file_path}" >> "${temp_file}"
    done < <(find "${LIKEADMIN_DIR}/sql/upgrade" -maxdepth 1 -type f -name '*.sql' | sort)
  fi

  if [[ -d "${LIKEADMIN_DIR}/sql/patches" ]]; then
    while IFS= read -r file_path; do
      printf "%s\tpatch\t%s\n" "$(basename "${file_path}")" "${file_path}" >> "${temp_file}"
    done < <(find "${LIKEADMIN_DIR}/sql/patches" -maxdepth 1 -type f -name '*.sql' | sort)
  fi

  sort -k1,1 "${temp_file}"
  rm -f "${temp_file}"
}

# 函数说明：为历史库补齐升级日志而不重放 SQL，适用于老环境已具备结构但没有补丁日志的场景。
bootstrap_upgrade_log() {
  local temp_file=""
  local patch_type=""
  local file_path=""
  local file_name=""
  local relative_path=""
  local patch_key=""
  local patch_sha1=""

  temp_file="$(mktemp)"
  collect_upgrade_files > "${temp_file}"
  exec 3< "${temp_file}"
  while IFS=$'\t' read -r _ patch_type file_path <&3; do
    [[ -n "${file_path}" ]] || continue
    file_name="$(basename "${file_path}")"
    relative_path="${file_path#${LIKEADMIN_DIR}/}"
    patch_key="${patch_type}:${relative_path}"
    patch_sha1="$(shasum -a 1 "${file_path}" | awk '{print $1}')"
    record_patch_status "${patch_key}" "${patch_type}" "${file_name}" "${relative_path}" "${patch_sha1}" "success" "legacy_bootstrap"
    PATCHES_TOTAL=$((PATCHES_TOTAL + 1))
    PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
  done
  exec 3<&-
  rm -f "${temp_file}"
}

# 函数说明：识别老库首次接入补丁日志的场景，默认阻止直接重放所有 SQL，避免客户环境重复执行历史变更。
guard_legacy_database_without_log() {
  local success_count
  success_count="$(get_upgrade_log_success_count)"

  if [[ "${success_count:-0}" -gt 0 ]]; then
    return
  fi

  if ! has_existing_installation; then
    return
  fi

  if [[ "${BOOTSTRAP_LEGACY_LOG}" == "1" ]]; then
    log_warn "检测到历史数据库缺少补丁日志，已进入日志回填模式，不重放历史 SQL。"
    bootstrap_upgrade_log
    print_summary
    exit 0
  fi

  if [[ "${FORCE_REAPPLY}" == "1" ]]; then
    log_warn "检测到历史数据库缺少补丁日志，当前使用 --force，将尝试重放历史 SQL。"
    return
  fi

  log_error_and_exit "检测到当前数据库已存在历史业务表，但升级日志为空。为避免重放全部历史 SQL，请执行: npm run dev:upgrade:apply -- --bootstrap-legacy-log"
}

# 函数说明：执行单个 SQL 文件，支持按日志表跳过已成功的补丁，并在失败时中断。
apply_sql_file() {
  local patch_type="$1"
  local file_path="$2"
  local file_name
  local relative_path
  local patch_key
  local patch_sha1
  local patch_record
  local previous_status
  local previous_sha1

  file_name="$(basename "${file_path}")"
  relative_path="${file_path#${LIKEADMIN_DIR}/}"
  patch_key="${patch_type}:${relative_path}"
  patch_sha1="$(shasum -a 1 "${file_path}" | awk '{print $1}')"
  patch_record="$(get_patch_record "${patch_key}")"
  previous_status="${patch_record%%|*}"
  previous_sha1="${patch_record#*|}"
  PATCHES_TOTAL=$((PATCHES_TOTAL + 1))

  if [[ "${FORCE_REAPPLY}" != "1" ]] && [[ "${previous_status}" == "success" ]] && [[ "${previous_sha1}" == "${patch_sha1}" ]]; then
    PATCHES_SKIPPED=$((PATCHES_SKIPPED + 1))
    log_info "跳过已执行补丁: ${file_name}"
    return
  fi

  log_info "应用补丁: ${file_name}"
  if compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${file_path}"; then
    record_patch_status "${patch_key}" "${patch_type}" "${file_name}" "${relative_path}" "${patch_sha1}" "success" "ok"
    PATCHES_APPLIED=$((PATCHES_APPLIED + 1))
    return
  fi

  record_patch_status "${patch_key}" "${patch_type}" "${file_name}" "${relative_path}" "${patch_sha1}" "failed" "apply_failed"
  log_error_and_exit "补丁执行失败: ${file_name}"
}

# 函数说明：遍历统一升级队列并执行补丁，形成可重复运行的升级入口。
apply_upgrade_files() {
  local has_files=0
  local temp_file=""
  local patch_type=""
  local file_path=""

  temp_file="$(mktemp)"
  collect_upgrade_files > "${temp_file}"
  exec 3< "${temp_file}"
  while IFS=$'\t' read -r _ patch_type file_path <&3; do
    [[ -n "${file_path}" ]] || continue
    has_files=1
    apply_sql_file "${patch_type}" "${file_path}"
  done
  exec 3<&-
  rm -f "${temp_file}"

  if [[ "${has_files}" -eq 0 ]]; then
    log_warn "未发现可执行的 SQL 补丁文件。"
  fi
}

# 函数说明：输出本次升级补丁执行摘要，便于交付时留档与排障。
print_summary() {
  cat <<EOF

[OK] 升级补丁执行完成
- 数据库: ${DB_NAME}
- 扫描补丁数: ${PATCHES_TOTAL}
- 本次执行: ${PATCHES_APPLIED}
- 已跳过: ${PATCHES_SKIPPED}
- 日志表: la_system_upgrade_log
EOF
}

main() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --force)
        FORCE_REAPPLY=1
        ;;
      --bootstrap-legacy-log)
        BOOTSTRAP_LEGACY_LOG=1
        ;;
      *)
        log_error_and_exit "不支持的参数: $1"
        ;;
    esac
    shift
  done

  require_command docker
  require_command shasum
  init_runtime_dirs
  load_runtime_settings
  write_compose_env_file
  ensure_database_stack
  ensure_upgrade_log_table
  guard_legacy_database_without_log
  apply_upgrade_files
  print_summary
}

main "$@"
