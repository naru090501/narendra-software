"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@narendra/ui";
import { decodeBase64, encodeBase64 } from "@/lib/tools";
import { EditorWorkspace, type EditorStatus } from "../editor-pane";

const SAMPLE_UNICODE = "Narendra Software — Local-First Tools 🚀 नमस्ते";

export function Base64Tool() {
  const [input, setInput] = useState(SAMPLE_UNICODE);
  const [output, setOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [status, setStatus] = useState<EditorStatus | null>(null);

  function handleEncode() {
    const result = encodeBase64(input, { urlSafe });
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    setStatus({
      kind: "valid",
      message: `Encoded ${result.inputBytes} UTF-8 bytes to ${result.outputBytes} Base64 bytes${urlSafe ? " (URL-safe)" : ""}.`,
    });
  }

  function handleDecode() {
    const result = decodeBase64(input, { urlSafe });
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setOutput(result.output);
    setStatus({
      kind: "valid",
      message: `Decoded ${result.inputBytes} Base64 bytes to ${result.outputBytes} UTF-8 bytes.`,
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
      inputLabel="Text or Base64 Input"
      outputLabel="Encoded / Decoded Result"
      inputValue={input}
      outputValue={output}
      inputPlaceholder="Enter UTF-8/Unicode text to encode or Base64 string to decode..."
      outputPlaceholder="Base64 encoded or UTF-8 decoded output appears here..."
      onInputChange={setInput}
      onClear={() => {
        setInput("");
        setOutput("");
        setStatus(null);
      }}
      onPrimaryShortcut={handleEncode}
      status={status}
      actions={
        <>
          <Button variant="primary" size="sm" onClick={handleEncode}>
            Encode UTF-8 &rarr; Base64
          </Button>
          <Button variant="outline" size="sm" onClick={handleDecode}>
            Decode Base64 &rarr; UTF-8
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwap}
            disabled={output.length === 0}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            Swap
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 px-1 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="rounded border-border"
            />
            URL-safe (-_)
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInput(SAMPLE_UNICODE);
              setStatus(null);
            }}
          >
            Sample Unicode
          </Button>
        </>
      }
    />
  );
}
