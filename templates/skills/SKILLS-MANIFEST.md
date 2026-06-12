# Skills manifest

Every skill in this kit, what it does, and whether it's broadly reusable or adapted from a personal
workflow. **[GENERAL]** = useful as-is. **[ADAPTED]** = was personal/domain-specific; genericized
into placeholders (look for the `<...>` tokens and a top-of-file note) — read it and fit it to your
setup before relying on it.

## Vendored custom skills (in this folder, `~/.claude/commands/`)

| Skill | Purpose | Kind |
|---|---|---|
| `deep-search` | Multi-step web research with query fan-out, human-source priority, inline citations | GENERAL |
| `make-playbook` | Extract a reusable pattern into a structured playbook after a task | GENERAL |
| `parallelize` | Decompose a task into parallel sub-agent dispatches with explicit contracts | GENERAL |
| `rollover` | End-of-session handoff: update `CURRENT-TASK.md` and seed memory files | GENERAL |
| `build-tracker` | Build a deadline/application tracker (calendar, cards, table, map + iCal) | GENERAL |
| `build-graph-explorer` | Build a force-directed knowledge-graph explorer SPA from a node/edge corpus | GENERAL |
| `groq-transcribe` | Pull newest audio, transcribe via Groq Whisper, clean + trim the transcript | GENERAL |
| `hue` | Meta-skill that generates new design-language skills | GENERAL |
| `bridge-status` | Inspect a local "research bridge" handoff folder; report pending/drafts/released | ADAPTED |
| `capability-report` | Build a "state of a capability" report with an embedded color-coded canvas pipeline | ADAPTED |
| `codex-brief` | Draft/dispatch a self-contained brief to a secondary coding model (two-question gate + verify) | ADAPTED |
| `daily-activity` | Prose "what I built yesterday" summary grouped into themed threads | ADAPTED |
| `daily-review` | Daily debugging-arc + automation-candidate analysis; auto-edits playbooks | ADAPTED |
| `fellowship-review` | Review a fellowship/scholarship draft against type-specific rubrics | ADAPTED |
| `json-generator` | Generate/fix a domain structured-payload JSON for a generative-design workflow | ADAPTED |
| `map-field` | Map a field/domain corpus into a structured "schools of thought" site | ADAPTED |
| `context-update` | Process a context-dropbox folder into researched notes, a map, and an archive | ADAPTED |
| `process-linkedin-inbox` | Categorize pasted social posts and propose site edits | ADAPTED |
| `environment-preflight` | Pre-deploy audit (Phase 1) + full static HTML→GitHub→Vercel ship workflow (Phase 2) | GENERAL |

## Web-installed skills (install from source — see `WEB-INSTALLED-SKILLS.md`)

| Skill set | Purpose |
|---|---|
| **superpowers** (14 skills) | The brainstorm→plan→execute→verify agentic framework. Full guide: `../../obsidian/Superpowers - Skills Guide.md`. |
| **grill-me** | Relentless one-question-at-a-time design interrogation. |

## How to add your own

When you catch yourself re-explaining a workflow, make a skill: create
`~/.claude/commands/<name>.md` with `name` + `description` frontmatter (the description is the
trigger), then the instructions. The superpowers `writing-skills` skill helps you write and
pressure-test it.
