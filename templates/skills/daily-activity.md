<!-- Adapted from a personal workflow; replace placeholders to fit your setup. -->
---
name: daily-activity
description: Daily activity/output summary — what you accomplished and made yesterday. Walks every Claude session JSONL modified yesterday and every file touched in the vault and project folders, groups them into themed threads, and writes a prose report to <VAULT>/Daily Reports/YYYY-MM-DD.md. Different from /daily-review (which is debugging-arc-focused). Invoked manually with /daily-activity or by a scheduled task.
---

# /daily-activity

## Purpose

Every morning, look at what you *built and accomplished* yesterday — the agent-pack rewrites, the slide decks, the new vault notes, the project pivots — and turn it into a prose report you can scan in 60 seconds. This is **not** the debugging-arc audit (`/daily-review` does that). This is the "what did I make and where is it" report that goes into the Daily Reports folder of your Obsidian vault.

The report should read like a prior dated entry in `<VAULT>/Daily Reports/` — use the most recent one as the canonical example of voice, structure, and granularity.

---

## Phase 0 — Determine the target date

Default: yesterday (today's local date minus 1).

If the user passes an argument like `/daily-activity 2026-06-03`, use that date instead.

Compute `YYYY-MM-DD` and use it consistently for both file scanning and the output filename.

---

## Phase 1 — Collect raw signal

Run all of these. Most can be parallelized.

### 1a. Claude session transcripts modified on the target date

Scan your `~/.claude/projects/<encoded-project-dir>/` directories for `.jsonl` files whose mtime falls on the target date. List the project dirs you care about, e.g.:

- `~/.claude/projects/<ENCODED_PROJECT_1>/`
- `~/.claude/projects/<ENCODED_PROJECT_2>/`
- `~/.claude/projects/<ENCODED_PROJECT_3>/`

For each session file:
- Read the first user prompt (skip continuation/summary blocks and `<system-reminder>` shells).
- Note the time span (first → last timestamp).
- For sessions ≥1 MB, skim the assistant text for thread topic; for sessions <1 MB read end-to-end.

The first user prompt is the cheapest way to identify what the session was about. The assistant's final summary (often near the end) is the second-cheapest.

### 1b. Files modified on the target date

Walk these roots, exclude `_backups`, `.git`, `node_modules`, `.obsidian`, `.smart-env`, `.smart-chat-conversations`:

- `<VAULT>/`
- `<PROJECT_DIR>/`

Record file path + mtime for everything where `date(mtime) == target_date`.

### 1c. Codex run outputs

If `<PROJECT_DIR>/.codex-runs/` has files with the target date in the filename or mtime, list them — those are review/research outputs from a secondary model.

### 1d. Memory writes

If your project memory dir (`~/.claude/projects/<ENCODED_PROJECT>/memory/`) has files modified on the target date, note them — captured durable lessons from yesterday.

---

## Phase 2 — Group into threads

The same project usually shows up in **multiple session files + multiple file mtimes + a review run**. Cluster by topic, not by session.

Identify your own recurring thread patterns — a thread is a cluster of sessions + file mtimes that share a project, a folder, or a recurring keyword (e.g. "deck"/"slides", "agent pack", a specific tool name).

For each thread, find:
- Time span (earliest → latest activity across sessions and file mtimes).
- ~1-paragraph description of the goal in your own voice (use phrasing from session prompts where possible).
- 3–6 bullet points listing concrete artifacts: file paths created/edited, links to vault notes, backup names.
- A pull-quote from a user message if there's a sharp one (rule clarifications, pivots, frustration calls — these reveal *why*).
- Loose ends / open questions (only if the session ended unresolved).

If a thread is small (<30 min total, single session), write it as a one-line bullet rather than a section.

---

## Phase 3 — Write the report

Output path: `<VAULT>/Daily Reports/YYYY-MM-DD.md`.

Structure:

```markdown
# Daily Report — YYYY-MM-DD

[1-paragraph overview: number of threads, dominant arcs, anything unusual.]

## [Thread name] (~HH:MM–HH:MM) — [optional descriptor like "biggest thread"]
[1-paragraph what + why.]
- Artifact / file path / link.
- Artifact / link.
- Memory written: `name.md`.
- Quote: *"…"* — if there's a sharp one.

## [Next thread] (~HH:MM–HH:MM)
…

## Loose ends going into [next-day date]
- Bulleted list. Each one specific and actionable.
```

Rules:
- Use **Obsidian wikilinks** (`[[Folder/Filename]]` or `[[Filename]]`) for vault notes, not absolute paths.
- For non-vault files, use a backtick-quoted relative path.
- Use 24-hour times. Round to the nearest 5 minutes for thread spans.
- Pull-quotes go in italics inside the bullet, with em-dash attribution.
- Match your voice — concrete, terse, weight on artifacts. Don't editorialize.
- **Never the "X, not Y" antithesis.** State the positive claim and stop.
- If a thread had a clear failure or pivot, name it. Don't smooth over it.
- The report should be readable in ~60 seconds.

---

## Phase 4 — Update an output-index note if there's a notable new asset

Only touch your long-term reference index (e.g. `<VAULT>/Output Dropbox.md`) if yesterday produced something that belongs in the long-term reference list — a new project folder, a new pipeline canvas, a new agent pack. Surgical additions only: add a bullet under the relevant existing entry, or a new top-level entry with 2–4 bullets. Match the existing format. Don't restructure.

If yesterday was just incremental work on existing assets, skip Phase 4 entirely.

---

## Phase 5 — Done

After the report is written, output to chat: the report path + a 2-line summary (number of threads, biggest thread). Nothing else.

If invoked from the scheduled task (non-interactive), no chat output is needed — just exit 0.

---

## Operating constraints

- **Never read API keys or env-var values.** Use metadata-only probes if you somehow need to check whether something is set.
- **Never overwrite authored files**. The Daily Reports file is generated content — overwriting yesterday's report with today's date is fine; overwriting an index note or any vault note you authored is not. Use Edit for surgical changes.
- If the target date already has a report, write to `YYYY-MM-DD.v2.md` instead of overwriting.
- Skip days with no sessions and no file changes (output: "No activity on YYYY-MM-DD" to chat, no file written).
- This skill writes only to `<VAULT>/Daily Reports/`. It does not touch hooks, settings.json, playbooks, or memory.
