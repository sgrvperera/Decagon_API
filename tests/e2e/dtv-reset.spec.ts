import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// DTV Reset
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/DTV Rescan and Reset/reset dtv/end point to reset dialog tv/SS-DIA-DTV-Reset-Query - v1.0.0.json'),
  'DTV Reset - Dialog API Tests'
);
