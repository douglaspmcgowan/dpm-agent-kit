#!/usr/bin/env node
// PreToolUse WebFetch|WebSearch hook: when the session is working inside a "protected" directory
// (e.g. a folder holding sensitive/regulated material), public web tools should be OFF — you don't
// want the agent sending that context to a public search/fetch service. Fetches to domains you
// explicitly approve are still allowed. Warns via stderr (does not hard-block) so the agent can
// ask you to confirm and continue if it's a false alarm.
//
// ── CONFIG ──────────────────────────────────────────────────────────────────────
// If the session cwd matches any of these, web egress is gated.
const PROTECTED_DIR_PATTERNS = [
  // /Sensitive_Vault/i,
  // /Regulated Material/i,
];
// ...except fetches to these domains, which stay allowed even inside a protected dir.
const ALLOWED_DOMAINS = [
  // 'your-internal-proxy.example.com',
];
// ───────────────────────────────────────────────────────────────────────────────

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const tool = input.tool_name || '';
    const ti = input.tool_input || {};
    const cwd = String(input.cwd || '').replace(/\\/g, '/');

    if (PROTECTED_DIR_PATTERNS.length === 0) return;          // not configured → no-op
    const inProtected = PROTECTED_DIR_PATTERNS.some(re => re.test(cwd));
    if (!inProtected) return;

    // WebFetch to an approved domain is fine.
    if (tool === 'WebFetch') {
      const url = String(ti.url || '');
      if (ALLOWED_DOMAINS.some(d => new RegExp(d.replace(/\./g, '\\.'), 'i').test(url))) return;
    }

    process.stderr.write(
      '[web-egress] ⚠ Public web access attempted from inside a protected directory.\n' +
      'Policy: do not send sensitive/regulated context to public services.\n' +
      'Confirm with the user before proceeding (or add the domain to ALLOWED_DOMAINS).\n'
    );
  } catch (_) {}
});
