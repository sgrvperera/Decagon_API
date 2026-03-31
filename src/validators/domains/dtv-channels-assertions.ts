import { AssertionBuilder, AssertionRule, DomainAssertions } from '../assertion-builder';

/**
 * DTV Channels Domain Assertions
 */

const commonRules: AssertionRule[] = [
  AssertionBuilder.status(200),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.bodyNotEmpty(),
  AssertionBuilder.fieldExists('executionStatus'),
  AssertionBuilder.fieldExists('executionMessage')
];

const getChannelsRules: AssertionRule[] = [
  ...commonRules,
  AssertionBuilder.fieldExists('responseData')
];

const checkEligibilityPositiveRules: AssertionRule[] = [...commonRules];

const checkEligibilityNegativeRules: AssertionRule[] = [
  AssertionBuilder.status(200),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.bodyNotEmpty()
];

const activateChannelPositiveRules: AssertionRule[] = [
  AssertionBuilder.status([200, 201]),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.bodyNotEmpty(),
  AssertionBuilder.fieldExists('executionStatus')
];

const deactivateChannelPositiveRules: AssertionRule[] = [
  AssertionBuilder.status([200, 201]),
  AssertionBuilder.bodyIsJson(),
  AssertionBuilder.bodyNotEmpty(),
  AssertionBuilder.fieldExists('executionStatus')
];

export const dtvChannelsAssertions: DomainAssertions = {
  domain: 'dtv-channels',
  commonRules,
  apiSpecificRules: new Map([
    ['SS-DIA-DTV-Get-Channel-List-Query - v1.0.0', getChannelsRules],
    ['SS-DIA-DTV-Channel-Act-Eligibility-Query - v1.0.0', checkEligibilityPositiveRules],
    ['SS-DIA-DTV-Channel-Act-Eligibility-Query - v1.0.0 - negative', checkEligibilityNegativeRules],
    ['SS-DIA-Activate-Channel - v1.0.0', activateChannelPositiveRules],
    ['SS-DIA-DTV-Channel-Deact-Eligibility-Query - v1.0.0', checkEligibilityPositiveRules],
    ['SS-DIA-DTV-Channel-Deact-Eligibility-Query - v1.0.0 - negative', checkEligibilityNegativeRules],
    ['SS-DIA-DTV-Channel-Deactivation-Insert - v1.0.0', deactivateChannelPositiveRules]
  ])
};

export function getDtvChannelsAssertions(mifeApi: string, isNegative: boolean = false): AssertionRule[] {
  const key = isNegative ? `${mifeApi} - negative` : mifeApi;
  return dtvChannelsAssertions.apiSpecificRules.get(key) || dtvChannelsAssertions.commonRules;
}
