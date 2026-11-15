import type { ProjectShowcase } from "@narendra/types";

export function ProjectPreview({
  type,
  caption,
}: {
  type: ProjectShowcase["screenshotPreviewType"];
  caption: string;
}) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-border bg-[#071327] text-slate-200">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-[#0b1c36] px-3 py-2.5 sm:px-4">
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
        </div>
        <span
          className="min-w-0 truncate font-mono text-[11px] text-sky-300/80"
          title={caption}
        >
          {caption}
        </span>
      </div>

      <div className="p-3.5 sm:p-5">
        {type === "portfolio-architecture" ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="break-words rounded-lg border border-sky-400/30 bg-sky-500/10 p-3 text-sky-200">
              apps/web/portfolio &rarr; Central Hub (Next.js App Router)
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
              <div className="min-w-0 break-words rounded-lg border border-slate-700 bg-slate-900/70 p-2.5 text-slate-300">
                @narendra/ui
              </div>
              <div className="min-w-0 break-words rounded-lg border border-slate-700 bg-slate-900/70 p-2.5 text-slate-300">
                @narendra/core
              </div>
              <div className="min-w-0 break-words rounded-lg border border-slate-700 bg-slate-900/70 p-2.5 text-slate-300">
                @narendra/supabase
              </div>
              <div className="min-w-0 break-words rounded-lg border border-slate-700 bg-slate-900/70 p-2.5 text-slate-300">
                @narendra/types
              </div>
            </div>
            <div className="break-words rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-emerald-300">
              Supabase narendramain &bull; RLS Enabled
            </div>
          </div>
        ) : null}

        {type === "developer-toolbox" ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
              <span className="min-w-0 break-words text-sky-300">
                JSON &bull; XML &bull; CSV &bull; Base64
              </span>
              <span className="shrink-0 whitespace-nowrap rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                Client-Local
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
              <div className="min-w-0 break-words rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-slate-400">
                {"{ \"mode\": \"zero-upload\" }"}
              </div>
              <div className="min-w-0 break-words rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sky-200">
                Parsed in Browser &check;
              </div>
            </div>
          </div>
        ) : null}

        {type === "document-tools" ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
              <span className="min-w-0 break-words text-sky-300">
                PDF &harr; Excel &harr; Structured Data
              </span>
              <span className="shrink-0 whitespace-nowrap rounded bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">
                In Development
              </span>
            </div>
            <div className="break-words rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-slate-300">
              Local Stream &rarr; Validation &rarr; Export Artifact
            </div>
          </div>
        ) : null}

        {type === "windows-usb" ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
              <span className="min-w-0 break-words text-sky-300 [overflow-wrap:anywhere]">
                dotnet/NarendraSoftware.slnx
              </span>
              <span className="shrink-0 whitespace-nowrap rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-200">
                .NET 10 LTS
              </span>
            </div>
            <div className="break-words rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-slate-300">
              Drive Verification &rarr; Checksum &rarr; Isolated Write Scope
            </div>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
