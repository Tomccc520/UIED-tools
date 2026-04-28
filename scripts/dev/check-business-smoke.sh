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
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
SMOKE_ADMIN_USERNAME="${SMOKE_ADMIN_USERNAME:-admin}"
SMOKE_ADMIN_PASSWORD="${SMOKE_ADMIN_PASSWORD:-123456}"
SMOKE_RUNTIME_DOMAIN="${SMOKE_RUNTIME_DOMAIN:-127.0.0.1}"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# 函数说明：统一输出信息日志，方便定位业务冒烟当前执行到哪一步。
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：记录通过项并累计通过计数。
mark_pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf "\033[32m[PASS]\033[0m %s\n" "$1"
}

# 函数说明：记录警告项并累计警告计数。
mark_warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf "\033[33m[WARN]\033[0m %s\n" "$1"
}

# 函数说明：记录失败项并累计失败计数。
mark_fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf "\033[31m[FAIL]\033[0m %s\n" "$1"
}

# 函数说明：检查命令依赖，缺失时直接终止业务冒烟。
require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf "\033[31m[ERROR]\033[0m 缺少命令: %s\n" "$1" >&2
    exit 1
  fi
}

# 函数说明：从运行态端口文件读取配置，避免脚本写死本地端口。
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

# 函数说明：加载当前运行态端口和数据库参数，保证脚本与一键启动脚本一致。
load_runtime_settings() {
  TOOLS_PORT="${TOOLS_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "TOOLS_PORT" "5179")}"
  ADMIN_PORT="${ADMIN_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "ADMIN_PORT" "5180")}"
  GO_API_PORT="${GO_API_PORT:-$(read_env_value "${PORTS_ENV_FILE}" "GO_API_PORT" "8003")}"
  MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_ROOT_PASSWORD" "root123456")}"
}

# 函数说明：生成 compose 运行参数文件，供 docker compose 查询 Redis 验证码时复用。
write_compose_env_file() {
  mkdir -p "${RUNTIME_DIR}"
  cat >"${COMPOSE_ENV_FILE}" <<ENV
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=$(read_env_value "${PORTS_ENV_FILE}" "DB_NAME" "uiedtool")
MYSQL_USER=$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_USER" "uiedtool")
MYSQL_PASSWORD=$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_PASSWORD" "uiedtool123")
MYSQL_PORT=$(read_env_value "${PORTS_ENV_FILE}" "MYSQL_PORT" "33069")
REDIS_PORT=$(read_env_value "${PORTS_ENV_FILE}" "REDIS_PORT" "16379")
TZ=Asia/Shanghai
ENV
}

# 函数说明：统一封装 docker compose 调用，用于读取 Redis 中的验证码原文。
compose_cmd() {
  docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：执行 HTTP 请求并输出“状态码 + 响应体”，供后续统一解析。
http_request() {
  local method="$1"
  local url="$2"
  local token="${3:-}"
  local payload="${4:-}"
  local output_file
  output_file="$(mktemp)"
  local http_code

  if [[ -n "${payload}" ]]; then
    if [[ -n "${token}" ]]; then
      http_code="$(curl -sS -X "${method}" "${url}" -H "Content-Type: application/json" -H "token: ${token}" -d "${payload}" -o "${output_file}" -w "%{http_code}")"
    else
      http_code="$(curl -sS -X "${method}" "${url}" -H "Content-Type: application/json" -d "${payload}" -o "${output_file}" -w "%{http_code}")"
    fi
  else
    if [[ -n "${token}" ]]; then
      http_code="$(curl -sS -X "${method}" "${url}" -H "token: ${token}" -o "${output_file}" -w "%{http_code}")"
    else
      http_code="$(curl -sS -X "${method}" "${url}" -o "${output_file}" -w "%{http_code}")"
    fi
  fi

  printf '%s\n' "${http_code}"
  cat "${output_file}"
  rm -f "${output_file}"
}

# 函数说明：从 JSON 字符串中读取指定字段，避免 shell 中重复写解析逻辑。
json_field() {
  local field_path="$1"
  python3 -c '
import json
import sys
field_path = sys.argv[1].split(".")
raw = sys.stdin.read().strip()
if not raw:
    print("")
    raise SystemExit(0)
try:
    data = json.loads(raw)
except Exception:
    print("")
    raise SystemExit(0)
current = data
for item in field_path:
    if isinstance(current, dict):
        current = current.get(item, "")
    else:
        current = ""
        break
if current is None:
    current = ""
if isinstance(current, (dict, list)):
    print(json.dumps(current, ensure_ascii=False))
else:
    print(current)
' "${field_path}"
}

# 函数说明：安全转义 JSON 字符串，便于把接口原样回写为保存载荷。
json_encode_string() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
}

