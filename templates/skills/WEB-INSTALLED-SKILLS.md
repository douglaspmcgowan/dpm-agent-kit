# Web-installed skills (install prompts)

These skills aren't vendored as files in this kit — they live in public repos and are best installed
from source so you get updates. Copy a block below into your agent, or run the command yourself.

---

## Superpowers (the agentic framework)

14 composable skills: `using-superpowers` (dispatcher), `brainstorming`, `writing-plans`,
`executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`,
`test-driven-development`, `systematic-debugging`, `verification-before-completion`,
`requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`,
`using-git-worktrees`, `writing-skills`.

> [!install] Easiest — plugin marketplace
> ```
> /plugin install superpowers@superpowers-marketplace --global
> ```
> (If `/plugin` isn't recognized, update Claude Code: `npm update -g @anthropic-ai/claude-code`, then restart.)

> [!install] Agent prompt (manual vendor)
> Paste this to an agent if you'd rather copy the skill files directly:
> ```
> Install the "superpowers" skills from github.com/obra/superpowers. For each subfolder under
> /skills (brainstorming, dispatching-parallel-agents, executing-plans,
> finishing-a-development-branch, receiving-code-review, requesting-code-review,
> subagent-driven-development, systematic-debugging, test-driven-development,
> using-git-worktrees, using-superpowers, verification-before-completion, writing-plans,
> writing-skills), fetch its SKILL.md via `gh api repos/obra/superpowers/contents/skills/<name>/SKILL.md
> --jq .content | base64 -d` and write it to ~/.claude/commands/<name>.md. Then confirm each skill
> appears in the skills list.
> ```

See `../../obsidian/Superpowers - Skills Guide.md` for what each skill does and how to use it.

---

## grill-me (Matt Pocock)

Interviews you relentlessly, one question at a time, to stress-test a plan or design before building.

> [!install] curl (macOS/Linux)
> ```bash
> mkdir -p ~/.claude/skills/grill-me
> curl -L https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md \
>   -o ~/.claude/skills/grill-me/SKILL.md
> ```

> [!install] Agent prompt (cross-platform)
> ```
> Fetch the grill-me skill: `gh api repos/mattpocock/skills/contents/skills/productivity/grill-me/SKILL.md
> --jq .content | base64 -d` and write it to ~/.claude/commands/grill-me.md. Confirm it appears as a skill.
> ```

The full text is short; here it is for reference:

```markdown
---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding.
Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For
each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.
```
