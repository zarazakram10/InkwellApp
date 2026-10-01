import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-line bg-card px-3 py-2 text-ink shadow-soft outline-none placeholder:text-muted/70 focus:border-walnut",
        className,
      )}
      {...props}
    />
  );
}
