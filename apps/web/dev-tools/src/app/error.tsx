"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@narendra/ui";

export default function DevToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong in Developer Toolbox
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "An unexpected client error occurred."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} variant="primary">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reload Tool
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Reset Workbench
        </Link>
      </div>
    </div>
  );
}
