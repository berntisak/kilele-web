// Calendar view functionality
(function() {
  let currentDayIndex = 0;
  let scheduleByDay = {};
  let dayKeys = [];

  function parseScheduleData() {
    // Parse the schedule data from the DOM
    const scheduleDays = document.querySelectorAll('.schedule-day');
    scheduleByDay = {};
    
    scheduleDays.forEach(dayEl => {
      const dateText = dayEl.querySelector('.schedule-date')?.textContent.trim();
      if (!dateText) return;
      
      const events = [];
      const items = dayEl.querySelectorAll('.schedule-item');
      
      items.forEach(item => {
        const titleEl = item.querySelector('.schedule__list-title');
        const timeText = item.querySelector('.schedule__section-date-category')?.textContent.trim();
        const categoryName = item.dataset.category;
        
        // Get color from outline style - it's in format "3px solid rgb(...)"
        const outlineStyle = item.style.outline;
        let categoryColor = '#cccccc';
        const colorMatch = outlineStyle.match(/rgb\([^)]+\)|#[0-9a-f]{6}/i);
        if (colorMatch) {
          categoryColor = colorMatch[0];
        }
        
        if (!titleEl || !timeText) {
          console.log('Missing title or time:', { titleEl, timeText });
          return;
        }
        
        // Parse time (format: "HH:mm - HH:mm at Venue")
        const timeMatch = timeText.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\s*at\s*(.+)/);
        if (!timeMatch) return;
        
        // Get link from parent anchor
        const link = item.closest('a')?.href || '#';
        
        events.push({
          title: titleEl.textContent.trim(),
          startTime: timeMatch[1],
          endTime: timeMatch[2],
          venue: timeMatch[3].trim(),
          category: categoryName,
          color: categoryColor,
          link: link
        });
      });
      
      if (events.length > 0) {
        scheduleByDay[dateText] = events;
      }
    });
    
    dayKeys = Object.keys(scheduleByDay);
    currentDayIndex = 0;
    
    console.log('Parsed schedule data:', scheduleByDay);
    console.log('Day keys:', dayKeys);
  }

  function hexToRgba(hex, alpha) {
    // Convert hex to rgba
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function rgbToRgba(rgb, alpha) {
    // Convert rgb() to rgba()
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
    }
    return rgb;
  }

  function colorToRgba(color, alpha) {
    if (color.startsWith('#')) {
      return hexToRgba(color, alpha);
    } else if (color.startsWith('rgb(')) {
      return rgbToRgba(color, alpha);
    }
    return color;
  }

  function getTimeSlots(events) {
    // Find earliest and latest times from events
    let earliestMinutes = Infinity;
    let latestMinutes = -Infinity;
    
    events.forEach(event => {
      const startMinutes = timeToMinutes(event.startTime);
      const endMinutes = timeToMinutes(event.endTime);
      earliestMinutes = Math.min(earliestMinutes, startMinutes);
      latestMinutes = Math.max(latestMinutes, endMinutes);
    });
    
    // Round to nearest hour
    const startHour = Math.floor((earliestMinutes - 60) / 60); // Start 1 hour before first event
    const endHour = Math.ceil((latestMinutes + 60) / 60); // End 1 hour after last event
    
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      const displayHour = h >= 24 ? h - 24 : h;
      slots.push(`${String(displayHour).padStart(2, '0')}:00`);
    }
    return slots;
  }

  function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Adjust for times after midnight (before 7am) - treat as next day
    const adjustedHours = hours < 7 ? hours + 24 : hours;
    return adjustedHours * 60 + minutes;
  }

  function calculateEventPosition(startTime, endTime, firstSlotTime, slotHeight = 60) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const firstSlotMinutes = timeToMinutes(firstSlotTime);
    
    const top = ((startMinutes - firstSlotMinutes) / 60) * slotHeight;
    const height = ((endMinutes - startMinutes) / 60) * slotHeight;
    
    return { top, height };
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const dateHeading = document.getElementById('current-calendar-date');
    
    if (!dayKeys.length || currentDayIndex >= dayKeys.length) {
      grid.innerHTML = '<div style="padding: 2rem; text-align: center;">No schedule data available</div>';
      return;
    }
    
    const currentDate = dayKeys[currentDayIndex];
    const events = scheduleByDay[currentDate] || [];
    
    dateHeading.textContent = currentDate;
    
    // Get unique venues (only those with events)
    const venues = [...new Set(events.map(e => e.venue))].sort();
    const timeSlots = getTimeSlots(events);
    const firstSlotTime = timeSlots[0];
    
    // Clear grid
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `80px repeat(${venues.length}, minmax(180px, 1fr))`;
    
    // Create headers
    const timeHeader = document.createElement('div');
    timeHeader.className = 'calendar-header time-column';
    timeHeader.textContent = 'Time';
    grid.appendChild(timeHeader);
    
    venues.forEach(venue => {
      const venueHeader = document.createElement('div');
      venueHeader.className = 'calendar-header';
      venueHeader.textContent = venue;
      grid.appendChild(venueHeader);
    });
    
    // Create time slots and event cells
    const cellsByVenue = {};
    venues.forEach(venue => {
      cellsByVenue[venue] = [];
    });
    
    timeSlots.forEach((time, index) => {
      // Time label
      const timeLabel = document.createElement('div');
      timeLabel.className = 'time-slot time-label';
      timeLabel.textContent = time;
      grid.appendChild(timeLabel);
      
      // Venue columns
      venues.forEach(venue => {
        const cell = document.createElement('div');
        cell.className = 'time-slot';
        cell.dataset.venue = venue;
        cell.dataset.time = time;
        grid.appendChild(cell);
        cellsByVenue[venue].push(cell);
      });
    });
    
    // Add events to cells
    venues.forEach(venue => {
      const venueEvents = events.filter(e => e.venue === venue);
      const firstCell = cellsByVenue[venue][0];
      
      console.log(`Adding ${venueEvents.length} events for venue: ${venue}`);
      
      if (!firstCell) {
        console.log('No first cell found for venue:', venue);
        return;
      }
      
      venueEvents.forEach(event => {
        const eventEl = document.createElement('a');
        eventEl.className = 'calendar-event';
        eventEl.href = event.link;
        eventEl.style.borderColor = event.color;
        eventEl.style.backgroundColor = colorToRgba(event.color, 0.3);
        
        const { top, height } = calculateEventPosition(event.startTime, event.endTime, firstSlotTime);
        eventEl.style.top = `${top}px`;
        eventEl.style.height = `${Math.max(height, 30)}px`;
        
        console.log(`Event "${event.title}": top=${top}px, height=${height}px`);
        
        eventEl.innerHTML = `
          <div class="calendar-event-title">${event.title}</div>
        `;
        
        firstCell.appendChild(eventEl);
      });
    });
  }

  function initCalendar() {
    const listView = document.querySelector('.schedule-list-view');
    const calendarView = document.querySelector('.calendar-view');
    const toggleButtons = document.querySelectorAll('.view-toggle-btn');
    const prevBtn = document.getElementById('prev-day');
    const nextBtn = document.getElementById('next-day');
    
    if (!listView || !calendarView) return;
    
    // View toggle
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (view === 'calendar') {
          listView.classList.remove('active');
          calendarView.classList.add('active');
          parseScheduleData();
          renderCalendar();
        } else {
          calendarView.classList.remove('active');
          listView.classList.add('active');
        }
      });
    });
    
    // Day navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentDayIndex > 0) {
          currentDayIndex--;
          renderCalendar();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentDayIndex < dayKeys.length - 1) {
          currentDayIndex++;
          renderCalendar();
        }
      });
    }
  }

  // Run on initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
  } else {
    initCalendar();
  }

  // Re-run when Swup navigates to a new page
  document.addEventListener('swup:contentReplaced', initCalendar);
})();
