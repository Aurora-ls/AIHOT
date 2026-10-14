import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { CATEGORIES, CATEGORY_TAGS, TOPIC_TAGS } from "@aihot/industry/taxonomy";
import { normalizeStructure, StructureSchema, type AnalyzeInputArticle } from "@aihot/backend/editorial/analyze";

interface EvidenceCase {
  id: string;
  factTitle: string;
  category: string;
  categoryTag: string;
  stageTag: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceText: string;
  evidence: string;
  conditions: string[];
  validSummary: string;
  incorrectClaim: string;
  forbiddenTags: string[];
}

const examples = JSON.parse(readFileSync(new URL("../docs/bcihot/evidence-examples.json", import.meta.url), "utf8")) as {
  cases: EvidenceCase[];
  regulatoryApproval: EvidenceCase & { approvalNumber: string; decisionDate: string };
};
const categories: ReadonlySet<string> = new Set(CATEGORIES.map((category) => category.key));

function normalized(item: EvidenceCase, stageTag = item.stageTag) {
  const article = {
    id: `evidence-${item.id}`,
    revision: 1,
    title: item.sourceTitle,
    url: item.sourceUrl,
    author: null,
    publishedAt: new Date("2026-10-12T00:00:00.000Z"),
    bodyStatus: "ok",
    bodyText: item.sourceText,
    excerpt: null,
    media: [],
    xPost: null,
    source: { name: "Saved public abstract", kind: "rss", tier: "T1", firstParty: false },
  } as AnalyzeInputArticle;
  const data = StructureSchema.parse({
    scope: "single",
    category: item.category,
    tags: [item.categoryTag, stageTag],
    subjects: [],
    fact: {
      title: item.factTitle,
      subject: "原文所述主体",
      action: "报告",
      object: item.stageTag,
      occurredAt: null,
      evidence: item.evidence,
      conditions: item.conditions.map((quote) => ({ quote })),
    },
  });
  return normalizeStructure(data, article);
}

for (const item of examples.cases) {
  test(`${item.id} retains its original evidence and stage boundary`, () => {
    assert.ok(categories.has(item.category), "the primary domain category exists");
    assert.ok(CATEGORY_TAGS.includes(item.categoryTag as never), "the domain label is a primary tag");
    assert.ok(TOPIC_TAGS.includes(item.stageTag as never), "the evidence stage is a topic tag");
    assert.ok(item.sourceText.includes(item.evidence), "evidence quote is present in the saved source text");
    for (const quote of item.conditions) assert.ok(item.sourceText.includes(quote), `condition quote is present: ${quote}`);
    assert.ok(!item.sourceText.includes(item.incorrectClaim), "the counterexample is not stated by the source");
    assert.ok(!item.validSummary.includes(item.incorrectClaim), "the safe summary does not repeat the counterexample");

    const result = normalized(item);
    assert.equal(result.category, item.category);
    assert.ok(result.tags.includes(item.categoryTag));
    assert.ok(result.tags.includes(item.stageTag));
    for (const tag of item.forbiddenTags) assert.ok(!result.tags.includes(tag), `unsupported stage was assigned: ${tag}`);
    assert.equal(result.fact?.evidence, item.evidence);
    assert.deepEqual(result.fact?.conditions.map((condition) => condition.quote), item.conditions);
  });
}

test("FDA PMA positive retains the device, approval number, date and indication limits", () => {
  const item = examples.regulatoryApproval;
  assert.ok(categories.has(item.category));
  assert.ok(item.sourceText.includes(item.evidence));
  for (const quote of item.conditions) assert.ok(item.sourceText.includes(quote), `approval condition is present: ${quote}`);
  assert.ok(item.sourceText.includes(item.approvalNumber));
  assert.ok(item.sourceText.includes("11/14/2013"));
  assert.ok(!item.sourceText.includes(item.incorrectClaim));

  const result = normalized(item);
  assert.ok(result.tags.includes("注册获批"));
  assert.equal(result.fact?.evidence, item.evidence);
  assert.deepEqual(result.fact?.conditions.map((condition) => condition.quote), item.conditions);
  assert.equal(item.approvalNumber, "P100026");
  assert.equal(item.decisionDate, "2013-11-14");
});

test("removing the FDA approval passage drops the approval evidence and leaves status unverified", () => {
  const item = examples.regulatoryApproval;
  const approvedAt = item.sourceText.indexOf(item.evidence);
  assert.ok(approvedAt > 0);
  const metadataOnly = { ...item, sourceText: item.sourceText.slice(0, approvedAt).trim() };
  const result = normalized(metadataOnly, "可用状态待核实");
  assert.ok(result.tags.includes("可用状态待核实"));
  assert.ok(!result.tags.includes("注册获批"));
  assert.equal(result.fact?.evidence, null);
  assert.deepEqual(result.fact?.conditions, []);
});

test("removing a trial's outcome leaves its protocol facts but no clinical-result label", () => {
  const item = examples.cases.find((candidate) => candidate.id === "stroke-rct-results")!;
  const outcomeAt = item.sourceText.indexOf("In this exploratory study, FMA-UE improvement");
  assert.ok(outcomeAt > 0);
  const designOnly = {
    ...item,
    sourceText: item.sourceText.slice(0, outcomeAt).trim(),
    evidence: "This exploratory single-center randomized controlled trial (RCT) enrolled 18 subacute stroke patients",
    conditions: [
      "This exploratory single-center randomized controlled trial (RCT) enrolled 18 subacute stroke patients",
      "Interventions occurred 10 times over 2 weeks.",
    ],
  };
  const result = normalized(designOnly, "人体实验");
  assert.ok(result.tags.includes("人体实验"));
  assert.ok(!result.tags.includes("临床试验结果"));
  assert.ok(!result.tags.includes("注册获批"));
  assert.ok(result.fact?.evidence);
  assert.deepEqual(result.fact?.conditions.map((condition) => condition.quote), designOnly.conditions);
});
