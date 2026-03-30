import * as fs from 'fs';
import * as path from 'path';
import {
  TestNumberRegistry,
  NumberResolutionRequest,
  NumberResolutionResult,
  TestNumber,
  ServiceType,
  ConnectionType,
  ScenarioType
} from '../types/test-data.types';

class NumberResolver {
  private registry!: TestNumberRegistry;
  private mapping!: any;

  constructor() {
    this.loadRegistry();
    this.loadMapping();
  }

  private loadRegistry() {
    const registryPath = path.resolve(__dirname, '../../data/test-data/test-numbers.json');
    this.registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }

  private loadMapping() {
    const mappingPath = path.resolve(__dirname, '../../data/test-data/service-number-mapping.json');
    this.mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  }

  /**
   * Main resolution method - resolves test number based on API context
   */
  resolve(request: NumberResolutionRequest): NumberResolutionResult {
    console.log(`[NumberResolver] Resolving number for:`, JSON.stringify(request, null, 2));

    // Handle negative scenarios first
    if (request.scenarioType === 'negative') {
      return this.resolveNegativeNumber(request);
    }

    // Resolve based on API domain and operation
    const mappingKey = this.getMappingKey(request.apiDomain);
    if (!mappingKey) {
      console.warn(`[NumberResolver] No mapping found for API domain: ${request.apiDomain}, using fallback`);
      return this.resolveFallback(request);
    }

    const apiMapping = this.mapping.apiToServiceMapping[mappingKey];
    if (!apiMapping) {
      console.warn(`[NumberResolver] No API mapping found for: ${mappingKey}, using fallback`);
      return this.resolveFallback(request);
    }

    // Get the path to the number in registry
    const numberPath = this.getNumberPath(apiMapping, request);
    if (!numberPath) {
      console.warn(`[NumberResolver] No number path found, using fallback`);
      return this.resolveFallback(request);
    }

    // Resolve the actual number
    const testNumber = this.getNumberFromPath(numberPath);
    if (!testNumber) {
      console.warn(`[NumberResolver] Could not resolve number from path: ${numberPath}, using fallback`);
      return this.resolveFallback(request);
    }

    return this.createResult(testNumber, numberPath);
  }

  /**
   * Resolve number for eligibility checks
   */
  resolveForEligibility(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): NumberResolutionResult {
    return this.resolve({
      apiDomain,
      operation: 'eligibility',
      connectionType,
      serviceType,
      scenarioType: 'positive'
    });
  }

  /**
   * Resolve number for package activation
   */
  resolveForActivation(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): NumberResolutionResult {
    return this.resolve({
      apiDomain,
      operation: 'activation',
      connectionType,
      serviceType,
      scenarioType: 'positive'
    });
  }

  /**
   * Resolve number for getting packages
   */
  resolveForGetPackages(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): NumberResolutionResult {
    return this.resolve({
      apiDomain,
      operation: 'getPackages',
      connectionType,
      serviceType,
      scenarioType: 'positive'
    });
  }

  /**
   * Resolve number for data usage (with SBU)
   */
  resolveForDataUsage(operation: 'summary' | 'detailed', sbu: string): NumberResolutionResult {
    return this.resolve({
      apiDomain: 'data-usage',
      operation,
      connectionType: 'POSTPAID',
      sbu,
      scenarioType: 'positive'
    });
  }

  /**
   * Resolve invalid number for negative tests
   */
  resolveInvalidNumber(): NumberResolutionResult {
    const invalidNumber = this.registry.invalid.numbers[0];
    return this.createResult(invalidNumber, 'invalid.numbers[0]');
  }

  /**
   * Resolve inactive number for negative tests
   */
  resolveInactiveNumber(serviceType: ServiceType, connectionType: ConnectionType): NumberResolutionResult {
    let testNumber: TestNumber | undefined;
    let source = '';

    if (serviceType === 'GSM') {
      if (connectionType === 'POSTPAID') {
        testNumber = this.registry.postpaid.inactive[0];
        source = 'postpaid.inactive[0]';
      } else {
        testNumber = this.registry.prepaid.inactive[0];
        source = 'prepaid.inactive[0]';
      }
    } else if (serviceType === 'DTV') {
      testNumber = this.registry.dtv.postpaid.inactive[0];
      source = 'dtv.postpaid.inactive[0]';
    } else if (serviceType === 'HBB') {
      testNumber = this.registry.hbb.postpaid.inactive[0];
      source = 'hbb.postpaid.inactive[0]';
    } else if (serviceType === 'MBB') {
      testNumber = this.registry.mbb.postpaid.inactive[0];
      source = 'mbb.postpaid.inactive[0]';
    }

    if (!testNumber) {
      return this.resolveInvalidNumber();
    }

    return this.createResult(testNumber, source);
  }

