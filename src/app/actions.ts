
"use server";

import { getTimeTrackingInsights, type TimeTrackingInsightsInput } from "@/ai/flows/time-tracking-insights";
import type { LunarDataResponse } from "@/lib/types";
import { format } from "date-fns";

export async function generateInsightsAction(input: TimeTrackingInsightsInput) {
  try {
    const result = await getTimeTrackingInsights(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating insights:", error);
    return { success: false, error: "Failed to generate insights. Please try again." };
  }
}

export async function getLunarDataForMonthAction(month: number, year: number) {
  try {
    const response = await fetch(`https://www.icalendar37.net/lunar/api/?lang=pt&month=${month}&year=${year}&loc=Belo%20Horizonte&shadeColor=gray&size=100`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data: LunarDataResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error getting lunar data:", error);
    return { success: false, error: "Failed to get lunar data." };
  }
}
