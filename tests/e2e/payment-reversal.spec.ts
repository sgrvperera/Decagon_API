import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Payment-Reversal/SS-DIA-Payment-reversal-Eligibility-Query - v1.0.0.json'),
  'Payment Reversal - Dialog API Tests'
);
