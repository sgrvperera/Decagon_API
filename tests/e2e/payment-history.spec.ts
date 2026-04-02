import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Payment History - Last 5 Payments
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Payment Status and Credit Limit Checks/last 5 payments/last 5 payments/SS-DIA-Get-Last-Five-Payment - v1.0.0.json'),
  'Payment History - Dialog API Tests'
);
