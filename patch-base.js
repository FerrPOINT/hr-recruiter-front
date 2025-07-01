const fs = require('fs');
const path = './src/client/base.ts';

let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /export const BASE_PATH = .+;/,
  'export const BASE_PATH = \'http://\' + ((process.env.REACT_APP_RECRUITER_API_HOST as string) + \'/api/v1\').replace(/\\/+$/, "");'
);
fs.writeFileSync(path, content); 