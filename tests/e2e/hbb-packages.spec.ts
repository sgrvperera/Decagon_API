import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with HBB scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/hbb-packages.json'),
  'HBB Packages - Dialog API Tests'
);
