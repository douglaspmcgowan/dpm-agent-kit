#!/usr/bin/env node
// PreToolUse hook: prevents accidental delete/trash operations against a notes vault or other
// content store reached through an MCP server (e.g. an Obsidian MCP). Bind it to the relevant
// MCP matcher in settings.json (e.g. "mcp__obsidian__"). Deletes require explicit confirmation.
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const toolName = input.tool_name || '';
    const args = JSON.stringify(input.tool_input || {});
    const isDestructive = /delete|remove|trash/i.test(toolName) ||
      /delete|remove|trash/i.test(args);
    if (isDestructive) {
      process.stdout.write(JSON.stringify({
        continue: false,
        stopReason: 'Blocked: vault delete/remove/trash operations require explicit user confirmation.'
      }));
    }
  } catch (_) {}
});
