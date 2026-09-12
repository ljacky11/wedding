/* =========================================================
   婚禮網站設定 — 你只要改這一區就好
   ========================================================= */
const CONFIG = {
  // 婚禮日期時間（格式：年, 月-1, 日, 時, 分）
  // 注意：月份從 0 開始，5 月要寫 4
  weddingDate: new Date(2027, 4, 16, 12, 0, 0),

  // 相簿照片：把照片放進 images/ 資料夾，然後在這裡列出檔名
  photos: [
    { src: "images/photo1.jpg", caption: "我們的故事" },
    { src: "images/photo2.jpg", caption: "永遠在一起" },
    { src: "images/photo3.jpg", caption: "攜手未來" },
  ],

  // 婚紗寫真輪播：把婚紗照放進 images/ 後在這裡列出檔名即可（可放任意張數）
  // 先預留佔位，之後把 src 換成真正的婚紗照檔名（例如 "images/wedding1.jpg"）
  weddingPhotos: [
    { src: "images/wedding1.jpg" },
    { src: "images/wedding2.jpg" },
    { src: "images/wedding3.jpg" },
  ],

  // 輪播自動切換秒數
  carouselIntervalSec: 4,
};

/* =========================================================
   以下不需要修改
   ========================================================= */

/* ---------- 倒數計時 ---------- */
(function countdown() {
  const el = {
    weeks: document.getElementById("weeks"),
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
    const totalDays = Math.floor(sec / 86400);
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    el.weeks.textContent = weeks;
    el.days.textContent = days;
    el.hours.textContent = pad(hours);
    el.minutes.textContent = pad(minutes);
    el.seconds.textContent = pad(seconds);

    // 強調「目前最大且不為 0」的單位（例如還有幾週就強調週）
    const order = [
      [weeks, el.weeks],
      [days, el.days],
      [hours, el.hours],
      [minutes, el.minutes],
      [seconds, el.seconds],
    ];
    const lead = (order.find(([v]) => v > 0) || order[order.length - 1])[1];
    order.forEach(([, node]) => {
      node.closest(".countdown__unit").classList.toggle("is-lead", node === lead);
    });
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

/* ---------- 電子喜帖分享 ---------- */
(function invite() {
  const shareBtn = document.getElementById("shareBtn");
  const shareLine = document.getElementById("shareLine");
  const copyBtn = document.getElementById("copyLink");
  const hint = document.getElementById("shareHint");
  if (!shareBtn) return;

  // 分享內容：標題、訊息、網址（網址用目前頁面，部署後就是線上網址）
  const shareUrl = window.location.href.split("#")[0];
  const shareTitle = "卜弘祥 & 詹岳玲 的婚禮邀請";
  const shareText =
    "誠摯邀請您一同見證我們的幸福時刻 ♡\n2027.05.16（日）午宴 12:00\n皇家薇庭婚宴會館";

  function showHint(msg) {
    hint.textContent = msg;
    if (msg) setTimeout(() => (hint.textContent = ""), 2600);
  }

  // 一鍵分享：優先用手機原生分享面板（含 LINE、訊息、AirDrop 等）
  shareBtn.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (e) {
        // 使用者取消分享，不需處理
      }
    } else {
      // 桌面瀏覽器沒有原生分享：退回複製連結
      copyToClipboard();
      showHint("此裝置不支援一鍵分享，已複製連結給你 ♡");
    }
  });

  // 分享到 LINE：官方分享連結
  const lineHref =
    "https://line.me/R/msg/text/?" +
    encodeURIComponent(shareText + "\n" + shareUrl);
  shareLine.setAttribute("href", lineHref);

  // 複製連結
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (e) {
      // 後備：用舊方法選取複製
      const t = document.createElement("textarea");
      t.value = shareUrl;
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(t);
      return true;
    }
  }
  copyBtn.addEventListener("click", async () => {
    await copyToClipboard();
    showHint("已複製喜帖連結 ♡");
  });
})();

/* ---------- 出席回覆 (RSVP) ----------
   把 index.html 裡 #rsvpBtn 的 href 從 "#" 換成 Google 表單網址後，
   這段會自動啟用按鈕並隱藏提示文字。 */
(function rsvp() {
  const btn = document.getElementById("rsvpBtn");
  const note = document.getElementById("rsvpNote");
  if (!btn) return;

  const href = btn.getAttribute("href");
  const ready = href && href !== "#";

  if (ready) {
    btn.removeAttribute("aria-disabled");
    if (note) note.hidden = true;
  }
})();

/* ---------- 婚紗照輪播 ---------- */
(function carousel() {
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const viewport = document.getElementById("carouselViewport");
  const prev = document.getElementById("carouselPrev");
  const next = document.getElementById("carouselNext");
  if (!track || !CONFIG.weddingPhotos || !CONFIG.weddingPhotos.length) return;

  const slides = CONFIG.weddingPhotos;
  let index = 0;
  let timer = null;

  // 動態產生投影片與圓點
  slides.forEach((photo, i) => {
    const slide = document.createElement("div");
    slide.className = "carousel__slide";

    const ph = document.createElement("div");
    ph.className = "carousel__slide-ph";
    ph.textContent = "婚紗照 " + (i + 1);
    slide.appendChild(ph);

    const img = document.createElement("img");
    img.alt = "婚紗照 " + (i + 1);
    img.loading = "lazy";
    // 載入成功才顯示圖片，失敗則保留漸層佔位
    img.addEventListener("load", () => ph.remove());
    img.addEventListener("error", () => img.remove());
    img.src = photo.src;
    slide.appendChild(img);

    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "carousel__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "第 " + (i + 1) + " 張");
    dot.addEventListener("click", () => go(i, true));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function render() {
    track.style.transform = "translateX(" + -index * 100 + "%)";
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }
  function go(i, userAction) {
    index = (i + slides.length) % slides.length;
    render();
    if (userAction) restart();
  }
  function step(n) { go(index + n, true); }

  function start() {
    if (slides.length <= 1) return;
    timer = setInterval(
      () => go(index + 1, false),
      (CONFIG.carouselIntervalSec || 4) * 1000
    );
  }
  function restart() { clearInterval(timer); start(); }

  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));

  // 觸控滑動
  let startX = null;
  viewport.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    startX = null;
  });

  // 分頁切走時暫停，回來再繼續（省電）
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(timer);
    else restart();
  });

  render();
  start();
})();
