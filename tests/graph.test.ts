import { describe, it, expect } from 'vitest';
import { buildGraph, detectCycles, computeDepths, getStats } from '../src/graph.js';
import type { FileInfo } from '../src/parser.js';

const mockFiles: FileInfo[] = [
  {
    path: '/src/a.ts',
    imports: [
      { source: '/src/a.ts', imported: './b.ts', type: 'static', line: 1 },
      { source: '/src/a.ts', imported: 'lodash', type: 'static', line: 2 },
    ],
  },
  {
    path: '/src/b.ts',
    imports: [
      { source: '/src/b.ts', imported: './c.ts', type: 'static', line: 1 },
    ],
  },
  {
    path: '/src/c.ts',
    imports: [], // c.ts has no imports
  },
  {
    path: '/src/d.ts',
    imports: [
      { source: '/src/d.ts', imported: './e.ts', type: 'static', line: 1 },
    ],
  },
  {
    path: '/src/e.ts',
    imports: [
      { source: '/src/e.ts', imported: './d.ts', type: 'static', line: 1 },
    ],
  },
];

describe('Graph', () => {
  describe('buildGraph', () => {
    it('should build a graph from file imports', () => {
      const graph = buildGraph(mockFiles);

      expect(graph.nodes.size).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);

      // Should have both file and external nodes
      const internalNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'file');
      const externalNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'external');
      expect(internalNodes.length).toBeGreaterThan(0);
      expect(externalNodes.length).toBeGreaterThan(0);
    });

    it('should have correct adjacency structure', () => {
      const graph = buildGraph(mockFiles);
      const aNode = graph.nodes.get('/src/a.ts');
      const bNode = graph.nodes.get('/src/b.ts');

      expect(aNode).toBeDefined();
      expect(bNode).toBeDefined();

      // a.ts depends on b.ts
      const aNeighbors = graph.adjacency.get('/src/a.ts');
      expect(aNeighbors?.has('/src/b.ts') || aNeighbors?.has('b.ts')).toBe(true);
    });
  });

  describe('detectCycles', () => {
    it('should detect no cycles in linear dependency chain', () => {
      const linearFiles: FileInfo[] = [
        { path: '/src/a.ts', imports: [{ source: '/src/a.ts', imported: './b.ts', type: 'static', line: 1 }] },
        { path: '/src/b.ts', imports: [{ source: '/src/b.ts', imported: './c.ts', type: 'static', line: 1 }] },
        { path: '/src/c.ts', imports: [] },
      ];
      const graph = buildGraph(linearFiles);
      const cycles = detectCycles(graph);

      expect(cycles.length).toBe(0);
    });

    it('should detect direct cycle', () => {
      const cycleFiles: FileInfo[] = [
        { path: '/src/a.ts', imports: [{ source: '/src/a.ts', imported: './b.ts', type: 'static', line: 1 }] },
        { path: '/src/b.ts', imports: [{ source: '/src/b.ts', imported: './a.ts', type: 'static', line: 1 }] },
      ];
      const graph = buildGraph(cycleFiles);
      const cycles = detectCycles(graph);

      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should detect circular dependency in mock files', () => {
      const graph = buildGraph(mockFiles);
      const cycles = detectCycles(graph);

      // d.ts -> e.ts -> d.ts should create a cycle
      expect(cycles.length).toBeGreaterThan(0);
    });
  });

  describe('computeDepths', () => {
    it('should compute correct depths for linear chain', () => {
      const linearFiles: FileInfo[] = [
        { path: '/src/a.ts', imports: [{ source: '/src/a.ts', imported: './b.ts', type: 'static', line: 1 }] },
        { path: '/src/b.ts', imports: [{ source: '/src/b.ts', imported: './c.ts', type: 'static', line: 1 }] },
        { path: '/src/c.ts', imports: [] },
      ];
      const graph = buildGraph(linearFiles);
      const depths = computeDepths(graph);

      // a depends on b (depth 1), b depends on c (depth 1), c has no dependencies (depth 0)
      expect(depths.get('/src/a.ts')).toBe(2);
      expect(depths.get('/src/b.ts')).toBe(1);
      expect(depths.get('/src/c.ts')).toBe(0);
    });

    it('should handle cycles gracefully', () => {
      const cycleFiles: FileInfo[] = [
        { path: '/src/a.ts', imports: [{ source: '/src/a.ts', imported: './b.ts', type: 'static', line: 1 }] },
        { path: '/src/b.ts', imports: [{ source: '/src/b.ts', imported: './a.ts', type: 'static', line: 1 }] },
      ];
      const graph = buildGraph(cycleFiles);
      const depths = computeDepths(graph);

      // With cycles, depth might be 1 or some non-infinite value
      expect(depths.get('/src/a.ts')).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getStats', () => {
    it('should compute correct statistics', () => {
      const graph = buildGraph(mockFiles);
      const stats = getStats(graph);

      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.fileNodes).toBe(5);
      expect(stats.externalNodes).toBe(1); // lodash
      expect(stats.totalEdges).toBeGreaterThan(0);
      expect(stats.cycles).toBeGreaterThan(0);
      expect(stats.avgDepth).toBeGreaterThanOrEqual(0);
      expect(stats.maxDepth).toBeGreaterThanOrEqual(0);
    });
  });
});
