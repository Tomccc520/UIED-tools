#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-07-30

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_ENV_FILE="${FRONTEND_ENV_FILE:-${ROOT_DIR}/.env.production}"
ADMIN_ENV_FILE="${ADMIN_ENV_FILE:-${ROOT_DIR}/backend/likeadmin-go/admin/.env.production}"
SERVER_ENV_FILE="${SERVER_ENV_FILE:-${ROOT_DIR}/backend/likeadmin-go/server/.env}"
MATTING_ENV_FILE="${MATTING_ENV_FILE:-${ROOT_DIR}/backend/matting-service/.env}"
AI_RESUME_ENV_FILE="${AI_RESUME_ENV_FILE:-}"
AI_RESUME_NGINX_FILE="${AI_RESUME_NGINX_FILE:-${ROOT_DIR}/deploy/nginx/ai-resume.location.conf}"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# 函数说明：记录通过项并累计数量。
mark_pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf "\033[32m[PASS]\033[0m %s\n" "$1"
}

# 函数说明：记录警告项并累计数量。
mark_warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf "\033[33m[WARN]\033[0m %s\n" "$1"
}

# 函数说明：记录失败项并累计数量。
mark_fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf "\033[31m[FAIL]\033[0m %s\n" "$1"
}

# 函数说明：读取环境文件键值，兼容单引号、双引号及等号两侧空格。
read_env_value() {
  local file="$1"
  local key="$2"
  local line

  line="$(grep -E "^[[:space:]]*${key}[[:space:]]*=" "${file}" | tail -n 1 || true)"
  if [[ -z "${line}" ]]; then
    printf ""
    return
  fi

  line="${line#*=}"
  line="$(printf "%s" "${line}" | sed -E "s/^[[:space:]]+|[[:space:]]+$//g; s/^['\\\"]//; s/['\\\"]$//")"
  printf "%s" "${line}"
}

# 函数说明：检查生产环境文件是否存在。
require_env_file() {
  local label="$1"
  local file="$2"

  if [[ -f "${file}" ]]; then
    mark_pass "${label}配置文件已存在"
    return 0
  fi

  mark_fail "${label}配置文件不存在: ${file}"
  return 1
}

# 函数说明：检查可选服务环境文件，缺失时记录警告但不阻断主站部署。
optional_env_file() {
  local label="$1"
  local file="$2"

  if [[ -f "${file}" ]]; then
    mark_pass "${label}配置文件已存在"
    return 0
  fi

  mark_warn "${label}配置文件不存在，对应功能将不可用: ${file}"
  return 1
}

# 函数说明：检查必填环境变量是否存在且不是示例占位值。
require_env_value() {
  local label="$1"
  local file="$2"
  local key="$3"
  local value

  value="$(read_env_value "${file}" "${key}")"
  if [[ -z "${value}" ]]; then
    mark_fail "${label}缺少 ${key}"
    return
  fi

  if [[ "${value}" =~ example\.com|replace-with|your[-_]|changeme|local[-_]development|development-token ]]; then
    mark_fail "${label}仍使用 ${key} 示例占位值"
    return
  fi

  mark_pass "${label}已配置 ${key}"
}

# 函数说明：校验 Go 服务使用生产运行模式，确保 mock 支付等开发能力不会在线上开放。
require_production_mode() {
  local file="$1"
  local mode

  mode="$(read_env_value "${file}" "GIN_MODE")"
  mode="$(printf "%s" "${mode}" | tr '[:upper:]' '[:lower:]')"
  case "${mode}" in
    release|prod|production)
      mark_pass "Go 后端已启用生产运行模式: ${mode}"
      ;;
    '')
      mark_fail "Go 后端缺少 GIN_MODE=release，mock 支付等开发能力可能被错误开放"
      ;;
    *)
      mark_fail "Go 后端 GIN_MODE=${mode} 不是生产运行模式"
      ;;
  esac
}

