
"use server";

import { getTimeTrackingInsights, type TimeTrackingInsightsInput } from "@/ai/flows/time-tracking-insights";
import { getLunarPhase, type GetLunarPhaseInput } from "@/ai/flows/get-lunar-phase";

export async function generateInsightsAction(input: TimeTrackingInsightsInput) {
  try {
    const result = await getTimeTrackingInsights(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating insights:", error);
    return { success: false, error: "Failed to generate insights. Please try again." };
  }
}

export async function getLunarPhaseAction(input: GetLunarPhaseInput) {
  try {
    const result = await getLunarPhase(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting lunar phase:", error);
    return { success: false, error: "Failed to get lunar phase." };
  }
}
