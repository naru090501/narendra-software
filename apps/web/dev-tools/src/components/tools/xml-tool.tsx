"use client";

import { useState } from "react";
import { Button } from "@narendra/ui";
import { formatXml, minifyXml, validateXml } from "@/lib/tools";
import { EditorWorkspace, type EditorStatus } from "../editor-pane";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog company="Narendra Software">
  <product slug="developer-toolbox" status="in-development">
    <name>Developer Toolbox</name>
    <processing mode="local-first" />
  </product>
</catalog>`;

export function XmlTool() {
  const [input, setInput] = useState(SAMPLE_XML);
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [status, setStatus] = useState<EditorStatus | null>(null);

  function handleFormat() {
    const result = formatXml(input, indentSize);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    setStatus({
      kind: "valid",
      message: `Valid XML formatted (<${result.rootTagName}>, ${result.nodeCount} elements).`,
    });
  }

  function handleMinify() {
    const result = minifyXml(input);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    setStatus({
      kind: "valid",
      message: `Valid XML minified (<${result.rootTagName}>, ${result.nodeCount} elements).`,
    });
  }

  function handleValidate() {
    const result = validateXml(input);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({
      kind: "valid",
      message: `Valid XML document (<${result.rootTagName}>, ${result.nodeCount} elements).`,
    });
  }

  return (
    <EditorWorkspace
      inputLabel="XML Input"
      outputLabel="Formatted / Minified XML"
      inputValue={input}
      outputValue={output}
      inputPlaceholder="<root><item>Paste XML here</item></root>"
      outputPlaceholder="Formatted or minified XML appears here..."
      onInputChange={setInput}
      onClear={() => {
        setInput("");
        setOutput("");
        setStatus(null);
      }}
      onPrimaryShortcut={handleFormat}
      status={status}
      actions={
        <>
          <Button variant="primary" size="sm" onClick={handleFormat}>
            Format XML
          </Button>
          <Button variant="outline" size="sm" onClick={handleMinify}>
            Minify
          </Button>
          <Button variant="outline" size="sm" onClick={handleValidate}>
            Validate
          </Button>
          <select
            aria-label="XML indentation"
            value={String(indentSize)}
            onChange={(e) => setIndentSize(e.target.value === "4" ? 4 : 2)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInput(SAMPLE_XML);
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
