#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-03-21

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.runtime"
LOG_DIR="${RUNTIME_DIR}/logs"
PID_DIR="${RUNTIME_DIR}/pids"
BACKEND_DIR="${ROOT_DIR}/backend"
LIKEADMIN_DIR="${BACKEND_DIR}/likeadmin-go"
LIKEADMIN_SERVER_DIR="${LIKEADMIN_DIR}/server"
LIKEADMIN_ADMIN_DIR="${LIKEADMIN_DIR}/admin"
COMPOSE_PROJECT="${COMPOSE_PROJECT:-uiedtool_stack}"
COMPOSE_ENV_FILE="${RUNTIME_DIR}/compose.env"
PORTS_ENV_FILE="${RUNTIME_DIR}/ports.env"

TOOLS_PORT="${TOOLS_PORT:-}"
ADMIN_PORT="${ADMIN_PORT:-}"
GO_API_PORT="${GO_API_PORT:-}"
MATTING_PORT="${MATTING_PORT:-}"
MYSQL_PORT="${MYSQL_PORT:-}"
REDIS_PORT="${REDIS_PORT:-}"
DB_NAME="${DB_NAME:-}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
MYSQL_USER="${MYSQL_USER:-}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"

PREV_TOOLS_PORT=""
PREV_ADMIN_PORT=""
PREV_GO_API_PORT=""
PREV_MATTING_PORT=""
PREV_MYSQL_PORT=""
PREV_REDIS_PORT=""
PREV_DB_NAME=""
PREV_MYSQL_ROOT_PASSWORD=""
PREV_MYSQL_USER=""
PREV_MYSQL_PASSWORD=""

# 函数说明：统一输出信息日志，方便新手理解执行进度
log_info() {
  printf "\033[36m[INFO]\033[0m %s\n" "$1"
}

# 函数说明：统一输出错误并退出，避免后续步骤继续执行
log_error_and_exit() {
  printf "\033[31m[ERROR]\033[0m %s\n" "$1"
  exit 1
}

# 函数说明：检查命令是否安装，提前给出缺失依赖提示
require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_error_and_exit "缺少命令: $1"
  fi
}

# 函数说明：创建运行时目录，用于记录日志和进程 PID
init_runtime_dirs() {
  mkdir -p "${LOG_DIR}" "${PID_DIR}"
}

# 函数说明：封装 docker compose 调用，统一 project 名称和 env 文件
compose_cmd() {
  docker compose -p "${COMPOSE_PROJECT}" --env-file "${COMPOSE_ENV_FILE}" -f "${BACKEND_DIR}/docker-compose.yml" "$@"
}

# 函数说明：检查 likeadmin-go 基座是否已拉取
check_likeadmin_exists() {
  if [[ ! -d "${LIKEADMIN_SERVER_DIR}" ]]; then
    log_error_and_exit "未发现 ${LIKEADMIN_SERVER_DIR}，请先拉取 likeadmin-go。"
  fi
}

# 函数说明：判断端口是否正在监听
port_in_use() {
  local port="$1"
  lsof -iTCP:"${port}" -sTCP:LISTEN -Pn >/dev/null 2>&1
}

# 函数说明：在给定起始端口基础上自动找到可用端口，避免冲突
find_available_port() {
  local preferred="$1"
  local label="$2"
  local port="${preferred}"
  local max_tries=80
  local i

  for ((i = 1; i <= max_tries; i++)); do
    if ! port_in_use "${port}"; then
      if [[ "${port}" != "${preferred}" ]]; then
        log_info "${label} 端口 ${preferred} 已占用，自动切换到 ${port}" >&2
      fi
      echo "${port}"
      return 0
    fi
    port=$((port + 1))
  done

  log_error_and_exit "${label} 在 ${preferred} 附近未找到可用端口。"
}

# 函数说明：当端口被占用时自动避让；若对应服务已在运行则保持当前端口
resolve_port_conflict() {
  local current_port="$1"
  local label="$2"
  local pid_file="$3"

  if [[ -z "${current_port}" ]]; then
    echo ""
    return
  fi

  if is_pid_running "${pid_file}"; then
    echo "${current_port}"
    return
  fi

  if port_in_use "${current_port}"; then
    find_available_port "${current_port}" "${label}"
    return
  fi

  echo "${current_port}"
}

