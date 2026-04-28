#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-04-06

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.runtime"
BACKEND_DIR="${ROOT_DIR}/backend"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-uiedtool_stack}"
COMPOSE_ENV_FILE="${RUNTIME_DIR}/compose.env"
PORTS_ENV_FILE="${RUNTIME_DIR}/ports.env"
DB_NAME="${DB_NAME:-uiedtool}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root123456}"
LICENSE_ADMIN_USERNAME="${LICENSE_ADMIN_USERNAME:-}"
LICENSE_ADMIN_PASSWORD="${LICENSE_ADMIN_PASSWORD:-}"

# 函数说明：统一输出信息日志，便于查看授权运行态自检进度。
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：统一输出成功日志，便于快速判断授权闭环是否通过。
log_ok() {
  printf "\033[32m[OK]\033[0m %s\n" "$1"
}

# 函数说明：统一输出警告日志，用于提示当前仅完成部分检查或存在人工确认项。
log_warn() {
  printf "\033[33m[WARN]\033[0m %s\n" "$1"
}

# 函数说明：统一输出错误并退出，避免在关键依赖缺失时继续误判检查结果。
log_error_and_exit() {
  printf "\033[31m[ERROR]\033[0m %s\n" "$1" >&2
  exit 1
}

# 函数说明：读取端口配置，优先采用当前运行态生成的 ports.env，避免写死端口。
read_port_from_env() {
  local key="$1"
  local default_port="$2"
  if [[ ! -f "${PORTS_ENV_FILE}" ]]; then
    echo "${default_port}"
    return
  fi

  local value
  value="$(grep -E "^${key}=" "${PORTS_ENV_FILE}" | tail -n 1 | cut -d '=' -f2- || true)"
  echo "${value:-${default_port}}"
}

# 函数说明：封装 docker compose 调用，复用当前项目 compose 配置。
compose_cmd() {
  docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：写入 compose 环境文件，供授权脚本读取 Redis 验证码时复用数据库与端口参数。
write_compose_env_file() {
  mkdir -p "${RUNTIME_DIR}"
  cat >"${COMPOSE_ENV_FILE}" <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${DB_NAME}
MYSQL_USER=uiedtool
MYSQL_PASSWORD=uiedtool123
MYSQL_PORT=$(read_port_from_env "MYSQL_PORT" "33069")
REDIS_PORT=$(read_port_from_env "REDIS_PORT" "16379")
TZ=Asia/Shanghai
EOF
}

# 函数说明：检查依赖命令是否存在，缺失时直接终止自检。
require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_error_and_exit "缺少命令: $1"
  fi
}

# 函数说明：执行 MySQL 查询并返回纯文本结果，供后续授权状态分析使用。
query_mysql() {
  local sql="$1"
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql \
    mysql -uroot -Nse "${sql}" 2>/dev/null || true
}

# 函数说明：执行 HTTP 请求并输出“状态码 + 响应体”，避免 shell 里重复写 curl 解析逻辑。
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
      http_code="$(curl -sS -X "${method}" "${url}" \
        -H "Content-Type: application/json" \
        -H "token: ${token}" \
        -d "${payload}" \
        -o "${output_file}" \
        -w "%{http_code}")"
    else
      http_code="$(curl -sS -X "${method}" "${url}" \
        -H "Content-Type: application/json" \
        -d "${payload}" \
        -o "${output_file}" \
        -w "%{http_code}")"
    fi
  else
    if [[ -n "${token}" ]]; then
      http_code="$(curl -sS -X "${method}" "${url}" \
        -H "token: ${token}" \
        -o "${output_file}" \
        -w "%{http_code}")"
    else
      http_code="$(curl -sS -X "${method}" "${url}" \
        -o "${output_file}" \
        -w "%{http_code}")"
    fi
  fi

  printf '%s\n' "${http_code}"
  cat "${output_file}"
  rm -f "${output_file}"
}

# 函数说明：从标准 JSON 响应中读取 code、msg、token 等字段，减少 bash 原生解析复杂度。
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

