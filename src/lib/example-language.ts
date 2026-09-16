/**
 * The example language.
 *
 * Workshop 3 promises students "ten words in a language none of you have seen"
 * to find morpheme boundaries in. This is that language. It is deliberately not
 * anyone's finished work — it exists so the course can show a worked example of
 * every subsystem it asks students to build, and so the same sentence can be
 * carried from morphology in week 3 to pragmatics in week 11 and visibly change.
 *
 * Its one design fact is the one week 1 uses as its own illustration: the
 * speakers have no lips. That rules out every labial consonant, and — the part
 * students miss — every rounded vowel too, since rounding is done with the lips.
 * Week 1 claims that single fact "will still be shaping your words in week
 * eight". `spec/example-language.test.ts` is what makes that claim true rather than
 * decorative: it rejects an example form containing a sound these mouths cannot
 * produce.
 *
 * The inventory is sized to the artwork. Every glyph in the hero is a stem, a
 * bow and a mark — two bow sides by four stem grades gives eight consonant
 * shapes, and there are five vowel marks, the first of which is no mark at all.
 * So: eight consonants, five vowels, the unmarked one inherent. That is an
 * abugida, one of the five strategies week 8 puts on the table.
 */

/**
 * The columns of the consonant chart, in the order the IPA prints them.
 *
 * Bilabial is here on purpose and stays empty. A chart with the column deleted
 * looks like a small inventory; a chart with the column present and blank is
 * the design brief, visible at a glance. Labiodental is not listed because the
 * IPA's own chart would need a second empty column to make the same point once.
 */
export const PLACES = ["bilabial", "alveolar", "post-alveolar", "velar", "glottal"] as const;

/** The rows, likewise. */
// "lateral" is the row label pedagogical IPA charts use; with one lateral in
// the inventory, spelling out "lateral approximant" buys nothing and costs a
// column of width at 390px.
export const MANNERS = ["plosive", "nasal", "fricative", "lateral"] as const;

export type Place = (typeof PLACES)[number];
export type Manner = (typeof MANNERS)[number];

/**
 * Consonants: what they are, where they are made, and how the script draws them.
 *
 * The script is featural, so the shape is not arbitrary. `side` — which side of
 * the stem the bow sits on — says whether the sound is alveolar. `grade` orders
 * the four consonants on that side by manner, plosive before fricative before
 * nasal before lateral, and within a manner from the front of the mouth
 * backwards. Two rules, eight letters, and a reader who knows them can hear a
 * letter they have never been taught.
 */
export const CONSONANTS: {
  ipa: string;
  roman: string;
  place: Place;
  manner: Manner;
  side: "r" | "l";
  grade: 1 | 2 | 3 | 4;
}[] = [
  { ipa: "t", roman: "t", place: "alveolar", manner: "plosive", side: "r", grade: 1 },
  { ipa: "s", roman: "s", place: "alveolar", manner: "fricative", side: "r", grade: 2 },
  { ipa: "n", roman: "n", place: "alveolar", manner: "nasal", side: "r", grade: 3 },
  { ipa: "l", roman: "l", place: "alveolar", manner: "lateral", side: "r", grade: 4 },
  { ipa: "k", roman: "k", place: "velar", manner: "plosive", side: "l", grade: 1 },
  { ipa: "ʔ", roman: "'", place: "glottal", manner: "plosive", side: "l", grade: 2 },
  { ipa: "ʃ", roman: "sh", place: "post-alveolar", manner: "fricative", side: "l", grade: 3 },
  { ipa: "h", roman: "h", place: "glottal", manner: "fricative", side: "l", grade: 4 },
];

/**
 * Vowels. All five are unrounded, which is not a stylistic preference: rounding
 * is a lip gesture, and these speakers have no lips. `a` is the inherent vowel
 * — the one the script writes with no mark at all.
 */
export const HEIGHTS = ["close", "close-mid", "open"] as const;
export const BACKNESSES = ["front", "central", "back"] as const;

export type Height = (typeof HEIGHTS)[number];
export type Backness = (typeof BACKNESSES)[number];

/**
 * Vowels, and the mark the script hangs above the consonant for each.
 *
 * Dots for the front vowels, one for close and two for close-mid; a rising
 * stroke for the central one; an arc for the back one. `a` takes no mark at
 * all, which is what makes this an abugida rather than an alphabet.
 */
