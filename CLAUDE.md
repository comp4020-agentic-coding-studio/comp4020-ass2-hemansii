# SLOP4022 — Nobody Speaks This Yet

## The course

Twelve weeks building a working constructed language. Eleven compulsory
screenings, one linguistic subsystem added per week, then a crit in week 12
where students read a text aloud in a language that did not exist in February.

The order is the argument: phonology (wk 2) → morphology (3) → syntax (4) →
phonotactics (5) → borrowing (6) → contact (7) → orthography (8) → semantics (9)
→ acquisition (10) → pragmatics (11). Week 6 is impossible without week 2. This
is the one thing that makes the course a course rather than eleven film nights,
so it is enforced mechanically in `spec/screening-contract.test.ts`, not left to
good intentions.

## Rules

### Never invent a fact about a real thing

The films, the languages and the people are all real. Marc Okrand built Klingon,
David J. Peterson built Dothraki, Paul Frommer built Na'vi, Tolkien built Quenya
and Sindarin and then built a world for them to be spoken in. Verify a title and
release year before committing it. If a linguistic claim can't be checked, cut
the sentence — a wrong fact about Tengwar on a public site is worse than a
thinner page.

This applies hardest to the week 9 essay material. *Arrival* makes a strong
Sapir–Whorf claim; the actual state of linguistic relativity is more limited and
more interesting. Represent both accurately.

### One subsystem a week, and the chain must hold

Every lecture in weeks 1–11 declares exactly one `subsystem`, and no two weeks
declare the same one. Every lecture from week 2 on carries a `related:` edge to
an earlier week's lecture. Adding a week means saying what it adds and what it
depends on — if neither is answerable, it isn't a week.

### Every teaching week names its screening

Weeks 1–11 carry `screening: {title, year}`. Week 12 deliberately does not: it
is the crit, and it stays the crit. "Recommended viewing" is not a thing in this
course — the assessment (Weekly Build Log, 15%) exists precisely so the
compulsory screening is real rather than decorative. Don't soften that language
anywhere on the site.

### Voice

The subject sounds ridiculous and the treatment is completely serious. That gap
is the whole register — so **never wink**. No "yes, really," no self-aware
asides about how niche this is, no exclamation marks.

- Write to a student who has to be somewhere on Thursday. Second person, present
  tense, concrete instructions.
- Banned outright: *delve, tapestry, journey, dive into, unlock, embark,
  landscape (figurative), in today's world, it's not just X — it's Y.*
- No sentence that would survive being pasted into a different course's page. If
  it would, it is carrying no information and should be cut.
- Prefer the specific over the summarising: "bring a printed IPA chart" beats
  "come prepared."

### Quote any frontmatter value containing a colon

`title: Star Trek VI: The Undiscovered Country` is not valid YAML — the parser
reads the second colon as a mapping and the build fails with "a colon is
missed." Film titles and subtitled descriptions hit this constantly, so quote
the value: `title: "Star Trek VI: The Undiscovered Country"`. In a description,
prefer an em dash over a colon.

### Links and the base path

Never write a root-absolute `href="/…"` in an `.astro` file. It skips Astro's
base handling, works on localhost, and 404s on the deployed site. Markdown links
and theme components are rewritten automatically; use those.

### The platform is fixed

Don't touch the Slop branding, the four content collections and their keys, the
build pipeline in `astro.config.ts`, or the generated API. Adding is allowed —
a new page, a new component. Changing the collection key `sessions` is not, even
though students see it labelled "Workshops."

## Working method

Author one week at a time and read it back as a student would before moving on.
Commit in batches that mean something (weeks 1–4, then 5–8, then 9–12) — the
commit history is marked evidence, so a single dump of twenty-four files is a
worse artefact than four honest commits.

Run `pnpm check` before every commit. `pnpm check:evidence` is the submission
gate: it fails while any `STARTER_CONTENT` comment survives in `src/`, while any
of the four starter images still hashes to the original, or while `PROCESS.md`
lacks commit citations that resolve.
