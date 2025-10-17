/**
 * @fileoverview This file is the entry point for running Genkit in development.
 */

import { config } from 'dotenv';
config();

import { exec } from 'child_process';

const GENKIT_PORT = 1001; // The port for the main Genkit UI and flow server
const FLOW_PORT_BASE = 3100; // Starting port for individual flow servers

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

const genkitProcess = exec(command);

genkitProcess.stdout?.on('data', (data) => {
  process.stdout.write(data);
});

genkitProcess.stderr?.on('data', (data) => {
  process.stderr.write(data);
});

genkitProcess.on('close', (code) => {
  console.log(`Genkit process exited with code ${code}`);
});

process.on('SIGINT', () => {
    console.log('Shutting down Genkit servers...');
    genkitProcess.kill('SIGINT');
    process.exit();
});
