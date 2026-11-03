---
# TEMPLATE — copy this file, rename it, and fill in the fields.
# The filename becomes the URL: my_project.md -> /projects/my_project (lowercase, no spaces).
# This file itself never appears on the site because draft is true. Keep it that way.

title: "Project title"
description: "One or two sentences shown on the project card and used as the page description."
status: current             # current or completed — decides which section the card appears in
order: 99                   # position within its section (1 first, 2 second, ...). Delete the line to sort alphabetically after the numbered ones.
leads: ["Lead One", "Lead Two"]            # shown as "Led by ..."; use [] if none
members: ["Member One", "Member Two"]      # shown as "Team: ..."; use [] if none
tags: ["Market Microstructure", "Python"]  # small pills on the card; use [] if none
# image: ./images/my_project.png           # optional card banner (16:9 works best); put the file in src/content/projects/images/
draft: true                 # true hides the entry from the site; set to false (or delete the line) to publish
---

Write the project writeup here in Markdown.

## Overview

What the project does and why it matters.

## Approach

How the team is building it.

## Results

What came out of it (add when available).
