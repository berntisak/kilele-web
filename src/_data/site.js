const edition = require("./edition");

module.exports = {
  name: `Kilele ${edition.year}`,
  url: (process.env.SITE_URL || "http://localhost:8080").replace(/\/+$/, ""),
  description: "Kilele is East Africa's summit for music, technology, and culture, bringing artists and communities together in Nairobi.",
  defaultImage: "/assets/images/2027/Kilele_2027_Social-Preview-Image-1200x630.jpg",
  logo: "/assets/logos/kilele_logo_2027.svg",
  sameAs: [
    "https://kilelesummit.substack.com/",
    "https://www.instagram.com/kilelesummit/",
    "https://www.youtube.com/@KileleSummit",
    "https://santuri.org/kilele"
  ]
};
