"use client";

import { useMemo, useState } from "react";
import { Button, Card } from "@narendra/ui";
import { analyzeText, cleanWhitespace } from "@/lib/tools";
import { EditorWorkspace, type EditorStatus } from "../editor-pane";

const SAMPLE_TEXT = `  Narendra   Software  —   Developer Toolbox   

  Line two   has   extra    tabs		and trailing spaces.  


  Line four follows multiple blank lines.  `;

export function TextTool() {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<EditorStatus | null>(null);

  const stats = useMemo(() => analyzeText(input), [input]);
  const outputStats = useMemo(() => analyzeText(output), [output]);

  function runCleanup(
    label: string,
    options: Parameters<typeof cleanWhitespace>[1],
  ) {
    if (input.length === 0) {
      setStatus({
        kind: "error",
        message: "Input is empty. Enter text to analyze or clean.",
      });
      return;
    }
    const cleaned = cleanWhitespace(input, options);
    setOutput(cleaned);
    setStatus({
      kind: "valid",
      message: `${label} complete (${cleaned.length.toLocaleString()} chars output).`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Characters
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            {stats.characters.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            No Spaces
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            {stats.charactersNoSpaces.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Words
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            {stats.words.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Lines
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            {stats.lines.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Non-Empty Lines
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            {stats.nonEmptyLines.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            UTF-8 Bytes
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            {stats.bytes.toLocaleString()}
          </p>
        </Card>
      </div>

      <EditorWorkspace
        inputLabel="Text Input (live metrics update as you type)"
        outputLabel="Cleaned Text Output"
        inputValue={input}
        outputValue={output}
        inputPlaceholder="Paste or type text to count characters, words, lines, and clean whitespace..."
        outputPlaceholder="Cleaned text appears here..."
        onInputChange={setInput}
        onClear={() => {
          setInput("");
          setOutput("");
          setStatus(null);
        }}
        onPrimaryShortcut={() =>
          runCleanup("Full whitespace cleanup", {
            trimLines: true,
            collapseSpaces: true,
            collapseBlankLines: true,
          })
        }
        status={status}
        inputMeta={`${stats.words} words • ${stats.lines} lines • ${stats.bytes} B`}
        outputMeta={`${outputStats.words} words • ${outputStats.lines} lines • ${outputStats.bytes} B`}
        actions={
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                runCleanup("Full whitespace cleanup", {
                  trimLines: true,
                  collapseSpaces: true,
                  collapseBlankLines: true,
                })
              }
            >
              Clean Whitespace
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runCleanup("Trim lines", {
                  trimLines: true,
                  collapseSpaces: false,
                  collapseBlankLines: false,
                })
              }
            >
              Trim Lines
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runCleanup("Collapse spaces", {
                  trimLines: false,
                  collapseSpaces: true,
                  collapseBlankLines: false,
                })
              }
            >
              Collapse Spaces
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runCleanup("Remove blank lines", {
                  trimLines: true,
                  collapseSpaces: true,
                  removeBlankLines: true,
                })
              }
            >
              Remove Blank Lines
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput(SAMPLE_TEXT);
                setStatus(null);
              }}
            >
              Sample
            </Button>
          </>
        }
      />
    </div>
  );
}
