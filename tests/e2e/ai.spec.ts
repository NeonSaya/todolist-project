import { once } from "node:events";
import { createServer } from "node:http";
import { type Page, expect, test } from "@playwright/test";

const TEST_KEY = "sk-shixu-test-placeholder";
const TEST_MODEL = "test-chat";

type TestProtocol = "openai-responses" | "anthropic-messages" | "openai-chat";

const PROTOCOL_LABELS: Record<TestProtocol, string> = {
  "openai-responses": "OpenAI Responses",
  "anthropic-messages": "Anthropic Messages",
  "openai-chat": "OpenAI Chat Completions",
};

function completion(content: string) {
  return { choices: [{ message: { content } }] };
}

function openAiResponse(content: string) {
  return {
    output: [
      {
        type: "reasoning",
        content: [{ type: "reasoning_text", text: "不应混入任务结果" }],
      },
      {
        type: "message",
        content: [{ type: "output_text", text: content }],
      },
    ],
  };
}

function anthropicMessage(content: string) {
  return {
    content: [
      { type: "thinking", thinking: "不应混入任务结果" },
      { type: "text", text: content },
    ],
  };
}

async function fillConfig(
  page: Page,
  baseURL: string,
  protocol: TestProtocol = "openai-chat",
) {
  await page.getByText(PROTOCOL_LABELS[protocol], { exact: true }).click();
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
  await expect(
    page.getByRole("radio", { name: "OpenAI Chat Completions", exact: true }),
  ).toBeChecked();
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

test("OpenAI Responses 使用 instructions/input 并解析两种文本响应", async ({
  page,
  baseURL,
}) => {
  const payloads: {
    max_output_tokens: number;
    instructions?: string;
    input: { role: string; content: string }[];
  }[] = [];
  await page.route("**/fake/v1/responses?api-version=test", async (route) => {
    const request = route.request();
    expect(request.headers().authorization).toBe(`Bearer ${TEST_KEY}`);
    const payload = request.postDataJSON();
    expect(payload.model).toBe(TEST_MODEL);
    payloads.push(payload);
    if (payloads.length === 1) {
      await route.fulfill({ json: { output_text: "OK" } });
      return;
    }
    await route.fulfill({
      json: openAiResponse(
        JSON.stringify({
          tasks: [
            {
              title: "提交季度总结",
              date: "2026-11-25",
              priority: "high",
              note: null,
            },
          ],
        }),
      ),
    });
  });

  await page.goto("/settings");
  await fillConfig(
    page,
    `${baseURL}/fake/v1/responses/?api-version=test`,
    "openai-responses",
  );
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByText("连接成功", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await page.getByTestId("nav.smart_add.link").click();
  await page.getByTestId("smart_add.textarea").fill("下周三提交季度总结");
  await page.getByTestId("smart_add.analyze.primary_button").click();
  await expect(page.getByTestId("smart_add.suggestion.input.1")).toHaveValue(
    "提交季度总结",
  );

  expect(payloads).toHaveLength(2);
  expect(payloads[0].max_output_tokens).toBe(64);
  expect(payloads[0].instructions).toBeUndefined();
  expect(payloads[0].input).toEqual([
    { role: "user", content: "请只回复：OK" },
  ]);
  expect(payloads[1].max_output_tokens).toBe(4096);
  expect(payloads[1].instructions).toContain("任务整理助手");
  expect(payloads[1].input.at(-1)?.content).toBe("下周三提交季度总结");
});

test("Anthropic Messages 使用专用鉴权、保存协议并合并文本块", async ({
  page,
  baseURL,
}) => {
  const payloads: {
    max_tokens: number;
    system?: string;
    messages: { role: string; content: string }[];
  }[] = [];
  await page.route(
    "**/fake/anthropic/v1/messages?api-version=test",
    async (route) => {
      const request = route.request();
      const headers = request.headers();
      expect(headers["x-api-key"]).toBe(TEST_KEY);
      expect(headers["anthropic-version"]).toBe("2023-06-01");
      expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
      expect(headers.authorization).toBeUndefined();
      const payload = request.postDataJSON();
      expect(payload.model).toBe(TEST_MODEL);
      payloads.push(payload);
      if (payloads.length === 1) {
        await route.fulfill({ json: anthropicMessage("OK") });
        return;
      }
      const content = JSON.stringify({
        tasks: [
          {
            title: "预约牙医",
            date: "2026-11-24",
            priority: "medium",
            note: "上午",
          },
        ],
      });
      await route.fulfill({
        json: {
          content: [
            { type: "text", text: content.slice(0, 24) },
            { type: "text", text: content.slice(24) },
          ],
        },
      });
    },
  );

  await page.goto("/settings");
  await fillConfig(
    page,
    `${baseURL}/fake/anthropic/v1/messages/?api-version=test`,
    "anthropic-messages",
  );
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByText("连接成功", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Anthropic Messages", exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Base URL")).toHaveValue(
    `${baseURL}/fake/anthropic/v1?api-version=test`,
  );
  await page.getByTestId("nav.smart_add.link").click();
  await page.getByTestId("smart_add.textarea").fill("明天上午预约牙医");
  await page.getByTestId("smart_add.analyze.primary_button").click();
  await expect(page.getByTestId("smart_add.suggestion.input.1")).toHaveValue(
    "预约牙医",
  );

  expect(payloads).toHaveLength(2);
  expect(payloads[0].max_tokens).toBe(64);
  expect(payloads[0].system).toBeUndefined();
  expect(payloads[0].messages).toEqual([
    { role: "user", content: "请只回复：OK" },
  ]);
  expect(payloads[1].max_tokens).toBe(4096);
  expect(payloads[1].system).toContain("任务整理助手");
  expect(payloads[1].messages.at(-1)?.content).toBe("明天上午预约牙医");
});

test("Anthropic Base URL 不含版本路径时自动补上 /v1/messages", async ({
  page,
  baseURL,
}) => {
  await page.route("**/deepseek-style/anthropic/v1/messages", async (route) => {
    await route.fulfill({ json: anthropicMessage("OK") });
  });
  await page.goto("/settings");
  await fillConfig(
    page,
    `${baseURL}/deepseek-style/anthropic`,
    "anthropic-messages",
  );
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByText("连接成功", { exact: true })).toBeVisible();
});

test("旧版配置没有协议字段时继续使用 Chat Completions", async ({
  page,
  baseURL,
}) => {
  await page.addInitScript(
    (config) => {
      window.localStorage.setItem("shixu.ai-config.v1", JSON.stringify(config));
    },
    {
      baseUrl: `${baseURL}/legacy/v1`,
      apiKey: TEST_KEY,
      model: TEST_MODEL,
    },
  );
  await page.route("**/legacy/v1/chat/completions", async (route) => {
    await route.fulfill({ json: completion("OK") });
  });
  await page.goto("/settings");
  await expect(
    page.getByRole("radio", { name: "OpenAI Chat Completions", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByText("连接成功", { exact: true })).toBeVisible();
});

test("Anthropic 错误详情会隐藏 API Key", async ({ page, baseURL }) => {
  await page.route("**/fake/anthropic/v1/messages", async (route) => {
    await route.fulfill({
      status: 401,
      json: { error: { message: ` rejected ${TEST_KEY}` } },
    });
  });
  await page.goto("/settings");
  await fillConfig(page, `${baseURL}/fake/anthropic/v1`, "anthropic-messages");
  await page.getByRole("button", { name: "测试连接" }).click();
  const error = page.getByTestId("settings.test.error_state");
  await expect(error).toContainText("[已隐藏]");
  await expect(error).not.toContainText(TEST_KEY);
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
