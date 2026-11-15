"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button, Select } from "@narendra/ui";
import { csvToJson, jsonToCsv } from "@/lib/tools";
import { EditorWorkspace, type EditorStatus } from "../editor-pane";

const SAMPLE_CSV = `name,category,notes
"Developer Toolbox","Developer Tools","Supports ""escaped quotes"", commas, and
multiline notes"
"Document Tools","Documents","Local-first PDF & Excel"`;

const SAMPLE_JSON = JSON.stringify(
  [
    {
      name: "Developer Toolbox",
      category: "Developer Tools",
      notes: 'Supports "escaped quotes", commas, and\nmultiline notes',
    },
    {
      name: "Document Tools",
      category: "Documents",
      notes: "Local-first PDF & Excel",
    },
  ],
  null,
  2,
);

export function CsvTool() {
  const [input, setInput] = useState(SAMPLE_CSV);
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState<"," | ";" | "\t">(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [status, setStatus] = useState<EditorStatus | null>(null);

  function handleCsvToJson() {
    const result = csvToJson(input, { delimiter, hasHeader });
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    setStatus({
      kind: "valid",
      message: `Converted ${result.rowCount} CSV row(s) across ${result.columnCount} column(s) to JSON.`,
    });
  }

  function handleJsonToCsv() {
    const result = jsonToCsv(input, delimiter);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    setStatus({
      kind: "valid",
      message: `Generated CSV with ${result.rowCount} record(s) and ${result.columnCount} column(s).`,
    });
  }

  function handleSwap() {
    if (!output) {
      return;
    }
    setInput(output);
    setOutput("");
    setStatus(null);
  }

  return (
    <EditorWorkspace
      inputLabel="CSV or JSON Input"
      outputLabel="Converted Output"
      inputValue={input}
      outputValue={output}
      inputPlaceholder="Paste CSV rows or a JSON array of objects..."
      outputPlaceholder="Converted JSON or CSV output appears here..."
      onInputChange={setInput}
      onClear={() => {
        setInput("");
        setOutput("");
        setStatus(null);
      }}
      onPrimaryShortcut={handleCsvToJson}
      status={status}
      actions={
        <>
          <Button variant="primary" size="sm" onClick={handleCsvToJson}>
            CSV &rarr; JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleJsonToCsv}>
            JSON &rarr; CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwap}
            disabled={output.length === 0}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            Use Output as Input
          </Button>
          <Select
            aria-label="CSV delimiter"
            value={delimiter}
            onChange={(e) => {
              const value = e.target.value;
              setDelimiter(value === ";" ? ";" : value === "\t" ? "\t" : ",");
            }}
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value={"\t"}>Tab (\t)</option>
          </Select>
          <label className="inline-flex cursor-pointer items-center gap-1.5 px-1 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded border-border"
            />
            Header row
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInput(SAMPLE_CSV);
              setStatus(null);
            }}
          >
            Sample CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInput(SAMPLE_JSON);
              setStatus(null);
            }}
          >
            Sample JSON
          </Button>
        </>
      }
    />
  );
}
