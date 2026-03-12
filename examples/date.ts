/**
 * Date utilities
 */
import { Logger } from './logger.js';

export function formatDate(date: Date): string {
  return date.toISOString();
}
