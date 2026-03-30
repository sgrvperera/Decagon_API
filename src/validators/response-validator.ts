import { APIResponse, expect } from '@playwright/test';
import { schemaValidator } from './schema-validator';
import { ScenarioAssertion } from '../helpers/scenario-loader';

export class ResponseValidator {
  async validate(response: APIResponse, assertions: ScenarioAssertion[]) {
    for (const assertion of assertions) {
      await this.executeAssertion(response, assertion);
    }
  }

  private async executeAssertion(response: APIResponse, assertion: ScenarioAssertion) {
    switch (assertion.type) {
      case 'status':
        this.validateStatus(response, assertion.expected);
        break;
      case 'schema':
        await this.validateSchema(response, assertion.schemaFile!);
        break;
      case 'field':
        await this.validateField(response, assertion.field!, assertion.expected);
        break;
      case 'contains':
        await this.validateContains(response, assertion.field!, assertion.expected);
        break;
    }
  }

  private validateStatus(response: APIResponse, expected: number | number[]) {
    const status = response.status();
    if (Array.isArray(expected)) {
      expect(expected).toContain(status);
    } else {
      expect(status).toBe(expected);
    }
  }

  private async validateSchema(response: APIResponse, schemaFile: string) {
    const body = await response.json();
    const result = schemaValidator.validate(schemaFile, body);
    
    if (!result.valid) {
      throw new Error(`Schema validation failed: ${result.errors?.join(', ')}`);
    }
  }

  private async validateField(response: APIResponse, field: string, expected: any) {
    const body = await response.json();
    const value = this.getNestedValue(body, field);
    expect(value).toBe(expected);
  }

  private async validateContains(response: APIResponse, field: string, expected: any) {
    const body = await response.json();
    const value = this.getNestedValue(body, field);
    
    if (Array.isArray(value)) {
      expect(value).toContain(expected);
    } else if (typeof value === 'string') {
      expect(value).toContain(expected);
    } else {
      throw new Error(`Field ${field} is not an array or string`);
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  async getResponseBody(response: APIResponse): Promise<any> {
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }
}

export const responseValidator = new ResponseValidator();
