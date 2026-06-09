---
title: Superpowers — Skills Guide
tags: [claude-code, agents, skills, superpowers]
---

# Superpowers — Skills Guide

> [!abstract] What this is
> **Superpowers** is an open-source skills framework for Claude Code by **Jesse Vincent (obra)** — MIT-licensed, accepted into the official Claude Code plugin marketplace in Jan 2026. It installs a library of *agentic skills* that push the agent through a disciplined **brainstorm → plan → execute → verify** loop instead of the "just start coding" failure mode. This note explains each skill: **how it works** and **how you use it**.

> [!info] Install
> Global (all projects): `/plugin install superpowers@superpowers-marketplace --global`
> This repo's pinned set was vendored from `github.com/obra/superpowers` (`skills/*/SKILL.md`). Plus a standalone skill, **grill-me** (Matt Pocock), covered at the end.

---

## How skills work (the 10-second model)

A *skill* is a markdown file (`SKILL.md`) with YAML frontmatter — a `name` and a `description`. The description tells the agent **when** to reach for it. Skills are dropped in `~/.claude/commands/` (or installed via a plugin) and surface two ways:

1. **Auto-activation** — the agent reads your request, matches it against skill descriptions, and pulls in the relevant skill's instructions on its own.
2. **Manual** — you type `/skill-name` to invoke it explicitly.

The master skill, **using-superpowers**, runs at the start of a conversation and acts as a dispatcher: it decides which skills apply and activates them in sequence. Skills compose — brainstorming hands off to writing-plans, which hands off to executing-plans, which calls test-driven-development and verification-before-completion.

---

## The dispatcher

### `using-superpowers`
> [!note] How it works
> The entry-point/master skill. Runs early in a conversation, reads your intent, and routes to the right skills in the right order (e.g. a feature request → brainstorming → writing-plans → executing-plans). It's the glue that makes the others fire automatically.

> [!tip] How you use it
> You usually don't invoke it directly — it self-activates. If the agent seems to be "just coding" without process, say *"use superpowers"* to force the disciplined flow.

---

## Design & planning

