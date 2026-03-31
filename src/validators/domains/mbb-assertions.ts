import { AssertionBuilder, AssertionRule, DomainAssertions } from '../assertion-builder';

/**
 * MBB Package Domain Assertions
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

export const mbbAssertions: DomainAssertions = {
  domain: 'mbb-packages',
  commonRules,
  apiSpecificRules: new Map([
    ['SS-DIA-Mbb-Pkg-Change-Get-Pkg-Query - v1.0.0', getPackagesRules],
    ['SS-DIA-Mbb-Pkg-Change-Act-Eligibility-Query - v1.0.0', checkEligibilityPositiveRules],
    ['SS-DIA-Mbb-Pkg-Change-Act-Eligibility-Query - v1.0.0 - negative', checkEligibilityNegativeRules],
    ['SS-DIA-Mbb-Pkg-Change-Activation-Insert - v1.0.0', activatePackagePositiveRules]
  ])
};

export function getMbbAssertions(mifeApi: string, isNegative: boolean = false): AssertionRule[] {
  const key = isNegative ? `${mifeApi} - negative` : mifeApi;
  return mbbAssertions.apiSpecificRules.get(key) || mbbAssertions.commonRules;
}
