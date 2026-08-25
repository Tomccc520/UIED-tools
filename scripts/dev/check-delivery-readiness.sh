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

TOOLS_PORT="${TOOLS_PORT:-}"
ADMIN_PORT="${ADMIN_PORT:-}"
GO_API_PORT="${GO_API_PORT:-}"
MATTING_PORT="${MATTING_PORT:-}"
AI_RESUME_PORT="${AI_RESUME_PORT:-}"
DEPLOY_AI_RESUME="${DEPLOY_AI_RESUME:-0}"
MYSQL_PORT="${MYSQL_PORT:-}"
REDIS_PORT="${REDIS_PORT:-}"
DB_NAME="${DB_NAME:-}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
MYSQL_USER="${MYSQL_USER:-}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# 函数说明：统一输出信息日志，方便售前或客户自查时理解执行进度。
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：输出通过项，并累计通过数量。
mark_pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf "\033[32m[PASS]\033[0m %s\n" "$1"
}

# 函数说明：输出警告项，并累计警告数量。
mark_warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf "\033[33m[WARN]\033[0m %s\n" "$1"
}

# 函数说明：输出失败项，并累计失败数量。
mark_fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf "\033[31m[FAIL]\033[0m %s\n" "$1"
}

# 函数说明：检查命令是否存在，便于在交付环境中快速定位缺失依赖。
require_command() {
  if command -v "$1" >/dev/null 2>&1; then
    mark_pass "已安装命令: $1"
    return
  fi
  mark_fail "缺少命令: $1"
}

# 函数说明：从环境文件读取键值，优先复用最近一次启动时的运行参数。
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

# 函数说明：加载数据库与端口配置，使自检脚本在未显式传参时也能工作。
load_runtime_settings() {
  TOOLS_PORT="${TOOLS_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "TOOLS_PORT" "5179")}"
  ADMIN_PORT="${ADMIN_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "ADMIN_PORT" "5180")}"
  GO_API_PORT="${GO_API_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "GO_API_PORT" "8003")}"
  MATTING_PORT="${MATTING_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "MATTING_PORT" "8091")}"
  AI_RESUME_PORT="${AI_RESUME_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "AI_RESUME_PORT" "3002")}"
  MYSQL_PORT="${MYSQL_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_PORT" "33069")}"
  REDIS_PORT="${REDIS_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "REDIS_PORT" "16379")}"
  DB_NAME="${DB_NAME:-$(read_env_value "${PORTS_ENV_FILE}" "DB_NAME" "uiedtool")}"
  MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_ROOT_PASSWORD" "root123456")}"
  MYSQL_USER="${MYSQL_USER:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_USER" "uiedtool")}"
  MYSQL_PASSWORD="${MYSQL_PASSWORD:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_PASSWORD" "uiedtool123")}"
}

