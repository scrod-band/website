/* ============================================================
   SCROD — main.js
   ============================================================

   TABLE OF CONTENTS
   1. Sticky Navigation
   2. Scroll Reveal
   3. Lightbox (photo viewer)

   ============================================================ */


/* ── 1. STICKY NAVIGATION ───────────────────────────────────────
   Adds a frosted-glass background to the nav bar once
   the user scrolls past the top of the page.
   ──────────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* ── 2. SCROLL REVEAL ───────────────────────────────────────────
   Watches for elements with class="reveal" and adds
   class="visible" when they scroll into view.
   The CSS handles the actual fade-up animation.
   ──────────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // only animate once
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ── 3. LIGHTBOX ────────────────────────────────────────────────
   Click any photo in the gallery to open a full-screen viewer.

   NAVIGATION:
   - Click ‹ › buttons or use ← → arrow keys
   - Swipe left/right on mobile
   - Click the backdrop or press Escape to close

   HOW IT WORKS:
   - Reads all .photo-item elements that contain an <img>
   - Uses data-src attribute if present (for higher-res version)
   - Uses data-caption for optional caption text
   ──────────────────────────────────────────────────────────── */
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbCounter = document.getElementById('lb-counter');
const lbClose   = document.getElementById('lb-close');
const lbPrev    = document.getElementById('lb-prev');
const lbNext    = document.getElementById('lb-next');

let photos  = [];   // array of {src, caption, alt, el}
let current = 0;    // index of the currently shown photo

// Build the photo list fresh each time (handles dynamically added photos)
function buildPhotoIndex() {
  photos = [];
  document.querySelectorAll('#photo-grid .photo-item').forEach(item => {
    const img = item.querySelector('img');
    if (!img) return; // skip placeholder tiles (no <img>)
    photos.push({
      src:     item.dataset.src || img.src,
      caption: item.dataset.caption || '',
      alt:     img.alt || '',
      el:      item
    });
  });
}

function openLightbox(index) {
  buildPhotoIndex();
  if (!photos.length) return;
  current = index;
  showPhoto(current, false);         // show without animation on first open
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent page scroll while open
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showPhoto(index, animate = true) {
  if (!photos.length) return;
  current = (index + photos.length) % photos.length; // wraps around

  const updateImage = () => {
    lbImg.src               = photos[current].src;
    lbImg.alt               = photos[current].alt;
    lbCaption.textContent   = photos[current].caption;
    lbCounter.textContent   = `${current + 1} / ${photos.length}`;
    lbImg.classList.remove('fading');
  };

  if (animate) {
    lbImg.classList.add('fading');
    setTimeout(updateImage, 180); // wait for fade-out then swap image
  } else {
    updateImage();
  }
}

// Click a photo to open the lightbox
document.getElementById('photo-grid').addEventListener('click', e => {
  const item = e.target.closest('.photo-item');
  if (!item || !item.querySelector('img')) return; // ignore placeholder clicks
  buildPhotoIndex();
  const idx = photos.findIndex(p => p.el === item);
  if (idx !== -1) openLightbox(idx);
});

// Button listeners
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click',  () => showPhoto(current - 1));
lbNext.addEventListener('click',  () => showPhoto(current + 1));

// Click the dark backdrop to close
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') showPhoto(current + 1);
  if (e.key === 'ArrowLeft')  showPhoto(current - 1);
  if (e.key === 'Escape')     closeLightbox();
});

// Touch swipe (mobile)
let touchStartX = 0;

lightbox.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) showPhoto(dx < 0 ? current + 1 : current - 1);
}, { passive: true });
