import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with Data Usage scenarios - HBB
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Usage/HBB data usage/Get Detailed data usage - HBB/SS-DIA-Data-Usage-Query - v1.0.0.json'),
  'Data Usage HBB - Dialog API Tests'
);

// Use generic scenario runner with Data Usage scenarios - Mobile
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Usage/Mobile data usage/Get summary data usage - MBB/SS-DIA-Data-Usage-Summary-Query - v1.0.0.json'),
  'Data Usage Mobile - Dialog API Tests'
);
