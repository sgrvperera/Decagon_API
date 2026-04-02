import { APIResponse, expect } from '@playwright/test';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Generic Assertion Executor
 * Reads assertions from scenario JSON and executes them against API responses
 * This keeps the test spec generic while assertions live in scenario files
 */

export interface ScenarioAssertions {
  status?: number | number[];
  responseTime?: number;
  bodyNotEmpty?: boolean;
  requiredFields?: string[];
  fieldValues?: Record<string, any>;
  fieldMatches?: Record<string, string>; // field: regex pattern
  bodyContains?: string[];
  arrayFields?: string[];
  arrayMinLength?: Record<string, number>; // field: minLength
  jsonSchema?: any;
  customValidation?: string; // For future extensibility
}

export class AssertionExecutor {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(this.ajv);
  }

  /**
   * Execute all assertions defined in scenario
   */
  async execute(response: APIResponse, assertions: ScenarioAssertions, context?: { duration?: number }): Promise<void> {
    if (!assertions) {
      console.warn('[AssertionExecutor] No assertions defined for scenario');
      return;
    }

    // Status assertion
    if (assertions.status !== undefined) {
      await this.assertStatus(response, assertions.status);
    }

    // Response time assertion
    if (assertions.responseTime !== undefined && context?.duration !== undefined) {
      await this.assertResponseTime(context.duration, assertions.responseTime);
    }

    // Body not empty assertion
    if (assertions.bodyNotEmpty) {
      await this.assertBodyNotEmpty(response);
    }

    // Required fields assertion
    if (assertions.requiredFields && assertions.requiredFields.length > 0) {
      await this.assertRequiredFields(response, assertions.requiredFields);
    }

    // Field values assertion
    if (assertions.fieldValues) {
      await this.assertFieldValues(response, assertions.fieldValues);
    }

    // Field matches (regex) assertion
    if (assertions.fieldMatches) {
      await this.assertFieldMatches(response, assertions.fieldMatches);
    }

    // Body contains assertion
    if (assertions.bodyContains && assertions.bodyContains.length > 0) {
      await this.assertBodyContains(response, assertions.bodyContains);
    }

    // Array fields assertion
    if (assertions.arrayFields && assertions.arrayFields.length > 0) {
      await this.assertArrayFields(response, assertions.arrayFields);
    }

    // Array min length assertion
    if (assertions.arrayMinLength) {
      await this.assertArrayMinLength(response, assertions.arrayMinLength);
    }

    // JSON Schema validation (if provided)
    if (assertions.jsonSchema) {
      await this.assertJsonSchema(response, assertions.jsonSchema);
    }
  }

  /**
   * Assert status code
   */
  private async assertStatus(response: APIResponse, expected: number | number[]): Promise<void> {
    const actual = response.status();
    
    if (Array.isArray(expected)) {
      expect(expected, `Expected status to be one of [${expected.join(', ')}], but got ${actual}`).toContain(actual);
    } else {
      expect(actual, `Expected status ${expected}, but got ${actual}`).toBe(expected);
    }
  }

  /**
   * Assert response time
   */
  private async assertResponseTime(actual: number, maxMs: number): Promise<void> {
    expect(actual, `Response time ${actual}ms exceeded maximum ${maxMs}ms`).toBeLessThan(maxMs);
  }

  /**
   * Assert body is not empty
   */
  private async assertBodyNotEmpty(response: APIResponse): Promise<void> {
    const bodyText = await response.text();
    expect(bodyText.length, 'Response body is empty').toBeGreaterThan(0);
  }

  /**
   * Assert required fields exist in response
   */
  private async assertRequiredFields(response: APIResponse, fields: string[]): Promise<void> {
    const body = await response.json();
    
    for (const field of fields) {
      const value = this.getNestedValue(body, field);
      expect(value, `Required field '${field}' is missing or undefined`).toBeDefined();
    }
  }

  /**
   * Assert field values match expected
   */
  private async assertFieldValues(response: APIResponse, fieldValues: Record<string, any>): Promise<void> {
    const body = await response.json();
    
    for (const [field, expectedValue] of Object.entries(fieldValues)) {
      const actualValue = this.getNestedValue(body, field);
      expect(actualValue, `Field '${field}' expected '${expectedValue}', but got '${actualValue}'`).toBe(expectedValue);
    }
  }

  /**
   * Assert field values match regex patterns
   */
  private async assertFieldMatches(response: APIResponse, fieldPatterns: Record<string, string>): Promise<void> {
    const body = await response.json();
    
    for (const [field, pattern] of Object.entries(fieldPatterns)) {
      const value = this.getNestedValue(body, field);
      const regex = new RegExp(pattern);
      expect(String(value), `Field '${field}' does not match pattern ${pattern}`).toMatch(regex);
    }
  }

  /**
   * Assert body contains specific strings
   */
  private async assertBodyContains(response: APIResponse, substrings: string[]): Promise<void> {
    const bodyText = await response.text();
    
    for (const substring of substrings) {
      expect(bodyText, `Body does not contain '${substring}'`).toContain(substring);
    }
  }

  /**
   * Assert specific fields are arrays
   */
  private async assertArrayFields(response: APIResponse, fields: string[]): Promise<void> {
    const body = await response.json();
    
    for (const field of fields) {
      const value = this.getNestedValue(body, field);
      expect(Array.isArray(value), `Field '${field}' is not an array`).toBeTruthy();
    }
  }

  /**
   * Assert array fields have minimum length
   */
  private async assertArrayMinLength(response: APIResponse, fieldLengths: Record<string, number>): Promise<void> {
    const body = await response.json();
    
    for (const [field, minLength] of Object.entries(fieldLengths)) {
      const value = this.getNestedValue(body, field);
      expect(Array.isArray(value), `Field '${field}' is not an array`).toBeTruthy();
      expect(value.length, `Array '${field}' has ${value.length} items, expected at least ${minLength}`).toBeGreaterThanOrEqual(minLength);
    }
  }

  /**
   * Assert JSON schema using AJV validator
   */
  private async assertJsonSchema(response: APIResponse, schema: any): Promise<void> {
    const body = await response.json();
    
    const validate = this.ajv.compile(schema);
    const valid = validate(body);
    
    if (!valid) {
      const errors = validate.errors?.map(err => 
        `${err.instancePath || 'root'} ${err.message}`
      ).join(', ');
      
      expect(valid, `JSON Schema validation failed: ${errors}`).toBeTruthy();
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      return current[key];
    }, obj);
  }
}

export const assertionExecutor = new AssertionExecutor();
