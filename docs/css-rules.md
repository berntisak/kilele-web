# CSS rules

How Kilele's CSS is organised and written. The first half explains the idea; the second half is a numbered list of rules that code comments point to (`/* rule 11 */`).

Agreed in [CSS conventions / style guide for the kit](https://github.com/berntisak/kilele-web/issues/178). Change a rule by changing it here first.

## The idea

### Kit and pages

The CSS is split in two:

- **The kit** is Kilele's design system: the colours, fonts, font sizes, spacing, screen-size cutoffs, and the shared pieces every page uses (the header bar, the index, the footer, the pipes). It stays the same from year to year and lives in `src/css/kit/`.
- **Pages** are the styles that belong to one page only (the news grid, the lineup list). Each lives in its own file in `src/css/pages/`.

A page **uses** the kit and never redefines it. To change how the whole site looks, you edit the kit. To change one page, you edit that page's file, and nothing else can break.

### Variables instead of raw values

Every colour, font size and gap comes from a kit variable (`var(--text)`, `var(--text-5)`, `var(--space-3)`), never typed in directly. Change a variable once and the whole site follows. Variables come in a small set of steps, so things line up across pages without measuring.

Colours have two layers. The **palette** is what the colours are (`--red`, `--cream`, `--ink`). **Roles** say what a colour is for (`--text`, `--ground`, `--pipe`). Pages only use roles. That is what lets a Section switch from cream to ink: the roles are redefined inside it, and everything follows.

### Small screens first

Every rule describes the phone layout first. Media queries then **add** to it as the screen gets wider, at three named cutoffs: `--small` (600px), `--medium` (900px) and `--large` (1200px). Each name means "this width and wider". The numbers live in one file, so changing a cutoff is a one-line edit.

### One stylesheet

You write many small files. At build time, LightningCSS combines them, starting from `src/css/site.css`, into one file the browser downloads once. This is also what turns the cutoff names into real numbers, because browsers don't support named cutoffs yet. Loading every page's styles everywhere is safe because each page's rules only apply inside that page (rule 5).

### Files

```
src/css/
├── site.css              the entry file: imports everything below, in order
├── kit/
│   ├── reset.css         evens out browser defaults
│   ├── breakpoints.css   --small / --medium / --large
│   ├── colours.css       palette, roles, and the ink flip
│   ├── type.css          fonts, --text-1…8, line heights, weights
│   ├── spacing.css       --space-1…8
│   ├── elements.css      bare HTML tags: body, a, h1–h6, img, button
│   └── components/       one file per shared piece, named after its class
└── pages/                one file per page that has styles of its own
```

## The rules

### Naming

1. **Class names follow BEM:** `component`, `component__part`, `component--variant`. For example `news-card`, `news-card__image`, `news-card--featured`.
2. **Words inside each piece are joined with single hyphens:** `news-card__date-tag`. Underscores never join ordinary words.
3. **States that JavaScript switches on and off start with `is-`:** `is-active`, `is-open`, `is-stuck`. They are written alongside the component class (`.filter-button.is-active`), never as a `--` variant. Variants are fixed in the HTML; states change while the page is in use.

### Pages

4. **Every page puts `page page--<name>` on the Swup container:** `<div id="swup" class="page page--news">`. It goes there, not on `<body>`, because Swup only swaps that container.
5. **A page file is one `.page--<name> { … }` block** with everything inside it, so its rules can only apply on that page.

### Kit

6. **The site's frame and motif are in the kit from the start:** the header bar, the index, the footer, the pipes and section headings.
7. **Anything else starts in its page and moves to the kit when a second page needs it.** Never before, and never copied. When it moves, it gets a page-neutral name (`news-card` → `card`).
8. **Kit files never mention a page.**

### Values

9. **Colour, font family, font size, font weight, line height and spacing (`margin`, `padding`, `gap`) always come from kit variables.** Test: would I want this to change everywhere at once?
10. **One-off sizes and placements may be written directly:** a card's height, an image's width, a decoration's offset, grid column counts, a `1px` line.
11. **Pages and components use colour roles only** (`--ground`, `--text`, `--text-muted`, `--rule`, `--pipe`). Palette names (`--red`, `--cream`, `--ink`, …) appear only in `colours.css`.
12. **Cream vs ink is set with `data-ground="ink"`** on a Section, never by picking colours by hand. The roles flip by themselves.
13. **Spacing uses `--space-1` to `--space-8`**, smallest to largest: 0.25, 0.5, 0.75, 1, 1.5, 2, 3 and 5rem.
14. **Font sizes use `--text-1` to `--text-8`**, smallest to largest. Steps 1–4 are fixed; steps 5–8 grow with the screen from 375px up to `--large`. Pages never write `clamp()` or `vw` font sizes themselves.
15. **Fonts, line heights and weights are named in words:** `--font-display`, `--font-body`, `--font-mono`; `--line-height-tight`, `--line-height-normal`; `--weight-normal`, `--weight-bold`.
16. **No text helper classes in the HTML.** Each component's own rule sets its type. A text style that keeps recurring becomes a kit component (rule 7).

### Screen sizes

17. **Mobile-first: media queries use `min-width` only.** The plain rule is the phone layout.
18. **Use the three named cutoffs: `@media (--small)`, `(--medium)`, `(--large)`.** Numbers only appear in `breakpoints.css`. Add a fourth only when a real page needs it.
19. **Media queries go inside the rule they change**, not in a separate block at the end of the file.

### Writing CSS

20. **Only three things are nested:** the page wrapper, states (`&:hover`, `&.is-open`, `&:focus-visible`), and media queries. A component's parts are separate rules side by side, never nested inside the component. Deeper nesting makes rules harder to override.
21. **Every selector is defined in exactly one place.** Two rules for the same thing means the result depends on load order, which is invisible.
22. **No fixed heights on boxes that contain text.** Long titles and enlarged text get cut off. Use `min-height`, and `aspect-ratio` for images. Fixed heights are fine for pure decoration.
23. **No `!important` and no styling by `#id`.** Both can only be overridden by something even stronger.
24. **Properties go in a loose outside-in order:** placement → layout → size and space → text → looks → everything else, then states and media queries last. A habit, not a law.
25. **Prettier formats on save, with 4-space indentation.** It only changes layout, never what the CSS does.
26. **Comments are short (one or two lines) and say why, not what.** Write in the present tense, without history. For more, point to a rule here (`/* rule 11 */`) or a ticket. No commented-out code: git keeps old versions. Every file starts with a short header saying what it is for.

### Files

27. **One file per component and per page, named after its class** (`components/footer.css` holds `.footer`). Variables are split by topic, as in the file tree above.
28. **`site.css` is the only entry file.** Add a component or page by adding one `@import` line there. LightningCSS builds it into a single stylesheet, which is the only one the layout links.
