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

  // Dropdown click toggle (for About submenu)
  const dropdown = document.querySelector('.dropdown');
  if (dropdown) {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');

    const toggleOpen = () => {
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    };

    toggle.addEventListener('click', (ev) => {
      // if toggle is an anchor, prevent navigation and toggle menu instead
      if (ev && ev.preventDefault) ev.preventDefault();
      ev.stopPropagation();
      toggleOpen();
    });

    // close when clicking outside
    document.addEventListener('click', (ev) => {
      if (!dropdown.contains(ev.target)) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // close with escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

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
