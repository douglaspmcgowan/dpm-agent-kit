# Harness & loops — the engineering layer

The five pillars (`DETAILED-GUIDE.md`) get you a well-behaved agent for one task at a time. This doc
is the layer above that: how to engineer the *environment* an agent runs in, and how to build *loops*
that drive the agent without you prompting each step. It distills the patterns that practitioners have
written about through 2025–2026, generalized so you can apply them to any repo.

Read this once you're comfortable with the pillars and you want the agent to run longer tasks with
less supervision.

---

## 1. The ladder of leverage

Each rung moves your hand further from the keystroke and closer to the system.

| Rung | You engineer | You do |
|------|--------------|--------|
| **Prompt engineering** | the words of one turn | read the reply, type the next turn — holding the tool every turn |
| **Harness engineering** | the *environment* one agent runs in | set it up once; the agent runs a whole task on its own |
| **Loop engineering** | the *system* that prompts the agent | write the loop; the loop writes the prompts |

The shift to rung 3 works because the agents got reliable enough to run a whole task and recover from
their own mistakes. Your leverage moves up from writing each prompt to designing the system that
generates and checks them.

---

## 2. Harness engineering — the environment around the model

The model is fixed; you engineer the scaffolding so an agent can build and verify work with little
supervision. The job, in three words: make the repo **legible, executable, verifiable.**

**Legible** — the agent can tell where to change what.
- Keep the root agent doc (`AGENTS.md` / `CLAUDE.md`) to a ~100-line **map**: overview, project tree,
  golden rules, and a "where to look" table. Push depth into a `docs/` system with its own index.
- Add **custom lints** (section 5) that surface a warning the moment the agent does the wrong thing,
  with an error message that *names the fix* ("don't import from `legacy/` here — use `core/`").

**Executable** — the agent can run the thing with no thought.
- One command brings the whole dev stack up (a `scripts/dev.sh up` that starts every server). No
  guessing.
- Make it **worktree-friendly** so parallel agents each boot the app in their own git worktree
  without colliding on ports or state.
- Add shortcut scripts that jump to a specific state (a seeded DB, a given screen) so the agent can
  reach the scenario it needs to test.

**Verifiable** — the agent can prove its work.
- A small **end-to-end gate** over the critical flows that must never break.
- A **verify-before-ship loop**: a fresh, read-only verifier agent drives the running app and judges
  it, while objective checks (type-check, lint, unit tests, existing e2e) run separately. No
  self-verification (section 4).

The five harness parts in one line: **context** (CLAUDE/AGENTS, skills, memory) · **tools** (bash,
MCP) · **guards** (hooks, permissions, lints) · **the verification signal** (the heart) ·
**sub-agents** (narrow roles).

---

## 3. Loop engineering — a control system around the harness

A loop wakes on a trigger, picks up work, ships it, verifies it, and logs what it learned — so work
compounds without you prompting each step.

**Four ingredients:**
1. **A trigger** — cron, a webhook or incident, another agent, or a manual `/loop`.
2. **A file + logging structure** — the shared, file-based memory the loop reads and writes (section 4).
3. **Tools & connectors** — skills and MCP servers so it can do real work.
4. **A codebase harness** — so it can run, test, and verify autonomously (section 2).

**The cycle:** goal + stop-condition → discover work → act (the harness runs) → verify (independent)
→ persist state to a file → decide: pass = ship, fail = feed the errors back and loop.

What makes it a loop and not a cron job: the decision-maker inside is an agent that reads state and
chooses the next action. The two universal reliability levers are a **machine-checkable success
signal** and **fresh, isolated context plus file-based state** to fight drift. Every loop needs an
explicit **stop-condition**.

### Loop-type catalog

The library (`../explorable/skills-library.html` → Loops) holds the same set as cards. Sorted by which
question each loop answers:

**Operational loops decide WHEN the agent runs.**

