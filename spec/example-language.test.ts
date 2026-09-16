import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BACKNESSES,
  CONSONANTS,
  GLOSS_ABBREVIATIONS,
  HEIGHTS,
  MANNERS,
  PLACES,
  ROMAN_LETTERS,
  VOWELS,
} from "../src/lib/example-language";

// Week 1 tells students that one fact in a design brief — a species with no
// lips — "will still be shaping your words in week eight". That is the course's
// central claim about why the order matters, and for eleven weeks it was a
// sentence nobody could hold the site to.
//
// The worked example is what makes it checkable. Its speakers have no lips, so
// it has no labial consonants and, the part students miss, no rounded vowels
// either — rounding is a lip gesture. Any form the site prints is spelled out
// of one inventory, and this file rejects a form that reaches for a sound those
// mouths cannot produce. Break the design brief in week 11 and week 1 stops
// being true, so the build stops.
//
// Alignment of the two gloss lines is not checked here: `Gloss.astro` throws
// during the build, well before this file runs, and a second implementation of
// the same rule would only be a second thing to keep in step.

interface GlossLine {
  label?: string;
  words: string;
  morphemes: string;
  translation: string;
  note?: string;
}

interface ApiNode {
  id: string;
  type: string;
  meta?: Record<string, unknown>;
}

interface CourseApi {
  nodes: ApiNode[];
}

const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as CourseApi;
const lectures = api.nodes.filter((node) => node.type === "lectures");

const isGlossLine = (value: unknown): value is GlossLine =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as GlossLine).words === "string" &&
  typeof (value as GlossLine).morphemes === "string";

const glossesOf = (node: ApiNode): GlossLine[] => {
  const value = node.meta?.example;
  return Array.isArray(value) ? value.filter(isGlossLine) : [];
};

/** Every lecture that prints a worked example, paired with its glosses. */
const worked = lectures
  .map((lecture) => ({ id: lecture.id, glosses: glossesOf(lecture) }))
  .filter((entry) => entry.glosses.length > 0);

/**
 * Longest first, so the digraph "sh" is consumed before the bare "s" and a
 * legal form is never mis-read as an illegal one.
 */
const LETTERS_BY_LENGTH = [...ROMAN_LETTERS].sort((a, b) => b.length - a.length);

/** Split a form into its romanised letters, returning the first one not in the inventory. */
const firstIllegalLetter = (form: string): string | null => {
  const bare = form.replace(/-/g, "");
  let index = 0;
  while (index < bare.length) {
    const letter = LETTERS_BY_LENGTH.find((candidate) => bare.startsWith(candidate, index));
    if (!letter) return bare[index] as string;
    index += letter.length;
  }
  return null;
};

describe("the example language has the mouth its brief gave it", () => {
  it("prints at least one worked example, or none of this is a contract", () => {
    expect(worked.length, "no lecture carries an example: block").toBeGreaterThan(0);
  });

  it("spells every form out of the eight consonants and five vowels", () => {
    for (const { id, glosses } of worked) {
      for (const gloss of glosses) {
        for (const form of gloss.words.trim().split(/\s+/)) {
          const illegal = firstIllegalLetter(form);
          expect(
            illegal,
            `${id} writes "${form}", which needs "${illegal}" — not one of ${ROMAN_LETTERS.join(" ")}. ` +
              `These speakers have no lips: no labial consonants, and no rounded vowels either.`,
          ).toBeNull();
        }
      }
    }
  });

  it("keeps the inventory the size of the script in the artwork", () => {
    // Two bow sides by four stem grades is eight consonant shapes; there are
    // five vowel marks, the first of which is no mark at all. A ninth consonant
    // would have nothing to be written with.
    expect(CONSONANTS.length, "the hero artwork can only draw eight consonants").toBe(8);
    expect(VOWELS.length, "the hero artwork carries five vowel marks").toBe(5);
    expect(
      VOWELS.filter((vowel) => vowel.inherent).length,
      "an abugida has exactly one inherent vowel — the one written with no mark",
    ).toBe(1);
  });
});

describe("the glosses can be read by someone who has not met the convention", () => {
  it("expands every grammatical abbreviation it uses", () => {
    for (const { id, glosses } of worked) {
      for (const gloss of glosses) {
        const parts = gloss.morphemes.trim().split(/[\s-]+/);
        for (const part of parts) {
          if (!/^[A-Z][A-Z0-9.]*$/.test(part)) continue;
          expect(
            Object.hasOwn(GLOSS_ABBREVIATIONS, part),
            `${id} glosses a morpheme "${part}", which is not expanded in src/lib/example-language.ts — ` +
              `it will render as bare capitals a reader cannot look up`,
          ).toBe(true);
        }
      }
    }
  });
});

