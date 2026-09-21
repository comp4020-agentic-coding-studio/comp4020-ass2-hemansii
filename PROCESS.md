# Process overview

## What I built

I built SLOP4022: Nobody Speaks This Yet, a twelve-week course in which students
design their own constructed language. Each week adds one part of language
design, supported by lectures, workshops and compulsory screenings. By week
twelve a student has a language with its own sounds, grammar and writing
system.

The course started as a looser idea about films. I asked Claude for options and
explored time loops, the multiverse and orbital mechanics, but each of those was
a set of interesting discussions rather than a course. Constructed language won
because it has an outcome — students finish the semester holding something they
built — and because each week can build on the one before it.

## My process

I first used Claude to create the overall twelve-week structure
([`8276e21`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/8276e21)). I kept the sequence because the weeks depend
on each other: you cannot coin a word without sounds, word shapes and a
derivation rule, so week 6 is impossible without weeks 2, 3 and 5. That chain is
what makes this a course rather than eleven film nights, so I put it in the data
as `requires:` edges and wrote a test that fails if every week depends only on
the one before it — a straight line would mean I had not thought about it
([`711602e`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/711602e)).

The decisions I most wanted to hold went into the harness rather than my memory.
`CLAUDE.md` carries what only a person can judge: the tone, and never inventing
a fact about a real film or language. `spec/` carries what a machine can settle
— every teaching week names a screening, no subsystem is taught twice, week
twelve has none
([`65d9416`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/65d9416)).

Some rules could not be automated. Whether the writing sounds right, or whether
a week is convincing as university teaching, is a judgement I had to make
myself, so those stayed in `CLAUDE.md` as written guidance. Anything a program
could check went into `spec/` instead: a week missing its screening, a topic
taught twice, a link pointing nowhere.

I built the base structure first, then read it back as a prospective student
([`9575206`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/9575206)). That is what exposed the screenings problem:
each film was named on its own week page, which works for someone already
enrolled and not for someone deciding whether to enrol, since seeing the full
list meant opening eleven pages. A separate section showed all eleven at once
([`39a1d89`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/39a1d89), [`65aa6ea`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/65aa6ea)). The same
read-through showed the assessment weightings were unbalanced
([`f6b1a31`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/f6b1a31), [`be7efd1`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/be7efd1)).

Tone took the most iterations. Claude's drafts were either vague and
over-serious or, because the course is built on films, too playful to read as a
real course ([`c4c8fe4`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/c4c8fe4)). I had to steer it
between the two.

Claude's illustrations for the headers were unusable ([`0d635a8`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/0d635a8)),
so I made them in Google Stitch, refining the prompts until the six matched
([`b55ff21`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/b55ff21)).

## What I learned

What I learned was that the harness is what makes the judgement repeatable. I
could not hold twelve weeks of decisions in my head, so the checks held them
instead: the spec tests failed for four commits while I wrote the weeks, which
meant the content was written against a specification rather than approved
afterwards. What a test could not settle — whether a week read as credible,
whether the tone was right — I checked by reading each page back as a
student.

If I started again, I would write the tone rules before the first week rather
than after the fourth, and settle the visual direction early instead of near
the end.
