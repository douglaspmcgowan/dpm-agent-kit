#!/usr/bin/env node
// PreToolUse hook (Write|Edit|NotebookEdit + Bash): protects the security CONFIG itself from
// modification/deletion. A prompt-injection attack's first move is often to disable the guards.
// Covers: .claude/settings*.json, .claude/keybindings.json, .claude/hooks/*, .mcp.json,
//         CLAUDE.md, MEMORY.md, and the auto-memory dir.
// All cases → warn via stderr + allow, so the agent can ask the user mid-turn instead of stopping.
// Hard limits (exfil, dangerous commands, secret exposure) live in the other hooks.

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const tool = input.tool_name || '';
    const ti = input.tool_input || {};

    const isProtectedPath = (p) => {
      if (!p) return false;
      const s = String(p).replace(/\\/g, '/');
      return /(^|\/)\.claude\/settings(\.[\w]+)*\.json$/i.test(s)
          || /(^|\/)\.claude\/keybindings\.json$/i.test(s)
          || /(^|\/)\.claude\/hooks\//i.test(s)
          || /(^|\/)\.mcp\.json$/i.test(s)
          || /(^|\/)CLAUDE\.md$/i.test(s)
          || /(^|\/)MEMORY\.md$/i.test(s)
          || /\.claude\/.*memory\/.+/i.test(s);
    };

    let hit = false;

    if (tool === 'Bash') {
      const cmd = (ti.command || '').replace(/\r?\n/g, ' ');
      const redir = cmd.match(/>>?\s*("?)([^\s"';|&]+)\1/);
      if (redir && isProtectedPath(redir[2])) hit = true;
      const teeM = cmd.match(/\btee\b\s+(?:-a\s+)?("?)([^\s"';|&]+)\1/i);
      if (teeM && isProtectedPath(teeM[2])) hit = true;
      // Only match rm/cp/etc. as shell-level commands (after ^ or ; & | separators),
      // not as words inside a node -e / python -c script argument.
      if (!hit && /(?:^|[;&|])\s*(?:sudo\s+)?(?:rm|rmdir|del|erase|mv|move|cp|copy|truncate)\b/i.test(cmd)) {
        for (const tok of cmd.split(/[\s"';|&]+/)) {
          if (isProtectedPath(tok)) { hit = true; break; }
        }
      }
    } else {
      hit = isProtectedPath(ti.file_path);
    }

    if (hit) {
      // Warn via stderr — the agent reports this and asks the user before proceeding.
      // Does NOT stop the turn (continue: false removed), so multi-step tasks can complete.
      const what = ti.file_path || (ti.command || '').slice(0, 120) || '(unknown)';
      process.stderr.write(
        '[security-config] ⚠ Action targets a protected security file: ' + what + '\n' +
        'Confirm with the user before accepting this change.\n'
      );
    }
  } catch (_) {}
});
