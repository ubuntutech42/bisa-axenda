
"use client";

import type { LunarPhaseName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Moon } from "lucide-react";

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
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "Lua Crescente Côncava": // Waxing Crescent (left side lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <path d="M12 2a7 7 0 0 0 0 20" fill="hsl(var(--background))" stroke="hsl(var(--background))" />
        </svg>
      );
    case "Quarto Crescente": // First Quarter (left half lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <rect x="12" y="2" width="12" height="20" fill="hsl(var(--background))" stroke="hsl(var(--background))" />
        </svg>
      );
    case "Lua Crescente Gibosa": // Waxing Gibbous (mostly lit, dark on right in SH)
       return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a7 7 0 0 1 0 20" fill="hsl(var(--background))" stroke="hsl(var(--background))" />
        </svg>
      );
    case "Lua Cheia": // Full Moon
      return (
         <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "Lua Minguante Gibosa": // Waning Gibbous (mostly lit, dark on left in SH)
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a7 7 0 0 0 0 20" fill="hsl(var(--background))" stroke="hsl(var(--background))" />
            </svg>
          );
    case "Quarto Minguante": // Last Quarter (right half lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <rect x="0" y="2" width="12" height="20" fill="hsl(var(--background))" stroke="hsl(var(--background))" />
        </svg>
      );
    case "Lua Minguante Côncava": // Waning Crescent (right side lit in SH)
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a7 7 0 0 1 0 20" fill="hsl(var(--background))" stroke="hsl(var(--background))" />
            </svg>
          );
    default:
      // Fallback for full moon, as it's visually distinct and indicates data is present.
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1">
         <circle cx="12" cy="12" r="10" />
       </svg>
      );
  }
}
