const { register } = require('tsconfig-paths');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load your tsconfig paths and register them for runtime resolution
const tsconfig = JSON.parse(readFileSync(resolve(process.cwd(), 'tsconfig.json'), 'utf8'));
const baseUrl = tsconfig.compilerOptions?.baseUrl || '.';
const paths = tsconfig.compilerOptions?.paths || {};

register({ baseUrl: resolve(process.cwd(), baseUrl), paths });

// Then dynamically import the compiled entry (ESM)
import('./dist/src/index.js').catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
