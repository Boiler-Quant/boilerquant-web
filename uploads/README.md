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
| `exec_pictures/`  | `src/assets/exec_pictures/` | Resized to fit 1600px, JPEG q85, EXIF stripped |
| `bq_content/`     | `public/club_logos/`        | PNGs only, resized to fit 2048px, palette PNG  |
| `company_logos/`  | `public/company_logos/`     | PNGs resized to fit 1600px, palette PNG; SVG/JPG copied |

Filenames are kept as-is, so name files the way you want them to appear in the project
(lowercase, no spaces). Re-running the script overwrites previous output.

Tips for good source files:
- Logos: prefer SVG, or PNG with a **transparent** background. JPGs can't be transparent.
- Headshots: at least 1000px on the short side, consistent background and framing.
