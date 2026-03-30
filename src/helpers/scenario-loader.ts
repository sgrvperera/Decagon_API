import * as fs from 'fs';
import * as path from 'path';
import { TestTag } from './test-tags';

export interface ApiScenario {
  id: string;
  name: string;
  description: string;
  tags: TestTag[];
  apiId: string;
  method: string;
  path: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  expectedStatus: number | number[];
  assertions: ScenarioAssertion[];
  skip?: boolean;
  skipReason?: string;
}

export interface ScenarioAssertion {
  type: 'status' | 'schema' | 'field' | 'contains' | 'custom';
  field?: string;
  expected?: any;
  schemaFile?: string;
  customValidator?: string;
}

class ScenarioLoader {
  private scenarios: Map<string, ApiScenario[]> = new Map();

  loadScenarios(apiDomain: string): ApiScenario[] {
    if (this.scenarios.has(apiDomain)) {
      return this.scenarios.get(apiDomain)!;
    }

    const scenarioPath = path.resolve(__dirname, `../../data/scenarios/${apiDomain}.scenarios.json`);
    
    if (!fs.existsSync(scenarioPath)) {
      console.warn(`No scenario file found for ${apiDomain}`);
      return [];
    }

    const scenarios = JSON.parse(fs.readFileSync(scenarioPath, 'utf8')) as ApiScenario[];
    this.scenarios.set(apiDomain, scenarios);
    return scenarios;
  }

  getScenario(apiDomain: string, scenarioId: string): ApiScenario | undefined {
    const scenarios = this.loadScenarios(apiDomain);
    return scenarios.find(s => s.id === scenarioId);
  }

  getScenariosByTag(apiDomain: string, tag: TestTag): ApiScenario[] {
    const scenarios = this.loadScenarios(apiDomain);
    return scenarios.filter(s => s.tags.includes(tag));
  }
}

export const scenarioLoader = new ScenarioLoader();
