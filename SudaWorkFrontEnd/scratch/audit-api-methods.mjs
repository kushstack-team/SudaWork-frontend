import fs from 'fs';
import path from 'path';
import { mockApi } from '../src/services/mock/index.js';

function getFiles(dir, files = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== 'dist' && item.name !== '.git') {
        getFiles(full, files);
      }
    } else if (item.name.endsWith('.jsx') || item.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = getFiles('./src');
const missing = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Look for mockApi.domain.method
  const matches = content.matchAll(/mockApi\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g);
  for (const m of matches) {
    const domain = m[1];
    const method = m[2];
    if (!mockApi[domain]) {
      missing.push({ file, domain, method, reason: `domain "${domain}" does not exist on mockApi` });
    } else if (typeof mockApi[domain][method] !== 'function') {
      missing.push({ file, domain, method, reason: `method "${domain}.${method}" is not a function` });
    }
  }
}

console.log('--- API Audit Results ---');
if (missing.length === 0) {
  console.log('ALL mockApi calls match defined domain functions 100%!');
} else {
  console.log(`Found ${missing.length} missing mockApi methods:`);
  for (const item of missing) {
    console.log(`- [${path.basename(item.file)}] mockApi.${item.domain}.${item.method} -> ${item.reason}`);
  }
}
