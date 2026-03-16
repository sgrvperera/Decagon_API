// src/utils/curlParser.ts
export type ParsedCurl = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string;
  url: string;
  headers: Record<string, string>;
  data?: any;
};

export function parseCurl(curl: string): ParsedCurl | null {
  if (!curl) return null;
  const s = curl.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();

  const urlMatch = s.match(/curl(?: --location|-L)?\s+'([^']+)'|curl(?: --location|-L)?\s+"([^"]+)"/);
  const url = urlMatch ? (urlMatch[1] || urlMatch[2]) : null;
  if (!url) return null;

  const headers: Record<string, string> = {};
  const headerRegex = /--header\s+'([^']+)'|--header\s+"([^"]+)"/g;
  let m;
  while ((m = headerRegex.exec(s)) !== null) {
    const hv = m[1] || m[2];
    const [k, ...rest] = hv.split(':');
    const v = rest.join(':').trim();
    headers[k.trim()] = v;
  }

  const dataMatch = s.match(/--data(?:-raw)?\s+'([^']*)'|--data(?:-raw)?\s+"([^"]*)"/);
  const dataRaw = dataMatch ? (dataMatch[1] || dataMatch[2]) : undefined;

  let method = 'GET';
  if (/--request\s+['"]?POST| -X\s+POST/i.test(s) || dataRaw) method = 'POST';
  if (/--request\s+['"]?PUT| -X\s+PUT/i.test(s)) method = 'PUT';
  if (/--request\s+['"]?DELETE| -X\s+DELETE/i.test(s)) method = 'DELETE';

  let data;
  try {
    if (dataRaw) data = JSON.parse(dataRaw);
  } catch (e) {
    data = dataRaw;
  }

  return { method, url, headers, data };
}
