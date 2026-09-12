/* =========================================================
   婚禮網站設定 — 你只要改這一區就好
   ========================================================= */
const CONFIG = {
  // 婚禮日期時間（格式：年, 月-1, 日, 時, 分）
  // 注意：月份從 0 開始，5 月要寫 4
  weddingDate: new Date(2027, 4, 16, 12, 0, 0),

  // 相簿照片：把照片放進 images/ 資料夾，然後在這裡列出檔名
  photos: [
    { src: "images/photo1.jpg", caption: "第一次相遇" },
    { src: "images/photo2.jpg", caption: "一起旅行" },
    { src: "images/photo3.jpg", caption: "求婚那天" },
    { src: "images/photo4.jpg", caption: "訂婚" },
    { src: "images/photo5.jpg", caption: "日常時光" },
    { src: "images/photo6.jpg", caption: "永遠" },
  ],
};

/* =========================================================
   以下不需要修改
   ========================================================= */

/* ---------- 倒數計時 ---------- */
(function countdown() {
  const el = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
    grid: document.getElementById("countdownGrid"),
    done: document.getElementById("countdownDone"),
  };

  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = CONFIG.weddingDate.getTime() - Date.now();

    if (diff <= 0) {
      el.grid.hidden = true;
      el.done.hidden = false;
      clearInterval(timer);
      return;
    }

    const sec = Math.floor(diff / 1000);
    el.days.textContent = Math.floor(sec / 86400);
    el.hours.textContent = pad(Math.floor((sec % 86400) / 3600));
    el.minutes.textContent = pad(Math.floor((sec % 3600) / 60));
    el.seconds.textContent = pad(sec % 60);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();

/* ---------- 相簿 + 燈箱 ---------- */
(function gallery() {
  const grid = document.getElementById("galleryGrid");
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const btnClose = document.getElementById("lbClose");
  const btnPrev = document.getElementById("lbPrev");
  const btnNext = document.getElementById("lbNext");

  let current = 0;

  // 動態產生相片
  CONFIG.photos.forEach((photo, i) => {
    const item = document.createElement("div");
    item.className = "gallery__item";
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || `照片 ${i + 1}`;
    img.loading = "lazy";
    // 圖片載入失敗時用預留圖示，避免破圖
    img.addEventListener("error", () => {
      item.style.background =
        "linear-gradient(135deg,#e7d3d3,#d9c3a5)";
      img.remove();
    });
    item.appendChild(img);
    item.addEventListener("click", () => open(i));
    grid.appendChild(item);
  });

  function open(i) {
    current = i;
    lbImg.src = CONFIG.photos[i].src;
    lbImg.alt = CONFIG.photos[i].caption || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
  }
  function show(step) {
    current = (current + step + CONFIG.photos.length) % CONFIG.photos.length;
    lbImg.src = CONFIG.photos[current].src;
    lbImg.alt = CONFIG.photos[current].caption || "";
  }

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => show(-1));
  btnNext.addEventListener("click", () => show(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(-1);
    if (e.key === "ArrowRight") show(1);
  });
})();

/* ---------- PWA：註冊 service worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service worker 註冊失敗：", err);
    });
  });
}

/* ---------- 加到主畫面提示 ---------- */
(function installPrompt() {
  const tip = document.getElementById("installTip");
  const text = document.getElementById("installText");
  const btn = document.getElementById("installBtn");
  const dismiss = document.getElementById("installDismiss");
  const DISMISS_KEY = "wedding_install_dismissed";

  if (localStorage.getItem(DISMISS_KEY)) return;

  let deferredPrompt = null;

  // Android / Chrome：可直接觸發安裝
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btn.hidden = false;
    tip.hidden = false;
  });

  btn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    tip.hidden = true;
  });

  dismiss.addEventListener("click", () => {
    tip.hidden = true;
    localStorage.setItem(DISMISS_KEY, "1");
  });

  // iOS Safari：沒有 beforeinstallprompt，改用文字教學
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isIOS && !isStandalone) {
    text.textContent = '在 Safari 點下方「分享」→「加入主畫面」即可安裝 ♡';
    btn.hidden = true;
    tip.hidden = false;
  }
})();
