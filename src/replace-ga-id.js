const fs = require('fs');
const path = require('path');

const config = require('./src/assets/app-config.json');
const gaId = config.googleAnalyticsId;

const indexPath = path.join(__dirname, 'dist', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(/__GA_ID__/g, gaId);
fs.writeFileSync(indexPath, indexContent);
console.log('Google Analytics ID injected:', gaId);