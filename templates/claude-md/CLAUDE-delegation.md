# Delegation, parallelization & model policy (template)

Decision rules for when to delegate (to a secondary CLI agent or a sub-agent), how to parallelize,
and which model to use. Reference this from `CLAUDE.md` and tell the agent to read it before any
non-trivial task.

## Two-question test (run before handing work off)

1. **Can I write a self-contained briefing paragraph covering everything the worker needs?** If
   framing the task takes more than one paragraph of context → keep it yourself. If you can distill
   it clearly → proceed.
2. **Is there a verification signal that doesn't require my judgment?** Tests pass, build green,
   `git diff` matches a pattern, word count met, schema validates. If the only check is "does this
   look right" → keep it yourself.

If either answer is no → do it yourself.

## Escalation: who does the work

- **The main agent (yourself)** when the task needs ongoing judgment, the brief won't distill to one
  paragraph, or there's no machine-verifiable done-signal.
- **A secondary CLI agent** (e.g. a second model via its own CLI) for discrete, low-risk,
  well-specified work that passes the two-question test: exhaustive file list, machine-verifiable
  completion. Run it in read-only/review mode unless edits are explicitly intended.
- **A larger/"thinking" model** for load-bearing architectural decisions, hard-to-reverse refactors,
  debugging that already failed once, or first-pass plans on a new project.

## Model policy

Pick a default model and switch deliberately:

- **Small/fast model** — read-only inventories, glob/grep sweeps, status checks, file listings.
  Anything mechanical where you won't reason hard about the result.
- **Mid model (default)** — routine implementation, edits across known files, single-feature changes.
- **Large model** — load-bearing decisions, hard-to-reverse refactors, debugging that already failed
  once, first-pass plans. Don't burn it on setup, formatting, or deploy debugging.

If you stay in one model for a session, delegate the pieces intentionally: spawn small-model
sub-agents for inventory/exploration, request the large model for the one critical decision, return
to the default to execute. Name the model in the sub-agent dispatch when it matters.

## Parallelization

- Spawn sub-agents ONLY when: (a) 3+ genuinely independent parts with no shared file writes, (b) a
  single investigation would burn 30+ files of context you don't need afterward, or (c) the full
  context wouldn't fit one window. Otherwise do it yourself.
- Dispatch ALL independent sub-agent calls in a SINGLE message so they run concurrently.
- Every sub-agent brief must include: (1) objective, (2) exact output format, (3) read-first file
  paths, (4) 2–3 key project rules inline (sub-agents don't reliably inherit `CLAUDE.md`), (5) a
  scope boundary.
- Never assign two workers to write the same file. If a worker is stuck 3+ iterations, stop and
  re-plan — don't spawn another to retry.
