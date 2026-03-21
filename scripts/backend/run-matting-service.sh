#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-03-21

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICE_DIR="${ROOT_DIR}/backend/matting-service"
VENV_DIR="${SERVICE_DIR}/.venv"
HOST="${MATTING_HOST:-127.0.0.1}"
PORT="${MATTING_PORT:-8091}"
WORKERS="${MATTING_WORKERS:-1}"

# 函数说明：统一输出信息日志，便于新手排查运行步骤
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：统一输出错误并退出，避免后续步骤误执行
log_error_and_exit() {
  printf "\033[31m[ERROR]\033[0m %s\n" "$1"
  exit 1
}

# 函数说明：检查 Python3 是否可用
check_python() {
  if ! command -v python3 >/dev/null 2>&1; then
    log_error_and_exit "未检测到 python3，请先在宝塔安装 Python 3.10+。"
  fi
}

# 函数说明：初始化虚拟环境并安装依赖
install_deps() {
  cd "${SERVICE_DIR}"

  if [[ ! -d "${VENV_DIR}" ]]; then
    log_info "首次运行，正在创建虚拟环境..."
    python3 -m venv "${VENV_DIR}"
  fi

  # shellcheck source=/dev/null
  source "${VENV_DIR}/bin/activate"
  python -m pip install --upgrade pip
  pip install -r requirements.txt
}

# 函数说明：启动 FastAPI 服务并监听本地端口
start_service() {
  cd "${SERVICE_DIR}"
  # shellcheck source=/dev/null
  source "${VENV_DIR}/bin/activate"

  log_info "正在启动 matting-service: ${HOST}:${PORT}, workers=${WORKERS}"
  exec uvicorn app:app --host "${HOST}" --port "${PORT}" --workers "${WORKERS}"
}

main() {
  [[ -d "${SERVICE_DIR}" ]] || log_error_and_exit "目录不存在: ${SERVICE_DIR}"
  check_python
  install_deps
  start_service
}

main "$@"

