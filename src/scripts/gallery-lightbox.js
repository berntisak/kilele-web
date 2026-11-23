// The gallery's lightbox (#195): clicking a thumbnail shows the photo full size in a
// dialog over the page. Without this script, a thumbnail just opens the photo file.
const lightbox = document.querySelector(".lightbox");
const lightboxPhoto = document.querySelector(".lightbox__photo");
const lightboxText = document.querySelector(".lightbox__text");

const photoLinks = [...document.querySelectorAll(".gallery__photo")];
let current = 0;

// Shows photo number `index` in the lightbox, wrapping round at either end.
function show(index) {
    current = (index + photoLinks.length) % photoLinks.length;
    const link = photoLinks[current];
    lightboxPhoto.src = link.href;
    lightboxPhoto.alt = link.querySelector("img").alt;
    // The photo's caption and credits wait in the <template> right after its link.
    lightboxText.replaceChildren(link.nextElementSibling.content.cloneNode(true));
}

photoLinks.forEach((link, index) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        show(index);
        lightbox.showModal();
    });
});

document.querySelector(".lightbox__prev").addEventListener("click", () => show(current - 1));
document.querySelector(".lightbox__next").addEventListener("click", () => show(current + 1));

// The arrow keys step through the photos while the lightbox is open.
lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
});

// A click anywhere in the lightbox closes it, except on its buttons and the credit links.
lightbox.addEventListener("click", (event) => {
    if (!event.target.closest("a, button")) lightbox.close();
});
