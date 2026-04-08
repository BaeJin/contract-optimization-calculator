import { MAX_REGIONS, MAX_SCENARIOS } from './constants.js';
import {
  clampNumber,
  defaultScenarios,
  ensureChurn,
  ensureRefundAmount,
  ensureUsage,
  makeRegion,
} from './scenario.js';

function generateRegionId() {
  return `R${String(Date.now()).padStart(13, '0')}${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeRegion(region, index) {
  return {
    id: region?.id || generateRegionId(),
    name: region?.name || `지역 ${index + 1}`,
    roundLimitByRegion: clampNumber(region?.roundLimitByRegion ?? 0, { min: 0 }),
    courseCostByRegion: Number(region?.courseCostByRegion ?? 0),
    membersByRegion: clampNumber(region?.membersByRegion ?? 0, { min: 0 }),
    memberPriceByRegion: Number(region?.memberPriceByRegion ?? 0),
    companionPriceByRegion: Number(region?.companionPriceByRegion ?? 0),
    publicPriceByRegion: Number(region?.publicPriceByRegion ?? 0),
    companionsByRegion: clampNumber(region?.companionsByRegion ?? 0, { min: 0 }),
  };
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

    nextRegionUsage[yearIndex] = clampNumber(value, { min: 0, max: 100 });

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

    nextUsageByRegion[regionId] = Array(scenario.contractYears).fill(
      clampNumber(value, { min: 0, max: 100 }),
    );

    return {
      ...scenario,
      usageByRegion: { ...nextUsageByRegion },
    };
  });
}

export function updateChurnValue(scenarios, scenarioIndex, yearIndex, value) {
  return updateScenarioAtIndex(scenarios, scenarioIndex, (scenario) => {
    const nextChurnByYear = [...ensureChurn(scenario)];

    nextChurnByYear[yearIndex] = Math.round(clampNumber(value, { min: 0, max: 100 }));

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

    nextRefundAmountByYear[yearIndex] = clampNumber(value, { min: 0 });

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

  return data.slice(0, MAX_SCENARIOS).map((scenario) => {
    const contractYears = Math.max(1, Math.min(10, Number(scenario.contractYears ?? 5) || 5));
    const regions = Array.isArray(scenario.regions)
      ? scenario.regions.slice(0, MAX_REGIONS).map(normalizeRegion)
      : [];
    const normalizedUsageByRegion =
      scenario.usageByRegion && typeof scenario.usageByRegion === 'object'
        ? Object.fromEntries(
            Object.entries(scenario.usageByRegion).map(([regionId, values]) => [
              regionId,
              Array.from({ length: contractYears }, (_, index) =>
                clampNumber(Array.isArray(values) ? values[index] : undefined, { min: 0, max: 100 }),
              ),
            ]),
          )
        : {};

    return {
      ...scenario,
      name: scenario.name || 'Imported Scenario',
      salePrice: Number(scenario.salePrice ?? 0),
      annualFee: Number(scenario.annualFee ?? 0),
      annualFixedProfit: Number(scenario.annualFixedProfit ?? 0),
      contractYears,
      yearlyChurnRate: clampNumber(scenario.yearlyChurnRate ?? 0, { min: 0, max: 100 }),
      yearlyRefundAmount: clampNumber(scenario.yearlyRefundAmount ?? 0, { min: 0 }),
      churnByYear: Array.from({ length: contractYears }, (_, index) =>
        clampNumber(Array.isArray(scenario.churnByYear) ? scenario.churnByYear[index] : undefined, {
          min: 0,
          max: 100,
        }),
      ),
      refundAmountByYear: Array.from({ length: contractYears }, (_, index) =>
        clampNumber(
          Array.isArray(scenario.refundAmountByYear) ? scenario.refundAmountByYear[index] : undefined,
          { min: 0 },
        ),
      ),
      regions,
      usageByRegion: Object.fromEntries(
        regions.map((region) => [
          region.id,
          normalizedUsageByRegion[region.id] ?? Array.from({ length: contractYears }, () => 100),
        ]),
      ),
    };
  });
}
