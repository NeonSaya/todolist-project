import { useSyncExternalStore } from "react";

/** OpenAI-compatible connection settings, kept only in this browser. */
export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const DEFAULT_BASE_URL = "https://api.openai.com/v1";
export const DEFAULT_MODEL = "gpt-4o-mini";

const STORAGE_KEY = "shixu.ai-config.v1";
const DEFAULT_CONFIG: AiConfig = {
  baseUrl: DEFAULT_BASE_URL,
  apiKey: "",
  model: DEFAULT_MODEL,
};

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedConfig: AiConfig = DEFAULT_CONFIG;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): AiConfig {
  if (!raw) return DEFAULT_CONFIG;
  try {
    const data = JSON.parse(raw) as Partial<AiConfig>;
    return {
      baseUrl:
        typeof data.baseUrl === "string" && data.baseUrl.trim()
          ? data.baseUrl.trim()
          : DEFAULT_BASE_URL,
      apiKey: typeof data.apiKey === "string" ? data.apiKey.trim() : "",
      model:
        typeof data.model === "string" && data.model.trim()
          ? data.model.trim()
          : DEFAULT_MODEL,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Current stored config (stable reference until storage changes). */
export function getAiConfig(): AiConfig {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedConfig = parse(raw);
  }
  return cachedConfig;
}

export function isAiConfigured(config: AiConfig): boolean {
  return Boolean(config.apiKey && config.baseUrl && config.model);
}

/** Strip trailing slashes and a pasted `/chat/completions` suffix. */
export function normalizeBaseUrl(url: string): string {
  const message = "请输入有效的 HTTP 或 HTTPS 接口地址";
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error(message);
  }
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.hash
  ) {
    throw new Error(message);
  }
  const path = parsed.pathname
    .replace(/\/+$/, "")
    .replace(/\/chat\/completions$/, "");
  return `${parsed.origin}${path}${parsed.search}`;
}

function emit() {
  for (const listener of listeners) listener();
}

export function saveAiConfig(config: AiConfig): AiConfig {
  const next: AiConfig = {
    baseUrl: normalizeBaseUrl(config.baseUrl.trim() || DEFAULT_BASE_URL),
    apiKey: config.apiKey.trim(),
    model: config.model.trim() || DEFAULT_MODEL,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error("无法将 AI 配置保存到本机");
  }
  emit();
  return next;
}

export function clearAiConfig(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAiConfig() {
  const config = useSyncExternalStore(
    subscribe,
    getAiConfig,
    () => DEFAULT_CONFIG,
  );
  return {
    config,
    isConfigured: isAiConfigured(config),
    save: saveAiConfig,
    clear: clearAiConfig,
  };
}
