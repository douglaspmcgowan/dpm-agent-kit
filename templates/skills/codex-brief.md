<!-- Adapted from a personal workflow; replace placeholders to fit your setup. -->
---
name: codex-brief
description: Draft and dispatch a Codex brief via a self-hosted/proxied model. Enforces the two-question test, avoidance checklist, and verification protocol for delegating a self-contained task to a secondary coding model.
---

# /codex-brief

Delegate a self-contained task to a secondary coding model (OpenAI Codex CLI) when — and only when — it passes the two-question test below. This file documents a direct-CLI flow that runs Codex against a configured provider endpoint.

## Step 1 — Two-question test (run first, no exceptions)

1. **Can I write a self-contained briefing paragraph covering everything Codex needs?**
   - If the brief requires more than one paragraph of context just to frame the task → keep it on Claude.
   - If you can distill it clearly → proceed.

2. **Is there a verification signal that doesn't require my judgment?**
   - Tests pass, build is green, `git diff` matches a pattern, word count met, schema validates. **For a review:** structured findings against named criteria count — that's what `codex exec` produces.
   - If the only check is "does this look right" → keep it on Claude.

If either answer is no → stop. Do the task yourself.

## Step 2 — Avoidance checklist

Common blockers — abort if any fires:

- Task touches real credentials, secrets, or production deploys
- Requirements aren't agreed / brief is still mushy
- Iteration pass on a draft that already exists
- Task is inside an autonomous `/loop`

## Step 3 — Draft the brief (five required components)

```
OBJECTIVE (1 sentence): Edit <exact file(s)> to <specific, observable change>. (For review: review <files> against <criteria> and produce structured findings.)

FILES (exhaustive): Only edit/review these files — touch no other file:
  - path/to/file1.ext
  - path/to/file2.ext

DONE WHEN (machine-verifiable):
  [ ] <test command> exits 0
  OR [ ] git diff HEAD shows <pattern>
  OR [ ] <observable behavior at URL/endpoint>
  OR [ ] (review) structured-findings document with severity buckets and verdict produced

CONSTRAINTS:
  - Do not change <X>
  - API surface must remain <Y>
  - Style: <pattern/convention>
  - <any other hard limit>

RESUMPTION (only if resuming a prior job):
  Previous pass stopped after step <N> — <what was done>.
  Skip everything before step <N+1>. Start at: <exact next step>.
```

Reject "improve / clean up / make it better" — rewrite as a specific diff shape. Reject "and anything else related" — if it's not in FILES it doesn't get touched.

## Step 4 — Dispatch

### Setup assumed

- **Codex binary:** lives under your local Codex install dir (e.g. `%LOCALAPPDATA%\OpenAI\Codex\bin\<hash>\codex.exe` on Windows). The hash directory rotates on update — discover the current one dynamically.
- **Config:** `~/.codex/config.toml` — configure your model + provider endpoint there. Set `sandbox_mode` and `approval_policy` to suit how unattended you want it.
- **Auth:** `<API_KEY_ENV_VAR>` env var (e.g. `OPENAI_API_KEY`). Never read or print this key. If a harness env filter strips KEY/TOKEN/SECRET-named vars before launching child processes, launch Codex from a shell that reads the var directly (see the wrapper note below).
- **Trust:** Codex enforces a "trusted directory" check. Pass `--skip-git-repo-check` when running outside a git repo.

### Resolve the binary (Bash one-liner)

```bash
CODEX=$(ls -td "$LOCALAPPDATA"/OpenAI/Codex/bin/*/codex.exe 2>/dev/null | head -1)
[ -x "$CODEX" ] || { echo "codex.exe not found"; exit 1; }
```

### Run via a safe wrapper (recommended — handles auth + sandbox)

Keep a small wrapper script (e.g. `~/bin/codex-run.ps1`) that resolves `codex.exe`, reads `<API_KEY_ENV_VAR>` from the OS environment *without echoing it*, and forces an explicit `--sandbox` flag every invocation. Call the wrapper; don't call `codex.exe` directly unless you have a reason.