# 函数说明：从后台验证码接口读取 captchaKey，并在 Redis 中取出验证码原文，实现自动登录。
fetch_admin_captcha_code() {
  local api_base_url="$1"
  local captcha_response captcha_http captcha_body captcha_code captcha_on captcha_key redis_value
  captcha_response="$(http_request "GET" "${api_base_url}/api/system/captcha")"
  captcha_http="$(printf '%s\n' "${captcha_response}" | sed -n '1p')"
  captcha_body="$(printf '%s\n' "${captcha_response}" | sed '1d')"
  captcha_code="$(printf '%s' "${captcha_body}" | json_field "code")"
  captcha_on="$(printf '%s' "${captcha_body}" | json_field "data.captchaOn")"
  if [[ "${captcha_http}" != "200" ]] || [[ "${captcha_code}" != "200" ]]; then
    printf '\n\n'
    return 1
  fi
  if [[ "${captcha_on}" != "1" ]]; then
    printf '\n\n'
    return 0
  fi
  captcha_key="$(printf '%s' "${captcha_body}" | json_field "data.captchaKey")"
  if [[ -z "${captcha_key}" ]]; then
    printf '\n\n'
    return 1
  fi
  redis_value="$(compose_cmd exec -T redis redis-cli GET "Like:admin:login:captcha:${captcha_key}" 2>/dev/null | tr -d '\r')"
  printf '%s\n%s\n' "${captcha_key}" "${redis_value}"
}

# 函数说明：执行后台管理员登录，并返回 token 供后续配置保存链路复用。
admin_login() {
  local api_base_url="$1"
  local captcha_key=""
  local captcha_code=""
  local captcha_result login_payload login_response login_http login_body login_code login_token
  captcha_result="$(fetch_admin_captcha_code "${api_base_url}")" || return 1
  captcha_key="$(printf '%s\n' "${captcha_result}" | sed -n '1p')"
  captcha_code="$(printf '%s\n' "${captcha_result}" | sed -n '2p')"

  login_payload="$(python3 - <<'PY' "${SMOKE_ADMIN_USERNAME}" "${SMOKE_ADMIN_PASSWORD}" "${captcha_key}" "${captcha_code}"
import json
import sys
payload = {
  "username": sys.argv[1],
  "password": sys.argv[2],
}
if sys.argv[3].strip() and sys.argv[4].strip():
  payload["captchaKey"] = sys.argv[3].strip()
  payload["captchaCode"] = sys.argv[4].strip()
print(json.dumps(payload, ensure_ascii=False))
PY
)"
  login_response="$(http_request "POST" "${api_base_url}/api/system/login" "" "${login_payload}")"
  login_http="$(printf '%s\n' "${login_response}" | sed -n '1p')"
  login_body="$(printf '%s\n' "${login_response}" | sed '1d')"
  login_code="$(printf '%s' "${login_body}" | json_field "code")"
  login_token="$(printf '%s' "${login_body}" | json_field "data.token")"
  if [[ "${login_http}" != "200" ]] || [[ "${login_code}" != "200" ]] || [[ -z "${login_token}" ]]; then
    return 1
  fi
  printf '%s' "${login_token}"
}

# 函数说明：读取官网设置详情并执行无损回写，验证后台保存链路可用。
check_website_roundtrip() {
  local api_base_url="$1"
  local token="$2"
  local detail_response detail_http detail_body detail_code save_payload save_response save_http save_body save_code current_name current_slogan
  detail_response="$(http_request "GET" "${api_base_url}/api/setting/website/detail" "${token}")"
  detail_http="$(printf '%s\n' "${detail_response}" | sed -n '1p')"
  detail_body="$(printf '%s\n' "${detail_response}" | sed '1d')"
  detail_code="$(printf '%s' "${detail_body}" | json_field "code")"
  if [[ "${detail_http}" != "200" ]] || [[ "${detail_code}" != "200" ]]; then
    mark_fail "官网设置详情读取失败"
    return
  fi
  current_name="$(printf '%s' "${detail_body}" | json_field "data.name")"
  current_slogan="$(printf '%s' "${detail_body}" | json_field "data.toolsSiteSlogan")"
  save_payload="$(python3 - <<'PY' "${current_name}" "${current_slogan}"
import json
import sys
print(json.dumps({"name": sys.argv[1], "toolsSiteSlogan": sys.argv[2]}, ensure_ascii=False))
PY
)"
  save_response="$(http_request "POST" "${api_base_url}/api/setting/website/save" "${token}" "${save_payload}")"
  save_http="$(printf '%s\n' "${save_response}" | sed -n '1p')"
  save_body="$(printf '%s\n' "${save_response}" | sed '1d')"
  save_code="$(printf '%s' "${save_body}" | json_field "code")"
  if [[ "${save_http}" == "200" ]] && [[ "${save_code}" == "200" ]]; then
    mark_pass "官网设置读取/保存闭环通过"
  else
    mark_fail "官网设置保存失败"
  fi
}