# 函数说明：写入 compose 环境文件，保证独立执行自检脚本时 docker compose 可解析端口和数据库变量。
write_compose_env_file() {
  mkdir -p "${RUNTIME_DIR}"
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

# 函数说明：封装 docker compose 调用，统一项目名和 compose 环境变量。
compose_cmd() {
  docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：通过 docker compose 查询 MySQL，避免依赖宿主机安装 mysql 客户端。
mysql_query() {
  local sql="$1"
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot -Nse "${sql}" 2>/dev/null || true
}

# 函数说明：检查基础源码结构是否完整，避免客户交付包缺目录后再排障。
check_workspace_structure() {
  local required_paths=(
    "${ROOT_DIR}/src"
    "${ROOT_DIR}/scripts/dev/start-fullstack.sh"
    "${LIKEADMIN_DIR}/server"
    "${LIKEADMIN_DIR}/admin"
    "${LIKEADMIN_DIR}/sql/install.sql"
    "${LIKEADMIN_DIR}/sql/patches"
    "${LIKEADMIN_DIR}/sql/upgrade"
  )
  local path

  for path in "${required_paths[@]}"; do
    if [[ -e "${path}" ]]; then
      mark_pass "存在交付关键路径: ${path#${ROOT_DIR}/}"
    else
      mark_fail "缺少交付关键路径: ${path#${ROOT_DIR}/}"
    fi
  done
}

# 函数说明：检查 Node、Go、Python、Docker 依赖，确保客户机器具备最小启动条件。
check_runtime_dependencies() {
  require_command docker
  require_command npm
  require_command node
  require_command go
  require_command python3
  require_command curl
  require_command lsof
}

# 函数说明：兼容 macOS 与 Linux 计算 SQL 文件 SHA1，避免交付自检绑定单一系统命令。
calculate_file_sha1() {
  local file="$1"
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 1 "${file}" | awk '{print $1}'
    return
  fi
  if command -v sha1sum >/dev/null 2>&1; then
    sha1sum "${file}" | awk '{print $1}'
    return
  fi
  return 1
}

# 函数说明：检查端口监听与 HTTP 探活，确认前后台核心服务是否真实可访问。
check_http_service() {
  local label="$1"
  local url="$2"
  if curl -fsS --max-time 8 "${url}" >/dev/null 2>&1; then
    mark_pass "${label} 可访问: ${url}"
    return
  fi
  mark_warn "${label} 暂不可访问: ${url}"
}

# 函数说明：检查抠图代理不仅能访问，而且至少有一个外部 Provider 已完成配置。
check_matting_service() {
  local url="$1"
  local payload
  local ready

  payload="$(curl -fsS --max-time 8 "${url}" 2>/dev/null || true)"
  if [[ -z "${payload}" ]]; then
    mark_warn "抠图服务暂不可访问: ${url}"
    return
  fi

  ready="$(printf '%s' "${payload}" | python3 -c 'import json, sys; data = json.load(sys.stdin); print("1" if data.get("ok") is True and data.get("ready") is True else "0")' 2>/dev/null || echo "0")"
  if [[ "${ready}" == "1" ]]; then
    mark_pass "抠图服务与 Provider 均已就绪: ${url}"
    return
  fi

  mark_warn "抠图服务可访问但 Provider 未就绪，请在后台配置阿里云或抠抠图 API Key"
}

# 函数说明：检查数据库容器状态与关键数据表存在性，确认交付库结构已具备商业能力。
check_database_readiness() {
  local mysql_container_id
  local redis_container_id
  local core_table_count
  local ranking_table_count
  local license_table_count
  local upgrade_log_count
  local total_patch_files
  local applied_patch_count
  local exact_patch_count
  local patch_manifest_file
  local applied_manifest_file
  local patch_sha1

  mysql_container_id="$(compose_cmd ps -q mysql 2>/dev/null || true)"
  redis_container_id="$(compose_cmd ps -q redis 2>/dev/null || true)"

  if [[ -n "${mysql_container_id}" ]]; then
    mark_pass "MySQL 容器已启动"
  else
    mark_warn "MySQL 容器未启动"
  fi

  if [[ -n "${redis_container_id}" ]]; then
    mark_pass "Redis 容器已启动"
  else
    mark_warn "Redis 容器未启动"
  fi

  if [[ -z "${mysql_container_id}" ]]; then
    mark_warn "数据库未运行，跳过表结构与补丁日志检查"
    return
  fi

  core_table_count="$(mysql_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_system_auth_admin';")"
  ranking_table_count="$(mysql_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_tool_ranking_daily';")"
  license_table_count="$(mysql_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_system_license';")"
  upgrade_log_count="$(mysql_query "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_system_upgrade_log';")"

  [[ "${core_table_count:-0}" -ge 1 ]] && mark_pass "核心后台表 la_system_auth_admin 已存在" || mark_fail "核心后台表 la_system_auth_admin 缺失"
  [[ "${ranking_table_count:-0}" -ge 1 ]] && mark_pass "热榜聚合表 la_tool_ranking_daily 已存在" || mark_warn "热榜聚合表 la_tool_ranking_daily 缺失"
  [[ "${license_table_count:-0}" -ge 1 ]] && mark_pass "授权表 la_system_license 已存在" || mark_warn "授权表 la_system_license 缺失"
  [[ "${upgrade_log_count:-0}" -ge 1 ]] && mark_pass "升级日志表 la_system_upgrade_log 已存在" || mark_warn "升级日志表 la_system_upgrade_log 缺失"

  total_patch_files="$(find "${LIKEADMIN_DIR}/sql/upgrade" "${LIKEADMIN_DIR}/sql/patches" -maxdepth 1 -type f -name '*.sql' | wc -l | tr -d ' ')"
  if [[ "${upgrade_log_count:-0}" -ge 1 ]]; then
    applied_patch_count="$(mysql_query "SELECT COUNT(*) FROM \`${DB_NAME}\`.\`la_system_upgrade_log\` WHERE status='success';")"
    patch_manifest_file="$(mktemp)"
    applied_manifest_file="$(mktemp)"

    while IFS= read -r patch_file; do
      local patch_type="patch"
      if [[ "${patch_file}" == "${LIKEADMIN_DIR}/sql/upgrade/"* ]]; then
        patch_type="upgrade"
      fi
      patch_sha1="$(calculate_file_sha1 "${patch_file}" || true)"
      if [[ -z "${patch_sha1}" ]]; then
        rm -f "${patch_manifest_file}" "${applied_manifest_file}"
        mark_warn "缺少 shasum/sha1sum，跳过升级补丁精确校验"
        return
      fi
      printf "%s:%s\t%s\n" \
        "${patch_type}" \
        "${patch_file#${LIKEADMIN_DIR}/}" \
        "${patch_sha1}" >> "${patch_manifest_file}"
    done < <(find "${LIKEADMIN_DIR}/sql/upgrade" "${LIKEADMIN_DIR}/sql/patches" -maxdepth 1 -type f -name '*.sql' | sort)

    mysql_query "SELECT patch_key, sha1 FROM \`${DB_NAME}\`.\`la_system_upgrade_log\` WHERE status='success' ORDER BY patch_key;" \
      | sort > "${applied_manifest_file}"
    exact_patch_count="$({ grep -Fxf "${applied_manifest_file}" "${patch_manifest_file}" || true; } | wc -l | tr -d ' ')"
    rm -f "${patch_manifest_file}" "${applied_manifest_file}"

    if [[ "${exact_patch_count:-0}" -ge "${total_patch_files:-0}" ]]; then
      mark_pass "升级补丁日志与当前 SQL 完全一致（${exact_patch_count}/${total_patch_files}）"
    else
      mark_warn "升级补丁日志未覆盖当前 SQL 或校验值已变更（精确匹配 ${exact_patch_count:-0}/${total_patch_files:-0}，成功日志 ${applied_patch_count:-0}），建议执行 npm run dev:upgrade:apply"
    fi
  fi
}

# 函数说明：检查 HTTP 服务链路，帮助交付前快速确认前台、后台、API、AI 服务是否健康。
check_service_endpoints() {
  check_http_service "工具前端" "http://127.0.0.1:${TOOLS_PORT}"
  check_http_service "后台前端" "http://127.0.0.1:${ADMIN_PORT}"
  check_http_service "后台配置接口" "http://127.0.0.1:${GO_API_PORT}/api/common/index/config"
  check_matting_service "http://127.0.0.1:${MATTING_PORT}/health"
  if [[ "${DEPLOY_AI_RESUME}" == "1" ]]; then
    check_http_service "AI 简历服务" "http://127.0.0.1:${AI_RESUME_PORT}/tools/ai-resume"
  else
    mark_pass "AI 简历已按本期发布范围暂缓部署"
  fi
}

# 函数说明：输出本次商业交付自检摘要，并给出下一步建议。
print_summary() {
  cat <<EOF

[SUMMARY]
- 通过: ${PASS_COUNT}
- 警告: ${WARN_COUNT}
- 失败: ${FAIL_COUNT}
- 当前端口: tools=${TOOLS_PORT}, admin=${ADMIN_PORT}, api=${GO_API_PORT}, matting=${MATTING_PORT}, resume=${AI_RESUME_PORT}, mysql=${MYSQL_PORT}, redis=${REDIS_PORT}
EOF

  if [[ "${FAIL_COUNT}" -gt 0 ]]; then
    printf "\033[31m[RESULT]\033[0m 交付自检未通过，请优先修复 FAIL 项。\n"
    return 1
  fi

  if [[ "${WARN_COUNT}" -gt 0 ]]; then
    printf "\033[33m[RESULT]\033[0m 交付自检基本通过，但仍有 WARN 项，建议上线前处理。\n"
    return 0
  fi

  printf "\033[32m[RESULT]\033[0m 交付自检通过，可继续做上线或打包交付。\n"
  return 0
}

main() {
  load_runtime_settings
  write_compose_env_file
  check_runtime_dependencies
  check_workspace_structure
  check_database_readiness
  check_service_endpoints
  print_summary
}

main "$@"
