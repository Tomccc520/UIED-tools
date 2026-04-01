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
STRICT_FIXED_PORTS="${STRICT_FIXED_PORTS:-1}"

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
  printf "\033[31m[ERROR]\033[0m %s\n" "$1" >&2
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

# 函数说明：读取指定端口的监听 PID，供 PID 文件修复与冲突定位使用
get_listener_pid_by_port() {
  local port="$1"
  lsof -tiTCP:"${port}" -sTCP:LISTEN -Pn 2>/dev/null | head -n 1
}

# 函数说明：校验 PID 是否监听目标端口，避免 PID 复用导致误判
pid_listens_on_port() {
  local pid="$1"
  local port="$2"
  lsof -nP -a -p "${pid}" -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
}

# 函数说明：判断目标 PID 是否属于当前项目目录，避免把无关进程当作本项目进程
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

# 函数说明：固定端口模式下遇到占用直接报错；仅在关闭严格模式时才自动避让
resolve_port_conflict() {
  local current_port="$1"
  local label="$2"
  local pid_file="$3"
  local listener_pid=""

  if [[ -z "${current_port}" ]]; then
    echo ""
    return
  fi

  if is_pid_running "${pid_file}" "${current_port}"; then
    echo "${current_port}"
    return
  fi

  if port_in_use "${current_port}"; then
    listener_pid="$(get_listener_pid_by_port "${current_port}")"
    # 函数说明：当端口被“当前项目旧进程”占用时自动修复 PID 文件，避免固定端口模式误报冲突
    if [[ -n "${listener_pid}" ]] && pid_belongs_to_workspace "${listener_pid}"; then
      echo "${listener_pid}" > "${pid_file}"
      log_info "${label} 检测到历史 PID 已失效，端口 ${current_port} 正由本项目进程占用 (pid=${listener_pid})，已自动修复。"
      echo "${current_port}"
      return
    fi

    if [[ "${STRICT_FIXED_PORTS}" == "1" ]]; then
      log_error_and_exit "${label} 端口 ${current_port} 已被占用。请先执行 bash scripts/dev/stop-fullstack.sh 释放端口后重试。"
    fi
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
  TOOLS_PORT="${TOOLS_PORT:-${PREV_TOOLS_PORT:-5179}}"
  ADMIN_PORT="${ADMIN_PORT:-${PREV_ADMIN_PORT:-5180}}"
  GO_API_PORT="${GO_API_PORT:-${PREV_GO_API_PORT:-8003}}"
  MATTING_PORT="${MATTING_PORT:-${PREV_MATTING_PORT:-8091}}"
  MYSQL_PORT="${MYSQL_PORT:-${PREV_MYSQL_PORT:-33069}}"
  REDIS_PORT="${REDIS_PORT:-${PREV_REDIS_PORT:-16379}}"

  DB_NAME="${DB_NAME:-${PREV_DB_NAME:-uiedtool}}"
  MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-${PREV_MYSQL_ROOT_PASSWORD:-root123456}}"
  MYSQL_USER="${MYSQL_USER:-${PREV_MYSQL_USER:-uiedtool}}"
  MYSQL_PASSWORD="${MYSQL_PASSWORD:-${PREV_MYSQL_PASSWORD:-uiedtool123}}"

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
  local has_core_table
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" >/dev/null

  # 函数说明：仅在检测不到 likeadmin 核心表时执行首次导库，避免重复启动覆盖业务数据
  has_core_table="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}' AND table_name='la_system_auth_admin';" 2>/dev/null || echo "0")"
  if [[ "${FORCE_DB_INIT:-0}" != "1" ]] && [[ "${has_core_table}" -ge 1 ]]; then
    log_info "检测到 ${DB_NAME} 数据表已存在，跳过 SQL 初始化。"
    return
  fi

  if [[ "${FORCE_DB_INIT:-0}" == "1" ]]; then
    log_info "检测到 FORCE_DB_INIT=1，将强制重置并初始化 ${DB_NAME} 数据库..."
  else
    log_info "首次初始化 ${DB_NAME} 数据库..."
  fi
  # 函数说明：显式指定 utf8mb4 导入，避免中文种子数据写入为乱码（????）。
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${LIKEADMIN_DIR}/sql/install.sql"
  log_info "${DB_NAME} 数据库初始化完成。"
}

