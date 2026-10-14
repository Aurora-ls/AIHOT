import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { exportMarkdown } from "@aihot/backend/publication/detail";
import { itemFeed } from "@aihot/backend/publication/feeds";
import { latestAnswer } from "@aihot/backend/publication/agent";
import { v1Items } from "@aihot/backend/publication/v1";
import { publishArticle } from "@aihot/backend/publication/publish";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { buildApp } from "../apps/api/src/app.ts";
import { ITEM_TYPES } from "@aihot/industry/taxonomy";
import { MCP_TOOL_NAMES } from "@aihot/contracts/mcp";
import { normalizeStructure, StructureSchema, type AnalyzeInputArticle } from "@aihot/backend/editorial/analyze";
import { config } from "@aihot/backend/config";

interface EvidenceExample {
  id?: string;
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
}

// These saved, hand-reviewed summaries exercise publication transport, not model semantics.
// Their replay timestamps keep the fixture visible; event dates remain in the original evidence.
const examples = JSON.parse(readFileSync(new URL("../docs/bcihot/evidence-examples.json", import.meta.url), "utf8")) as {
  cases: EvidenceExample[];
  regulatoryApproval: EvidenceExample;
};
const outletExamples = [...examples.cases, { ...examples.regulatoryApproval, id: "fda-pma-p100026" }];
const exampleIds = new Map<string, string>();
let web: ReturnType<typeof spawn> | undefined;
let webOrigin = "";
let webLogs = "";

const app = await buildApp();
const marker = tag();
const sourceId = `bcihot-outlets-${marker}`;
const title = `EEG 离线评测范围 ${marker}`;
const summary = "该研究在 ear-EEG 数据上离线比较了 23 种架构；结果限于统一验证框架和三个记录日，不代表在线患者控制。";
const stage = "方法/仿真或离线评测";
let articleId = "";
const now = new Date();

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, site_fulltext, syndicate_fulltext, owner_entity_id, next_fetch_at)
    VALUES (${sourceId}, 'BrainGate study fixture', 'rss', 'T1', 'editorial', false, false, 'braingate', '2100-01-01')`;
  const material = await upsertMaterial({
    sourceId, url: `https://example.org/bcihot/${marker}`, title, bodyText: "Offline EEG benchmark; 23 architectures; same validation framework.",
    bodyStatus: "ok", via: "fetch", publishedAt: now,
  });
  articleId = material.articleId;
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, tags, title_zh, summary_zh, score, selected, output)
    VALUES (${articleId}, 1, 'rule', 'pass', 'decoding-signal', ${["解码与信号处理", "论文/研究", "EEG", stage]}, ${title}, ${summary}, 84, false,
      ${sql.json({ scope: "single", fact: { title, subject: "研究团队", action: "比较", object: "EEG 解码架构", evidence: "Specifically, we present an offline benchmark of 23 deep neural network architectures.", conditions: [{ quote: "evaluated under an identical validation framework." }] } })})`;
  await publishArticle(articleId, { releasedAt: new Date(now.getTime() - 60_000) });

  for (const example of outletExamples) {
    const structure = normalizeStructure(StructureSchema.parse({
      scope: "single", category: example.category, tags: [example.categoryTag, example.stageTag], subjects: [],
      fact: { title: example.factTitle, subject: "原文所述主体", action: "报告", object: example.stageTag, occurredAt: null,
        evidence: example.evidence, conditions: example.conditions.map((quote) => ({ quote })) },
    }), {
      id: example.id!, revision: 1, title: example.sourceTitle, url: example.sourceUrl, author: null,
      publishedAt: now, bodyStatus: "ok", bodyText: example.sourceText, excerpt: null, media: [], xPost: null,
      source: { name: "Saved evidence replay", kind: "rss", tier: "T1", firstParty: false },
    } as AnalyzeInputArticle);
    assert.equal(structure.fact?.evidence, example.evidence);
    assert.deepEqual(structure.fact?.conditions.map((condition) => condition.quote), example.conditions);
    const saved = await upsertMaterial({ sourceId, url: `https://example.org/bcihot/${marker}/${example.id}`,
      title: example.sourceTitle, bodyText: example.sourceText, bodyStatus: "ok", via: "fetch", publishedAt: now });
    exampleIds.set(example.id!, saved.articleId);
    await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, tags, title_zh, summary_zh, score, selected, output)
      VALUES (${saved.articleId}, 1, 'rule', 'pass', ${structure.category}, ${structure.tags}, ${example.factTitle},
        ${example.validSummary}, 84, false, ${sql.json(structure)})`;
    await publishArticle(saved.articleId, { releasedAt: new Date(now.getTime() - 60_000) });
  }

  // Render actual web pages over HTTP in front of this API, with no model or collection process.
  const address = new URL(await app.listen({ port: 0, host: "127.0.0.1" }));
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  webOrigin = `http://127.0.0.1:${port}`;
  web = spawn(process.execPath, [fileURLToPath(new URL("../apps/web/server.ts", import.meta.url))], {
    env: { ...process.env, WEB_PORT: String(port), SITE_URL: webOrigin, API_BASE_URL: address.origin,
      TRUST_PROXY: "false", COLLECT_ENABLED: "false", MODEL_CALLS_ENABLED: "false" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`web did not start: ${webLogs}`)), 15_000);
    web!.once("exit", () => { clearTimeout(timeout); reject(new Error(`web exited: ${webLogs}`)); });
    web!.stderr!.on("data", (chunk) => { webLogs += String(chunk); });
    web!.stdout!.on("data", (chunk) => {
      if (String(chunk).includes('"msg":"web started"')) { clearTimeout(timeout); resolve(); }
    });
  });
});

