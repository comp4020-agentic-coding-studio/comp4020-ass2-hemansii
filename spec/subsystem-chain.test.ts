import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The order is the argument, and this file is where that stops being rhetoric.
//
// `screening-contract.test.ts` already checks that each week links back to some
// earlier week. That is a weak reading of the claim: every week pointing at the
// one before it satisfies it, and a straight line is exactly what the course
// says it is not. The site tells students that week 6 is impossible without
// week 2 — you cannot borrow a word into a language whose sounds you have not
// chosen — so the real dependencies have to be in the data, not just the prose.
//
// `requires:` carries them. It is the edge the week pages render as "Builds on"
// and invert into "Feeds into", so anything asserted here is visible to a
// reader; a dependency that is wrong is wrong on the page, not just in a test.
//
// What is deliberately not checked: whether a dependency is *true*. That one
// only a linguist reading the week can judge, and it belongs in the crit.

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

const weekOf = (node: ApiNode) => node.meta?.week as number | undefined;

/**
 * Node ids in the API are full refs — "lectures/week-06" — and a `requires:`
 * entry may be written either way. Both sides are reduced to the bare slug so
 * the comparison never depends on which form the author used.
 */
const toSlug = (ref: string) => ref.replace(/^lectures\//, "");

const requiresOf = (node: ApiNode): string[] => {
  const value = node.meta?.requires;
  if (!Array.isArray(value)) return [];
  return value.filter((ref): ref is string => typeof ref === "string").map(toSlug);
};

const weekBySlug = new Map(lectures.map((lecture) => [toSlug(lecture.id), weekOf(lecture)]));

/** Week 1 is the design brief: it is the root, and depends on nothing. */
const ROOT_WEEK = 1;

/** More than this and the block stops being a claim and starts being a bibliography. */
const MAX_DEPENDENCIES = 3;

describe("every week says what it depends on", () => {
  it("declares at least one requirement for every week after the first", () => {
    for (const lecture of lectures) {
      const week = weekOf(lecture);
      if (week === undefined || week <= ROOT_WEEK) continue;
      expect(
        requiresOf(lecture).length,
        `${lecture.id} (week ${week}) declares no requires: — say what it is impossible without`,
      ).toBeGreaterThan(0);
    }
  });

  it("leaves the first week depending on nothing", () => {
    for (const lecture of lectures.filter((node) => weekOf(node) === ROOT_WEEK)) {
      expect(
        requiresOf(lecture),
        `${lecture.id} is week ${ROOT_WEEK} and cannot build on an earlier week`,
      ).toEqual([]);
    }
  });

  it("names no more than three requirements a week", () => {
    for (const lecture of lectures) {
      const required = requiresOf(lecture);
      expect(
        required.length,
        `${lecture.id} requires ${required.length} weeks (${required.join(", ")}) — name the ones it is actually impossible without`,
      ).toBeLessThanOrEqual(MAX_DEPENDENCIES);
    }
  });

  it("never names the same requirement twice", () => {
    for (const lecture of lectures) {
      const required = requiresOf(lecture);
      expect(new Set(required).size, `${lecture.id} lists a requirement twice`).toBe(
        required.length,
      );
    }
  });
});

describe("the dependencies point backwards and resolve", () => {
  it("requires only lectures that exist", () => {
    for (const lecture of lectures) {
      for (const slug of requiresOf(lecture)) {
        expect(
          weekBySlug.has(slug),
          `${lecture.id} requires "${slug}", which is not a lecture`,
        ).toBe(true);
      }
    }
  });

  it("requires only earlier weeks, so the build order can never cycle", () => {
    for (const lecture of lectures) {
      const week = weekOf(lecture);
      if (week === undefined) continue;
      for (const slug of requiresOf(lecture)) {
        const required = weekBySlug.get(slug);
        if (required === undefined) continue;
        expect(
          required,
          `${lecture.id} (week ${week}) requires ${slug} (week ${required}) — a week cannot depend on itself or on one that has not happened`,
        ).toBeLessThan(week);
      }
    }
  });

  it("traces every week back to the design brief", () => {
    for (const lecture of lectures) {
      const week = weekOf(lecture);
      if (week === undefined || week <= ROOT_WEEK) continue;

      const seen = new Set<string>();
      const queue = [...requiresOf(lecture)];
      let reachedRoot = false;
      while (queue.length > 0) {
        const slug = queue.shift() as string;
        if (seen.has(slug)) continue;
        seen.add(slug);
        if (weekBySlug.get(slug) === ROOT_WEEK) {
          reachedRoot = true;
          break;
        }
        const next = lectures.find((node) => toSlug(node.id) === slug);
        if (next) queue.push(...requiresOf(next));
      }

      expect(
        reachedRoot,
        `${lecture.id} (week ${week}) does not trace back to week ${ROOT_WEEK} — it is detached from the build`,
      ).toBe(true);
    }
  });
});

describe("the chain is a chain, not a queue", () => {
  it("has weeks that reach further back than the week before them", () => {
    const longEdges = lectures.flatMap((lecture) => {
      const week = weekOf(lecture);
      if (week === undefined) return [];
      return requiresOf(lecture)
        .map((slug) => weekBySlug.get(slug))
        .filter((required): required is number => required !== undefined && required < week - 1)
        .map((required) => `${lecture.id}→week ${required}`);
    });

    expect(
      longEdges.length,
      "every week depends only on the one before it — that is a queue of film nights, not a language being built",
    ).toBeGreaterThan(0);
  });
});