### `brainstorming`
> [!note] How it works
> Turns a fuzzy idea into a concrete design through one-question-at-a-time dialogue. It explores project context, asks clarifying questions, proposes 2–3 approaches with trade-offs, then writes a design doc — and **hard-gates** implementation: no code until you approve a design. Every project goes through it, even "simple" ones (that's where unexamined assumptions cost the most).

> [!tip] How you use it
> Start any new feature/component with *"let's brainstorm this"* or just describe what you want to build. Answer its questions; approve the design it presents. Output is a saved spec you (and the executor) work from.

### `writing-plans`
> [!note] How it works
> Converts an approved design into a step-by-step implementation plan: ordered tasks, the files each touches, and a verification signal per step. Ships with a plan-document-reviewer prompt that critiques the plan before you execute it.

> [!tip] How you use it
> After brainstorming, ask for *"a plan"*. Review it, then hand it to `executing-plans`. Great for work that will span a compaction — the plan is the durable artifact.

### `writing-skills`
> [!note] How it works
> A meta-skill for authoring new skills. Encodes Anthropic best practices, persuasion principles (so the description actually triggers), graphviz conventions for diagrams, and a method for testing a skill with sub-agents before you trust it.

> [!tip] How you use it
> When you catch yourself re-explaining the same workflow, say *"let's write a skill for this."* It'll help you write a tight `SKILL.md` and pressure-test the trigger.

---

## Execution

### `executing-plans`
> [!note] How it works
> Drives a written plan to completion with discipline: work the steps in order, keep state, verify each step's done-signal before moving on. Resists scope-creep and "while I'm here" detours.

> [!tip] How you use it
> Hand it a plan file: *"execute this plan."* Best paired with `writing-plans` and a `CURRENT-TASK.md` so progress survives compaction.

### `subagent-driven-development`
> [!note] How it works
> For plans with independent tasks: dispatches sub-agents to implement pieces in parallel, with built-in implementer / spec-reviewer / code-quality-reviewer prompts so each piece is reviewed inline (no separate review loop). Cuts wall-clock time on parallelizable work.

> [!tip] How you use it
> When a plan has 3+ independent tasks, ask to *"run this with sub-agents."* Don't use it for tightly-coupled work that writes the same files.

### `dispatching-parallel-agents`
> [!note] How it works
> The mechanics of fanning out concurrent agents correctly: one message with all dispatches, each with its own objective/output-format/scope, and no two agents writing the same file.

> [!tip] How you use it
> Mostly used by other skills. Invoke when you explicitly want several independent investigations or builds running at once.

---

## Quality & debugging

### `test-driven-development`
> [!note] How it works
> Enforces the red-green-refactor cycle: write a failing test FIRST, watch it fail, write the minimum code to pass, refactor. Ships a testing-anti-patterns reference so tests stay meaningful (no asserting-on-mocks theater).

> [!tip] How you use it
> Say *"TDD this"* before implementing a feature/bugfix. The agent writes the test, shows you the failure, then implements. Best signal that a fix actually fixed something.

### `systematic-debugging`
> [!note] How it works
> A four-phase methodology: **investigate root cause before any fix.** Includes root-cause-tracing, condition-based-waiting (kill flaky timing bugs), defense-in-depth, and a `find-polluter.sh` for test-pollution hunts. Blocks the "try random fixes" anti-pattern.

> [!tip] How you use it
> When something's broken and the first guess didn't work, say *"debug this systematically."* It'll force a hypothesis → evidence loop instead of shotgun edits.

### `verification-before-completion`
> [!note] How it works
> A gate before declaring "done": actually run the thing, observe real behavior, check the done-signal. Stops the agent from claiming success on unverified work.

> [!tip] How you use it
> It self-activates near task end. If the agent says "done," you can invoke it to make it *prove* it (run, screenshot, test output).

---

## Code review & branch hygiene

### `requesting-code-review`
> [!note] How it works
> Packages a change for review and runs it past a built-in `code-reviewer` prompt — a structured diff critique focused on correctness.

> [!tip] How you use it
> Before merging, *"request a code review."* Get findings before a human (or you) looks.

### `receiving-code-review`
> [!note] How it works
> The discipline for *responding* to review feedback: triage each comment, fix or push back with reasoning, don't blindly accept. Closes the review loop cleanly.

> [!tip] How you use it
> After review comments land (from a human or `requesting-code-review`), *"work through this review."*

### `finishing-a-development-branch`
> [!note] How it works
> The end-of-branch checklist: tests green, diff clean, commits sensible, branch ready to merge/PR. Catches the loose ends before you ship.

> [!tip] How you use it
> When a feature's done, *"finish this branch."*

### `using-git-worktrees`
> [!note] How it works
> Sets up and drives git worktrees so multiple branches/agents can work in isolated checkouts of the same repo without stepping on each other.

> [!tip] How you use it
> When running parallel agents or juggling branches, *"use a worktree for this."* Pairs naturally with `subagent-driven-development`.

---

## Bonus standalone skill

### `grill-me` (Matt Pocock)
> [!note] How it works
> Interviews you **relentlessly, one question at a time**, walking down the decision tree of a plan/design and resolving each dependency. For every question it offers its own recommended answer, and it explores the codebase instead of asking when the answer is findable there. Sessions run ~16–50 questions depending on fuzziness.

> [!tip] How you use it
> When you want your thinking stress-tested before building: *"grill me on this."* Different from `brainstorming` — grill-me is sharper and more adversarial, aimed at extracting what's actually in your head. Install: drop its `SKILL.md` in `~/.claude/skills/grill-me/` (or `commands/grill-me.md`).

---

## The arc, in one line

> [!quote] 
> **using-superpowers** dispatches → **brainstorming** (or **grill-me**) nails the design → **writing-plans** makes it ordered → **executing-plans** / **subagent-driven-development** build it → **test-driven-development** + **systematic-debugging** keep it correct → **verification-before-completion** proves it → **requesting/receiving-code-review** + **finishing-a-development-branch** ship it.

*Source: [github.com/obra/superpowers](https://github.com/obra/superpowers) (v5.x). grill-me: [github.com/mattpocock/skills](https://github.com/mattpocock/skills).*
