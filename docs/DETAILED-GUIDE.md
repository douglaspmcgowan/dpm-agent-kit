# dpm-agent-kit — the detailed guide

How the whole setup works, end to end. Read this for the mental model behind the install steps.
The kit has **five pillars** (skills, hooks, memory, CLAUDE.md, workflow) and a ring
of **plugged-in tools** around them.

---

## 0. The mental model

Treat the agent like a capable teammate who shows up with no memory and infinite willingness to act.
That framing produces three needs, and the kit answers each:

- It needs **standing instructions** → `CLAUDE.md` (the always-on contract).
- It needs **guardrails** so "infinite willingness to act" doesn't delete your repo or leak a key →
  **hooks**.
- It needs **continuity** so it isn't a goldfish across sessions → **memory** + `CURRENT-TASK.md`.

Then **skills** give it reusable expertise on demand, and the **workflow** is how you actually drive
it day to day. Everything else (Obsidian, Wispr Flow, wmux) is plumbing that makes the loop faster.

---

## 1. Skills — reusable expertise on demand

A skill is a markdown file with frontmatter (`name`, `description`) living in `~/.claude/commands/`
(or shipped by a plugin). The `description` is a *trigger*: the agent reads it and decides when the
skill applies. You also invoke one explicitly with `/name`.

Three layers in this kit:

1. **Superpowers** (Jesse Vincent / obra) — the agentic framework: a dispatcher (`using-superpowers`)
   plus 13 skills that enforce **brainstorm → plan → execute → verify**. See
   `../obsidian/Superpowers - Skills Guide.md` for each skill's how/why.
2. **grill-me** (Matt Pocock) — relentless one-question-at-a-time interrogation to extract intent
   before building.
3. **Your custom skills** (vendored, scrubbed, in `../templates/skills/`) — workflow automations like
   `deep-search`, `make-playbook`, `parallelize`, `rollover`, plus adapted personal ones. See
   `SKILLS-MANIFEST.md`.

> The big idea: when you notice yourself re-explaining a workflow, turn it into a skill
> (`writing-skills` helps). Skills are how the setup *compounds*.

---

## 2. Hooks — the guardrails

Hooks are dependency-free Node scripts Claude Code runs at lifecycle events. They read a JSON event
on stdin and decide: allow (silent), **block** (`{"continue":false}` or `{"decision":"block"}`),
inject context, or **soft-warn** (stderr — the agent reports it and asks you before continuing).
Full table in `../templates/hooks/README.md`. The shape of the security model:

- **Secrets — two tiers.** `check-secret-exposure` blocks commands that would print secrets *before
  they run*; `scan-output-for-secrets` scans command output *after* as a backstop;
  `scan-write-for-secrets` stops a key being written into a file. Once a secret hits the transcript,
  the only fix is rotation — so the kit works hard to keep them out.
- **Exfiltration & destruction.** `block-egress-exfil` cuts the "external communication" leg of the
  lethal trifecta (uploads to unapproved hosts, `curl|bash`, netcat). `block-dangerous-bash` stops
  `rm -rf ~`, force-push, `reset --hard`, live `DROP TABLE`.
- **Protect the guards.** `protect-security-config` makes tampering with the hooks/config/`CLAUDE.md`
  visible — a prompt injection's first move is to disable defenses.
- **Workflow.** `session-primer` injects your task state at boot; `task-state-reminder` nudges you to
  keep `CURRENT-TASK.md` current; `audit-bash-log` keeps a redacted command ledger;
  `log-agent-dispatch` records every sub-agent you fan out; `check-session-size` tells you when to
  roll over.

Design principle throughout: **high precision over recall.** Block only the commands whose *primary
purpose* is dangerous, so you never start ignoring the warnings.

---

## 3. Memory — continuity across conversations

A file-based system (`../templates/memory/`) with a thin, always-loaded index (`MEMORY.md`) pointing
at per-fact files in four types:

- **user** — who you are, so explanations fit your level.
- **feedback** — how to work. Critically, save BOTH corrections *and* confirmed-good approaches —
  otherwise the agent drifts toward over-caution and forgets what already worked.
- **project** — who/why/when (decays fast; use absolute dates).
- **reference** — where things live in other systems.

