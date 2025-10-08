"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { tasks } from "@/lib/data";
import type { Category } from "@/lib/types";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  time: {
    label: "Time (minutes)",
  },
  Work: {
    label: "Work",
    color: "hsl(var(--chart-1))",
  },
  Study: {
    label: "Study",
    color: "hsl(var(--chart-2))",
  },
  Creation: {
    label: "Creation",
    color: "hsl(var(--chart-3))",
  },
  "Self-care": {
    label: "Self-care",
    color: "hsl(var(--chart-4))",
  },
  Personal: {
    label: "Personal",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function TimeDistributionChart() {
  const categoryTime = Object.values(tasks).reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = 0;
    }
    acc[task.category] += task.timeSpent;
    return acc;
  }, {} as Record<Category, number>);

  const chartData = Object.entries(categoryTime).map(([category, time]) => ({
    category,
    time,
    fill: `var(--color-${category})`,
  }));

  const totalMinutes = chartData.reduce((acc, curr) => acc + curr.time, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Time Distribution</CardTitle>
        <CardDescription>How you're spending your focus time.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="time" />}
            />
            <Pie
              data={chartData}
              dataKey="time"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              labelLine={false}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="mt-4 flex-wrap justify-center gap-x-4 gap-y-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total focus time: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing time spent across all categories.
        </div>
      </CardFooter>
    </Card>
  );
}
