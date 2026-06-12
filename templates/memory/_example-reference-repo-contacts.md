---
name: repo-and-contacts
description: Local repo paths → GitHub remotes, and key contact addresses for outreach/correspondence
metadata:
  type: reference
---

## Repo map

Keep an authoritative `repo-map.md` (e.g. `~/Documents/projects/repo-map.md`). Format:

| Nickname | Local path | GitHub remote | Notes |
|---|---|---|---|
| `agent-kit` | `~/Documents/projects/dpm-agent-kit` | `github.com/you/dpm-agent-kit` | public; deploys to vercel.app |
| `global-config` | `~/.claude` | `github.com/you/claude-global-config` | private; synced across machines |
| `portfolio` | `~/Documents/projects/my-site` | `github.com/you/my-site` | public |

Read before any `git commit` or `git push`. Resolves ambiguity when multiple repos are checked out
("which repo is 'the tracker'?") and prevents accidentally pushing to the wrong remote.

This memory entry stores where the file is. The file itself is authoritative — read it fresh rather
than recalling row-by-row from memory.

## Contact addresses

Store key contact addresses here rather than in `CLAUDE.md` — they're personal data, not behavior
rules. Fill in your own:

| Context | Address |
|---|---|
| Work / institutional | `you@yourorg.gov` |
| Personal / OSS | `you@personal.com` |
| Academic | `you@university.edu` |

**How to apply:** Before drafting any email, outreach note, or document with a "From:" or "Contact:"
field, check here for which address fits the context (professional correspondence, public GitHub
profile, academic submissions, etc.).
