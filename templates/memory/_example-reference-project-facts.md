---
name: project-research-facts
description: Anchored numbers and citations for a research project — prevents re-research drift across sessions
metadata:
  type: reference
---

Use this pattern for any project where you've done primary research and cite specific numbers. Store
every verified number in one place, anchored to its exact location in the authoritative source.

## Why this matters

Without anchored facts, the agent guesses or re-searches the same numbers each session, introducing
small inconsistencies that compound over time (a dataset quoted as "~8,000 nodes" in one slide and
"7,864 nodes" in the paper). One authoritative memory file, sourced to the actual document, eliminates
drift and prevents fabrication.

## What to capture

- **Pipeline funnel** — how many records collected → filtered → final (each step)
- **Schema** — field counts, section names, category breakdowns
- **Graph structure** — node/edge counts broken out by type (structural vs. semantic, etc.)
- **Distributions** — frame/scope/epistemic/applicability (verify they sum to the total)
- **Reliability scores** — which metric, which categories, and — critically — *which category had the
  lowest agreement* (that's the one reviewers ask about)
- **A verbatim worked example** — copy it exactly so it can be quoted without paraphrasing
- **NOT-IN-PAPER list** — things the agent might plausibly generate that aren't in the source
  (e.g. a specific model parameter you mentioned in conversation but never published)

## Source citation format

Use short anchors so future reads can skip to the right place fast:
- `M:§3.2` — main text section 3.2
- `A:TableA1` — appendix Table A1
- `EX:frame_id_42` — a specific example in the examples data

Never round a number without noting it ("7,864" not "~8k"; if you must round, write "~8k (exact: 7,864)").
Never fabricate a number not in the source — add it to the NOT-IN-PAPER list instead.

**How to apply:** Read before quoting any number from this project. If a number comes from memory
alone (not verified against a line in the source), flag it as "roughly" and re-verify before it
appears in any deliverable.
