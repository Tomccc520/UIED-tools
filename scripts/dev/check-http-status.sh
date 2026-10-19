#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-10-05

BASE_URL="${UIEDTOOL_HTTP_BASE_URL:-https://uiedtool.com}"
WWW_BASE_URL="${UIEDTOOL_HTTP_WWW_BASE_URL:-https://www.uiedtool.com}"
CANONICAL_BASE_URL="${UIEDTOOL_HTTP_CANONICAL_BASE_URL:-https://uiedtool.com}"
KNOWN_ROUTE="${UIEDTOOL_HTTP_KNOWN_ROUTE:-/tools/json}"
UNKNOWN_ROUTE="${UIEDTOOL_HTTP_UNKNOWN_ROUTE:-/this-route-does-not-exist-xyz}"

# 函数说明：读取指定地址的 HTTP 状态码，允许 4xx 响应进入断言流程。
# 参数：url 待检查地址；返回值：HTTP 状态码。
http_status() {
  local url="$1"
  curl -sS --max-time 10 -o /dev/null -w '%{http_code}' "${url}"
}

# 函数说明：断言站点已知路由和未知路由的 HTTP 状态，避免只依赖浏览器页面文字判断软 404。
# 参数：label 检查项名称、route 待检查路径、expected 期望状态码。
assert_status() {
  local label="$1"
  local route="$2"
  local expected="$3"
  local url="${BASE_URL%/}${route}"
  local actual
  actual="$(http_status "${url}")"
  if [[ "${actual}" != "${expected}" ]]; then
    printf '[FAIL] %s: %s 返回 %s，期望 %s\n' "${label}" "${url}" "${actual}" "${expected}" >&2
    return 1
  fi
  printf '[PASS] %s: %s -> %s\n' "${label}" "${url}" "${actual}"
}

assert_status '已知前台路由' "${KNOWN_ROUTE}" '200'
assert_status '已知前台路由尾斜杠' "${KNOWN_ROUTE%/}/" '200'
assert_status '未知前台路由' "${UNKNOWN_ROUTE}" '404'
assert_status '未知工具路由' '/tools/qa-missing-20261018' '404'
assert_status '明确 404 地址' '/404' '404'

# 函数说明：检查错误页响应头，避免 404 页面继续被搜索引擎索引。
assert_noindex() {
  local url="${BASE_URL%/}${1:-${UNKNOWN_ROUTE}}"
  local headers
  headers="$(curl -sS --max-time 10 -D - -o /dev/null "${url}")"
  if ! grep -qi 'x-robots-tag:.*noindex' <<<"${headers}"; then
    printf '[FAIL] 404 响应缺少 X-Robots-Tag noindex: %s\n' "${url}" >&2
    return 1
  fi
  printf '[PASS] 404 响应包含 X-Robots-Tag noindex\n'
}

assert_noindex
assert_noindex '/404'

# 函数说明：检查统一错误页正文，确保用户能确认地址不存在且不会看到首页文案。
assert_error_body() {
  local url="${BASE_URL%/}${UNKNOWN_ROUTE}"
  local body
  body="$(curl -sS --max-time 10 "${url}")"
  if ! grep -q '页面不存在' <<<"${body}"; then
    printf '[FAIL] 404 响应正文缺少“页面不存在”提示: %s\n' "${url}" >&2
    return 1
  fi
  if grep -q 'UIED数字工具工作台\|每个任务，都有一把顺手的工具' <<<"${body}"; then
    printf '[FAIL] 404 响应仍返回首页文案: %s\n' "${url}" >&2
    return 1
  fi
  printf '[PASS] 404 响应正文包含明确错误提示\n'
}

assert_error_body

# 函数说明：使用真实 HTTP 请求确认历史地址和 www 域永久跳转，并保留路径和查询参数。
# 参数：url 请求地址；expected 完整跳转地址；host 可选 Host 请求头。
assert_redirect() {
  local url="$1" expected="$2" host="${3:-}" headers status location
  if [[ -n "${host}" ]]; then
    headers="$(curl -sS --max-time 10 -D - -o /dev/null -H "Host: ${host}" "${url}")"
  else
    headers="$(curl -sS --max-time 10 -D - -o /dev/null "${url}")"
  fi
  status="$(awk '/^HTTP\// {code=$2} END {print code}' <<<"${headers}")"
  location="$(awk 'tolower($1)=="location:" {sub(/\r$/, "", $2); print $2}' <<<"${headers}")"
  if [[ ! "${status}" =~ ^(301|308)$ || "${location}" != "${expected}" ]]; then
    printf '[FAIL] 永久跳转: %s -> %s %s，期望 301/308 %s\n' "${url}" "${status}" "${location}" "${expected}" >&2
    return 1
  fi
  printf '[PASS] 永久跳转: %s -> %s\n' "${url}" "${location}"
}

assert_redirect "${BASE_URL%/}/tools/css-format?source=seo&value=1" \
  "${BASE_URL%/}/tools/cssformat?source=seo&value=1"
assert_redirect "${BASE_URL%/}/tools/random-password" "${BASE_URL%/}/tools/randompassword"
assert_redirect "${BASE_URL%/}/tools/ai/outsource-quote" "${BASE_URL%/}/tools/ai-outsource-quote"
assert_redirect "${WWW_BASE_URL%/}/tools/json?source=seo&value=1" \
  "${CANONICAL_BASE_URL%/}/tools/json?source=seo&value=1" 'www.uiedtool.com'

node "$(dirname "${BASH_SOURCE[0]}")/check-sitemap-http.mjs"
