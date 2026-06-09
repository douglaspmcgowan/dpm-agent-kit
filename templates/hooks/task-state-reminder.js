#!/usr/bin/env node
// On every user message, surfaces CURRENT-TASK.md if it exists in the CWD or home
const fs = require('fs');
const path = require('path');

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const cwd = input.cwd || process.cwd();
    const home = process.env.USERPROFILE || process.env.HOME || '';

    // Check CWD first, then home
    const candidates = [
      path.join(cwd, 'CURRENT-TASK.md'),
      path.join(home, 'CURRENT-TASK.md'),
    ];

    let content = '';
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        content = fs.readFileSync(p, 'utf8').trim();
        break;
      }
    }

    if (!content) return;

    // Only inject if there are unchecked items
    if (!content.includes('- [ ]')) return;

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: `CURRENT-TASK.md has unchecked items:\n\n${content}\n\nUpdate CURRENT-TASK.md before touching code.`
      }
    }));
  } catch (_) {}
});
