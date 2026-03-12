#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync } from 'fs';

const { parseDirectory } = await import('./parser.js');
const { buildGraph } = await import('./graph.js');
const { format } = await import('./formatter.js');

const program = new Command();

program
  .name('codeweave')
  .description('Analyze JavaScript/TypeScript dependency graphs')
  .version('0.1.0')
  .argument('<path>', 'Path to the project directory to analyze')
  .option('-f, --format <format>', 'Output format: json, tree, or html', 'tree')
  .option('-d, --depth <number>', 'Maximum dependency depth to display')
  .option('-o, --output <file>', 'Write output to file instead of stdout')
  .option('--no-color', 'Disable colored output')
  .action(async (targetPath, options) => {
    try {
      if (!options.color) {
        chalk.level = 0;
      }

      const formatType = options.format;
      if (formatType !== 'json' && formatType !== 'tree' && formatType !== 'html') {
        console.error(chalk.red(`Error: Invalid format "${formatType}". Use: json, tree, or html`));
        process.exit(1);
      }

      const maxDepth = options.depth ? parseInt(options.depth, 10) : undefined;
      if (options.depth && isNaN(maxDepth!)) {
        console.error(chalk.red(`Error: Invalid depth "${options.depth}". Use a positive number.`));
        process.exit(1);
      }

      console.error(chalk.dim(`Analyzing ${targetPath}...`));

      const files = parseDirectory(targetPath);

      if (files.length === 0) {
        console.error(chalk.yellow('Warning: No .js/.ts files found in the specified path.'));
        process.exit(0);
      }

      console.error(chalk.dim(`Found ${files.length} files. Building dependency graph...`));

      const graph = buildGraph(files);
      const output = await format(graph, files, {
        format: formatType,
        depth: maxDepth,
      });

      if (options.output) {
        writeFileSync(options.output, output, 'utf-8');
        console.error(chalk.green(`Output written to ${options.output}`));
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
