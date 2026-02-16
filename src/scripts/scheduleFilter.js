// Category filter functionality for schedule page
(function() {
  let isInitialized = false;
  let activeCategory = 'all';
  let activeDay = 'all';

  function applyFilters() {
    const scheduleItems = document.querySelectorAll('.schedule-item');
    const scheduleDays = document.querySelectorAll('.schedule-day');
    const activeFilterHeading = document.getElementById('active-filter');

    if (!scheduleItems.length) {
      return;
    }

    // Update heading for category
    if (activeFilterHeading) {
      if (activeCategory === 'all') {
        activeFilterHeading.style.display = 'none';
      } else {
        activeFilterHeading.textContent = activeCategory;
        activeFilterHeading.style.display = 'block';
      }
    }

    // Filter schedule items by category + day
    scheduleItems.forEach(item => {
      const dayElement = item.closest('.schedule-day');
      const dayValue = dayElement ? dayElement.dataset.day : undefined;
      const isMultiDay = dayElement && dayElement.dataset.multiday === 'true';
      const matchesCategory = isMultiDay || activeCategory === 'all' || item.dataset.category === activeCategory;
      const matchesDay = activeDay === 'all' || dayValue === activeDay;
      const allowMultiDay = !isMultiDay || activeDay === 'all';

      if (matchesCategory && matchesDay && allowMultiDay) {
        item.parentElement.style.display = '';
      } else {
        item.parentElement.style.display = 'none';
      }
    });

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
  
  function handleFilterClick(e) {
    const categoryButton = e.target.closest('.filter-button');
    const dayButton = e.target.closest('.day-filter-button');

    if (!categoryButton && !dayButton) {
      return;
    }

    e.preventDefault();

    if (categoryButton) {
      activeCategory = categoryButton.dataset.category;
      const filterButtons = document.querySelectorAll('.filter-button');
      filterButtons.forEach(btn => btn.classList.remove('active'));
      categoryButton.classList.add('active');
    }

    if (dayButton) {
      activeDay = dayButton.dataset.day;
      const dayButtons = document.querySelectorAll('.day-filter-button');
      dayButtons.forEach(btn => btn.classList.remove('active'));
      dayButton.classList.add('active');
    }

    applyFilters();
  }
  
  function initFilter() {
    if (!isInitialized) {
      // Use event delegation on document level - only attach once
      document.addEventListener('click', handleFilterClick);
      isInitialized = true;
    }

    const activeCategoryButton = document.querySelector('.filter-button.active');
    const activeDayButton = document.querySelector('.day-filter-button.active');
    activeCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'all';
    activeDay = activeDayButton ? activeDayButton.dataset.day : 'all';
    applyFilters();
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
