#!/usr/bin/env bash

set -euo pipefail

# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-08-22

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${RELEASE_VERSION:-$(node -p "require('${ROOT_DIR}/package.json').version")}"
OUTPUT_DIR="${ROOT_DIR}/output"
RELEASE_NAME="uiedtool-${VERSION}"
SOURCE_REVISION="$(git -C "${ROOT_DIR}" rev-parse --short HEAD)"
PRODUCTION_DIR="${OUTPUT_DIR}/production/${RELEASE_NAME}"
STAGING_DIR="${OUTPUT_DIR}/.release-staging"
RELEASE_DIR="${STAGING_DIR}/${RELEASE_NAME}"
RUNTIME_NAME="${RELEASE_NAME}-runtime"
RUNTIME_DIR="${STAGING_DIR}/${RUNTIME_NAME}"
RUNTIME_ARCHIVE_PATH="${PRODUCTION_DIR}/${RUNTIME_NAME}.tar.gz"
BAOTA_BUNDLE_NAME="${RELEASE_NAME}-baota-deploy-${SOURCE_REVISION}"
BAOTA_BUNDLE_DIR="${STAGING_DIR}/${BAOTA_BUNDLE_NAME}"
BAOTA_BUNDLE_PATH="${PRODUCTION_DIR}/${BAOTA_BUNDLE_NAME}.tar.gz"
BACKEND_DIR="${ROOT_DIR}/backend/likeadmin-go"
SERVER_DIR="${BACKEND_DIR}/server"
RELEASE_PATCH_FILES=(
  "20260823_fix_site_brand.sql"
  "20260825_enable_self_use_mode.sql"
  "20260825_fix_changelog_tools_count.sql"
  "20260825_open_source_changelog.sql"
  "20260825_refresh_siliconflow_models.sql"
  "20260826_add_operation_advertising_menu_compatible.sql"
  "20260826_add_ai_provider_models_permission.sql"
  "20260826_restore_uied_tools_brand.sql"
)

# 函数说明：确认发布所需的前端和管理端产物已经完成生产构建。
require_build_artifacts() {
  local required_paths=(
    "${ROOT_DIR}/dist/index.html"
    "${BACKEND_DIR}/admin/dist/index.html"
    "${BACKEND_DIR}/sql/install.sql"
  )

  for required_path in "${required_paths[@]}"; do
    if [[ ! -f "${required_path}" ]]; then
      printf "缺少发布产物: %s\n" "${required_path}" >&2
      return 1
    fi
  done
}

# 函数说明：为 CentOS 7 服务器构建无 CGO 依赖的 Linux amd64 Go API。
build_server_binary() {
  mkdir -p "${RELEASE_DIR}/server"
  (
    cd "${SERVER_DIR}"
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
      go build -trimpath -ldflags='-s -w' -o "${RELEASE_DIR}/server/uiedtool-api" .
  )
}

# 函数说明：组装主站、管理端、服务配置、数据库和部署文档。
assemble_release_files() {
  mkdir -p \
    "${RELEASE_DIR}/web" \
    "${RELEASE_DIR}/admin" \
    "${RELEASE_DIR}/server/static" \
    "${RELEASE_DIR}/nginx" \
    "${RELEASE_DIR}/sql" \
    "${RELEASE_DIR}/docs"

  cp -R "${ROOT_DIR}/dist/." "${RELEASE_DIR}/web/"
  cp -R "${BACKEND_DIR}/admin/dist/." "${RELEASE_DIR}/admin/"
  cp -R "${SERVER_DIR}/static/." "${RELEASE_DIR}/server/static/"
  cp "${ROOT_DIR}/deploy/env/uiedtool-api.env.example" "${RELEASE_DIR}/server/.env.example"
  cp "${ROOT_DIR}/deploy/systemd/uiedtool-api.service" "${RELEASE_DIR}/server/uiedtool-api.service"
  cp "${ROOT_DIR}/deploy/nginx/uiedtool.com.fullstack.locations.conf" "${RELEASE_DIR}/nginx/"
  cp "${BACKEND_DIR}/sql/install.sql" "${RELEASE_DIR}/sql/"
  cp "${ROOT_DIR}/docs/uiedtool-3.0.1-baota-deploy.md" "${RELEASE_DIR}/docs/DEPLOY.md"
}

