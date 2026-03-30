export type ServiceType = 'GSM' | 'DTV' | 'HBB' | 'MBB' | 'MULTI' | 'ANY';
export type ConnectionType = 'POSTPAID' | 'PREPAID' | 'ANY';
export type NumberStatus = 'active' | 'inactive' | 'reserved' | 'blocked' | 'invalid';
export type ScenarioType = 'positive' | 'negative' | 'boundary';
export type ApiOperation = 'eligibility' | 'activation' | 'getPackages' | 'deactivation' | 'check' | 'summary' | 'detailed';

export interface TestNumber {
  number: string;
  status: NumberStatus;
  serviceType: ServiceType;
  connectionType: ConnectionType;
  notes?: string;
}

export interface NumberCategory {
  active: TestNumber[];
  inactive: TestNumber[];
}

export interface TestNumberRegistry {
  postpaid: NumberCategory;
  prepaid: NumberCategory;
  dtv: {
    postpaid: NumberCategory;
    prepaid: NumberCategory;
  };
  hbb: {
    postpaid: NumberCategory;
    prepaid: NumberCategory;
  };
  mbb: {
    postpaid: NumberCategory;
    prepaid: NumberCategory;
  };
  invalid: {
    numbers: TestNumber[];
  };
  special?: {
    nic?: {
      number: string;
      type: string;
      purpose: string;
      notes?: string;
    };
  };
}

export interface NumberResolutionRequest {
  apiDomain: string;
  operation: ApiOperation;
  connectionType: ConnectionType;
  serviceType?: ServiceType;
  scenarioType?: ScenarioType;
  sbu?: string;
}

export interface NumberResolutionResult {
  number: string;
  accountNumber: string;
  msisdn: string;
  serviceType: ServiceType;
  connectionType: ConnectionType;
  status: NumberStatus;
  source: string;
  notes?: string;
}
