#!/usr/bin/env bash
# 本地评审（生产构建）：先 PLATFORM_CONTENT_API_URL=http://localhost:3021 npm run build，再运行本脚本；端口 3015。
set -euo pipefail
cd "$(dirname "$0")/.."
export PLATFORM_CONTENT_API_URL="http://localhost:3021"
export NEXT_PUBLIC_PLATFORM_URL="http://localhost:3021"
exec npx next start -p 3015
