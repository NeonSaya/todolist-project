import { Priority, TASK_NOTE_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@/types";
import { invoke, isTauri } from "@tauri-apps/api/core";
import {
  AI_PROTOCOL_META,
  type AiConfig,
  type AiProtocol,
  isAiConfigured,
  normalizeBaseUrl,
} from "./aiConfig";
import { addDays, parseLocalDate } from "./tasks";

/** A task proposed by AI from pasted text; reviewed before saving. */
export interface AiSuggestion {
  title: string;
  date: string | null;
  priority: Priority;
  note: string | null;
}

export type ConnectionResult =
  | { ok: true; model: string }
  | { ok: false; message: string };

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const WEEKDAY_DIGITS: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  日: 7,
  天: 7,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
};

function isoWeekday(dateStr: string): number {
  const d = parseLocalDate(dateStr);
  const day = d ? d.getDay() : 1;
  return day === 0 ? 7 : day;
}

function validDate(y: number, m: number, d: number): string | null {
  const date = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return parseLocalDate(date) ? date : null;
}

/** Resolve an ISO or relative Chinese date (明天, 下周三, 12月5日, 3天后) against `today`. */
export function resolveDate(raw: unknown, today: string): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim().replace(/\s+/g, "");
  if (!text || /^(null|none|无|没有|不确定)$/i.test(text)) return null;

  const iso = raw
    .trim()
    .match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})(?:[日号]|(?=$|[T\s]))/);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const fixed: Record<string, number> = {
    昨天: -1,
    今天: 0,
    今日: 0,
    今晚: 0,
    明天: 1,
    明日: 1,
    明早: 1,
    明晚: 1,
    后天: 2,
    大后天: 3,
  };
  for (const [word, offset] of Object.entries(fixed)) {
    if (text.startsWith(word)) return addDays(today, offset);
  }

  const after = text.match(/^(\d{1,3})天(后|之后|以后)/);
  if (after) return addDays(today, Number(after[1]));

  const week = text.match(
    /^(下下|下个?|这个?|本)?(周|星期|礼拜)([一二三四五六日天1-7])/,
  );
  if (week) {
    const target = WEEKDAY_DIGITS[week[3]];
    const monday = addDays(today, 1 - isoWeekday(today));
    const prefix = week[1] ?? "";
    const shift = prefix.startsWith("下下")
      ? 14
      : prefix.startsWith("下")
        ? 7
        : 0;
    let result = addDays(monday, target - 1 + shift);
    if (!prefix && result < today) result = addDays(result, 7);
    return result;
  }

  if (/^下周/.test(text)) return addDays(today, 8 - isoWeekday(today));

  const md = text.match(/^(\d{1,2})[月/-](\d{1,2})(?!\d)[日号]?/);
  if (md) {
    const year = Number(today.slice(0, 4));
    return validDate(year, Number(md[1]), Number(md[2]));
  }
  return null;
}

function normalizePriority(raw: unknown): Priority {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (["high", "高", "urgent", "紧急"].includes(value)) return Priority.high;
  if (["low", "低"].includes(value)) return Priority.low;
  return Priority.medium;
}

function cleanText(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  return text ? text.slice(0, max) : null;
}

function extractJson(content: string): unknown {
  const stripped = content
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    // fall through to bracket slicing
  }
  for (const [open, close] of [
    ["[", "]"],
    ["{", "}"],
  ] as const) {
    const start = stripped.indexOf(open);
    const end = stripped.lastIndexOf(close);
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(stripped.slice(start, end + 1));
      } catch {
        // try the next shape
      }
    }
  }
  throw new Error("AI 的回复无法解析为任务列表，请重试或换一种描述");
}

