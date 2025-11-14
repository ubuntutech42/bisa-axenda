
"use client";

import type { LunarPhaseName } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LunarIconProps {
  phaseName: LunarPhaseName;
  className?: string;
}

const phaseIcons: Record<LunarPhaseName, React.ReactNode> = {
    "Lua Nova": (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="currentColor" stroke="none" />
      </svg>
    ),
    "Lua Crescente Côncava": (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M 50 2 A 48 48 0 0 1 50 98 A 30 48 0 0 0 50 2 Z" fill="currentColor" />
      </svg>
    ),
    "Quarto Crescente": (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M 50 2 A 48 48 0 0 1 50 98 V 2 Z" fill="currentColor" />
      </svg>
    ),
    "Lua Crescente Gibosa": (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="currentColor" stroke="none" />
            <path d="M 50 2 A 48 48 0 0 0 50 98 A 30 48 0 0 1 50 2 Z" fill="hsl(var(--background))" />
      </svg>
    ),
    "Lua Cheia": (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "Lua Minguante Gibosa": (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
         <circle cx="50" cy="50" r="48" fill="currentColor" stroke="none" />
         <path d="M 50 2 A 48 48 0 0 1 50 98 A 30 48 0 0 0 50 2 Z" fill="hsl(var(--background))" />
      </svg>
    ),
    "Quarto Minguante": (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M 50 2 A 48 48 0 0 0 50 98 V 2 Z" fill="currentColor" />
      </svg>
    ),
    "Lua Minguante Côncava": (
       <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 50 2 A 48 48 0 0 0 50 98 A 30 48 0 0 1 50 2 Z" fill="currentColor" />
      </svg>
    ),
  };
  

export function LunarIcon({ phaseName, className }: LunarIconProps) {
  const icon = phaseIcons[phaseName] || phaseIcons["Lua Nova"]; // Fallback to New Moon

  return <div className={cn("text-foreground", className)}>{icon}</div>;
}
