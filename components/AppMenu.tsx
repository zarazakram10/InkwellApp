"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Documents" },
  { href: "/trash", label: "Trash" },
];

function isCurrent(href: string, pathname: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/documents");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppMenu() {
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        className="px-3 py-1.5 font-sans"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(true)}
      >
        Menu
      </Button>
      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                className="absolute inset-0 bg-ink/30"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              />
              <aside
                id={menuId}
                className="absolute inset-y-0 left-0 flex w-4/5 flex-col border-r border-line bg-paper shadow-soft sm:w-1/4"
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <p className="text-xl tracking-tight">Menu</p>
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 font-sans"
                    onClick={() => setOpen(false)}
                    autoFocus
                  >
                    Close
                  </Button>
                </div>
                <nav aria-label="Pages" className="flex flex-col gap-1 p-4">
                  {items.map((item) => {
                    const current = isCurrent(item.href, pathname);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "rounded-xl px-4 py-3 text-lg text-ink hover:bg-stone",
                          current && "bg-stone",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
