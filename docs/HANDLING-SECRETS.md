# Handling secrets & sensitive info

This kit is **public and scrubbed** — it ships with placeholders, never real keys, paths, or policy.
This page is the walkthrough for adding *your* sensitive bits back, safely, after install. The
golden rule the whole setup is built on:

> **Secrets never enter the agent's context or the session transcript.** Once they do, the only safe
> remediation is rotation. So we keep them in the environment / a secret manager, and let the hooks
> enforce it.

---

## 1. Where secrets should live (and not)

| Put it here | Never here |
|---|---|
| OS environment variables / a `.env` the agent never reads | Hardcoded in source, configs, or skills |
| A secret manager (1Password, Vault, cloud KMS) | Pasted into a chat or a prompt |
| A file the agent is hard-blocked from reading (`block-secret-file.js`) | `CLAUDE.md`, memory files, `settings.json` |

The agent should reference a secret by **name** (`$OPENAI_API_KEY`, `${TOKEN}`), and pass it directly
to the program that needs it — never print or inspect it. To refresh a cached env var in a shell
without printing it: `unset VAR && export VAR=$(source-that-emits-it)`.

---

## 2. Configure the three tunable hooks

Open these in `~/.claude/hooks/` and edit the CONFIG block at the top:

- **`block-secret-file.js`** → `SECRET_FILE_PATTERNS`. Add any file/folder that holds live keys so
  the agent can never `Read`/`Grep` it. Example: a personal notes file where you keep API keys.
  ```js
  const SECRET_FILE_PATTERNS = [ /AI[ _-]?Reference/i, /my-keys\.md/i ];
  ```
- **`block-egress-exfil.js`** → `ALLOWED_UPLOAD_HOSTS`, `ALLOWED_SCP_HOSTS`. Whitelist only hosts you
  truly trust to receive file uploads. Everything else is blocked.
- **`block-web-egress-in-protected-dir.js`** → `PROTECTED_DIR_PATTERNS`, `ALLOWED_DOMAINS`. If you
  work on sensitive/regulated material in a specific folder, list it here so public web tools get
  gated while you're in it (with an allow-list for your internal proxy/endpoints).

These edits are *local* — they stay on your machine, not in the public kit.

---

## 3. Real paths & machine-specific config

The templates use placeholders like `<HOME>`, `<VAULT>`, `<AI_PROXY_URL>`, `<YOUR_EMAIL>`. When you
adapt a template into your real `~/.claude/`, replace them with your actual values. Keep the
*public* copy (this kit, or a fork you publish) on placeholders.

If you keep your whole `~/.claude/` as a git repo (the **claude-global-config** pattern), add a
`.gitignore` that excludes anything machine-specific or secret-bearing:

```gitignore
# machine-specific / secret-bearing — never commit
mcp.json                 # often carries connector tokens
.env
*.local.json             # settings.local.json etc.
projects/                # session transcripts (can contain pasted context)
logs/
session-env/
*.bak-*
```

---

## 4. Organization / regulated-data policy (if applicable)

If you work under a data-handling policy (corporate, government, regulated industry):

- Put the policy itself in a **private** location the agent reads on demand; keep it out of the public kit.
- Use `block-web-egress-in-protected-dir.js` to enforce "no public web tools while in the sensitive
  folder," routing instead to your approved internal endpoint via `ALLOWED_DOMAINS`.
- Add a short rule to your *private* `CLAUDE.md` naming the policy and the approved endpoints, so the
  agent knows the boundary. Keep that file out of the public repo.
- Never send regulated/PII data to public AI services. The hooks help, but the policy rule in
  `CLAUDE.md` is what makes the agent *aware* of the boundary.

---

## 5. Before you publish a fork

If you publish your own version of this kit, run a final scrub:

1. Grep for your username, real name, emails, machine paths, internal hostnames, and any
   `sk-`/`gh`/`AKIA`/`xox` patterns. (`scan-write-for-secrets.js` blocks writing these, but check
   anyway.)
2. Confirm `settings.template.json` still uses `__NODE__` / `__CLAUDE_DIR__`, not your real paths.
3. Confirm no `mcp.json`, `.env`, `*.local.json`, or `projects/` transcripts are included.
4. Diff against this kit's placeholder set — anything that looks like a real value is a leak.

The safest workflow: develop your real setup in a **private** repo (claude-global-config), and treat
the public kit as a *scrubbed export* you regenerate, never edit-in-place with real values.
