import { DISEASE_DATA } from '../src/data/treatments.js';
import fs from 'fs';
import path from 'path';

const outputPath = path.resolve('backend/data/existing_treatments.json');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(DISEASE_DATA, null, 2));
console.log(`Exported data to ${outputPath}`);
