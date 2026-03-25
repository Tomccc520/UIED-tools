#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-03-21

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.runtime"
PID_DIR="${RUNTIME_DIR}/pids"
BACKEND_DIR="${ROOT_DIR}/backend"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-uiedtool_stack}"
COMPOSE_ENV_FILE="${RUNTIME_DIR}/compose.env"
PORTS_ENV_FILE="${RUNTIME_DIR}/ports.env"
DOWN_DB="${1:-}"

# 函数说明：统一输出信息日志
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：封装 docker compose 调用，统一 project 名称和 env 文件
compose_cmd() {
  if [[ -f "${COMPOSE_ENV_FILE}" ]]; then
    docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
    return
  fi
  docker compose -p "${COMPOSE_PROJECT}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：从 ports.env 读取端口；未命中时使用默认值
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

# 函数说明：校验 PID 是否真实监听目标端口，避免 PID 复用误杀无关进程
pid_listens_on_port() {
  local pid="$1"
  local port="$2"
  if [[ -z "${port}" ]]; then
    return 0
  fi
  lsof -nP -a -p "${pid}" -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
}

# 函数说明：按端口兜底停止进程，解决 PID 文件丢失或过期导致无法停止的问题
stop_process_by_port() {
  local name="$1"
  local expected_port="$2"
  if [[ -z "${expected_port}" ]]; then
    return
  fi

  local pids
  pids="$(lsof -tiTCP:"${expected_port}" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "${pids}" ]]; then
    return
  fi

  local pid
  for pid in ${pids}; do
    if kill -0 "${pid}" >/dev/null 2>&1; then
      log_info "停止 ${name} 端口占用进程 (pid=${pid}, port=${expected_port})"
      kill "${pid}" >/dev/null 2>&1 || true
    fi
  done
}

# 函数说明：按 PID 文件停止指定进程，带端口校验防止误杀
stop_process_by_pid_file() {
  local name="$1"
  local expected_port="${2:-}"
  local pid_file="${PID_DIR}/${name}.pid"
  if [[ ! -f "${pid_file}" ]]; then
    stop_process_by_port "${name}" "${expected_port}"
    return
  fi

  local pid
  pid="$(cat "${pid_file}")"
  if [[ -z "${pid}" ]]; then
    rm -f "${pid_file}"
    stop_process_by_port "${name}" "${expected_port}"
    return
  fi

  if kill -0 "${pid}" >/dev/null 2>&1; then
    if [[ -n "${expected_port}" ]] && ! pid_listens_on_port "${pid}" "${expected_port}"; then
      log_info "检测到 ${name} 旧 PID 无效 (pid=${pid})，改为按端口 ${expected_port} 兜底停止。"
      rm -f "${pid_file}"
      stop_process_by_port "${name}" "${expected_port}"
      return
    fi
    log_info "停止 ${name} (pid=${pid})"
    kill "${pid}" >/dev/null 2>&1 || true
  else
    stop_process_by_port "${name}" "${expected_port}"
  fi
  rm -f "${pid_file}"
}

# 函数说明：根据参数决定是否关闭数据库容器
maybe_stop_database() {
  if [[ "${DOWN_DB}" != "--down-db" ]]; then
    return
  fi

  log_info "停止 MySQL + Redis 容器..."
  compose_cmd down
}

main() {
  local tools_port
  local admin_port
  local go_api_port
  local matting_port

  tools_port="$(read_port_from_env "TOOLS_PORT" "5179")"
  admin_port="$(read_port_from_env "ADMIN_PORT" "5180")"
  go_api_port="$(read_port_from_env "GO_API_PORT" "8003")"
  matting_port="$(read_port_from_env "MATTING_PORT" "8091")"

  stop_process_by_pid_file "tools-frontend" "${tools_port}"
  stop_process_by_pid_file "likeadmin-admin" "${admin_port}"
  stop_process_by_pid_file "likeadmin-server" "${go_api_port}"
  stop_process_by_pid_file "matting-service" "${matting_port}"
  maybe_stop_database
  log_info "停止完成。"
}

main "$@"
