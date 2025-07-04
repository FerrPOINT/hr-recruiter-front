const fs = require('fs');
const path = './src/client/base.ts';

// Best practice: используем только REACT_APP_API_BASE_URL для настройки API
const basePathLine = `export const BASE_PATH =\n  process.env.REACT_APP_API_BASE_URL || '/api/v1';`;

let content = fs.readFileSync(path, 'utf8');

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