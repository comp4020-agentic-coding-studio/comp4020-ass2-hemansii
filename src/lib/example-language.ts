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

/** Consonants, as IPA, as the romanisation used on the site, and where they are made. */
export const CONSONANTS: {
  ipa: string;
  roman: string;
  place: Place;
  manner: Manner;
}[] = [
  { ipa: "t", roman: "t", place: "alveolar", manner: "plosive" },
  { ipa: "k", roman: "k", place: "velar", manner: "plosive" },
  { ipa: "ʔ", roman: "'", place: "glottal", manner: "plosive" },
  { ipa: "n", roman: "n", place: "alveolar", manner: "nasal" },
  { ipa: "s", roman: "s", place: "alveolar", manner: "fricative" },
  { ipa: "ʃ", roman: "sh", place: "post-alveolar", manner: "fricative" },
  { ipa: "h", roman: "h", place: "glottal", manner: "fricative" },
  { ipa: "l", roman: "l", place: "alveolar", manner: "lateral" },
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

export const VOWELS: {
  ipa: string;
  roman: string;
  inherent: boolean;
  height: Height;
  backness: Backness;
}[] = [
  { ipa: "i", roman: "i", inherent: false, height: "close", backness: "front" },
  { ipa: "ɨ", roman: "y", inherent: false, height: "close", backness: "central" },
  { ipa: "ɯ", roman: "u", inherent: false, height: "close", backness: "back" },
  { ipa: "e", roman: "e", inherent: false, height: "close-mid", backness: "front" },
  { ipa: "a", roman: "a", inherent: true, height: "open", backness: "front" },
];

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
