
"use client";

import type { LunarPhase, LunarPhaseName } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";
import { LunarIcon } from "./LunarIcon";

interface LunarMonthSummaryProps {
  lunarData: Record<string, LunarPhase>;
  isLoading: boolean;
}

const mainPhases: LunarPhaseName[] = [
  "Lua Nova",
  "Quarto Crescente",
  "Lua Cheia",
  "Quarto Minguante",
];

function normalizePhaseName(name: string): string {
  return name?.trim().toLowerCase().normalize("NFD").replace(/\u0300-\u036f/g, "") ?? "";
}

export function LunarMonthSummary({ lunarData, isLoading }: LunarMonthSummaryProps) {
  const monthPhases = useMemo(() => {
    const sortedDates = Object.keys(lunarData).sort();
    const mainPhasesFound: { phaseName: LunarPhaseName; date: string }[] = [];
    const mainNormalized = mainPhases.map((p) => normalizePhaseName(p));

    for (const phaseName of mainPhases) {
      const foundDate = sortedDates.find((date) => {
        const raw = lunarData[date]?.phaseName;
        return raw && normalizePhaseName(raw) === normalizePhaseName(phaseName);
      });
      if (foundDate && lunarData[foundDate]) {
        mainPhasesFound.push({ phaseName, date: foundDate });
      }
    }

    if (mainPhasesFound.length > 0) {
      return mainPhasesFound.sort((a, b) => parseISO(a.date).getDate() - parseISO(b.date).getDate());
    }

    const byPhase = new Map<string, { phaseName: string; date: string }>();
    for (const date of sortedDates) {
      const phase = lunarData[date];
      if (phase?.phaseName && !byPhase.has(phase.phaseName)) {
        byPhase.set(phase.phaseName, { phaseName: phase.phaseName, date });
      }
    }
    const fallback = Array.from(byPhase.values()).sort(
      (a, b) => parseISO(a.date).getDate() - parseISO(b.date).getDate()
    );
    return fallback.slice(0, 8).map((p) => ({ phaseName: p.phaseName as LunarPhaseName, date: p.date }));
  }, [lunarData]);

  if (isLoading) {
    return (
        <div className="space-y-2 mt-2">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12 ml-auto" />
                </div>
            ))}
        </div>
    )
  }

  if (monthPhases.length === 0) {
    return <p className="text-xs text-muted-foreground mt-2">Não há dados lunares para este mês.</p>
  }

  return (
    <div className="space-y-2 mt-2">
      {monthPhases.map(({ phaseName, date }) => (
        <div key={`${phaseName}-${date}`} className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 shrink-0">
            <LunarIcon phaseName={phaseName} className="w-full h-full"/>
          </div>
          <span className="font-medium text-foreground">{phaseName}</span>
          <span className="ml-auto text-muted-foreground font-mono">
            {format(parseISO(date), "dd/MM")}
          </span>
        </div>
      ))}
    </div>
  );
}

    