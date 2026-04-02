import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// MBB Package Activation
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/MBB package change/activate package/SS-DIA-Mbb-Pkg-Change-Activation-Insert - v1.0.0.json'),
  'MBB Package Activation - Dialog API Tests'
);

// MBB Package Eligibility
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/MBB package change/check eligibility to activate package/SS-DIA-Mbb-Pkg-Change-Act-Eligibility-Query - v1.0.0.json'),
  'MBB Package Eligibility - Dialog API Tests'
);

// MBB Get Packages
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/MBB package change/Get mobile packages/SS-DIA-Mbb-Pkg-Change-Get-Pkg-Query - v1.0.0.json'),
  'MBB Get Packages - Dialog API Tests'
);