# 函数说明：读取后台验证码并从 Redis 中取出明文，实现验证码开启场景下的自动登录。
fetch_admin_captcha() {
  local api_base_url="$1"
  local captcha_response
  local captcha_http_code
  local captcha_body
  local captcha_code
  local captcha_on
  local captcha_key
  local redis_code

  captcha_response="$(http_request "GET" "${api_base_url}/api/system/captcha")"
  captcha_http_code="$(printf '%s\n' "${captcha_response}" | sed -n '1p')"
  captcha_body="$(printf '%s\n' "${captcha_response}" | sed '1d')"
  captcha_code="$(printf '%s' "${captcha_body}" | json_field "code")"
  captcha_on="$(printf '%s' "${captcha_body}" | json_field "data.captchaOn")"
  if [[ "${captcha_http_code}" != "200" ]] || [[ "${captcha_code}" != "200" ]]; then
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
  redis_code="$(compose_cmd exec -T redis redis-cli GET "Like:admin:login:captcha:${captcha_key}" 2>/dev/null | tr -d '\r')"
  printf '%s\n%s\n' "${captcha_key}" "${redis_code}"
}

# 函数说明：分析当前授权数据库状态，并给出运行时对受保护接口的预期结果。
analyze_license_runtime() {
  local status="$1"
  local bound_domain="$2"
  local expire_time="$3"
  local last_verify_time="$4"
  local enforce="$5"
  local runtime_host="$6"

  python3 - <<'PY' "${status}" "${bound_domain}" "${expire_time}" "${last_verify_time}" "${enforce}" "${runtime_host}"
import sys
import time
from urllib.parse import urlparse

status = int(sys.argv[1] or "0")
bound_domain = (sys.argv[2] or "").strip()
expire_time = int(sys.argv[3] or "0")
last_verify_time = int(sys.argv[4] or "0")
enforce = int(sys.argv[5] or "0")
runtime_host = (sys.argv[6] or "").strip()

def normalize_domain(value: str) -> str:
    value = value.strip().lower()
    if not value:
        return ""
    if "://" in value:
        parsed = urlparse(value)
        value = parsed.netloc or parsed.path
    if "/" in value:
        value = value.split("/", 1)[0]
    if ":" in value:
        value = value.split(":", 1)[0]
    return value.strip(".")

def is_domain_matched(current: str, bound: str) -> bool:
    current = normalize_domain(current)
    bound = normalize_domain(bound)
    if not current or not bound:
        return False
    return current == bound or current.endswith("." + bound)

expected = "allow"
reason = "授权状态允许当前受保护接口访问。"
now = int(time.time())

if enforce != 1:
    expected = "skip"
    reason = "未开启强制拦截，受保护接口不会执行授权阻断。"
elif status == 3:
    expected = "block"
    reason = "授权已冻结"
elif status != 1:
    expected = "block"
    reason = "授权未激活"
elif expire_time > 0 and expire_time <= now:
    expected = "block"
    reason = "授权已过期"
elif last_verify_time <= 0:
    expected = "block"
    reason = "尚未完成一次成功的远程授权校验"
elif not is_domain_matched(runtime_host, bound_domain):
    expected = "block"
    reason = "绑定域名与当前访问域名不匹配"

print(f"expected_runtime={expected}")
print(f"expected_reason={reason}")
PY
}

# 函数说明：输出字段检查结果，并在关键项缺失时立即终止，避免后续 HTTP 校验失真。
assert_non_empty() {
  local label="$1"
  local value="$2"
  if [[ -z "${value}" ]]; then
    log_error_and_exit "${label} 为空，授权自检无法继续。"
  fi
}

require_command docker
require_command curl
require_command python3

if [[ ! -f "${PORTS_ENV_FILE}" ]]; then
  log_error_and_exit "未找到 ${PORTS_ENV_FILE}，请先执行 scripts/dev/start-fullstack.sh。"
fi
write_compose_env_file

if ! compose_cmd ps mysql >/dev/null 2>&1; then
  log_error_and_exit "未检测到 mysql 服务，请先执行 scripts/dev/start-fullstack.sh。"
fi

