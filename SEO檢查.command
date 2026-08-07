#!/bin/bash
# heyyysia SEO 健康檢查
# 用法：在 Finder 裡對這個檔案點兩下即可。
# 它會連到線上網站，檢查 SEO 設定有沒有壞掉。

cd "$(dirname "$0")" || exit 1
python3 "$(dirname "$0")/seo_check.py"

echo ""
echo "  檢查完畢，按 Enter 或關掉這個視窗即可。"
read -r _
