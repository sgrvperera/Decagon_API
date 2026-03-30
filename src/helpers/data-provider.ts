import * as fs from 'fs';
import * as path from 'path';
import { config } from '../../config/test-config';
import { numberResolver } from './number-resolver';
import { ConnectionType, ServiceType } from '../types/test-data.types';

export interface TestAccount {
  accountNumber: string;
  msisdn: string;
  type: 'PREPAID' | 'POSTPAID';
  sbu: 'GSM' | 'HBB' | 'DTV' | 'MBB';
  status: 'ACTIVE' | 'SUSPENDED' | 'DISCONNECTED';
}

export interface PackageData {
  code: string;
  name: string;
  type: string;
  price?: number;
}

class DataProvider {
  private packages: PackageData[] = [];
  private commonData: any = {};

  constructor() {
    this.loadData();
  }

  private loadData() {
    const dataDir = path.resolve(__dirname, '../../data/test-data');
    
    if (fs.existsSync(path.join(dataDir, 'packages.json'))) {
      this.packages = JSON.parse(fs.readFileSync(path.join(dataDir, 'packages.json'), 'utf8'));
    }
    
    if (fs.existsSync(path.join(dataDir, 'common.data.json'))) {
      this.commonData = JSON.parse(fs.readFileSync(path.join(dataDir, 'common.data.json'), 'utf8'));
    }
  }

  /**
   * Get test number for eligibility check
   * @param apiDomain - API domain (e.g., 'gsm-packages', 'hbb-packages')
   * @param connectionType - PREPAID or POSTPAID
   * @param serviceType - Optional service type override
   */
  getNumberForEligibility(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): string {
    const result = numberResolver.resolveForEligibility(apiDomain, connectionType, serviceType);
    console.log(`[DataProvider] Eligibility number for ${apiDomain}/${connectionType}: ${result.number} (${result.source})`);
    return result.number;
  }

  /**
   * Get test number for package activation
   * @param apiDomain - API domain (e.g., 'gsm-packages', 'hbb-packages')
   * @param connectionType - PREPAID or POSTPAID
   * @param serviceType - Optional service type override
   */
  getNumberForActivation(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): string {
    const result = numberResolver.resolveForActivation(apiDomain, connectionType, serviceType);
    console.log(`[DataProvider] Activation number for ${apiDomain}/${connectionType}: ${result.number} (${result.source})`);
    return result.number;
  }

  /**
   * Get test number for getting packages
   * @param apiDomain - API domain (e.g., 'gsm-packages', 'hbb-packages')
   * @param connectionType - PREPAID or POSTPAID
   * @param serviceType - Optional service type override
   */
  getNumberForPackages(apiDomain: string, connectionType: ConnectionType, serviceType?: ServiceType): string {
    const result = numberResolver.resolveForGetPackages(apiDomain, connectionType, serviceType);
    console.log(`[DataProvider] Get packages number for ${apiDomain}/${connectionType}: ${result.number} (${result.source})`);
    return result.number;
  }

  /**
   * Get test number for data usage
   * @param operation - 'summary' or 'detailed'
   * @param sbu - Service Business Unit (HBB, GSM, MBB)
   */
  getNumberForDataUsage(operation: 'summary' | 'detailed', sbu: string): string {
    const result = numberResolver.resolveForDataUsage(operation, sbu);
    console.log(`[DataProvider] Data usage number for ${operation}/${sbu}: ${result.number} (${result.source})`);
    return result.number;
  }

  /**
   * Get invalid number for negative tests
   */
  getInvalidNumber(): string {
    const result = numberResolver.resolveInvalidNumber();
    console.log(`[DataProvider] Invalid number: ${result.number}`);
    return result.number;
  }

  /**
   * Get inactive number for negative tests
   * @param serviceType - Service type
   * @param connectionType - Connection type
   */
  getInactiveNumber(serviceType: ServiceType, connectionType: ConnectionType): string {
    const result = numberResolver.resolveInactiveNumber(serviceType, connectionType);
    console.log(`[DataProvider] Inactive number for ${serviceType}/${connectionType}: ${result.number} (${result.source})`);
    return result.number;
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use getNumberForEligibility, getNumberForActivation, or getNumberForPackages instead
   */
  getAccount(filters: Partial<TestAccount>): TestAccount {
    console.warn('[DataProvider] getAccount() is deprecated. Use specific number resolution methods instead.');
    
    // Fallback to number resolver
    const connectionType = filters.type || 'POSTPAID';
    const serviceType = filters.sbu || 'GSM';
    const result = numberResolver.resolve({
      apiDomain: 'gsm-packages',
      operation: 'eligibility',
      connectionType,
      serviceType,
      scenarioType: 'positive'
    });

    return {
      accountNumber: result.number,
      msisdn: result.number,
      type: connectionType,
      sbu: serviceType,
      status: 'ACTIVE'
    };
  }

  getPackage(filters: Partial<PackageData>): PackageData {
    const pkg = this.packages.find(p => 
      Object.entries(filters).every(([key, value]) => p[key as keyof PackageData] === value)
    );
    
    if (!pkg) {
      throw new Error(`No package found matching: ${JSON.stringify(filters)}`);
    }
    
    return pkg;
  }

  getCommonData(key: string): any {
    return this.commonData[key];
  }
}

export const dataProvider = new DataProvider();