GO_API_PORT="$(read_port_from_env "GO_API_PORT" "8003")"
TOOLS_PORT="$(read_port_from_env "TOOLS_PORT" "5179")"
API_BASE_URL="http://127.0.0.1:${GO_API_PORT}"
TOOLS_BASE_URL="http://127.0.0.1:${TOOLS_PORT}"
RUNTIME_HOST="${RUNTIME_HOST:-127.0.0.1}"

log_info "开始执行源码授权运行态自检..."

license_table_count="$(query_mysql "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_system_license';")"
license_row_count="$(query_mysql "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_license;")"
license_menu_count="$(query_mysql "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_menu WHERE perms IN ('setting:license:detail','setting:license:save','setting:license:verify');")"
license_config_count="$(query_mysql "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_config WHERE type='license' AND name IN ('enforce','verifyApiUrl','verifyApiToken','verifyApiMethod','verifyApiTimeout','verifyApiAllowInsecureTls','apiSignSecret');")"
license_column_count="$(query_mysql "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_system_license' AND COLUMN_NAME IN ('edition','raw_status','company_name','domain_limit','domain_whitelist','signature','sign_version','is_signature_valid');")"

printf 'license_table_count=%s\n' "${license_table_count:-0}"
printf 'license_row_count=%s\n' "${license_row_count:-0}"
printf 'license_menu_count=%s\n' "${license_menu_count:-0}"
printf 'license_config_count=%s\n' "${license_config_count:-0}"
printf 'license_column_count=%s\n' "${license_column_count:-0}"

if [[ "${license_table_count:-0}" -lt 1 ]]; then
  log_error_and_exit "授权表 la_system_license 缺失。"
fi
if [[ "${license_row_count:-0}" -lt 1 ]]; then
  log_error_and_exit "授权默认记录缺失。"
fi
if [[ "${license_menu_count:-0}" -lt 3 ]]; then
  log_error_and_exit "授权菜单/按钮权限不完整。"
fi
if [[ "${license_config_count:-0}" -lt 7 ]]; then
  log_error_and_exit "授权配置项不完整。"
fi
if [[ "${license_column_count:-0}" -lt 8 ]]; then
  log_error_and_exit "授权表字段仍是旧版本，请先执行授权升级补丁。"
fi

