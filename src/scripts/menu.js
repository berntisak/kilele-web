document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu-toggle");
  const mobile = document.querySelector(".header__links");
  console.log(btn, mobile);

  if (!btn || !mobile) return;

  const open = () => {
    mobile.classList.add("open");
    mobile.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    btn.textContent = "✕";
  };
  const close = () => {
    mobile.classList.remove("open");
    mobile.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "☰";
  };

  btn.addEventListener("click", () =>
    mobile.classList.contains("open") ? close() : open()
  );

  mobile.addEventListener("click", (e) => {
    if (e.target.tagName === "A") close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Dropdown click toggle (for all submenus)
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;

    const toggleOpen = () => {
      const isOpen = dropdown.classList.contains('open');
      // close all other dropdowns first
      dropdowns.forEach((d) => {
        if (d !== dropdown) {
          d.classList.remove('open');
          d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        }
      });
      dropdown.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    };

    toggle.addEventListener('click', (ev) => {
      if (ev && ev.preventDefault) ev.preventDefault();
      ev.stopPropagation();
      toggleOpen();
    });
  });

  // close all dropdowns when clicking outside
  document.addEventListener('click', (ev) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(ev.target)) {
        dropdown.classList.remove('open');
        dropdown.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // close all dropdowns with escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove('open');
        dropdown.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  const nav = document.querySelector(".header__outer_container");
  const observer = new IntersectionObserver(
    (arg) => {
        const [entry] = arg
        if (entry.intersectionRatio <1) {
            nav.classList.add("stuck");
        }
        else {
            nav.classList.remove("stuck");
        }   
    },
    {
        threshold: [1],
        rootMargin: "-1px 0px 0px 0px"
    }
  )
  observer.observe(nav);
});
