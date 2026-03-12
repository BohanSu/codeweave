# 🧶 CodeWeave

A TypeScript CLI tool for visualizing dependencies in JavaScript and TypeScript projects. Analyze import relationships, detect circular dependencies, and export dependency graphs as JSON, ASCII trees, or HTML reports.

## Features

- **📊 Dependency Analysis**: Extracts and analyzes import/export relationships from `.js`, `.ts`, `.jsx`, `.tsx` files
- **🔄 Cycle Detection**: Detects circular dependencies using depth-first search
- **📏 Depth Computation**: Calculates dependency depth for each module
- **📤 Multiple Export Formats**:
  - **JSON**: Structured data for programmatic consumption
  - **Tree (ASCII)**: Human-readable terminal output
  - **HTML**: Interactive visual report with stats and graphs
- **⚡ Fast & Lightweight**: Zero-runtime dependencies for the core logic

## Quick Start

### Installation

```bash
npm install -g codeweave
```

Or clone and build locally:

```bash
git clone <repo-url>
cd codeweave
npm install
npm run build
```

### Usage

Analyze your project:

```bash
codeweave ./src
```

Export as JSON:

```bash
codeweave ./src --format json --output deps.json
```

Generate HTML report:

```bash
codeweave ./src --format html --output report.html
```

Limit by depth:

```bash
codeweave ./src --format tree --depth 2
```

## Example Output

**Tree Format** (`--format tree`):

```
Dependency Analysis
=================
Files: 5 | External: 4 | Edges: 5
Cycles: 0 | Avg Depth: 0.56 | Max Depth: 1

Dependency Trees:

examples/date.ts (depth: 1)
  ├── ./logger.js [external]

examples/logger.ts (depth: 1)
  ├── ./processor.js [external]
...
```

**HTML Format** (`--format html`):

Generates an interactive HTML report with:
- Statistics dashboard (files, external deps, edges, cycles)
- Cycle warnings
- Node/edge visualization
- Responsive CSS grid layout

## CLI Options

```
Usage: codeweave [options] <path>

Arguments:
  path                    Path to the project directory to analyze

Options:
  -f, --format <format>  Output format: json, tree, or html (default: "tree")
  -d, --depth <number>   Maximum dependency depth to display
  -o, --output <file>    Write output to file instead of stdout
  --no-color             Disable colored output
  -h, --help             Display help for command
  -V, --version          Display version number
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Run demo
make demo
```

## Supported Import Syntax

- ES6: `import { x } from 'module'`, `import default from 'module'`
- Dynamic: `import('module')`
- CommonJS: `require('module')`
- Import meta: `import.meta`

## Project Structure

```
codeweave/
├── src/
│   ├── cli.ts           # CLI entry point
│   ├── parser.ts        # Import extraction
│   ├── graph.ts         # Graph building, cycle detection, depth computation
│   └── formatter.ts     # Output formatting (JSON/tree/HTML)
├── tests/               # Unit tests
├── examples/            # Sample project for demo
├── .github/workflows/   # CI configuration
└── package.json
```

## License

MIT License - see [LICENSE](LICENSE) file.

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

---

Built with TypeScript, powered by [Commander.js](https://github.com/tj/commander.js) and [Vitest](https://vitest.dev/).
