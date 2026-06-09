#!/usr/bin/env node
// Stop hook: show "Agent finished" system message, but skip if CURRENT-TASK.md has unchecked items
const fs = require('fs');
const path = require('path');

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const home = process.env.USERPROFILE || process.env.HOME || '';
    const taskFile = path.join(home, '.claude', 'CURRENT-TASK.md');

    if (fs.existsSync(taskFile)) {
      const content = fs.readFileSync(taskFile, 'utf8');
      if (content.includes('- [ ]')) {
        // Unchecked items remain — don't show "finished" toast
        return;
      }
    }

    process.stdout.write(JSON.stringify({
      systemMessage: 'Agent finished.'
    }));
  } catch (_) {}
});
