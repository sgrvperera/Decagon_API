import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Credit Limit Check
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Payment Status and Credit Limit Checks/Credit Limit (ALL SBU)/get credit limit/SS-DIA-Credit-Limit-Check-Query - v1.0.0.json'),
  'Credit Limit - Dialog API Tests'
);
