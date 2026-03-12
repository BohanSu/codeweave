/**
 * Logging utilities
 */
export class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

// Create a circular dependency example
import { processData } from './processor.js';
export { processData };
