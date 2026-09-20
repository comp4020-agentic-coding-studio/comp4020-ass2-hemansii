# Process overview

## What I built

I built SLOP4022: Nobody Speaks This Yet, a twelve-week course where students
gradually design their own constructed language.
Each week introduces a new part of language design, supported by lectures,
workshops and compulsory film screenings. By the end of the course, students
should have developed a language that has its own sounds, grammar, writing
system and structure.

The course started as a much looser idea around films. I wanted the assignment
to be something I would actually find interesting, and I had been thinking about
movies when I started brainstorming. I asked Claude for possible course ideas
and explored topics such as time loops, the multiverse and orbital mechanics.
The problem with those ideas was that they felt more like a collection of
interesting discussions than a course.

The constructed-language idea became stronger once I realised that it could have
a clear final outcome: students would actually create something by the end of
the semester. Each week could also build on the previous one, which gave the
course a natural structure.

## My process

I first used Claude to create the overall twelve-week structure ([`8276e21`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/8276e21)). I reviewed the topics and kept the sequence
because the weeks depended on each other. Students needed to understand sounds
before they could build words, and they needed words and grammar before they
could produce a complete language ([`711602e`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/711602e)).

The decisions I most wanted to hold went into the harness rather than my
memory. `CLAUDE.md` carries what only a person can judge —
the tone, and never inventing a fact about a real film or language. `spec/` carries the ones a machine can settle: every teaching week
names a screening, no subsystem is taught twice, and week twelve has none
([`65d9416`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/65d9416)).

Rather than completing each week separately from the beginning, I first built
the base course structure. This included the main course page and the different
sections such as lectures, workshops, screenings, assessments, people and
policies ([`9575206`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/9575206)).

This led to several changes. Screenings were not originally treated as their own
clear section, but I realised students needed somewhere they could quickly see
which film belonged to each week ([`39a1d89`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/39a1d89),
[`65aa6ea`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/65aa6ea)). The assessments also needed more work because
the original weighting and descriptions were not balanced clearly enough
([`f6b1a31`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/f6b1a31), [`be7efd1`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/be7efd1)).

I also had to repeatedly adjust the tone of the writing. Claude sometimes
produced content that was too vague, overly serious, or used unnecessarily
complicated phrases. At other times, because the course was based around films,
the writing became too playful and made the course feel less credible
([`c4c8fe4`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/c4c8fe4)). I had to guide it toward a middle ground
where the course still felt creative but also believable as a final-year
university course.

The visual design became another part of the process. Claude was not producing
useful illustrations for the course headers and mostly generated basic shapes or
unsuitable images ([`0d635a8`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/0d635a8)). I used Google Stitch
instead and refined the prompts until I had a consistent illustration style for
each section ([`b55ff21`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-hemansii/commit/b55ff21)).

## What I learned

The main thing I learned was that using Claude effectively still requires a lot
of judgement. It could generate the course content and suggest structures, but I
still had to decide whether the course made sense, whether the weeks built on
each other, whether the assessment structure was believable, and whether the
writing matched the tone I wanted.

If I started again, I would give Claude much clearer instructions earlier about
tone, structure and the relationship between weeks. I would also establish the
visual direction sooner instead of trying to fix it near the end.
