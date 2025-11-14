
"use server";

import { getTimeTrackingInsights, type TimeTrackingInsightsInput } from "@/ai/flows/time-tracking-insights";

export async function generateInsightsAction(input: TimeTrackingInsightsInput) {
  try {
    const result = await getTimeTrackingInsights(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating insights:", error);
    return { success: false, error: "Failed to generate insights. Please try again." };
  }
}
