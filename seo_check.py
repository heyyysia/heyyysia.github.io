#!/usr/bin/env python3
"""
heyyysia SEO 健康檢查

檢查線上網站的 SEO 設定有沒有壞掉，特別是「畫面上看不出來」的那些：
  - 每頁是否正常打得開
  - canonical 是否等於該頁自己的網址（2026-07 就是這裡寫錯，7 頁卡三週）
  - sitemap 是否有效、網址是否與 canonical 一致、有沒有混入會轉址的 .html
  - robots.txt 是否正常
  - 社群分享縮圖是否真的存在（不然分享出來是破圖）
  - 內部連結有沒有殘留 .html
  - 每頁是否有標題與描述

用法：對「SEO檢查.command」點兩下即可。
"""

import os
import re
import sys
import ssl
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

BASE = "https://heyyysia.pages.dev"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

# 頁面代號 → 正式網址路徑
PAGES = {
    "首頁": "/",
    "所有旅程": "/journeys",
    "西班牙朝聖之路": "/journey-camino",
    "印尼伊真火山": "/journey-indonesia",
    "阿曼自駕": "/journey-oman",
    "越南峰牙己榜": "/journey-vietnam",
    "東京 Color Hunt": "/journey-japan-color-hunt",
    "聯絡我們": "/contact",
}

problems = []
notes = []


def get(path, as_bytes=False):
    """抓一個網址，回傳 (狀態碼, 內容)。"""
    url = path if path.startswith("http") else BASE + path
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
            raw = r.read()
            return r.status, raw if as_bytes else raw.decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, b"" if as_bytes else ""
    except Exception as e:
        return 0, str(e)


