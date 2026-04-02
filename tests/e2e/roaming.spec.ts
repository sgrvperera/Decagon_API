import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Roaming/SS-DIA-Activate-Roaming - v1.0.0.json'),
  'Roaming Services - Dialog API Tests'
);