export const VOWELS: {
  ipa: string;
  roman: string;
  inherent: boolean;
  height: Height;
  backness: Backness;
  mark: 0 | 1 | 2 | 3 | 4;
}[] = [
  { ipa: "i", roman: "i", inherent: false, height: "close", backness: "front", mark: 1 },
  { ipa: "ɨ", roman: "y", inherent: false, height: "close", backness: "central", mark: 3 },
  { ipa: "ɯ", roman: "u", inherent: false, height: "close", backness: "back", mark: 4 },
  { ipa: "e", roman: "e", inherent: false, height: "close-mid", backness: "front", mark: 2 },
  { ipa: "a", roman: "a", inherent: true, height: "open", backness: "front", mark: 0 },
];

/**
 * The coda slot takes only these two, and the script writes them with the same
 * mark shapes it uses for vowels, placed below the stem instead of above it.
 * Position carries the difference, which costs the script no new shapes.
 */
export const CODA_MARKS: Record<string, 1 | 3> = { n: 1, l: 3 };

/** Coda is restricted to the two sonorants, which keeps the abugida workable. */
export const SYLLABLE_FORMULA = "CV(n/l)";

/** Morphological type, named the way week 3 names the three options. */
export const MORPHOLOGICAL_TYPE = "agglutinating";

/** Spelled out, because the site never uses the acronyms. */
export const WORD_ORDER = "subject-object-verb";

/**
 * Every grammatical gloss the example uses, expanded. The gloss line renders
 * these as abbreviations with their expansion attached, so a reader who has not
 * met the convention can still read the line;
 * `spec/example-language.test.ts` rejects a gloss that uses one not listed here.
 */
export const GLOSS_ABBREVIATIONS: Record<string, string> = {
  ACC: "accusative — marks the object",
  NEG: "negative",
  YET: "not-yet — only occurs under negation",
  PL: "plural",
  PST: "past",
  Q: "question particle",
};

/** The romanised letters an example form may be spelled with. */
export const ROMAN_LETTERS: string[] = [
  ...CONSONANTS.map((sound) => sound.roman),
  ...VOWELS.map((sound) => sound.roman),
];

/** One written unit: a consonant, its vowel, and optionally a coda. */
export interface Syllable {
  onset: string;
  vowel: string;
  coda?: string;
}

const CONSONANT_ROMANS = [...CONSONANTS.map((sound) => sound.roman)].sort(
  (a, b) => b.length - a.length,
);
const VOWEL_ROMANS = VOWELS.map((sound) => sound.roman);

const isVowelAt = (form: string, index: number) =>
  VOWEL_ROMANS.some((vowel) => form.startsWith(vowel, index));

/**
 * Split a romanised form into the syllables the script actually writes.
 *
 * The formula is CV(n/l), so the only ambiguity is a medial `n` or `l`: it
 * closes the syllable before it unless a vowel follows, in which case it opens
 * the next one. `henlani` is he-n·la-ni; `kene` is ke-ne. Nothing else has to
 * be decided, which is the payoff of a phonotactics this simple — week 8 says
 * the week 5 formula constrains the script more than you would like, and this
 * is that constraint being cashed in rather than paid.
 *
 * Throws rather than guessing: a form the script cannot write is a form the
 * site should not print.
 */
export function syllabify(form: string): Syllable[] {
  const bare = form.replace(/-/g, "");
  const syllables: Syllable[] = [];
  let index = 0;

  while (index < bare.length) {
    const onset = CONSONANT_ROMANS.find((roman) => bare.startsWith(roman, index));
    if (!onset) {
      throw new Error(
        `"${form}" has no consonant at position ${index} ("${bare.slice(index)}") — ` +
          `every syllable of this language starts with one.`,
      );
    }
    index += onset.length;

    const vowel = VOWEL_ROMANS.find((roman) => bare.startsWith(roman, index));
    if (!vowel) {
      throw new Error(
        `"${form}" has no vowel after "${onset}" — the syllable formula is ${SYLLABLE_FORMULA}.`,
      );
    }
    index += vowel.length;

    const next = bare[index];
    const closes = next !== undefined && next in CODA_MARKS && !isVowelAt(bare, index + 1);
    if (closes) {
      syllables.push({ onset, vowel, coda: next });
      index += 1;
    } else {
      syllables.push({ onset, vowel });
    }
  }

  return syllables;
}
