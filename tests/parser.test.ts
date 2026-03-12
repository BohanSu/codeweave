import { describe, it, expect } from 'vitest';
import { stripComments, extractImports, getAllFiles } from '../src/parser.js';

describe('Parser', () => {
  describe('stripComments', () => {
    it('should remove single-line comments', () => {
      const code = "const x = 5; // this is a comment \n const y = 10;";
      const result = stripComments(code);
      expect(result).toContain('const x = 5;');
      expect(result).not.toContain('this is a comment');
    });

    it('should remove multi-line comments', () => {
      const code = "const x = 5; /* multi\nline\ncomment */ const y = 10;";
      const result = stripComments(code);
      expect(result).toContain('const x = 5;');
      expect(result).toContain('const y = 10;');
      expect(result).not.toContain('multi');
      expect(result).not.toContain('line');
    });

    it('should handle mixed comments', () => {
      const code = "/* block */ const x = 5; // line \n // another \n const y = 10;";
      const result = stripComments(code);
      expect(result).includes('const x = 5;');
      expect(result).includes('const y = 10;');
    });
  });

  describe('extractImports', () => {
    it('should extract ES6 static imports', () => {
      const code = `import { foo } from 'module';\nimport bar from 'other';`;
      const imports = extractImports(code, 'test.ts');
      expect(imports.length).toBe(2);
      expect(imports[0].imported).toBe('module');
      expect(imports[0].type).toBe('static');
      expect(imports[1].imported).toBe('other');
    });

    it('should extract dynamic imports', () => {
      const code = `const load = async () => import('dynamic-module');`;
      const imports = extractImports(code, 'test.ts');
      expect(imports.length).toBe(1);
      expect(imports[0].imported).toBe('dynamic-module');
      expect(imports[0].type).toBe('dynamic');
    });

    it('should extract CommonJS requires', () => {
      const code = `const x = require('fs');\nconst y = require('path');`;
      const imports = extractImports(code, 'test.ts');
      expect(imports.length).toBe(2);
      expect(imports[0].imported).toBe('fs');
      expect(imports[0].type).toBe('require');
    });

    it('should ignore imports inside comments', () => {
      const code = `
        // import { fake } from 'comment';
        const real = import('real');
      `;
      const imports = extractImports(code, 'test.ts');
      expect(imports.length).toBe(1);
      expect(imports[0].imported).toBe('real');
    });

    it('should record correct line numbers', () => {
      const code = `line 1\nimport { x } from 'mod'\nline 3`;
      const imports = extractImports(code, 'test.ts');
      expect(imports[0].line).toBe(2);
    });
  });
});
