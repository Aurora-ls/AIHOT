import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, test } from "node:test";
import { config } from "@aihot/backend/config";
import { previewSource } from "@aihot/backend/admin/sources";
import { assertSupportedConfig } from "@aihot/backend/sources/config-keys";
import { fetchJsonList } from "@aihot/backend/sources/json-list";
import { fetchRss } from "@aihot/backend/sources/rss";
import type { SourceRow } from "@aihot/backend/sources/types";
import { fetchWebList } from "@aihot/backend/sources/web-list";
import { ENTITIES } from "@aihot/industry/taxonomy";

const fixtures = new Map([
  ["/nature.rss", { body: await readFile(new URL("../docs/bcihot/fixtures/bci-nature-bmi.rss.xml", import.meta.url)), type: "application/rss+xml" }],
  ["/europepmc.json", { body: await readFile(new URL("../docs/bcihot/fixtures/bci-europepmc-med.json", import.meta.url)), type: "application/json" }],
  ["/neuroxess.html", { body: await readFile(new URL("../docs/bcihot/fixtures/bci-neuroxess-news.html", import.meta.url)), type: "text/html; charset=utf-8" }],
]);
const server = createServer((request, response) => {
  const fixture = fixtures.get(request.url ?? "");
  if (!fixture) { response.writeHead(404); return response.end(); }
  response.writeHead(200, { "content-type": fixture.type });
  response.end(fixture.body);
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const allowPrivateNetworkFetch = config.allowPrivateNetworkFetch;
config.allowPrivateNetworkFetch = true;
after(async () => {
  config.allowPrivateNetworkFetch = allowPrivateNetworkFetch;
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const seeds = (JSON.parse(await readFile(new URL("../industry/sources.json", import.meta.url), "utf8")) as { sources: Array<SourceRow & { owner_entity_id: string; enabled: boolean; site_fulltext: boolean; syndicate_fulltext: boolean }> }).sources;
const reviewed = (JSON.parse(await readFile(new URL("../docs/bcihot/sources-candidate.json", import.meta.url), "utf8")) as { sources: Array<{ id: string }> }).sources;
const source = (id: string) => {
  const saved = seeds.find((item) => item.id === id)!;
  assertSupportedConfig(saved.kind, saved.config);
  assert.equal(saved.enabled, false);
  assert.equal(saved.site_fulltext, false);
  assert.equal(saved.syndicate_fulltext, false);
  assert.ok(saved.owner_entity_id && saved.owner_entity_id in ENTITIES, `${id} has a known owner entity`);
  return { ...saved, first_party: saved.tier === "T1", cursor: null, fail_count: 0 } as SourceRow;
};

test("a temporary source-config copy with an unsupported key is refused with status 400", async () => {
  const saved = source("bci-nature-bmi");
  const configWithUnsupportedKey = { ...saved.config, unsupportedBcihotParserKey: "must-not-fall-back" };
  await assert.rejects(
    previewSource({ id: saved.id, kind: saved.kind, config: configWithUnsupportedKey }),
    (error: unknown) => {
      const failure = error as Error & { statusCode?: number };
      assert.equal(failure.statusCode, 400);
      assert.match(failure.message, /unsupportedBcihotParserKey/);
      return true;
    },
  );
});

test("all 21 reviewed candidates are seeded paused with full-text permissions disabled", () => {
  assert.equal(seeds.length, 21);
  assert.deepEqual(seeds.map((item) => item.id).sort(), reviewed.map((item) => item.id).sort());
  for (const item of seeds) {
    assert.equal(item.enabled, false, item.id);
    assert.equal(item.site_fulltext, false, item.id);
    assert.equal(item.syndicate_fulltext, false, item.id);
    assert.ok(item.owner_entity_id in ENTITIES, item.id);
  }
});

test("verified paused source configs parse saved RSS, JSON and HTML listing responses without network access", async (t) => {
  await t.test("Nature RSS", async () => {
    const saved = source("bci-nature-bmi");
    const result = await fetchRss({ ...saved, config: { ...saved.config, feedUrl: `${origin}/nature.rss` } }, { force: true });
    assert.equal(result.candidates.length, 3);
    assert.equal(result.candidates[1]!.title, "Assistive algorithms influence neural representations in motor brain-computer interfaces");
    assert.equal(result.candidates[1]!.url, "https://www.nature.com/articles/s41467-026-76109-y");
    assert.equal(result.candidates[1]!.publishedAt?.toISOString(), "2026-09-15T00:00:00.000Z");
  });

  await t.test("Europe PMC JSON", async () => {
    const saved = source("bci-europepmc-med");
    const result = await fetchJsonList({ ...saved, config: { ...saved.config, url: `${origin}/europepmc.json` } });
    assert.equal(result.length, 5);
    assert.match(result[0]!.title, /Brain-Computer Interface/);
    assert.ok(result[0]!.url.startsWith("https://europepmc.org/article/MED/"));
  });

  await t.test("NeuroXess HTML list", async () => {
    const saved = source("bci-neuroxess-news");
    const result = await fetchWebList({ ...saved, config: { ...saved.config, url: `${origin}/neuroxess.html`, baseUrl: "https://www.neuroxess.com/news/" } });
    assert.equal(result.length, 3);
    assert.match(result[0]!.title, /脑虎科技披露/);
    assert.ok(result[0]!.url.startsWith("https://www.neuroxess.com/news/"));
    assert.ok(result[0]!.publishedAt instanceof Date);
  });
});