# 函数说明：检测并修复历史中文乱码种子数据，避免后台菜单和官网配置出现 ????。
repair_garbled_seed_data() {
  local patch_file="${LIKEADMIN_DIR}/sql/patches/20260326_fix_garbled_seed_zhcn.sql"
  local garbled_menu_count="0"
  local garbled_role_count="0"
  local garbled_config_count="0"

  if [[ ! -f "${patch_file}" ]]; then
    return
  fi

  garbled_menu_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_menu WHERE menu_name LIKE '%?%';" 2>/dev/null || echo "0")"
  garbled_role_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_role WHERE name LIKE '%?%' OR remark LIKE '%?%';" 2>/dev/null || echo "0")"
  garbled_config_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_config WHERE type='website' AND value LIKE '%?%';" 2>/dev/null || echo "0")"

  if [[ "${garbled_menu_count}" -le 0 ]] && [[ "${garbled_role_count}" -le 0 ]] && [[ "${garbled_config_count}" -le 0 ]]; then
    return
  fi

  log_info "检测到历史中文乱码数据（菜单:${garbled_menu_count} 角色:${garbled_role_count} 配置:${garbled_config_count}），自动执行修复..."
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${patch_file}"
  log_info "中文乱码修复已完成。"
}

# 函数说明：检测并补齐 la_user.qq_email 字段，确保前台 QQ 邮箱绑定可持久化保存。
apply_user_qq_email_schema_patch() {
  local patch_file="${LIKEADMIN_DIR}/sql/patches/20260328_add_user_qq_email.sql"
  local qq_email_column_count="0"

  if [[ ! -f "${patch_file}" ]]; then
    return
  fi

  qq_email_column_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_user' AND COLUMN_NAME='qq_email';" 2>/dev/null || echo "0")"
  if [[ "${qq_email_column_count}" -ge 1 ]]; then
    return
  fi

  log_info "检测到 la_user 缺少 qq_email 字段，自动执行补丁..."
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${patch_file}"
  log_info "la_user.qq_email 字段补齐完成。"
}

# 函数说明：检测并补齐 la_user 积分字段，确保前台积分体系可正常发放与扣减。
apply_user_points_schema_patch() {
  local patch_file="${LIKEADMIN_DIR}/sql/patches/20260328_add_user_points_columns.sql"
  local points_balance_column_count="0"

  if [[ ! -f "${patch_file}" ]]; then
    return
  fi

  points_balance_column_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_user' AND COLUMN_NAME='points_balance';" 2>/dev/null || echo "0")"
  if [[ "${points_balance_column_count}" -ge 1 ]]; then
    return
  fi

  log_info "检测到 la_user 缺少积分字段，自动执行补丁..."
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${patch_file}"
  log_info "la_user 积分字段补齐完成。"
}

# 函数说明：检测并补齐 la_user 会员字段与 login 会员配置，确保会员基础能力可用。
apply_user_member_schema_patch() {
  local patch_file="${LIKEADMIN_DIR}/sql/patches/20260330_add_user_member_columns_and_login_member_config.sql"
  local member_level_column_count="0"
  local member_config_count="0"

  if [[ ! -f "${patch_file}" ]]; then
    return
  fi

  member_level_column_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_user' AND COLUMN_NAME='member_level';" 2>/dev/null || echo "0")"
  member_config_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_config WHERE type='login' AND name IN ('memberEnabled','memberTrialDays');" 2>/dev/null || echo "0")"
  if [[ "${member_level_column_count}" -ge 1 ]] && [[ "${member_config_count}" -ge 2 ]]; then
    return
  fi

  log_info "检测到会员字段或配置缺失，自动执行会员补丁..."
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${patch_file}"
  log_info "会员字段与配置补齐完成。"
}

# 函数说明：检测并补齐会员套餐/积分包配置与购买流水表，确保会员商业化能力可用。
apply_member_commerce_schema_patch() {
  local patch_file="${LIKEADMIN_DIR}/sql/patches/20260330_add_member_commerce_tables_and_config.sql"
  local order_table_count="0"
  local points_log_table_count="0"
  local config_count="0"

  if [[ ! -f "${patch_file}" ]]; then
    return
  fi

  order_table_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_user_purchase_order';" 2>/dev/null || echo "0")"
  points_log_table_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${DB_NAME}' AND TABLE_NAME='la_user_points_log';" 2>/dev/null || echo "0")"
  config_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_config WHERE type='login' AND name IN ('memberPlans','pointsPacks','memberRightsIntro');" 2>/dev/null || echo "0")"

  if [[ "${order_table_count}" -ge 1 ]] && [[ "${points_log_table_count}" -ge 1 ]] && [[ "${config_count}" -ge 3 ]]; then
    return
  fi

  log_info "检测到会员商业化表或配置缺失，自动执行补丁..."
  compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${patch_file}"
  log_info "会员套餐/积分包/流水补齐完成。"
}

