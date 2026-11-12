# uploads/

Drop raw images here, then run:

```sh
node scripts/process-images.mjs
```

The script writes compressed, web-ready copies to the right place and leaves the
originals here untouched. Everything in this folder except this README is ignored by
Git, so originals stay on your machine without bloating the repo.

| Folder            | Goes to                    | Treatment                                   |
| ----------------- | -------------------------- | ------------------------------------------- |
| `exec_pictures/`  | `src/assets/exec_pictures/` | Square-cropped to the head (see `scripts/headshot-crops.mjs`), 900px, JPEG q85, EXIF stripped |
| `news/<post>/`    | `src/content/news/images/<post>/` | Photos resized to fit 1600px, JPEG q85, EXIF stripped; PNG/HEIC become `.jpg` |
| `bq_content/`     | `public/club_logos/`        | PNGs only, resized to fit 2048px, palette PNG  |
| `company_logos/`  | `public/company_logos/`     | PNGs resized to fit 1600px, palette PNG; SVG/JPG copied |

Filenames are kept as-is, so name files the way you want them to appear in the project
(lowercase, no spaces). Re-running the script overwrites previous output.

News photos go in a subfolder named after the post's Markdown file (`uploads/news/f25_trek/` for
`src/content/news/f25_trek.md`). Reference the processed copy from the post body with a relative
path, including the `.jpg` extension:

```md
![Members listening to a talk at OCC](./images/f25_trek/f25_trek_1.jpg)
```

Tips for good source files:
- Logos: prefer SVG, or PNG with a **transparent** background. JPGs can't be transparent.
- Headshots: at least 1000px on the short side, consistent background and framing.
