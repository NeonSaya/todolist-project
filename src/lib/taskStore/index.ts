import { localTaskStore } from "./local";
import type { TaskStore } from "./types";

function configured(value: unknown) {
  const clean = typeof value === "string" ? value.trim() : "";
  return clean && clean !== "undefined" ? clean : undefined;
}

async function loadWebStore(): Promise<TaskStore> {
  const config: {
    backend_canister_id?: unknown;
    backend_host?: unknown;
  } | null = await fetch("/env.json", { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
  const canisterId = configured(config?.backend_canister_id);
  if (!canisterId) return localTaskStore;

  const { createCanisterTaskStore } = await import("./canister");
  return createCanisterTaskStore(canisterId, configured(config?.backend_host));
}

let webStore: Promise<TaskStore> | undefined;

export async function getTaskStore(): Promise<TaskStore> {
  if (import.meta.env.MODE === "desktop") return localTaskStore;
  webStore ??= loadWebStore().catch((error) => {
    webStore = undefined;
    throw error;
  });
  return webStore;
}
