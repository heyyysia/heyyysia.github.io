// 手機選單側邊 drawer
function toggleMenu() {
  const menu    = document.getElementById('mobileMenu');
  const btn     = document.getElementById('hamburgerBtn');
  const overlay = document.getElementById('menuOverlay');
  menu.classList.toggle('open');
  btn.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

// 建立遮罩層
(function() {
  const overlay = document.createElement('div');
  overlay.id = 'menuOverlay';
  overlay.className = 'menu-overlay';
  overlay.addEventListener('click', toggleMenu);
  document.body.insertBefore(overlay, document.body.firstChild);
})();

// 點選連結後關閉選單（事件委派）
(function() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      menu.classList.remove('open');
      document.getElementById('hamburgerBtn').classList.remove('open');
      const overlay = document.getElementById('menuOverlay');
      if (overlay) overlay.classList.remove('open');
    }
  });
})();

// 旅程資料（由舊到新）
const trips = [
  {
    id: 'indonesia',
    flag: '🇮🇩',
    location: 'Bali, Indonesia',
    country: '印尼｜伊真火山',
    date: '2023年10月',
    dateShort: 'OCT 2023',
    desc: '夜行登山，藍火與硫磺煙霧交織。\n在黑暗與光之間，靠近火山的心跳。',
    tag: 'exploration',
    tagClass: 'exploration',
    cover: 'images/hero/17898191754121455.jpg',
    href: 'journey-indonesia.html',
  },
  {
    id: 'portugal',
    flag: '🇵🇹🇪🇸',
    location: 'Camino de Santiago\n(Portugal / Spain)',
    country: '西班牙 × 葡萄牙｜朝聖之路',
    date: '2024年4–5月',
    dateShort: 'APR 2024',
    desc: '不是為了抵達，而是為了理解。\n一步一步走著，某些感受慢慢浮現。',
    tag: 'inner journey',
    tagClass: 'inner-journey',
    cover: 'images/hero/17978116487885637.jpg',
    href: 'journey-camino.html',
  },
  {
    id: 'vietnam',
    flag: '🇻🇳',
    location: 'Phong Nha, Vietnam',
    country: '越南｜峰牙己榜國家公園',
    date: '2025年7月',
    dateShort: 'JUL 2025',
    desc: '健行、溯溪、溜索、洞穴露營，\n深入自然的一場冒險。',
    tag: 'exploration',
    tagClass: 'exploration',
    cover: 'images/hero/18033890543395352.jpg',
    href: 'journey-vietnam.html',
  },
  {
    id: 'oman',
    flag: '🇴🇲',
    location: 'Oman',
    country: '阿曼｜自駕旅行',
    date: '2025年10月',
    dateShort: 'OCT 2025',
    desc: '沙漠、峽谷與星空，\n一路穿越遼闊與未知的阿拉伯世界。',
    tag: 'exploration',
    tagClass: 'exploration',
    cover: 'images/hero/18046696997192376.jpg',
    href: 'journey-oman.html',
  },
  {
    id: 'japan',
    flag: '🇯🇵',
    location: 'Japan\nColor Hunt',
    country: '日本｜東京 Color Hunt',
    date: '2026年3月',
    dateShort: 'MAR 2026',
    desc: '以色彩為線索，\n用鏡頭記錄每一種的顏色故事。',
    tag: 'aesthetic',
    tagClass: 'aesthetic',
    cover: 'images/hero/18051504734423085.jpg',
    href: 'journey-japan-color-hunt.html',
  },
];

// 輪播照片（RECENT TRIPS 資料夾，共 13 張）
const carouselPhotos = [
  'images/hero/17889988905336547.jpg',
  'images/hero/17976696626866298.jpg',
  'images/hero/17978116487885637.jpg',
  'images/hero/18046696997192376.jpg',
  'images/hero/18051504734423085.jpg',
  'images/hero/18053296622445195.jpg',
  'images/hero/18053856443376585.jpg',
  'images/hero/18079057231881703.jpg',
  'images/hero/18083875897803304.jpg',
  'images/hero/18098972719603321.jpg',
  'images/hero/18147867145385713.jpg',
  'images/hero/18311380708262758.jpg',
  'images/hero/18575573560022909.jpg',
];

let currentSlide = 0;
const tripsDesc = [...trips].reverse(); // 最新在前（時間軸用）

function buildCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  carouselPhotos.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `<img src="${src}" alt="recent trip photo" loading="lazy" />`;
    track.appendChild(slide);
  });
}