# 函数说明：禁止公开服务地址指向本机开发地址。
reject_local_address() {
  local label="$1"
  local file="$2"
  local key="$3"
  local value

  value="$(read_env_value "${file}" "${key}")"
  if [[ -z "${value}" ]]; then
    return
  fi

  if [[ "${value}" =~ 127\.0\.0\.1|localhost ]]; then
    mark_fail "${label}的 ${key} 仍指向本机地址"
    return
  fi

  mark_pass "${label}的 ${key} 未使用本机地址"
}

# 函数说明：检查前端环境文件中是否误放密钥，避免 VITE 变量进入浏览器产物。
check_frontend_secret_exposure() {
  local file="$1"
  local exposed

  exposed="$(
    awk -F '=' '
      /^[[:space:]]*VITE_[A-Z0-9_]*(KEY|SECRET|TOKEN)[A-Z0-9_]*[[:space:]]*=/ {
        value = substr($0, index($0, "=") + 1)
        gsub(/^[[:space:]'"'"'"]+|[[:space:]'"'"'"]+$/, "", value)
        if (length(value) > 0) print $1
      }
    ' "${file}"
  )"

  if [[ -n "${exposed}" ]]; then
    mark_fail "前台生产配置包含可能泄露到浏览器的 Key、Secret 或 Token"
    return
  fi

  mark_pass "前台生产配置未发现公开密钥"
}

# 函数说明：检查抠图代理是否配置环境变量兜底 Provider，主配置仍以后台保存值为准。
check_matting_provider() {
  local file="$1"
  local koukoutu_key
  local aliyun_id
  local aliyun_secret

  koukoutu_key="$(read_env_value "${file}" "KOUKOUTU_API_KEY")"
  aliyun_id="$(read_env_value "${file}" "ALIYUN_ACCESS_KEY_ID")"
  aliyun_secret="$(read_env_value "${file}" "ALIYUN_ACCESS_KEY_SECRET")"

  if [[ -n "${koukoutu_key}" || ( -n "${aliyun_id}" && -n "${aliyun_secret}" ) ]]; then
    mark_pass "抠图服务已配置可用 Provider"
    return
  fi

  mark_warn "抠图代理未配置环境变量兜底 Provider，请确认后台已保存阿里云或抠抠图 API 密钥"
}

# 函数说明：检查两个服务使用相同内部令牌，避免抠图服务无法读取后台配置。
check_matting_token_match() {
  local server_token
  local matting_token

  server_token="$(read_env_value "${SERVER_ENV_FILE}" "MATTING_INTERNAL_TOKEN")"
  matting_token="$(read_env_value "${MATTING_ENV_FILE}" "MATTING_INTERNAL_TOKEN")"

  if [[ "${#server_token}" -lt 24 ]]; then
    mark_fail "Go 后端 MATTING_INTERNAL_TOKEN 长度不足 24 位"
    return
  fi

  if [[ "${server_token}" != "${matting_token}" ]]; then
    mark_fail "Go 后端与抠图服务的 MATTING_INTERNAL_TOKEN 不一致"
    return
  fi

  mark_pass "抠图内部令牌长度与一致性检查通过"
}

# 函数说明：校验 AI 简历生产环境保持独立构建，并固定使用主站约定的同域 basePath。
check_ai_resume_config() {
  local base_path

  if [[ ! -f "${AI_RESUME_NGINX_FILE}" ]]; then
    mark_fail "AI 简历 Nginx 路由配置不存在: ${AI_RESUME_NGINX_FILE}"
  elif grep -Fq "location ^~ /tools/ai-resume/" "${AI_RESUME_NGINX_FILE}" \
    && grep -Fq "proxy_pass http://127.0.0.1:3002;" "${AI_RESUME_NGINX_FILE}"; then
    mark_pass "AI 简历 Nginx 同域路径配置已存在"
  else
    mark_fail "AI 简历 Nginx 配置缺少 /tools/ai-resume/ 或 3002 反向代理"
  fi

  if [[ -z "${AI_RESUME_ENV_FILE}" ]]; then
    mark_fail "未指定 AI_RESUME_ENV_FILE，无法确认 AI 简历生产 basePath"
    return
  fi

  if [[ ! -f "${AI_RESUME_ENV_FILE}" ]]; then
    mark_fail "AI 简历生产配置文件不存在: ${AI_RESUME_ENV_FILE}"
    return
  fi

  base_path="$(read_env_value "${AI_RESUME_ENV_FILE}" "NEXT_PUBLIC_APP_BASE_PATH")"
  if [[ "${base_path}" != "/tools/ai-resume" ]]; then
    mark_fail "AI 简历 NEXT_PUBLIC_APP_BASE_PATH 必须为 /tools/ai-resume"
    return
  fi

  mark_pass "AI 简历生产 basePath 配置正确"
}

