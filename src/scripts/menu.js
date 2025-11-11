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
