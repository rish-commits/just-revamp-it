"use client";
import { useId, useRef, useState, type ReactNode } from "react";
import { InfoIcon } from "./icons";

/**
 * Positioned `fixed` from the trigger's rect so an overflow ancestor cannot clip
 * it, opens on hover AND focus with no delay, and is referenced as the trigger's
 * description (reference/interaction.md).
 */
export function Tooltip({ text, children, label }: { text: ReactNode; children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ top: r.top - 8, left: r.left + r.width / 2 });
    setOpen(true);
  };

  return (
    <span
      ref={ref} tabIndex={0} className="jr-info" aria-label={label}
      aria-describedby={open ? id : undefined}
      onMouseEnter={show} onMouseLeave={() => setOpen(false)}
      onFocus={show} onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span role="tooltip" id={id} className="jr-tooltip"
          style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -100%)" }}>
          {text}
        </span>
      )}
    </span>
  );
}

/** The accessible name is derived from the host so a page author cannot forget it. */
export function InfoDot({ text, about }: { text: ReactNode; about: string }) {
  return (
    <Tooltip text={text} label={`About ${about}`}>
      <InfoIcon />
    </Tooltip>
  );
}
