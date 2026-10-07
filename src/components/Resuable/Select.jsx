"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function Select({
  label,
  value,
  options,
  onChange,
  className = "",
  panel = "#7C0B3E",
  labelClassName = "text-[#FF69B4]",
  valueClassName = "text-[#DCDCDC]",
  activeClassName = "bg-[#A31552] text-background",
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [active, setActive] = useState(() => options.indexOf(value));
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typedRef = useRef({ text: "", at: 0 });
  const id = useId();

  const close = ({ focusTrigger = true } = {}) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const commit = (index) => {
    const next = options[index];
    if (next != null) onChange(next);
    close();
  };

  const openMenu = (index = options.indexOf(value)) => {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (rect) {
      const wanted = Math.min(options.length * 44 + 2, 260);
      const below = window.innerHeight - rect.bottom;
      setDropUp(below < wanted && rect.top > below);
    }

    setActive(index < 0 ? 0 : index);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close({ focusTrigger: false });
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const step = (delta) =>
    setActive((current) => {
      const next = current + delta;
      if (next < 0) return 0;
      if (next > options.length - 1) return options.length - 1;
      return next;
    });

  const typeAhead = (key) => {
    const now = Date.now();
    const typed = now - typedRef.current.at < 1000 ? typedRef.current.text + key : key;

    typedRef.current = { text: typed, at: now };

    const match = options.findIndex((option) =>
      option.toLowerCase().startsWith(typed.toLowerCase())
    );

    if (match < 0) return;
    if (open) setActive(match);
    else onChange(options[match]);
  };

  const onKeyDown = (event) => {
    const { key } = event;

    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
        event.preventDefault();
        openMenu();
        return;
      }
    } else {
      if (key === "ArrowDown") return event.preventDefault(), step(1);
      if (key === "ArrowUp") return event.preventDefault(), step(-1);
      if (key === "Home") return event.preventDefault(), setActive(0);
      if (key === "End") return event.preventDefault(), setActive(options.length - 1);
      if (key === "Enter" || key === " ") return event.preventDefault(), commit(active);
      if (key === "Escape") return event.preventDefault(), close();
      if (key === "Tab") return close({ focusTrigger: false });
    }

    if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      typeAhead(key);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="flex flex-col justify-center gap-[0.4vw] px-[1.6vw] py-[1.1vw] max-md:px-5 max-md:py-4">
        <span
          id={`${id}-label`}
          className={`font-mono text16 uppercase max-md:text-[10px] ${labelClassName}`}
        >
          {label}
        </span>

        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-labelledby={`${id}-label`}
          onClick={() => (open ? close() : openMenu())}
          onKeyDown={onKeyDown}
          className={`flex w-full cursor-pointer items-center justify-between gap-[1vw] bg-transparent text-left text20 outline-none max-md:text-sm ${valueClassName}`}
        >
          {value}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`size-4 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          tabIndex={-1}
          className={`absolute left-0 right-0 z-30 max-h-[16vw] overflow-y-auto border border-background/15 max-md:max-h-56 ${
            dropUp ? "bottom-full" : "top-full"
          }`}
          style={{ backgroundColor: panel }}
        >
          {options.map((option, index) => {
            const selected = option === value;

            return (
              <li
                key={option}
                role="option"
                data-index={index}
                aria-selected={selected}
                onPointerDown={(event) => {
                  event.preventDefault();
                  commit(index);
                }}
                onPointerEnter={() => setActive(index)}
                className={`cursor-pointer px-[1.6vw] py-[0.7vw] text20 max-md:px-5 max-md:py-3 max-md:text-sm ${
                  index === active ? activeClassName : valueClassName
                } ${selected ? "font-medium" : ""}`}
              >
                {option}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
