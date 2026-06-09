# Repo map (template)

A lookup table that maps each **local folder** to its **GitHub repo** (plus any nicknames you use in
chat). Once you have more than two or three repos, the agent can't reliably guess which one you mean
when you say "my fork," "the tracker," or "the v2 repo" — and a wrong guess means a commit or push to
the wrong remote. This file removes the guesswork.

## How to use it

1. Save your filled-in copy somewhere stable that the agent can read (e.g. `~/repo-map.md`, or a
   notes/vault folder). Avoid a path that only exists when a sync client is running.
2. In your `CLAUDE.md`, tell the agent where it lives and when to consult it — see the snippet at the
   bottom of this file.
3. Update it whenever you clone, fork, or rename a repo.

Replace every `<PLACEHOLDER>`. Delete the example rows.

## The map

| Nickname / how you refer to it | Local path | GitHub repo | Notes |
|---|---|---|---|
| `<NICKNAME>` | `<LOCAL_PATH>` | `<OWNER>/<REPO>` | `<branch you usually work on, deploy target, etc.>` |
| `<NICKNAME>` | `<LOCAL_PATH>` | `<OWNER>/<REPO>` | |

### Worked example (delete or adapt)

| Nickname / how you refer to it | Local path | GitHub repo | Notes |
|---|---|---|---|
| the agent kit, "the kit" | `<LOCAL_PATH>/dpm-agent-kit` | `douglaspmcgowan/dpm-agent-kit` | public; deploys to `dpm-agent-kit.vercel.app` (static, `vercel.json` redirects `/` → `/explorable/`) |
| my fork of upstream-tool | `<LOCAL_PATH>/upstream-tool` | `<YOUR_USER>/upstream-tool` | fork of `<UPSTREAM_OWNER>/upstream-tool`; PRs go to `upstream:main` |
| the tracker | `<LOCAL_PATH>/project-tracker` | `<ORG>/project-tracker` | private; work on `dev`, never push `main` directly |

## Snippet for your CLAUDE.md

```markdown
## Repo map

`<PATH_TO_THIS_FILE>` maps local paths to GitHub repos and nicknames. Read it before any
`git commit` / `git push`, and whenever I refer to a repo by nickname ("my fork", "the tracker",
"the v2 repo") so you act on the right remote. If a repo isn't in the map, ask rather than guess.
```
