const fs = require('fs');
const path = './src/client/base.ts';

let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /export const BASE_PATH = .+;/,
  "export const BASE_PATH = '/api/v1';"
);
fs.writeFileSync(path, content); 