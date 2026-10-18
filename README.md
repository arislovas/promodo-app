# Promodo website

Static site, no build step. Lithuanian at the root, English in `en/`.

| Page | LT | EN |
| --- | --- | --- |
| About / home | `index.html` | `en/index.html` |
| Download | `atsisiusti.html` | `en/download.html` |
| Viewer guide ("I got a link") | `gavau-nuoroda.html` | `en/viewers.html` |
| Architect guide | `architektui.html` | `en/architects.html` |

- `assets/site.css`: the look. Headings in Bricolage Grotesque, text in IBM Plex Sans (the app's font), the app's blue as the one accent, plus one blue band ("one process → the whole company").
- `assets/demos.js`: the working demos on the home page. The live mini-Promodo (drag steps, Tidy up arrows, search, Architect/User view), the zoom from one process to the whole company, and five chapter demos: check, company structure, sharing, search, export. Also the side "process line" navigation.
- `assets/demo-data.js`: sample data, steps in flow order (read from the BPMN sequence flows), from the demo company UAB „Kampo krautuvė“ (12 functions, 32 processes, 204 steps, 40 roles). It is labelled as sample data on the page. Regenerate it if the demo library changes.
- Each home page carries its demo wording in a `ui-text` JSON block (Lithuanian and English).
- `assets/site.js`: the faint background drawing layer (`data-bg` per section, `data-bg-side="left"` mirrors it), guide step highlight, manual index, downloads from `versions.json`.
- Links name the page file (`index.html`), so the site also works when opened straight from the folder.
- `assets/fonts/`: IBM Plex Sans (SIL Open Font License, licence included). Self-hosted, no font CDN.
- `assets/img/`: real app screenshots from the demo company UAB „Kampo krautuvė“ (taken from a copy, not the live library).

## Where it lives

- Site: GitHub Pages from the public repository `arislovas/promodo-app` (branch `main`, root folder). Address: https://arislovas.github.io/promodo-app/
- Installers: GitHub Release `v0.4.1` in the same repository. `versions.json` and the download links point there.
- The app's source code stays in the private repository; nothing from it is published here.

## Preview locally

Open `index.html` in a browser. Everything works from the folder; only the version, size and checksum values stay as written in the HTML, because browsers don't read `versions.json` from a local file.

## New release

1. Build the installers. On Mac, re-sign each app with a local signature before making the DMG (`codesign --force --deep --sign - Promodo.app`, done on a local disk, not on the mounted DMG). Without it, Apple-chip Macs report the downloaded app as "damaged".
2. `gh release create v<version> <files> --repo arislovas/promodo-app`
3. Update `versions.json` (version, date, sizes in bytes, `shasum -a 256` values, URLs) and the fallback numbers in the HTML (`key__meta`, the SHA-256 lists, download links).
4. Commit and push to `main`; GitHub Pages republishes in a minute or two.

## Still open

- Code signing with an Apple Developer ID and a Windows certificate would remove the security prompts on first opening.
- The viewer guide tells users to ask the person who prepared the processes; update it if the app gets the AI assistant on the viewer screens.
