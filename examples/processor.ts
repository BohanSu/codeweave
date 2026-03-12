/**
 * Data processing module
 */
import { Logger } from './logger.js';

export function processData(data: unknown) {
  const logger = new Logger();
  logger.log('Processing data...');
  return data;
}
