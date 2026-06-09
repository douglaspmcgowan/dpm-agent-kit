# Profile knowledge base (blank skeleton)

A reusable pattern from the **dpm-sites hub**: a small corpus of markdown files that give *any* agent
a consistent, factual picture of you — so when it drafts outreach, a bio, portfolio copy, a
fellowship answer, or a recommendation letter, it pulls from one source of truth instead of
improvising (and fabricating).

## How to use it

1. Fill in each file below with your real info. Keep facts atomic and verifiable.
2. Put the folder somewhere the agent can read on demand (a repo, or your vault).
3. Add a line to your `CLAUDE.md`: *"For anything I'll publish or send about myself, read the profile
   corpus at `<path>` first; never fabricate facts about me — if it's not in the corpus, ask."*
4. Pair it with a `voice.md` (your writing voice) so drafts actually sound like you.

## The core discipline

Three rules keep this corpus trustworthy as it grows:

- **One canonical home per fact.** Every fact lives in exactly one file. Your GPA lives in
  `education.md`, your design-team peak size in `signature-numbers.md`, your advisor in
  `research.md` and `people.md`'s relationship note. When a draft needs a fact, the agent goes to its
  home file. Anywhere else the fact appears (the cheat sheet, a pitch), it's a pointer back to that
  home, never an independent copy that can drift.
- **Audience-keyed framing.** The facts stay fixed; the framing flexes. `fellowship-talking-points.md`
  and the audience-specific sections in `research.md` and `awards-honors.md` reframe the *same* record
  for different funders, panels, and recruiters. The agent retunes emphasis per audience and leaves
  the underlying numbers and dates untouched.
- **`content-mapping.md` is the consistency auditor.** It records which source backs each recurring
  claim and flags discrepancies between files. When two files disagree, the source named there wins.
  Run an audit against it before any draft ships.

## Why a knowledge base beats stuffing it in CLAUDE.md

- It's read **on demand**, so it doesn't bloat every-session context.
- It's **structured**, so the agent can cite which file a fact came from.
- It's the anti-fabrication backstop: "if it's not in the corpus, say so" only works if there's a
  corpus.

## Files

| File | Holds |
|---|---|
| `about.md` | Long-form narrative spine: motto, background, what you've built, vision, how you work. |
| `bio.md` | Short + long bios, one-liner, current role. |
| `headline-and-pitch.md` | Headlines and elevator pitches at 15s / 30s / 60s / 2min; cold-email openers. |
| `experience.md` | Full chronological record of roles, dates, what you did, outcomes. |
| `education.md` | Degrees, institutions, dates, honors, coursework, study abroad. |
| `research.md` | Current and past research, aims, intellectual merit, audience framing, publications. |
| `skills.md` | Technical + domain skills, tiered, with honest gaps. |
| `leadership-impact.md` | Leadership theory and each role told as a phased arc. |
| `awards-honors.md` | Awards, fellowships, scholarships, recognition; in-flight applications kept separate. |
| `values-and-vision.md` | Ranked core values, what impact means, the multi-year plan, lines you won't cross. |
| `stories.md` | Reusable anecdotes (STAR format) for interviews/essays. |
| `signature-numbers.md` | The specific metrics you cite (and their source — never round or invent). |
| `people.md` | Your network: advisors, collaborators, recommenders; who can vouch for what. |
| `fellowship-talking-points.md` | Per-program framing: lean into / avoid / lines that work / files to pull. |
| `quick-reference.md` | One-page cheat sheet; every entry points back to its canonical home file. |
| `content-mapping.md` | The consistency auditor: which source backs which claim; discrepancies to fix. |
| `profile.json` | Machine-readable summary an agent can parse. |

All files ship blank with placeholder fields. Nothing here is real — it's a starter.

## Refresh cadence

Update a file the moment a fact changes (new role, new award, a number moves). After any update, check
`content-mapping.md` to confirm nothing downstream now disagrees with the canonical home.
