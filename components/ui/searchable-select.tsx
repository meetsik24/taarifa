"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/app-icon";
import { cn } from "cn";

type Placement = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

function matches(option: string, query: string): boolean {
  return option.toLowerCase().includes(query.trim().toLowerCase());
}

export function SearchableSelect({
  id,
  name,
  value,
  options,
  placeholder = "Chagua",
  disabled,
  required,
  invalid,
  describedBy,
  onValueChange,
}: {
  id: string;
  name: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const shouldFocus = useRef(false);
  const listId = useId();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => matches(option, needle));
  }, [options, query]);

  useEffect(() => {
    if (!open || !placement || !shouldFocus.current) return;
    shouldFocus.current = false;
    searchRef.current?.focus();
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;

    function place() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const gap = 4;
      const preferred = 320;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(160, Math.min(preferred, openUp ? spaceAbove : spaceBelow));
      setPlacement({
        left: rect.left,
        width: rect.width,
        maxHeight,
        top: openUp ? undefined : rect.bottom + gap,
        bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
      });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, listId, filtered]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function choose(next: string) {
    onValueChange(next);
    close();
    buttonRef.current?.focus();
  }

  function openMenu() {
    shouldFocus.current = true;
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) choose(option);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      buttonRef.current?.focus();
    }
  }

  const menu =
    open && placement
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              left: placement.left,
              width: placement.width,
              top: placement.top,
              bottom: placement.bottom,
              maxHeight: placement.maxHeight,
              zIndex: 50,
            }}
            className="flex flex-col overflow-hidden rounded-lg border border-input bg-background shadow-md"
          >
            <div className="shrink-0 border-b border-input p-2">
              <div className="relative">
                <AppIcon
                  icon={Search01Icon}
                  className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  placeholder="Tafuta"
                  aria-label="Tafuta"
                  aria-autocomplete="list"
                  aria-controls={listId}
                  aria-activedescendant={
                    filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined
                  }
                  className="h-9 w-full rounded-md border border-input bg-background pr-3 pl-8 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onSearchKeyDown}
                />
              </div>
            </div>
            <ul id={listId} role="listbox" className="min-h-0 flex-1 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {options.length === 0 ? "Hakuna chaguo" : "Hakuna inayolingana"}
                </li>
              ) : (
                filtered.map((option, index) => {
                  const selected = option === value;
                  const active = index === activeIndex;
                  return (
                    <li key={option} role="presentation">
                      <button
                        id={`${listId}-${index}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={cn(
                          "w-full rounded-md px-3 py-2 text-left text-sm leading-5",
                          (active || selected) && "bg-secondary text-secondary-foreground",
                          selected && "font-medium",
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => choose(option)}
                      >
                        {option}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-required={required || undefined}
        className={cn(
          "flex h-11 w-full items-center rounded-lg border border-input bg-background px-3 pr-10 text-left text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:h-10",
          value ? "text-foreground" : "text-muted-foreground",
        )}
        onClick={() => {
          if (disabled) return;
          if (open) {
            close();
            return;
          }
          openMenu();
        }}
        onKeyDown={(event) => {
          if (disabled || open) return;
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openMenu();
          }
        }}
      >
        <span className="truncate">{value || placeholder}</span>
      </button>
      <AppIcon
        icon={ArrowDown01Icon}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
      />
      {menu}
    </div>
  );
}
