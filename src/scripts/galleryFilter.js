// Gallery category filter + lightbox
(function () {
  let listenersAdded = false;
  let activeCategory = 'all';

  // Lightbox state
  let visibleItems = [];
  let currentIndex = 0;

  // --- Filtering ---

  function applyFilter() {
    const sections = document.querySelectorAll('.gallery-section');
    if (!sections.length) return;

    sections.forEach(section => {
      const matches = activeCategory === 'all' || section.dataset.categorySection === activeCategory;
      section.style.display = matches ? '' : 'none';
    });

    // Rebuild visible items list for lightbox navigation
    visibleItems = Array.from(document.querySelectorAll('.gallery-section'))
      .filter(section => section.style.display !== 'none')
      .flatMap(section => Array.from(section.querySelectorAll('.gallery-item')));
  }

  function handleFilterClick(e) {
    const btn = e.target.closest('.gallery-filter-button');
    if (!btn) return;

    e.preventDefault();
    activeCategory = btn.dataset.category;

    document.querySelectorAll('.gallery-filter-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    applyFilter();
  }

  // --- Lightbox ---

  function openLightbox(index) {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox || !visibleItems.length) return;

    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox || !visibleItems.length) return;

    const item = visibleItems[currentIndex];
    const img = lightbox.querySelector('.gallery-lightbox__img');
    const caption = lightbox.querySelector('.gallery-lightbox__caption');
    const eventEl = lightbox.querySelector('.gallery-lightbox__event');
    const photographer = lightbox.querySelector('.gallery-lightbox__photographer');

    if (img) {
      img.src = item.dataset.fullSrc || item.querySelector('img').src;
      img.alt = item.dataset.caption || '';
    }

    if (caption) {
      const text = item.dataset.caption || '';
      caption.textContent = text;
      caption.style.display = text ? '' : 'none';
    }

    if (eventEl) {
      const ppSlug = item.dataset.programPointSlug || '';
      const ppTitle = item.dataset.programPointTitle || '';
      let artists = [];
      try { artists = JSON.parse(item.dataset.artists || '[]'); } catch (e) {}

      const ppPart = ppSlug && ppTitle
        ? `<a href="/2026/schedule/${ppSlug}/">${ppTitle}</a>`
        : '';
      const artistsPart = artists.length
        ? artists.map(a => `<a href="/2026/lineup/${a.slug}/">${a.name}</a>`).join(', ')
        : '';

      if (ppPart && artistsPart) {
        eventEl.innerHTML = `${ppPart} — ${artistsPart}`;
        eventEl.style.display = '';
      } else if (ppPart || artistsPart) {
        eventEl.innerHTML = ppPart || artistsPart;
        eventEl.style.display = '';
      } else {
        eventEl.innerHTML = '';
        eventEl.style.display = 'none';
      }
    }

    if (photographer) {
      const name = item.dataset.photographer || '';
      const link = item.dataset.photographerLink || '';
      if (name) {
        photographer.style.display = '';
        if (link) {
          photographer.innerHTML = 'Photo: <a href="' + link + '" target="_blank" rel="noopener noreferrer">' + name + '</a>';
        } else {
          photographer.textContent = 'Photo: ' + name;
        }
      } else {
        photographer.style.display = 'none';
        photographer.textContent = '';
      }
    }
  }

  function showPrev() {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightboxContent();
  }

  function showNext() {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightboxContent();
  }

  function handleGalleryClick(e) {
    const item = e.target.closest('.gallery-item');
    if (!item) return;

    e.preventDefault();
    const index = visibleItems.indexOf(item);
    if (index === -1) return;
    openLightbox(index);
  }

  function handleLightboxClick(e) {
    if (e.target.closest('.gallery-lightbox__close')) {
      closeLightbox();
      return;
    }
    if (e.target.closest('.gallery-lightbox__prev')) {
      showPrev();
      return;
    }
    if (e.target.closest('.gallery-lightbox__next')) {
      showNext();
      return;
    }
    // Click on backdrop (not on image or controls) closes lightbox
    if (e.target.id === 'gallery-lightbox') {
      closeLightbox();
    }
  }

  function handleKeydown(e) {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox || !lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  }

  // --- Init ---

  function init() {
    const grid = document.querySelector('.gallery-section');
    if (!grid) return; // Not on gallery page

    if (!listenersAdded) {
      document.addEventListener('click', handleFilterClick);
      document.addEventListener('click', handleGalleryClick);
      document.addEventListener('click', handleLightboxClick);
      document.addEventListener('keydown', handleKeydown);
      listenersAdded = true;
    }

    // Reset state on (re)init
    const activeBtn = document.querySelector('.gallery-filter-button.active');
    activeCategory = activeBtn ? activeBtn.dataset.category : 'all';
    applyFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run on Swup navigation (v3 and v4 event names)
  document.addEventListener('swup:contentReplaced', init);
  document.addEventListener('swup:page:view', init);
})();
