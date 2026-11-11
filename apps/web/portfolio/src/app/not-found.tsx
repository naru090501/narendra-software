import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@narendra/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        404 &bull; Page Not Found
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        The requested page could not be found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Check the URL or explore our product registry and platform architecture
        from the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "primary" })}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
        <Link href="/products" className={buttonVariants({ variant: "outline" })}>
          Browse Products
        </Link>
      </div>
    </div>
  );
}