- **Heartbeat / continuous** — sleeps, wakes on a short fixed interval, does one small unit of work,
  sleeps again. Each beat is stateless with fresh context, so errors don't accumulate. For
  constant-vigilance monitoring. Stop: usually never; add a circuit breaker so a broken beat doesn't
  burn cycles forever.
- **Cron / scheduled** — fires at wall-clock times (daily, nightly, weekly). The most deterministic
  trigger; reliable when paired with a state file so it doesn't redo work. Footgun: timezone
  defaults — confirm the schedule fires when you think it does.
- **Hook / event-triggered** — runs in response to an event (a file change, a lifecycle hook). A
  Stop hook that re-drives the agent turns an event into a loop ("don't stop until tests pass").
  Guard against the infinite Stop-loop by checking the `stop_hook_active` flag. Zero wasted cycles.
- **Goal / while-not-done** — re-invokes itself toward an objective until a written success condition
  is true. The highest cost and drift risk; reliability comes entirely from a crisp, machine-checkable
  done-condition plus externalized state.

**Reasoning loops decide HOW the agent reaches a correct answer.**

- **Plan → execute → verify** — decompose into a plan, execute the steps, then verify, ideally with
  an independent checker. The backbone of the superpowers framework.
- **Generator–verifier** — one agent produces, a separate agent or a deterministic gate judges, and
  the result feeds back until it passes. The single most reliable correctness pattern.
- **Reflexion / self-critique** — after an attempt, the agent writes a short critique of what went
  wrong and retries with that critique in context. A cheap quality lift when the failure is legible to
  the model.

**Orchestration loops decide HOW MANY agents run.**

- **Map-reduce / parallel workers** — fan independent sub-tasks out to parallel workers, then merge.
  Only for genuinely independent parts; never two workers writing the same file. (`/parallelize`
  helps decompose.)

These stack: a production system often runs an operational loop (cron) whose body uses a reasoning
loop (generator–verifier) across an orchestration loop (map-reduce). Many loops can read and write the
*same* folders — one shared knowledge layer — so a friction found by one loop is picked up by another.

---

## 4. The file & output model

The shared, file-based memory a loop reads and writes reduces to three things — **artifacts · a loop
contract · a worklog**.

- **Artifacts** = the outputs and findings, the shared knowledge layer. One folder per *type*, each
  with a `README` that defines what goes in, what doesn't, the schema, and how to add an item. Common
  types and ID schemes: `docs/` (`DOC-n`, durable knowledge and decisions-with-rationale), `signals/`
  (`SIG-n`, feedback, ideas, frictions, observations a loop noticed), `tasks/` (`TASK-n`, the durable
  record behind active work). Each item carries frontmatter, a body, and its own append-only timeline.
- **Loop contract** = a `README.md` per loop with **Goal · Workflow · Backlog · Timeline**. The loop
  reads it every time it fires.
- **Worklog** = one global, append-only `LOG.md`: a line per bulk of work (`date | what`). The agent
  reads the last 5–10 entries before starting and appends before stopping.

This sits alongside the kit's task model (`CURRENT-TASK.md` for active work, `BACKBURNER.md` for the
backlog, `STATUS.md` for durable state). The task files are the *working surface*; the artifact
folders are the *record*.

### Keeping the right thing in the right folder

Three mechanisms, cheapest first:

1. **A `README.md` in each artifact folder is the contract** — what goes in, what does not, the
   frontmatter schema, the ID scheme, the step to add an item. The agent reads it before filing.
2. **The `kind:` field must match the folder.** That's the single checkable invariant.
3. **A lint enforces it** (section 5): every file in `signals/` has `kind: signal` and the required
   fields; misfiled or malformed items get flagged with a fix message. Run it on edit (a `PostToolUse`
   hook) and in any loop's verify step.

