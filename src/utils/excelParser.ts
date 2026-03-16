// src/utils/excelParser.ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';
import { parseCurl } from './curlParser';

function readExcelToJson(inputPath: string) {
  const workbook = XLSX.readFile(inputPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const apis = rows.map((r: any, i: number) => {
    const curl = r['Chatbot curl'] || r['Chatbot curl '] || r['Chatbot curl\n'] || r['Chatbot curl\r'] || '';
    const parsed = parseCurl(String(curl));
    const apiCommonName = r['API Common Name'] || r['API'] || `row-${i}`;
    const mifeName = r['MIFE API Name'] || '';
    return {
      apiCommonName,
      mifeName,
      rawCurl: curl,
      parsed
    };
  });

  return apis;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: ts-node src/utils/excelParser.ts <input-xlsx> <output-json>');
    process.exit(2);
  }
  const [inFile, outFile] = argv;
  const apis = readExcelToJson(inFile);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(apis, null, 2), 'utf8');
  console.log('Wrote', outFile);
}

if (require.main === module) main();
