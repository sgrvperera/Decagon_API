import { test, expect, APIResponse } from '@playwright/test';
import { ApiClient } from '../../src/api/client/api-client';
import { numberResolver } from '../../src/helpers/number-resolver';
import { responseCapture } from '../../src/helpers/response-capture';
import { assertionExecutor } from '../../src/helpers/assertion-executor';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generic Scenario Runner with Recursive File Discovery
 * Supports both flat and hierarchical scenario structures
 */

// Helper to find all scenario JSON files recursively
function findScenarioFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findScenarioFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'book5_structured.json') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Helper to load scenario file
function loadScenarioFile(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  // Support both old format (domain + scenarios) and new format (metadata + mifeApi + scenarios)
  if (data.scenarios) {
    return {
      domain: data.domain || data.metadata?.mainWorkflow || 'unknown',
      mifeApi: data.mifeApi || data.mifeApis?.[0] || 'unknown',
      scenarios: data.scenarios,
      metadata: data.metadata
    };
  }
  
  return null;
}

/**
 * Create test suite from a single scenario file
 */
export function createScenarioSuite(scenarioFilePath: string, suiteName?: string) {
  const packages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/test-data/packages.json'), 'utf8'));
  
  const scenarioFile = loadScenarioFile(scenarioFilePath);
  if (!scenarioFile) {
    console.warn(`[Scenario Runner] Invalid scenario file: ${scenarioFilePath}`);
    return;
  }
  
  const scenarios = scenarioFile.scenarios;
  const domain = scenarioFile.domain;
  const mifeApi = scenarioFile.mifeApi;
  
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
  
  test.describe(suiteName || `${domain} - ${mifeApi}`, () => {
    let client: ApiClient;
    
    test.beforeAll(async () => {
      client = await ApiClient.create();
    });
    
    test.afterAll(async () => {
      await client.dispose();
    });
    
    for (const scenario of scenarios) {
      if (process.env.TEST_TAG && !scenario.tags.includes(process.env.TEST_TAG)) {
        continue;
      }
      
      test(`${scenario.name} [${scenario.mifeApi}] ${scenario.tags.join(' ')}`, async ({ }, testInfo) => {
        const startTime = Date.now();
        
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
        
        const captureContext = {
          testName: testInfo.title,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          domain: domain,
          mifeApi: scenario.mifeApi
        };
        
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
        
        if (scenario.assertions) {
          await assertionExecutor.execute(response, scenario.assertions, { duration });
        } else {
          console.warn(`[Test] No assertions defined for scenario: ${scenario.id}`);
        }
        
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

/**
 * Create test suite from a directory (recursively finds all scenario files)
 */
export function createScenarioSuiteFromDirectory(directoryPath: string, suiteName?: string) {
  const scenarioFiles = findScenarioFiles(directoryPath);
  
  if (scenarioFiles.length === 0) {
    console.warn(`[Scenario Runner] No scenario files found in: ${directoryPath}`);
    return;
  }
  
  console.log(`[Scenario Runner] Found ${scenarioFiles.length} scenario files in ${directoryPath}`);
  
  for (const filePath of scenarioFiles) {
    const relativePath = path.relative(directoryPath, filePath);
    createScenarioSuite(filePath, suiteName ? `${suiteName} - ${relativePath}` : relativePath);
  }
}

/**
 * Create test suite for a specific MIFE API by searching recursively
 */
export function createScenarioSuiteForMifeApi(rootDir: string, mifeApiName: string, suiteName?: string) {
  const scenarioFiles = findScenarioFiles(rootDir);
  
  for (const filePath of scenarioFiles) {
    const scenarioFile = loadScenarioFile(filePath);
    if (scenarioFile && scenarioFile.mifeApi === mifeApiName) {
      createScenarioSuite(filePath, suiteName || `${mifeApiName} Tests`);
      return;
    }
  }
  
  console.warn(`[Scenario Runner] No scenario file found for MIFE API: ${mifeApiName}`);
}
