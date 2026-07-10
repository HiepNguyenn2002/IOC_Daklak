const fs = require('fs');
const path = '/Users/trungngo/Downloads/OIC_Daklak/backend/data/nguoi-dung.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const fixed = data.filter(u => u.username !== null);
fs.writeFileSync(path, JSON.stringify(fixed, null, 2));
