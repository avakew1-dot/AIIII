# motion-principles.csv — Credits & Sources

The 37 rows in `motion-principles.csv` are synthesized from Emil Kowalski's open-source design engineering skill (Apache-style permissive license inferred from the public repo) and from his public writing at emilkowal.ski.

## Primary source

- **Emil Kowalski** — design engineer, creator of [Sonner](https://sonner.emilkowal.ski/) (13M+ weekly npm downloads), [Vaul](https://vaul.emilkowal.ski/), and the [animations.dev](https://animations.dev/) course
- Skill repo: [github.com/emilkowalski/skill](https://github.com/emilkowalski/skill)
- Personal site: [emilkowal.ski](https://emilkowal.ski/)
- Course (deeper material): [animations.dev](https://animations.dev/)

## What was ported

- The Animation Decision Framework (frequency tiers, purpose audit, easing selection, duration table)
- Custom cubic-bezier curves recommended in his skill (--ease-out, --ease-in-out, --ease-drawer)
- Spring physics guidance (Apple-style config, bounce ranges, when to use vs. tween)
- Component principles (button :active scale, never-from-zero, popover origin, tooltip skip, blur masking, @starting-style)
- Performance rules (transform/opacity only, CSS-vars-on-parent caveat, Framer Motion shorthand pitfall, CSS > JS under load, WAAPI usage)
- Gesture rules (velocity dismissal, boundary damping, pointer capture, multi-touch)
- Accessibility (prefers-reduced-motion semantics, hover gating)
- Polish patterns (stagger ranges, cohesion, next-day review, real-device testing)
- Sonner-derived library principles (defaults, edge cases)

## What was NOT ported (deliberately)

- Code blocks longer than a few lines — readers should follow the source links to see full implementations in context
- Brand-specific commentary on Sonner, Vaul, and Vercel's dashboard postmortem — interesting context, not a rule
- Emil's first-person voice — these rows are reformulated as portable rules

## How to credit in derived work

If you ship a product based on these rows, a link to [emilkowal.ski](https://emilkowal.ski/) and [animations.dev](https://animations.dev/) is the right thing to do. The rules without the experience behind them are half the value — Emil's writing is the other half.

## Attribution in CSV rows

Each row's `Source` column attributes the specific origin: most rows trace to Emil directly; a few inherit from collaborators (Vaul gestures, Sonner library principles) and adjacent authorities (WCAG for prefers-reduced-motion, easing.dev for curve resources).