# 函数说明：执行前台、后台、服务端、抠图服务和 AI 简历的生产配置检查。
main() {
  local frontend_ready=0
  local admin_ready=0
  local server_ready=0
  local matting_ready=0

  require_env_file "前台" "${FRONTEND_ENV_FILE}" && frontend_ready=1
  require_env_file "后台管理端" "${ADMIN_ENV_FILE}" && admin_ready=1
  require_env_file "Go 后端" "${SERVER_ENV_FILE}" && server_ready=1
  optional_env_file "抠图服务" "${MATTING_ENV_FILE}" && matting_ready=1

  if [[ "${frontend_ready}" -eq 1 ]]; then
    require_env_value "前台" "${FRONTEND_ENV_FILE}" "VITE_APP_URL"
    reject_local_address "前台" "${FRONTEND_ENV_FILE}" "VITE_APP_URL"
    reject_local_address "前台" "${FRONTEND_ENV_FILE}" "VITE_API_BASE_URL"
    check_frontend_secret_exposure "${FRONTEND_ENV_FILE}"
  fi

  if [[ "${admin_ready}" -eq 1 ]]; then
    reject_local_address "后台管理端" "${ADMIN_ENV_FILE}" "VITE_APP_BASE_URL"
  fi

  if [[ "${server_ready}" -eq 1 ]]; then
    require_production_mode "${SERVER_ENV_FILE}"
    require_env_value "Go 后端" "${SERVER_ENV_FILE}" "PUBLIC_URL"
    require_env_value "Go 后端" "${SERVER_ENV_FILE}" "DATABASE_URL"
    require_env_value "Go 后端" "${SERVER_ENV_FILE}" "REDIS_URL"
    require_env_value "Go 后端" "${SERVER_ENV_FILE}" "UPLOAD_DIRECTORY"
    reject_local_address "Go 后端" "${SERVER_ENV_FILE}" "PUBLIC_URL"
  fi

  if [[ "${matting_ready}" -eq 1 ]]; then
    require_env_value "抠图服务" "${MATTING_ENV_FILE}" "MATTING_CONFIG_ENDPOINT"
    require_env_value "抠图服务" "${MATTING_ENV_FILE}" "MATTING_INTERNAL_TOKEN"
    check_matting_provider "${MATTING_ENV_FILE}"
  fi

  if [[ "${server_ready}" -eq 1 && "${matting_ready}" -eq 1 ]]; then
    require_env_value "Go 后端" "${SERVER_ENV_FILE}" "MATTING_INTERNAL_TOKEN"
    check_matting_token_match
  fi

  check_ai_resume_config

  cat <<EOF

[SUMMARY]
- 通过: ${PASS_COUNT}
- 警告: ${WARN_COUNT}
- 失败: ${FAIL_COUNT}
EOF

  if [[ "${FAIL_COUNT}" -gt 0 ]]; then
    printf "\033[31m[RESULT]\033[0m 生产配置检查未通过，请完成 FAIL 项后再部署。\n"
    return 1
  fi

  if [[ "${WARN_COUNT}" -gt 0 ]]; then
    printf "\033[33m[RESULT]\033[0m 生产配置可部署，但 WARN 对应功能不会完整可用。\n"
    return 0
  fi

  printf "\033[32m[RESULT]\033[0m 生产配置检查通过。\n"
}

main "$@"