# 函数说明：读取 AI 模型配置并原样回写，验证提供商与图片能力配置保存链路可用。
check_ai_model_roundtrip() {
  local api_base_url="$1"
  local token="$2"
  local detail_response detail_http detail_body detail_code save_payload save_response save_http save_body save_code
  detail_response="$(http_request "GET" "${api_base_url}/api/setting/ai/model/detail" "${token}")"
  detail_http="$(printf '%s\n' "${detail_response}" | sed -n '1p')"
  detail_body="$(printf '%s\n' "${detail_response}" | sed '1d')"
  detail_code="$(printf '%s' "${detail_body}" | json_field "code")"
  if [[ "${detail_http}" != "200" ]] || [[ "${detail_code}" != "200" ]]; then
    mark_fail "AI 模型详情读取失败"
    return
  fi
  save_payload="$(printf '%s' "${detail_body}" | python3 -c 'import json,sys
raw=json.load(sys.stdin)
data=raw.get("data") or {}
payload={
  "modelId": data.get("currentModelId") or data.get("current",{}).get("modelId") or "modnet_photographic_portrait_matting",
  "providers": data.get("providers") or [],
  "imageAbilities": data.get("imageAbilities") or []
}
print(json.dumps(payload, ensure_ascii=False))')"
  save_response="$(http_request "POST" "${api_base_url}/api/setting/ai/model/save" "${token}" "${save_payload}")"
  save_http="$(printf '%s\n' "${save_response}" | sed -n '1p')"
  save_body="$(printf '%s\n' "${save_response}" | sed '1d')"
  save_code="$(printf '%s' "${save_body}" | json_field "code")"
  if [[ "${save_http}" == "200" ]] && [[ "${save_code}" == "200" ]]; then
    mark_pass "AI 模型读取/保存闭环通过"
  else
    mark_fail "AI 模型保存失败"
  fi
}

# 函数说明：读取热榜配置并执行无损回写，同时检查公共榜单接口可访问。
check_tool_ranking_roundtrip() {
  local api_base_url="$1"
  local token="$2"
  local config_response config_http config_body config_code public_response public_http public_body public_code save_payload save_response save_http save_body save_code
  config_response="$(http_request "GET" "${api_base_url}/api/setting/tool-ranking/config/detail" "${token}")"
  config_http="$(printf '%s\n' "${config_response}" | sed -n '1p')"
  config_body="$(printf '%s\n' "${config_response}" | sed '1d')"
  config_code="$(printf '%s' "${config_body}" | json_field "code")"
  if [[ "${config_http}" != "200" ]] || [[ "${config_code}" != "200" ]]; then
    mark_fail "热榜配置详情读取失败"
    return
  fi
  public_response="$(http_request "GET" "${api_base_url}/api/common/tool-ranking/list?period=week")"
  public_http="$(printf '%s\n' "${public_response}" | sed -n '1p')"
  public_body="$(printf '%s\n' "${public_response}" | sed '1d')"
  public_code="$(printf '%s' "${public_body}" | json_field "code")"
  if [[ "${public_http}" != "200" ]] || [[ "${public_code}" != "200" ]]; then
    mark_fail "热榜公共接口读取失败"
    return
  fi
  save_payload="$(printf '%s' "${config_body}" | python3 -c 'import json,sys
raw=json.load(sys.stdin)
data=raw.get("data") or {}
payload={
  "enabled": int(data.get("enabled", 1)),
  "pageTitle": str(data.get("pageTitle", "")),
  "pageDescription": str(data.get("pageDescription", "")),
  "defaultPeriod": str(data.get("defaultPeriod", "week")),
  "pageLimit": int(data.get("pageLimit", 12)),
  "showOnSidebar": int(data.get("showOnSidebar", 1)),
  "sidebarTitle": str(data.get("sidebarTitle", "")),
  "sidebarPeriod": str(data.get("sidebarPeriod", "week")),
}
print(json.dumps(payload, ensure_ascii=False))')"
  save_response="$(http_request "POST" "${api_base_url}/api/setting/tool-ranking/config/save" "${token}" "${save_payload}")"
  save_http="$(printf '%s\n' "${save_response}" | sed -n '1p')"
  save_body="$(printf '%s\n' "${save_response}" | sed '1d')"
  save_code="$(printf '%s' "${save_body}" | json_field "code")"
  if [[ "${save_http}" == "200" ]] && [[ "${save_code}" == "200" ]]; then
    mark_pass "热榜配置读取/保存与公共接口闭环通过"
  else
    mark_fail "热榜配置保存失败"
  fi
}

