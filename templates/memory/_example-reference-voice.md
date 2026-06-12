---
name: voice-profile
description: The author's writing voice — synthesized from real documents so agent-drafted prose matches it
metadata:
  type: reference
---

Read `voice.md` before drafting any publishable prose. Read `voice-detail.md` for sentence-level
calibration.

## How to build a voice profile from documents

Feed the model a set of your actual writing — emails, essays, application answers, README copy,
anything that has a distinctive register. The broader the mix (formal submissions, casual Slack
messages, technical docs, personal reflections), the richer the ruleset. Prompt:

> "Read all of these. Extract a set of voice rules: sentence rhythm, vocabulary level, paragraph
> length, what constructions I use, what I avoid. Write them as a reusable style guide I can hand to
> any agent."

The model synthesizes a `voice.md` with the core rules, and a `voice-detail.md` with sentence-level
calibration (specific constructions to copy or cut). Keep both files in `~/.claude/` so they're
accessible in any project.

## Example hard rules (replace with your own)

- The rhetorical antithesis is banned: never "it's X, not Y" or "not a Y, but an X." State the
  positive claim and stop. This construction reads AI-generated more than almost anything else.
- Openings avoid "I" as the first word.
- Paragraphs stay short (3–4 sentences max in prose destined for the web).
- Direct assertion over hedged qualification ("this works" not "this should work").
- No em-dash drama: one em-dash per paragraph max; never two in a row.

## What to apply it to

Everything the reader will see: essays, portfolio copy, fellowship answers, outreach emails, README
files, guide docs, HTML site copy. See also [[docs-are-publishable-prose]].
