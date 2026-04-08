import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculate } from '../simulator/engine.js';
import { defaultScenarios } from '../simulator/scenario.js';
import { sanitizeImportedScenarios } from '../simulator/scenarioState.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '../tests/fixtures');

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

function loadFixtures() {
  return readdirSync(fixturesDir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({
      name,
      ...JSON.parse(readFileSync(path.join(fixturesDir, name), 'utf8')),
    }));
}

function assertFixtureResult(fixtureName, result, expected) {
  for (const [key, expectedValue] of Object.entries(expected)) {
    switch (key) {
      case 'yearRevenueByYear':
        assert.deepEqual(
          result.years.map((year) => year.revenueByYear),
          expectedValue,
          `${fixtureName}: yearRevenueByYear mismatch`,
        );
        break;
      case 'cumulativeLTVByYear':
        assert.deepEqual(
          result.years.map((year) => year.cumulativeLTVByYear),
          expectedValue,
          `${fixtureName}: cumulativeLTVByYear mismatch`,
        );
        break;
      case 'survivingEndByYear':
        assert.deepEqual(
          result.years.map((year) => year.survivingEndByYear),
          expectedValue,
          `${fixtureName}: survivingEndByYear mismatch`,
        );
        break;
      case 'usageSensitivityFirst':
        assert.equal(result.usageSensitivity[0].ltv, expectedValue, `${fixtureName}: usageSensitivityFirst mismatch`);
        break;
      case 'usageSensitivityLast':
        assert.equal(result.usageSensitivity.at(-1).ltv, expectedValue, `${fixtureName}: usageSensitivityLast mismatch`);
        break;
      case 'membersSensitivityFirst':
        assert.equal(result.membersSensitivity[0].ltv, expectedValue, `${fixtureName}: membersSensitivityFirst mismatch`);
        break;
      case 'membersSensitivityLast':
        assert.equal(result.membersSensitivity.at(-1).ltv, expectedValue, `${fixtureName}: membersSensitivityLast mismatch`);
        break;
      case 'companionSensitivityFirst':
        assert.equal(result.companionSensitivity[0].ltv, expectedValue, `${fixtureName}: companionSensitivityFirst mismatch`);
        break;
      case 'companionSensitivityLast':
        assert.equal(result.companionSensitivity.at(-1).ltv, expectedValue, `${fixtureName}: companionSensitivityLast mismatch`);
        break;
      case 'customerBEP':
        assert.equal(
          result.customerBEP,
          expectedValue === 'Infinity' ? Number.POSITIVE_INFINITY : expectedValue,
          `${fixtureName}: customerBEP mismatch`,
        );
        break;
      default:
        assert.equal(result[key], expectedValue, `${fixtureName}: ${key} mismatch`);
        break;
    }
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

for (const fixture of loadFixtures()) {
  const result = calculate(fixture.scenario);
  assertFixtureResult(fixture.name, result, fixture.expected);

  assertIncreasing(
    result.usageSensitivity.map((item) => item.ltv),
    `${fixture.name}: usageSensitivity`,
  );
  assertIncreasing(
    result.membersSensitivity.map((item) => item.ltv),
    `${fixture.name}: membersSensitivity`,
  );
  assertIncreasing(
    result.companionSensitivity.map((item) => item.ltv),
    `${fixture.name}: companionSensitivity`,
  );
}

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
