# connect-transit-clone

Design-iteration sandbox for connect-transit.com. **This is not an official
site and is not affiliated with Connect Transit.** For the real site visit
https://connect-transit.com.

## Layout

- `clone/` — the static HTML/CSS/JS site (deployed to GitHub Pages)
- `scrape/` — the Node.js tooling used to build the clone (Wayback Machine
  fetcher, Playwright crawler, URL rewriter, validator)
- `serve.sh` — convenience wrapper around `npx serve clone`

## Serve locally

```bash
python3 -m http.server 8901 -d clone
# open http://localhost:8901/
```

## Live preview

Built from the `clone/` directory and published via GitHub Pages on the
`gh-pages` branch.