# 函数说明：记录每个发布文件的 SHA-256，便于上传后验证完整性。
write_release_manifest() {
  (
    cd "${RELEASE_DIR}"
    {
      printf "UIED-Tools %s 全栈发布包\n" "${VERSION}"
      printf "生成时间: %s\n" "$(date '+%Y-%m-%d %H:%M:%S %z')"
      printf "发布范围: 主站静态前端、/admin 管理端、Go API、全新数据库脚本\n"
      printf "暂不包含: AI 简历 Next.js 服务、抠图独立代理服务\n\n"
      find . -type f ! -name 'RELEASE-MANIFEST.txt' ! -name '.DS_Store' -print0 \
        | sort -z \
        | xargs -0 shasum -a 256
    } > RELEASE-MANIFEST.txt
  )
}

# 函数说明：清理 macOS 扩展属性和隐藏资源文件，避免 Linux 解压时出现 LIBARCHIVE.xattr 警告。
clean_macos_metadata() {
  local target_dir="$1"

  find "${target_dir}" -type f \( -name '.DS_Store' -o -name '._*' \) -delete
  if command -v xattr >/dev/null 2>&1; then
    xattr -cr "${target_dir}"
  fi
}

# 函数说明：生成仅包含主站、管理端和 Go API 的宝塔运行包，不携带一次性 SQL、Nginx 和部署文档。
create_runtime_archive() {
  rm -rf "${RUNTIME_DIR}"
  mkdir -p \
    "${RUNTIME_DIR}/frontend/site" \
    "${RUNTIME_DIR}/frontend/admin" \
    "${RUNTIME_DIR}/backend/static"

  cp -R "${RELEASE_DIR}/web/." "${RUNTIME_DIR}/frontend/site/"
  cp -R "${RELEASE_DIR}/admin/." "${RUNTIME_DIR}/frontend/admin/"
  cp -R "${RELEASE_DIR}/server/static/." "${RUNTIME_DIR}/backend/static/"
  cp "${RELEASE_DIR}/server/uiedtool-api" "${RUNTIME_DIR}/backend/"
  cp "${RELEASE_DIR}/server/.env.example" "${RUNTIME_DIR}/backend/"

  clean_macos_metadata "${RUNTIME_DIR}"
  rm -f "${RUNTIME_ARCHIVE_PATH}" "${RUNTIME_ARCHIVE_PATH}.sha256"
  COPYFILE_DISABLE=1 tar \
    --format ustar \
    --exclude='.DS_Store' \
    -czf "${RUNTIME_ARCHIVE_PATH}" \
    -C "${STAGING_DIR}" \
    "${RUNTIME_NAME}"
  (
    cd "$(dirname "${RUNTIME_ARCHIVE_PATH}")"
    shasum -a 256 "$(basename "${RUNTIME_ARCHIVE_PATH}")" \
      > "$(basename "${RUNTIME_ARCHIVE_PATH}").sha256"
  )

  printf "精简运行包: %s\n" "${RUNTIME_ARCHIVE_PATH}"
  cat "${RUNTIME_ARCHIVE_PATH}.sha256"
}

# 函数说明：按统一发布清单复制存量数据库增量补丁，避免正式目录与宝塔包出现补丁遗漏。
copy_release_database_patches() {
  local target_dir="$1"
  local patch_name

  for patch_name in "${RELEASE_PATCH_FILES[@]}"; do
    cp "${BACKEND_DIR}/sql/patches/${patch_name}" "${target_dir}/"
  done
}

