import type { Metadata } from "next";
import Link from "next/link";
import {
  AlignLeft,
  ArrowLeft,
  ArrowUpRight,
  Binary,
  CheckCircle2,
  Code2,
  FileCode,
  Info,
  Lock,
  LucideIcon,
  Shield,
  Sparkles,
  Table2,
  Terminal,
} from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonVariants,
  cn,
} from "@narendra/ui";

export const metadata: Metadata = {
  title: "Developer Toolbox Documentation",
  description:
    "Comprehensive technical documentation for Developer Toolbox by Narendra Software: 100% browser-local JSON, XML, CSV, Base64, and text utilities with zero server upload.",
};

interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
  badge: string;
  description: string;
  specs: string[];
}

function FeatureCard({ title, icon: Icon, badge, description, specs }: FeatureCardProps) {
  return (
    <Card className="flex flex-col justify-between border-border/80 bg-card/80">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <Badge variant="slate" className="font-mono text-[11px]">
            {badge}
          </Badge>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ul className="space-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          {specs.map((spec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary dark:text-sky-400">•</span>
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function DeveloperToolboxDocsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Navigation Breadcrumb & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Product Registry
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Live & Deployed
          </Badge>
          <Badge variant="slate" className="font-mono text-xs">
            v0.1.0
          </Badge>
        </div>
      </div>

      {/* Hero Header */}
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
          <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
          Technical Documentation
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Developer Toolbox Documentation
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          An engineering guide to the Narendra Software Developer Toolbox. Explore the
          complete feature set of our client-side JSON, XML, CSV, Base64, and text processing
          workbench—engineered for privacy, instant feedback, and zero server round-trips.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="https://narendra-dev-tools.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "gap-2")}
          >
            <span>Launch Developer Toolbox</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="https://github.com/naru090501/narendra-software/tree/main/apps/web/dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "md" }), "gap-2")}
          >
            <span>View Source on GitHub</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* Quick Navigation / Table of Contents */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          Table of Contents
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <a href="#introduction" className="text-muted-foreground hover:text-accent">
            1. Introduction & Overview
          </a>
          <a href="#features-overview" className="text-muted-foreground hover:text-accent">
            2. Features & Supported Utilities
          </a>
          <a href="#json-tool" className="text-muted-foreground hover:text-accent">
            3. JSON Formatter, Minifier & Validator
          </a>
          <a href="#xml-tool" className="text-muted-foreground hover:text-accent">
            4. XML Formatter & Parser
          </a>
          <a href="#csv-tool" className="text-muted-foreground hover:text-accent">
            5. CSV & JSON Bidirectional Converter
          </a>
          <a href="#base64-tool" className="text-muted-foreground hover:text-accent">
            6. Base64 Unicode & URL-Safe Encoding
          </a>
          <a href="#text-tool" className="text-muted-foreground hover:text-accent">
            7. Multi-Task Text Transformation Pipeline
          </a>
          <a href="#privacy-architecture" className="text-muted-foreground hover:text-accent">
            8. Privacy & Local-First Processing
          </a>
          <a href="#usage-limitations" className="text-muted-foreground hover:text-accent">
            9. Usage Instructions & Limitations
          </a>
        </div>
      </section>

      {/* Section 1: Introduction */}
      <section id="introduction" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            1
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Introduction</h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Developers frequently need to inspect payloads, format minified configuration
            files, convert spreadsheet exports, and decode tokens. Unfortunately, most
            online tools require pasting confidential production payloads into cloud servers,
            risking compliance violations, API key leakage, and private customer data exposure.
          </p>
          <p>
            <strong>Developer Toolbox</strong> solves this by running 100% inside your browser
            tab. Built with React 19, Next.js, and TypeScript, it performs all parsing,
            validation, and string transformations locally. No data ever crosses a network boundary.
          </p>
        </div>
      </section>

      {/* Section 2: Features & Supported Utilities */}
      <section id="features-overview" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            2
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Features & Supported Utilities</h2>
        </div>
        <p className="text-base text-muted-foreground">
          The toolbox includes five purpose-built utilities accessible through a unified,
          keyboard-friendly workbench:
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="JSON Formatter"
            icon={FileCode}
            badge="json"
            description="Format, minify, and validate JSON documents with pinpoint line/column error reporting."
            specs={[
              "Indentation: 2 spaces, 4 spaces, or Tabs",
              "Syntax error line and column pointer",
              "Real-time byte and line count metrics",
              "10 MB safety threshold for large payloads",
            ]}
          />
          <FeatureCard
            title="XML Formatter"
            icon={Code2}
            badge="xml"
            description="Format and minify XML using the browser-native DOMParser engine."
            specs={[
              "Indentation: 2 or 4 spaces",
              "Preserves comments & CDATA blocks",
              "Root tag and element node statistics",
              "Zero regex-based parsing pitfalls",
            ]}
          />
          <FeatureCard
            title="CSV Converter"
            icon={Table2}
            badge="csv"
            description="Bidirectional RFC 4180 conversion between CSV and JSON array formats."
            specs={[
              "CSV to JSON & JSON to CSV",
              "Delimiters: Comma, Semicolon, Tab",
              "Header row auto-mapping",
              "Handles multiline and escaped quotes",
            ]}
          />
          <FeatureCard
            title="Base64 Encoder"
            icon={Binary}
            badge="base64"
            description="Encode and decode text with full UTF-8 Unicode support and URL-safe modes."
            specs={[
              "Lossless UTF-8 multibyte encoding",
              "URL-safe (+/- and /_ substitution)",
              "Automatic padding strip option",
              "Input and output byte size tracking",
            ]}
          />
          <FeatureCard
            title="Text Utilities"
            icon={AlignLeft}
            badge="text"
            description="Multi-task pipeline for cleanup, 9-case conversions, line sorting, and metrics."
            specs={[
              "Live character, word, and line metrics",
              "Unicode code point & byte analysis",
              "9 case conversions & line filters",
              "Whitespace and line ending normalization",
            ]}
          />
          <FeatureCard
            title="Privacy Engine"
            icon={Shield}
            badge="security"
            description="Zero-upload architecture ensuring payloads stay entirely within your local memory."
            specs={[
              "Zero network telemetry on input data",
              "No cookies, session stores, or logins",
              "Runs deterministically in browser runtime",
              "Safe for proprietary payloads & keys",
            ]}
          />
        </div>
      </section>

      {/* Section 3: JSON Formatter */}
      <section id="json-tool" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            3
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            JSON Formatting, Validation & Minification
          </h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            The JSON utility parses raw text using browser-native JSON engines to format,
            compact, or validate payloads with precision diagnostics.
          </p>

          <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Operational Capabilities:</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>
                <strong>Custom Indentation:</strong> Pretty-print JSON with 2 spaces, 4
                spaces, or real tab characters (<code>\t</code>).
              </li>
              <li>
                <strong>Minification:</strong> Strips all extraneous indentation and newlines,
                reducing payload size for compact storage or wire transfer.
              </li>
              <li>
                <strong>Accurate Error Location:</strong> When syntax errors occur (such as
                trailing commas or unclosed brackets), the parser extracts position indices and
                reports the exact <code>line</code> and <code>column</code> where the syntax broke.
              </li>
              <li>
                <strong>Size Threshold Warnings:</strong> Flags inputs larger than 512 KB to
                alert users about potential rendering latency, and enforces a 10 MB maximum
                safety threshold to prevent browser tab crashes.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: XML Formatter */}
      <section id="xml-tool" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            4
          </span>
          <h2 className="text-2xl font-bold tracking-tight">XML Formatting & Validation</h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Unlike naive regex-based XML tools, Narendra Software Developer Toolbox utilizes the
            browser-native <code>DOMParser</code> API (MIME type <code>text/xml</code>). This
            ensures complete adherence to the W3C XML recommendation.
          </p>

          <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Key Technical Details:</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>
                <strong>DOM Integrity:</strong> Elements are recursively traversed and indented
                cleanly with 2 or 4 spaces.
              </li>
              <li>
                <strong>Declaration & Comment Preservation:</strong> Retains standard XML
                prolog declarations (e.g. <code>&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</code>),
                XML comments (<code>&lt;!-- ... --&gt;</code>), and <code>&lt;![CDATA[ ... ]]&gt;</code> blocks.
              </li>
              <li>
                <strong>Parser Error Extraction:</strong> Scans the resulting DOM for native
                <code>parsererror</code> nodes and formats readable error descriptions.
              </li>
              <li>
                <strong>Document Stats:</strong> Displays the root tag name and the total
                element node count for quick hierarchy verification.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: CSV Converter */}
      <section id="csv-tool" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            5
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            CSV to JSON & JSON to CSV Bidirectional Conversion
          </h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            The CSV converter provides bidirectional transformation between tabular spreadsheet data
            and JSON structures, strictly implementing RFC 4180 rules.
          </p>

          <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Supported Features:</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>
                <strong>Delimiter Flexibility:</strong> Switch between Comma (<code>,</code>),
                Semicolon (<code>;</code>), or Tab (<code>\t</code> / TSV) with one click.
              </li>
              <li>
                <strong>Header Configuration:</strong> Toggle whether the first row represents
                column header keys or raw data.
              </li>
              <li>
                <strong>Escaping & Multiline Records:</strong> Fully handles embedded commas,
                escaped quotes (<code>&quot;&quot;</code>), and multiline cell content wrapped in double quotes.
              </li>
              <li>
                <strong>JSON Array Ingestion:</strong> In JSON-to-CSV mode, accepts either an array
                of objects (generating union headers across objects) or an array of primitive arrays.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6: Base64 Tool */}
      <section id="base64-tool" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            6
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Base64 Encoding & Decoding with Full Unicode Support
          </h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Standard browser <code>btoa</code> and <code>atob</code> functions fail when
            encountering characters outside the Latin-1 range (0x00 to 0xFF). Our Base64 tool
            bridges this gap with a modern <code>TextEncoder</code> and <code>TextDecoder</code>
            pipeline.
          </p>

          <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Technical Guarantees:</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>
                <strong>Lossless UTF-8 Unicode:</strong> Accurately encodes multibyte characters,
                Asian scripts, Cyrillic text, and emojis without encoding errors or corruption.
              </li>
              <li>
                <strong>URL-Safe Base64 (RFC 4648 §5):</strong> Replaces standard <code>+</code>
                with <code>-</code>, <code>/</code> with <code>_</code>, and removes trailing <code>=</code>
                padding for safe usage in query parameters and JWT tokens.
              </li>
              <li>
                <strong>Chunked Binary Processing:</strong> Uses 32 KB chunking to prevent call-stack
                overflows on large binary payloads.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 7: Text Utilities */}
      <section id="text-tool" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            7
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Multi-Task Text Transformation Pipeline
          </h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            The Text utility offers an interactive transformation workbench combining deep
            lexical statistics with a multi-task pipeline that can apply multiple transformations in a single pass.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Deep Text Statistics</h3>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Character count (UTF-16 length)</li>
                <li>Unicode code points (accurate emoji counting)</li>
                <li>Characters without spaces</li>
                <li>Word and line counts</li>
                <li>Non-empty line counter</li>
                <li>Total UTF-8 encoded byte size</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">9 Case Conversions</h3>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><code>UPPERCASE</code> & <code>lowercase</code></li>
                <li><code>Title Case</code> & <code>Sentence case</code></li>
                <li><code>camelCase</code> & <code>PascalCase</code></li>
                <li><code>kebab-case</code> & <code>snake_case</code></li>
                <li><code>CONSTANT_CASE</code></li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Multi-Task Pipeline Ordering & Execution:
            </h3>
            <p className="text-xs text-muted-foreground">
              Transformations execute in a deterministic sequence to prevent conflicting operations:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs">
              <li>
                <strong>Line Operations:</strong> Deduplication (<code>removeDuplicateLines</code>),
                sorting (Ascending / Descending), and line reversal.
              </li>
              <li>
                <strong>Character Filters:</strong> Strip numeric digits (<code>[0-9]</code>),
                remove punctuation, or remove special characters.
              </li>
              <li>
                <strong>Case Transformations:</strong> Converts tokens into the target casing model.
              </li>
              <li>
                <strong>Whitespace & Line Endings:</strong> Trims lines, collapses multi-spaces,
                collapses blank lines, and normalizes CRLF line endings to standard LF.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Section 8: Privacy & Local-First Processing */}
      <section id="privacy-architecture" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            8
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Privacy & Local-First Processing Explanation
          </h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Lock className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Narendra Software Zero-Upload Guarantee</p>
              <p className="leading-relaxed">
                Developer Toolbox is architected as an isolated client-side application. No server
                endpoints, external AI models, analytics trackers, or logging services ever receive
                the text or payloads you paste into the workbench.
              </p>
            </div>
          </div>

          <p>
            All parsing, formatting, and conversion tasks occur strictly within your browser&apos;s
            JavaScript memory thread. You can verify this independently by opening your browser&apos;s
            Developer Tools (Network tab) and inspecting traffic: no HTTP requests are dispatched during
            any formatting, encoding, or transformation operation.
          </p>
        </div>
      </section>

      {/* Section 9: Usage Instructions & Limitations */}
      <section id="usage-limitations" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-sky-400/10 dark:text-sky-300">
            9
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Usage Instructions & Known Limitations
          </h2>
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary dark:text-sky-400" />
                Usage Instructions
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Switching Tools:</strong> Select a tool from the sidebar or search bar
                  (supports keywords like &quot;pretty&quot;, &quot;minify&quot;, &quot;base64&quot;).
                </li>
                <li>
                  <strong>One-Click Copy:</strong> Use the &quot;Copy&quot; button above the output pane
                  to quickly place transformed output into your system clipboard.
                </li>
                <li>
                  <strong>Quick Clear:</strong> Clear button quickly resets the active editor pane
                  without reloading the page.
                </li>
                <li>
                  <strong>Mobile Friendly:</strong> The responsive drawer allows effortless mobile
                  navigation across all 5 utilities.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-500" />
                Known Limitations
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>10 MB Safety Threshold:</strong> Inputs larger than 10 MB are rejected
                  to prevent browser UI freezes and memory crashes.
                </li>
                <li>
                  <strong>DOMParser Environment:</strong> XML validation requires standard browser
                  APIs (not supported in non-browser server execution environments).
                </li>
                <li>
                  <strong>RFC 4180 Strictness:</strong> CSV parsing requires properly paired quotes.
                  Mismatched quotes will raise syntax errors.
                </li>
                <li>
                  <strong>Volatile Memory:</strong> Payloads are not stored in local storage or cookies;
                  reloading or closing the browser tab resets the input field.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <footer className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-8 text-center space-y-5">
        <h2 className="text-xl font-bold sm:text-2xl">
          Ready to use Narendra Software Developer Toolbox?
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Open the web application directly in your browser. No registration, no cookies, and 100% free.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://narendra-dev-tools.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "gap-2")}
          >
            <span>Open Developer Toolbox</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: "outline", size: "md" }))}
          >
            Explore Other Products
          </Link>
        </div>
      </footer>
    </div>
  );
}
