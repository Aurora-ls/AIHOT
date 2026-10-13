// Read-only source-list checks. --live uses free public listing HTTP requests only.
// Tests must use saved/local fixtures instead of calling these public services.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertSupportedConfig } from "../../packages/backend/src/sources/config-keys.ts";
import { fetchRss } from "../../packages/backend/src/sources/rss.ts";
import { fetchWebList } from "../../packages/backend/src/sources/web-list.ts";
import { fetchJsonList } from "../../packages/backend/src/sources/json-list.ts";
import type { SourceRow } from "../../packages/backend/src/sources/types.ts";

const file = new URL("sources-candidate.json", import.meta.url);
const draft = JSON.parse(readFileSync(file, "utf8")) as { sources: Array<SourceRow & { site_fulltext: boolean; syndicate_fulltext: boolean }> };
assert.equal(new Set(draft.sources.map(s => s.id)).size, draft.sources.length, "duplicate source ids");
for (const s of draft.sources) {
  assertSupportedConfig(s.kind, s.config);
  assert.equal(s.enabled, false, s.id + ": draft must stay paused");
  assert.equal(s.site_fulltext, false, s.id + ": full text not authorized");
  assert.equal(s.syndicate_fulltext, false, s.id + ": full text redistribution not authorized");
}
console.log("schema checks passed: " + draft.sources.length + " paused sources");
if (process.argv.includes("--live")) {
  const results: object[] = [];
  let failures = 0;
  for (let offset = 0; offset < draft.sources.length; offset += 4) {
    const group = draft.sources.slice(offset, offset + 4);
    const rows = await Promise.all(group.map(async (s) => {
      const source: SourceRow = { ...s, first_party: s.tier === "T1", cursor: null, fail_count: 0 };
      const checkedAt = new Date().toISOString();
      try {
        const candidates = s.kind === "rss" ? (await fetchRss(source, { force: true })).candidates
          : s.kind === "web_list" ? await fetchWebList(source)
          : s.kind === "json_list" ? await fetchJsonList(source) : [];
        assert.ok(candidates.length, "no articles returned; investigate, do not fabricate entries");
        for (const c of candidates) {
          assert.ok(c.title && c.url, "empty title or URL");
          const u = new URL(c.url);
          assert.ok(["http:", "https:"].includes(u.protocol), "non-HTTP article URL");
        }
        return { id: s.id, checkedAt, ok: true, count: candidates.length, dated: candidates.filter(c => c.publishedAt).length,
          samples: candidates.slice(0, 3).map(c => ({ title: c.title, url: c.url, publishedAt: c.publishedAt?.toISOString() ?? null })) };
      } catch (e) {
        return { id: s.id, checkedAt, ok: false, error: (e as Error).message };
      }
    }));
    results.push(...rows);
    for (const row of rows) {
      console.log(JSON.stringify(row));
      if (!row.ok) failures++;
    }
  }
  writeFileSync(fileURLToPath(new URL("listing-results.json", import.meta.url)), JSON.stringify({ date: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(new Date()), scope: "listing parser only; no database writes, model, paid requests, or detail verification", results }, null, 2) + "\n");
  console.log("live lists: " + (draft.sources.length - failures) + "/" + draft.sources.length + " passed");
  process.exitCode = failures ? 1 : 0;
}
