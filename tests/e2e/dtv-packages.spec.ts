import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with DTV scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/dtv-packages.json'),
  'DTV Packages - Dialog API Tests'
);
