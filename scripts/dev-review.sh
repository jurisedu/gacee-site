#!/usr/bin/env bash
# 本地评审：官网连接本地隔离门户（http://localhost:3021），端口 3014。不连接生产门户。
set -euo pipefail
cd "$(dirname "$0")/.."
export PLATFORM_CONTENT_API_URL="http://localhost:3021"
export NEXT_PUBLIC_PLATFORM_URL="http://localhost:3021"
exec npx next dev -p 3014
