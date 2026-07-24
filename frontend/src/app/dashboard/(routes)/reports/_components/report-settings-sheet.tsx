"use client";

import { IconCheck, IconLoader2, IconMail } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getReportSettingAction,
  updateReportSettingAction,
} from "@/actions/reports/actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import type { ReportFrequency } from "@/types/report";

interface ReportSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Side sheet for enabling scheduled report emails and choosing Weekly/Monthly.
 */
export function ReportSettingsSheet({
  open,
  onOpenChange,
}: ReportSettingsSheetProps) {
  const { data: session } = authClient.useSession();
  const signupEmail = session?.user?.email ?? "";

  const [isEnabled, setIsEnabled] = useState(true);
  const [frequency, setFrequency] = useState<ReportFrequency>("MONTHLY");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prefill from saved settings (or signup email) whenever the sheet opens
  useEffect(() => {
    if (!open) return;

    setLoadingSettings(true);
    getReportSettingAction()
      .then((result) => {
        const setting = result.setting;
        if (setting) {
          setIsEnabled(setting.isEnabled);
          setFrequency(setting.frequency ?? "MONTHLY");
          setEmail(setting.email ?? signupEmail);
        } else {
          setIsEnabled(true);
          setFrequency("MONTHLY");
          setEmail(signupEmail);
        }
      })
      .catch(() => {
        setEmail(signupEmail);
      })
      .finally(() => setLoadingSettings(false));
  }, [open, signupEmail]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateReportSettingAction({
        isEnabled,
        frequency,
        email: email.trim() || null,
        dayOfMonth: 1,
      });
      setSuccess(true);
      toast.success("Report settings saved!");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1200);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update settings",
      );
    } finally {
      setLoading(false);
    }
  }

  const scheduleSummary =
    frequency === "WEEKLY"
      ? "Report will be sent every Sunday."
      : "Report will be sent once a month on the 1st day of the next month.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[oklch(0.08_0.01_145)] border-white/10 overflow-y-auto"
        showCloseButton={true}
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-xl font-bold text-white">
            Report Settings
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            Enable or disable scheduled financial report emails
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          {loadingSettings ? (
            <div className="flex items-center justify-center py-16 text-zinc-500">
              <IconLoader2 size={22} className="animate-spin text-green-500" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Send Reports toggle */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-white">Send Reports</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {isEnabled ? "Reports activated" : "Reports deactivated"}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center ml-4">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                  />
                  <div
                    className={`h-6 w-11 rounded-full transition-colors duration-200 ${isEnabled ? "bg-green-500" : "bg-white/20"}`}
                  >
                    <div
                      className={`m-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${isEnabled ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </div>
                </label>
              </div>

              {/* Email override (defaults to signup email) */}
              <div>
                <label
                  htmlFor="report-email"
                  className="mb-1.5 block text-sm font-medium text-white"
                >
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <IconMail size={16} className="text-zinc-400 shrink-0" />
                  <input
                    id="report-email"
                    type="email"
                    className="w-full bg-transparent text-sm text-zinc-300 outline-none placeholder:text-zinc-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={signupEmail || "your@email.com"}
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Defaults to your account email. You can override it here.
                </p>
              </div>

              {/* Repeat On */}
              <div>
                <label
                  htmlFor="report-frequency"
                  className="mb-1.5 block text-sm font-medium text-white"
                >
                  Repeat On
                </label>
                <select
                  id="report-frequency"
                  className="w-full rounded-xl border border-white/10 bg-[oklch(0.10_0.01_145)] px-4 py-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as ReportFrequency)
                  }
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>

              {/* Schedule Summary */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm font-medium text-white mb-1">
                  Schedule Summary
                </h4>
                <p className="text-xs text-zinc-400">{scheduleSummary}</p>
              </div>

              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                  <IconCheck size={16} /> Settings saved successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                {loading && <IconLoader2 size={16} className="animate-spin" />}
                Save changes
              </button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
