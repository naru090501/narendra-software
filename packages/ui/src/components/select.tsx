import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils.js";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
  iconClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      iconClassName,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "relative inline-flex items-center",
          containerClassName,
        )}
      >
        <select
          ref={ref}
          style={{
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            paddingLeft: "0.875rem",
            paddingRight: "2.25rem",
            paddingTop: "0.375rem",
            paddingBottom: "0.375rem",
            ...style,
          }}
          className={cn(
            "h-9 min-w-[7.5rem] appearance-none rounded-lg border border-border bg-background pl-3.5 pr-9 py-1.5 text-xs font-medium text-foreground leading-normal transition-colors cursor-pointer hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/80 transition-colors",
            iconClassName,
          )}
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
