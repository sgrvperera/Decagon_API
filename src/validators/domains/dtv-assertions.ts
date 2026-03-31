import { AssertionBuilder, AssertionRule, DomainAssertions } from '../assertion-builder';

/**
 * DTV Package Domain Assertions
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

export const dtvAssertions: DomainAssertions = {
  domain: 'dtv-packages',
  commonRules,
  apiSpecificRules: new Map([
    ['SS-DIA-Get-Dtv-Packages-Query - v1.0.0', getPackagesRules],
    ['SS-DIA-DTV-Pack-Act-Eligibility-Query - V1.0.0', checkEligibilityPositiveRules],
    ['SS-DIA-DTV-Pack-Act-Eligibility-Query - V1.0.0 - negative', checkEligibilityNegativeRules],
    ['SS-DIA-DTV-Pack-Act-Activation-Insert - V1.0.0', activatePackagePositiveRules]
  ])
};

export function getDtvAssertions(mifeApi: string, isNegative: boolean = false): AssertionRule[] {
  const key = isNegative ? `${mifeApi} - negative` : mifeApi;
  return dtvAssertions.apiSpecificRules.get(key) || dtvAssertions.commonRules;
}
