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

## Adding a blog post

1. Create a new file in `src/content/blog/`. The filename becomes the URL, so
   `src/content/blog/my-first-post.md` is published at `/blog/my-first-post`.
   Use lowercase letters and hyphens, no spaces.
2. Start the file with a "frontmatter" block (the part between the `---` lines)
   that gives the post's details, then write the body in Markdown:

   ```md
   ---
   title: "My first post"
   description: "One sentence shown in the post list."
   date: 2026-11-01
   author: "Your Name"        # optional
   draft: false               # optional; true hides the post from the site
   ---

   Your post text goes here. **Bold**, *italics*, lists, links, and headings
   (`## Heading`) all work.
   ```

3. Save. If the dev server is running, the post appears at `/blog` immediately.
   If a required field is missing or misspelled, the terminal shows an error
   pointing at the file and the field.

## Adding a news item or event

Same idea, in `src/content/news/`:

```md
---
title: "Spring 2027 Callout"
description: "Kick-off meeting for the spring semester."
date: 2027-01-20              # event date, or publish date for news
type: event                   # "event" or "news"
location: "LWSN 1142"         # optional, events only
---

Details about the event go here.
```

The list of allowed fields for both collections is defined in `src/content.config.ts`.
To add a new field (say, `image`), add it there and it becomes available in every post.

## Editing the exec board or placement logos

- `src/data/executives.json` — one object per exec board member (name, role, major, photo, LinkedIn).
- `src/data/logos.json` — one object per company logo on the Placements page.

Edit the JSON, save, and the pages update. Photos and logo images referenced in these
files should be placed under `public/` (for example `public/people/name.jpg`).

## Where things are

- `src/pages/` — one file per page on the site; `[id].astro` files generate one page per content item
- `src/layouts/Layout.astro` — the shared page shell (nav bar, footer, `<head>` tags)
- `src/components/` — reusable pieces of UI (`Header.astro`, `Footer.astro`)
- `src/content/` — blog posts and news/events as Markdown
- `src/data/` — structured data as JSON (exec board, logos)
- `src/styles/global.css` — Tailwind entry point and any custom styles
- `public/` — images and other files served as-is

See `CLAUDE.md` for a fuller description of the stack and conventions.
