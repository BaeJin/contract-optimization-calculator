import assert from 'node:assert/strict';

import { calculate } from '../simulator/engine.js';
import { defaultScenarios } from '../simulator/scenario.js';
import { sanitizeImportedScenarios } from '../simulator/scenarioState.js';

const [signature, growth, prestige] = defaultScenarios();

const signatureResult = calculate(signature);
assert.equal(signatureResult.ltv, 1153);
assert.equal(signatureResult.companyBEP, 62);
assert.equal(signatureResult.customerBEP, 100);
assert.equal(Number(signatureResult.avgAnnualVariableProfit.toFixed(6)), -134.166909);
assert.equal(signatureResult.expectedMaturitySurvivingRate, 73.3);

const growthResult = calculate(growth);
assert.equal(growthResult.ltv, 738);
assert.equal(growthResult.companyBEP, 803);
assert.equal(growthResult.customerBEP, 131);
assert.equal(Number(growthResult.avgAnnualVariableProfit.toFixed(6)), 17.350143);
assert.equal(growthResult.expectedMaturitySurvivingRate, 61.6);

const prestigeResult = calculate(prestige);
assert.equal(prestigeResult.ltv, 324);
assert.equal(prestigeResult.companyBEP, 94);
assert.equal(prestigeResult.customerBEP, 159);
assert.equal(Number(prestigeResult.avgAnnualVariableProfit.toFixed(6)), -186.300443);
assert.equal(prestigeResult.expectedMaturitySurvivingRate, 77.3);

const [sanitized] = sanitizeImportedScenarios([
  {
    salePrice: '1000',
    annualFee: '50',
    annualFixedProfit: '-10',
    contractYears: 3,
    yearlyChurnRate: 150,
    yearlyRefundAmount: -20,
    churnByYear: [10, 200, -5],
    refundAmountByYear: [30, -10, 50],
    regions: [
      {
        name: '',
        roundLimitByRegion: -3,
        courseCostByRegion: '5.5',
        membersByRegion: -1,
        memberPriceByRegion: '7',
        companionPriceByRegion: '8',
        publicPriceByRegion: '9',
        companionsByRegion: -2,
      },
    ],
    usageByRegion: {
      missing: [120, -5, 30],
    },
  },
]);

assert.equal(sanitized.yearlyChurnRate, 100);
assert.equal(sanitized.yearlyRefundAmount, 0);
assert.deepEqual(sanitized.churnByYear, [10, 100, 0]);
assert.deepEqual(sanitized.refundAmountByYear, [30, 0, 50]);
assert.equal(sanitized.regions.length, 1);
assert.equal(sanitized.regions[0].roundLimitByRegion, 0);
assert.equal(sanitized.regions[0].membersByRegion, 0);
assert.equal(sanitized.regions[0].companionsByRegion, 0);
assert.equal(Array.isArray(sanitized.usageByRegion[sanitized.regions[0].id]), true);
assert.deepEqual(sanitized.usageByRegion[sanitized.regions[0].id], [100, 100, 100]);

console.log('calculation tests passed');
