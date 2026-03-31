import { AssertionRule } from './assertion-builder';
import { getGsmAssertions } from './domains/gsm-assertions';
import { getHbbAssertions } from './domains/hbb-assertions';
import { getDtvAssertions } from './domains/dtv-assertions';
import { getMbbAssertions } from './domains/mbb-assertions';
import { getDtvChannelsAssertions } from './domains/dtv-channels-assertions';

/**
 * Central Assertion Registry
 * Maps domains to their assertion rule getters
 */
class AssertionRegistry {
  private domainMap: Map<string, (mifeApi: string, isNegative: boolean) => AssertionRule[]>;

  constructor() {
    this.domainMap = new Map([
      ['gsm-packages', getGsmAssertions],
      ['hbb-packages', getHbbAssertions],
      ['dtv-packages', getDtvAssertions],
      ['mbb-packages', getMbbAssertions],
      ['mbb-addons', getMbbAssertions], // Reuse MBB assertions
      ['hbb-addons', getHbbAssertions], // Reuse HBB assertions
      ['dtv-channels', getDtvChannelsAssertions]
    ]);
  }

  /**
   * Get assertions for a specific domain and API
   */
  getAssertions(domain: string, mifeApi: string, isNegative: boolean = false): AssertionRule[] {
    const getter = this.domainMap.get(domain);
    
    if (!getter) {
      console.warn(`[AssertionRegistry] No assertions defined for domain: ${domain}, using default`);
      return this.getDefaultAssertions();
    }

    return getter(mifeApi, isNegative);
  }

  /**
   * Default assertions for unknown domains
   */
  private getDefaultAssertions(): AssertionRule[] {
    const { AssertionBuilder } = require('./assertion-builder');
    return [
      AssertionBuilder.status(200),
      AssertionBuilder.bodyIsJson(),
      AssertionBuilder.bodyNotEmpty()
    ];
  }

  /**
   * Check if domain has custom assertions
   */
  hasDomain(domain: string): boolean {
    return this.domainMap.has(domain);
  }

  /**
   * Get all registered domains
   */
  getDomains(): string[] {
    return Array.from(this.domainMap.keys());
  }
}

export const assertionRegistry = new AssertionRegistry();
