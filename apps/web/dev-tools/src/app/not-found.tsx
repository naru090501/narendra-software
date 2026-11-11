import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@narendra/ui";

export default function DevToolsNotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        404 &bull; Tool Route Not Found
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        This Developer Toolbox route does not exist
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Return to the main workbench to access JSON, XML, CSV, Base64, and text
        utilities.
      </p>
      <Link href="/" className={`${buttonVariants({ variant: "primary" })} mt-6`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Open Workbench
      </Link>
    </div>
  );
}
