import { DependencyGraph } from './graph.js';
import { FileInfo } from './parser.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface FormatterOptions {
  format: 'json' | 'tree' | 'html';
  depth?: number;
  outputPath?: string;
}

interface JsonOutput {
  graph: {
    nodes: Array<{ id: string; type: string }>;
    edges: Array<{ from: string; to: string; type: string }>;
  };
  stats: {
    totalNodes: number;
    fileNodes: number;
    externalNodes: number;
    totalEdges: number;
    cycles: number;
    avgDepth: number;
    maxDepth: number;
  };
  cycles: string[][];
}

export async function formatJSON(
  graph: DependencyGraph,
  cycles: string[][],
): Promise<JsonOutput> {
  const { getStats } = await import('./graph.js');
  const stats = getStats(graph);

  return {
    graph: {
      nodes: Array.from(graph.nodes.values()).map((n) => ({
        id: n.id,
        type: n.type,
      })),
      edges: graph.edges,
    },
    stats,
    cycles,
  };
}

export async function formatTree(
  graph: DependencyGraph,
  cycles: string[][],
  _depth?: number,
): Promise<string> {
  const { computeDepths, getStats } = await import('./graph.js');
  const depths = computeDepths(graph);
  const stats = getStats(graph);

  let output = '';
  output += `Dependency Analysis\n`;
  output += `=================\n`;
  output += `Files: ${stats.fileNodes} | External: ${stats.externalNodes} | Edges: ${stats.totalEdges}\n`;
  output += `Cycles: ${stats.cycles} | Avg Depth: ${stats.avgDepth} | Max Depth: ${stats.maxDepth}\n\n`;

  if (cycles.length > 0) {
    output += `Cycles Detected:\n`;
    for (let i = 0; i < cycles.length; i++) {
      output += `  ${i + 1}. ${cycles[i].join(' -> ')}\n`;
    }
    output += '\n';
  }

  const fileNodes = Array.from(graph.nodes.entries())
    .filter(([_, node]) => node.type === 'file')
    .sort((a, b) => (depths.get(a[0]) || 0) - (depths.get(b[0]) || 0));

  output += `Dependency Trees:\n`;
  for (const [nodeId] of fileNodes) {
    output += `\n${nodeId} (depth: ${depths.get(nodeId) || 0})\n`;
    const neighbors = graph.adjacency.get(nodeId) || new Set();
    if (neighbors.size === 0) {
      output += `  └── (no direct imports)\n`;
    } else {
      for (const neighbor of neighbors) {
        const neighborNode = graph.nodes.get(neighbor);
        const neighborType = neighborNode?.type === 'external' ? '[external]' : '';
        output += `  ├── ${neighbor} ${neighborType}\n`;
      }
    }
  }

  return output;
}

export async function formatHTML(
  graph: DependencyGraph,
  cycles: string[][],
): Promise<string> {
  const { getStats } = await import('./graph.js');
  const stats = getStats(graph);

  const nodes = Array.from(graph.nodes.values());
  const edges = graph.edges;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeWeave - Dependency Graph</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #333;
    }
    .node-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 10px;
    }
    .node-item {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 4px;
      border-left: 3px solid #28a745;
      font-size: 14px;
      word-break: break-all;
    }
    .node-item.external {
      border-left-color: #ffc107;
    }
    .edge-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .edge-item {
      background: #f1f3f5;
      padding: 10px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'Monaco', 'Consolas', monospace;
    }
    .cycle-item {
      background: #ffe6e6;
      border: 1px solid #ff6b6b;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .cycle-label {
      color: #c92a2a;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .cycle-paths {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: #495057;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧶 CodeWeave - Dependency Graph Analysis</h1>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${stats.fileNodes}</div>
          <div class="stat-label">Files</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.externalNodes}</div>
          <div class="stat-label">External Deps</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalEdges}</div>
          <div class="stat-label">Total Edges</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.cycles}</div>
          <div class="stat-label">Cycles</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.avgDepth}</div>
          <div class="stat-label">Avg Depth</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.maxDepth}</div>
          <div class="stat-label">Max Depth</div>
        </div>
      </div>
    </div>

    ${cycles.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Cycles Detected ${cycles.length}</div>
      ${cycles.map((cycle, i) => `
        <div class="cycle-item">
          <div class="cycle-label">Cycle ${i + 1}</div>
          <div class="cycle-paths">${cycle.join(' → ')}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">📦 Nodes (${nodes.length})</div>
      <div class="node-list">
        ${nodes.map(node => `
          <div class="node-item ${node.type === 'external' ? 'external' : ''}">
            ${node.type === 'external' ? '📦 ' : '📄 '}${escapeHtml(node.id)}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">🔗 Edges (${edges.length})</div>
      <div class="edge-list">
        ${edges.map(edge => `
          <div class="edge-item">
            ${edge.from.split('/').pop()} → ${edge.to.split('/').pop()} <span style="color:#666">(${edge.type})</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function format(
  graph: DependencyGraph,
  _files: FileInfo[],
  options: FormatterOptions,
): Promise<string> {
  const { detectCycles } = await import('./graph.js');
  const cycles = detectCycles(graph);

  switch (options.format) {
    case 'json':
      return JSON.stringify(await formatJSON(graph, cycles), null, 2);
    case 'tree':
      return await formatTree(graph, cycles, options.depth);
    case 'html':
      return await formatHTML(graph, cycles);
    default:
      return await formatTree(graph, cycles, options.depth);
  }
}
