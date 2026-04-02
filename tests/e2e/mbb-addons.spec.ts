import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// MBB Data Add-on Activation
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Addon/mbb data addon/activate get mbb data add on/SS-DIA-Mbb-Data-Add-On-Activate-Insert - v1.0.0.json'),
  'MBB Data Add-on Activation - Dialog API Tests'
);

// MBB Data Add-on Eligibility
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Addon/mbb data addon/eligibility get mbb data add on/SS-DIA-Mbb-Data-Add-On-Eligibility-Query - v1.0.0.json'),
  'MBB Data Add-on Eligibility - Dialog API Tests'
);

// MBB Get Add-on Packs
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Addon/mbb data addon/Get mbb add on packs/SS-DIA-Get-Mbb-Data-Add-On-Packs-Query - v1.0.0.json'),
  'MBB Get Add-on Packs - Dialog API Tests'
);
