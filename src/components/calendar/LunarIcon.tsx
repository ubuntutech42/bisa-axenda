"use client";

import type { LunarPhaseName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Moon } from "lucide-react";

interface LunarIconProps {
  phase: LunarPhaseName;
  className?: string;
}

export function LunarIcon({ phase, className }: LunarIconProps) {
  const baseClass = cn("w-4 h-4 text-muted-foreground", className);

  switch (phase) {
    case "Lua Nova":
      return <Moon className={baseClass} fill="currentColor" />;
    case "Lua Crescente Côncava":
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <path d="M12 2a40 40 0 0 0 0 20" fill="currentColor"/>
        </svg>
      );
    case "Quarto Crescente":
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <path d="M12 2v20" fill="currentColor"/>
        </svg>
      );
    case "Lua Crescente Gibosa":
       return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a40 40 0 0 0 0 20" fill="hsl(var(--background))"/>
        </svg>
      );
    case "Lua Cheia":
      return <Moon className={baseClass} />;
    case "Lua Minguante Gibosa":
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a40 40 0 0 1 0 20" fill="hsl(var(--background))"/>
            </svg>
          );
    case "Quarto Minguante":
      return (
        <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
          <path d="M12 22V2" fill="currentColor" />
        </svg>
      );
    case "Lua Minguante Côncava":
        return (
            <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
              <path d="M12 2a40 40 0 0 1 0 20" fill="currentColor"/>
            </svg>
          );
    default:
      return <Moon className={baseClass} />;
  }
}
