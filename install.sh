#!/usr/bin/env bash
# dpm-agent-kit installer (macOS / Linux). Non-destructive: backs up, writes new files, never
# overwrites your settings.json. Re-run safe (idempotent for hooks/skills).
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"
TS="$(date +%Y%m%d_%H%M%S)"

echo "==> dpm-agent-kit installer"
echo "    kit:        $KIT_DIR"
echo "    claude dir: $CLAUDE_DIR"

# --- prereqs ---------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "!! Node.js not found. Install Node, then re-run." >&2; exit 1
fi
NODE_BIN="$(command -v node)"
echo "    node:       $NODE_BIN"

mkdir -p "$CLAUDE_DIR/hooks" "$CLAUDE_DIR/commands"

# --- 1. hooks --------------------------------------------------------------
echo "==> Installing hooks -> $CLAUDE_DIR/hooks/"
cp -f "$KIT_DIR"/templates/hooks/*.js "$CLAUDE_DIR/hooks/"
echo "    copied $(ls "$KIT_DIR"/templates/hooks/*.js | wc -l | tr -d ' ') hook scripts"

# --- 2. settings (substitute, never overwrite) -----------------------------
echo "==> Preparing settings"
SETTINGS_OUT="$CLAUDE_DIR/settings.dpm-agent-kit.json"
sed -e "s#__NODE__#${NODE_BIN}#g" \
    -e "s#__CLAUDE_DIR__#${CLAUDE_DIR}#g" \
    "$KIT_DIR/templates/settings/settings.template.json" > "$SETTINGS_OUT"

if [ -f "$CLAUDE_DIR/settings.json" ]; then
  cp -f "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.bak-$TS"
  echo "    existing settings.json found -> backed up to settings.json.bak-$TS"
  echo "    !! NOT overwriting. Merge the 'hooks' (and 'permissions.allow') blocks from:"
  echo "       $SETTINGS_OUT"
  echo "       into your settings.json. (An agent can do this for you — see INSTALL.md.)"
else
  mv "$SETTINGS_OUT" "$CLAUDE_DIR/settings.json"
  echo "    no existing settings.json -> installed fresh one with hooks wired"
fi

# --- 3. CLAUDE.md (offer, never overwrite) ---------------------------------
if [ ! -f "$CLAUDE_DIR/CLAUDE.md" ]; then
  cp "$KIT_DIR/templates/claude-md/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
  cp "$KIT_DIR/templates/claude-md/CLAUDE-delegation.md" "$CLAUDE_DIR/CLAUDE-delegation.md"
  echo "==> Installed CLAUDE.md + CLAUDE-delegation.md (you had none)"
else
  echo "==> You already have a CLAUDE.md — left untouched."
  echo "    Template to merge from: $KIT_DIR/templates/claude-md/CLAUDE.md"
fi

# --- 4. memory scaffold (only if absent) -----------------------------------
MEM_DIR="$CLAUDE_DIR/memory"
if [ ! -f "$MEM_DIR/MEMORY.md" ]; then
  mkdir -p "$MEM_DIR"
  cp "$KIT_DIR"/templates/memory/*.md "$MEM_DIR/"
  echo "==> Installed memory scaffold -> $MEM_DIR/ (read MEMORY-SYSTEM.md)"
else
  echo "==> Memory already initialized at $MEM_DIR — left untouched."
fi

# --- 5. vendored custom skills ---------------------------------------------
echo "==> Installing vendored skills -> $CLAUDE_DIR/commands/"
for f in "$KIT_DIR"/templates/skills/*.md; do
  base="$(basename "$f")"
  case "$base" in
    WEB-INSTALLED-SKILLS.md|SKILLS-MANIFEST.md|README.md) continue ;;
  esac
  cp -f "$f" "$CLAUDE_DIR/commands/$base"
done
echo "    done. (Install superpowers + grill-me per templates/skills/WEB-INSTALLED-SKILLS.md)"

echo ""
echo "==> Done. Next:"
echo "    1. Restart Claude Code so settings.json reloads."
echo "    2. Smoke-test: ask the agent to run 'printenv' — it should be BLOCKED."
echo "    3. Read docs/HANDLING-SECRETS.md to add your real paths/policy."