function toSuggestions(data: unknown, today: string): AiSuggestion[] {
  let items: unknown = data;
  if (items && typeof items === "object" && !Array.isArray(items)) {
    const obj = items as Record<string, unknown>;
    items = obj.tasks ?? obj.suggestions ?? obj.items ?? obj.todos ?? [obj];
  }
  if (!Array.isArray(items)) {
    throw new Error("AI 的回复格式不正确，请重试");
  }
  const result: AiSuggestion[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = cleanText(
      rec.title ?? rec.task ?? rec.name,
      TASK_TITLE_MAX_LENGTH,
    );
    if (!title) continue;
    result.push({
      title,
      date: resolveDate(rec.date ?? rec.due ?? rec.dueDate, today),
      priority: normalizePriority(rec.priority),
      note: cleanText(
        rec.note ?? rec.notes ?? rec.description,
        TASK_NOTE_MAX_LENGTH,
      ),
    });
  }
  return result;
}

function calendarHint(today: string): string {
  const labels = ["今天", "明天", "后天"];
  return Array.from({ length: 21 }, (_, i) => {
    const date = addDays(today, i);
    const d = parseLocalDate(date);
    const wd = d ? WEEKDAYS[d.getDay()] : "";
    return `${date} ${wd}${labels[i] ? `（${labels[i]}）` : ""}`;
  }).join("\n");
}

function systemPrompt(today: string): string {
  const d = parseLocalDate(today);
  const wd = d ? WEEKDAYS[d.getDay()] : "";
  return [
    "你是任务整理助手。把用户粘贴的文字（聊天记录、会议纪要、随手笔记等）拆分成清晰、可执行的待办任务。",
    `今天是 ${today}（${wd}），一周从周一开始；“下周三”指下一个自然周的周三。参考日历：`,
    calendarHint(today),
    "要求：",
    '1. 只输出 JSON，不要解释，不要 Markdown。格式：{"tasks":[{"title":string,"date":"YYYY-MM-DD"或null,"priority":"high"|"medium"|"low","note":string或null}]}',
    "2. title 用简洁中文动宾短语，不超过 30 字；note 放补充细节（时间点、地点、人物），没有则 null。",
    "3. 把“明天”“周五”“下周三”“月底”等相对日期换算为具体日期；没有提到日期则为 null。",
    "4. 紧急、重要、有明确截止的为 high，一般事项为 medium，可有可无的为 low。",
    '5. 没有可执行任务时返回 {"tasks":[]}。',
  ].join("\n");
}

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

function httpErrorMessage(status: number, detail: string): string {
  const suffix = detail ? `（${detail.slice(0, 160)}）` : "";
  if (status >= 300 && status < 400)
    return "AI 接口返回了重定向，请填写实际请求地址";
  if (status === 401)
    return `API Key 无效或已过期，请在 AI 设置中检查${suffix}`;
  if (status === 403) return `没有访问该模型或接口的权限${suffix}`;
  if (status === 404)
    return `接口地址或模型不存在，请检查 Base URL 与模型名称${suffix}`;
  if (status === 429) return `请求过于频繁或账户额度不足，请稍后再试${suffix}`;
  if (status === 400) return `请求被 AI 服务拒绝，请检查模型名称${suffix}`;
  if (status >= 500) return `AI 服务暂时不可用（HTTP ${status}），请稍后再试`;
  return `AI 服务返回错误（HTTP ${status}）${suffix}`;
}

interface AiHttpResponse {
  status: number;
  body: string;
}

async function sendAiRequest(
  endpoint: string,
  apiKey: string,
  protocol: AiProtocol,
  payload: Record<string, unknown>,
  timeoutMs: number,
): Promise<AiHttpResponse> {
  if (isTauri()) {
    try {
      return await invoke<AiHttpResponse>("send_ai_request", {
        endpoint,
        apiKey,
        protocol,
        payload,
        timeoutMs,
      });
    } catch (error) {
      if (error === "timedOut") throw new Error("AI 服务响应超时，请稍后再试");
      if (error === "responseTooLarge")
        throw new Error("AI 回复过长，请缩短输入后重试");
      throw new Error("无法连接到 AI 服务，请检查接口地址与网络");
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (protocol === "anthropic-messages") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
    });
    return { status: response.status, body: await response.text() };
  } catch {
    if (controller.signal.aborted) {
      throw new Error("AI 服务响应超时，请稍后再试");
    }
    throw new Error(
      "无法连接到 AI 服务，请检查接口地址、网络或跨域（CORS）设置",
    );
  } finally {
    window.clearTimeout(timer);
  }
}

