# Hooks

Small Node.js scripts Claude Code runs at lifecycle events. They read a JSON event on **stdin** and either stay silent (allow) or print a JSON decision on **stdout** (block / inject context / show a message), or write a warning to **stderr** (soft warn — the agent reports it and asks you before continuing).

They're wired up in `settings.json` under the `hooks` key — see `../settings/settings.template.json`. Each hook is bound to a tool **matcher** (e.g. `Bash`, `Write|Edit`, `Read|Grep|Glob`) and a lifecycle **event** (`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `SessionStart`, `Stop`).

> All hooks are dependency-free Node (no `npm install`). They fail open: any error is swallowed so a broken hook never blocks your work. Run `node <hook>.js < test.json` to try one by hand.

## Security hooks

| Hook | Event · matcher | What it does |
|---|---|---|
| `check-secret-exposure.js` | PreToolUse · Bash | Blocks commands whose purpose is to print secrets/env values (`env`, `printenv`, registry dumps, `aws/az/gcloud/kubectl/vault/op/bw` secret fetches, reads of `.env`/`.aws`/`.ssh`). High precision; tells the agent to pivot to a metadata-only probe. |
| `scan-output-for-secrets.js` | PostToolUse · Bash | Backstop: scans command **output** for credential formats (Anthropic/OpenAI/AWS/GitHub/Slack/Google keys, JWTs, PEM) and a validated NAME=VALUE heuristic; blocks the result from entering context if a real secret is found. |
| `scan-write-for-secrets.js` | PreToolUse · Write\|Edit | Blocks **writing** a hardcoded credential into a file (so a key can't get committed). Placeholder values (`YOUR_KEY`, `EXAMPLE`, `<...>`) are allowed. |
| `block-dangerous-bash.js` | PreToolUse · Bash | Blocks `rm -rf` on root/home, `git push --force` (allows `--force-with-lease`), `git reset --hard`, `git clean -f`, `checkout -- .`, `branch -D`, interactive rebase, and live `DROP/TRUNCATE` SQL. |
| `block-egress-exfil.js` | PreToolUse · Bash | Cuts the exfiltration leg of the "lethal trifecta": file uploads to non-approved hosts, `curl\|bash` RCE, netcat exfil, `scp/rsync` to unapproved hosts, command-substitution-in-URL. **Config:** `ALLOWED_UPLOAD_HOSTS`, `ALLOWED_SCP_HOSTS`. |
| `block-sensitive-file-read.js` | PreToolUse · Read\|Grep\|Glob | Warns when the native file tools target a secret-bearing file (`.env`, cloud creds, SSH keys, `*.pem`). Allows `.example`/`.sample`/`-template` variants. |
| `block-secret-file.js` | PreToolUse · Read\|Grep\|Glob | Hard-blocks named files/folders that hold **live** keys (e.g. a personal notes file). **Config:** `SECRET_FILE_PATTERNS`. |
| `protect-security-config.js` | PreToolUse · Bash + Write\|Edit | Warns when an action targets the guards themselves (`.claude/settings*.json`, `hooks/`, `.mcp.json`, `CLAUDE.md`, `MEMORY.md`, memory dir) — a prompt-injection's first move is to disable defenses. |
| `protect-firmware.js` | PreToolUse · Write\|Edit | Blocks edits to firmware (`.hex`, `.elf`, `.srec`, `bootloader`). Drop it if you don't do embedded work. |
| `block-web-egress-in-protected-dir.js` | PreToolUse · WebFetch\|WebSearch | When the session cwd is inside a sensitive folder, warns before sending context to public web services. **Config:** `PROTECTED_DIR_PATTERNS`, `ALLOWED_DOMAINS`. Off by default (empty config). |
| `block-vault-delete.js` | PreToolUse · `mcp__<vault>__` | Blocks delete/remove/trash through a notes-vault MCP server unless explicitly confirmed. |

## Workflow hooks

| Hook | Event | What it does |
|---|---|---|
| `session-primer.js` | SessionStart | Injects `CURRENT-TASK.md` + `BACKGROUND-TASKS.md` as boot context so a new session resumes where the last left off. |
| `task-state-reminder.js` | UserPromptSubmit | If `CURRENT-TASK.md` (cwd or home) has unchecked `- [ ]` items, surfaces them and nudges to update before coding. |
| `check-session-size.js` | Stop | Warns when the session transcript exceeds ~5 MB — time to run a rollover. |
| `stop-toast-gate.js` | Stop | Shows an "Agent finished" message, but stays quiet while `CURRENT-TASK.md` still has open items. |
| `format-on-edit.js` | PostToolUse · Write\|Edit | Runs `prettier --write` on edited JS/TS/JSON/CSS/HTML/MD if prettier is available (silent otherwise). |
| `audit-bash-log.js` | PostToolUse · Bash | Appends a **redacted** record of every Bash command to `~/.claude/logs/bash-audit.log` for incident review. |
| `log-agent-dispatch.js` | PostToolUse · Agent | Appends a one-line record of every sub-agent dispatch to `~/.claude/BACKGROUND-TASKS.md`. |

## Design principles

- **High precision over recall.** Hooks block the few commands whose *primary purpose* is dangerous; broad "might leak" commands are left to the output scanner. Goal: zero false positives, so you never start ignoring them.
- **Two tiers for secrets.** Block at input (`check-secret-exposure`) AND scan at output (`scan-output-for-secrets`) — defense in depth.
- **Warn when judgment is needed; hard-block only what's clearly destructive.** Soft warns (stderr) let the agent finish a multi-step task after you confirm; `continue:false` blocks are reserved for genuinely destructive/exfil actions.
- **Protect the guards.** `protect-security-config.js` makes tampering with the hooks/config itself visible.
