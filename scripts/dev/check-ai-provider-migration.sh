#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-04-05

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.runtime"
BACKEND_DIR="${ROOT_DIR}/backend"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-uiedtool_stack}"
COMPOSE_ENV_FILE="${RUNTIME_DIR}/compose.env"
DB_NAME="${DB_NAME:-uiedtool}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root123456}"

LEGACY_ENV_KEYS=(
  "VITE_SILICONFLOW_API_KEY"
  "SILICONFLOW_API_KEY"
  "VITE_DEEPSEEK_API_KEY"
  "DEEPSEEK_API_KEY"
  "VITE_KIMI_API_KEY"
  "VITE_MOONSHOT_API_KEY"
  "KIMI_API_KEY"
  "MOONSHOT_API_KEY"
  "VITE_DOUBAO_API_KEY"
  "VITE_ARK_API_KEY"
  "DOUBAO_API_KEY"
  "ARK_API_KEY"
  "VITE_OPENAI_API_KEY"
  "OPENAI_API_KEY"
)

# 函数说明：统一输出信息日志，便于查看当前核验进度。
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：统一输出成功状态，便于快速判断当前环境是否已完成迁移。
log_ok() {
  printf "\033[32m[OK]\033[0m %s\n" "$1"
}

# 函数说明：统一输出警告信息，提示当前环境仍保留兼容依赖或缺少关键配置。
log_warn() {
  printf "\033[33m[WARN]\033[0m %s\n" "$1"
}

# 函数说明：输出错误并退出，避免在依赖缺失或容器未启动时继续误判。
log_error_and_exit() {
  printf "\033[31m[ERROR]\033[0m %s\n" "$1" >&2
  exit 1
}

# 函数说明：封装 docker compose 调用，复用当前项目的 compose 配置。
compose_cmd() {
  docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：检查本地依赖是否存在，缺失时直接停止核验。
require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_error_and_exit "缺少命令: $1"
  fi
}

# 函数说明：读取数据库中的 AI Provider 与能力配置，供后续统一分析。
query_ai_config_value() {
  local config_name="$1"
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql \
    mysql -uroot -Nse "SELECT value FROM \`${DB_NAME}\`.la_system_config WHERE type='ai_model' AND name='${config_name}' LIMIT 1;" 2>/dev/null || true
}

