
'use server';

import type { LunarDataResponse } from "@/lib/types";

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
