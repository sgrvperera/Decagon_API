import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Verification/SS-DIA-Send-SMS-Query - v1.0.0.json'),
  'Customer Verification - Dialog API Tests'
);
