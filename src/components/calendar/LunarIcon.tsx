
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

  switch (phase) {
    case "Lua Nova": // New Moon
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "Lua Crescente Côncava": // Waxing Crescent (left side lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <path d="M12 2A10 10 0 1 0 12 22A7.5 7.5 0 1 1 12 2z" transform="scale(-1, 1) translate(-24, 0)" />
        </svg>
      );
    case "Quarto Crescente": // First Quarter (left half lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <path d="M12 2a10 10 0 1 0 0 20V2z" />
        </svg>
      );
    case "Lua Crescente Gibosa": // Waxing Gibbous (mostly lit, dark on right in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <circle cx="12" cy="12" r="10" />
          <circle cx="17" cy="12" r="7.5" fill="var(--background-color, hsl(var(--background)))" />
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
              <circle cx="12" cy="12" r="10" />
              <circle cx="7" cy="12" r="7.5" fill="var(--background-color, hsl(var(--background)))" />
            </svg>
          );
    case "Quarto Minguante": // Last Quarter (right half lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
          <path d="M12 2a10 10 0 1 1 0 20V2z" />
        </svg>
      );
    case "Lua Minguante Côncava": // Waning Crescent (right side lit in SH)
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="none">
                <path d="M12 2A10 10 0 1 1 12 22A7.5 7.5 0 1 0 12 2z" />
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
