document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero__section--split");
  const dots = document.querySelectorAll(".dot");
  let current = 0;

  function showSlide(index) {
    slides.forEach((s, i) => {
      s.classList.toggle("active", i === index);
      s.classList.toggle("fade", i === index);
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      current = i;
      showSlide(current);
    });
  });

  setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 6000);
});
