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

# 函数说明：按 PID 文件停止指定进程，防止僵尸服务残留
stop_process_by_pid_file() {
  local name="$1"
  local pid_file="${PID_DIR}/${name}.pid"
  if [[ ! -f "${pid_file}" ]]; then
    return
  fi

  local pid
  pid="$(cat "${pid_file}")"
  if [[ -n "${pid}" ]] && kill -0 "${pid}" >/dev/null 2>&1; then
    log_info "停止 ${name} (pid=${pid})"
    kill "${pid}" >/dev/null 2>&1 || true
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
  stop_process_by_pid_file "tools-frontend"
  stop_process_by_pid_file "likeadmin-admin"
  stop_process_by_pid_file "likeadmin-server"
  stop_process_by_pid_file "matting-service"
  maybe_stop_database
  log_info "停止完成。"
}

main "$@"
