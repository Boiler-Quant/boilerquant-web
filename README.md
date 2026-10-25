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
when you save a file. Press `Ctrl+C` in the terminal to stop the server.

## Other commands

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run build`   | Builds the finished site into `dist/` (what gets deployed) |
| `npm run preview` | Serves the `dist/` folder so you can check the build       |
| `npx astro check` | Type-checks the project                                   |

## Where things are

- `src/pages/` — one file per page on the site
- `src/layouts/` — the shared page shell (header/footer area, `<head>` tags)
- `src/components/` — reusable pieces of UI
- `src/styles/global.css` — Tailwind entry point and any custom styles
- `public/` — images and other files served as-is

See `CLAUDE.md` for a fuller description of the stack and conventions.