after(async () => {
  if (web && web.exitCode === null) {
    const stopped = once(web, "exit");
    web.kill("SIGTERM");
    await stopped;
  }
  await app.close(); await stopBoss(); await closeDb();
});

test("the same evidence scope reaches website, API, RSS, Markdown and Agent/MCP answers", async () => {
  assert.ok(ITEM_TYPES.includes("research_paper"));
  const web = await app.inject(`/api/site/items/${articleId}`);
  assert.equal(web.statusCode, 200);
  const webItem = JSON.parse(web.body) as { summary: string; tags: string[] };
  assert.equal(webItem.summary, summary);
  assert.ok(webItem.tags.includes(stage));

  const api = await app.inject("/api/v1/items?mode=all&window=7d");
  assert.equal(api.statusCode, 200);
  const apiItem = (JSON.parse(api.body) as { items: Array<{ id: string; summary: string }> }).items.find((item) => item.id === articleId);
  assert.equal(apiItem?.summary, summary);

  const rss = await itemFeed("all", null, { now: new Date(Date.now() + 60_000) });
  assert.ok(rss.includes(summary));

  const markdown = await exportMarkdown(articleId);
  assert.ok(markdown?.body.includes(summary));

  const agent = await app.inject("/api/v1/agent/latest?mode=all&window=7d");
  assert.equal(agent.statusCode, 200);
  assert.ok(agent.body.includes(summary));
  const mcp = latestAnswer(await v1Items({ mode: "all", window: "7d", by: "timeline", category: null, q: null, limit: 10, cursor: null }),
    { mode: "all", window: "7d", category: null, limit: 10 });
  assert.ok(mcp.includes(summary));
});