function buildTripTimeline() {
  const tl = document.getElementById('tripsTimeline');
  if (!tl) return;
  tripsDesc.forEach((trip, i) => {
    const dotClass = trip.tagClass === 'inner-journey' ? 'inner-dot'
                   : trip.tagClass === 'aesthetic'     ? 'aesthetic-dot'
                   :                                     'exploration-dot';
    const item = document.createElement('div');
    item.className = 'tl-item' + (i === 0 ? ' active' : '');
    item.innerHTML = `
      <div class="tl-dot-col">
        <div class="tl-dot ${dotClass}"></div>
        ${i < tripsDesc.length - 1 ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-body">
        <p class="tl-date">${trip.dateShort}</p>
        <h3 class="tl-name">${trip.country}</h3>
        <p class="tl-desc">${trip.desc}</p>
        <a class="tl-link" href="${trip.href}">read more →</a>
      </div>`;
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('tl-link')) return;
      document.querySelectorAll('.tl-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
    tl.appendChild(item);
  });
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  slides[currentSlide].classList.remove('active');
  currentSlide = (index + carouselPhotos.length) % carouselPhotos.length;
  slides[currentSlide].classList.add('active');
}

function changeSlide(dir) { goToSlide(currentSlide + dir); }

function matchTimelineHeight() {
  const carousel = document.querySelector('.trips-carousel');
  const timeline = document.getElementById('tripsTimeline');
  if (carousel && timeline) {
    timeline.style.maxHeight = carousel.offsetHeight + 'px';
  }
}

function setupPlaneScrollbar() {
  const timeline = document.getElementById('tripsTimeline');
  const plane = document.getElementById('planeThumb');
  const track = document.getElementById('planeTrack');
  if (!timeline || !plane || !track) return;

  timeline.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = timeline;
    if (scrollHeight <= clientHeight) return;
    const ratio = scrollTop / (scrollHeight - clientHeight);
    const trackH = track.clientHeight - plane.offsetHeight;
    const top = ratio * trackH;
    const sOffset = Math.sin(ratio * Math.PI * 2.5) * 5;   // S 型左右漂移 ±5px
    const tilt   = Math.cos(ratio * Math.PI * 2.5) * 14;   // 傾斜角 ±14deg
    plane.style.top = top + 'px';
    plane.style.transform = `translateX(calc(-50% + ${sOffset}px)) rotate(${tilt}deg)`;
  });
}

buildCarousel();
buildTripTimeline();
matchTimelineHeight();
setupPlaneScrollbar();
window.addEventListener('resize', matchTimelineHeight);
setInterval(() => changeSlide(1), 3000);

// MBTI 卡片捲入進場 + 自動輪播
const mbtiCards = document.querySelectorAll('.mbti-card');
let mbtiIndex = 0;
let mbtiTimer = null;

const photoMap = ['photoInfj', 'photoIntp', 'photoIsfp'];
const floatClass = ['floating-1', 'floating-2', 'floating-3'];

function triggerPhotoFloat(index) {
  const el = document.getElementById(photoMap[index]);
  if (!el) return;
  el.classList.remove(floatClass[index]);
  void el.offsetWidth; // 重置動畫
  el.classList.add(floatClass[index]);
}

function startMbtiRotation() {
  mbtiTimer = setInterval(() => {
    mbtiCards.forEach(c => c.classList.remove('active'));
    const i = mbtiIndex % mbtiCards.length;
    mbtiCards[i].classList.add('active');
    triggerPhotoFloat(i);
    mbtiIndex++;
  }, 2000);
}

const mbtiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
  // 當 MBTI 區塊進入畫面才啟動輪播
  if (entries.some(e => e.isIntersecting) && !mbtiTimer) {
    startMbtiRotation();
  }
}, { threshold: 0.3 });

mbtiCards.forEach(card => mbtiObserver.observe(card));

// 手動 hover 時暫停自動輪播，並觸發對應照片浮動
mbtiCards.forEach((card, i) => {
  card.addEventListener('mouseenter', () => {
    clearInterval(mbtiTimer);
    mbtiTimer = null;
    mbtiCards.forEach(c => c.classList.remove('active'));
    triggerPhotoFloat(i);
  });
  card.addEventListener('mouseleave', () => {
    if (!mbtiTimer) startMbtiRotation();
  });
});

// 手機點擊：暫停輪播，顯示被點的卡，3 秒後恢復
mbtiCards.forEach((card, i) => {
  card.addEventListener('click', () => {
    if (window.matchMedia('(hover: none)').matches) {
      clearInterval(mbtiTimer);
      mbtiTimer = null;
      mbtiCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      triggerPhotoFloat(i);
      setTimeout(() => {
        if (!mbtiTimer) startMbtiRotation();
      }, 3000);
    }
  });
});

// 直式時間軸
const destTimeline = document.getElementById('destTimeline');
if (destTimeline) {
  trips.forEach((trip, i) => {
    const dotClass = trip.tagClass === 'inner-journey' ? 'inner-dot'
                   : trip.tagClass === 'aesthetic'     ? 'aesthetic-dot'
                   :                                     'exploration-dot';
    const item = document.createElement('div');
    item.className = 'dest-item';
    item.innerHTML = `
      <div class="dest-dot-col">
        <div class="dest-dot ${dotClass}"></div>
        ${i < trips.length - 1 ? '<div class="dest-line"></div>' : ''}
      </div>
      <div class="dest-content">
        <p class="dest-year">${trip.date}</p>
        <p class="dest-name">${trip.country}</p>
      </div>
    `;
    destTimeline.appendChild(item);
  });
}
