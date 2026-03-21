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

# 函数说明：输出单个进程状态，便于快速定位未启动项
print_process_status() {
  local name="$1"
  local pid_file="${PID_DIR}/${name}.pid"
  if [[ -f "${pid_file}" ]]; then
    local pid
    pid="$(cat "${pid_file}")"
    if [[ -n "${pid}" ]] && kill -0 "${pid}" >/dev/null 2>&1; then
      printf "[RUNNING] %-18s pid=%s\n" "${name}" "${pid}"
      return
    fi
  fi
  printf "[STOPPED] %-18s\n" "${name}"
}

# 函数说明：封装 docker compose 调用，统一 project 名称和 env 文件
compose_cmd() {
  if [[ -f "${COMPOSE_ENV_FILE}" ]]; then
    docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
    return
  fi
  docker compose -p "${COMPOSE_PROJECT}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：打印最近一次运行时端口信息，便于快速访问服务
print_runtime_ports() {
  if [[ ! -f "${PORTS_ENV_FILE}" ]]; then
    return
  fi
  echo "[PORTS]"
  grep -E '^(TOOLS_PORT|ADMIN_PORT|GO_API_PORT|MATTING_PORT|MYSQL_PORT|REDIS_PORT|DB_NAME)=' "${PORTS_ENV_FILE}" || true
  echo
}

# 函数说明：输出数据库容器状态，确认基础依赖是否可用
print_database_status() {
  printf "\n[DB] docker compose ps\n"
  compose_cmd ps || true
}

main() {
  print_process_status "tools-frontend"
  print_process_status "likeadmin-admin"
  print_process_status "likeadmin-server"
  print_process_status "matting-service"
  print_runtime_ports
  print_database_status
}

main "$@"
