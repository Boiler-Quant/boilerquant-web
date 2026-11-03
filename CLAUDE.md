# Boiler Quant website

Public website for Boiler Quant, Purdue University's quantitative finance club.
This is a from-scratch rebuild. The previous site lives in a separate repo
(https://github.com/Boiler-Quant/boiler_quant_web) and is **not** edited here.

## Tech stack

- **Astro 7** — static site framework. Pages are `.astro` files; they render to plain HTML at build time with no JavaScript shipped unless a component asks for it.
- **TypeScript** (strict) — used in `.astro` frontmatter and any `.ts`/`.tsx` files.
- **Tailwind CSS 4** — utility-class styling via `@tailwindcss/vite`. The one stylesheet is `src/styles/global.css`; it also holds the design tokens (see below). `@tailwindcss/typography` provides the `prose` class for rendered Markdown.
- **React 19** via `@astrojs/react` — reserved for interactive components only (planned: the home-page trading simulation). Default to `.astro` components; use React only when a component needs client-side state, and give it a `client:*` directive.
- **IBM Plex Sans / Mono** — self-hosted via `@fontsource/*`, imported in `global.css`.
- **Client-side routing**: `<ClientRouter />` in `Layout.astro` (from `astro:transitions`) intercepts link clicks, fetches the next page and swaps it in place, so navigation never does a full reload. Page swaps are instant: `transition:animate="none"` on `<html>` and `fallback="swap"` disable the default crossfade. `prefetch` in `astro.config.mjs` fetches a page's HTML as soon as its link is visible.
- **Deployment target**: Vercel. Astro's default static output needs no adapter.

## Design system ("Terminal" direction: dark everywhere, gold accents)

Everything visual is defined in `src/styles/global.css`. **Never hardcode a hex color or font name anywhere else.**

- **Palette tokens** (`@theme`): `gold`, `gold-tint`, `gold-hover`, `gold-pressed`, `gold-deep`, `black`, `ink`, `graphite`, `ash`, `light`, `white`, `warning`, `gain`, `loss`. Use as `bg-gold`, `text-ash`, `border-graphite`, etc. Fonts: `font-sans` (Plex Sans), `font-mono` (Plex Mono).
- **Semantic roles** (CSS variables mapped through `@theme inline`): `surface`, `fg`, `muted`, `card`, `card-hover`, `edge`, `heading`, `accent`, `accent-hover`, `btn`, `btn-fg`, `btn-hover`. Components use these, e.g. `bg-card text-fg border-edge text-accent`. The default tone is dark; wrapping anything in `data-tone="light"` flips every role to light values (used for logo tiles).
- **Text utilities**: `eyebrow` (mono uppercase label in accent), `meta` (mono small muted), `site-container` (centered max-width column with side padding).
- **Markdown**: `.prose` is remapped to the tokens, so it works on dark and light.
- Review everything at `/styleguide` (hidden, `noindex`). Update it when adding a token or component.

## Components (`src/components/`)

| Component | Purpose |
| --- | --- |
| `Header.astro` | Sticky nav, links defined once in its `links` array, hamburger menu on phones (vanilla script) |
| `Footer.astro` | Link columns + contact; edit `columns` array |
| `Hero.astro` | Home opening: full-screen visual with the statement under it: the Monte Carlo fan (`src/scripts/visuals/montecarlo.ts`) on landscape screens, the order book ladder (`src/scripts/visuals/orderbook.ts`) on portrait ones, chosen by the `(orientation: portrait)` media query and swapped live on rotation; on scroll the text rises, the fan fades, the paragraph appears, and the next section follows immediately. Motion is a CSS scroll-driven animation (`animation-timeline: scroll()`), with a JS `--p` fallback |
| `Button.astro` | `variant` primary/secondary/ghost, `size` sm/md/lg, renders `<a>` when `href` given |
| `Card.astro` | Surface container; link card with hover when `href` given |
| `SectionHeading.astro` | Section title with optional `eyebrow` and `lede` |
| `PageHeader.astro` | Title block at the top of inner pages; `divider={false}` drops the bottom rule |
| `PostCard.astro` | Wide horizontal card (thumbnail left) for the news list, one per row |
| `ProjectCard.astro` | Tall vertical card for the projects grid, two per row: image banner (gradient fallback), title, summary, "Led by", tag pills |
| `Tag.astro` | Small pill label (project tags) |
| `Article.astro` | Shell for a single post/news/project page (back link, title, meta, optional `header` slot, `prose` body) |
| `ExecCard.astro` | Exec board member: square photo via `<Image>`, name, role, LinkedIn |
| `EducationCards.astro` | Rotating tabbed cards for the four prep tracks; data in `src/data/education.json` |
| `LogoGrid.astro` | Company logo grid, light-toned tiles, links out |

## Pages

```
/            Home: Hero, "What We Do" (club intro, projects blurb, pillar links), Education (rotating cards, #education), Executive Board (#exec; row 1: President + VP; row 2: Projects, People, Operations, Marketing, Relations)
/projects    Current + completed projects (collapsible <details> sections, 2-column grid) from the `projects` collection; /projects/[id]
/placements  "Where We Are" logo grid from src/data/logos.json
/news        News, events, and posts (one card per row); /news/[id]
/join        Recruitment status (currently: closed for Fall 2026)
/styleguide  Hidden design review page
/404         Not found
```

## Where content lives

- **News / projects**: Markdown in `src/content/{news,projects}/`. News `type` is `event`, `news`, or `post` (articles; there is no separate blog). Schemas (required frontmatter fields) are in `src/content.config.ts` (Zod from `astro/zod`). Filename = URL slug = `entry.id`. `draft: true` hides an entry. Each folder has a `template.md` (kept as `draft: true`, so it never renders) to copy when adding an entry. Render a body with `const { Content } = await render(entry)` from `astro:content`. Projects take `leads`, `members`, `tags` (lists), an optional `image` (path relative to the .md, files in `src/content/projects/images/`) and an optional `order` number that sets their position in the list (unnumbered ones follow, A–Z by title).
- **Exec board**: `src/data/executives.json` (keys like `"Full Name"`, `Role`, `Photo`, `LinkedIn`). The About page matches `Photo` filenames to headshots in `src/assets/exec_pictures/` via `import.meta.glob`. Row placement is by `Role` string, so roles must match exactly.
- **Logos**: `src/data/logos.json` (`name`, `image` = `/company_logos/<file>`, `website`). Images in `public/company_logos/`.
- **Education tracks**: `src/data/education.json` (`title`, `description`, `leads` = list of names; empty list hides the "Led by" line).
- **Home "What We Do" copy**: strings at the top of `src/pages/index.astro`.
- **Images**: photos go in `src/assets/` (Astro optimises them when imported); logos and files served untouched go in `public/`. New raw images go through `uploads/` + `node scripts/process-images.mjs`; never commit multi-MB originals. Exec headshots are square-cropped by that script using the per-person head positions in `scripts/headshot-crops.mjs`; add an entry there for each new photo.

## Project layout

```
src/
  pages/           Routes (see above). [id].astro files generate one page per content entry
  layouts/         Layout.astro: <head>, Header, Footer; props title, description, noindex, fullBleed
  components/      See table above
  content/         Markdown collections (news, projects)
  content.config.ts
  data/            JSON data (executives, logos, education)
  lib/format.ts    formatDate, byDateDesc, nameList ("A, B, and C"), leadsLine helpers
  scripts/visuals/ Canvas visuals (common.ts: token colors + render loop; montecarlo.ts: landscape hero; orderbook.ts: portrait hero)
  assets/          Optimised images (exec_pictures/)
  styles/global.css  Design system + Tailwind entry
public/            club_logos/, company_logos/, favicon files (regenerate with node scripts/make-favicon.mjs)
uploads/           Drop folder for raw images (git-ignored). See uploads/README.md
scripts/process-images.mjs
```

## Commands

```sh
npm install        # install dependencies
npm run dev        # dev server at http://localhost:4321 (runs in background; stop with `npx astro dev stop`)
npm run build      # production build into dist/ — must pass before merging
npm run preview    # serve dist/ locally
npx astro check    # TypeScript + template type-checking
```

Run `npm run build` and `npx astro check` after any non-trivial change.

If the dev server shows stale content after a change to `src/content.config.ts` (e.g. a new
frontmatter field that stays `undefined`), its cached parse is out of date: run
`npx astro dev stop`, delete `node_modules/.astro/data-store.json` and `.astro/data-store.json`,
then `npm run dev`. The dev server is a long-lived daemon, so restart it after schema changes.

## Conventions

- Every page uses `Layout.astro` and passes a `title` (the layout appends " · Boiler Quant").
- Use the semantic role utilities (`bg-card`, `text-muted`, …) rather than raw palette names in components, so tone switching keeps working.
- Prefer Tailwind utilities in markup over custom CSS; shared patterns become `@utility` rules in `global.css` or a component.
- Keep content out of component code so non-developers can edit it.
- **Component `<script>`s run once per visit, not once per page** (because of the client-side router). Do element wiring inside a `document.addEventListener('astro:page-load', …)` handler that looks up its elements fresh and bails if they are absent, and return/track a cleanup (stop timers, abort listeners) for the next navigation. See `Header.astro`, `Hero.astro`, `EducationCards.astro` for the pattern.
- The repo owner is new to web development: explain changes in plain language and define jargon.
- `AGENTS.md` was generated by Astro's scaffolder and links to the official docs.
