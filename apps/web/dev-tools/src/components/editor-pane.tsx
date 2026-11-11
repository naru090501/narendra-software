"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { AlertCircle, Check, CheckCircle2, Copy, Trash2 } from "lucide-react";
import { Button, Label, Textarea } from "@narendra/ui";

export interface EditorStatus {
  kind: "valid" | "error" | "info";
  message: string;
}

interface EditorWorkspaceProps {
  inputLabel: string;
  outputLabel: string;
  inputValue: string;
  outputValue: string;
  inputPlaceholder: string;
  outputPlaceholder: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  onPrimaryShortcut?: () => void;
  status?: EditorStatus | null;
  actions?: ReactNode;
  inputMeta?: string;
  outputMeta?: string;
}

export function EditorWorkspace({
  inputLabel,
  outputLabel,
  inputValue,
  outputValue,
  inputPlaceholder,
  outputPlaceholder,
  onInputChange,
  onClear,
  onPrimaryShortcut,
  status,
  actions,
  inputMeta,
  outputMeta,
}: EditorWorkspaceProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!outputValue || typeof navigator === "undefined") {
      return;
    }
    try {
      await navigator.clipboard.writeText(outputValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onPrimaryShortcut?.();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/80 p-3">
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={outputValue.length === 0}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy Output
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCopied(false);
              onClear();
            }}
            disabled={inputValue.length === 0 && outputValue.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </Button>
        </div>
      </div>

      {status ? (
        <div
          role={status.kind === "error" ? "alert" : "status"}
          className={
            status.kind === "error"
              ? "flex items-start gap-2.5 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-200"
              : status.kind === "valid"
                ? "flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-200"
                : "flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-xs text-sky-700 dark:text-sky-200"
          }
        >
          {status.kind === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="leading-relaxed">{status.message}</span>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="toolbox-input">{inputLabel}</Label>
            <span className="font-mono text-[11px] text-muted-foreground">
              {inputMeta ?? `${inputValue.length.toLocaleString()} chars`}
            </span>
          </div>
          <Textarea
            id="toolbox-input"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            spellCheck={false}
            className="min-h-[340px] resize-y font-mono text-xs leading-relaxed sm:min-h-[400px]"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="toolbox-output">{outputLabel}</Label>
            <span className="font-mono text-[11px] text-muted-foreground">
              {outputMeta ?? `${outputValue.length.toLocaleString()} chars`}
            </span>
          </div>
          <Textarea
            id="toolbox-output"
            value={outputValue}
            readOnly
            placeholder={outputPlaceholder}
            spellCheck={false}
            aria-readonly="true"
            className="min-h-[340px] resize-y bg-muted/35 font-mono text-xs leading-relaxed sm:min-h-[400px]"
          />
        </div>
      </div>
    </div>
  );
}
