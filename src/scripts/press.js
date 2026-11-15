/*
 * Kilele — chrome behaviour for the E · Press prototype (#141, spec in #143).
 *
 * Two jobs:
 *   1. The hairline strip inverts over the ink band, taking the ground of the
 *      section it is currently over.
 *   2. The index overlay opens, closes, and traps focus while open.
 *
 * #143 flagged the invert as the one part of the header that can visibly
 * break, and left the overlay's transition and focus mechanics undecided on
 * purpose — both are cheaper to settle in a browser than on paper.
 *
 * Everything here is idempotent and re-bindable: Swup replaces #swup wholesale
 * on every client-side navigation, which silently kills any observer watching
 * an element inside it. layouts/press.html calls rebind() from Swup's
 * content:replace hook.
 */
(function () {
  "use strict";

  var bar = null;
  var toggle = null;
  var index = null;
  var observer = null;
  var lastFocus = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* ---------------------------------------------------------------- *
   * The invert
   * ---------------------------------------------------------------- */

  /**
   * Sets the bar's ground unless the index is open, in which case the bar is
   * over a full-screen ink overlay and ink wins regardless of the page beneath.
   */
  function setBarGround(ground) {
    if (!bar) return;
    bar.dataset.pageGround = ground;
    if (document.body.classList.contains("index-open")) return;
    applyGround(ground);
  }

  function applyGround(ground) {
    if (!bar) return;
    if (ground === "ink") bar.setAttribute("data-ground", "ink");
    else bar.removeAttribute("data-ground");
  }

  /**
   * Watches the ink band and flips the bar while the bar is over it.
   *
   * The rootMargin does the work: it shrinks the viewport down to a 1px-tall
   * detection strip sitting immediately below the bar, so the band intersects
   * that strip exactly while the bar is over it. That is the question being
   * asked, and it is not the same as "is the band visible" — an observer with
   * a default root fires as soon as the band appears at the bottom of the
   * screen, which is the wrong moment by most of a viewport.
   *
   * Both insets have to be real pixels: `-100%` for the bottom collapses the
   * strip to zero or negative height and the callback then never fires, which
   * is silent rather than loud. So the bottom is computed from the viewport,
   * and this is re-run on resize.
   */
  function bindObserver() {
    if (observer) { observer.disconnect(); observer = null; }

    var band = document.querySelector("[data-invert-bar]");
    if (!band || !bar || !("IntersectionObserver" in window)) {
      setBarGround("cream");
      return;
    }

    var barHeight = Math.round(bar.getBoundingClientRect().height);
    var viewport = window.innerHeight || document.documentElement.clientHeight;
    var bottomInset = Math.max(viewport - barHeight - 1, 0);

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          setBarGround(entry.isIntersecting ? "ink" : "cream");
        });
      },
      {
        rootMargin: -barHeight + "px 0px -" + bottomInset + "px 0px",
        threshold: 0,
      }
    );
    observer.observe(band);
  }

  /* ---------------------------------------------------------------- *
   * The index overlay
   * ---------------------------------------------------------------- */

  function openIndex() {
    if (!index || !toggle) return;
    lastFocus = document.activeElement;
    document.body.classList.add("index-open");
    toggle.setAttribute("aria-expanded", "true");
    applyGround("ink");
    var first = index.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeIndex(restoreFocus) {
    if (!index || !toggle) return;
    if (!document.body.classList.contains("index-open")) return;
    document.body.classList.remove("index-open");
    toggle.setAttribute("aria-expanded", "false");
    applyGround(bar && bar.dataset.pageGround === "ink" ? "ink" : "cream");

    // Send focus back where it came from — but only if that was a real
    // control. Opening from a keyboard leaves the toggle focused and this
    // restores it; opening any other way leaves <body> as the active
    // element, and focusing <body> is a silent no-op that would strand the
    // caret inside an overlay that is no longer on screen.
    if (restoreFocus) {
      var target =
        lastFocus && lastFocus !== document.body && document.contains(lastFocus)
          ? lastFocus
          : toggle;
      if (target) target.focus();
    }
    lastFocus = null;
  }

  function onKeydown(event) {
    if (!document.body.classList.contains("index-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeIndex(true);
      return;
    }

    if (event.key !== "Tab") return;

    // Trap: the overlay covers the page, so tabbing out of it would land on
    // links nobody can see. The toggle is part of the loop — it is the close
    // button while open.
    var items = [toggle].concat(
      Array.prototype.slice.call(index.querySelectorAll(FOCUSABLE))
    ).filter(function (el) { return el && el.offsetParent !== null; });
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------------------------------------------- *
   * Wiring
   * ---------------------------------------------------------------- */

  function rebind() {
    bar = document.getElementById("press-bar");
    toggle = document.getElementById("press-index-toggle");
    index = document.getElementById("press-index");
    bindObserver();
  }

  function init() {
    rebind();
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      if (document.body.classList.contains("index-open")) closeIndex(true);
      else openIndex();
    });

    // A navigation from inside the index should leave it closed behind you.
    // Swup handles the client-side case via visit:start; this covers the
    // full-page-load case and any link Swup declines.
    if (index) {
      index.addEventListener("click", function (event) {
        if (event.target.closest("a")) closeIndex(false);
      });
    }

    document.addEventListener("keydown", onKeydown);

    // rootMargin is computed from the bar's height and the viewport's, and
    // both move: the bar changes height at the 900px breakpoint, and the
    // viewport changes on every rotation and window drag. Rebuild on resize,
    // debounced — an observer built against a stale viewport does not throw,
    // it just stops firing.
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(bindObserver, 150);
    });
  }

  window.KilelePress = {
    rebind: rebind,
    closeIndex: function () { closeIndex(false); },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
