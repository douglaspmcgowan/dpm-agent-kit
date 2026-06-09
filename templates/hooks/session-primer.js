#!/usr/bin/env node
// SessionStart: reads CURRENT-TASK.md and BACKGROUND-TASKS.md and injects them as boot context
const fs = require('fs');
const path = require('path');

const home = process.env.USERPROFILE || process.env.HOME || '';
const claudeDir = path.join(home, '.claude');

const files = {
  'CURRENT-TASK.md': path.join(claudeDir, 'CURRENT-TASK.md'),
  'BACKGROUND-TASKS.md': path.join(claudeDir, 'BACKGROUND-TASKS.md'),
};

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  const sections = [];
  for (const [name, p] of Object.entries(files)) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8').trim();
      if (content) sections.push(`## ${name}\n${content}`);
    }
  }

  if (sections.length === 0) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `Session boot context:\n\n${sections.join('\n\n')}`
    }
  }));
});
