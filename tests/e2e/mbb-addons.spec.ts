import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with MBB Add-ons scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/mbb-addons.json'),
  'MBB Add-ons - Dialog API Tests'
);