```js
// kind-lint: folder name must equal frontmatter kind
const folder = path.basename(path.dirname(file));  // "signals"
const kind   = frontmatter.kind;                   // "signal"
if (singular(folder) !== kind)
  fail(`${file}: kind:${kind} in ${folder}/ — file it under ${kind}s/ or fix the kind.`);
```

Start with the few artifact types that earn their place (`docs/` and `signals/` pay off first); add a
type only when it has its own status machine **and** a distinct body shape.

---

## 5. Lints — the cheapest verifier

A **lint** is a static check: it reads code or text as plain characters and flags a problematic
pattern without running the code. That makes it fast, deterministic, and binary (pass or fail). A
*custom* lint enforces *your* conventions. Several of the kit's hooks already are custom lints — the
secret scanners and the file-safety guard all flag a pattern and exit non-zero.

**The one principle that makes a lint agent-grade: write the error message to inject the fix.** A lint
that says "forbidden" wastes a round. A lint that says *"`any` isn't allowed here — give it a concrete
type or `unknown` plus a guard"* lets the agent self-correct on the spot. One lint = one invariant =
one remediation message.

**What's worth a custom lint** — anything you keep repeating in prose: layering and dependency
direction (no importing "up" a layer), naming conventions, forbidden imports, no `console.log`,
file-size ceilings, project invariants ("no secrets in source").

**Four routes, cheapest first:**

1. **Regex / script** — a text-pattern scan over the diff that exits non-zero with a fix message. What
   most of the kit's hooks are. Good for text patterns; it only sees characters, so it can't tell code
   structure from a string that looks like code.
2. **Linter plugin** — a rule inside the language's own linter (an ESLint custom rule that walks the
   AST; a Ruff or flake8 rule for Python), so it understands code structure and lights up in your
   editor and CI for free.
3. **AST / structural query** — `ast-grep` or tree-sitter matches syntax patterns against the parse
   tree (e.g. "a `fetch(` call without a surrounding try/catch"), with far fewer false positives than
   regex on code.
4. **A lifecycle hook** — a script the harness runs automatically before or after a tool. The right
   home for cross-project, always-on invariants — exactly the secret and file-safety lints. Keep them
   high-precision (false positives and false negatives both at zero) and run their test suite after
   editing.

A few rules of thumb the practitioner write-ups agree on: set the rules you care about to `error` (a
wall of warnings trains you to ignore the linter); let a formatter end the style wars so the linter can
focus on correctness; in an agent loop, apply only *safe* auto-fixes blindly and make unsafe or
non-fixable rules *fail loudly* for human judgment; and watch for a formatter and a lint rule that
fight each other in an infinite edit cycle.

---

## 6. Verification — the non-negotiable

Never let an agent grade its own work unless the change is genuinely trivial (a one-line copy fix, a
rename). Everything with logic, layout, or correctness at stake gets an **independent** check: a fresh
read-only verifier agent, or a deterministic gate (tests, lint, type-check, a headless browser run).
This is the heart of the harness — the rest of the machinery exists to feed a trustworthy signal into
the loop.

---

## 7. Standing one up

You don't need all of this at once. The progression that pays off:

1. **Hooks + `CLAUDE.md`** (the pillars) — safety and behavior. 80% of the value.
2. **The task model** — `CURRENT-TASK.md`, then `STATUS.md` and `LOG.md`. Continuity across sessions.
3. **One custom lint** — pick the convention you re-explain most and turn it into a hook with a fix
   message.
4. **A per-repo `AGENTS.md`** (≤~100 lines): overview · project tree · golden rules · where-to-look ·
   build/run commands · verify command. This is also what makes cloud and CI sessions behave, since
   they inherit the repo's docs but not your machine's globals.
5. **One command to run the app**, then a small e2e gate over the flows that must never break.
6. **A loop** — once a task is well-defined and has a machine-checkable success signal, wrap it in one
   of the loop types above with an explicit stop-condition.

The aim is a working skeleton plus the reasoning behind each bone, ready for you to adapt. Delete what
doesn't fit.
