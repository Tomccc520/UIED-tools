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

# 函数说明：读取端口配置，优先读取 ports.env，未命中时使用默认值
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

# 函数说明：读取指定端口监听 PID，供状态兜底判断使用
get_listener_pid_by_port() {
  local port="$1"
  # 函数说明：未监听时返回空字符串而不是非零退出，避免 set -e + pipefail 提前中断状态脚本
  lsof -tiTCP:"${port}" -sTCP:LISTEN -Pn 2>/dev/null | head -n 1 || true
}

# 函数说明：判断 PID 是否属于当前项目，避免把无关服务误判为本项目状态
pid_belongs_to_workspace() {
  local pid="$1"
  local pid_cwd
  local cmdline

  pid_cwd="$(lsof -a -p "${pid}" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1)"
  if [[ -n "${pid_cwd}" ]] && [[ "${pid_cwd}" == "${ROOT_DIR}"* ]]; then
    return 0
  fi

  cmdline="$(ps -p "${pid}" -o command= 2>/dev/null || true)"
  if [[ -n "${cmdline}" ]] && [[ "${cmdline}" == *"${ROOT_DIR}"* ]]; then
    return 0
  fi

  return 1
}

# 函数说明：根据服务名读取预期端口，供状态校验与 PID 自修复使用
get_expected_port_by_name() {
  local name="$1"
  case "${name}" in
    tools-frontend) read_port_from_env "TOOLS_PORT" "5179" ;;
    likeadmin-admin) read_port_from_env "ADMIN_PORT" "5180" ;;
    likeadmin-server) read_port_from_env "GO_API_PORT" "8003" ;;
    matting-service) read_port_from_env "MATTING_PORT" "8091" ;;
    *) echo "" ;;
  esac
}

# 函数说明：输出单个进程状态，便于快速定位未启动项
print_process_status() {
  local name="$1"
  local pid_file="${PID_DIR}/${name}.pid"
  local expected_port
  local port_pid
  expected_port="$(get_expected_port_by_name "${name}")"

  if [[ -f "${pid_file}" ]]; then
    local pid
    pid="$(cat "${pid_file}")"
    if [[ -n "${pid}" ]] && kill -0 "${pid}" >/dev/null 2>&1; then
      printf "[RUNNING] %-18s pid=%s\n" "${name}" "${pid}"
      return
    fi
  fi

  if [[ -n "${expected_port}" ]]; then
    port_pid="$(get_listener_pid_by_port "${expected_port}")"
    if [[ -n "${port_pid}" ]] && pid_belongs_to_workspace "${port_pid}"; then
      mkdir -p "${PID_DIR}"
      echo "${port_pid}" > "${pid_file}"
      printf "[RUNNING] %-18s pid=%s (port=%s, pid已自动修复)\n" "${name}" "${port_pid}" "${expected_port}"
      return
    fi

    if [[ -n "${port_pid}" ]]; then
      printf "[CONFLICT] %-18s port=%s pid=%s (非本项目进程)\n" "${name}" "${expected_port}" "${port_pid}"
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