# 函数说明：扫描前端环境文件中的历史 AI Key，判断当前环境是否仍依赖旧密钥写法。
collect_legacy_env_keys() {
  local env_file=""
  local found_keys=()

  if [[ -f "${ROOT_DIR}/.env.local" ]]; then
    env_file="${ROOT_DIR}/.env.local"
  elif [[ -f "${ROOT_DIR}/.env" ]]; then
    env_file="${ROOT_DIR}/.env"
  else
    return 0
  fi

  for key in "${LEGACY_ENV_KEYS[@]}"; do
    if grep -Eq "^[[:space:]]*${key}[[:space:]]*=" "${env_file}"; then
      found_keys+=("${key}")
    fi
  done

  if [[ ${#found_keys[@]} -gt 0 ]]; then
    printf '%s\n' "${found_keys[@]}"
  fi
}

# 函数说明：使用 Python 解析数据库 JSON 配置，并输出是否满足“可移除兼容迁移”的本地条件。
analyze_ai_configs() {
  local provider_json="$1"
  local image_ability_json="$2"
  local legacy_keys="$3"

  PROVIDER_JSON="${provider_json}" IMAGE_ABILITY_JSON="${image_ability_json}" LEGACY_KEYS="${legacy_keys}" python3 - <<'PY'
import json
import os
import sys

provider_raw = os.environ.get("PROVIDER_JSON", "").strip()
image_raw = os.environ.get("IMAGE_ABILITY_JSON", "").strip()
legacy_keys_raw = os.environ.get("LEGACY_KEYS", "").strip()

providers = json.loads(provider_raw) if provider_raw else []
abilities = json.loads(image_raw) if image_raw else []
legacy_keys = [item for item in legacy_keys_raw.splitlines() if item.strip()]

provider_count = len(providers) if isinstance(providers, list) else 0
ability_count = len(abilities) if isinstance(abilities, list) else 0

default_provider = None
configured_provider_count = 0
for item in providers if isinstance(providers, list) else []:
    api_key = str(item.get("apiKey", "")).strip()
    if api_key:
        configured_provider_count += 1
    if item.get("isDefault"):
        default_provider = item

has_ready_default_provider = bool(
    isinstance(default_provider, dict)
    and str(default_provider.get("apiKey", "")).strip()
    and str(default_provider.get("defaultModel", "")).strip()
    and bool(default_provider.get("enabled"))
)

has_tts_ability = any(
    isinstance(item, dict) and item.get("ability") == "text_to_speech"
    for item in (abilities if isinstance(abilities, list) else [])
)

safe_to_remove = (
    provider_count >= 5
    and ability_count >= 6
    and configured_provider_count >= 1
    and has_ready_default_provider
    and has_tts_ability
    and not legacy_keys
)

print(f"provider_count={provider_count}")
print(f"image_ability_count={ability_count}")
print(f"configured_provider_count={configured_provider_count}")
print(f"has_ready_default_provider={str(has_ready_default_provider).lower()}")
print(f"has_text_to_speech_ability={str(has_tts_ability).lower()}")
print(f"legacy_env_key_count={len(legacy_keys)}")

print("providers:")
for item in providers if isinstance(providers, list) else []:
    provider = str(item.get("provider", "")).strip()
    enabled = bool(item.get("enabled"))
    is_default = bool(item.get("isDefault"))
    has_key = bool(str(item.get("apiKey", "")).strip())
    default_model = str(item.get("defaultModel", "")).strip()
    print(f"  - {provider}: enabled={enabled}, default={is_default}, has_key={has_key}, model={default_model}")

print("abilities:")
for item in abilities if isinstance(abilities, list) else []:
    ability = str(item.get("ability", "")).strip()
    enabled = bool(item.get("enabled"))
    method = str(item.get("method", "")).strip()
    timeout_seconds = item.get("timeoutSeconds")
    print(f"  - {ability}: enabled={enabled}, method={method}, timeout={timeout_seconds}")

if legacy_keys:
    print("legacy_env_keys:")
    for key in legacy_keys:
      print(f"  - {key}")

print(f"safe_to_remove_legacy_sync={str(safe_to_remove).lower()}")
PY
}

require_command docker
require_command python3

if [[ ! -f "${COMPOSE_ENV_FILE}" ]]; then
  log_error_and_exit "未找到 ${COMPOSE_ENV_FILE}，请先执行一次全栈启动脚本。"
fi

if ! compose_cmd ps mysql >/dev/null 2>&1; then
  log_error_and_exit "未检测到 mysql 服务，请先执行 scripts/dev/start-fullstack.sh。"
fi

log_info "开始核验本地 AI Provider 去前端密钥化状态..."

provider_json="$(query_ai_config_value "ai_provider_configs")"
image_ability_json="$(query_ai_config_value "ai_image_ability_configs")"
legacy_keys="$(collect_legacy_env_keys || true)"

if [[ -z "${provider_json}" ]]; then
  log_error_and_exit "数据库中未找到 ai_provider_configs。"
fi

if [[ -z "${image_ability_json}" ]]; then
  log_error_and_exit "数据库中未找到 ai_image_ability_configs。"
fi

analysis_output="$(analyze_ai_configs "${provider_json}" "${image_ability_json}" "${legacy_keys}")"
printf '%s\n' "${analysis_output}"

if printf '%s\n' "${analysis_output}" | grep -q '^safe_to_remove_legacy_sync=true$'; then
  log_ok "当前本地环境已完成去前端密钥化，可以作为删除兼容迁移逻辑的参考样本。"
else
  log_warn "当前本地环境仍建议保留兼容迁移逻辑，待缺失项补齐后再删除。"
fi

