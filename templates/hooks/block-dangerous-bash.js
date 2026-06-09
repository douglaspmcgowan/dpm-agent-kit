#!/usr/bin/env node
// Blocks rm -rf on root/home, force pushes, hard resets, bulk discards, and live destructive SQL.
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const cmd = (input.tool_input?.command || '').replace(/\r?\n/g, ' ');

    // git push --force / -f  — but ALLOW the safe --force-with-lease variant.
    // Scope force detection to git push's own args (up to && / ; / |).
    const pushPart = (cmd.match(/\bgit\s+push\b([^&|;]*)/) || [, ''])[1];
    const isPush = /\bgit\s+push\b/.test(cmd);
    const forceWithLease = /--force-with-lease/.test(pushPart);
    const hasForce = /(?:^|\s)--force(?:\s|$)/.test(pushPart) || /(?:^|\s)-[a-z]*f[a-z]*\b/.test(pushPart);

    // destructive SQL — only when actually executed (SQL client or -c/-e/.sql), not echoed/grepped
    const hasDropSql = /\b(?:DROP\s+TABLE|TRUNCATE\s+TABLE|DROP\s+DATABASE)\b/i.test(cmd);
    const sqlExecCtx =
      /\b(?:psql|mysql|mariadb|sqlite3?|sqlcmd|mongo(?:sh)?|cqlsh|clickhouse-client|duckdb)\b/i.test(cmd) ||
      /(?:^|\s)(?:-c|-e|--command|--execute)\b/.test(cmd) ||
      /\.sql\b/i.test(cmd);

    const rules = [
      { match: /rm\s+-[a-z]*r[a-z]*f\s+[\/~]/.test(cmd) || /rm\s+-[a-z]*f[a-z]*r\s+[\/~]/.test(cmd), label: 'rm -rf on root/home' },
      { match: isPush && hasForce && !forceWithLease, label: 'git push --force' },
      { match: /git\s+reset\s+--hard/.test(cmd), label: 'git reset --hard' },
      { match: /git\s+clean\s+-[a-z]*f/.test(cmd), label: 'git clean -f' },
      { match: /git\s+checkout\s+--\s+(?:\.|\*)(?:\s|$)/.test(cmd), label: 'git checkout -- . (discard all changes)' },
      { match: /git\s+branch\s+-D\s/.test(cmd), label: 'git branch -D (force delete)' },
      { match: hasDropSql && sqlExecCtx, label: 'destructive SQL (DROP/TRUNCATE)' },
      { match: /git\s+rebase\s+-i/.test(cmd), label: 'git rebase -i (interactive)' },
    ];

    const matched = rules.find(r => r.match);
    if (matched) {
      process.stdout.write(JSON.stringify({
        continue: false,
        stopReason: `Blocked dangerous command (${matched.label}). Confirm explicitly to proceed.`
      }));
    }
  } catch (_) {}
});
