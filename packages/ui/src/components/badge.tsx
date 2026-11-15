import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils.js";

export const badgeVariants = cva(
  "inline-flex min-h-7 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium leading-none tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/80 text-foreground",
        navy: "border-primary/25 bg-primary/10 text-primary dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300",
        emerald:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        amber:
          "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        sky: "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        slate:
          "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
