# Boiler Quant website

The public website for Boiler Quant, Purdue University's quantitative finance club.
Built with [Astro](https://astro.build), TypeScript, Tailwind CSS, and React.

## Run it locally

You need [Node.js](https://nodejs.org) 22 or newer installed.

```sh
git clone <this-repo-url>
cd boilerquant-web
npm install      # downloads the project's dependencies (first time only)
npm run dev      # starts the local dev server
```

Then open <http://localhost:4321> in your browser. The page reloads automatically
when you save a file. The dev server keeps running in the background; stop it with
`npx astro dev stop`.

## Other commands

| Command              | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `npm run build`      | Builds the finished site into `dist/` (what gets deployed) |
| `npm run preview`    | Serves the `dist/` folder so you can check the build       |
| `npx astro check`    | Type-checks the project                                   |
| `npx astro dev stop` | Stops the background dev server                           |

## Adding a news item, event, or post

Everything on the News & Events page lives in `src/content/news/`, one Markdown file per item.

1. Create a new file there. The filename becomes the URL, so
   `src/content/news/spring-2027-callout.md` is published at `/news/spring-2027-callout`.
   Use lowercase letters and hyphens, no spaces.
2. Start the file with a "frontmatter" block (the part between the `---` lines)
   that gives the item's details, then write the body in Markdown:

   ```md
   ---
   title: "Spring 2027 Callout"
   description: "One sentence shown in the list."
   date: 2027-01-20              # event date, or publish date for news and posts
   type: event                   # "event", "news", or "post"
   location: "LWSN 1142"         # optional, events only
   author: "Your Name"           # optional, usually for posts
   draft: false                  # optional; true hides the item from the site
   ---

   Your text goes here. **Bold**, *italics*, lists, links, and headings
   (`## Heading`) all work.
   ```

   Use `event` for something people can attend, `news` for an announcement, and
   `post` for a longer article (what used to be the blog).

3. Save. If the dev server is running, the item appears at `/news` immediately.
   If a required field is missing or misspelled, the terminal shows an error
   pointing at the file and the field.

The list of allowed fields is defined in `src/content.config.ts`.
To add a new field (say, `image`), add it there and it becomes available in every item.

## Adding a project

Same idea again, in `src/content/projects/`:

```md
---
title: "Options volatility surface"
description: "One sentence shown on the project card."
status: current                      # "current" or "completed"
leads: ["Member Name"]               # one or more names; [] if none yet
members: ["A", "B", "C"]             # listed on the project page; optional
tags: ["Options", "Python"]          # short labels shown as pills; optional
image: ./images/vol-surface.png      # card banner; optional
date: 2026-09-01                     # optional, never shown: orders projects newest first
---

What the project is, what's been done, what's next.
```

Current projects appear at the top of `/projects`; completed ones in the section below.
Each section can be collapsed with the arrow next to its heading.

### Adding a project image

1. Save the picture in `src/content/projects/images/`. A 16:9 image (for example 1600 by 900 pixels) fills the card banner without cropping; other shapes are cropped to fit.
2. In the project's `.md` file, point `image` at it with a path relative to the file, e.g. `image: ./images/vol-surface.png`.
3. Save. Astro checks that the file exists at build time and generates a resized copy for the site, so the original can be large.

Projects without an `image` get a plain gold gradient banner instead.

## Editing the exec board or placement logos

- `src/data/executives.json` — one object per exec board member (name, role, major, photo, LinkedIn).
- `src/data/logos.json` — one object per company logo on the Placements page.
- `src/data/education.json` — the four prep-session tracks shown on the home page. Each has a `leads` list, e.g. `["Ada Lovelace", "Alan Turing"]`.

Edit the JSON, save, and the pages update. Photos and logo images referenced in these
files should be placed under `public/` (for example `public/people/name.jpg`).

## Where things are

- `src/pages/` — one file per page on the site; `[id].astro` files generate one page per content item
- `src/layouts/Layout.astro` — the shared page shell (nav bar, footer, `<head>` tags)
- `src/components/` — reusable pieces of UI (buttons, cards, nav, footer, …)
- `src/styles/global.css` — the design system: all colors and fonts live here
- `/styleguide` — hidden page showing every color, text style, and component
- `src/content/` — news, events, posts, and projects as Markdown
- `src/data/` — structured data as JSON (exec board, logos)
- `public/` — images and other files served as-is

See `CLAUDE.md` for a fuller description of the stack and conventions.
