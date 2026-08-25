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
CHECK_LICENSE_RUNTIME="${CHECK_LICENSE_RUNTIME:-0}"

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

# 函数说明：使用有效验证码提交错误密码，确认后台会返回可展示的失败提示。
check_admin_login_rejection() {
  local api_base_url="$1"
  local captcha_result captcha_key captcha_code login_payload login_response login_http login_body login_code login_message
  captcha_result="$(fetch_admin_captcha_code "${api_base_url}")" || {
    mark_fail "错误密码提示校验无法获取验证码"
    return
  }
  captcha_key="$(printf '%s\n' "${captcha_result}" | sed -n '1p')"
  captcha_code="$(printf '%s\n' "${captcha_result}" | sed -n '2p')"
  login_payload="$(python3 - <<'PY' "${SMOKE_ADMIN_USERNAME}" "${SMOKE_ADMIN_PASSWORD}-wrong" "${captcha_key}" "${captcha_code}"
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
  login_message="$(printf '%s' "${login_body}" | json_field "msg")"
  if [[ "${login_http}" == "200" ]] && [[ "${login_code}" != "200" ]] && [[ -n "${login_message}" ]]; then
    mark_pass "错误管理员密码会返回明确失败提示"
  else
    mark_fail "错误管理员密码未返回可展示的失败提示"
  fi
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

# 函数说明：临时更改并还原侧栏品牌文案，验证侧栏单字段保存与前台公开配置的完整回环。
check_sidebar_roundtrip() {
  local api_base_url="$1"
  local token="$2"
  local detail_response detail_http detail_body detail_code original_brand smoke_brand
  local save_payload save_response save_http save_body save_code verify_response verify_body verify_brand
  local public_response public_body public_brand restore_payload restore_response restore_http restore_body restore_code

  detail_response="$(http_request "GET" "${api_base_url}/api/setting/website/detail" "${token}")"
  detail_http="$(printf '%s\n' "${detail_response}" | sed -n '1p')"
  detail_body="$(printf '%s\n' "${detail_response}" | sed '1d')"
  detail_code="$(printf '%s' "${detail_body}" | json_field "code")"
  if [[ "${detail_http}" != "200" ]] || [[ "${detail_code}" != "200" ]]; then
    mark_fail "侧栏配置详情读取失败"
    return
  fi

  original_brand="$(printf '%s' "${detail_body}" | json_field "data.toolsSidebarBrandText")"
  smoke_brand="UIED-SMK-$(date +%H%M%S)"
  save_payload="$(python3 -c 'import json,sys; print(json.dumps({"toolsSidebarBrandText": sys.argv[1]}, ensure_ascii=False))' "${smoke_brand}")"
  save_response="$(http_request "POST" "${api_base_url}/api/setting/website/save" "${token}" "${save_payload}")"
  save_http="$(printf '%s\n' "${save_response}" | sed -n '1p')"
  save_body="$(printf '%s\n' "${save_response}" | sed '1d')"
  save_code="$(printf '%s' "${save_body}" | json_field "code")"
  if [[ "${save_http}" != "200" ]] || [[ "${save_code}" != "200" ]]; then
    mark_fail "侧栏单字段保存失败"
    return
  fi

  verify_response="$(http_request "GET" "${api_base_url}/api/setting/website/detail" "${token}")"
  verify_body="$(printf '%s\n' "${verify_response}" | sed '1d')"
  verify_brand="$(printf '%s' "${verify_body}" | json_field "data.toolsSidebarBrandText")"
  public_response="$(http_request "GET" "${api_base_url}/api/common/index/config")"
  public_body="$(printf '%s\n' "${public_response}" | sed '1d')"
  public_brand="$(printf '%s' "${public_body}" | json_field "data.toolsSidebarBrandText")"

  restore_payload="$(python3 -c 'import json,sys; print(json.dumps({"toolsSidebarBrandText": sys.argv[1]}, ensure_ascii=False))' "${original_brand}")"
  restore_response="$(http_request "POST" "${api_base_url}/api/setting/website/save" "${token}" "${restore_payload}")"
  restore_http="$(printf '%s\n' "${restore_response}" | sed -n '1p')"
  restore_body="$(printf '%s\n' "${restore_response}" | sed '1d')"
  restore_code="$(printf '%s' "${restore_body}" | json_field "code")"

  if [[ "${verify_brand}" == "${smoke_brand}" ]] \
    && [[ "${public_brand}" == "${smoke_brand}" ]] \
    && [[ "${restore_http}" == "200" ]] \
    && [[ "${restore_code}" == "200" ]]; then
    mark_pass "侧栏单字段保存、前台生效与原值还原闭环通过"
  else
    mark_fail "侧栏保存未完成后台落库、前台生效或原值还原"
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
  "modelId": data.get("currentModelId") or data.get("current",{}).get("modelId") or "koukoutu",
  "mattingProviders": data.get("mattingProviders") or [],
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

# 函数说明：清理本地业务冒烟创建的公众号回复记录，避免重复执行积累测试数据。
cleanup_oa_smoke_replies() {
  local database_name
  database_name="$(read_env_value "${PORTS_ENV_FILE}" "DB_NAME" "uiedtool")"
  compose_cmd exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${database_name}" \
    -e "DELETE FROM la_official_reply WHERE keyword LIKE 'codex\\_smoke\\_%';" \
    >/dev/null 2>&1 || true
}

# 函数说明：验证公众号菜单保存与关键词回复增删改查闭环，确认页面已对接真实接口。
check_oa_management_roundtrip() {
  local api_base_url="$1"
  local token="$2"
  local menu_response menu_http menu_body menu_code menu_payload menu_save_response menu_save_http menu_save_body menu_save_code
  local smoke_suffix smoke_name smoke_keyword add_payload add_response add_http add_body add_code
  local list_response list_http list_body list_code reply_id detail_response detail_http detail_body detail_code
  local edit_payload edit_response edit_http edit_body edit_code status_response status_http status_body status_code
  local reset_response reset_http reset_body reset_code delete_response delete_http delete_body delete_code

  menu_response="$(http_request "GET" "${api_base_url}/api/channel/oaMenu/detail" "${token}")"
  menu_http="$(printf '%s\n' "${menu_response}" | sed -n '1p')"
  menu_body="$(printf '%s\n' "${menu_response}" | sed '1d')"
  menu_code="$(printf '%s' "${menu_body}" | json_field "code")"
  if [[ "${menu_http}" != "200" ]] || [[ "${menu_code}" != "200" ]]; then
    mark_fail "公众号菜单详情读取失败"
    return
  fi
  menu_payload="$(printf '%s' "${menu_body}" | python3 -c 'import json,sys
raw=json.load(sys.stdin)
data=raw.get("data")
print(json.dumps(data if isinstance(data, list) else [], ensure_ascii=False))')"
  menu_save_response="$(http_request "POST" "${api_base_url}/api/channel/oaMenu/save" "${token}" "${menu_payload}")"
  menu_save_http="$(printf '%s\n' "${menu_save_response}" | sed -n '1p')"
  menu_save_body="$(printf '%s\n' "${menu_save_response}" | sed '1d')"
  menu_save_code="$(printf '%s' "${menu_save_body}" | json_field "code")"
  if [[ "${menu_save_http}" != "200" ]] || [[ "${menu_save_code}" != "200" ]]; then
    mark_fail "公众号菜单保存回环失败"
    return
  fi

  cleanup_oa_smoke_replies
  smoke_suffix="$(date +%s)"
  smoke_name="Codex冒烟-${smoke_suffix}"
  smoke_keyword="codex_smoke_${smoke_suffix}"
  add_payload="$(python3 - <<'PY' "${smoke_name}" "${smoke_keyword}"
import json
import sys
print(json.dumps({
  "name": sys.argv[1],
  "type": "keyword",
  "keyword": sys.argv[2],
  "matchingType": 1,
  "contentType": 1,
  "content": "公众号关键词回复冒烟内容",
  "status": 0,
  "sort": 9999,
}, ensure_ascii=False))
PY
)"
  add_response="$(http_request "POST" "${api_base_url}/api/channel/oaReplyKeyword/add" "${token}" "${add_payload}")"
  add_http="$(printf '%s\n' "${add_response}" | sed -n '1p')"
  add_body="$(printf '%s\n' "${add_response}" | sed '1d')"
  add_code="$(printf '%s' "${add_body}" | json_field "code")"
  if [[ "${add_http}" != "200" ]] || [[ "${add_code}" != "200" ]]; then
    cleanup_oa_smoke_replies
    mark_fail "公众号关键词回复新增失败"
    return
  fi

  list_response="$(http_request "GET" "${api_base_url}/api/channel/oaReplyKeyword/list?pageNo=1&pageSize=100" "${token}")"
  list_http="$(printf '%s\n' "${list_response}" | sed -n '1p')"
  list_body="$(printf '%s\n' "${list_response}" | sed '1d')"
  list_code="$(printf '%s' "${list_body}" | json_field "code")"
  reply_id="$(printf '%s' "${list_body}" | python3 -c 'import json,sys
target=sys.argv[1]
raw=json.load(sys.stdin)
items=((raw.get("data") or {}).get("lists") or [])
print(next((item.get("id", "") for item in items if item.get("name") == target), ""))' "${smoke_name}")"
  if [[ "${list_http}" != "200" ]] || [[ "${list_code}" != "200" ]] || [[ -z "${reply_id}" ]]; then
    cleanup_oa_smoke_replies
    mark_fail "公众号关键词回复列表回读失败"
    return
  fi

  detail_response="$(http_request "GET" "${api_base_url}/api/channel/oaReplyKeyword/detail?id=${reply_id}" "${token}")"
  detail_http="$(printf '%s\n' "${detail_response}" | sed -n '1p')"
  detail_body="$(printf '%s\n' "${detail_response}" | sed '1d')"
  detail_code="$(printf '%s' "${detail_body}" | json_field "code")"
  if [[ "${detail_http}" != "200" ]] || [[ "${detail_code}" != "200" ]]; then
    cleanup_oa_smoke_replies
    mark_fail "公众号关键词回复详情回读失败"
    return
  fi

  edit_payload="$(python3 - <<'PY' "${reply_id}" "${smoke_name}" "${smoke_keyword}"
import json
import sys
print(json.dumps({
  "id": int(sys.argv[1]),
  "name": sys.argv[2],
  "type": "keyword",
  "keyword": sys.argv[3],
  "matchingType": 2,
  "contentType": 1,
  "content": "公众号关键词回复冒烟编辑内容",
  "status": 0,
  "sort": 9998,
}, ensure_ascii=False))
PY
)"
  edit_response="$(http_request "POST" "${api_base_url}/api/channel/oaReplyKeyword/edit" "${token}" "${edit_payload}")"
  edit_http="$(printf '%s\n' "${edit_response}" | sed -n '1p')"
  edit_body="$(printf '%s\n' "${edit_response}" | sed '1d')"
  edit_code="$(printf '%s' "${edit_body}" | json_field "code")"
  if [[ "${edit_http}" != "200" ]] || [[ "${edit_code}" != "200" ]]; then
    cleanup_oa_smoke_replies
    mark_fail "公众号关键词回复编辑失败"
    return
  fi

  status_response="$(http_request "POST" "${api_base_url}/api/channel/oaReplyKeyword/status" "${token}" "{\"id\":${reply_id}}")"
  status_http="$(printf '%s\n' "${status_response}" | sed -n '1p')"
  status_body="$(printf '%s\n' "${status_response}" | sed '1d')"
  status_code="$(printf '%s' "${status_body}" | json_field "code")"
  reset_response="$(http_request "POST" "${api_base_url}/api/channel/oaReplyKeyword/status" "${token}" "{\"id\":${reply_id}}")"
  reset_http="$(printf '%s\n' "${reset_response}" | sed -n '1p')"
  reset_body="$(printf '%s\n' "${reset_response}" | sed '1d')"
  reset_code="$(printf '%s' "${reset_body}" | json_field "code")"
  if [[ "${status_http}" != "200" ]] || [[ "${status_code}" != "200" ]] || [[ "${reset_http}" != "200" ]] || [[ "${reset_code}" != "200" ]]; then
    cleanup_oa_smoke_replies
    mark_fail "公众号关键词回复启停回环失败"
    return
  fi

  delete_response="$(http_request "POST" "${api_base_url}/api/channel/oaReplyKeyword/del" "${token}" "{\"id\":${reply_id}}")"
  delete_http="$(printf '%s\n' "${delete_response}" | sed -n '1p')"
  delete_body="$(printf '%s\n' "${delete_response}" | sed '1d')"
  delete_code="$(printf '%s' "${delete_body}" | json_field "code")"
  cleanup_oa_smoke_replies
  if [[ "${delete_http}" == "200" ]] && [[ "${delete_code}" == "200" ]]; then
    mark_pass "公众号菜单保存与回复规则 CRUD 闭环通过"
  else
    mark_fail "公众号关键词回复删除失败"
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
- 覆盖链路: 登录成功与失败提示 / 官网与侧栏保存 / AI模型 / 热榜 / 公众号菜单与回复 / 可选授权运行态
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

check_admin_login_rejection "${API_BASE_URL}"
ADMIN_TOKEN="$(admin_login "${API_BASE_URL}" || true)"
if [[ -z "${ADMIN_TOKEN}" ]]; then
  mark_fail "后台登录失败，请检查管理员账号、验证码或 Redis 链路"
  print_summary
  exit 1
fi
mark_pass "后台管理员登录通过"

check_website_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
check_sidebar_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
check_ai_model_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
check_tool_ranking_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
check_oa_management_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
if [[ "${CHECK_LICENSE_RUNTIME}" == "1" ]]; then
  check_license_roundtrip "${API_BASE_URL}" "${ADMIN_TOKEN}"
else
  mark_pass "授权模块已按当前自用开源模式跳过深度校验"
fi

if curl -fsS --max-time 8 "${TOOLS_BASE_URL}/tools/hot-ranking" >/dev/null 2>&1; then
  mark_pass "前台独立热榜页可访问"
else
  mark_fail "前台独立热榜页不可访问"
fi

print_summary
