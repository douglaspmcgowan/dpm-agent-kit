# INSTALL — drop an agent in here

This file is written for an **AI agent** (Claude Code or similar). A human can follow it too. Goal:
stand up the kit safely, without clobbering anything the user already has.

> [!warning] Safety contract for the installing agent
> - **Never overwrite** an existing `settings.json`, `CLAUDE.md`, or `MEMORY.md`. Back up first, then
>   write a NEW file and merge, or ask.
> - **Never print secrets.** This kit contains none; keep it that way.
> - Confirm with the user before modifying anything under `~/.claude/`.
> - The hooks are the safety layer — install them FIRST, then everything else runs under their watch.

## Prerequisites (check, don't assume)

1. **Node.js** — needed for the hooks. `node --version`. If missing, stop and tell the user to install it.
2. **Claude Code** — recent build (for `/plugin install`). 
3. Locate the user's Claude config dir: `~/.claude` (Windows: `%USERPROFILE%\.claude`). Call it `<CLAUDE_DIR>`.

## Step 1 — Install the hooks (the safety layer)

1. Copy every file from `templates/hooks/*.js` into `<CLAUDE_DIR>/hooks/`.
2. Review the three configurable hooks and ask the user what to set:
   - `block-egress-exfil.js` → `ALLOWED_UPLOAD_HOSTS`, `ALLOWED_SCP_HOSTS`
   - `block-secret-file.js` → `SECRET_FILE_PATTERNS` (paths that hold live keys)
   - `block-web-egress-in-protected-dir.js` → `PROTECTED_DIR_PATTERNS`, `ALLOWED_DOMAINS`
3. If the user does embedded work or uses an Obsidian-style vault MCP, keep `protect-firmware.js` /
   `block-vault-delete.js`; otherwise note they can drop them.

## Step 2 — Wire the hooks into settings

1. Read `templates/settings/settings.template.json`.
2. Substitute `__NODE__` (the Node binary path, or just `node` if on PATH) and `__CLAUDE_DIR__`
   (absolute path to `<CLAUDE_DIR>`, forward slashes).
3. If `<CLAUDE_DIR>/settings.json` **does not exist**: write the substituted file there.
4. If it **exists**: back it up to `<CLAUDE_DIR>/settings.json.bak-<timestamp>`, then **merge** the
   `hooks` and (additively) `permissions.allow` blocks into the existing file. Show the user the diff
   and confirm. Do not drop their existing keys.

## Step 3 — CLAUDE.md + memory

1. If the user has no `~/.claude/CLAUDE.md`, offer to install `templates/claude-md/CLAUDE.md` and
   `CLAUDE-delegation.md`. If they have one, DON'T overwrite — show them the template and let them
   merge the rules they want.
2. Set up the memory system: copy `templates/memory/` to the user's memory directory (Claude Code
   uses a per-project memory dir; a global one also works). Keep `MEMORY.md` as the index. Read
   `templates/memory/MEMORY-SYSTEM.md` to the user so they understand the four memory types.

## Step 4 — Skills

1. **Vendored custom skills:** copy `templates/skills/*.md` into `<CLAUDE_DIR>/commands/` (skip
   `WEB-INSTALLED-SKILLS.md` and `SKILLS-MANIFEST.md` — those are docs).
2. **Web-installed skills:** follow `templates/skills/WEB-INSTALLED-SKILLS.md` to install
   **superpowers** (`/plugin install superpowers@superpowers-marketplace --global`) and **grill-me**.
3. Confirm the skills appear (they show up as `/name`).

## Step 5 — Verify

1. Restart the Claude Code session so `settings.json` reloads.
2. Smoke-test a hook (should be BLOCKED): ask the agent to run `printenv` — `check-secret-exposure`
   must stop it. Ask it to write a fake key like `sk-ant-AAAA...` to a file — `scan-write-for-secrets`
   must stop it.
3. Confirm `session-primer` works: create a `CURRENT-TASK.md` with a `- [ ]` item, restart, and check
   the task surfaces in boot context.
4. Tell the user to read `docs/HANDLING-SECRETS.md` to add their real paths/policy.

## Step 6 — Optional tools (just point the user at docs)

Mention `docs/DETAILED-GUIDE.md` for wiring **Wispr Flow** (voice), **wmux** (multi-agent terminal),
**Obsidian** (vault + delete-guard), and keeping the whole `~/.claude` as a private git repo
(the `claude-global-config` pattern).

---

### One-paragraph version (paste to an agent)

> Read `INSTALL.md`. Check Node + Claude Code are present. Copy `templates/hooks/*.js` to my
> `~/.claude/hooks/`. Substitute `__NODE__`/`__CLAUDE_DIR__` in `templates/settings/settings.template.json`;
> if I already have a `settings.json`, back it up and merge the `hooks` block in (show me the diff
> first), otherwise install it. Offer the `CLAUDE.md` + memory templates without overwriting mine.
> Copy the vendored skills in `templates/skills/*.md` to `~/.claude/commands/`, then install
> superpowers and grill-me per `WEB-INSTALLED-SKILLS.md`. Restart and smoke-test that `printenv` is
> blocked. Don't print any secrets; confirm before changing my config.