# 函数说明：读取历史运行端口，保证重复启动时端口稳定
load_previous_ports() {
  if [[ ! -f "${PORTS_ENV_FILE}" ]]; then
    return
  fi

  while IFS='=' read -r key value; do
    case "${key}" in
      TOOLS_PORT) PREV_TOOLS_PORT="${value}" ;;
      ADMIN_PORT) PREV_ADMIN_PORT="${value}" ;;
      GO_API_PORT) PREV_GO_API_PORT="${value}" ;;
      MATTING_PORT) PREV_MATTING_PORT="${value}" ;;
      MYSQL_PORT) PREV_MYSQL_PORT="${value}" ;;
      REDIS_PORT) PREV_REDIS_PORT="${value}" ;;
      DB_NAME) PREV_DB_NAME="${value}" ;;
      MYSQL_ROOT_PASSWORD) PREV_MYSQL_ROOT_PASSWORD="${value}" ;;
      MYSQL_USER) PREV_MYSQL_USER="${value}" ;;
      MYSQL_PASSWORD) PREV_MYSQL_PASSWORD="${value}" ;;
    esac
  done < "${PORTS_ENV_FILE}"
}

# 函数说明：确定所有服务端口与数据库参数，优先使用环境变量，其次复用历史值
resolve_runtime_settings() {
  TOOLS_PORT="${TOOLS_PORT:-${PREV_TOOLS_PORT}}"
  ADMIN_PORT="${ADMIN_PORT:-${PREV_ADMIN_PORT}}"
  GO_API_PORT="${GO_API_PORT:-${PREV_GO_API_PORT}}"
  MATTING_PORT="${MATTING_PORT:-${PREV_MATTING_PORT}}"
  MYSQL_PORT="${MYSQL_PORT:-${PREV_MYSQL_PORT}}"
  REDIS_PORT="${REDIS_PORT:-${PREV_REDIS_PORT}}"

  DB_NAME="${DB_NAME:-${PREV_DB_NAME:-uiedtool}}"
  MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-${PREV_MYSQL_ROOT_PASSWORD:-root123456}}"
  MYSQL_USER="${MYSQL_USER:-${PREV_MYSQL_USER:-uiedtool}}"
  MYSQL_PASSWORD="${MYSQL_PASSWORD:-${PREV_MYSQL_PASSWORD:-uiedtool123}}"

  if [[ -z "${TOOLS_PORT}" ]]; then
    TOOLS_PORT="$(find_available_port 5179 "tools-frontend")"
  fi
  if [[ -z "${ADMIN_PORT}" ]]; then
    ADMIN_PORT="$(find_available_port 5180 "likeadmin-admin")"
  fi
  if [[ -z "${GO_API_PORT}" ]]; then
    GO_API_PORT="$(find_available_port 8001 "likeadmin-server")"
  fi
  if [[ -z "${MATTING_PORT}" ]]; then
    MATTING_PORT="$(find_available_port 8091 "matting-service")"
  fi
  if [[ -z "${MYSQL_PORT}" ]]; then
    MYSQL_PORT="$(find_available_port 33069 "mysql")"
  fi
  if [[ -z "${REDIS_PORT}" ]]; then
    REDIS_PORT="$(find_available_port 16379 "redis")"
  fi

  TOOLS_PORT="$(resolve_port_conflict "${TOOLS_PORT}" "tools-frontend" "${PID_DIR}/tools-frontend.pid")"
  ADMIN_PORT="$(resolve_port_conflict "${ADMIN_PORT}" "likeadmin-admin" "${PID_DIR}/likeadmin-admin.pid")"
  GO_API_PORT="$(resolve_port_conflict "${GO_API_PORT}" "likeadmin-server" "${PID_DIR}/likeadmin-server.pid")"
  MATTING_PORT="$(resolve_port_conflict "${MATTING_PORT}" "matting-service" "${PID_DIR}/matting-service.pid")"
}

