import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface ApiKeyFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApiKeyField({ value, onChange }: ApiKeyFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Label
        htmlFor="ai-api-key"
        className="text-sm font-medium text-foreground"
      >
        密钥
      </Label>
      <div className="relative">
        <Input
          id="ai-api-key"
          data-ocid="settings.api_key.input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-…"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="ai-api-key-privacy"
          className="h-11 rounded-xl bg-background pr-12 font-mono text-sm tracking-wide transition-smooth"
        />
        <button
          type="button"
          data-ocid="settings.api_key.toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "隐藏 API Key" : "显示 API Key"}
          aria-pressed={visible}
          className="focus-ring absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      <div
        id="ai-api-key-privacy"
        data-ocid="settings.api_key.privacy_panel"
        className="bg-success-soft flex items-start gap-2.5 rounded-xl border border-success/25 px-3.5 py-3 transition-theme"
      >
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-success"
          aria-hidden
        />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-foreground">
            Key 仅保存在本地浏览器
          </p>
          <p className="mt-0.5 text-muted-foreground">
            不会上传到拾序服务器，其他访问者也看不到；请求由你的浏览器直接发往所填接口。
          </p>
        </div>
      </div>
    </>
  );
}
