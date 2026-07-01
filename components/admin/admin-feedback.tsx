import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

import type { AdminFeedback } from "@/lib/admin/ui";

export function AdminFeedbackBanner({ feedback }: { feedback: AdminFeedback }) {
  const isSuccess = feedback.tone === "success";
  const Icon = isSuccess ? CheckCircle2Icon : AlertCircleIcon;

  return (
    <section
      className={
        isSuccess
          ? "rounded-[16px] border border-emerald-200 bg-emerald-50/90 px-5 py-4 text-emerald-950 shadow-[0_12px_28px_rgba(31,26,23,0.04)]"
          : "rounded-[16px] border border-rose-200 bg-rose-50/90 px-5 py-4 text-rose-950 shadow-[0_12px_28px_rgba(31,26,23,0.04)]"
      }
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <p className="text-[15px] leading-7">{feedback.message}</p>
      </div>
    </section>
  );
}