# 函数说明：写入 compose 环境文件，驱动数据库端口和库名配置
write_compose_env_file() {
  cat >"${COMPOSE_ENV_FILE}" <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${DB_NAME}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_PORT=${MYSQL_PORT}
REDIS_PORT=${REDIS_PORT}
TZ=Asia/Shanghai
EOF
}

# 函数说明：持久化当前运行参数，便于下次复用端口和数据库配置
persist_runtime_settings() {
  cat >"${PORTS_ENV_FILE}" <<EOF
TOOLS_PORT=${TOOLS_PORT}
ADMIN_PORT=${ADMIN_PORT}
GO_API_PORT=${GO_API_PORT}
MATTING_PORT=${MATTING_PORT}
MYSQL_PORT=${MYSQL_PORT}
REDIS_PORT=${REDIS_PORT}
DB_NAME=${DB_NAME}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
EOF
}

# 函数说明：等待 MySQL 服务可用，避免导入 SQL 失败
wait_for_mysql_ready() {
  local retries=40
  local i
  for ((i = 1; i <= retries; i++)); do
    if compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysqladmin ping -h127.0.0.1 -uroot --silent >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# 函数说明：启动 MySQL 与 Redis 容器，作为后台基础依赖
start_database_stack() {
  log_info "启动 MySQL + Redis..."
  compose_cmd up -d mysql redis

  if ! wait_for_mysql_ready; then
    log_error_and_exit "MySQL 启动超时，请检查 Docker 日志。"
  fi
  log_info "数据库与缓存服务已就绪。"
}

# 函数说明：设置或更新环境变量键值，避免 sed 转义问题
set_env_key() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp_file
  tmp_file="$(mktemp)"

  awk -v k="${key}" -v v="${value}" '
    BEGIN { found=0 }
    $0 ~ "^" k "=" {
      print k "=" v
      found=1
      next
    }
    { print }
    END {
      if (!found) print k "=" v
    }
  ' "${file}" > "${tmp_file}"

  mv "${tmp_file}" "${file}"
}

# 函数说明：初始化 likeadmin-go 的 .env 配置并替换为本地联调参数
configure_likeadmin_server_env() {
  local env_file="${LIKEADMIN_SERVER_DIR}/.env"
  local env_example="${LIKEADMIN_SERVER_DIR}/.env.example"
  local db_url
  local redis_url

  if [[ ! -f "${env_file}" ]]; then
    cp "${env_example}" "${env_file}"
  fi

  db_url="'root:${MYSQL_ROOT_PASSWORD}@tcp(127.0.0.1:${MYSQL_PORT})/${DB_NAME}?charset=utf8mb4&parseTime=True&loc=Local'"
  redis_url="'redis://127.0.0.1:${REDIS_PORT}'"

  set_env_key "${env_file}" "SERVER_PORT" "${GO_API_PORT}"
  set_env_key "${env_file}" "PUBLIC_URL" "'http://127.0.0.1:${GO_API_PORT}'"
  set_env_key "${env_file}" "DATABASE_URL" "${db_url}"
  set_env_key "${env_file}" "REDIS_URL" "${redis_url}"
  set_env_key "${env_file}" "UPLOAD_DIRECTORY" "'/tmp/uploads/likeadmin-go/'"
}

# 函数说明：写入后台管理端本地 API 地址，避免联调跨域配置混乱
configure_likeadmin_admin_env() {
  local env_file="${LIKEADMIN_ADMIN_DIR}/.env.development.local"
  cat >"${env_file}" <<EOF
NODE_ENV='development'
VITE_APP_BASE_URL='http://127.0.0.1:${GO_API_PORT}'
EOF
}

