# connect-transit clone

> **Not an official site.** This is an unaffiliated, static HTML/CSS/JS
> clone of connect-transit.com used as a sandbox for design iteration. It
> does not represent Connect Transit and is not for use as a public-facing
> resource. For the real Connect Transit website, visit
> https://connect-transit.com.

All URLs are rewritten to local relative paths so the site renders offline.

## Serve locally

```bash
# from the project root
python3 -m http.server 8901 -d clone
# or
npx --yes serve -s clone
```

Then open http://localhost:8901/.

## Layout

```
clone/
├── index.html                  # homepage
├── about/, board/, fares/, riders/, routes/, ...   # one folder per section
├── careers/open-positions/position/<role>/        # job posting pages
├── README.md
└── assets/
    ├── connect-transit.com/
    │   ├── assets/
    │   │   ├── scss/
    │   │   │   ├── base_q8fd1ce.css      ← main stylesheet (was .scss on the live site)
    │   │   │   └── vendor/vendor_q8fd1ce.css
    │   │   ├── images/                    ← decorative SVGs (swooshes, arrows, route map)
    │   │   └── js/                        ← compiled JS bundles
    │   └── image/                         ← hero photos and logos
    ├── assets.cms.cybernautic.com/        ← CMS framework CSS/JS
    ├── fonts.googleapis.com/              ← Google Fonts CSS
    ├── fonts.gstatic.com/                 ← Poppins font files
    └── placeholder.svg                    ← used for any image that wasn't archived
```

## Where to make changes

**Colors and typography** live in the main stylesheet:
`assets/connect-transit.com/assets/scss/base_q8fd1ce.css`

Brand palette (count = times the value appears in `base*.css`):
- `#0067b1` × 101 — primary blue (logo, buttons, links)
- `#8dc63f` × 37 — accent green
- `#4daef4` × 37 — secondary blue (often paired with primary)
- `#393939` × 25 — body text
- `#727272` × 27 — secondary text
- `#dedede` / `#e6e6e6` / `#f8f8f8` — surface grays
- `#fff` × 74 — white

Quick recolor: find/replace those hex values across `base_q8fd1ce.css` and
`vendor_q8fd1ce.css`.

**Per-page content** lives in each `index.html`. Headings, copy, image
references, and component wrappers are inline.

**Decorative SVGs** (the curved swoosh shapes at the bottom of sections, and
the bus arrow) are in `assets/connect-transit.com/assets/images/`. Edit the
`fill="..."` attribute inside the SVG to change their color.

## Known limitations

- 4 of 149 source pages couldn't be retrieved (they returned errors during
  the archive crawl): `/search`, `/sitemap`, `/riders/how-to-ride`, and
  `/riders/connect-mobility-faqs`. Links to those pages will 404 locally.
- PDF documents under `/file/<id>` are not bundled — the original site served
  them dynamically. Links will 404.
- Board headshots and fleet photos at sizes that weren't archived (e.g.
  `/image/10/200`) fall back to `assets/placeholder.svg`. Available variants
  are in `assets/connect-transit.com/image/<id>/`.
- The Google Maps embed on the homepage uses a key tied to the live origin
  and will refuse to load locally — cosmetic only.
- Tracking and analytics scripts have been stripped (Google Analytics,
  Cloudflare insights, UserWay). The Cloudflare bot-challenge inline scripts
  are also removed.

## How this was built

`scrape/` contains the tools:
- `wayback.mjs` — fetches archived HTML from the Wayback Machine via the
  `id_` modifier (raw bytes, no toolbar rewriting).
- `crawl.mjs` — Playwright crawler used to capture the live site's CSS, JS,
  and hero images directly.
- `build.mjs` — rewrites all URLs to local relative paths and merges both
  asset sources into `clone/`.
- `validate.mjs` — sanity-checks the build for leftover absolute URLs and
  missing local files.
