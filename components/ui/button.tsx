import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-walnut text-paper shadow-soft hover:bg-walnut-dark",
        variant === "secondary" &&
          "border border-line bg-card text-ink shadow-soft hover:bg-stone",
        variant === "ghost" && "text-muted hover:bg-stone hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
