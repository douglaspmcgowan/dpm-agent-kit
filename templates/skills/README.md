# Skills

Reusable `/slash-command` workflows. A skill is a markdown file with YAML frontmatter (`name`,
`description`) — the `description` is the trigger the agent matches against your request. Drop a file
in `~/.claude/commands/` and it becomes available as `/name` and for auto-activation.

## What's here

- **18 vendored custom skills** (`*.md`) — scrubbed for public use. The installer copies these into
  `~/.claude/commands/`. See `SKILLS-MANIFEST.md` for the full list and which are [GENERAL] vs
  [ADAPTED].
- **`WEB-INSTALLED-SKILLS.md`** — install prompts for **superpowers** and **grill-me** (installed
  from their own repos, not vendored here).
- **`SKILLS-MANIFEST.md`** — the index of everything.

## [ADAPTED] skills — read before relying on

Skills tagged [ADAPTED] were genericized from a personal/domain-specific workflow. They contain
`<PLACEHOLDER>` tokens (e.g. `<VAULT>`, `<RESEARCH_DIR>`, `<API_KEY_ENV_VAR>`) and a top-of-file
note. Open them, replace the placeholders with your setup, and test before trusting. [GENERAL] skills
work as-is.

## Authoring your own

Use superpowers' `writing-skills` skill, or by hand:

```markdown
---
name: my-skill
description: One sharp sentence describing WHEN to use this — this is what triggers it.
---

The instructions the agent follows when the skill activates.
```
