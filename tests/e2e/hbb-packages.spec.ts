import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// HBB Package Activation
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/HBB package change/activate package/SS-DIA-HBB-Pack-Act-Activation-Insert - v1.0.0.json'),
  'HBB Package Activation - Dialog API Tests'
);

// HBB Package Eligibility
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/HBB package change/check eligibility to activate package/SS-DIA-HBB-Pack-Act-Eligibility-Query - v1.0.0.json'),
  'HBB Package Eligibility - Dialog API Tests'
);

// HBB Get Packages
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/HBB package change/Get hbb packages/SS-DIA-HBB-Pack-Change-Get-Packages-Query - v1.0.0.json'),
  'HBB Get Packages - Dialog API Tests'
);