What stays OUT: anything re-derivable (code, paths, git history) and ephemeral task state (that's
`CURRENT-TASK.md`'s job). Full rules in `../templates/memory/MEMORY-SYSTEM.md`.

> Memory is a *snapshot in time*. Before acting on a memory that names a file or flag, the agent
> verifies it still exists — present reality beats a stale note.

### Building a voice profile

One of the highest-value reference memories is a synthesized voice guide. Feed the agent a set of
your real writing — emails, essays, application answers, README files, anything with a distinctive
register. The broader the sample (formal submissions + casual messages + technical docs) the richer
the output. Prompt:

> "Read all of these. Extract a reusable voice guide: sentence rhythm, vocabulary level, paragraph
> length, constructions to use, constructions to avoid."

The model produces a `voice.md` (core rules) and optionally a `voice-detail.md` (sentence-level
calibration). Drop both in `~/.claude/` so they're accessible in any project session. Then add a
memory entry that simply says *read voice.md before any publishable prose* — and separately, a
feedback memory that broadens "publishable" to cover READMEs, setup guides, and HTML site copy too,
not just explicit essays or emails.

### Anchoring research facts

For any project with primary research (a paper, a dataset, an analysis), create a `reference`
memory that stores every verified number anchored to its exact source location. Without this, the
agent re-searches the same figures each session and introduces small inconsistencies that compound —
a dataset quoted as "~8,000" one day and "7,864" the next. The memory file also carries a
**NOT-IN-PAPER list**: numbers the agent might plausibly fabricate from context but that were never
actually published. See `_example-reference-project-facts.md` for the full pattern.

### Starter examples in `../templates/memory/`

The kit ships seven annotated example files covering the most common patterns:

| File | Type | What it shows |
|---|---|---|
| `_example-feedback.md` | feedback | Minimal format demo — terse responses |
| `_example-reference-voice.md` | reference | Voice profile: how to build it from documents |
| `_example-feedback-publishable-prose.md` | feedback | Extend "publishable" to docs/READMEs |
| `_example-feedback-headless-testing.md` | feedback | Playwright `.cjs` + `file://` fallback pattern |
| `_example-feedback-hook-precision.md` | feedback | High-precision security hooks; why recall loses |
| `_example-reference-project-facts.md` | reference | Anchoring research numbers to source |
| `_example-reference-repo-contacts.md` | reference | Repo map + contact addresses in one place |

Delete them as you replace them with your own.

---

## 4. CLAUDE.md — the behavioral contract

The always-loaded file (`~/.claude/CLAUDE.md` + per-project ones, merged). Keep it **lean**: voice,
anti-fabrication, secret-safety, file-safety (backup + new file, never overwrite), autonomy
(proceed, don't ask; batch questions), plan-means-plan, careful-actions. Push deep, situational
detail into sibling files (`CLAUDE-delegation.md`, `CLAUDE-frontend-testing.md`, …) referenced by
name and read on demand — that keeps every-session context cheap.

Most rules are **scar tissue**: each exists because its absence caused a concrete problem once (an
overwrite destroyed unsaved edits; a fabricated number shipped; the agent implemented when only a
plan was wanted). Your CLAUDE.md should encode *your* scars. See `../templates/claude-md/README.md`.

---

## 5. Workflow — how you actually drive it

This is the part no template can capture for you, so here's the operating rhythm the kit is built
around:

- **One long thread per project, ridden through compaction.** Don't pre-emptively start fresh chats.
  Stay in one session as it auto-compacts; continuity lives in `CURRENT-TASK.md` + memory, so one
  long thread survives every compaction. `check-session-size` warns when the transcript is getting heavy.
- **`CURRENT-TASK.md` is the handoff.** For any 5+ step task or when compaction looms, keep it in the
  project root: one-line goal, completed steps (with files changed), remaining steps in order, and
  the exact verifier/command to run next. On a post-compaction resume, read it FIRST. `session-primer`
  injects it at boot; `task-state-reminder` surfaces unchecked items; `stop-toast-gate` stays quiet
  while items remain. Delete it when done.
- **The `/rollover` ritual.** At end of a heavy session, a diagnostics script gathers state (task
  file, memory dir, files changed in 48h, git status) and *the agent* writes the handoff — because
  only it has the conversation context. Next session resumes clean.
- **"Keep going and parallelize where you can."** A signature autonomous-batch move: instruct the
  agent to run a queue of work without stopping to ask between items, fanning out sub-agents where
  parts are independent. The kit's autonomy rules in `CLAUDE.md` make this safe to say.
- **Delegation via the two-question test** (`CLAUDE-delegation.md`): hand work to a secondary
  agent/model only if (1) you can write a one-paragraph self-contained brief AND (2) there's a
  verification signal that doesn't need your judgment. Otherwise keep it yourself.
- **"The bridge" is a markdown handoff *file* you review before anything runs.** When coordinating
  with a second CLI agent (e.g. a different model), the durable artifact is a brief in a shared folder;
  you read it before anything executes. Don't auto-pipe work between agents.
- **Parallel sub-agents** only for 3+ independent parts, all dispatched in one message, each with its
  own objective/output-format/scope, never two writing the same file. (`/parallelize` helps decompose.)
- **Daily rituals.** A scheduled `daily-activity` report ("what I made yesterday") and a separate
  `daily-review` debugging-arc audit keep a paper trail and feed playbook updates (`make-playbook`).

---

## 6. The plugged-in tools

These aren't bundled (they're separate software / private repos) but they're part of the setup:

| Tool | What it is | How it connects |
|---|---|---|
| **Obsidian** | Markdown notes vault. | The agent reads/writes notes (often via an Obsidian MCP server). `block-vault-delete` guards against accidental deletion. Keep agent-related notes (like the Superpowers guide) in a `Claude/` subfolder. |
| **Wispr Flow** | AI voice dictation (Mac/Win/iOS/Android). | You *speak* long prompts to the agent (~150 wpm vs ~60 typing); it cleans filler/punctuation and auto-chunks long input so it pastes cleanly into Claude Code. The fastest way to give a big, detailed brief. |
| **wmux** | Windows-native multi-agent terminal multiplexer (`openwong2kim/wmux`). | Splits one window into panes, each running its own agent (Claude Code, Codex, Gemini CLI) over a shared repo, with **agent-to-agent messaging** and a built-in **browser-automation** MCP toolset. This is how you run a *team* of agents side by side. (Its MCP tools appear as `mcp__wmux__*`.) |
| **claude-global-config** | Your entire `~/.claude/` as a portable git repo. | The source of truth for how the agent behaves across machines — clone to `~/.claude` on a new box and you're reproduced. This kit is the *public, scrubbed, explained* sibling of that private repo. |
| **dpm-sites hub** | A personal landing/index page + a **profile knowledge base**. | The index tracks your deployed sites; the `profile/` corpus (bio, experience, stories, signature numbers) gives any agent a consistent factual picture of you for drafting outreach/portfolio/fellowship copy. A blank, fill-in-able version ships in `../templates/profile/`. |

---

## 7. A day in the life (how it all fits)

1. **Boot.** `session-primer` injects `CURRENT-TASK.md` + `BACKGROUND-TASKS.md`; `MEMORY.md` index is
   loaded. The agent knows where you left off and how you like to work.
2. **Brief.** You dictate a request with Wispr Flow. For anything non-trivial, `brainstorming` or
   `grill-me` pins the design; `writing-plans` makes it ordered.
3. **Build.** `executing-plans` works the steps; independent parts fan out as sub-agents (logged by
   `log-agent-dispatch`); `test-driven-development` + `systematic-debugging` keep it correct. All the
   while, hooks block any secret leak, exfil, or destructive command.
4. **Verify.** `verification-before-completion` makes the agent prove it (run/test/screenshot), not
   just claim done. `requesting-code-review` critiques the diff.
5. **Persist.** Worth-remembering lessons go to memory; the task file is updated; if the session got
   heavy, `/rollover` writes a clean handoff. Tomorrow, `daily-activity` summarizes what you made.

---

## 8. Making it yours

- Start with the hooks (safety) and `CLAUDE.md` (behavior). Those two give you 80% of the value.
- Add memory next; it pays off by the third session.
- Adopt the workflow gradually — `CURRENT-TASK.md` first, then `/rollover`, then delegation.
- Add skills as you notice repetition. Turn your own scar tissue into `CLAUDE.md` rules.
- Read `HANDLING-SECRETS.md` to safely layer in your real paths, hosts, and policy.

The kit is opinionated on purpose. Delete what doesn't fit. The goal is a working skeleton plus the
reasoning behind each bone, ready for you to adapt.

---

## 9. Going further — the harness & loop layer

Once the five pillars feel natural, `HARNESS-AND-LOOPS.md` covers the engineering layer above them:
making a repo legible/executable/verifiable, the catalog of loop types (heartbeat, cron, hook, goal,
generator–verifier, map-reduce), the file/output model for shared state, and how to write custom lints
whose error messages name the fix. That's how you move from driving the agent turn by turn to building
systems that drive it for you.
