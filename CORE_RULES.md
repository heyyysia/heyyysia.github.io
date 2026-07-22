# CORE_RULES.md

本檔案是 Claude Code 與 Codex 共用的專案核心規則。

## 專案概述

heyyysia 個人旅遊網站——純靜態網站,沒有任何建置工具(無 package.json、無 framework),直接編輯 HTML/CSS/JS 即可。內容以繁體中文為主(`lang="zh-Hant"`),導覽列為英文。

## 常用指令

```bash
# 本機預覽(沒有 dev server,用 Python 起一個)
python3 -m http.server 8000
# 然後開 http://localhost:8000

# 部署 = push 到 main,沒有其他步驟
git push origin main
```

**開工前先確認本機是最新版**:動手修改前先 `git fetch` 並檢查是否落後 origin/main,落後就先 pull(或請使用者在 GitHub Desktop 按 Pull origin)。這個專案曾發生本機落後雲端 50 個 commit 的狀況。

## 部署(重要)

- 正式網址:**https://heyyysia.pages.dev**
- 部署平台:**Cloudflare Pages**,已連結此 GitHub 儲存庫,push 到 main 會自動部署(儲存庫名稱雖是 github.io 格式,但實際服務的是 Cloudflare Pages)
- 單一檔案有大小上限——影片(.mp4)必須壓到 **15MB 以下**才能部署成功(見 commit 6e791fc)。新增影片前先檢查大小,過大要先壓縮。
- 使用者用 GitHub Desktop 操作 git;儲存庫屬於共用帳號 heyyysia,使用者的個人帳號 **wshin14j** 已是 collaborator(2026-07-06 起),平常固定登入 wshin14j 即可推送

## 架構

**📌 給下次協助「新增旅程」的 Agent 的提醒(使用者交代,務必執行)**:使用者已決定要把「新增旅程」流程做成 skill,但希望在**實際新增旅程時邊做邊建**。所以當她請你新增旅程頁時,請主動提醒她:「你之前交代過,這次要順便用目前平台可用的 skill-creator 把過程建成『新增旅程』skill,要現在一起做嗎?」完成 skill 之後,把本段提醒從此檔案移除。

**頁面結構**:每個旅程是一個獨立的靜態頁面 `journey-<地點>.html`(約 50KB,自包含)。新增旅程的流程:

1. 複製 `journey-template.html` 改名為 `journey-<地點>.html`,填入內容
2. 在 `js/map.js` 的 `pins` 陣列加一筆(經緯度、標籤、連結),首頁世界地圖才會出現該地點的圖釘
3. 在 `journeys.html` 加上該旅程的卡片連結

**首頁地圖**:`index.html` 用 D3 + TopoJSON 畫世界地圖(`js/map.js`),圖釘資料寫死在 `pins` 陣列裡。旅程分類標籤有三種 tagClass:`exploration`、`inner-journey`、`aesthetic`。

**圖片組織**:`images/<旅程名>/` 按旅程分資料夾,檔名多為 Instagram 匯出的數字 ID。`ig-posts/<YYYYMM>/` 存放 IG 貼文照片,按年月分資料夾。

**素材原料庫**:`~/Documents/heyyysia網站_ig全照片/`(不在 git 裡,也不要加進來——500MB+)。內有原始照片(HEIC)、影片(MOV)、字幕檔和未選用的照片,按 Homepage/Journeys 分類。要幫網站換圖或找新素材時,先來這裡找原圖,壓縮後再放進專案。

**RWD**:手機版斷點主要在 860px media query,手機換行用 `br-m` class 控制。

## 已棄用的檔案(不要使用)

`js/journal.js`、`js/journal-data.js`、`css/journal.css` 是早期「資料驅動」的旅程頁系統(用 `?trip=` 參數動態載入),目前**沒有任何 HTML 頁面引用**,已被靜態 journey-*.html 頁面取代。修改旅程內容時直接改對應的 journey-*.html,不要改 journal-data.js。

## 網頁爬取規則

### 社群媒體(Instagram、Facebook 等)
- 優先使用平台官方匯出功能(例如 Instagram 的「下載你的資訊」)
- 需要自動化時,使用 Playwright + 登入帳號操作
- 避免頻繁爬取,以免帳號被封鎖
- 只爬取自己擁有或有授權的帳號內容

### 一般網站
- 靜態內容優先用 Firecrawl,速度快且穩定
- 動態網站(需要滾動、點擊才能載入內容)改用 Playwright
- 爬取前確認網站的 `robots.txt` 是否允許爬取
- 加入適當延遲(每次請求間隔 1~3 秒),避免對伺服器造成負擔
