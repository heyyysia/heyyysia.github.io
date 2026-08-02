#!/bin/bash
# heyyysia 本機預覽
# 用法：在 Finder 裡對這個檔案點兩下即可。
# 它會模擬線上 Cloudflare Pages 的網址規則（網址不用加 .html），
# 讓本機看到的行為跟線上完全一樣。

cd "$(dirname "$0")" || exit 1

PORT=8000
# 如果 8000 被佔用，往後找一個沒被用的
while lsof -ti :$PORT >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo ""
echo "  heyyysia 本機預覽"
echo "  ─────────────────────────────────"
echo "  網址： http://localhost:$PORT"
echo ""
echo "  這個預覽跟線上規則一致："
echo "    /journeys        ← 正式網址（可以打開）"
echo "    /journeys.html   ← 會自動轉到上面那個"
echo ""
echo "  要結束預覽：按 Control + C，或直接關掉這個視窗"
echo "  ─────────────────────────────────"
echo ""

python3 "$(dirname "$0")/preview_server.py" "$PORT"
