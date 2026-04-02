import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// HBB Data Add-on Activation
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Addon/hbb data addon/activate get hbb data add on/SS-DIA-Hbb-Data-Add-On-Activate-Insert - v1.0.0.json'),
  'HBB Data Add-on Activation - Dialog API Tests'
);

// HBB Data Add-on Eligibility
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Addon/hbb data addon/eligibility get hbb data add on/SS-DIA-Hbb-Data-Add-On-Eligibility-Query - v1.0.0.json'),
  'HBB Data Add-on Eligibility - Dialog API Tests'
);

// HBB Get Add-on Packs
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Data Addon/hbb data addon/Get hbb add on packs/SS-DIA-Get-Hbb-Data-Add-On-Packs-Query - v1.0.0.json'),
  'HBB Get Add-on Packs - Dialog API Tests'
);
