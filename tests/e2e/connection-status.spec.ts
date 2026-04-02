import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with Connection Status scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Reconnection status (Connection status, Temporary and Permanent Reconnection)/Reconnection status (Connection status, Temporary and Permanent Reconnection)/Connection-status/SS-DIA-Connection-Status-Query - v1.0.0.json'),
  'Connection Status - Dialog API Tests'
);
