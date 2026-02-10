// Category filter functionality for schedule page
(function() {
  let isInitialized = false;
  
  function handleFilterClick(e) {
    // Check if clicked element is a filter button
    if (!e.target.classList.contains('filter-button')) {
      return;
    }
    
    e.preventDefault();
    const category = e.target.dataset.category;
    
    const filterButtons = document.querySelectorAll('.filter-button');
    const scheduleItems = document.querySelectorAll('.schedule-item');
    const scheduleDays = document.querySelectorAll('.schedule-day');
    const activeFilterHeading = document.getElementById('active-filter');
    
    if (!scheduleItems.length) {
      return;
    }
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Update heading
    if (category === 'all') {
      activeFilterHeading.style.display = 'none';
    } else {
      activeFilterHeading.textContent = category;
      activeFilterHeading.style.display = 'block';
    }
    
    // Filter schedule items
    if (category === 'all') {
      scheduleItems.forEach(item => {
        item.parentElement.style.display = '';
      });
    } else {
      scheduleItems.forEach(item => {
        if (item.dataset.category === category) {
          item.parentElement.style.display = '';
        } else {
          item.parentElement.style.display = 'none';
        }
      });
    }
    
    // Hide empty days
    scheduleDays.forEach(day => {
      const visibleItems = Array.from(day.querySelectorAll('.schedule-item'))
        .filter(item => item.parentElement.style.display !== 'none');
      
      if (visibleItems.length === 0) {
        day.style.display = 'none';
      } else {
        day.style.display = '';
      }
    });
  }
  
  function initFilter() {
    if (!isInitialized) {
      // Use event delegation on document level - only attach once
      document.addEventListener('click', handleFilterClick);
      isInitialized = true;
    }
  }

  // Run on initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilter);
  } else {
    initFilter();
  }

  // Re-run when Swup navigates to a new page (but won't re-attach listener)
  document.addEventListener('swup:contentReplaced', initFilter);
})();
