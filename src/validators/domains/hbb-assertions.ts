import { AssertionBuilder, AssertionRule, DomainAssertions } from '../assertion-builder';

/**
 * HBB Package Domain Assertions
 * Similar to GSM but with HBB-specific endpoints and response patterns
 */

const commonRules: AssertionRule[] = [
  AssertionBuilder.status(200),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.bodyNotEmpty(),
  AssertionBuilder.fieldExists('executionStatus'),
  AssertionBuilder.fieldExists('executionMessage')
];

const getPackagesRules: AssertionRule[] = [
  ...commonRules,
  AssertionBuilder.fieldExists('responseData')
];

const checkEligibilityPositiveRules: AssertionRule[] = [...commonRules];

const checkEligibilityNegativeRules: AssertionRule[] = [
  AssertionBuilder.status(200),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.bodyNotEmpty()
];

const activatePackagePositiveRules: AssertionRule[] = [
  AssertionBuilder.status([200, 201]),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.bodyNotEmpty(),
  AssertionBuilder.fieldExists('executionStatus')
];

export const hbbAssertions: DomainAssertions = {
  domain: 'hbb-packages',
  commonRules,
  apiSpecificRules: new Map([
    ['SS-DIA-HBB-Pack-Change-Get-Packages-Query - v1.0.0', getPackagesRules],
    ['SS-DIA-HBB-Pack-Act-Eligibility-Query - v1.0.0', checkEligibilityPositiveRules],
    ['SS-DIA-HBB-Pack-Act-Eligibility-Query - v1.0.0 - negative', checkEligibilityNegativeRules],
    ['SS-DIA-HBB-Pack-Act-Activation-Insert - v1.0.0', activatePackagePositiveRules]
  ])
};

export function getHbbAssertions(mifeApi: string, isNegative: boolean = false): AssertionRule[] {
  const key = isNegative ? `${mifeApi} - negative` : mifeApi;
  return hbbAssertions.apiSpecificRules.get(key) || hbbAssertions.commonRules;
}
