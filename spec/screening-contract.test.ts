import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The promises this course makes that the schemas and the build cannot check.
//
// SLOP4022 claims two things a reader should be able to hold it to: that every
// teaching week before the crit has a film you are required to have watched,
// and that the language is built cumulatively — one subsystem a week, each
// depending on an earlier one. Both are easy to assert on a home page and easy
// to quietly break while authoring twelve weeks. So they are asserted here.

interface ApiNode {
  id: string;
  type: string;
  related?: string[];
  spec?: string[];
  meta?: Record<string, unknown>;
}

interface CourseApi {
  nodes: ApiNode[];
}

const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as CourseApi;

const nodesOfType = (type: string) => api.nodes.filter((node) => node.type === type);
const lectures = nodesOfType("lectures");
const workshops = nodesOfType("sessions");

/** Weeks 1–11 teach; week 12 is the crit and is exempt from the teaching contract. */
const TEACHING_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const CRIT_WEEK = 12;

const weekOf = (node: ApiNode) => node.meta?.week as number | undefined;
const byWeek = (nodes: ApiNode[], week: number) => nodes.filter((node) => weekOf(node) === week);

interface Screening {
  title?: unknown;
  year?: unknown;
}
const screeningOf = (node: ApiNode) => node.meta?.screening as Screening | undefined;

describe("the teaching week is whole", () => {
  it("gives every week from 1 to 12 both a lecture and a workshop", () => {
    for (let week = 1; week <= CRIT_WEEK; week += 1) {
      expect(byWeek(lectures, week).length, `week ${week} has no lecture`).toBeGreaterThan(0);
      expect(byWeek(workshops, week).length, `week ${week} has no workshop`).toBeGreaterThan(0);
    }
  });

  it("states what you must be able to do by the end of every workshop", () => {
    for (const workshop of workshops) {
      expect(
        workshop.spec?.length ?? 0,
        `${workshop.id} has an empty spec: list — the week promises no outcome`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("the screening is compulsory", () => {
  it("names a film, with its year, for every teaching week", () => {
    for (const week of TEACHING_WEEKS) {
      for (const lecture of byWeek(lectures, week)) {
        const screening = screeningOf(lecture);
        expect(screening, `${lecture.id} names no screening`).toBeTruthy();
        expect(
          typeof screening?.title === "string" && screening.title.trim().length > 0,
          `${lecture.id} has a screening with no title`,
        ).toBe(true);
        const year = Number(screening?.year);
        expect(
          Number.isInteger(year) && year >= 1900 && year <= 2030,
          `${lecture.id} has an implausible screening year: ${String(screening?.year)}`,
        ).toBe(true);
      }
    }
  });

  it("keeps the crit week free of a screening", () => {
    for (const lecture of byWeek(lectures, CRIT_WEEK)) {
      expect(
        screeningOf(lecture),
        `${lecture.id} schedules a screening in the crit week — week ${CRIT_WEEK} is for presenting`,
      ).toBeUndefined();
    }
  });

  it("never leans on the same film for more than two weeks", () => {
    const seen = new Map<string, string[]>();
    for (const lecture of lectures) {
      const title = screeningOf(lecture)?.title;
      if (typeof title !== "string") continue;
      const key = title.trim().toLowerCase();
      seen.set(key, [...(seen.get(key) ?? []), lecture.id]);
    }
    for (const [title, where] of seen) {
      expect(
        where.length,
        `"${title}" is the required screening in ${where.length} weeks (${where.join(", ")})`,
      ).toBeLessThanOrEqual(2);
    }
  });
});

describe("the language is built cumulatively", () => {
  it("adds exactly one subsystem a week, and never the same one twice", () => {
    const seen = new Map<string, string[]>();
    for (const week of TEACHING_WEEKS) {
      for (const lecture of byWeek(lectures, week)) {
        const subsystem = lecture.meta?.subsystem;
        expect(
          typeof subsystem === "string" && subsystem.trim().length > 0,
          `${lecture.id} declares no subsystem — say what this week adds`,
        ).toBe(true);
        const key = String(subsystem).trim().toLowerCase();
        seen.set(key, [...(seen.get(key) ?? []), lecture.id]);
      }
    }
    for (const [subsystem, where] of seen) {
      expect(
        where.length,
        `"${subsystem}" is taught in more than one week (${where.join(", ")})`,
      ).toBe(1);
    }
  });

  it("makes every week after the first depend on an earlier one", () => {
    const weekById = new Map(lectures.map((lecture) => [lecture.id, weekOf(lecture)]));
    for (const lecture of lectures) {
      const week = weekOf(lecture);
      if (week === undefined || week <= 1) continue;
      const earlier = (lecture.related ?? []).filter((ref) => {
        const target = weekById.get(ref);
        return target !== undefined && target < week;
      });
      expect(
        earlier.length,
        `${lecture.id} (week ${week}) links back to no earlier lecture — the chain is broken here`,
      ).toBeGreaterThan(0);
    }
  });
});
