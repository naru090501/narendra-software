"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button, Card, Label, Select } from "@narendra/ui";
import {
  analyzeText,
  cleanWhitespace,
  removeAllSpaces,
  removeSpecialCharacters,
  toCamelCase,
  toLowercase,
  toSentenceCase,
  toTitleCase,
  toUppercase,
  transformText,
  type CaseTransformType,
  type TextTransformOptions,
} from "@/lib/tools";
import { EditorWorkspace, type EditorStatus } from "../editor-pane";

const SAMPLE_TEXT = `  Narendra   Software  —   Developer Toolbox!  
  Special   characters: @#$% & *()_+-=[]{}|;':",.<>?
  Line two   has   extra    tabs		and trailing spaces.  
  123 numbers and 456 digits included here.
  Line two   has   extra    tabs		and trailing spaces.
  
  another sentence after blank lines. how does sentence case handle this?`;

export function TextTool() {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<EditorStatus | null>(null);

  // Multi-task transformation pipeline options
  const [caseType, setCaseType] = useState<CaseTransformType>("none");
  const [removeSpecial, setRemoveSpecial] = useState(false);
  const [removeSpaces, setRemoveSpaces] = useState(false);
  const [collapseSpacesOption, setCollapseSpacesOption] = useState(false);
  const [removeNums, setRemoveNums] = useState(false);
  const [removePunct, setRemovePunct] = useState(false);
  const [trimLinesOption, setTrimLinesOption] = useState(false);
  const [removeBlank, setRemoveBlank] = useState(false);
  const [removeDupes, setRemoveDupes] = useState(false);

  const stats = useMemo(() => analyzeText(input), [input]);
  const outputStats = useMemo(() => analyzeText(output), [output]);

  function applyPipeline() {
    if (input.length === 0) {
      setStatus({
        kind: "error",
        message: "Input is empty. Enter text to transform.",
      });
      return;
    }

    const options: TextTransformOptions = {
      caseTransform: caseType,
      removeSpecialChars: removeSpecial,
      removeNumbers: removeNums,
      removePunctuation: removePunct,
      spaceHandling: removeSpaces ? "removeAll" : collapseSpacesOption ? "collapse" : "preserve",
      trimLines: trimLinesOption,
      removeBlankLines: removeBlank,
      removeDuplicateLines: removeDupes,
    };

    const transformed = transformText(input, options);
    setOutput(transformed);

    const activeTasks: string[] = [];
    if (caseType !== "none") activeTasks.push(caseType);
    if (removeSpecial) activeTasks.push("remove special chars");
    if (removeSpaces) activeTasks.push("remove all spaces");
    else if (collapseSpacesOption) activeTasks.push("collapse spaces");
    if (removeNums) activeTasks.push("remove numbers");
    if (removePunct) activeTasks.push("remove punctuation");
    if (removeDupes) activeTasks.push("deduplicate lines");

    const taskSummary =
      activeTasks.length > 0
        ? `Applied: ${activeTasks.join(", ")}`
        : "Processed text";

    setStatus({
      kind: "valid",
      message: `${taskSummary} (${transformed.length.toLocaleString()} chars output).`,
    });
  }

  function runSingleAction(label: string, transformFn: (txt: string) => string) {
    if (input.length === 0) {
      setStatus({
        kind: "error",
        message: "Input is empty. Enter text to transform.",
      });
      return;
    }
    const result = transformFn(input);
    setOutput(result);
    setStatus({
      kind: "valid",
      message: `${label} complete (${result.length.toLocaleString()} chars output).`,
    });
  }

  function handleUseOutputAsInput() {
    if (output.length === 0) return;
    setInput(output);
    setOutput("");
    setStatus({
      kind: "valid",
      message: "Moved output to input for next transformation step.",
    });
  }

  return (
    <div className="space-y-4">
      {/* Real-time Text Metrics */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        <Card className="p-3 sm:p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Characters
          </p>
          <p className="mt-1 truncate font-mono text-lg font-semibold text-foreground sm:text-xl">
            {stats.characters.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3 sm:p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            No Spaces
          </p>
          <p className="mt-1 truncate font-mono text-lg font-semibold text-foreground sm:text-xl">
            {stats.charactersNoSpaces.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3 sm:p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Words
          </p>
          <p className="mt-1 truncate font-mono text-lg font-semibold text-foreground sm:text-xl">
            {stats.words.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3 sm:p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Lines
          </p>
          <p className="mt-1 truncate font-mono text-lg font-semibold text-foreground sm:text-xl">
            {stats.lines.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3 sm:p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Non-Empty Lines
          </p>
          <p className="mt-1 truncate font-mono text-lg font-semibold text-foreground sm:text-xl">
            {stats.nonEmptyLines.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3 sm:p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            UTF-8 Bytes
          </p>
          <p className="mt-1 truncate font-mono text-lg font-semibold text-foreground sm:text-xl">
            {stats.bytes.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Multi-Task Options Panel */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Multi-Task Text Transformation Pipeline
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Combine multiple operations at once (case + remove special chars + spaces)
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
          <div className="space-y-1.5">
            <Label htmlFor="case-select" className="text-xs text-muted-foreground">
              Case Transformation
            </Label>
            <Select
              id="case-select"
              aria-label="Case transformation"
              value={caseType}
              onChange={(e) => setCaseType(e.target.value as CaseTransformType)}
              containerClassName="w-full"
              className="h-9 w-full rounded-lg pl-3 pr-9 text-xs"
            >
              <option value="none">No case change</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="titlecase">Title Case (Capitalize)</option>
              <option value="sentencecase">Sentence case</option>
              <option value="camelcase">camelCase</option>
              <option value="pascalcase">PascalCase</option>
              <option value="kebabcase">kebab-case</option>
              <option value="snakecase">snake_case</option>
              <option value="constantcase">CONSTANT_CASE</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={removeSpecial}
                onChange={(e) => setRemoveSpecial(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-accent"
              />
              Remove Special Characters
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={removeSpaces}
                onChange={(e) => {
                  setRemoveSpaces(e.target.checked);
                  if (e.target.checked) setCollapseSpacesOption(false);
                }}
                className="h-3.5 w-3.5 rounded border-border accent-accent"
              />
              Remove All Spaces
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={collapseSpacesOption}
                disabled={removeSpaces}
                onChange={(e) => setCollapseSpacesOption(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-accent disabled:opacity-40"
              />
              Collapse Multiple Spaces
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={removeNums}
                onChange={(e) => setRemoveNums(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-accent"
              />
              Remove Numbers (0-9)
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={removeBlank}
                onChange={(e) => setRemoveBlank(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-accent"
              />
              Remove Blank Lines
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={removeDupes}
                onChange={(e) => setRemoveDupes(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-accent"
              />
              Deduplicate Lines
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <Button variant="primary" size="sm" onClick={applyPipeline} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Apply Combined Pipeline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseOutputAsInput}
            disabled={output.length === 0}
            className="gap-1.5"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            Use Output as Input
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCaseType("none");
              setRemoveSpecial(false);
              setRemoveSpaces(false);
              setCollapseSpacesOption(false);
              setRemoveNums(false);
              setRemovePunct(false);
              setTrimLinesOption(false);
              setRemoveBlank(false);
              setRemoveDupes(false);
            }}
          >
            Reset Options
          </Button>
        </div>
      </div>

      {/* Editor Workspace with Quick Presets */}
      <EditorWorkspace
        inputLabel="Text Input"
        outputLabel="Transformed Output"
        inputValue={input}
        outputValue={output}
        inputPlaceholder="Paste or type text to perform transformations..."
        outputPlaceholder="Transformed output appears here..."
        onInputChange={setInput}
        onClear={() => {
          setInput("");
          setOutput("");
          setStatus(null);
        }}
        onPrimaryShortcut={applyPipeline}
        status={status}
        inputMeta={`${stats.words} words • ${stats.lines} lines • ${stats.bytes} B`}
        outputMeta={`${outputStats.words} words • ${outputStats.lines} lines • ${outputStats.bytes} B`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runSingleAction("UPPERCASE", toUppercase)}
            >
              UPPERCASE
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runSingleAction("lowercase", toLowercase)}
            >
              lowercase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runSingleAction("Title Case", toTitleCase)}
            >
              Title Case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runSingleAction("Sentence case", toSentenceCase)}
            >
              Sentence case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runSingleAction("camelCase", toCamelCase)}
            >
              camelCase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runSingleAction("Remove Special Characters", (t) =>
                  removeSpecialCharacters(t, { keepWhitespace: true, keepNumbers: true }),
                )
              }
            >
              Remove Special
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runSingleAction("Remove All Spaces", removeAllSpaces)}
            >
              Remove Spaces
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runSingleAction("Collapse Spaces", (t) =>
                  cleanWhitespace(t, { collapseSpaces: true }),
                )
              }
            >
              Collapse Spaces
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
