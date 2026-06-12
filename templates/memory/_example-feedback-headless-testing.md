---
name: headless-html-testing
description: When preview MCP fails, render local HTML via Playwright headless on a file:// URL
metadata:
  type: feedback
---

When the browser preview MCP fails (chrome-error, can't reach localhost, server won't start), fall
back to headless Playwright on a `file://` URL — no running server required.

```bash
# Static screenshot (one-liner)
npx playwright screenshot --full-page "file:///abs/path/to/index.html" out.png
```

For click/interaction tests, write a `.cjs` script and use `require('playwright')`. Playwright lives
in the npx cache, not in `node_modules` — set `NODE_PATH` before running:

```bash
# Find the cache dir
for d in $LOCALAPPDATA/npm-cache/_npx/*/node_modules/playwright; do
  [ -d "$d" ] && export NODE_PATH="$(dirname "$d")" && break
done
```

Key gotchas:
- Use `.cjs` extension (not `.js`) to stay in CommonJS and avoid the ESM/CJS boundary.
- Encode spaces in `file://` paths as `%20` — Playwright won't URL-encode them for you.
- Wait ~1500ms after `goto()` for web fonts to load before screenshotting.

**Why:** The MCP preview can't render `file://` URLs, and the dev server sometimes won't start
mid-session. Playwright headless works reliably on any local HTML file regardless of server state.

**How to apply:** Whenever visual verification is needed for local HTML with no running server. Read
the output PNG to verify. Tell the user if headless screenshot is also not possible.
