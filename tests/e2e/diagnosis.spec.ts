import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Diagnosis/SS-DIA-Cx-Diagnosis-Query - v1.0.0.json'),
  'Customer Diagnosis - Dialog API Tests'
);
