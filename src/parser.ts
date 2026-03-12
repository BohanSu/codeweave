import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

export interface ImportInfo {
  source: string;
  imported: string;
  type: 'static' | 'dynamic' | 'require' | 'import-meta';
  line: number;
}

export interface FileInfo {
  path: string;
  imports: ImportInfo[];
}

const INLINE_COMMENT_RE = /\/\/.*$/gm;
const BLOCK_COMMENT_RE = /\/\*[\s\S]*?\*\//g;

const IMPORT_PATTERNS = [
  // ES6 imports: import { x } from 'module'
  {
    regex: /^import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]\s*;?$/gm,
    type: 'static' as const,
  },
  // Dynamic imports: import('module')
  {
    regex: /import\(['"]([^'"]+)['"]\)/g,
    type: 'dynamic' as const,
  },
  // CommonJS require: require('module')
  {
    regex: /require\(['"]([^'"]+)['"]\)/g,
  type: 'require' as const,
  },
  // Import.meta: import.meta.url (simplified)
  {
    regex: /import\.meta\b/g,
    type: 'import-meta' as const,
  },
];

export function stripComments(code: string): string {
  return code.replace(BLOCK_COMMENT_RE, '').replace(INLINE_COMMENT_RE, '');
}

export function extractImports(content: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const processedCode = stripComments(content);

  for (const pattern of IMPORT_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(processedCode)) !== null) {
      const lineIndex = processedCode.substring(0, match.index).split('\n').length - 1;
      imports.push({
        source: filePath,
        imported: match[1] || 'import.meta',
        type: pattern.type,
        line: lineIndex + 1,
      });
    }
  }

  return imports;
}

export function parseFile(filePath: string): FileInfo | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const imports = extractImports(content, filePath);
    return { path: filePath, imports };
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error}`);
    return null;
  }
}

export function getAllFiles(
  dirPath: string,
  extensions: string[] = ['.ts', '.js', '.tsx', '.jsx', '.mjs', '.cjs'],
): string[] {
  const files: string[] = [];
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and common ignore directories
      if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (entry.isFile()) {
      const ext = extname(fullPath);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

export function parseDirectory(dirPath: string): FileInfo[] {
  const files = getAllFiles(dirPath);
  const parsedFiles = files.map(parseFile).filter((f): f is FileInfo => f !== null);
  return parsedFiles;
}