function requestPayload(
  config: AiConfig,
  messages: ChatMessage[],
  maxTokens: number,
): Record<string, unknown> {
  if (config.protocol === "openai-chat") {
    return { model: config.model, messages };
  }

  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const userMessages = messages.filter((message) => message.role === "user");
  if (config.protocol === "anthropic-messages") {
    return {
      model: config.model,
      max_tokens: maxTokens,
      system: system || undefined,
      messages: userMessages,
    };
  }
  return {
    model: config.model,
    max_output_tokens: maxTokens,
    instructions: system || undefined,
    input: userMessages,
  };
}

function textBlocks(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const text = (block as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}

function responseText(protocol: AiProtocol, body: unknown): string {
  if (!body || typeof body !== "object") return "";
  if (protocol === "anthropic-messages") {
    return textBlocks((body as { content?: unknown }).content);
  }
  if (protocol === "openai-chat") {
    const content = (
      body as { choices?: { message?: { content?: unknown } }[] }
    ).choices?.[0]?.message?.content;
    return typeof content === "string" ? content : textBlocks(content);
  }

  const outputText = (body as { output_text?: unknown }).output_text;
  if (typeof outputText === "string") return outputText;
  const output = (body as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";
  return output
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      if ((item as { type?: unknown }).type !== "message") return "";
      return textBlocks((item as { content?: unknown }).content);
    })
    .join("");
}

async function complete(
  config: AiConfig,
  messages: ChatMessage[],
  timeoutMs: number,
  maxTokens: number,
): Promise<string> {
  if (!isAiConfigured(config)) {
    throw new Error("尚未配置 AI，请先在 AI 设置中填写 API Key");
  }
  const endpoint = new URL(normalizeBaseUrl(config.baseUrl));
  const basePath = endpoint.pathname.replace(/\/$/, "");
  const endpointPath =
    config.protocol === "anthropic-messages" && !basePath.endsWith("/v1")
      ? "/v1/messages"
      : AI_PROTOCOL_META[config.protocol].endpointPath;
  endpoint.pathname = `${basePath}${endpointPath}`;
  const response = await sendAiRequest(
    endpoint.href,
    config.apiKey,
    config.protocol,
    requestPayload(config, messages, maxTokens),
    timeoutMs,
  );
  let body: unknown = null;
  try {
    body = JSON.parse(response.body);
  } catch {
    body = null;
  }
  if (response.status < 200 || response.status >= 300) {
    const errObj = (body as { error?: { message?: unknown } | string } | null)
      ?.error;
    const message =
      typeof errObj === "string"
        ? errObj
        : typeof errObj?.message === "string"
          ? errObj.message
          : "";
    throw new Error(
      httpErrorMessage(
        response.status,
        message.replaceAll(config.apiKey, "[已隐藏]"),
      ),
    );
  }
  const content = responseText(config.protocol, body);
  if (!content.trim()) {
    throw new Error(
      `AI 返回了空的或无法识别的回复，请检查接口是否兼容 ${AI_PROTOCOL_META[config.protocol].label}`,
    );
  }
  return content;
}

/** Ask the configured model to turn free text into task suggestions. */
export async function analyzeText(
  text: string,
  today: string,
  config: AiConfig,
): Promise<AiSuggestion[]> {
  const input = text.trim();
  if (!input) throw new Error("请先粘贴或输入要整理的内容");
  const content = await complete(
    config,
    [
      { role: "system", content: systemPrompt(today) },
      { role: "user", content: input.slice(0, 12000) },
    ],
    60_000,
    4096,
  );
  return toSuggestions(extractJson(content), today);
}

/** Send a tiny request to verify base URL, key and model. */
export async function testConnection(
  config: AiConfig,
): Promise<ConnectionResult> {
  try {
    await complete(
      config,
      [{ role: "user", content: "请只回复：OK" }],
      20_000,
      64,
    );
    return { ok: true, model: config.model };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "连接失败，请稍后再试",
    };
  }
}
