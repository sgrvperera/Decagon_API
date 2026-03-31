import { test, expect, APIResponse } from '@playwright/test';
import { ApiClient } from '../../src/api/client/api-client';
import { numberResolver } from '../../src/helpers/number-resolver';
import { responseCapture } from '../../src/helpers/response-capture';
import { assertionExecutor } from '../../src/helpers/assertion-executor';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generic Scenario Runner
 * This function creates a test suite for any domain by reading scenarios from JSON
 * Assertions are defined in the scenario JSON, not hardcoded in the spec
 */
export function createScenarioSuite(scenarioFilePath: string, suiteName?: string) {
  // Load test data
  const packages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/test-data/packages.json'), 'utf8'));

  // Load scenarios
  const scenarioFile = JSON.parse(fs.readFileSync(scenarioFilePath, 'utf8'));
  const scenarios = scenarioFile.scenarios;
  const domain = scenarioFile.domain;

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
      .replace(/\{\{traceId\}\}/g, () => {
        const letters = 'DIA';
        const digits = Date.now().toString().slice(-12).padStart(12, '0');
        return letters + digits;
      });
    return JSON.parse(replaced);
  }

  test.describe(suiteName || `${domain} - Dialog API Tests`, () => {
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

      test(`${scenario.name} [${scenario.mifeApi}] ${scenario.tags.join(' ')}`, async ({ }, testInfo) => {
        const startTime = Date.now();

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

        console.log(`[Test] Executing: ${scenario.method} ${scenario.endpoint}`);
        if (resolvedNumber) {
          console.log(`[Test] Using account number: ${resolvedNumber}`);
        }

        let response: APIResponse;

        // Prepare capture context
        const captureContext = {
          testName: testInfo.title,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          domain: domain,
          mifeApi: scenario.mifeApi
        };

        // Execute request
        if (scenario.method === 'GET') {
          response = await client.get(scenario.endpoint, { headers, queryParams, captureContext });
        } else if (scenario.method === 'POST') {
          response = await client.post(scenario.endpoint, { headers, body, queryParams, captureContext });
        } else if (scenario.method === 'PUT') {
          response = await client.put(scenario.endpoint, { headers, body, queryParams, captureContext });
        } else if (scenario.method === 'DELETE') {
          response = await client.delete(scenario.endpoint, { headers, queryParams, captureContext });
        } else {
          throw new Error(`Unsupported method: ${scenario.method}`);
        }

        const duration = Date.now() - startTime;

        // Execute assertions from scenario JSON
        if (scenario.assertions) {
          await assertionExecutor.execute(response, scenario.assertions, { duration });
        } else {
          console.warn(`[Test] No assertions defined for scenario: ${scenario.id}`);
        }

        // Log response for debugging
        console.log(`[${scenario.id}] Status: ${response.status()}, Duration: ${duration}ms`);
        try {
          const responseBody = await response.json();
          console.log(`[${scenario.id}] Response:`, JSON.stringify(responseBody, null, 2).substring(0, 500));
        } catch (e) {
          console.log(`[${scenario.id}] Response is not JSON`);
        }
      });
    }
  });
}
