import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// DTV Rescan
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/DTV Rescan and Reset/rescan dtv/end point to rescan dialog tv/SS-DIA-DTV-Rescan-Query - v1.0.0.json'),
  'DTV Rescan - Dialog API Tests'
);