  // ========== PRIVATE HELPER METHODS ==========

  private getMappingKey(apiDomain: string): string | null {
    // Map API domain to mapping key
    const domainMap: Record<string, string> = {
      'gsm-packages': 'gsm-package',
      'gsm-package': 'gsm-package',
      'dtv-packages': 'dtv-package',
      'dtv-package': 'dtv-package',
      'hbb-packages': 'hbb-package',
      'hbb-package': 'hbb-package',
      'mbb-packages': 'mbb-package',
      'mbb-package': 'mbb-package',
      'dtv-channel': 'dtv-channel',
      'data-usage': 'data-usage',
      'balance-check': 'balance-check',
      'connection-status': 'connection-status',
      'reconnection': 'reconnection'
    };

    return domainMap[apiDomain] || null;
  }

  private getNumberPath(apiMapping: any, request: NumberResolutionRequest): string | null {
    // Handle data usage special case (uses SBU)
    if (request.apiDomain === 'data-usage' && request.sbu) {
      const sbuLower = request.sbu.toLowerCase();
      return apiMapping[request.operation]?.[sbuLower] || null;
    }

    // Standard operation-based resolution
    const operationMapping = apiMapping[request.operation];
    if (!operationMapping) {
      return null;
    }

    // Get path based on connection type
    const connectionTypeLower = request.connectionType.toLowerCase();
    return operationMapping[connectionTypeLower] || null;
  }

  private getNumberFromPath(path: string): TestNumber | null {
    try {
      // Parse path like "postpaid.active[0]" or "dtv.postpaid.active[0]"
      const parts = path.split('.');
      let current: any = this.registry;

      for (const part of parts) {
        if (part.includes('[')) {
          // Handle array access like "active[0]"
          const [key, indexStr] = part.split('[');
          const index = parseInt(indexStr.replace(']', ''));
          current = current[key]?.[index];
        } else {
          current = current[part];
        }

        if (current === undefined) {
          return null;
        }
      }

      return current as TestNumber;
    } catch (error) {
      console.error(`[NumberResolver] Error parsing path: ${path}`, error);
      return null;
    }
  }

  private resolveNegativeNumber(request: NumberResolutionRequest): NumberResolutionResult {
    // For negative tests, use inactive or invalid numbers
    const negativeMapping = this.mapping.negativeTestMapping;

    // Determine which negative number to use
    let numberPath: string;

    if (request.serviceType === 'GSM') {
      numberPath = request.connectionType === 'POSTPAID' 
        ? negativeMapping.inactivePostpaid 
        : negativeMapping.inactivePrepaid;
    } else if (request.serviceType === 'DTV') {
      numberPath = negativeMapping.inactiveDTV;
    } else if (request.serviceType === 'HBB') {
      numberPath = negativeMapping.inactiveHBB;
    } else if (request.serviceType === 'MBB') {
      numberPath = negativeMapping.inactiveMBB;
    } else {
      numberPath = negativeMapping.invalidNumber;
    }

    const testNumber = this.getNumberFromPath(numberPath);
    if (!testNumber) {
      // Ultimate fallback
      return this.createResult(this.registry.invalid.numbers[0], 'invalid.numbers[0]');
    }

    return this.createResult(testNumber, numberPath);
  }

  private resolveFallback(request: NumberResolutionRequest): NumberResolutionResult {
    console.warn(`[NumberResolver] Using fallback resolution for:`, request);
    
    // Fallback to GSM postpaid active number
    const fallbackNumber = this.registry.postpaid.active[0];
    return this.createResult(fallbackNumber, 'postpaid.active[0] (fallback)');
  }

  private createResult(testNumber: TestNumber, source: string): NumberResolutionResult {
    return {
      number: testNumber.number,
      accountNumber: testNumber.number,
      msisdn: testNumber.number,
      serviceType: testNumber.serviceType,
      connectionType: testNumber.connectionType,
      status: testNumber.status,
      source,
      notes: testNumber.notes
    };
  }
}

// Singleton instance
export const numberResolver = new NumberResolver();

// Convenience functions
export function resolveTestNumber(
  apiDomain: string,
  operation: string,
  connectionType: ConnectionType,
  scenarioType: ScenarioType = 'positive',
  serviceType?: ServiceType
): NumberResolutionResult {
  return numberResolver.resolve({
    apiDomain,
    operation: operation as any,
    connectionType,
    serviceType,
    scenarioType
  });
}

export function getNumberForEligibility(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): string {
  return numberResolver.resolveForEligibility(apiDomain, connectionType, serviceType).number;
}

export function getNumberForActivation(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): string {
  return numberResolver.resolveForActivation(apiDomain, connectionType, serviceType).number;
}

export function getNumberForPackages(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): string {
  return numberResolver.resolveForGetPackages(apiDomain, connectionType, serviceType).number;
}
