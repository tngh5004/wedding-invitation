#!/bin/bash
# 현재 실행 중인 Cloudflare Quick Tunnel의 외부 URL을 출력한다.
LOG="$(dirname "$0")/../data/cloudflared.log"
if [ ! -f "$LOG" ]; then
  echo "터널 로그가 없습니다. 터널이 실행 중인지 확인하세요." >&2
  exit 1
fi
URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG" | tail -1)
if [ -z "$URL" ]; then
  echo "URL을 찾지 못했습니다. 터널이 아직 연결 중이거나 실패했습니다." >&2
  exit 1
fi
echo "$URL"
