import assert from 'node:assert/strict';

const engineModule = await import('../simulator/engine.js');
const scenarioModule = await import('../simulator/scenario.js');
const stateModule = await import('../simulator/scenarioState.js');

assert.equal(typeof engineModule.calculate, 'function');
assert.equal(typeof scenarioModule.defaultScenarios, 'function');
assert.equal(typeof stateModule.sanitizeImportedScenarios, 'function');

console.log('import check passed');
