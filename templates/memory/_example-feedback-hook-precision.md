---
name: hook-precision-over-recall
description: Security hooks must be high-precision — false positives train people to ignore them
metadata:
  type: feedback
---

Keep secret and safety hooks targeted and high-precision. Block only commands whose *primary purpose*
is dangerous, not every command that contains a risky-looking string. Test after every edit; keep
false positives and false negatives at zero.

**Why:** A hook that fires too broadly trains you (and the agent) to ignore or bypass it, which
destroys the entire point. One false alarm per day and the block gets mentally downgraded to a
"warning." High recall at the cost of precision means the hooks provide no real protection.

**How to apply:** When adding a pattern to a security hook, ask: "Does this match commands that are
harmless 90% of the time?" If yes, narrow it. The test suite (`test-secret-hooks.js` or equivalent)
should pass with FP=0, FN=0 after every change.

Focus the pattern on environment-variable-reading commands, secret file paths, and token shapes —
not on the word "secret" appearing anywhere in a command string.
