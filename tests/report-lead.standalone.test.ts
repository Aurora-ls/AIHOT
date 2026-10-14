// A daily's front-page picture comes from the item its lead is about: the editors' lead matched to an
// item by title, never simply the first highlight.
import "./setup.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReportCitation } from "@aihot/contracts/site";
import { leadItemOf } from "@aihot/backend/publication/reports";

const cite = (itemId: string, title: string, available = true) => ({ itemId, title, available }) as ReportCitation;
const arena = cite("a", "EEG 离线解码基准比较了 23 种网络架构");
const openai = cite("b", "Neuralink 公布脑机接口受试者演示，并披露设备使用范围");

test("an editors' lead is matched to the item it is written about", () => {
  assert.equal(leadItemOf("Neuralink 公布脑机接口受试者演示，并披露设备使用范围", [arena, openai], [arena, openai])?.itemId, "b");
});

test("a lead that matches no item clearly has no item", () => {
  assert.equal(leadItemOf("多家机构公布不同研究，方向各不相同", [arena], [arena, openai]), undefined);
});

test("without an editors' lead the first highlight leads", () => {
  assert.equal(leadItemOf(undefined, [arena], [openai, arena])?.itemId, "a");
});

test("a withdrawn highlight never leads the front page", () => {
  const withdrawn = cite("w", "已下架", false);
  assert.equal(leadItemOf(undefined, [withdrawn, arena], [withdrawn, arena, openai])?.itemId, "a");
});
