import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface ClearConfigDialogProps {
  onConfirm: () => void;
}

export function ClearConfigDialog({ onConfirm }: ClearConfigDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-ocid="settings.clear.open_modal_button"
          className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          清除配置
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        data-ocid="settings.clear.dialog"
        className="rounded-2xl shadow-float sm:max-w-sm"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            清除 AI 配置？
          </AlertDialogTitle>
          <AlertDialogDescription>
            将从本机删除已保存的接口地址、API Key
            和模型名称，智能添加会暂停使用，直到你重新配置。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            data-ocid="settings.clear.cancel_button"
            className="rounded-full"
          >
            取消
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            data-ocid="settings.clear.confirm_button"
            className="rounded-full"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            确认清除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
