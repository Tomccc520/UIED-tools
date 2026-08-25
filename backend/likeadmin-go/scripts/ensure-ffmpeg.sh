#!/usr/bin/env bash
# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026-07-20

set -euo pipefail

# 函数说明：输出统一的依赖安装日志。
log() {
  printf '[video-compress] %s\n' "$1"
}

# 函数说明：在 macOS 或常见 Linux 发行版安装 FFmpeg。
install_ffmpeg() {
  case "$(uname -s)" in
    Darwin)
      if ! command -v brew >/dev/null 2>&1; then
        log '未找到 Homebrew，请先安装 Homebrew。'
        exit 1
      fi
      brew install ffmpeg
      ;;
    Linux)
      if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update
        sudo apt-get install -y ffmpeg
      elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y ffmpeg
      elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y epel-release
        sudo yum install -y ffmpeg
      else
        log '当前 Linux 系统未找到 apt-get、dnf 或 yum。'
        exit 1
      fi
      ;;
    *)
      log "暂不支持自动安装：$(uname -s)"
      exit 1
      ;;
  esac
}

if command -v ffmpeg >/dev/null 2>&1; then
  log "FFmpeg 已可用：$(command -v ffmpeg)"
  ffmpeg -version | head -n 1
  exit 0
fi

log '未检测到 FFmpeg，开始自动安装。'
install_ffmpeg

if ! command -v ffmpeg >/dev/null 2>&1; then
  log 'FFmpeg 安装完成后仍不可用，请检查 PATH。'
  exit 1
fi

log "FFmpeg 安装成功：$(command -v ffmpeg)"
ffmpeg -version | head -n 1
