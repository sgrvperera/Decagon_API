import { test, expect, APIResponse } from '@playwright/test';
import { ApiClient } from '../../src/api/client/api-client';
import { numberResolver } from '../../src/helpers/number-resolver';
import * as fs from 'fs';
import * as path from 'path';

// Load test data
const packages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/test-data/packages.json'), 'utf8'));

// Load scenarios
const scenarioFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/scenarios/gsm-packages.json'), 'utf8'));
const scenarios = scenarioFile.scenarios;

// Helper to replace placeholders
function interpolate(obj: any, resolvedNumber?: string): any {
  if (!obj) return obj;
  const str = JSON.stringify(obj);
  const replaced = str
    .replace(/\{\{number\}\}/g, resolvedNumber || '')
    .replace(/\{\{packages\.([^}]+)\}\}/g, (_, path) => {
      const keys = path.split('.');
      let val = packages;
      for (const k of keys) val = val[k];
      return val;
    })
    .replace(/\{\{timestamp\}\}/g, Date.now().toString());
  return JSON.parse(replaced);
}

test.describe('GSM Packages - Dialog API Tests', () => {
  let client: ApiClient;

  test.beforeAll(async () => {
    client = await ApiClient.create();
  });

  test.afterAll(async () => {
    await client.dispose();
  });

  for (const scenario of scenarios) {
    // Filter by tag if TEST_TAG is set
    if (process.env.TEST_TAG && !scenario.tags.includes(process.env.TEST_TAG)) {
      continue;
    }

    test(`${scenario.name} [${scenario.mifeApi}] ${scenario.tags.join(' ')}`, async () => {
      // Resolve test number if scenario requires it
      let resolvedNumber: string | undefined;
      if (scenario.numberResolution) {
        const resolution = numberResolver.resolve({
          apiDomain: scenario.numberResolution.apiDomain,
          operation: scenario.numberResolution.operation,
          connectionType: scenario.numberResolution.connectionType,
          serviceType: scenario.numberResolution.serviceType,
          scenarioType: scenario.numberResolution.scenarioType || 'positive'
        });
        resolvedNumber = resolution.number;
        console.log(`[Test] Resolved number: ${resolvedNumber} (${resolution.source})`);
      }

      const headers = interpolate(scenario.headers, resolvedNumber);
      const body = interpolate(scenario.body, resolvedNumber);
      const queryParams = interpolate(scenario.queryParams, resolvedNumber);

      let response: APIResponse;

      // Execute request
      if (scenario.method === 'GET') {
        response = await client.get(scenario.endpoint, { headers, queryParams });
      } else if (scenario.method === 'POST') {
        response = await client.post(scenario.endpoint, { headers, body, queryParams });
      } else if (scenario.method === 'PUT') {
        response = await client.put(scenario.endpoint, { headers, body, queryParams });
      } else if (scenario.method === 'DELETE') {
        response = await client.delete(scenario.endpoint, { headers, queryParams });
      } else {
        throw new Error(`Unsupported method: ${scenario.method}`);
      }

      // Assertions
      const assertions = scenario.assertions;
      
      // Status assertion
      if (Array.isArray(assertions.status)) {
        expect(assertions.status).toContain(response.status());
      } else {
        expect(response.status()).toBe(assertions.status);
      }

      // Body not empty assertion
      if (assertions.bodyNotEmpty) {
        const body = await response.text();
        expect(body.length).toBeGreaterThan(0);
      }

      // Log response for debugging
      console.log(`[${scenario.id}] Status: ${response.status()}`);
      try {
        const responseBody = await response.json();
        console.log(`[${scenario.id}] Response:`, JSON.stringify(responseBody, null, 2).substring(0, 500));
      } catch (e) {
        // Not JSON, that's okay
      }
    });
  }
});
