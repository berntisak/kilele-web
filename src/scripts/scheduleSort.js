document.addEventListener("DOMContentLoaded", () => {
  const scheduleList = document.querySelector('.schedule-list');
  const timeButton = document.querySelector('[data-sort="time"]');
  const categoryButton = document.querySelector('[data-sort="category"]');
  
  if (!scheduleList || !timeButton || !categoryButton) return;

  let currentSort = 'time';

  function setActiveButton(activeBtn) {
    [timeButton, categoryButton].forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  function sortByTime() {
    const days = Array.from(scheduleList.querySelectorAll('.schedule-day'));
    
    days.forEach(day => {
      const items = Array.from(day.querySelectorAll('.schedule-item'));
      items.sort((a, b) => {
        const timeA = a.querySelector('.schedule-text').textContent.match(/\d{2}:\d{2}/)?.[0] || '';
        const timeB = b.querySelector('.schedule-text').textContent.match(/\d{2}:\d{2}/)?.[0] || '';
        return timeA.localeCompare(timeB);
      });
      
      items.forEach(item => day.appendChild(item.parentElement));
    });
  }

  function sortByCategory() {
    const days = Array.from(scheduleList.querySelectorAll('.schedule-day'));
    
    days.forEach(day => {
      const items = Array.from(day.querySelectorAll('.schedule-item'));
      items.sort((a, b) => {
        const catA = a.querySelector('.schedule-item-right b')?.textContent || '';
        const catB = b.querySelector('.schedule-item-right b')?.textContent || '';
        return catA.localeCompare(catB);
      });
      
      items.forEach(item => day.appendChild(item.parentElement));
    });
  }

  timeButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentSort === 'time') return;
    currentSort = 'time';
    setActiveButton(timeButton);
    sortByTime();
  });

  categoryButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentSort === 'category') return;
    currentSort = 'category';
    setActiveButton(categoryButton);
    sortByCategory();
  });

  // Set initial active state
  setActiveButton(timeButton);
});
