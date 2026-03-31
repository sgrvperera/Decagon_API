import { APIResponse, expect } from '@playwright/test';

/**
 * Base assertion rule interface
 */
export interface AssertionRule {
  name: string;
  description: string;
  execute: (response: APIResponse, context?: any) => Promise<void>;
}

/**
 * Domain-specific assertion configuration
 */
export interface DomainAssertions {
  domain: string;
  commonRules: AssertionRule[];
  apiSpecificRules: Map<string, AssertionRule[]>;
}

/**
 * Assertion result for reporting
 */
export interface AssertionResult {
  ruleName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

/**
 * Base Assertion Builder
 */
export class AssertionBuilder {
  /**
   * Status code assertion
   */
  static status(expected: number | number[]): AssertionRule {
    return {
      name: 'status-code',
      description: `Status should be ${Array.isArray(expected) ? expected.join(' or ') : expected}`,
      execute: async (response: APIResponse) => {
        const actual = response.status();
        if (Array.isArray(expected)) {
          expect(expected, `Expected status to be one of [${expected.join(', ')}], but got ${actual}`).toContain(actual);
        } else {
          expect(actual, `Expected status ${expected}, but got ${actual}`).toBe(expected);
        }
      }
    };
  }

  /**
   * Response time assertion
   */
  static responseTime(maxMs: number): AssertionRule {
    return {
      name: 'response-time',
      description: `Response time should be under ${maxMs}ms`,
      execute: async (response: APIResponse, context?: any) => {
        if (context?.duration) {
          expect(context.duration, `Response time ${context.duration}ms exceeded ${maxMs}ms`).toBeLessThan(maxMs);
        }
      }
    };
  }

  /**
   * Required field exists
   */
  static fieldExists(fieldPath: string): AssertionRule {
    return {
      name: `field-exists-${fieldPath}`,
      description: `Field '${fieldPath}' should exist`,
      execute: async (response: APIResponse) => {
        const body = await response.json();
        const value = this.getNestedValue(body, fieldPath);
        expect(value, `Field '${fieldPath}' does not exist`).toBeDefined();
      }
    };
  }

  /**
   * Field has expected value
   */
  static fieldEquals(fieldPath: string, expected: any): AssertionRule {
    return {
      name: `field-equals-${fieldPath}`,
      description: `Field '${fieldPath}' should equal ${expected}`,
      execute: async (response: APIResponse) => {
        const body = await response.json();
        const value = this.getNestedValue(body, fieldPath);
        expect(value, `Field '${fieldPath}' expected ${expected}, got ${value}`).toBe(expected);
      }
    };
  }

  /**
   * Field matches pattern
   */
  static fieldMatches(fieldPath: string, pattern: RegExp): AssertionRule {
    return {
      name: `field-matches-${fieldPath}`,
      description: `Field '${fieldPath}' should match pattern ${pattern}`,
      execute: async (response: APIResponse) => {
        const body = await response.json();
        const value = this.getNestedValue(body, fieldPath);
        expect(String(value), `Field '${fieldPath}' does not match pattern`).toMatch(pattern);
      }
    };
  }

  /**
   * Field is array
   */
  static fieldIsArray(fieldPath: string, minLength?: number): AssertionRule {
    return {
      name: `field-is-array-${fieldPath}`,
      description: `Field '${fieldPath}' should be an array${minLength ? ` with at least ${minLength} items` : ''}`,
      execute: async (response: APIResponse) => {
        const body = await response.json();
        const value = this.getNestedValue(body, fieldPath);
        expect(Array.isArray(value), `Field '${fieldPath}' is not an array`).toBeTruthy();
        if (minLength !== undefined) {
          expect(value.length, `Array '${fieldPath}' has ${value.length} items, expected at least ${minLength}`).toBeGreaterThanOrEqual(minLength);
        }
      }
    };
  }

  /**
   * Body contains text
   */
  static bodyContains(text: string | string[]): AssertionRule {
    const texts = Array.isArray(text) ? text : [text];
    return {
      name: 'body-contains',
      description: `Body should contain: ${texts.join(', ')}`,
      execute: async (response: APIResponse) => {
        const bodyText = await response.text();
        for (const t of texts) {
          expect(bodyText, `Body does not contain '${t}'`).toContain(t);
        }
      }
    };
  }

  /**
   * Body is valid JSON
   */
  static bodyIsJson(): AssertionRule {
    return {
      name: 'body-is-json',
      description: 'Body should be valid JSON',
      execute: async (response: APIResponse) => {
        try {
          await response.json();
        } catch (error) {
          throw new Error('Response body is not valid JSON');
        }
      }
    };
  }

  /**
   * Body not empty
   */
  static bodyNotEmpty(): AssertionRule {
    return {
      name: 'body-not-empty',
      description: 'Body should not be empty',
      execute: async (response: APIResponse) => {
        const bodyText = await response.text();
        expect(bodyText.length, 'Response body is empty').toBeGreaterThan(0);
      }
    };
  }

  /**
   * Dialog API specific: executionStatus check
   */
  static dialogExecutionStatus(expected: string): AssertionRule {
    return {
      name: 'dialog-execution-status',
      description: `Dialog executionStatus should be '${expected}'`,
      execute: async (response: APIResponse) => {
        const body = await response.json();
        expect(body.executionStatus, `executionStatus expected '${expected}', got '${body.executionStatus}'`).toBe(expected);
      }
    };
  }

  /**
   * Dialog API specific: check if eligible
   */
  static dialogEligible(shouldBeEligible: boolean): AssertionRule {
    return {
      name: 'dialog-eligible',
      description: `Should ${shouldBeEligible ? 'be' : 'not be'} eligible`,
      execute: async (response: APIResponse) => {
        const body = await response.json();
        const bodyText = await response.text();
        
        // Check various eligibility indicators
        const isEligible = 
          body.eligible === true ||
          body.isEligible === true ||
          bodyText.includes('"eligible":true') ||
          bodyText.includes('"isEligible":true');
        
        if (shouldBeEligible) {
          expect(isEligible, 'Expected to be eligible but was not').toBeTruthy();
        } else {
          expect(isEligible, 'Expected to not be eligible but was').toBeFalsy();
        }
      }
    };
  }

  /**
   * Helper to get nested value from object
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      return current[key];
    }, obj);
  }
}

/**
 * Assertion Executor
 */
export class AssertionExecutor {
  async execute(response: APIResponse, rules: AssertionRule[], context?: any): Promise<AssertionResult[]> {
    const results: AssertionResult[] = [];

    for (const rule of rules) {
      try {
        await rule.execute(response, context);
        results.push({
          ruleName: rule.name,
          passed: true
        });
      } catch (error: any) {
        results.push({
          ruleName: rule.name,
          passed: false,
          error: error.message,
          details: error.matcherResult
        });
        // Re-throw to fail the test
        throw error;
      }
    }

    return results;
  }

  async executeSafe(response: APIResponse, rules: AssertionRule[], context?: any): Promise<AssertionResult[]> {
    const results: AssertionResult[] = [];

    for (const rule of rules) {
      try {
        await rule.execute(response, context);
        results.push({
          ruleName: rule.name,
          passed: true
        });
      } catch (error: any) {
        results.push({
          ruleName: rule.name,
          passed: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

export const assertionExecutor = new AssertionExecutor();
