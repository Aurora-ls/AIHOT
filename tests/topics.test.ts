// Topic pages: which articles a topic takes, and their counts.
// Written before the code, from the ways it can go wrong:
// - a company topic takes an article about another company that only mentions it (several subjects,
//   its name nowhere in the title), or drops one about it whose title names it in English, in another
//   case, next to Chinese text, or only by a product (it is the article's only subject);
// - a Latin name matches inside another word ("Synchrony" is not Synchron); a headline naming an institution
//   that is not a subject of the article gets in;
// - a technical-direction topic stops taking its tags;
// - withdrawn or not yet released articles appear in a list or a count;
// - an article or story page names a topic its reports do not belong to;
// - a topic without content has no page, or an unknown slug or a page past the end has one.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { publishArticle } from "@aihot/backend/publication/publish";
import { TOPICS, loadTopicPage, listTopicSummaries, topicsOfStory } from "@aihot/backend/publication/topics";
import { buildApp } from "../apps/api/src/app.ts";

const T = tag();
const OFFICIAL = `test-topics-official-${T}`;
const MEDIA = `test-topics-media-${T}`;
const app = await buildApp();

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, first_party, next_fetch_at) VALUES
    (${OFFICIAL}, 'Official', 'rss', 'T1', 'editorial', true, '2100-01-01'),
    (${MEDIA}, 'Media', 'rss', 'T2', 'editorial', false, '2100-01-01')`;
});
after(async () => {
  await app.close();
  await stopBoss();
  await closeDb();
});

let n = 0;
interface Report {
  source?: string;
  at: Date;
  title: string;
  originalTitle?: string;
  subjects?: string[];
  tags?: string[];
  score?: number;
  selected?: boolean;
  fact?: number;
  category?: string;
}

/** A published report; `fact` links it to a fact before publishing, as grouping would. */
async function report(r: Report): Promise<string> {
  n += 1;
  const { articleId } = await upsertMaterial({
    sourceId: r.source ?? MEDIA, url: `https://example.com/topics-${T}-${n}`, title: r.originalTitle ?? r.title, bodyText: "body", bodyHtml: "<p>body</p>", bodyStatus: "ok", via: "fetch", publishedAt: r.at,
  });
  await sql`UPDATE articles SET discovered_at = ${r.at}, timeline_at = ${r.at}, grouped_at = now() WHERE id = ${articleId}`;
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, score, selected, subjects, tags)
            VALUES (${articleId}, 1, 'rule', 'pass', ${r.category ?? "hardware-acquisition"}, ${r.title}, ${`摘要 ${n}`}, ${r.score ?? 80}, ${r.selected ?? true}, ${r.subjects ?? []}, ${[
              r.category === "decoding-signal" ? "解码与信号处理" : r.category === "industry" ? "产业与政策" : r.category === "tools-practice-opinion" ? "工具、教程与观点" : "硬件与采集",
              ...(r.tags ?? []),
            ]})`;
  if (r.fact) await sql`INSERT INTO fact_articles (fact_id, article_id, role) VALUES (${r.fact}, ${articleId}, 'report')`;
  await publishArticle(articleId, { releasedAt: new Date(r.at.getTime() + 60_000) });
  return articleId;
}

async function story(title: string): Promise<{ id: number; publicId: string }> {
  const publicId = randomUUID();
  const [s] = await sql<{ id: number }[]>`INSERT INTO stories (public_id, title, first_report_at, latest_at) VALUES (${publicId}, ${title}, now(), now()) RETURNING id`;
  return { id: s!.id, publicId };
}

async function fact(storyId: number | null, title: string): Promise<number> {
  const [f] = await sql<{ id: number }[]>`INSERT INTO facts (public_id, story_id, title) VALUES (${`f-${T}-${randomUUID()}`}, ${storyId}, ${title}) RETURNING id`;
  return f!.id;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const ids = (items: Array<{ id: string }>) => items.map((i) => i.id);
const page = async (slug: string, p = 1) => {
  const data = await loadTopicPage(slug, p, new Date());
  assert.ok(data, `${slug} page ${p}`);
  return data;
};
/** Every article of a topic, over all its pages. */
async function members(slug: string): Promise<string[]> {
  const first = await page(slug);
  const out = ids(first.items);
  for (let p = 2; p <= first.pageCount; p++) out.push(...ids((await page(slug, p)).items));
  return out;
}

test("an institution topic takes reports about it, not reports that only mention it", async () => {
  const about = await report({ at: hoursAgo(30), title: `BrainGate reports a motor BCI study ${T}`, subjects: ["braingate"] });
  const project = await report({ at: hoursAgo(31), title: `受试者记录方案更新 ${T}`, subjects: ["braingate"] });
  const english = await report({ at: hoursAgo(32), title: `A new intracortical BCI result ${T}`, originalTitle: `BrainGate team reports a new participant result ${T}`, subjects: ["braingate", "neuralink"], tags: ["论文/研究"] });
  const adjacent = await report({ at: hoursAgo(33), title: `发布BrainGate受试者研究结果 ${T}`, subjects: ["braingate"] });
  const neuralink = await report({ at: hoursAgo(34), title: `Neuralink reports a study update ${T}`, category: "industry", subjects: ["neuralink", "braingate", "brain-products"], tags: ["行业动态"] });
  const lowerCase = await report({ at: hoursAgo(35), title: `neuralink reports a new trial status ${T}`, category: "industry", subjects: ["neuralink", "braingate"], tags: ["行业动态"] });
  const overview = await report({ at: hoursAgo(36), title: `Three BCI teams publish a shared protocol overview ${T}`, subjects: ["neuralink", "braingate", "neuroxess"], tags: ["论文/研究"] });
  const mention = await report({ at: hoursAgo(37), title: `BrainGate is mentioned in a broad review ${T}`, subjects: ["neuroxess"], tags: ["观点/综述"] });
  const headline = await report({ at: hoursAgo(38), title: `Neuralink is mentioned in a broad review ${T}`, subjects: ["braingate", "neuralink"] });
  const neuroxess = await report({ at: hoursAgo(39), title: `脑虎科技披露一项临床研究进展 ${T}`, subjects: ["neuroxess"], tags: ["论文/研究"] });
  const eeg = await report({ at: hoursAgo(40), title: `A new motor-imagery interface method ${T}`, category: "decoding-signal", tags: ["EEG", "运动想象"] });
  const similarWord = await report({ at: hoursAgo(41), title: `Synchrony protocol published with BrainGate participation ${T}`, subjects: ["synchron", "braingate"] });
  const adjacentName = await report({ at: hoursAgo(42), title: `发布Synchron试验方案 ${T}`, subjects: ["synchron", "braingate"] });

  const braingate = await members("braingate");
  for (const id of [about, project, english, adjacent]) assert.ok(braingate.includes(id), "the title or original title names the actual institution");
  for (const id of [neuralink, lowerCase, overview, mention, headline, neuroxess]) assert.ok(!braingate.includes(id), "a mention or another subject is not membership");
  const neuralinkItems = await members("neuralink");
  for (const id of [neuralink, lowerCase, headline]) assert.ok(neuralinkItems.includes(id), "the title names an actual subject institution");
  for (const id of [english, overview, mention, adjacent]) assert.ok(!neuralinkItems.includes(id), "a co-subject or roundup mention is not membership");
  assert.ok((await members("neuroxess")).includes(neuroxess), "a Chinese company alias resolves to its institution topic");
  const synchron = await members("synchron");
  assert.ok(synchron.includes(adjacentName), "Synchron next to Chinese text");
  assert.ok(!synchron.includes(similarWord), "Synchrony is not Synchron");
  assert.ok((await members("brain-signal-modalities")).includes(eeg), "a technical-direction topic takes its signal tag");

  // The article page names the topics it belongs to.
  const topicsOf = async (id: string) => {
    const res = await app.inject({ method: "GET", url: `/api/site/items/${id}` });
    return (JSON.parse(res.body) as { topics: Array<{ slug: string }> }).topics.map((t) => t.slug);
  };
  assert.deepEqual(await topicsOf(about), ["braingate"]);
  assert.deepEqual(await topicsOf(english), ["braingate", "paper-research"]);
  assert.deepEqual(await topicsOf(neuralink), ["neuralink"]);
  assert.deepEqual(await topicsOf(eeg), ["brain-signal-modalities", "decoding-and-generalization"]);
});

test("a story page names the technical topics of its reports", async () => {
  const launch = await story(`EEG 运动想象解码结果 ${T}`);
  await report({ source: OFFICIAL, at: hoursAgo(26), title: `EEG 运动想象解码结果 ${T}`, category: "decoding-signal", tags: ["EEG", "运动想象"], fact: await fact(launch.id, "EEG 运动想象解码结果") });
  assert.deepEqual(await topicsOfStory(launch.id), [{ slug: "brain-signal-modalities", name: "脑信号模态" }, { slug: "decoding-and-generalization", name: "解码与泛化" }]);
});

test("withdrawn articles stay out of lists and counts", async () => {
  const kept = await report({ at: hoursAgo(5), title: `BrainCo reports a system update ${T}`, category: "industry", subjects: ["brainco"], tags: ["行业动态"] });
  const withdrawn = await report({ at: hoursAgo(4), title: `BrainCo withdraws an earlier notice ${T}`, category: "industry", subjects: ["brainco"], tags: ["行业动态"] });
  await sql`UPDATE publications SET visibility = 'withdrawn' WHERE article_id = ${withdrawn}`;

  const data = await page("brainco");
  assert.deepEqual(ids(data.items), [kept]);
  assert.equal(data.topic.total, 1);
  const summary = (await listTopicSummaries()).topics.find((t) => t.slug === "brainco")!;
  assert.equal(summary.latest?.title, `BrainCo reports a system update ${T}`, "the index shows the newest public article");
});

test("every topic has a page; unknown topics and pages past the end have none", async () => {
  const empty = await page("paradromics");
  assert.equal(empty.topic.indexable, false, "a topic without content is not indexed");
  assert.deepEqual(empty.items, []);
  assert.equal(await loadTopicPage("not-a-topic", 1, new Date()), null);
  assert.equal(await loadTopicPage("paradromics", 2, new Date()), null);
  const index = await app.inject({ method: "GET", url: "/api/site/topics" });
  const body = JSON.parse(index.body) as { groups: Array<{ key: string }>; topics: Array<{ slug: string }> };
  assert.deepEqual(body.groups.map((g) => g.key), ["company", "field", "genre"]);
  assert.deepEqual(body.topics.map((t) => t.slug).sort(), TOPICS.map((t) => t.slug).sort(), "the index lists every topic");
});