describe("it is one language, carried across the weeks", () => {
  /** The non-grammatical glosses — the senses, which are the vocabulary. */
  const rootsOf = (glosses: GlossLine[]) =>
    new Set(
      glosses
        .flatMap((gloss) => gloss.morphemes.trim().split(/[\s-]+/))
        .filter((part) => part.length > 0 && !/^[A-Z][A-Z0-9.]*$/.test(part)),
    );

  it("shares vocabulary between the weeks that print it", () => {
    // Four unrelated example sentences would be four languages, and the point
    // of carrying one sentence from morphology to pragmatics is that a reader
    // can watch the same words lose and gain structure.
    expect(worked.length, "only one week prints an example — nothing is being carried").toBeGreaterThan(1);

    for (const entry of worked) {
      const mine = rootsOf(entry.glosses);
      const shared = worked
        .filter((other) => other.id !== entry.id)
        .some((other) => [...rootsOf(other.glosses)].some((root) => mine.has(root)));
      expect(
        shared,
        `${entry.id} shares no vocabulary with any other week's example — it is a different language`,
      ).toBe(true);
    }
  });
});

describe("the essay week stays clear of the language", () => {
  it("prints no worked example in week 9", () => {
    // "What Arrival Gets Wrong" says of itself: no glossing, no conlang
    // material, nothing about your own language. The lecture that sets it up
    // has to hold the same line, or the assessment page is lying.
    for (const lecture of lectures) {
      if (lecture.meta?.week !== 9) continue;
      expect(
        glossesOf(lecture).length,
        `${lecture.id} prints a worked example, but the week 9 essay asks for no conlang material`,
      ).toBe(0);
    }
  });
});

describe("the chart draws the brief", () => {
  /** The rounded vowels of the IPA. Every one of them needs lips. */
  const ROUNDED = new Set(["u", "ʊ", "o", "ɔ", "ɒ", "y", "ʏ", "ø", "œ", "ɶ", "ɵ", "ɞ", "ʉ"]);

  it("keeps the bilabial column on the chart", () => {
    // Deleting the empty column would make the inventory look merely small.
    // Drawing it and leaving it blank is the design brief, without a caption.
    expect(
      PLACES.includes("bilabial"),
      "the consonant chart no longer draws a bilabial column, so its emptiness says nothing",
    ).toBe(true);
  });

  it("puts no consonant in it", () => {
    for (const sound of CONSONANTS) {
      expect(
        sound.place,
        `/${sound.ipa}/ is bilabial — these speakers have no lips to make it with`,
      ).not.toBe("bilabial");
    }
  });

  it("rounds no vowel", () => {
    for (const vowel of VOWELS) {
      expect(
        ROUNDED.has(vowel.ipa),
        `/${vowel.ipa}/ is rounded, and rounding is a lip gesture — this is the half of the ` +
          `no-lips constraint that is easy to forget`,
      ).toBe(false);
    }
  });

  it("gives every phoneme a cell to appear in", () => {
    // A sound whose place or manner is not a row or column of the chart is in
    // the inventory, passes every other check, and is invisible on the page.
    for (const sound of CONSONANTS) {
      expect(PLACES, `/${sound.ipa}/ has no column`).toContain(sound.place);
      expect(MANNERS, `/${sound.ipa}/ has no row`).toContain(sound.manner);
    }
    for (const vowel of VOWELS) {
      expect(BACKNESSES, `/${vowel.ipa}/ has no column`).toContain(vowel.backness);
      expect(HEIGHTS, `/${vowel.ipa}/ has no row`).toContain(vowel.height);
    }
  });

  it("romanises every phoneme distinctly, so a form can be read back", () => {
    const seen = new Map<string, string[]>();
    for (const sound of [...CONSONANTS, ...VOWELS]) {
      seen.set(sound.roman, [...(seen.get(sound.roman) ?? []), sound.ipa]);
    }
    for (const [roman, ipa] of seen) {
      expect(
        ipa.length,
        `⟨${roman}⟩ spells ${ipa.length} different phonemes (${ipa.join(", ")}) — the crit asks a ` +
          `stranger to read a sentence correctly from the script alone`,
      ).toBe(1);
    }
  });
});