# 函数说明：将运行包和部署配置收口到同一版本目录，避免本地发布文件分散。
assemble_production_resources() {
  cp "${BACKEND_DIR}/sql/install.sql" "${PRODUCTION_DIR}/"
  copy_release_database_patches "${PRODUCTION_DIR}"
  cp "${ROOT_DIR}/deploy/env/uiedtool-api.env.example" "${PRODUCTION_DIR}/"
  cp "${ROOT_DIR}/deploy/nginx/uiedtool.com.fullstack.locations.conf" "${PRODUCTION_DIR}/"
  cp "${ROOT_DIR}/deploy/systemd/uiedtool-api.service" "${PRODUCTION_DIR}/"
  cp "${ROOT_DIR}/scripts/release/deploy-update.sh" "${PRODUCTION_DIR}/"
  chmod 755 "${PRODUCTION_DIR}/deploy-update.sh"
  cp "${ROOT_DIR}/docs/uiedtool-3.0.1-baota-deploy.md" "${PRODUCTION_DIR}/DEPLOY.md"
  clean_macos_metadata "${PRODUCTION_DIR}"
}

# 函数说明：生成宝塔单文件上传包，解压后可直接执行一键升级脚本。
create_baota_bundle() {
  mkdir -p "${BAOTA_BUNDLE_DIR}"
  cp "${RUNTIME_ARCHIVE_PATH}" "${BAOTA_BUNDLE_DIR}/"
  cp "${RUNTIME_ARCHIVE_PATH}.sha256" "${BAOTA_BUNDLE_DIR}/"
  copy_release_database_patches "${BAOTA_BUNDLE_DIR}"
  cp "${PRODUCTION_DIR}/deploy-update.sh" "${BAOTA_BUNDLE_DIR}/"
  chmod 755 "${BAOTA_BUNDLE_DIR}/deploy-update.sh"
  clean_macos_metadata "${BAOTA_BUNDLE_DIR}"

  COPYFILE_DISABLE=1 tar \
    --format ustar \
    --exclude='.DS_Store' \
    -czf "${BAOTA_BUNDLE_PATH}" \
    -C "${STAGING_DIR}" \
    "${BAOTA_BUNDLE_NAME}"

  (
    cd "${PRODUCTION_DIR}"
    shasum -a 256 "$(basename "${BAOTA_BUNDLE_PATH}")" \
      > "$(basename "${BAOTA_BUNDLE_PATH}").sha256"
  )

  printf "宝塔一键部署包: %s\n" "${BAOTA_BUNDLE_PATH}"
}

# 函数说明：清理旧版脚本散落在 output 根目录的同版本发布文件，保留测试截图等其他输出。
cleanup_legacy_release_outputs() {
  rm -rf "${OUTPUT_DIR}/${RELEASE_NAME}" "${OUTPUT_DIR}/${RUNTIME_NAME}"
  rm -f \
    "${OUTPUT_DIR}/${RELEASE_NAME}-fullstack.tar.gz" \
    "${OUTPUT_DIR}/${RELEASE_NAME}-fullstack.tar.gz.sha256" \
    "${OUTPUT_DIR}/${RUNTIME_NAME}.tar.gz" \
    "${OUTPUT_DIR}/${RUNTIME_NAME}.tar.gz.sha256"
}

# 函数说明：执行完整发布包组装流程。
main() {
  require_build_artifacts
  rm -rf "${PRODUCTION_DIR}" "${STAGING_DIR}"
  mkdir -p "${PRODUCTION_DIR}"
  build_server_binary
  assemble_release_files
  write_release_manifest
  create_runtime_archive
  assemble_production_resources
  create_baota_bundle
  cleanup_legacy_release_outputs
  rm -rf "${STAGING_DIR}"
  printf "本地正式发布目录: %s\n" "${PRODUCTION_DIR}"
}

main "$@"
