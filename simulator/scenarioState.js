import { MAX_REGIONS, MAX_SCENARIOS } from './constants';
import {
  defaultScenarios,
  ensureChurn,
  ensureRefundAmount,
  ensureUsage,
  makeRegion,
} from './scenario';

function generateRegionId() {
  return `R${String(Date.now()).padStart(13, '0')}`;
}

function updateScenarioAtIndex(scenarios, scenarioIndex, updater) {
  return scenarios.map((scenario, index) =>
    index === scenarioIndex ? updater(scenario) : scenario,
  );
}

function calculateAverage(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function createInitialScenarios() {
  return defaultScenarios();
}

export function createScenario(name) {
  return {
    name,
    salePrice: 499,
    annualFee: 0,
    annualFixedProfit: 0,
    contractYears: 5,
    yearlyChurnRate: 0,
    churnByYear: [0, 0, 0, 0, 0],
    yearlyRefundAmount: 0,
    refundAmountByYear: [0, 0, 0, 0, 0],
    regions: [makeRegion(generateRegionId(), '지역 1')],
    usageByRegion: {},
  };
}

export function updateScenarioValue(scenarios, scenarioIndex, key, value) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => ({
    ...scenario,
    [key]: value,
  }));
}

export function replaceScenarioItem(scenarios, scenarioIndex, nextScenario) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, () => nextScenario);
}

export function updateRegionValue(scenarios, scenarioIndex, regionId, key, value) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => ({
    ...scenario,
    regions: scenario.regions.map((region) =>
      region.id === regionId ? { ...region, [key]: value } : region,
    ),
  }));
}

export function updateUsageValue(scenarios, scenarioIndex, regionId, yearIndex, value) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => {
    const nextUsageByRegion = ensureUsage(scenario);
    const nextRegionUsage = [...(nextUsageByRegion[regionId] || [])];

    nextRegionUsage[yearIndex] = value;

    return {
      ...scenario,
      usageByRegion: {
        ...nextUsageByRegion,
        [regionId]: nextRegionUsage,
      },
    };
  });
}

export function applyUsageValueToAllYears(scenarios, scenarioIndex, regionId, value) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => {
    const nextUsageByRegion = ensureUsage(scenario);

    nextUsageByRegion[regionId] = Array(scenario.contractYears).fill(value);

    return {
      ...scenario,
      usageByRegion: { ...nextUsageByRegion },
    };
  });
}

export function updateChurnValue(scenarios, scenarioIndex, yearIndex, value) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => {
    const nextChurnByYear = [...ensureChurn(scenario)];

    nextChurnByYear[yearIndex] = Math.round(value);

    return {
      ...scenario,
      churnByYear: nextChurnByYear,
      yearlyChurnRate: calculateAverage(nextChurnByYear),
    };
  });
}

export function updateRefundAmountValue(scenarios, scenarioIndex, yearIndex, value) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => {
    const nextRefundAmountByYear = [...ensureRefundAmount(scenario)];

    nextRefundAmountByYear[yearIndex] = Number(value);

    return {
      ...scenario,
      refundAmountByYear: nextRefundAmountByYear,
      yearlyRefundAmount: calculateAverage(nextRefundAmountByYear),
    };
  });
}

export function addRegionToScenario(scenarios, scenarioIndex) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => {
    if (scenario.regions.length >= MAX_REGIONS) {
      return scenario;
    }

    const nextRegion = makeRegion(generateRegionId(), `Region ${scenario.regions.length + 1}`, {
      roundLimitByRegion: 20,
      courseCostByRegion: 8,
      membersByRegion: 1,
      memberPriceByRegion: 0,
      companionPriceByRegion: 9,
      publicPriceByRegion: 10,
      companionsByRegion: 1.5,
    });

    return {
      ...scenario,
      regions: [...scenario.regions, nextRegion],
    };
  });
}

export function removeRegionFromScenario(scenarios, scenarioIndex, regionId) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => {
    if (scenario.regions.length <= 1) {
      return scenario;
    }

    return {
      ...scenario,
      regions: scenario.regions.filter((region) => region.id !== regionId),
    };
  });
}

export function addScenarioItem(scenarios) {
  if (scenarios.length >= MAX_SCENARIOS) {
    return scenarios;
  }

  return [...scenarios, createScenario(`Scenario ${scenarios.length + 1}`)];
}

export function removeScenarioItem(scenarios, scenarioIndex) {
  if (scenarios.length <= 1) {
    return scenarios;
  }

  return scenarios.filter((_, index) => index !== scenarioIndex);
}

export function sanitizeImportedScenarios(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid scenario array');
  }

  data.forEach((scenario) => {
    if (
      typeof scenario !== 'object' ||
      scenario === null ||
      scenario.salePrice === undefined ||
      !Array.isArray(scenario.regions)
    ) {
      throw new Error('Required fields are missing');
    }
  });

  return data.slice(0, MAX_SCENARIOS).map((scenario) => ({
    ...scenario,
    salePrice: Number(scenario.salePrice ?? 0),
    annualFee: Number(scenario.annualFee ?? 0),
    annualFixedProfit: Number(scenario.annualFixedProfit ?? 0),
    contractYears: Math.max(1, Math.min(10, Number(scenario.contractYears ?? 5) || 5)),
    yearlyChurnRate: Number(scenario.yearlyChurnRate ?? 0),
    yearlyRefundAmount: Number(scenario.yearlyRefundAmount ?? 0),
    churnByYear: Array.isArray(scenario.churnByYear) ? scenario.churnByYear.map(Number) : undefined,
    refundAmountByYear: Array.isArray(scenario.refundAmountByYear)
      ? scenario.refundAmountByYear.map(Number)
      : undefined,
    regions: Array.isArray(scenario.regions) ? scenario.regions.slice(0, MAX_REGIONS) : [],
    usageByRegion:
      scenario.usageByRegion && typeof scenario.usageByRegion === 'object'
        ? Object.fromEntries(
            Object.entries(scenario.usageByRegion).map(([regionId, values]) => [
              regionId,
              Array.isArray(values) ? values.map(Number) : [],
            ]),
          )
        : {},
  }));
}
