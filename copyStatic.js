import fs from 'fs';
import path from 'path';

const src = './institucional';
const dest = './dist/institucional';

fs.cpSync(src, dest, { recursive: true });
console.log("📁 Copiado: institucional → dist/institucional");
