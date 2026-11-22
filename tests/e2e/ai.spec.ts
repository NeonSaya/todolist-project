import { once } from "node:events";
import { createServer } from "node:http";
import { type Page, expect, test } from "@playwright/test";

const TEST_KEY = "sk-shixu-test-placeholder";
const TEST_MODEL = "test-chat";

function completion(content: string) {
  return { choices: [{ message: { content } }] };
}

async function fillConfig(page: Page, baseURL: string) {
  await page.getByLabel("Base URL").fill(baseURL);
  await page.locator("#ai-api-key").fill(TEST_KEY);
  await page.getByLabel("模型名称").fill(TEST_MODEL);
}

test("未配置时引导到 AI 设置，拒绝无效地址并记住有效配置", async ({
  page,
  baseURL,
}) => {
  await page.goto("/smart-add");
  await page.getByTestId("smart_add.textarea").fill("明天检查消防设备");
  await page.getByTestId("smart_add.analyze.primary_button").click();
  await expect(page.getByTestId("smart_add.ai_status.link")).toBeVisible();
  await page.getByTestId("smart_add.ai_status.link").click();
  await fillConfig(page, "file:///settings");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(
    page.getByText("请输入有效的 HTTP 或 HTTPS 接口地址"),
  ).toBeVisible();
  await expect(
    page.getByText("尚未配置 API Key", { exact: true }),
  ).toBeVisible();

  await fillConfig(
    page,
    `${baseURL}/fake/v1/chat/completions/?api-version=test`,
  );
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("智能添加已就绪")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Base URL")).toHaveValue(
    `${baseURL}/fake/v1?api-version=test`,
  );
  await expect(page.getByLabel("模型名称")).toHaveValue(TEST_MODEL);
  await expect(page.locator("#ai-api-key")).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "清除配置", exact: true }).click();
  await page.getByRole("button", { name: "确认清除", exact: true }).click();
  await page.reload();
  await expect(page.locator("#ai-api-key")).toHaveValue("");
});

test("验证接口、解析、修订及批量保存选中的建议", async ({ page, baseURL }) => {
  await page.clock.setFixedTime(new Date("2026-11-22T14:00:00+08:00"));
  const messages: { role: string; content: string }[][] = [];
  await page.route(
    "**/fake/v1/chat/completions?api-version=test",
    async (route) => {
      const request = route.request();
      expect(request.headers().authorization).toBe(`Bearer ${TEST_KEY}`);
      const payload = request.postDataJSON();
      expect(payload.model).toBe(TEST_MODEL);
      messages.push(payload.messages);
      const tasks = [
        {
          title: "提交活动计划",
          date: "下周三",
          priority: "高",
          note: "带方案",
        },
        { title: "暂缓的任务", date: "2027-02-290", priority: "low" },
        { title: "整理联系人", date: null, priority: "medium" },
      ];
      const content =
        messages.length === 1
          ? "OK"
          : `\`\`\`json\n${JSON.stringify({ tasks })}\n\`\`\``;
      await route.fulfill({ json: completion(content) });
    },
  );
  await page.goto("/settings");
  await fillConfig(
    page,
    `${baseURL}/fake/v1/chat/completions/?api-version=test`,
  );
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByText("连接成功", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await page.getByTestId("nav.smart_add.link").click();
  await page
    .getByTestId("smart_add.textarea")
    .fill("下周三前提交活动计划，另外整理联系人");
  await page.getByTestId("smart_add.analyze.primary_button").click();
  await expect(
    page.getByRole("heading", { name: "AI 找到 3 条任务" }),
  ).toBeVisible();
  await expect(
    page.getByTestId("smart_add.suggestion.2.date.open_modal_button"),
  ).toHaveAccessibleName("日期：无日期");
  await expect(
    page.getByTestId("smart_add.suggestion.1.date.open_modal_button"),
  ).toHaveAccessibleName("日期：11月25日 周三");
  await page
    .getByTestId("smart_add.suggestion.input.1")
    .fill("提交修订后的活动计划");
  await page.getByTestId("smart_add.suggestion.checkbox.2").click();
  await page.getByTestId("smart_add.confirm_button").click();
  await expect(page.getByTestId("smart_add.suggestions.section")).toBeHidden();
  expect(messages).toHaveLength(2);
  expect(messages[1].at(-1)?.content).toBe(
    "下周三前提交活动计划，另外整理联系人",
  );

  await page.getByTestId("nav.view.upcoming.link").click();
  await expect(
    page.getByRole("button", { name: "提交修订后的活动计划", exact: true }),
  ).toBeVisible();
  await page.getByTestId("nav.view.all.link").click();
  await expect(
    page.getByRole("button", { name: "整理联系人", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "暂缓的任务", exact: true }),
  ).toHaveCount(0);
});

test("连接响应回来前更换模型时丢弃过时结果", async ({ page, baseURL }) => {
  let release = () => {};
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/fake/chat/completions", async (route) => {
    await wait;
    await route.fulfill({ json: completion("OK") });
  });
  await page.goto("/settings");
  await fillConfig(page, `${baseURL}/fake`);
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByTestId("settings.test.loading_state")).toBeVisible();
  await page.getByLabel("模型名称").fill("changed-model");
  release();
  await expect(page.getByRole("button", { name: "测试连接" })).toBeEnabled();
  await expect(page.getByTestId("settings.test.success_state")).toHaveCount(0);
});

test("AI 接口发出响应头后卡住，仍在超时时间内结束测试", async ({ page }) => {
  let started = () => {};
  const bodyStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  const server = createServer((req, response) => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader(
      "access-control-allow-headers",
      "authorization, content-type",
    );
    if (req.method === "OPTIONS") {
      response.writeHead(204).end();
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.write('{"choices":');
    started();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("测试服务未监听 TCP 端口");
    await page.clock.install({ time: new Date("2026-11-22T10:00:00+08:00") });
    await page.goto("/settings");
    await fillConfig(page, `http://127.0.0.1:${address.port}/v1`);
    await page.getByRole("button", { name: "测试连接" }).click();
    await bodyStarted;
    await page.clock.fastForward(20_001);
    await expect(
      page.getByText("AI 服务响应超时，请稍后再试", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "测试连接" })).toBeEnabled();
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
