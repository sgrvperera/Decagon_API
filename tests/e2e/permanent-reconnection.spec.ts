import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Reconnection/permanent/SS-DIA-Permanent-Reconnection-Update - v1.0.0.json'),
  'Permanent Reconnection - Dialog API Tests'
);
