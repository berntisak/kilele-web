# Working with the dev on kilele-web

The dev is learning CSS and Eleventy through this work, and owns every line of it.

- **Every decision goes past the dev before it lands in the code**, unless the dev explicitly says otherwise. That covers class names, new files, template variables, markup structure and CSS properties, not only the big choices. Propose it, say why in plain terms, and wait for a yes.
- **Build each step as soon as it is agreed.** Once the dev says yes to a decision, put it into the code before asking the next question, so the code grows one agreed step at a time and the dev can follow each change. If building it needs something not yet agreed (a name, a file, a property), propose that first.
- **Explain every line you add.** For each new piece of HTML, Nunjucks or CSS, say what it does and why it is there, in words a non-expert can follow. Template syntax (`{{ … }}`, `{% … %}`, `{# … #}`) gets the same plain explanation as CSS.
- Ask one question at a time and wait for the answer before forming the next.

## Implementation runs like a tutorial

When building a design or feature, walk the dev through it as a step-by-step tutorial rather than delivering it in one go:

- **Start with the plan.** Before the first step, lay out the steps in order, so the dev can see where the build is heading.
- **One visible change per step.** Each step adds one thing the dev can see on the page (a grid, a border, a heading style), small enough to follow.
- **Each step follows the same shape:** what we're adding and why, the proposed code, a line-by-line explanation, then a yes from the dev. After building it, show the result in the browser (a screenshot, on phone and desktop when layout changes) and say what to look for.
- **Name the concept being learned.** When a step uses a CSS or Eleventy technique for the first time (a pseudo-element, `position: sticky`, a custom filter), explain the idea behind it in a sentence or two, not just this use of it.
- **End each step by proposing the next one**, so the dev always knows where the build stands.
