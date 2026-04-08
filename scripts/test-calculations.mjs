import assert from 'node:assert/strict';

import { calculate } from '../simulator/engine.js';
import { defaultScenarios } from '../simulator/scenario.js';
import { sanitizeImportedScenarios } from '../simulator/scenarioState.js';

function approxEqual(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

function assertIncreasing(values, label) {
  for (let index = 1; index < values.length; index += 1) {
    assert.ok(values[index] >= values[index - 1], `${label} should be non-decreasing`);
  }
}

function assertDecreasing(values, label) {
  for (let index = 1; index < values.length; index += 1) {
    assert.ok(values[index] <= values[index - 1], `${label} should be non-increasing`);
  }
}

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

for (const [scenario, result] of [
  [signature, signatureResult],
  [growth, growthResult],
  [prestige, prestigeResult],
]) {
  assert.equal(result.years.length, scenario.contractYears);
  assert.equal(result.ltv, result.years[result.years.length - 1].cumulativeLTVByYear);
  assert.equal(result.avgAnnualProfit, result.ltv / scenario.contractYears);
  assert.equal(result.customerBEPAnnual, result.customerBEP / scenario.contractYears);
  approxEqual(
    result.avgAnnualVariableProfit,
    result.avgAnnualVariableRevenue - result.avgAnnualVariableCost,
  );
  assert.equal(
    result.expectedEnrollProfit,
    scenario.salePrice - result.totalExpectedRefundCost,
  );
  assert.equal(
    result.naiveCustomerFixedCost,
    scenario.salePrice + scenario.annualFee * scenario.contractYears,
  );
  assert.equal(
    result.customerNetProfit,
    result.wSaving * result.sumActualRounds * scenario.contractYears - result.naiveCustomerFixedCost,
  );

  const survivingSeries = result.years.map((year) => year.survivingEndByYear);
  assertDecreasing(survivingSeries, 'survivingEndByYear');

  const cumulativeSeries = result.years.map((year) => year.cumulativeLTVByYear);
  if (result.years.every((year) => year.revenueByYear >= 0)) {
    assertIncreasing(cumulativeSeries, 'cumulativeLTVByYear');
  }
}

const deterministicScenario = {
  name: 'Deterministic sanity',
  salePrice: 100,
  annualFee: 10,
  annualFixedProfit: 5,
  contractYears: 2,
  yearlyChurnRate: 0,
  churnByYear: [0, 0],
  yearlyRefundAmount: 0,
  refundAmountByYear: [0, 0],
  regions: [
    {
      id: 'R1',
      name: 'Only',
      roundLimitByRegion: 10,
      courseCostByRegion: 5,
      membersByRegion: 1,
      memberPriceByRegion: 7,
      companionPriceByRegion: 6,
      publicPriceByRegion: 9,
      companionsByRegion: 1,
    },
  ],
  usageByRegion: {
    R1: [100, 100],
  },
};

const deterministicResult = calculate(deterministicScenario);
assert.equal(deterministicResult.sumRoundLimit, 10);
assert.equal(deterministicResult.sumActualRounds, 10);
assert.equal(deterministicResult.wMargin, 3);
assert.equal(deterministicResult.wSaving, 5);
assert.equal(deterministicResult.roundingRevenue, 30);
assert.equal(deterministicResult.annualTotal, 145);
assert.equal(deterministicResult.totalExpectedRefundCost, 0);
assert.equal(deterministicResult.expectedEnrollProfit, 100);
assert.equal(deterministicResult.ltv, 190);
assert.equal(deterministicResult.avgAnnualProfit, 95);
assert.equal(deterministicResult.customerBEP, 24);
assert.equal(deterministicResult.customerBEPAnnual, 12);
assert.equal(deterministicResult.companyBEP, null);
assert.equal(deterministicResult.expectedMaturitySurvivingRate, 100);
assert.deepEqual(
  deterministicResult.years.map((year) => year.revenueByYear),
  [145, 45],
);
assert.deepEqual(
  deterministicResult.years.map((year) => year.cumulativeLTVByYear),
  [145, 190],
);
assert.deepEqual(
  deterministicResult.years.map((year) => year.survivingEndByYear),
  [100, 100],
);

const zeroUsageScenario = {
  ...deterministicScenario,
  name: 'Zero usage',
  usageByRegion: { R1: [0, 0] },
};
const zeroUsageResult = calculate(zeroUsageScenario);
assert.equal(zeroUsageResult.sumActualRounds, 0);
assert.equal(zeroUsageResult.roundingRevenue, 0);
assert.equal(zeroUsageResult.wMargin, 0);
assert.equal(zeroUsageResult.wSaving, 0);
assert.equal(zeroUsageResult.customerBEP, Number.POSITIVE_INFINITY);
assert.equal(zeroUsageResult.customerNetProfit, -120);
assert.deepEqual(
  zeroUsageResult.years.map((year) => year.revenueByYear),
  [115, 15],
);

const fullChurnScenario = {
  ...deterministicScenario,
  name: 'Full churn after year 1',
  churnByYear: [100, 0],
  yearlyChurnRate: 50,
  refundAmountByYear: [30, 0],
  yearlyRefundAmount: 15,
};
const fullChurnResult = calculate(fullChurnScenario);
assert.equal(fullChurnResult.totalExpectedRefundCost, 30);
assert.equal(fullChurnResult.expectedEnrollProfit, 70);
assert.equal(fullChurnResult.expectedMaturitySurvivingRate, 0);
assert.deepEqual(
  fullChurnResult.years.map((year) => year.survivingEndByYear),
  [0, 0],
);
assert.deepEqual(
  fullChurnResult.years.map((year) => year.revenueByYear),
  [115, 0],
);
assert.equal(fullChurnResult.ltv, 115);

const sensitivityBase = calculate(deterministicScenario);
assert.equal(sensitivityBase.usageSensitivity[0].ltv, 130);
assert.equal(sensitivityBase.usageSensitivity.at(-1).ltv, 190);
assertIncreasing(
  sensitivityBase.usageSensitivity.map((item) => item.ltv),
  'usageSensitivity',
);
assertIncreasing(
  sensitivityBase.membersSensitivity.map((item) => item.ltv),
  'membersSensitivity',
);
assertIncreasing(
  sensitivityBase.companionSensitivity.map((item) => item.ltv),
  'companionSensitivity',
);

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
