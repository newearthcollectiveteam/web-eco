"use client";

import { cn } from "~/lib/utils";

interface SelectionPillProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function SelectionPill({
  label,
  selected,
  onToggle,
  disabled,
}: SelectionPillProps) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.vibrate?.(10);
        onToggle();
      }}
      disabled={disabled}
      className={cn(
        "min-h-[44px] rounded-xl border px-4 py-2.5 text-left text-sm transition-all duration-150 active:scale-[0.97]",
        selected
          ? "border-[#FACF39] bg-[#FACF39]/15 text-white shadow-[0_0_12px_rgba(250,207,57,0.2)]"
          : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10",
        disabled && !selected && "pointer-events-none opacity-40",
        disabled && selected && "pointer-events-none"
      )}
    >
      {label}
    </button>
  );
}
