import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Reconnection/eligibility/SS-DIA-Recon-Eligibility-Query - v1.0.0.json'),
  'Reconnection Eligibility - Dialog API Tests'
);
