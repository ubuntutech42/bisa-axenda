
'use server';
/**
 * @fileoverview This file is the entry point for running Genkit in development.
 */
import { config } from 'dotenv';
config();

import { exec } from 'child_process';

const GENKIT_PORT = process.env.GENKIT_PORT || 1001;
const FLOW_PORT_BASE = 3100;

// List your flow file names here (without the .ts extension)
const flows = [
  'time-tracking-insights',
  'generate-motivational-quotes',
  'analyze-schedule-quality',
];

// Dynamically build the --flows-from argument
const flowsFrom = flows
  .map((flow, index) => `src/ai/flows/${flow}.ts,${FLOW_PORT_BASE + index}`)
  .join(' ');

const command = `genkit start --port ${GENKIT_PORT} --flows-from ${flowsFrom}`;

console.log('Starting Genkit servers...');
console.log(`Executing: ${command}`);

const genkitProcess = exec(command, { detached: true });

genkitProcess.stdout?.on('data', (data) => {
  process.stdout.write(data);
});

genkitProcess.stderr?.on('data', (data) => {
  process.stderr.write(data);
});

genkitProcess.on('close', (code) => {
  console.log(`Genkit process exited with code ${code}`);
});

// Graceful shutdown
const handleShutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down all Genkit servers...`);
  if (genkitProcess.pid) {
    // Use kill() to send the signal to the process group
    // The negative PID kills the process and all of its children.
    try {
        process.kill(-genkitProcess.pid, signal);
    } catch (e) {
        // Ignore errors if the process is already gone
    }
  }
  process.exit();
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
