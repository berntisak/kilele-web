// Category filter functionality for schedule page
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-button');
  const scheduleItems = document.querySelectorAll('.schedule-item');
  const scheduleDays = document.querySelectorAll('.schedule-day');
  const activeFilterHeading = document.getElementById('active-filter');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update heading
      if (category === 'all') {
        activeFilterHeading.style.display = 'none';
      } else {
        activeFilterHeading.textContent = "Filtered by: " + category;
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
    });
  });
});
