// Generated from tests/e2e/specs/smart-add-analyze.json (spec d846ea891ff2a9bf). Edit the spec, not this file.
import { test } from "@e2e-dev/web";
import type { Locator, Screen } from "e2e";
import { expect } from "e2e";

/** Steps this flow's recording found already done; strict replay skips them, as they have nothing to replay. */
const skippedSteps: readonly number[] = JSON.parse(process.env.CAFFEINE_E2E_SKIP_STEPS ?? "[]");

const recording = process.env.CAFFEINE_E2E_MODE === "record" || process.env.CAFFEINE_E2E_MODE === "heal";

/** Whether `holds` turns true within the assertion timeout. */
async function eventually(holds: () => Promise<boolean>): Promise<boolean> {
  const deadline = Date.now() + 5000;
  for (;;) {
    if (await holds()) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function flowChecks() {
  let failed = 0;
  return {
    /** Spec check `index`: a failure fails a strict replay at once and is kept otherwise. */
    async check(index: number, verify: () => Promise<void>, holds: () => Promise<boolean>): Promise<void> {
      if (!recording) return verify();
      if (failed === 0) {
        try {
          return await verify();
        } catch (error) {
          if ((error as { code?: unknown }).code !== "ASSERTION_FAILED") throw error;
        }
      } else if (await eventually(holds)) {
        return;
      }
      failed += 1;
      expect.soft(false, `check ${String(index)}`).toBe(true);
    },
  };
}

/** `text` as a case-insensitive pattern in which each run of spaces also matches none. */
function spacedText(text: string): RegExp {
  const words = text.trim().split(/\s+/).map((word) => word.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&"));
  return new RegExp(words.join("\\s*"), "i");
}

/** Words the screen shows: visible text, the placeholder of an input that shows it, or a field that holds it right after the step that typed it. */
async function shownText(screen: Screen, text: string, typed = false, pattern?: RegExp): Promise<Locator> {
  const asText = screen.getByText(pattern ?? spacedText(text), { visible: true }).first();
  const field = pattern === undefined ? { exact: false, visible: true } : { exact: true, visible: true };
  const asPlaceholder = screen.getByPlaceholder(text, field).first();
  const asValue = screen.getByDisplayValue(text, field).first();
  for (let waited = 0; waited < 5000; waited += 250) {
    if (await asText.isVisible()) return asText;
    if (await asPlaceholder.isVisible()) return asPlaceholder;
    if (typed && (await asValue.isVisible())) return asValue;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return asText;
}

/** A control by its name as a button or a link: a link styled as a button (`<Button asChild><Link>`) is either. */
async function shownControl(screen: Screen, name: string): Promise<Locator> {
  const asButton = screen.getByRole("button", name, { exact: false }).first();
  const asLink = screen.getByRole("link", name, { exact: false }).first();
  for (let waited = 0; waited < 5000; waited += 250) {
    if (await asButton.isVisible()) return asButton;
    if (await asLink.isVisible()) return asLink;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return asButton;
}

test("smart-add-analyze", async ({ app, agent, screen, browser }) => {
  const flow = flowChecks();
  await browser.route("https://api.openai.com/v1/chat/completions", async (route) => {
    await route.fulfill({ status: 200, json: {"choices":[{"finish_reason":"stop","index":0,"message":{"content":"{\"tasks\":[{\"title\":\"和王总开会\",\"date\":\"2030-06-15\",\"priority\":\"high\",\"note\":\"下午三点\"},{\"title\":\"交季度报告\",\"date\":\"2030-06-18\",\"priority\":\"high\",\"note\":null},{\"title\":\"买牛奶\",\"date\":null,\"priority\":\"low\",\"note\":null}]}","role":"assistant"}}],"id":"mock","object":"chat.completion"} });
  });
  await app.open("/");

  if (!skippedSteps.includes(0)) await agent.act("Open AI 设置\nDo not do the next step yet: Save the settings with 接口地址 https://api.openai.com/v1, API Key sk-test-123 and 模型名称 gpt-4o-mini", { maxModelCalls: 20 });
  await flow.check(0, async () => { await expect(await shownText(screen, "API Key")).toBeVisible({ timeout: 15000 }); }, async () => (await shownText(screen, "API Key")).isVisible());

  if (!skippedSteps.includes(1)) await agent.act("Save the settings with 接口地址 https://api.openai.com/v1, API Key sk-test-123 and 模型名称 gpt-4o-mini\nDo not do the next step yet: Open 智能添加", { maxModelCalls: 20 });
  await flow.check(1, async () => { await expect(await shownText(screen, "API Key", true)).toBeVisible(); }, async () => (await shownText(screen, "API Key", true)).isVisible());

  if (!skippedSteps.includes(2)) await agent.act("Open 智能添加\nDo not do the next step yet: Paste 明天下午三点和王总开会，周五前交季度报告，记得买牛奶 into the text area and press 分析", { maxModelCalls: 20 });
  await flow.check(2, async () => { await expect(await shownControl(screen, "分析")).toBeVisible(); }, async () => (await shownControl(screen, "分析")).isVisible());

  if (!skippedSteps.includes(3)) await agent.act("Paste 明天下午三点和王总开会，周五前交季度报告，记得买牛奶 into the text area and press 分析\nDo not do the next step yet: Confirm and add the checked suggestions", { maxModelCalls: 20 });
  await flow.check(3, async () => { await expect(screen.getByText(new RegExp("(?<![\\d.,+*\\u00D7xX\\u2212-])(?<!\\d[/:,])3(?!\\d|[-/:.,\\s\\u00D7xX*]\\d)"), { visible: true }).first()).toBeVisible(); }, async () => screen.getByText(new RegExp("(?<![\\d.,+*\\u00D7xX\\u2212-])(?<!\\d[/:,])3(?!\\d|[-/:.,\\s\\u00D7xX*]\\d)"), { visible: true }).first().isVisible());

  if (!skippedSteps.includes(4)) await agent.act("Confirm and add the checked suggestions\nDo not do the next step yet: Open the 全部 view", { maxModelCalls: 20 });
  await flow.check(4, async () => { await expect(await shownText(screen, "已添加 3 条任务")).toBeVisible(); }, async () => (await shownText(screen, "已添加 3 条任务")).isVisible());

  if (!skippedSteps.includes(5)) await agent.act("Open the 全部 view", { maxModelCalls: 20 });
  await flow.check(5, async () => { await expect(await shownText(screen, "买牛奶")).toBeVisible(); }, async () => (await shownText(screen, "买牛奶")).isVisible());
  await flow.check(6, async () => { await expect(await shownText(screen, "交季度报告")).toBeVisible(); }, async () => (await shownText(screen, "交季度报告")).isVisible());
});
