/**
 * Main entry point with dependency on utils
 */
import { greet } from './utils.js';

export function main() {
  console.log(greet('Codeweave'));
}

main();
