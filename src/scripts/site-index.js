// Opens and closes the index (#184). The <dialog> element itself traps
// focus, closes on Escape and returns focus to INDEX.
const siteIndex = document.getElementById("site-index");

document.querySelector(".header-bar__index").addEventListener("click", () => siteIndex.showModal());
siteIndex.querySelector(".site-index__close").addEventListener("click", () => siteIndex.close());
