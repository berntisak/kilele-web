// The partners shown on the site: every entry in partners.json except those set to "active": false.
// The file is read fresh on every build (rather than require()d) so edits show up while `eleventy --serve` runs.
const fs = require("fs");
const path = require("path");

module.exports = function () {
    const partners = JSON.parse(fs.readFileSync(path.join(__dirname, "partners.json"), "utf8"));
    return partners.filter((partner) => partner.active !== false);
};
