import { FileInfo } from './parser.js';

export interface GraphNode {
  id: string;
  type: 'file' | 'external';
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  adjacency: Map<string, Set<string>>;
}

export function buildGraph(files: FileInfo[]): DependencyGraph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const adjacency = new Map<string, Set<string>>();

  // Add all files as nodes
  for (const file of files) {
    if (!nodes.has(file.path)) {
      nodes.set(file.path, { id: file.path, type: 'file' });
      if (!adjacency.has(file.path)) {
        adjacency.set(file.path, new Set());
      }
    }
  }

  // Build a lookup map for resolving import paths
  const filePaths = new Set(files.map((f) => f.path));

  // Helper to resolve import path to actual file path
  const resolveImport = (importSource: string, fromPath: string): string | null => {
    if (!importSource.startsWith('.') && !importSource.startsWith('/')) {
      return null;
    }

    const fromDir = fromPath.substring(0, fromPath.lastIndexOf('/'));
    const segments = importSource.startsWith('/') ? importSource.split('/') : [...fromDir.split('/'), ...importSource.split('/')];

    const normalizedSegments: string[] = [];
    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') {
        if (normalizedSegments.length > 0) {
          normalizedSegments.pop();
        }
      } else if (seg) {
        normalizedSegments.push(seg);
      }
    }

    const path = '/' + normalizedSegments.join('/');
    const normalizePath = (p: string): string => p.replace(/\.(ts|js|tsx|jsx|mjs|cjs)$/, '');

    if (filePaths.has(path)) {
      return path;
    }

    const normalizedPath = normalizePath(path);
    for (const filePath of filePaths) {
      if (normalizePath(filePath) === normalizedPath) {
        return filePath;
      }
    }

    return null;
  };

  // Add edges for imports
  for (const file of files) {
    for (const imp of file.imports) {
      const resolved = resolveImport(imp.imported, file.path);

      if (resolved === null) {
        // External dependency
        const targetId = imp.imported;
        if (!nodes.has(targetId)) {
          nodes.set(targetId, { id: targetId, type: 'external' });
          adjacency.set(targetId, new Set());
        }
        adjacency.get(file.path)!.add(targetId);
        edges.push({ from: file.path, to: targetId, type: imp.type });
      } else {
        // Internal dependency
        adjacency.get(file.path)!.add(resolved);
        edges.push({ from: file.path, to: resolved, type: imp.type });
      }
    }
  }

  return { nodes, edges, adjacency };
}

export function detectCycles(graph: DependencyGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.adjacency.get(nodeId) || new Set();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle - extract the cycle from the path
        const cycleStart = path.indexOf(neighbor);
        const cycle = path.slice(cycleStart).concat(neighbor);
        cycles.push([...new Set(cycle)]);
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return false;
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  return cycles;
}

export function computeDepths(graph: DependencyGraph): Map<string, number> {
  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  function computeDepth(nodeId: string): number {
    if (depths.has(nodeId)) {
      return depths.get(nodeId)!;
    }

    if (visiting.has(nodeId)) {
      // Cycle detected - return 0 as depth contribution
      return 0;
    }

    visiting.add(nodeId);

    const neighbors = graph.adjacency.get(nodeId) || new Set();
    let maxDepth = 0;

    for (const neighbor of neighbors) {
      const neighborDepth = computeDepth(neighbor);
      maxDepth = Math.max(maxDepth, 1 + neighborDepth);
    }

    depths.set(nodeId, maxDepth);
    visiting.delete(nodeId);
    return maxDepth;
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!depths.has(nodeId)) {
      computeDepth(nodeId);
    }
  }

  return depths;
}

export function getStats(graph: DependencyGraph): {
  totalNodes: number;
  fileNodes: number;
  externalNodes: number;
  totalEdges: number;
  cycles: number;
  avgDepth: number;
  maxDepth: number;
} {
  let fileNodes = 0;
  let externalNodes = 0;

  for (const node of graph.nodes.values()) {
    if (node.type === 'file') fileNodes++;
    else externalNodes++;
  }

  const cycles = detectCycles(graph);
  const depths = computeDepths(graph);
  const depthValues = Array.from(depths.values());
  const avgDepth =
    depthValues.length > 0 ? depthValues.reduce((a, b) => a + b, 0) / depthValues.length : 0;
  const maxDepth = depthValues.length > 0 ? Math.max(...depthValues) : 0;

  return {
    totalNodes: graph.nodes.size,
    fileNodes,
    externalNodes,
    totalEdges: graph.edges.length,
    cycles: cycles.length,
    avgDepth: Math.round(avgDepth * 100) / 100,
    maxDepth,
  };
}
