import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-2xl border border-line bg-card px-3 py-2 text-ink shadow-soft outline-none placeholder:text-muted/70 focus:border-walnut",
        className,
      )}
      {...props}
    />
  );
}
