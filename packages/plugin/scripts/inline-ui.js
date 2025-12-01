import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

// Read the generated HTML file
const htmlPath = path.join(distDir, 'ui.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Inline the HTML into code.js
const codePath = path.join(distDir, 'code.js');
let code = fs.readFileSync(codePath, 'utf-8');

// Replace __html__ with the actual HTML content
const escapedHtml = html
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

code = code.replace(
  'figma.showUI(__html__',
  `figma.showUI(\`${escapedHtml}\``
);

fs.writeFileSync(codePath, code);
console.log('✓ Inlined UI HTML into code.js');