# 函数说明：读取授权配置并调用授权运行态脚本，验证授权详情与后台白名单链路可用。
check_license_roundtrip() {
  local api_base_url="$1"
  local token="$2"
  local detail_response detail_http detail_body detail_code license_key
  detail_response="$(http_request "GET" "${api_base_url}/api/setting/license/detail" "${token}")"
  detail_http="$(printf '%s\n' "${detail_response}" | sed -n '1p')"
  detail_body="$(printf '%s\n' "${detail_response}" | sed '1d')"
  detail_code="$(printf '%s' "${detail_body}" | json_field "code")"
  if [[ "${detail_http}" != "200" ]] || [[ "${detail_code}" != "200" ]]; then
    mark_fail "授权配置详情读取失败"
    return
  fi
  license_key="$(printf '%s' "${detail_body}" | json_field "data.licenseKey")"
  if [[ -z "${license_key}" ]]; then
    mark_warn "当前未配置授权码，已跳过授权运行态深度校验"
    return
  fi
  if LICENSE_ADMIN_USERNAME="${SMOKE_ADMIN_USERNAME}" LICENSE_ADMIN_PASSWORD="${SMOKE_ADMIN_PASSWORD}" RUNTIME_HOST="${SMOKE_RUNTIME_DOMAIN}" bash "${ROOT_DIR}/scripts/dev/check-license-runtime.sh" >/tmp/uied-license-runtime.log 2>&1; then
    mark_pass "授权详情与运行态闭环通过"
  else
    mark_fail "授权运行态脚本失败，详见 /tmp/uied-license-runtime.log"
  fi
}

# 函数说明：输出本次业务闭环冒烟摘要，并决定脚本退出码。
print_summary() {
  cat <<SUMMARY

[SUMMARY]
- 通过: ${PASS_COUNT}
- 警告: ${WARN_COUNT}
- 失败: ${FAIL_COUNT}
- 覆盖链路: 后台登录 / 官网设置保存 / AI模型保存 / 热榜配置 / 授权运行态
SUMMARY
  if [[ "${FAIL_COUNT}" -gt 0 ]]; then
    printf "\033[31m[RESULT]\033[0m 业务闭环冒烟未通过，请先修复 FAIL 项。\n"
    return 1
  fi
  if [[ "${WARN_COUNT}" -gt 0 ]]; then
    printf "\033[33m[RESULT]\033[0m 业务闭环冒烟通过，但仍有 WARN 项建议上线前处理。\n"
    return 0
  fi
  printf "\033[32m[RESULT]\033[0m 业务闭环冒烟全部通过，可进入交付回归或客户演示。\n"
  return 0
}

require_command docker
require_command curl
require_command python3

load_runtime_settings
write_compose_env_file

API_BASE_URL="http://127.0.0.1:${GO_API_PORT}"
TOOLS_BASE_URL="http://127.0.0.1:${TOOLS_PORT}"

log_info "开始执行业务闭环冒烟：${API_BASE_URL}"

ADMIN_TOKEN="$(admin_login "${API_BASE_URL}" || true)"
if [[ -z "${ADMIN_TOKEN}" ]]; then
  mark_fail "后台登录失败，请检查管理员账号、验证码或 Redis 链路"
  print_summary
  exit 1
fi
mark_pass "后台管理员登录通过"

check_website_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
check_ai_model_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
check_tool_ranking_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
check_license_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"

if curl -fsS --max-time 8 "${TOOLS_BASE_URL}/tools/hot-ranking" >/dev/null 2>&1; then
  mark_pass "前台独立热榜页可访问"
else
  mark_fail "前台独立热榜页不可访问"
fi

print_summary
