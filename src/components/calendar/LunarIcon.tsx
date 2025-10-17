
"use client";

import type { LunarPhaseName } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LunarIconProps {
  phase: LunarPhaseName;
  className?: string;
}

// Icons for Southern Hemisphere
export function LunarIcon({ phase, className }: LunarIconProps) {
  const baseClass = cn("w-4 h-4 text-muted-foreground", className);

  // Note: fill="currentColor" will use the current text color.
  // stroke="none" is used to avoid outlines on the shapes.
  // The background is assumed to be transparent.
  switch (phase) {
    case "Lua Nova": // New Moon - Dark circle
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    case "Lua Crescente Côncava": // Waxing Crescent (left side lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none" style={{ transform: 'scaleX(-1)' }}>
           <path d="M12 2 A10 10 0 1 1 12 22 A7 7 0 1 0 12 2 Z" />
        </svg>
      );
    case "Quarto Crescente": // First Quarter (left half lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <path d="M12 2 a10 10 0 0 0 0 20 V2Z" />
        </svg>
      );
    case "Lua Crescente Gibosa": // Waxing Gibbous (mostly lit, dark on right in SH)
       return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none" style={{ transform: 'scaleX(-1)' }}>
            <path d="M12 2 A10 10 0 1 1 12 22 A7 7 0 1 1 12 2 Z" />
        </svg>
      );
    case "Lua Cheia": // Full Moon
      return (
         <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "Lua Minguante Gibosa": // Waning Gibbous (mostly lit, dark on left in SH)
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
                <path d="M12 2 A10 10 0 1 1 12 22 A7 7 0 1 1 12 2 Z" />
            </svg>
          );
    case "Quarto Minguante": // Last Quarter (right half lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <path d="M12 2 a10 10 0 0 1 0 20 V2Z" />
        </svg>
      );
    case "Lua Minguante Côncava": // Waning Crescent (right side lit in SH)
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
                <path d="M12 2 A10 10 0 1 1 12 22 A7 7 0 1 0 12 2 Z" />
            </svg>
          );
    default:
      // Fallback for full moon, as it's visually distinct and indicates data is present.
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
         <circle cx="12" cy="12" r="10" />
       </svg>
      );
  }
}
