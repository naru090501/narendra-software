"use client";

import { useMemo, useState } from "react";
import {
  AlignLeft,
  ArrowUpRight,
  Binary,
  Braces,
  Code2,
  FileCode2,
  Lock,
  Menu,
  Search,
  Table2,
  X,
} from "lucide-react";
import { Badge, Input, cn } from "@narendra/ui";
import { sanitizeOptionalUrl } from "@/lib/site-url";
import { DEVELOPER_TOOLS, filterTools, type ToolId } from "@/lib/tools";
import { ThemeToggle } from "./theme-toggle";
import { Base64Tool } from "./tools/base64-tool";
import { CsvTool } from "./tools/csv-tool";
import { JsonTool } from "./tools/json-tool";
import { TextTool } from "./tools/text-tool";
import { XmlTool } from "./tools/xml-tool";

const TOOL_ICONS: Record<ToolId, typeof Braces> = {
  json: Braces,
  xml: FileCode2,
  csv: Table2,
  base64: Binary,
  text: AlignLeft,
};

const PORTFOLIO_URL = sanitizeOptionalUrl(process.env.NEXT_PUBLIC_PORTFOLIO_URL);

export function DeveloperToolboxWorkbench() {
  const [activeToolId, setActiveToolId] = useState<ToolId>("json");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const visibleTools = useMemo(() => filterTools(searchQuery), [searchQuery]);
  const activeTool =
    DEVELOPER_TOOLS.find((t) => t.id === activeToolId) ?? DEVELOPER_TOOLS[0]!;

  function selectTool(id: ToolId) {
    setActiveToolId(id);
    setMobileNavOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Close tool list" : "Open tool list"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted lg:hidden"
            >
              {mobileNavOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0d2347] text-sky-400 ring-1 ring-sky-400/30 dark:bg-sky-500/15 sm:h-9 sm:w-9">
                <Code2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  Narendra Developer Toolbox
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  Local-First Browser Utilities
                </span>
              </div>
            </div>

            <Badge variant="amber" className="hidden sm:inline-flex min-h-7 px-3 py-1">
              In Development
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="emerald" className="hidden md:inline-flex min-h-7 px-3 py-1">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              100% Local Processing
            </Badge>
            {PORTFOLIO_URL ? (
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted sm:inline-flex"
              >
                Narendra Software
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Two-Column Workbench */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Sidebar */}
        <aside
          aria-label="Developer tools navigation"
          className={cn(
            "w-full shrink-0 lg:flex lg:w-72 lg:flex-col",
            mobileNavOpen
              ? "fixed inset-x-0 top-16 bottom-0 z-20 overflow-y-auto border-b border-border bg-background p-4 lg:static lg:border-0 lg:p-0"
              : "hidden",
          )}
        >
          <div className="flex h-full flex-col justify-between space-y-4 rounded-2xl border border-border/80 bg-card p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Search tools..."
                  aria-label="Search developer tools"
                  className="h-11 rounded-xl pl-10 pr-9 text-sm"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear tool search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <nav aria-label="Tool list" className="space-y-1.5">
                {visibleTools.length > 0 ? (
                  visibleTools.map((tool) => {
                    const Icon = TOOL_ICONS[tool.id];
                    const isActive = tool.id === activeToolId;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => selectTool(tool.id)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive
                            ? "border-primary/30 bg-primary/10 text-primary dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-200"
                            : "border-transparent text-foreground hover:bg-muted",
                        )}
                      >
                        <Icon
                          className="mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">
                            {tool.name}
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                            {tool.description}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                    No tools match &ldquo;{searchQuery}&rdquo;.
                  </p>
                )}
              </nav>
            </div>

            <div className="mt-auto border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
              All parsing, encoding, and formatting execute locally inside your
              browser. Zero server uploads.
            </div>
          </div>
        </aside>

        {/* Active Tool Panel */}
        <main className="min-w-0 flex-1 space-y-5">
          {/* Mobile quick-switcher bar */}
          <div className="flex flex-wrap gap-1.5 lg:hidden">
            {DEVELOPER_TOOLS.map((tool) => {
              const active = tool.id === activeToolId;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => selectTool(tool.id)}
                  className={cn(
                    "min-h-8 shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {tool.shortName}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {activeTool.name}
              </h1>
              <p className="mt-1 break-words text-sm text-muted-foreground">
                {activeTool.description}
              </p>
            </div>
            <p className="shrink-0 font-mono text-[11px] text-muted-foreground">
              Shortcut: Ctrl/Cmd + Enter
            </p>
          </div>

          {activeToolId === "json" ? <JsonTool /> : null}
          {activeToolId === "xml" ? <XmlTool /> : null}
          {activeToolId === "csv" ? <CsvTool /> : null}
          {activeToolId === "base64" ? <Base64Tool /> : null}
          {activeToolId === "text" ? <TextTool /> : null}
        </main>
      </div>
    </div>
  );
}
