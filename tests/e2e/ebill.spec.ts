import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Ebill/SS-DIA-Get-Ebill-Email-Query - v1.0.0.json'),
  'Ebill Management - Dialog API Tests'
);