# 函数说明：自动检测并初始化 likeadmin 数据库表结构
init_likeadmin_database() {
  local has_table
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" >/dev/null
  has_table="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}' AND table_name='la_admin';" 2>/dev/null || echo "0")"
  if [[ "${has_table}" == "1" ]]; then
    log_info "检测到 ${DB_NAME} 数据表已存在，跳过 SQL 初始化。"
    return
  fi

  log_info "首次初始化 ${DB_NAME} 数据库..."
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot "${DB_NAME}" < "${LIKEADMIN_DIR}/sql/install.sql"
  log_info "${DB_NAME} 数据库初始化完成。"
}

# 函数说明：检测 PID 文件对应进程是否存活
is_pid_running() {
  local pid_file="$1"
  if [[ ! -f "${pid_file}" ]]; then
    return 1
  fi
  local pid
  pid="$(cat "${pid_file}")"
  if [[ -z "${pid}" ]]; then
    return 1
  fi
  kill -0 "${pid}" >/dev/null 2>&1
}

# 函数说明：通用后台启动器，统一管理日志和 PID，并在失败时快速提示日志
start_background_process() {
  local name="$1"
  local cmd="$2"
  local cwd="$3"
  local pid_file="${PID_DIR}/${name}.pid"
  local log_file="${LOG_DIR}/${name}.log"

  if is_pid_running "${pid_file}"; then
    log_info "${name} 已在运行，跳过启动。"
    return
  fi

  rm -f "${pid_file}"
  : > "${log_file}"
  log_info "启动 ${name}..."
  nohup bash -lc "cd '${cwd}' && ${cmd}" >"${log_file}" 2>&1 &
  echo "$!" >"${pid_file}"

  sleep 2
  if ! is_pid_running "${pid_file}"; then
    log_error_and_exit "${name} 启动失败，请查看日志: ${log_file}"
  fi
}

# 函数说明：启动 likeadmin-go 服务端 API
start_likeadmin_server() {
  start_background_process "likeadmin-server" "go run main.go" "${LIKEADMIN_SERVER_DIR}"
}

# 函数说明：启动 likeadmin-go 管理后台前端
start_likeadmin_admin() {
  local cmd="[ -d node_modules ] || npm install; npm run dev -- --host 0.0.0.0 --port ${ADMIN_PORT}"
  start_background_process "likeadmin-admin" "${cmd}" "${LIKEADMIN_ADMIN_DIR}"
}

# 函数说明：启动 AI 抠图 Python 服务
start_matting_service() {
  local cmd="MATTING_HOST=0.0.0.0 MATTING_PORT=${MATTING_PORT} bash '${ROOT_DIR}/scripts/backend/run-matting-service.sh'"
  start_background_process "matting-service" "${cmd}" "${ROOT_DIR}"
}

# 函数说明：启动当前 tools-web 前端开发服务
start_tools_frontend() {
  local cmd="npm run dev -- --host 0.0.0.0 --port ${TOOLS_PORT}"
  start_background_process "tools-frontend" "${cmd}" "${ROOT_DIR}"
}

# 函数说明：输出本次一键启动后的访问入口，便于直接验证
print_access_info() {
  cat <<EOF

[OK] 全栈服务启动命令已下发，请稍等 10~30 秒后访问：
- 工具前端: http://127.0.0.1:${TOOLS_PORT}
- 后台前端: http://127.0.0.1:${ADMIN_PORT}
- 后台API:  http://127.0.0.1:${GO_API_PORT}
- 抠图健康检查: http://127.0.0.1:${MATTING_PORT}/health
- MySQL: 127.0.0.1:${MYSQL_PORT} (db=${DB_NAME})
- Redis: 127.0.0.1:${REDIS_PORT}

日志目录: ${LOG_DIR}
PID目录:  ${PID_DIR}
EOF
}

main() {
  require_command docker
  require_command npm
  require_command go
  require_command python3
  require_command lsof
  check_likeadmin_exists
  init_runtime_dirs
  load_previous_ports
  resolve_runtime_settings
  write_compose_env_file
  start_database_stack
  configure_likeadmin_server_env
  configure_likeadmin_admin_env
  init_likeadmin_database
  start_likeadmin_server
  start_likeadmin_admin
  start_matting_service
  start_tools_frontend
  persist_runtime_settings
  print_access_info
}

main "$@"
