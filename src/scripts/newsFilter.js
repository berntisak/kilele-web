(function() {
  function initFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const tagFilter = urlParams.get('tag');
    const newsCards = document.querySelectorAll('.news-card-link');
    const activeFilterDiv = document.getElementById('activeFilter');
    const activeFilterTag = document.getElementById('activeFilterTag');
    const clearFilterBtn = document.getElementById('clearFilter');

    if (!newsCards.length || !activeFilterDiv || !clearFilterBtn) {
      return; // Elements not found, probably not on news page
    }

    // Reset all cards first
    newsCards.forEach(card => card.style.display = '');
    activeFilterDiv.style.display = 'none';

    function applyFilter(tag) {
      if (!tag) {
        newsCards.forEach(card => card.style.display = '');
        activeFilterDiv.style.display = 'none';
        return;
      }

      const tagLower = tag.toLowerCase();
      let visibleCount = 0;
      
      newsCards.forEach(card => {
        const cardTags = card.dataset.tags.toLowerCase().split(',');
        if (cardTags.includes(tagLower)) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (visibleCount > 0) {
        activeFilterDiv.style.display = 'flex';
        activeFilterTag.textContent = tag;
      }
    }

    // Remove any existing event listeners by cloning the button
    const newClearBtn = clearFilterBtn.cloneNode(true);
    clearFilterBtn.parentNode.replaceChild(newClearBtn, clearFilterBtn);
    
    newClearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/news/';
    });

    if (tagFilter) {
      applyFilter(tagFilter);
    }
  }

  // Run on initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilter);
  } else {
    initFilter();
  }

  // Re-run when Swup navigates to a new page
  document.addEventListener('swup:contentReplaced', initFilter);
})();
