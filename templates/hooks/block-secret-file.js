#!/usr/bin/env node
// PreToolUse Read|Grep|Glob hook: hard-blocks access to specific files/folders that hold LIVE
// secrets (e.g. a personal notes file where you keep API keys). check-secret-exposure.js and
// block-sensitive-file-read.js catch the generic patterns (.env, creds); this one is for the
// named, project-specific vaults the agent should NEVER open.
//
// ── CONFIG: add path fragments (matched case-insensitively) the agent must never read ──
const SECRET_FILE_PATTERNS = [
  /AI[ _-]?Reference/i,          // example: an Obsidian note that stores live keys
  // /vault[\/\\]secrets/i,
  // /my-passwords\.md/i,
];
// ───────────────────────────────────────────────────────────────────────────────────────

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const toolInput = input.tool_input || {};
    const candidates = [
      toolInput.file_path || '',
      toolInput.path || '',
      toolInput.pattern || '',
    ];
    if (candidates.some(s => SECRET_FILE_PATTERNS.some(re => re.test(s)))) {
      process.stdout.write(JSON.stringify({
        continue: false,
        stopReason: 'Blocked: this path is off-limits (it contains live secrets). Open it directly outside the agent.'
      }));
    }
  } catch (_) {}
});