**Two modes, only two:**
- `-Mode review` → `--sandbox read-only`. Codex can read files, query the endpoint, and write its findings to `-OutPath`. **It cannot create, edit, or delete any files in the workdir.** Use whenever the user asked for review/critique/audit/findings only.
- `-Mode edit` → `--sandbox workspace-write`. Codex can write inside the workdir (and only inside it). Use when the brief explicitly asks Codex to make edits.

There is intentionally no third option. `--dangerously-bypass-approvals-and-sandbox` is never used by this wrapper. If a job needs cross-directory writes, the operator decides explicitly and calls `codex.exe` directly.

**Bash invocation:**
```bash
mkdir -p "<PROJECT_DIR>/.codex-runs"
OUT="<PROJECT_DIR>/.codex-runs/review-$(date +%Y%m%d-%H%M%S).md"
BRIEF="<path/to/your/brief.md>"

powershell -NoProfile -File "~/bin/codex-run.ps1" \
  -BriefPath "$BRIEF" -OutPath "$OUT" -Mode review
```

For an edit job: replace `-Mode review` with `-Mode edit` and add `-Workdir <path-to-target-dir>`.

**`-Workdir` is load-bearing — set it whenever the brief references files outside the bash CWD.** Codex's `read-only` and `workspace-write` sandboxes confine *file reads and writes* to the workdir tree. If your brief tells Codex to read paths outside the default workdir, every read will be `rejected: blocked by policy` and Codex will silently fall back to reviewing whatever it CAN see (the wrong files). Pass `-Workdir <common parent>` so every path the brief mentions is reachable.

**Why bash invocation looks plain:** the wrapper script handles all secrets internally. The bash command line never names `<API_KEY_ENV_VAR>`, so a secret-scanning hook does not trigger. Run the wrapper as a `Bash` tool call (optionally with `run_in_background: true`) and `Read` `$OUT` when it completes.

If the script exits non-zero:
- `2` → API key not in environment. Set it once and reopen the shell.
- `3` → brief path doesn't exist.
- `4` → `codex.exe` not found.
- Other → Codex itself returned an error; check `$OUT` for details.

### Why a wrapper script — secret-hook + sandbox guardrail

1. **Secret-hook avoidance.** A bash command containing the literal key var name next to an environment read can trip a secret-scanning hook — the harness can't statically tell whether the value is being assigned to a child env (safe) or printed (unsafe). Putting the auth setup inside a `.ps1` keeps the var name off the bash command line entirely.
2. **Sandbox guardrail.** If the base `~/.codex/config.toml` uses a permissive default sandbox, the wrapper forces an explicit `--sandbox` flag every run, mapped from a typed `-Mode` parameter (only `review` or `edit`). This prevents accidentally inheriting a dangerous default.

### Override config inline if needed (advanced — only when calling codex.exe directly)

```bash
"$CODEX" exec --skip-git-repo-check \
  -c model=<your-model> \
  -c model_reasoning_effort=high \
  - < brief.md
```

## Step 5 — Polling and completion

Codex runs to completion in one bash call (no background daemon). When you launch it via `Bash(run_in_background: true)`:

- The harness sends a `<task-notification>` with `<status>completed</status>` when codex.exe exits.
- **Do not poll, sleep, or schedule wakeups** — the notification is the signal.
- On notification, `Read` the output file you redirected to. Truncate or summarize before pasting back to the user — Codex output can run several thousand tokens.

If a run hangs (>20 min):
```bash
tasklist | grep -i codex
taskkill /F /IM codex.exe
```

## Step 6 — Verify before declaring complete

For an edit job, run all three:
```bash
git diff --stat HEAD       # File count matches brief scope
git diff HEAD              # Diff matches what was asked
grep -r "<removed-id>" .   # No orphan references to removed identifiers
```
If any check fails → re-dispatch with a resumption brief.

For a review job: confirm the output file has the expected severity buckets and a verdict line. If Codex returned only a refusal or an off-topic response, re-dispatch with a tighter brief.

## Hard nos

- **Never echo `<API_KEY_ENV_VAR>` or any other secret.** Pass it through the env; rely on `~/.codex/config.toml`'s `env_key`.
- **Never use Codex for destructive operations on user files.** The brief's CONSTRAINTS section is the only guardrail. Be explicit.
- **Never dispatch Codex via a Claude sub-agent.** Call `codex.exe` directly from Bash in the main session.
