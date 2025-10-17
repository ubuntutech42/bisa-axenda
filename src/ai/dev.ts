
import { config } from 'dotenv';
config();

async function start() {
    if (process.env.GENKIT_ENV === 'dev') {
        await import('@/ai/flows/time-tracking-insights.ts');
        await import('@/ai/flows/generate-motivational-quotes.ts');
        await import('@/ai/flows/analyze-schedule-quality.ts');
    }
}

start();
