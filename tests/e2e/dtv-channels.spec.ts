import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with DTV Channels scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/dtv-channels.json'),
  'DTV Channels - Dialog API Tests'
);
