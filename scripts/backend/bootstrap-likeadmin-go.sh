#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend/likeadmin-go"
SERVER_DIR="${BACKEND_DIR}/server"

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-03-21

# 函数说明：打印带颜色的日志，提升初始化过程可读性
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：打印错误并退出，避免静默失败
log_error_and_exit() {
  printf "\033[31m[ERROR]\033[0m %s\n" "$1"
  exit 1
}

# 函数说明：检查 likeadmin-go 目录是否存在，防止误执行
check_backend_exists() {
  if [[ ! -d "${BACKEND_DIR}" ]]; then
    log_error_and_exit "未发现 ${BACKEND_DIR}，请先拉取 likeadmin-go。"
  fi
}

# 函数说明：生成后端服务端环境文件，首次启动可直接编辑
init_server_env() {
  local env_file="${SERVER_DIR}/.env"
  local env_example="${SERVER_DIR}/.env.example"

  if [[ ! -f "${env_example}" ]]; then
    log_error_and_exit "未找到 ${env_example}，无法初始化环境文件。"
  fi

  if [[ -f "${env_file}" ]]; then
    log_info "已存在 ${env_file}，跳过生成。"
    return
  fi

  cp "${env_example}" "${env_file}"
  log_info "已创建 ${env_file}。"
}

# 函数说明：输出下一步操作，保证大版本改造按步骤推进
print_next_steps() {
  cat <<'EOF'
[NEXT] 请按顺序执行：
1) 启动依赖：cd backend && docker compose up -d
2) 配置环境：编辑 backend/likeadmin-go/server/.env（数据库建议使用 uiedtool）
3) 导入SQL：使用 backend/likeadmin-go/sql 下脚本初始化
4) 启动后端：cd backend/likeadmin-go/server && go run main.go
EOF
}

main() {
  check_backend_exists
  init_server_env
  print_next_steps
}

main "$@"
