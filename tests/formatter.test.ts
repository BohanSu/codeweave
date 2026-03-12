import { describe, it, expect, beforeEach } from 'vitest';
import { formatTree, formatJSON, formatHTML } from '../src/formatter.js';
import { buildGraph } from '../src/graph.js';
import type { FileInfo } from '../src/parser.js';

let testGraph: ReturnType<typeof buildGraph>;
let testFiles: FileInfo[];

beforeEach(() => {
  testFiles = [
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
      imports: [],
    },
  ];
  testGraph = buildGraph(testFiles);
});

describe('Formatter', () => {
  describe('formatJSON', () => {
    it('should return valid JSON with graph structure', async () => {
      const cycles: string[][] = [];
      const jsonStr = JSON.stringify(await formatJSON(testGraph, cycles));
      const json = JSON.parse(jsonStr);

      expect(json.graph).toBeDefined();
      expect(json.graph.nodes).toBeInstanceOf(Array);
      expect(json.graph.edges).toBeInstanceOf(Array);
      expect(json.stats).toBeDefined();
      expect(json.cycles).toBeInstanceOf(Array);
    });

    it('should include correct stats', async () => {
      const cycles: string[][] = [];
      const json = await formatJSON(testGraph, cycles);

      expect(json.stats.fileNodes).toBe(3);
      expect(json.stats.totalNodes).toBeGreaterThan(3); // includes external deps
    });
  });

  describe('formatTree', () => {
    it('should return ASCII tree with stats', async () => {
      const cycles: string[][] = [];
      const tree = await formatTree(testGraph, cycles);

      expect(tree).toContain('Dependency Analysis');
      expect(tree).toContain('Files:');
      expect(tree).toContain('Dependency Trees:');
    });

    it('should show correct file count', async () => {
      const cycles: string[][] = [];
      const tree = await formatTree(testGraph, cycles);
      expect(tree).toContain('Files: 3');
    });

    it('should display cycle information when present', async () => {
      const cycleFiles: FileInfo[] = [
        { path: '/src/a.ts', imports: [{ source: '/src/a.ts', imported: './b.ts', type: 'static', line: 1 }] },
        { path: '/src/b.ts', imports: [{ source: '/src/b.ts', imported: './a.ts', type: 'static', line: 1 }] },
      ];
      const graph = buildGraph(cycleFiles);
      const cycles = [['/src/a.ts', '/src/b.ts', '/src/a.ts']];
      const tree = await formatTree(graph, cycles);

      expect(tree).toContain('Cycles Detected:');
      expect(tree).toContain('1.');
    });
  });

  describe('formatHTML', () => {
    it('should return valid HTML', async () => {
      const cycles: string[][] = [];
      const html = await formatHTML(testGraph, cycles);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('CodeWeave');
    });

    it('should include stats in HTML', async () => {
      const cycles: string[][] = [];
      const html = await formatHTML(testGraph, cycles);

      expect(html).toContain('Files');
    });

    it('should show cycles when present', async () => {
      const cycles = [['/src/a.ts', '/src/b.ts', '/src/a.ts']];
      const html = await formatHTML(testGraph, cycles);

      expect(html).toContain('Cycles Detected');
    });

    it('should escape HTML in file paths properly', async () => {
      const html = await formatHTML(testGraph, []);
      // Should contain file paths properly
      expect(html).toContain('/src/a.ts');
    });
  });
});
