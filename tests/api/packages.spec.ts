// tests/api/packages.spec.ts
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/apiClient';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

type ApiDefinition = {
  apiCommonName: string;
  mifeName: string;
  rawCurl: string;
  parsed:
    | {
        method: string;
        url: string;
        headers?: Record<string, string>;
        data?: any;
      }
    | null;
};

const definitionsPath = path.resolve(__dirname, '../../data/generated/api-definitions.json');
const raw = JSON.parse(fs.readFileSync(definitionsPath, 'utf8')) as ApiDefinition[];

test.describe('API definitions from Excel', () => {
  let client: ApiClient;

  test.beforeAll(async () => {
    const firstParsedUrl = raw.find(r => r.parsed && r.parsed.url)?.parsed!.url;
    const baseUrl = process.env.BASE_URL || (firstParsedUrl ? new URL(firstParsedUrl).origin : '');
    const defaultHeaders: Record<string, string> = {};
    if (process.env.TRACE_ID) defaultHeaders['traceId'] = process.env.TRACE_ID;
    client = await ApiClient.create(baseUrl, defaultHeaders);
  });

  // Define one test per API definition (use index to guarantee unique test titles)
  raw.forEach((def, index) => {
    const safeIndex = index; // keep readable name in title

    if (!def.parsed) {
      test(`[${safeIndex}] SKIP - cannot parse: ${def.apiCommonName}`, async () => {
        test.skip();
      });
      return;
    }

    const url = def.parsed.url;
    const inferredBaseOrigin = process.env.BASE_URL || new URL(raw.find(r => r.parsed && r.parsed.url)!.parsed!.url).origin;
    const pathOnly = url.startsWith(inferredBaseOrigin) ? url.substring(inferredBaseOrigin.length) : url;

    test(`[${safeIndex}] ${def.apiCommonName} [${def.mifeName}]`, async () => {
      let res;
      const headers = def.parsed!.headers || {};

      if (def.parsed!.method === 'GET') {
        res = await client.get(pathOnly, { headers });
      } else if (def.parsed!.method === 'POST') {
        res = await client.post(pathOnly, { headers, data: def.parsed!.data });
      } else if (def.parsed!.method === 'PUT') {
        res = await client.put(pathOnly, { headers, data: def.parsed!.data });
      } else if (def.parsed!.method === 'DELETE') {
        res = await client.delete(pathOnly, { headers, data: def.parsed!.data });
      } else {
        throw new Error(`Unsupported method ${def.parsed!.method}`);
      }

      // Basic validations: status and JSON body presence (adapt as needed)
      expect([200, 201, 202, 204]).toContain(res.status());
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
    });
  });

  test.afterAll(async () => {
    if (client) await client.dispose();
  });
});