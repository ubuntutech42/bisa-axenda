
'use server';
/**
 * @fileoverview This file is the entry point for running Genkit in development.
 * It spawns the Genkit server as a child process and ensures it's properly
 * terminated when the main Next.js dev server restarts.
 */
import { config } from 'dotenv';
config();

import { spawn, type ChildProcess } from 'child_process';

// Only run this logic in the main Next.js development process, not in workers.
// The `tsx` process is the parent, and we check that we are not in a Genkit-spawned process.
if (process.env.npm_lifecycle_event === 'dev' && !process.env.GENKIT_ENV) {
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

  let genkitProcess: ChildProcess | null = null;

  function startGenkit() {
    // Start the genkit process in detached mode to manage it as a group leader.
    genkitProcess = spawn(command, [], { detached: true, shell: true });

    console.log('Starting Genkit servers...');
    console.log(`Executing: ${command}`);
    console.log(`Genkit process started with PID: ${genkitProcess.pid}`);

    genkitProcess.stdout?.on('data', (data) => {
      process.stdout.write(data);
    });

    genkitProcess.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });

    genkitProcess.on('close', (code) => {
      if (code !== null) { // If code is null, it was killed intentionally
        console.log(`Genkit process exited with code ${code}. Restarting...`);
        startGenkit(); // Restart if it crashes unexpectedly
      }
    });
  }

  function handleShutdown(signal: NodeJS.Signals | 'exit') {
    console.log(`Received ${signal}. Shutting down Genkit servers...`);
    if (genkitProcess && genkitProcess.pid) {
      try {
        // On POSIX systems we can kill the process group using a negative PID.
        if (process.platform !== 'win32') {
          process.kill(-genkitProcess.pid, 'SIGTERM');
        } else {
          process.kill(genkitProcess.pid, 'SIGTERM');
        }
        console.log(`Sent termination signal to Genkit process ${genkitProcess.pid}`);
      } catch (e) {
        console.error(`Error killing Genkit process ${genkitProcess.pid}:`, e);
      }
      genkitProcess = null;
    }
    // Allow the main process to exit naturally
  }
  
  // Start Genkit for the first time
  startGenkit();

  // Register shutdown handlers
  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('exit', () => handleShutdown('exit'));
}
