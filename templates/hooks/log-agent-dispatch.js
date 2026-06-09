#!/usr/bin/env node
// PostToolUse Agent hook: appends a one-line record of every sub-agent dispatch to
// ~/.claude/BACKGROUND-TASKS.md, so you (and the next session, via session-primer.js) have a
// running ledger of what was delegated. Never blocks.
const fs = require('fs');
const path = require('path');

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    if ((input.tool_name || '') !== 'Agent') return;

    const home = process.env.USERPROFILE || process.env.HOME || '';
    const ledger = path.join(home, '.claude', 'BACKGROUND-TASKS.md');
    const desc = input.tool_input?.description || '';
    const prompt = (input.tool_input?.prompt || '').slice(0, 120);
    const entry = `\n- [${new Date().toISOString()}] Agent dispatched${desc ? ` (${desc})` : ''}. Prompt: ${prompt}...\n`;

    fs.appendFileSync(ledger, entry, 'utf8');
  } catch (_) {}
});
