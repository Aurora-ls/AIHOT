// Populate only a fresh isolated review database, with hand-reviewed replay material.
// Publication transport and visual review only: no collector, worker or model request is started.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { config } from "@aihot/backend/config";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { publishArticle } from "@aihot/backend/publication/publish";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import { isoWeekLabel, beijingDate } from "@aihot/contracts/time";

const database = new URL(config.databaseUrl).pathname.slice(1);
if (!/_(test|ci)$/.test(database)) throw new Error("review fixtures require a *_test or *_ci database");
if (config.modelCallsEnabled || process.env.COLLECT_ENABLED === "true" || config.feishuContentPushEnabled || config.indexNowSubmitEnabled) {
  throw new Error("review fixtures require model, collection and push valves off");
}

interface Example {
  id?: string; factTitle: string; category: string; categoryTag: string; stageTag: string;
  sourceTitle: string; sourceUrl: string; sourceText: string; evidence: string; conditions: string[]; validSummary: string;
}
const examples = JSON.parse(readFileSync(new URL("evidence-examples.json", import.meta.url), "utf8")) as {
  cases: Example[]; regulatoryApproval: Example;
};
const rows = [...examples.cases, { ...examples.regulatoryApproval, id: "fda-pma-p100026" }];
const sourceId = "bcihot-isolated-review-examples";
const at = new Date(Date.now() - 5 * 60_000);
const replayNote = "隔离审查示例：原文摘录由人工核对，列表日期仅为本次回放时间，不表示新发表、新审批或真实模型生成。";

try {
  const [counts] = await sql`SELECT (SELECT count(*) FROM articles)::int AS articles, (SELECT count(*) FROM reports)::int AS reports`;
  if (counts!.articles || counts!.reports) throw new Error("review fixture seeding requires no existing articles or reports; use a fresh test database");
  // The existing seed is preserved; all 21 candidates are paused by the industry configuration.
  execFileSync(process.execPath, ["scripts/seed.ts"], { stdio: "inherit" });
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, enabled, site_fulltext, syndicate_fulltext, next_fetch_at)
    VALUES (${sourceId}, '隔离审查示例：人工核对原文回放', 'external', 'T2', 'editorial', false, false, false, '2100-01-01')`;
  const citations: Array<{ itemId: string; title: string; summary: string; sourceName: string; sourceUrl: string; publishedAt: string; category: string }> = [];
  for (const example of rows) {
    const title = `隔离示例：${example.factTitle}`;
    const summary = `${example.validSummary} ${replayNote}`;
    const { articleId } = await upsertMaterial({ sourceId, url: example.sourceUrl, title: example.sourceTitle,
      bodyText: example.sourceText, bodyStatus: "ok", via: "fetch", publishedAt: at, discoveredAt: at });
    await sql`UPDATE articles SET grouping_status='complete',grouped_at=${at},selection_adds_value=true WHERE id=${articleId}`;
    await sql`INSERT INTO analyses (article_id,input_revision,origin,relevance,category,tags,title_zh,summary_zh,score,selected,output)
      VALUES (${articleId},1,'rule','pass',${example.category},${[example.categoryTag,example.stageTag]},${title},${summary},null,true,
        ${sql.json({ scope: "single", fixture: true, fact: { title: example.factTitle, evidence: example.evidence,
          conditions: example.conditions.map((quote) => ({ quote })) } })})`;
    await publishArticle(articleId, { now: at, releasedAt: at });
    citations.push({ itemId: articleId, title, summary, sourceName: "隔离审查示例：人工核对原文回放", sourceUrl: example.sourceUrl,
      publishedAt: at.toISOString(), category: example.category });
  }

  const labels = [...new Set(CATEGORIES.map((category) => category.section))];
  const grouped = labels.map((label) => ({ label, items: citations.filter((entry) => CATEGORIES.find((category) => category.key === entry.category)?.section === label) }))
    .filter((section) => section.items.length);
  const day = beijingDate(Date.now());
  for (const [kind, key] of [["daily", day], ["weekly", isoWeekLabel(day)], ["monthly", day.slice(0, 7)]] as const) {
    const content = { title: "隔离审查示例：科研证据与可用状态", lead: { title: "隔离审查示例：科研证据与可用状态", leadParagraph: replayNote },
      overview: replayNote, highlights: [], metrics: { totalEvents: citations.length },
      ...(kind === "daily" ? { sections: grouped } : { themes: grouped.map((group) => ({ heading: group.label, storyRefs: group.items })) }) };
    await sql`INSERT INTO reports (kind,key,window_start,window_end,content,generated_at,origin)
      VALUES (${kind},${key},${at},${new Date()},${sql.json(content)},${new Date()},'manual')`;
  }
  const [paused] = await sql`SELECT count(*)::int AS count FROM sources WHERE id LIKE 'bci-%' AND enabled=false AND site_fulltext=false AND syndicate_fulltext=false`;
  console.log(`review: ${citations.length} saved examples, 3 clearly labelled report fixtures, ${paused!.count} paused BCI candidates`);
} finally {
  await stopBoss();
  await closeDb();
}
