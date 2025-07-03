const fs = require('fs');
const path = './src/client/base.ts';

let content = fs.readFileSync(path, 'utf8');

const basePathLine = `export const BASE_PATH =\n  process.env.REACT_APP_LOCAL_API\n    ? 'http://localhost:8080/api/v1'\n    : '/api/v1';`;

if (/export const BASE_PATH = .+;/.test(content)) {
  content = content.replace(
    /export const BASE_PATH = .+;/,
    basePathLine
  );
} else {
  // Если строки нет, добавляем в начало файла
  content = basePathLine + '\n' + content;
}

fs.writeFileSync(path, content); 