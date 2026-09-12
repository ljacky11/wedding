# 我們的婚禮 · Wedding PWA

一個純前端的婚禮網站，包含**倒數計時器**、**照片相簿**，並且是 **PWA**（可「加到手機主畫面」，像 App 一樣打開，還能離線瀏覽）。

不需要伺服器、不需要框架，只有 HTML / CSS / JavaScript。

---

## 檔案結構

```
wedding/
├─ index.html        # 網頁主體
├─ styles.css        # 樣式
├─ app.js            # 倒數、相簿、安裝提示（★設定都在最上面）
├─ manifest.json     # PWA 設定（App 名稱、圖示、顏色）
├─ sw.js             # Service Worker（離線快取）
├─ icons/            # App 圖示（icon.svg + 192 / 512 / maskable PNG）
└─ images/           # 你的照片放這裡
```

---

## 三步驟自訂成你的婚禮

### 1. 改名字、日期、地點

打開 **`app.js`**，最上面的 `CONFIG` 區塊：

```js
const CONFIG = {
  weddingDate: new Date(2026, 11, 12, 12, 0, 0), // 月份要 -1！12 月寫 11
  photos: [ ... ],
};
```

- 名字、標題文字：改 **`index.html`**（搜尋「俊傑」「雅婷」全部替換）。
- 時間 / 地點 / 穿著：改 `index.html` 裡的「婚禮資訊」區塊。
- 地圖連結：改 `info__map` 那行的網址。

> 提醒：`new Date` 的月份從 0 算起，所以 **12 月要填 11**、1 月填 0。

### 2. 放照片

把照片丟進 **`images/`** 資料夾：

- `hero.jpg` — 首頁大圖（橫幅，寬 1600px 以上最佳）
- `photo1.jpg` ~ `photo6.jpg` — 相簿照片（正方形最佳）

想增減相簿張數，就改 `app.js` 裡的 `photos` 清單。
沒放照片也不會破圖，會顯示柔和色塊。

### 3. （選用）換 App 圖示

目前圖示是「紅底金色囍字」。想換的話，改 `icons/icon.svg`（向量，最清晰），
再把自己的圖示覆蓋 `icons/` 裡的三個 PNG（`icon-192.png`、`icon-512.png`、
`icon-maskable-512.png`，保持同檔名與尺寸）即可。

> 提醒：手機上已經「加到主畫面」的舊圖示不會自動更新，需要移除後重新加一次。

---

## 本機預覽

PWA 需要透過 http（不能用 `file://` 直接開），用 Python 起一個小伺服器即可：

```bash
cd wedding
python3 -m http.server 8000
```

然後瀏覽器打開 <http://localhost:8000>

---

## 部署到網路上（擇一，都免費）

PWA 需要 **HTTPS** 才能安裝到主畫面，以下平台都自帶 HTTPS：

- **GitHub Pages**：把整個資料夾推到 GitHub repo → Settings → Pages → 選 branch → 完成。
- **Netlify**：把資料夾拖進 <https://app.netlify.com/drop> 就好。
- **Cloudflare Pages / Vercel**：連結 repo 一鍵部署。

---

## 加到手機主畫面

- **Android（Chrome）**：網站會跳出「加到主畫面」按鈕，或從瀏覽器選單選「安裝應用程式」。
- **iPhone（Safari）**：點下方「分享」圖示 → 「加入主畫面」。
  （iOS 不支援自動安裝按鈕，網站會顯示文字教學。）

安裝後從主畫面打開，會是全螢幕、沒有網址列，跟 App 一樣。

---

## 更新網站後快取沒更新？

Service Worker 會快取檔案。改完內容後，把 **`sw.js`** 裡的版本號改一下：

```js
const CACHE = "wedding-v1";  // 改成 "wedding-v2"、"v3"…
```

重新部署後，使用者下次開啟就會自動載入新版本。
