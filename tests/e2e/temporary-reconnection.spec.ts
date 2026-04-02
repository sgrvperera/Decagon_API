import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Reconnection/temporary/SS-DIA-Temporary-Recon-Update - v1.0.0.json'),
  'Temporary Reconnection - Dialog API Tests'
);
