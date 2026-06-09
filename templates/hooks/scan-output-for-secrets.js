#!/usr/bin/env node
// PostToolUse hook: scans Bash command OUTPUT for accidental secret exposure.
// Blocks the result from reaching the agent if a real secret is found.
// Backstop for check-secret-exposure.js (which blocks commands before they run).
//
// Design: two tiers.
//   1. KEY-FORMAT patterns — high precision, match well-known credential shapes.
//   2. NAME=VALUE heuristic — finds `SECRET_NAME = value` then validates the value with
//      looksLikeSecret() to reject benign noise (UUIDs, file paths, assembly tokens like
//      PublicKeyToken=<hex>, low-entropy values). This is what kept firing false positives.

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    if (input.tool_name !== 'Bash') return;

    const output = JSON.stringify(input.tool_response || '');

    // ── Tier 1: high-precision credential FORMATS ─────────────────────────────
    const formatPatterns = [
      /sk-ant-[A-Za-z0-9_\-]{20,}/,          // Anthropic key
      /sk-[A-Za-z0-9_\-]{20,}/,               // OpenAI-style key
      /AKIA[A-Z0-9]{16}/,                      // AWS access key ID
      /gh[pousr]_[A-Za-z0-9_]{36,}/,          // GitHub token
      /xox[baprs]-[A-Za-z0-9\-]{10,}/,        // Slack token
      /AIza[A-Za-z0-9_\-]{35}/,               // Google API key
      /eyJ[A-Za-z0-9_\-]{20,}\.eyJ[A-Za-z0-9_\-]{20,}/,  // JWT (header.payload)
      /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/, // PEM private key
    ];
    if (formatPatterns.some(p => p.test(output))) return block();

    // ── Tier 2: NAME=VALUE heuristic, validated ───────────────────────────────
    const SECRET_NAME =
      /(?:AWS|GITHUB|GH|API|TOKEN|SECRET|KEY|PASSWORD|PASSWD|CRED(?:ENTIAL)?|AUTH|PRIVATE|PAT|STRIPE|SLACK|TWILIO|SENDGRID|ANTHROPIC|OPENAI)[A-Za-z0-9_]*\s*[:=]\s*["']?([A-Za-z0-9/+=_\-]{16,})/gi;

    let m;
    while ((m = SECRET_NAME.exec(output)) !== null) {
      if (looksLikeSecret(m[1])) return block();
    }
    return;

    function looksLikeSecret(v) {
      // Reject UUIDs (config IDs, correlation IDs, etc.)
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v)) return false;
      // Reject file paths (CMake cache values, classpath:, /usr/..., C:\..., *.pem etc.)
      if (/[\/\\]/.test(v) && (
            /\.(pem|crt|cer|key|pub|json|ya?ml|toml|sh|ps1|bat|txt|md|cfg|conf|ini|xml|pfx|p12|js|ts|py|cs|cpp|hpp|h|sql|csv|log)$/i.test(v) ||
            /(?:^|[\/\\])(?:usr|etc|var|home|opt|tmp|bin|lib|Users|Program|Modules|share)\b/i.test(v) ||
            /classpath:/i.test(v) ||
            /^[A-Za-z]:[\/\\]/.test(v)
          )) return false;
      // Entropy / length gate: real secrets are long, or short-but-mixed.
      // Rejects assembly tokens like PublicKeyToken=b77a5c561934e089 (16 lowercase-hex, 2 classes).
      const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[\/+=_\-]/].filter(re => re.test(v)).length;
      if (v.length >= 32) return true;
      if (v.length >= 16 && classes >= 3) return true;
      return false;
    }

    function block() {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: 'Output blocked: command response appears to contain a secret or API key. Check the command and avoid printing credential values.'
      }));
    }
  } catch (_) {}
});