# 函数说明：检测并补齐后台“订单管理”菜单与权限，确保运营端可直接管理会员订单。
apply_member_order_menu_patch() {
  local patch_file="${LIKEADMIN_DIR}/sql/patches/20260330_add_member_order_menu.sql"
  local order_menu_count="0"

  if [[ ! -f "${patch_file}" ]]; then
    return
  fi

  order_menu_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_menu WHERE perms='order:list';" 2>/dev/null || echo "0")"
  if [[ "${order_menu_count}" -ge 1 ]]; then
    return
  fi

  log_info "检测到后台缺少订单管理菜单，自动执行菜单补丁..."
  if compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${patch_file}"; then
    log_info "订单管理菜单补齐完成。"
    return
  fi

  # 函数说明：历史库结构差异可能导致补丁 SQL 失败，此处仅告警不中断全栈启动，避免前端/后台无法联调。
  log_info "订单管理菜单补丁执行失败，已跳过本次补丁并继续启动。请后续检查 ${patch_file} 与当前库结构。"
}

# 函数说明：补齐后台角色与权限基线，避免角色管理/菜单管理无可用数据。
apply_role_permission_baseline_patch() {
  local patch_file="${LIKEADMIN_DIR}/sql/patches/20260331_seed_role_permission_baseline.sql"
  local role_count="0"
  local perm_count="0"
  local super_role_count="0"
  local ops_role_count="0"

  if [[ ! -f "${patch_file}" ]]; then
    return
  fi

  role_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_role;" 2>/dev/null || echo "0")"
  perm_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_perm;" 2>/dev/null || echo "0")"
  super_role_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_role WHERE name='超级管理员';" 2>/dev/null || echo "0")"
  ops_role_count="$(compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql -uroot -Nse "SELECT COUNT(*) FROM \`${DB_NAME}\`.la_system_auth_role WHERE name='运营管理员';" 2>/dev/null || echo "0")"

  # 函数说明：当角色和权限均已具备基础规模时跳过，减少重复执行 SQL。
  if [[ "${role_count}" -ge 3 ]] && [[ "${perm_count}" -ge 30 ]] && [[ "${super_role_count}" -ge 1 ]] && [[ "${ops_role_count}" -ge 1 ]]; then
    return
  fi

  log_info "检测到角色/权限基线不足，自动执行角色权限补丁..."
  if compose_cmd exec -T -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" mysql mysql --default-character-set=utf8mb4 -uroot "${DB_NAME}" < "${patch_file}"; then
    log_info "角色与权限基线补齐完成。"
    return
  fi

  # 函数说明：补丁失败时不阻塞全栈启动，避免影响前后端联调。
  log_info "角色与权限基线补丁执行失败，已跳过本次补丁并继续启动。请后续检查 ${patch_file}。"
}

# 函数说明：检测 PID 文件对应进程是否存活，可选校验端口监听，避免 PID 复用误判
is_pid_running() {
  local pid_file="$1"
  local expected_port="${2:-}"
  local pid=""
  local listener_pid=""

  if [[ ! -f "${pid_file}" ]]; then
    return 1
  fi

  pid="$(cat "${pid_file}")"
  if [[ -z "${pid}" ]]; then
    return 1
  fi

  # 函数说明：优先判断 PID 存活，后续会结合端口监听与监听 PID 自修复，兼容 npm/vite 子进程监听端口的场景
  if ! kill -0 "${pid}" >/dev/null 2>&1; then
    if [[ -z "${expected_port}" ]]; then
      return 1
    fi
    if ! port_in_use "${expected_port}"; then
      return 1
    fi
    listener_pid="$(get_listener_pid_by_port "${expected_port}")"
    if [[ -n "${listener_pid}" ]] && pid_belongs_to_workspace "${listener_pid}"; then
      echo "${listener_pid}" > "${pid_file}"
      return 0
    fi
    return 1
  fi

  if [[ -n "${expected_port}" ]]; then
    if ! port_in_use "${expected_port}"; then
      return 1
    fi
    if pid_listens_on_port "${pid}" "${expected_port}"; then
      return 0
    fi

    # 函数说明：当 PID 是启动壳进程而非真正监听进程时，自动绑定到端口监听 PID，避免“已启动却判定超时”
    listener_pid="$(get_listener_pid_by_port "${expected_port}")"
    if [[ -n "${listener_pid}" ]] && pid_belongs_to_workspace "${listener_pid}"; then
      echo "${listener_pid}" > "${pid_file}"
      return 0
    fi
    return 1
  fi

  return 0
}

# 函数说明：仅校验 PID 是否存活，不包含端口判断，供启动等待阶段使用
is_pid_alive() {
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
  local expected_port="${4:-}"
  local pid_file="${PID_DIR}/${name}.pid"
  local log_file="${LOG_DIR}/${name}.log"

  if is_pid_running "${pid_file}" "${expected_port}"; then
    log_info "${name} 已在运行，跳过启动。"
    return
  fi

  rm -f "${pid_file}"
  : > "${log_file}"
  log_info "启动 ${name}..."
  nohup bash -lc "cd '${cwd}' && ${cmd}" >"${log_file}" 2>&1 &
  echo "$!" >"${pid_file}"

  if [[ -z "${expected_port}" ]]; then
    sleep 2
    if ! is_pid_alive "${pid_file}"; then
      log_error_and_exit "${name} 启动失败，请查看日志: ${log_file}"
    fi
    return
  fi

  local retries="${START_READY_RETRIES:-60}"
  local i
  for ((i = 1; i <= retries; i++)); do
    if is_pid_running "${pid_file}" "${expected_port}"; then
      # 函数说明：端口初次就绪后再做短时稳定性复检，避免出现“启动成功后立即退出”却仍打印 OK 的假成功状态。
      local stable_checks=3
      local j
      for ((j = 1; j <= stable_checks; j++)); do
        sleep 1
        if ! is_pid_running "${pid_file}" "${expected_port}"; then
          log_error_and_exit "${name} 启动后异常退出（端口 ${expected_port} 丢失），请查看日志: ${log_file}"
        fi
      done
      return
    fi
    if ! is_pid_alive "${pid_file}"; then
      log_error_and_exit "${name} 启动失败，请查看日志: ${log_file}"
    fi
    sleep 1
  done

  log_error_and_exit "${name} 启动超时（端口 ${expected_port} 未就绪），请查看日志: ${log_file}"
}

# 函数说明：启动 likeadmin-go 服务端 API
start_likeadmin_server() {
  start_background_process "likeadmin-server" "go run main.go" "${LIKEADMIN_SERVER_DIR}" "${GO_API_PORT}"
}

# 函数说明：启动 likeadmin-go 管理后台前端
start_likeadmin_admin() {
  local cmd="[ -d node_modules ] || npm install; npm run dev -- --host 0.0.0.0 --port ${ADMIN_PORT}"
  start_background_process "likeadmin-admin" "${cmd}" "${LIKEADMIN_ADMIN_DIR}" "${ADMIN_PORT}"
}

# 函数说明：启动 AI 抠图 Python 服务
start_matting_service() {
  local cmd="MATTING_HOST=0.0.0.0 MATTING_PORT=${MATTING_PORT} bash '${ROOT_DIR}/scripts/backend/run-matting-service.sh'"
  start_background_process "matting-service" "${cmd}" "${ROOT_DIR}" "${MATTING_PORT}"
}

# 函数说明：启动当前 tools-web 前端开发服务
start_tools_frontend() {
  local cmd="VITE_BACKEND_PROXY_TARGET=http://127.0.0.1:${GO_API_PORT} VITE_MATTING_PROXY_TARGET=http://127.0.0.1:${MATTING_PORT} npm run dev -- --host 0.0.0.0 --port ${TOOLS_PORT}"
  start_background_process "tools-frontend" "${cmd}" "${ROOT_DIR}" "${TOOLS_PORT}"
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
  repair_garbled_seed_data
  apply_user_qq_email_schema_patch
  apply_user_points_schema_patch
  apply_user_member_schema_patch
  apply_member_commerce_schema_patch
  apply_member_order_menu_patch
  apply_role_permission_baseline_patch
  start_likeadmin_server
  start_likeadmin_admin
  start_matting_service
  start_tools_frontend
  persist_runtime_settings
  print_access_info
}

main "$@"
