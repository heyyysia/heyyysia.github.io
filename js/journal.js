function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburgerBtn');
  menu.classList.toggle('open');
  btn.classList.toggle('open');
}

// 讀取 URL 參數
const params = new URLSearchParams(window.location.search);
const tripId = params.get('trip') || 'oman';
const trip = tripData[tripId];

if (!trip) {
  document.querySelector('.journal-hero').innerHTML = '<p style="padding:4rem;text-align:center">找不到旅程資料</p>';
} else {
  // Hero
  document.getElementById('journalHeroImg').src = trip.cover;
  document.getElementById('journalTitle').textContent = trip.title;
  document.getElementById('journalSubtitle').textContent = trip.subtitle;
  document.getElementById('journalDates').textContent = trip.dates;
  const tagEl = document.getElementById('journalTag');
  tagEl.textContent = trip.tag;
  tagEl.className = 'journal-tag ' + trip.tagClass;

  // Page title
  document.title = trip.title + ' — heyyysia';

  // Day nav
  const navList = document.getElementById('dayNavList');
  trip.days.forEach((d, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${d.slug}" class="day-nav-item ${i === 0 ? 'active' : ''}">
      <span class="day-nav-label">${d.day}</span>
      <span class="day-nav-date">${d.date}</span>
    </a>`;
    navList.appendChild(li);
  });

  // Content
  const content = document.getElementById('journalContent');
  let allPhotos = []; // for lightbox

  trip.days.forEach((d) => {
    const startIndex = allPhotos.length;
    // photos excluding cover (index 0 = cover)
    const thumbs = d.photos.slice(1);
    allPhotos = allPhotos.concat(d.photos);

    const section = document.createElement('section');
    section.className = 'day-section';
    section.id = d.slug;

    // Videos HTML
    let videosHTML = '';
    if (d.videos && d.videos.length > 0) {
      const videoItems = d.videos.map(v => `
        <div class="day-video-item">
          <video src="${v}" controls playsinline preload="metadata"></video>
        </div>`).join('');
      videosHTML = `<div class="day-videos">${videoItems}</div>`;
    }

    // Thumbnails HTML
    const thumbHTML = thumbs.map((src, ti) => {
      const globalIdx = startIndex + 1 + ti;
      return `<img src="${src}" alt="" loading="lazy" onclick="openLightbox(${globalIdx})" />`;
    }).join('');

    section.innerHTML = `
      <div class="day-header">
        <div class="day-header-left">
          <p class="day-label">${d.day}</p>
          <p class="day-date-text">${d.date}</p>
        </div>
        <p class="day-note">${d.note}</p>
      </div>
      <div class="day-cover" onclick="openLightbox(${startIndex})">
        <img src="${d.cover}" alt="${d.day} cover" loading="lazy" />
        <div class="day-cover-hint"><i class="fas fa-expand"></i></div>
      </div>
      ${videosHTML}
      <div class="day-grid">${thumbHTML}</div>
    `;
    content.appendChild(section);
  });

  // Lightbox
  window._lightboxPhotos = allPhotos;
  window._lightboxIndex = 0;

  // Active nav on scroll
  const sections = document.querySelectorAll('.day-section');
  const navItems = document.querySelectorAll('.day-nav-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(n => n.classList.remove('active'));
        const id = entry.target.id;
        const active = document.querySelector(`.day-nav-item[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => observer.observe(s));
}

// Lightbox functions
function openLightbox(index) {
  window._lightboxIndex = index;
  document.getElementById('lightboxImg').src = window._lightboxPhotos[index];
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function shiftLightbox(dir) {
  const total = window._lightboxPhotos.length;
  window._lightboxIndex = (window._lightboxIndex + dir + total) % total;
  document.getElementById('lightboxImg').src = window._lightboxPhotos[window._lightboxIndex];
}

document.addEventListener('keydown', (e) => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowRight') shiftLightbox(1);
  if (e.key === 'ArrowLeft') shiftLightbox(-1);
  if (e.key === 'Escape') closeLightbox();
});