def head_status(path):
    """只看狀態碼，不跟隨轉址。"""
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None

    req = urllib.request.Request(BASE + path, headers={"User-Agent": UA}, method="HEAD")
    op = urllib.request.build_opener(NoRedirect)
    try:
        with op.open(req, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def find(pattern, text, group=1):
    m = re.search(pattern, text, re.S)
    return m.group(group) if m else None


def section(title):
    print(f"\n{title}")
    print("─" * 46)


def ok(msg):
    print(f"  ✅ {msg}")


def bad(msg):
    print(f"  ❌ {msg}")
    problems.append(msg)


def warn(msg):
    print(f"  ⚠️  {msg}")
    notes.append(msg)


def main():
    print("\n  heyyysia SEO 健康檢查")
    print("  檢查對象：" + BASE)

    # ── 1. 每頁是否正常，canonical 是否正確 ──
    section("1. 頁面與 canonical（最重要）")
    page_html = {}
    for name, path in PAGES.items():
        code, html = get(path)
        page_html[path] = html
        if code != 200:
            bad(f"{name}（{path}）打不開，狀態 {code}")
            continue
        canon = find(r'rel="canonical"\s+href="([^"]*)"', html)
        want = BASE + path
        if canon is None:
            bad(f"{name} 沒有 canonical")
        elif canon != want:
            bad(f"{name} 的 canonical 不對\n       應為 {want}\n       實際 {canon}")
        else:
            ok(f"{name}")

    # ── 2. 標題與描述 ──
    section("2. 標題與描述")
    titles = {}
    for name, path in PAGES.items():
        html = page_html.get(path, "")
        if not html:
            continue
        t = find(r"<title>(.*?)</title>", html)
        d = find(r'name="description"\s+content="([^"]*)"', html)
        if not t:
            bad(f"{name} 沒有標題")
        elif t in titles:
            bad(f"{name} 的標題和「{titles[t]}」重複（Google 會分不出差別）")
        else:
            titles[t] = name
        if not d:
            bad(f"{name} 沒有描述")
        elif len(d) < 20:
            warn(f"{name} 的描述太短（{len(d)} 字）")
    if not problems:
        ok(f"{len(titles)} 頁的標題都不重複，描述齊全")

    # ── 3. 社群分享縮圖 ──
    section("3. 社群分享縮圖（破圖檢查）")
    for name, path in PAGES.items():
        html = page_html.get(path, "")
        if not html:
            continue
        img = find(r'property="og:image"\s+content="([^"]*)"', html)
        if not img:
            bad(f"{name} 沒有 og:image")
            continue
        code, _ = get(img, as_bytes=True)
        if code != 200:
            bad(f"{name} 的分享縮圖打不開（{img}）")
    if not any("縮圖" in p or "og:image" in p for p in problems):
        ok("所有分享縮圖都正常")

    # ── 4. sitemap ──
    section("4. sitemap.xml")
    code, raw = get("/sitemap.xml", as_bytes=True)
    if code != 200:
        bad(f"sitemap.xml 打不開，狀態 {code}")
    else:
        if raw[:3] == b"\xef\xbb\xbf":
            bad("sitemap 開頭有 BOM 隱形字元，Google 可能讀不懂")
        try:
            root = ET.fromstring(raw)
            locs = [e.text.strip() for e in root.iter(NS + "loc")]
            ok(f"格式正確，共 {len(locs)} 個網址")
            dotted = [l for l in locs if l.endswith(".html")]
            if dotted:
                bad(f"sitemap 有 {len(dotted)} 個 .html 網址（會轉址，Google 不收）")
            else:
                ok("沒有會轉址的 .html 網址")
            want = {BASE + p for p in PAGES.values()}
            if set(locs) != want:
                miss = want - set(locs)
                extra = set(locs) - want
                if miss:
                    bad(f"sitemap 少了：{', '.join(sorted(miss))}")
                if extra:
                    warn(f"sitemap 多了：{', '.join(sorted(extra))}")
            else:
                ok("網址與各頁 canonical 完全一致")
        except ET.ParseError as e:
            bad(f"sitemap 不是有效的 XML：{e}")

    # ── 5. robots.txt ──
    section("5. robots.txt")
    code, txt = get("/robots.txt")
    if code != 200:
        bad(f"robots.txt 打不開，狀態 {code}")
    else:
        if re.search(r"^\s*Disallow:\s*/\s*$", txt, re.M):
            bad("robots.txt 把整個網站擋掉了！")
        else:
            ok("沒有擋掉整站")
        if "sitemap.xml" in txt.lower():
            ok("有指向 sitemap")
        else:
            warn("robots.txt 沒有指向 sitemap")

    # ── 6. 內部連結 ──
    section("6. 內部連結（應全部不含 .html）")
    left = 0
    for name, path in PAGES.items():
        html = page_html.get(path, "")
        left += len(re.findall(r'href="[a-z0-9-]+\.html"', html))
    if left:
        bad(f"還有 {left} 個連結寫成 .html（會多繞一次轉址）")
    else:
        ok("全部連結都是正式網址")

    # ── 7. 轉址行為 ──
    section("7. 舊網址轉址（.html 應轉到正式網址）")
    s = head_status("/journeys.html")
    if s in (301, 308):
        ok(f"/journeys.html 正確轉址（{s}）")
    else:
        warn(f"/journeys.html 回應 {s}，與預期的轉址不同")

    # ── 總結 ──
    print("\n" + "═" * 46)
    if not problems and not notes:
        print("  🎉 全部正常，沒有發現問題。")
    elif not problems:
        print(f"  ✅ 沒有嚴重問題，但有 {len(notes)} 個小提醒（見上面 ⚠️）。")
    else:
        print(f"  ⚠️  發現 {len(problems)} 個需要處理的問題：")
        for p in problems:
            print(f"     • {p.splitlines()[0]}")
        print("\n  把這份結果給 AI 看，請它幫忙修。")
    print("═" * 46)

    print("\n  想知道 Google 收錄了幾頁？到 Google 搜尋這串：")
    print("      site:heyyysia.pages.dev")
    print("  搜出幾筆 = 收錄了幾頁（目標是 8 頁）\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n  已中斷。\n")
        sys.exit(1)
