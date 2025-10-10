
"use client";

import type { LunarPhase, LunarPhaseName } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";
import { LunarIcon } from "./LunarIcon";
import { Skeleton } from "../ui/skeleton";

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

export function LunarMonthSummary({ lunarData, isLoading }: LunarMonthSummaryProps) {
  const monthMainPhases = useMemo(() => {
    const phases: { phaseName: LunarPhaseName; date: string }[] = [];
    const processedPhases = new Set<LunarPhaseName>();

    const sortedDates = Object.keys(lunarData).sort();
    
    // Find the first occurrence of each main phase in the month
    for (const phaseName of mainPhases) {
      const foundDate = sortedDates.find(date => lunarData[date]?.phaseName === phaseName);
      if (foundDate) {
        phases.push({ phaseName, date: foundDate });
        processedPhases.add(phaseName);
      }
    }

    // Sort by date
    return phases.sort((a,b) => parseISO(a.date).getDate() - parseISO(b.date).getDate());

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

  if (monthMainPhases.length === 0 && !isLoading) {
    return <p className="text-xs text-muted-foreground mt-2">Não há eventos lunares principais este mês.</p>
  }

  return (
    <div className="space-y-2 mt-2">
      {monthMainPhases.map(({ phaseName, date }) => (
        <div key={phaseName} className="flex items-center gap-2 text-sm">
          <LunarIcon phase={phaseName} className="w-5 h-5 shrink-0" />
          <span className="font-medium text-foreground">{phaseName}</span>
          <span className="ml-auto text-muted-foreground font-mono">
            {format(parseISO(date), "dd/MM")}
          </span>
        </div>
      ))}
    </div>
  );
}

    