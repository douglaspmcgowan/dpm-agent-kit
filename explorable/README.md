# Explorables

Self-contained, interactive explanations of the kit. **Open `index.html` in a browser** to
pick one — or open any file directly. No server, no build, no external dependencies (the explorables
use JetBrains Mono if you have it installed, falling back to your system monospace; the library pulls
two small CDN libraries for search and drag-to-reorder).

| File | Style | Best for |
|---|---|---|
| `index.html` | Launcher | Pick a way in. |
| `option-1-node-map.html` | **Component map** — clickable graph of parts | Seeing how the pieces connect spatially. |
| `option-2-scrollytelling.html` | **Walkthrough** — scrolling story with a sticky, animating visual | Understanding *why* each pillar exists. |
| `option-3-terminal.html` | **Interactive terminal** — type commands, watch hooks/skills/memory react | Learning by doing (the most hands-on). |
| `option-4-dashboard.html` | **Control panel** — sidebar of components, details + live demos | Browsing as a reference. |
| `skills-library.html` | **The library** — searchable index of every skill, hook, memory note, trick, loop type, and config map | Finding one specific thing fast (⌘K global search). |

All four cover the same content (the five pillars + plugged-in tools) and follow the
hook → mechanics → system → sandbox arc. Design notes: Tokyo Night palette, monospace type, and
patterns drawn from explorable-explanation work by Bret Victor, Nicky Case, and Distill.pub.

> To view over a local server instead of `file://` (some browsers restrict `file://`):
> `python -m http.server --directory .` then open `http://localhost:8000/`.
