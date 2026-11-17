// PROTOTYPE, throwaway: flips the front page between key-art variants via ?variant=.
(() => {
    const variants = [
        ["now", "Current design"],
        ["A", "Minimal"],
        ["B", "Figure"],
        ["C", "Key art led"],
    ];
    const keys = variants.map(([key]) => key);
    const params = new URLSearchParams(location.search);
    const asked = params.get("variant");
    const current = keys.includes(asked) ? asked : "now";

    document.documentElement.dataset.keyart = current;

    // Only on localhost, or when a ?variant= link was shared (e.g. a Vercel preview for the designer).
    const local = ["localhost", "127.0.0.1"].includes(location.hostname);
    if (!local && !asked) return;

    const bar = document.querySelector(".keyart-switcher");
    if (!bar) return;
    bar.hidden = false;
    const index = keys.indexOf(current);
    bar.querySelector(".keyart-switcher__label").textContent = `${current} · ${variants[index][1]}`;

    const go = (step) => {
        const next = keys[(index + step + keys.length) % keys.length];
        params.set("variant", next);
        location.search = params.toString();
    };

    bar.addEventListener("click", (event) => {
        const step = event.target.closest("[data-step]")?.dataset.step;
        if (step) go(Number(step));
    });

    document.addEventListener("keydown", (event) => {
        if (event.target.closest("input, textarea, select, [contenteditable]")) return;
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
    });
})();
