# Guido Di Lauro — Personal Site

Source for [guidodilauro.com](https://guidodilauro.com), a single-page personal
portfolio for a DevOps engineer. Static, dependency-free, deployed via GitHub Pages.

## Stack

- Plain HTML/CSS/vanilla JS — no framework, no build step
- Data-driven: all content lives in [`data/profile.json`](data/profile.json)
- Inter font + JetBrains Mono via Google Fonts
- Canvas-based Snake easter egg, lazy-loaded on demand

## Structure

```
index.html            # markup with data-bind / data-bind-template hooks
css/style.css         # theme tokens, layout, components, responsive
js/main.js            # theme toggle, profile loader, bindings, terminal
js/snake.js           # SnakeGame canvas class (loaded dynamically)
data/profile.json     # all content: bio, experience, certs, interests, contact
404.html              # themed 404 page
robots.txt            # crawl rules + sitemap pointer
sitemap.xml           # single-URL sitemap
CNAME                 # custom domain → guidodilauro.com
.github/workflows/    # GitHub Pages deploy workflow
```

## How content binding works

`main.js` reads `profile.json` and populates the page via two attributes:

- `data-bind="path.to.field"` — sets `textContent` from a string field
- `data-bind-template="key"` — calls a renderer function (e.g. `renderExperience`)
  for arrays/HTML-rich fields

To edit site content, change `data/profile.json` — no code changes needed.

## Terminal

The hero terminal is interactive. Type `help` for commands:

| Command | Action |
| --- | --- |
| `snake` / `play` | launch the snake game |
| `whoami` | print role |
| `clear` | clear terminal |
| `help` | list commands |

Terminal supports command history with ↑/↓ arrows.

### Snake controls

- Arrow keys or WASD to move
- `p` to pause, `q` to quit
- `r` to restart after game over
- Touch: swipe to steer, tap to restart/resume

## Theming

Light/dark theme is driven by `data-theme` on `<html>`, persisted in
`localStorage("theme")`. Defaults to the user's `prefers-color-scheme`.
An inline script in `<head>` applies the stored theme before first paint
to avoid a flash of the wrong theme.

Theme tokens live as CSS custom properties in `:root` and `[data-theme="light"]`
in `css/style.css`.

## Local development

Any static file server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which uploads the
repo root to GitHub Pages. The `CNAME` file sets the custom domain.

## License

Personal content © Guido Di Lauro. Code structure free to reference.
