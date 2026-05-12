"use client";

// Custom Win95-style dropdown. A hidden input carries the picked value to the
// surrounding form. Keyboard: Enter/Space opens, Arrow/Home/End navigate,
// Enter/Tab selects, Esc closes.

import { useEffect, useRef, useState } from "react";

export type RetroSelectOption = { value: string; label: string };

export function RetroSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Select…",
  required,
  disabled,
  ariaLabel,
  onChange,
}: {
  name: string;
  options: RetroSelectOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  /** Optional callback fired when the user picks a new value. */
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState<string>(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === defaultValue);
    return idx >= 0 ? idx : 0;
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const showLabel = selected ? selected.label : placeholder;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Focus the listbox + scroll the highlighted option into view when opening.
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const li = listRef.current?.querySelectorAll("li")[highlighted];
    li?.scrollIntoView({ block: "nearest" });
  }, [open, highlighted]);

  function commit(idx: number) {
    const opt = options[idx];
    if (!opt) return;
    setValue(opt.value);
    setHighlighted(idx);
    setOpen(false);
    triggerRef.current?.focus();
    onChange?.(opt.value);
  }

  function onTriggerKey(e: React.KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        setOpen(true);
        break;
    }
  }

  function onListKey(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((h) => Math.min(options.length - 1, h + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(0, h - 1));
        break;
      case "Home":
        e.preventDefault();
        setHighlighted(0);
        break;
      case "End":
        e.preventDefault();
        setHighlighted(options.length - 1);
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        commit(highlighted);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  }

  const isPlaceholder = !selected;

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", display: "block", width: "100%" }}
    >
      <input type="hidden" name={name} value={value} aria-required={required} />

      {/* Beveled trigger with a separate chevron button. */}
      <button
        type="button"
        ref={triggerRef}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="retro-select-trigger"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: 0,
          background: open ? "#fffce8" : "#fff",
          color: isPlaceholder ? "#888" : "#000",
          borderTop: open ? "2px solid var(--gold)" : "2px solid #808080",
          borderLeft: open ? "2px solid var(--gold)" : "2px solid #808080",
          borderRight: "2px solid #fff",
          borderBottom: "2px solid #fff",
          borderRadius: 0,
          fontFamily: "Tahoma, Geneva, sans-serif",
          fontSize: 13,
          boxShadow: "inset 1px 1px 0 #000",
          cursor: disabled
            ? "not-allowed"
            : "url(/cursors/vine-precision.cur), pointer",
          transition: "background-color 80ms",
        }}
      >
        <span
          style={{
            padding: "3px 6px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            textAlign: "left",
          }}
        >
          {showLabel}
        </span>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 22,
            background: "#c0c0c0",
            color: "#000",
            // Flips to inset bevel when menu is open.
            borderTop: open ? "2px solid #000" : "2px solid #fff",
            borderLeft: open ? "2px solid #000" : "2px solid #fff",
            borderRight: open ? "2px solid #fff" : "2px solid #000",
            borderBottom: open ? "2px solid #fff" : "2px solid #000",
            fontSize: 10,
            lineHeight: 1,
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKey}
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            zIndex: 1000,
            margin: 0,
            padding: 2,
            listStyle: "none",
            maxHeight: 240,
            overflowY: "auto",
            background: "#c0c0c0",
            borderTop: "2px solid #fff",
            borderLeft: "2px solid #fff",
            borderRight: "2px solid #000",
            borderBottom: "2px solid #000",
            boxShadow: "3px 3px 0 rgba(0,0,0,0.45)",
            fontFamily: "Tahoma, Geneva, sans-serif",
            fontSize: 13,
            outline: "none",
          }}
        >
          {options.length === 0 ? (
            <li
              style={{
                padding: "6px 8px",
                fontStyle: "italic",
                color: "#666",
              }}
            >
              (no options)
            </li>
          ) : (
            options.map((opt, i) => {
              const isHighlighted = i === highlighted;
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value || `placeholder-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseDown={(e) => {
                    // mousedown beats the outside-click close handler.
                    e.preventDefault();
                    commit(i);
                  }}
                  style={{
                    padding: "4px 8px",
                    background: isHighlighted ? "#000080" : "transparent",
                    color: isHighlighted ? "#fff" : "#000",
                    fontWeight: isSelected ? 700 : 400,
                    cursor: "url(/cursors/vine-precision.cur), pointer",
                    userSelect: "none",
                  }}
                >
                  {isSelected ? "● " : "  "}
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
