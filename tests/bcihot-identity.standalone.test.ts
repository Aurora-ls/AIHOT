import assert from "node:assert/strict";
import { test } from "node:test";
import { enforceIdentity } from "@aihot/backend/editorial/writing";

for (const entity of [
  { id: "braingate", original: "BrainGate2", output: "BrainGate" },
  { id: "cas-cebsit", original: "CEBSIT", output: "中科院脑智卓越中心" },
]) test(`${entity.id}: writing cannot move an unnamed team's result to this BCI research entity`, () => {
  const unrelated = { title: "研究团队报告 EEG 离线结果", text: "研究团队比较了 EEG 离线解码方法。", sourceKind: "rss" };
  const copy = { titleZh: `${entity.output} 报告 EEG 离线结果`, summaryZh: `${entity.output} 在原文任务上比较了解码方法。` };
  const rejected = enforceIdentity(unrelated, copy);
  assert.equal(rejected.identityGuard.outcome, "fallback");
  assert.deepEqual(rejected.identityGuard.unsupportedTitleEntityIds, [entity.id]);
  assert.deepEqual(rejected.identityGuard.unsupportedSummaryEntityIds, [entity.id]);
  assert.equal(rejected.titleZh, unrelated.title);
  assert.equal(rejected.summaryZh, "");

  const named = { title: `${entity.original} reports an EEG decoding comparison`,
    text: `${entity.original} reports an offline comparison within the stated experiment.`, sourceKind: "rss" };
  const accepted = enforceIdentity(named, copy);
  assert.equal(accepted.identityGuard.outcome, "pass");
  assert.equal(accepted.titleZh, copy.titleZh);
  assert.equal(accepted.summaryZh, copy.summaryZh);
});
