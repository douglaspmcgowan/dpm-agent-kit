---
name: rollover
description: End-of-session rollover. Runs ~/bin/rollover-session.ps1 to gather diagnostics, then updates CURRENT-TASK.md and seeds/updates memory files so the next session can pick up cleanly. Invoke when the user says "run session rollover", "rollover", "wrap up the session", or equivalent.
---

# /rollover

## Purpose

Hand off cleanly to the next session. The script does the diagnostics; **you** do the writing — because only you have the conversation context.

---

## Phase 1 — Run the diagnostics script

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File "~/bin/rollover-session.ps1"
```

The script prints — for the current project root — the state of `CURRENT-TASK.md`, the memory dir, files modified in the last 48 h, git status (if a repo), and a checklist. **Read every section.**

If the script doesn't exist, stop and tell the user — don't hand-roll the rollover unless they explicitly say "do it manually." The script is the single source of truth for what rollover means.

## Phase 2 — Update `CURRENT-TASK.md`

Compare the script's CURRENT-TASK.md preview against what actually happened this session. If the file is stale or missing and substantive work happened, **rewrite it.** Required structure:

1. **Goal** — one sentence, what this task chain is for.
2. **State at rollover** — bullets of what got done this session, with concrete file paths. Don't narrate the conversation; list outcomes.
3. **Outstanding / open** — anything offered-but-not-accepted, blockers, partial work, known drift.
4. **Verifier** — exact commands the next session can run to confirm the work is intact (e.g., `ls …`, `unzip -l …`, `git log -1`).
5. **Where things live** — short pointer block so the next agent can find the canonical paths without searching.

Skip CURRENT-TASK.md entirely if the session was a one-liner or pure conversation. The global rule is "5+ distinct items or context compaction is likely" — apply it.

## Phase 3 — Seed/update memory files

Use the auto-memory rules from `~/.claude/CLAUDE.md`. Walk the conversation and write entries for:

- **feedback** — every correction the user gave, *and* every non-obvious approach they confirmed worked. Include a **Why:** line and a **How to apply:** line. Save corrections AND validated approaches; one-sided memory drifts.
- **project** — state, deadlines, decisions, motivations behind work — anything not derivable from current files / git log. Convert relative dates to absolute.
- **user** — new facts about the user's role, expertise, preferences. Skip if nothing new.
- **reference** — pointers to external systems (Linear projects, dashboards, channels) the user mentioned.

**Don't save:** code patterns / file paths / project structure / recent git activity / debugging fix recipes — those are derivable. The exclusion still applies even if the user explicitly asks: ask what was *surprising* or *non-obvious* and save that instead.

For each new memory:
1. Write the file with full frontmatter (`name`, `description`, `metadata.type`).
2. Add a single index line to `MEMORY.md`: `- [Title](file.md) — one-line hook`.
3. Link related memories with `[[name]]` in the body — bidirectional when both exist.

If a memory file already covers the topic, **update it** rather than creating a duplicate.

## Phase 4 — Sanity sweep

- `MEMORY.md` is index-only — no memory content directly inside it. Each line < ~150 chars. Total file < 200 lines (lines after that get truncated).
- Each memory file's `description` is specific enough that future-you can decide relevance from one glance.
- `CURRENT-TASK.md` doesn't repeat content already in memory — it's *this task's* state, not durable knowledge.

## Phase 5 — Report back

One short paragraph to the user, max two sentences:
1. What was rolled over (CURRENT-TASK.md updated? new memory files? counts).
2. What's open or what verifier to run next session.

No headers, no bullet trees, no recap of the script output. The user already saw the script run.

---

## When to skip the rollover

- Pure conversation / Q&A session with no file edits.
- The user is mid-task and asked to pause, not wrap up — write `CURRENT-TASK.md` only, skip memory.
- The user is running a one-liner — `git push`, `npm install`, etc. — no rollover needed.

If unsure, ask the user in one sentence whether to do a full rollover or just a CURRENT-TASK update.
