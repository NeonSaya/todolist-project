import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ConnectionResult, testConnection } from "@/lib/ai";
import {
  type AiConfig,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  useAiConfig,
} from "@/lib/aiConfig";
import { Boxes, Globe, KeyRound, Loader2, Plug, Save } from "lucide-react";
import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiKeyField } from "./ApiKeyField";
import { ClearConfigDialog } from "./ClearConfigDialog";
import { ConnectionStatus } from "./ConnectionStatus";
import { SettingGroup } from "./SettingGroup";

const DEFAULT_FORM: AiConfig = {
  baseUrl: DEFAULT_BASE_URL,
  apiKey: "",
  model: DEFAULT_MODEL,
};

interface FieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  hint: ReactNode;
  ocid: string;
  onChange: (value: string) => void;
}

function TextField({
  id,
  label,
  value,
  placeholder,
  hint,
  ocid,
  onChange,
}: FieldProps) {
  return (
    <>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        data-ocid={ocid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="h-11 rounded-xl bg-background font-mono text-sm transition-smooth"
      />
      <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">
      {children}
    </code>
  );
}

export function AiConfigForm() {
  const { config, save, clear } = useAiConfig();
  const [form, setForm] = useState<AiConfig>(config);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const formVersion = useRef(0);

  const update = (key: keyof AiConfig) => (value: string) => {
    formVersion.current += 1;
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const keyMissing = !form.apiKey.trim();

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    try {
      setForm(save(form));
      toast.success("AI 配置已保存", {
        description: "设置保存在本机，重新打开后依然有效。",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "无法保存 AI 配置");
    }
  };

  const handleTest = async () => {
    const version = formVersion.current;
    setTesting(true);
    setResult(null);
    const outcome = await testConnection({
      baseUrl: form.baseUrl.trim() || DEFAULT_BASE_URL,
      apiKey: form.apiKey.trim(),
      model: form.model.trim() || DEFAULT_MODEL,
    });
    if (version === formVersion.current) setResult(outcome);
    setTesting(false);
  };

  const handleClear = () => {
    try {
      clear();
      formVersion.current += 1;
      setForm(DEFAULT_FORM);
      setResult(null);
      toast.success("已清除 AI 配置");
    } catch {
      toast.error("无法从本机清除 AI 配置");
    }
  };

  return (
    <form
      onSubmit={handleSave}
      data-ocid="settings.form.panel"
      className="surface-card p-5 transition-theme md:p-7"
    >
      <div className="divide-y divide-border">
        <SettingGroup
          step={1}
          icon={Globe}
          title="接口地址"
          description="OpenAI 兼容服务的 Base URL。"
          ocid="settings.base_url.section"
        >
          <TextField
            id="ai-base-url"
            ocid="settings.base_url.input"
            label="Base URL"
            value={form.baseUrl}
            placeholder={DEFAULT_BASE_URL}
            onChange={update("baseUrl")}
            hint={
              <>
                填到版本路径即可，如 <Code>{DEFAULT_BASE_URL}</Code>
                ，末尾的 /chat/completions 会自动去掉。
              </>
            }
          />
        </SettingGroup>

        <SettingGroup
          step={2}
          icon={KeyRound}
          title="API Key"
          description="用于身份验证，仅保存在本机。"
          ocid="settings.api_key.section"
        >
          <ApiKeyField value={form.apiKey} onChange={update("apiKey")} />
        </SettingGroup>

        <SettingGroup
          step={3}
          icon={Boxes}
          title="模型"
          description="用于整理任务的模型 ID。"
          ocid="settings.model.section"
        >
          <TextField
            id="ai-model"
            ocid="settings.model.input"
            label="模型名称"
            value={form.model}
            placeholder={DEFAULT_MODEL}
            onChange={update("model")}
            hint={
              <>
                与服务商控制台中的模型 ID 一致，留空则使用{" "}
                <Code>{DEFAULT_MODEL}</Code>。
              </>
            }
          />
        </SettingGroup>
      </div>

      <ConnectionStatus testing={testing} result={result} />

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <ClearConfigDialog onConfirm={handleClear} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {keyMissing && (
            <p className="text-xs text-muted-foreground sm:mr-1">
              填写 API Key 后可测试连接
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            data-ocid="settings.test.secondary_button"
            disabled={testing || keyMissing}
            onClick={handleTest}
            className="h-10 rounded-lg transition-smooth"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plug className="h-4 w-4" aria-hidden />
            )}
            {testing ? "测试中…" : "测试连接"}
          </Button>
          <Button
            type="submit"
            data-ocid="settings.save_button"
            className="h-10 rounded-lg px-6 font-semibold shadow-xs transition-smooth hover:-translate-y-px hover:shadow-subtle active:translate-y-0 active:scale-[0.98]"
          >
            <Save className="h-4 w-4" aria-hidden />
            保存
          </Button>
        </div>
      </div>
    </form>
  );
}
