import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface ApiNode {
  id: string;
  type: string;
  meta?: Record<string, unknown>;
}

interface CourseApi {
  course: { code: string };
  nodes: ApiNode[];
}

const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as CourseApi;
const nodesOfType = (type: string) => api.nodes.filter((node) => node.type === type);

describe("assignment 2 spec", () => {
  it("keeps the three digits the repo arrived with in the course code", () => {
    expect(api.course.code).toMatch(/^SLOP[1-46-8]022$/);
  });

  it("schedules teaching across all twelve weeks", () => {
    const weeks = new Set(
      [...nodesOfType("sessions"), ...nodesOfType("lectures")].map((node) => node.meta?.week),
    );
    for (let week = 1; week <= 12; week += 1) {
      expect(weeks.has(week), `no session or lecture scheduled for week ${week}`).toBe(true);
    }
  });

  it("has at least one lecture carrying a real deck, linked from its page", () => {
    const deckLinked = nodesOfType("lectures").filter(
      (node) =>
        typeof node.meta?.slides === "string" && /^\/decks\/[a-z0-9-]+\/$/.test(node.meta.slides as string),
    );
    expect(deckLinked.length, "no lecture links a deck via its slides: field").toBeGreaterThan(0);

    const slug = deckLinked[0].id.replace("lectures/", "");
    const html = readFileSync(resolve(`dist/lectures/${slug}/index.html`), "utf8");
    const deckSlug = (deckLinked[0].meta?.slides as string).replace(/^\/decks\/|\/$/g, "");
    expect(html, `${deckLinked[0].id} page has no link to its deck`).toContain(`decks/${deckSlug}`);
  });

  it("has an assessment scheme that adds up to 100%", () => {
    const total = nodesOfType("assessments").reduce(
      (sum, node) => sum + (Number(node.meta?.weight) || 0),
      0,
    );
    expect(total).toBe(100);
  });
});
