#!/usr/bin/env python3
"""
heyyysia 本機預覽伺服器

為什麼需要這個？
  線上的 Cloudflare Pages 服務的網址「不含 .html」（例如 /journeys），
  但 Python 內建的 http.server 只認得 /journeys.html。
  兩邊規則不一樣 → 有些問題在本機測不出來（2026-07 的 SEO bug 就是這樣拖了三週）。

  這支程式讓本機的行為跟線上一致：
    /journeys        → 顯示 journeys.html 的內容
    /journeys.html   → 轉址到 /journeys（跟線上一樣）
    /                → 顯示 index.html

用法：
  對「預覽.command」點兩下即可，不用直接跑這支程式。
  （手動跑的話：python3 preview_server.py 8000）
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class PagesHandler(SimpleHTTPRequestHandler):
    """模擬 Cloudflare Pages 的網址規則。"""

    def send_head(self):
        raw = self.path.split("?", 1)[0].split("#", 1)[0]
        path = raw.rstrip("/") or "/"

        # /xxx.html → 轉址到 /xxx（跟線上一樣，用 308）
        if path.endswith(".html") and path != "/index.html":
            target = path[: -len(".html")]
            return self._redirect(target)
        if path == "/index.html":
            return self._redirect("/")

        # /xxx → 如果 xxx.html 存在，就顯示它的內容
        if path != "/" and not os.path.splitext(path)[1]:
            candidate = os.path.join(os.getcwd(), path.lstrip("/") + ".html")
            if os.path.isfile(candidate):
                self.path = path + ".html"

        return super().send_head()

    def _redirect(self, target):
        query = ""
        if "?" in self.path:
            query = "?" + self.path.split("?", 1)[1]
        self.send_response(308)
        self.send_header("Location", target + query)
        self.send_header("Content-Length", "0")
        self.end_headers()
        return None

    def end_headers(self):
        # 預覽時不要快取，改了檔案重整就看得到
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        # 只在出錯時才印訊息，畫面比較乾淨
        status = str(args[1]) if len(args) > 1 else ""
        if status.startswith(("4", "5")):
            sys.stderr.write("  ⚠️  %s %s\n" % (args[0], status))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer(("127.0.0.1", port), PagesHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  預覽已結束。\n")
        server.server_close()


if __name__ == "__main__":
    main()
