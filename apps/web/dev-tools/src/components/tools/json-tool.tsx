"use client";

import { useState } from "react";
import { Button, Select } from "@narendra/ui";
import { formatJson, minifyJson, validateJson } from "@/lib/tools";
import { EditorWorkspace, type EditorStatus } from "../editor-pane";

const SAMPLE_JSON = JSON.stringify(
  {
    project: "Narendra Software",
    product: "Developer Toolbox",
    localFirst: true,
    capabilities: ["JSON", "XML", "CSV", "Base64", "Text"],
    limits: { maxUploadBytes: 0, registrationRequired: false },
  },
  null,
  2,
);

export function JsonTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<2 | 4 | "\t">(2);
  const [status, setStatus] = useState<EditorStatus | null>(null);

  function handleFormat() {
    const result = formatJson(input, indent);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    const largeNote = result.stats.isLargeInput
      ? " (large payload processed locally)"
      : "";
    setStatus({
      kind: "valid",
      message: `Formatted valid JSON (${result.stats.lines.toLocaleString()} lines, ${result.stats.outputBytes.toLocaleString()} bytes)${largeNote}.`,
    });
  }

  function handleMinify() {
    const result = minifyJson(input);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    setStatus({
      kind: "valid",
      message: `Minified valid JSON (${result.stats.outputBytes.toLocaleString()} bytes, down from ${result.stats.inputBytes.toLocaleString()} bytes).`,
    });
  }

  function handleValidate() {
    const result = validateJson(input);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({
      kind: "valid",
      message: `Valid JSON (${result.stats.inputBytes.toLocaleString()} bytes).`,
    });
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setStatus(null);
  }

  return (
    <EditorWorkspace
      inputLabel="JSON Input"
      outputLabel="Formatted / Minified JSON"
      inputValue={input}
      outputValue={output}
      inputPlaceholder='Paste raw JSON here, e.g. {"name": "Narendra Software"}'
      outputPlaceholder="Formatted or minified JSON appears here..."
      onInputChange={setInput}
      onClear={handleClear}
      onPrimaryShortcut={handleFormat}
      status={status}
      actions={
        <>
          <Button variant="primary" size="sm" onClick={handleFormat}>
            Format JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleMinify}>
            Minify
          </Button>
          <Button variant="outline" size="sm" onClick={handleValidate}>
            Validate
          </Button>
          <Select
            aria-label="Indentation"
            value={String(indent)}
            onChange={(e) => {
              const val = e.target.value;
              setIndent(val === "\t" ? "\t" : val === "4" ? 4 : 2);
            }}
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value={"\t"}>Tab</option>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInput(SAMPLE_JSON);
              setStatus(null);
            }}
          >
            Sample
          </Button>
        </>
      }
    />
  );
}
