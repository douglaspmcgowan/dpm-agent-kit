# Setup preflight

Before running the installer or having an agent set this up, verify that the tools it depends on are
present. One pass through this list takes about two minutes and saves you from a mid-install failure.

## Required

### Node.js ≥ 18

The hooks are dependency-free Node scripts. Node 18+ is required; 20 LTS is recommended.

```bash
node --version    # want v18.x or higher
```

Install from https://nodejs.org (LTS) or via your system package manager.

### Claude Code (recent build)

```bash
claude --version
```

The kit uses `/plugin install` for web-installed skills. Verify the CLI is on `PATH` and that the
`/plugin` command exists in a session (`/help` lists available commands).

Update: `npm update -g @anthropic-ai/claude-code` (or however you installed it).

## Recommended

### GitHub CLI (`gh`)

Used for repo creation, PR work, and the `finishing-a-development-branch` skill.

```bash
gh --version
gh auth status    # should say "Logged in to github.com as <user>"
```

Install: https://cli.github.com — then `gh auth login`.

### Vercel CLI (`vercel`)

Required only if you plan to deploy the explorable to Vercel.

```bash
vercel --version
vercel whoami     # should print your Vercel username
```

Install: `npm i -g vercel` — then `vercel login`.

### Git config — user identity

```bash
git config --global user.name   # should print your name
git config --global user.email  # should print your email
```

If blank: `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`.

## Optional (environment-specific)

| Tool | When you need it |
|---|---|
| PowerShell 7+ (`pwsh`) | Running `install.ps1` on Windows |
| Bash / WSL | Running `install.sh` on Windows |
| Obsidian (any recent version) | The Obsidian vault integration and the `obsidian/` skills guide |
| wmux | Multi-pane agent sessions (`winget install openwong2kim.wmux`) |

## Quick one-liner check (bash)

```bash
for cmd in node claude gh git vercel; do
  if command -v "$cmd" &>/dev/null; then echo "✓ $cmd $(${cmd} --version 2>&1 | head -1)";
  else echo "✗ $cmd — not found"; fi
done
```

## What the installer touches

The scripts and agent-driven setup only write inside `~/.claude/` (hooks, settings, skills, CLAUDE.md)
and optionally create a git repo for `~/.claude/`. They do **not** modify system paths, install global
packages, or write outside your home directory. If you'd like to review before anything runs, read
`INSTALL.md` first — every step is documented there.