license_row="$(query_mysql "SELECT JSON_OBJECT('status', COALESCE(status,0), 'boundDomain', COALESCE(bound_domain,''), 'expireTime', COALESCE(expire_time,0), 'lastVerifyTime', COALESCE(last_verify_time,0), 'lastVerifyMessage', COALESCE(last_verify_message,''), 'productCode', COALESCE(product_code,''), 'customerName', COALESCE(customer_name,'')) FROM \`${DB_NAME}\`.la_system_license ORDER BY id ASC LIMIT 1;")"
assert_non_empty "授权记录" "${license_row}"

license_status="$(printf '%s' "${license_row}" | json_field "status")"
bound_domain="$(printf '%s' "${license_row}" | json_field "boundDomain")"
expire_time="$(printf '%s' "${license_row}" | json_field "expireTime")"
last_verify_time="$(printf '%s' "${license_row}" | json_field "lastVerifyTime")"
last_verify_message="$(printf '%s' "${license_row}" | json_field "lastVerifyMessage")"
product_code="$(printf '%s' "${license_row}" | json_field "productCode")"
customer_name="$(printf '%s' "${license_row}" | json_field "customerName")"
enforce_value="$(query_mysql "SELECT COALESCE(value,'0') FROM \`${DB_NAME}\`.la_system_config WHERE type='license' AND name='enforce' LIMIT 1;")"
verify_api_url="$(query_mysql "SELECT COALESCE(value,'') FROM \`${DB_NAME}\`.la_system_config WHERE type='license' AND name='verifyApiUrl' LIMIT 1;")"
verify_api_token="$(query_mysql "SELECT COALESCE(value,'') FROM \`${DB_NAME}\`.la_system_config WHERE type='license' AND name='verifyApiToken' LIMIT 1;")"
verify_api_method="$(query_mysql "SELECT COALESCE(value,'') FROM \`${DB_NAME}\`.la_system_config WHERE type='license' AND name='verifyApiMethod' LIMIT 1;")"
verify_api_timeout="$(query_mysql "SELECT COALESCE(value,'') FROM \`${DB_NAME}\`.la_system_config WHERE type='license' AND name='verifyApiTimeout' LIMIT 1;")"

printf 'license_status=%s\n' "${license_status:-0}"
printf 'bound_domain=%s\n' "${bound_domain:-}"
printf 'expire_time=%s\n' "${expire_time:-0}"
printf 'last_verify_time=%s\n' "${last_verify_time:-0}"
printf 'product_code=%s\n' "${product_code:-}"
printf 'customer_name=%s\n' "${customer_name:-}"
printf 'enforce=%s\n' "${enforce_value:-0}"
printf 'verify_api_url=%s\n' "${verify_api_url:-}"
printf 'verify_api_method=%s\n' "${verify_api_method:-}"
printf 'verify_api_timeout=%s\n' "${verify_api_timeout:-}"
printf 'verify_api_token_present=%s\n' "$([[ -n "${verify_api_token}" ]] && echo true || echo false)"

runtime_analysis="$(analyze_license_runtime "${license_status:-0}" "${bound_domain:-}" "${expire_time:-0}" "${last_verify_time:-0}" "${enforce_value:-0}" "${RUNTIME_HOST}")"
printf '%s\n' "${runtime_analysis}"

public_config_response="$(http_request "GET" "${API_BASE_URL}/api/common/index/config")"
public_config_http_code="$(printf '%s\n' "${public_config_response}" | sed -n '1p')"
public_config_body="$(printf '%s\n' "${public_config_response}" | sed '1d')"
public_config_code="$(printf '%s' "${public_config_body}" | json_field "code")"
printf 'public_config_http=%s\n' "${public_config_http_code}"
printf 'public_config_code=%s\n' "${public_config_code}"

if [[ "${public_config_http_code}" != "200" ]] || [[ "${public_config_code}" != "200" ]]; then
  log_error_and_exit "前台公共配置接口异常：${API_BASE_URL}/api/common/index/config"
fi

frontend_http_code="$(curl -sS -o /dev/null -w "%{http_code}" "${TOOLS_BASE_URL}/")"
printf 'frontend_http=%s\n' "${frontend_http_code}"
if [[ "${frontend_http_code}" != "200" ]]; then
  log_error_and_exit "前台站点首页不可访问：${TOOLS_BASE_URL}/"
fi

if [[ -z "${LICENSE_ADMIN_USERNAME}" ]] || [[ -z "${LICENSE_ADMIN_PASSWORD}" ]]; then
  log_warn "未提供 LICENSE_ADMIN_USERNAME / LICENSE_ADMIN_PASSWORD，已跳过后台登录与授权拦截闭环检查。"
  log_ok "授权基础设施与公共访问链路检查通过。"
  exit 0
fi

captcha_result="$(fetch_admin_captcha "${API_BASE_URL}")" || log_error_and_exit "后台验证码读取失败，无法执行授权登录自检。"
captcha_key="$(printf '%s\n' "${captcha_result}" | sed -n '1p')"
captcha_code="$(printf '%s\n' "${captcha_result}" | sed -n '2p')"

login_payload="$(python3 - <<'PY' "${LICENSE_ADMIN_USERNAME}" "${LICENSE_ADMIN_PASSWORD}" "${captcha_key}" "${captcha_code}"
import json
import sys
payload = {"username": sys.argv[1], "password": sys.argv[2]}
if sys.argv[3].strip() and sys.argv[4].strip():
    payload["captchaKey"] = sys.argv[3].strip()
    payload["captchaCode"] = sys.argv[4].strip()
print(json.dumps(payload, ensure_ascii=False))
PY
)"
login_response="$(http_request "POST" "${API_BASE_URL}/api/system/login" "" "${login_payload}")"
login_http_code="$(printf '%s\n' "${login_response}" | sed -n '1p')"
login_body="$(printf '%s\n' "${login_response}" | sed '1d')"
login_code="$(printf '%s' "${login_body}" | json_field "code")"
login_token="$(printf '%s' "${login_body}" | json_field "data.token")"
printf 'admin_login_http=%s\n' "${login_http_code}"
printf 'admin_login_code=%s\n' "${login_code}"

if [[ "${login_http_code}" != "200" ]] || [[ "${login_code}" != "200" ]] || [[ -z "${login_token}" ]]; then
  log_error_and_exit "后台登录失败，请检查 LICENSE_ADMIN_USERNAME / LICENSE_ADMIN_PASSWORD。"
fi

license_detail_response="$(http_request "GET" "${API_BASE_URL}/api/setting/license/detail" "${login_token}")"
license_detail_http="$(printf '%s\n' "${license_detail_response}" | sed -n '1p')"
license_detail_body="$(printf '%s\n' "${license_detail_response}" | sed '1d')"
license_detail_code="$(printf '%s' "${license_detail_body}" | json_field "code")"
printf 'license_detail_http=%s\n' "${license_detail_http}"
printf 'license_detail_code=%s\n' "${license_detail_code}"
if [[ "${license_detail_http}" != "200" ]] || [[ "${license_detail_code}" != "200" ]]; then
  log_error_and_exit "授权详情接口未按白名单放行。"
fi

menu_route_response="$(http_request "GET" "${API_BASE_URL}/api/system/menu/route" "${login_token}")"
menu_route_http="$(printf '%s\n' "${menu_route_response}" | sed -n '1p')"
menu_route_body="$(printf '%s\n' "${menu_route_response}" | sed '1d')"
menu_route_code="$(printf '%s' "${menu_route_body}" | json_field "code")"
printf 'menu_route_http=%s\n' "${menu_route_http}"
printf 'menu_route_code=%s\n' "${menu_route_code}"
if [[ "${menu_route_http}" != "200" ]] || [[ "${menu_route_code}" != "200" ]]; then
  log_error_and_exit "菜单路由接口未按白名单放行。"
fi

self_response="$(http_request "GET" "${API_BASE_URL}/api/system/admin/self" "${login_token}")"
self_http="$(printf '%s\n' "${self_response}" | sed -n '1p')"
self_body="$(printf '%s\n' "${self_response}" | sed '1d')"
self_code="$(printf '%s' "${self_body}" | json_field "code")"
printf 'admin_self_http=%s\n' "${self_http}"
printf 'admin_self_code=%s\n' "${self_code}"
if [[ "${self_http}" != "200" ]] || [[ "${self_code}" != "200" ]]; then
  log_error_and_exit "管理员自身信息接口未按白名单放行。"
fi

protected_response="$(http_request "GET" "${API_BASE_URL}/api/setting/website/detail" "${login_token}")"
protected_http="$(printf '%s\n' "${protected_response}" | sed -n '1p')"
protected_body="$(printf '%s\n' "${protected_response}" | sed '1d')"
protected_code="$(printf '%s' "${protected_body}" | json_field "code")"
protected_msg="$(printf '%s' "${protected_body}" | json_field "msg")"
expected_runtime="$(printf '%s\n' "${runtime_analysis}" | sed -n 's/^expected_runtime=//p')"
printf 'protected_detail_http=%s\n' "${protected_http}"
printf 'protected_detail_code=%s\n' "${protected_code}"
printf 'protected_detail_msg=%s\n' "${protected_msg}"

if [[ "${expected_runtime}" == "allow" ]] && [[ "${protected_http}" != "200" || "${protected_code}" != "200" ]]; then
  log_error_and_exit "当前授权状态应允许访问受保护接口，但 /api/setting/website/detail 返回异常。"
fi

if [[ "${expected_runtime}" == "block" ]] && [[ "${protected_http}" != "200" || "${protected_code}" != "334" ]]; then
  log_error_and_exit "当前授权状态应阻断受保护接口，但 /api/setting/website/detail 未返回 LicenseInvalid。"
fi

log_ok "源码授权运行态自检通过：公共访问、白名单放行与后台受保护接口拦截表现符合预期。"