for (const example of outletExamples) test(`${example.id}: original scope survives actual website, API, RSS, Markdown and MCP routes`, async () => {
  const id = exampleIds.get(example.id!)!;
  const response = await fetch(`${webOrigin}/items/${id}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(example.validSummary), "the rendered page retains the scoped summary");
  assert.ok(!html.includes(example.incorrectClaim), "the page cannot introduce the overclaim");

  const detail = await app.inject(`/api/site/items/${id}`);
  assert.equal(detail.statusCode, 200);
  const item = JSON.parse(detail.body) as { summary: string; category: string; tags: string[] };
  assert.equal(item.summary, example.validSummary);
  assert.equal(item.category, example.category);
  assert.ok(item.tags.includes(example.stageTag));

  const api = await app.inject("/api/v1/items?mode=all&window=7d&limit=30");
  assert.equal(api.statusCode, 200);
  const apiItem = api.json<{ items: Array<{ id: string; summary: string; category: string }> }>().items.find((entry) => entry.id === id);
  assert.equal(apiItem?.summary, example.validSummary);
  assert.equal(apiItem?.category, example.category);
  assert.ok(apiItem && !("tags" in apiItem), "the public v1 payload keeps its existing field contract");

  const rss = await app.inject("/feed/all.xml");
  assert.equal(rss.statusCode, 200);
  assert.ok(rss.body.includes(example.validSummary));
  assert.ok(!rss.body.includes(example.incorrectClaim));

  const markdown = await app.inject(`/items/${id}/markdown`);
  assert.equal(markdown.statusCode, 200);
  assert.ok(markdown.body.includes(example.validSummary));
  assert.ok(!markdown.body.includes(example.incorrectClaim));

  const agent = await app.inject("/api/v1/agent/latest?mode=all&window=7d&limit=30");
  assert.equal(agent.statusCode, 200);
  assert.ok(agent.body.includes(example.validSummary));
  assert.ok(!agent.body.includes(example.incorrectClaim));

  const mcp = await app.inject({ method: "POST", url: "/api/mcp", headers: {
    host: "localhost", "content-type": "application/json", accept: "application/json, text/event-stream",
    "mcp-protocol-version": "2026-07-28", "mcp-method": "tools/call", "mcp-name": MCP_TOOL_NAMES.latest,
  }, payload: { jsonrpc: "2.0", id: 1, method: "tools/call", params: {
    name: MCP_TOOL_NAMES.latest, arguments: { mode: "all", window: "7d", limit: 30 },
    _meta: { "io.modelcontextprotocol/protocolVersion": "2026-07-28", "io.modelcontextprotocol/clientCapabilities": {} },
  } } });
  assert.equal(mcp.statusCode, 200);
  const message = mcp.headers["content-type"]?.startsWith("text/event-stream")
    ? JSON.parse(mcp.body.split("\n").find((line) => line.startsWith("data:"))!.slice(5))
    : mcp.json();
  assert.equal(message.error, undefined);
  assert.ok(!message.result.isError);
  const mcpItem = message.result.structuredContent.items.find((entry: { id: string }) => entry.id === id);
  assert.equal(mcpItem?.summary, example.validSummary);
  assert.ok(message.result.content.some((entry: { text?: string }) => entry.text?.includes(example.validSummary)));
  assert.ok(!mcp.body.includes(example.incorrectClaim));
  assert.equal(webLogs, "", "rendering these saved cases produces no SSR errors");
});

test("the admin HTTP route rejects an unsupported key in a temporary BCI source configuration with 400", async () => {
  const seeds = JSON.parse(readFileSync(new URL("../industry/sources.json", import.meta.url), "utf8")) as {
    sources: Array<{ id: string; kind: string; config: Record<string, unknown> }>;
  };
  const source = seeds.sources.find((entry) => entry.id === "bci-nature-bmi")!;
  const originalAdmin = config.devAdmin;
  config.devAdmin = { displayName: "Local BCI source validation" };
  try {
    const response = await app.inject({ method: "POST", url: "/api/admin/sources/preview",
      headers: { "x-csrf-token": "dev" }, payload: { id: source.id, kind: source.kind,
        config: { ...source.config, feedUrl: "http://127.0.0.1:1/bci-source-test", unsupportedBcihotParserKey: "must-reject" } } });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().code, "invalid_request");
    assert.match(response.body, /unsupportedBcihotParserKey/);
    assert.ok(!("unsupportedBcihotParserKey" in source.config), "the reviewed seed remains unchanged");
  } finally {
    config.devAdmin = originalAdmin;
  }
});
