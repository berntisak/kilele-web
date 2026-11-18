// The category filter on the schedule list (#193). Pressing a category shows
// only its rows; "All" shows every row. Without this script the buttons stay
// hidden and the whole list shows.
const filter = document.querySelector(".schedule__filter");

if (filter) {
    const buttons = filter.querySelectorAll("button");
    const rows = document.querySelectorAll(".schedule__row");

    filter.hidden = false;

    filter.addEventListener("click", (event) => {
        const pressed = event.target.closest("button");
        if (!pressed) return;

        const category = pressed.dataset.filter;

        buttons.forEach((button) => button.setAttribute("aria-pressed", button === pressed));
        rows.forEach((row) => {
            row.hidden = category !== "all" && row.dataset.category !== category;
        });
    });
}
