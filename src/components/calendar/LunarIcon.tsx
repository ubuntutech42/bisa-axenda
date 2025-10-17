"use client";

import type { LunarPhaseName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Moon } from "lucide-react";

interface LunarIconProps {
  phase: LunarPhaseName;
  className?: string;
}

// Icons for Southern Hemisphere
// Note: fill="currentColor" will use the text color, fill="hsl(var(--background))" will use the background color for the dark part.
export function LunarIcon({ phase, className }: LunarIconProps) {
  const baseClass = cn("w-4 h-4 text-muted-foreground", className);

  switch (phase) {
    case "Lua Nova": // New Moon
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "Lua Crescente Côncava": // Waxing Crescent (left side lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" fill="currentColor"/>
          <path d="M12 2a40 40 0 0 0 0 20" fill="hsl(var(--background))"/>
        </svg>
      );
    case "Quarto Crescente": // First Quarter (left half lit in SH)
      return (
        <svg viewBox="0 0 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <path d="M12 2v20" fill="currentColor"/>
        </svg>
      );
    case "Lua Crescente Gibosa": // Waxing Gibbous (mostly lit, dark on right in SH)
       return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a40 40 0 0 1 0 20" fill="hsl(var(--background))"/>
        </svg>
      );
    case "Lua Cheia": // Full Moon
      return (
         <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
        </svg>
      );
    case "Lua Minguante Gibosa": // Waning Gibbous (mostly lit, dark on left in SH)
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a40 40 0 0 0 0 20" fill="hsl(var(--background))"/>
            </svg>
          );
    case "Quarto Minguante": // Last Quarter (right half lit in SH)
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <path d="M12 22V2" fill="currentColor" />
        </svg>
      );
    case "Lua Minguante Côncava": // Waning Crescent (right side lit in SH)
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <path d="M12 2a40 40 0 0 1 0 20" fill="hsl(var(--background))"/>
            </svg>
          );
    default:
      return <Moon className={baseClass} />;
  }
}
