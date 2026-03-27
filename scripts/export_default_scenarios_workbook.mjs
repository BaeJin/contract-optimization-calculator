import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import ExcelJS from 'exceljs';

import { defaultScenarios } from '../simulator/scenario.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT, 'simulator', 'registry.js');
const OUTPUT_FILE = path.join(ROOT, 'docs', 'default_scenarios_metrics.xlsx');
const FALLBACK_USAGE_RATE = 65;

async function parseRegistryMeta() {
  const text = await fs.readFile(REGISTRY_FILE, 'utf8');
  const meta = {};
  let cursor = 0;

  while (cursor < text.length) {
    const keyMatch = /(^|\n)  ([A-Za-z0-9_]+): createMeta\(\{/.exec(text.slice(cursor));
    if (!keyMatch) {
      break;
    }

    const matchStart = cursor + keyMatch.index + keyMatch[1].length;
    const key = keyMatch[2];
    const bodyStart = matchStart + `  ${key}: createMeta({`.length;
    let depth = 1;
    let index = bodyStart;

    while (index < text.length && depth > 0) {
      const char = text[index];
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
      }
      index += 1;
    }

    const body = text.slice(bodyStart, index - 1);
    const item = {};

    for (const field of ['label', 'unit', 'tip', 'prefix', 'suffix', 'sticker']) {
      const fieldPattern = new RegExp(
        `${field}:\\s*(['"])(.*?)\\1`,
        'ms',
      );
      const fieldMatch = body.match(fieldPattern);
      if (fieldMatch) {
        item[field] = fieldMatch[2];
      }
    }

    meta[key] = item;
    cursor = index;
  }

  return meta;
}

function average(values, fallback = 0) {
  if (!values.length) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getUsageValues(scenario, regionId) {
  return scenario.usageByRegion?.[regionId] ?? [];
}

function getAverageUsageRateByRegion(scenario, region) {
  return average(getUsageValues(scenario, region.id), 100);
}

function getTotalRoundLimit(scenario) {
  return Math.max(
    scenario.regions.reduce(
      (sum, region) => sum + Number(region.roundLimitByRegion || 0),
      0,
    ),
    1,
  );
}

function getYearUsageRate(scenario, region, yearIndex) {
  const values = scenario.usageByRegion?.[region.id] ?? [];
  const rawValue = yearIndex < values.length ? values[yearIndex] : FALLBACK_USAGE_RATE;
  return Number(rawValue || 0) / 100;
}

function yearChurnRate(scenario, yearIndex) {
  const churnValues = scenario.churnByYear ?? [];
  const base = scenario.yearlyChurnRate ?? 0;
  const rawValue = yearIndex < churnValues.length ? churnValues[yearIndex] : base;
  return Number(rawValue || 0) / 100;
}

function yearRefundAmount(scenario, yearIndex) {
  const refundValues = scenario.refundAmountByYear ?? [];
  const base = scenario.yearlyRefundAmount ?? 0;
  const rawValue = yearIndex < refundValues.length ? refundValues[yearIndex] : base;
  return Number(rawValue || 0);
}

function yearSurvivingEnd(previousSurviving, churnRate) {
  return previousSurviving - previousSurviving * churnRate;
}

function yearRefundCost(previousSurviving, churnRate, refundAmount) {
  return previousSurviving * churnRate * refundAmount;
}

function memberSavingByRegion(region) {
  return (
    (region.publicPriceByRegion - region.memberPriceByRegion) * region.membersByRegion
  );
}

function companionSavingByRegion(region) {
  return (
    (region.publicPriceByRegion - region.companionPriceByRegion) * region.companionsByRegion
  );
}

function memberProfitByRegion(region) {
  return (
    (region.memberPriceByRegion - region.courseCostByRegion) * region.membersByRegion
  );
}

function companionProfitByRegion(region) {
  return (
    (region.companionPriceByRegion - region.courseCostByRegion) * region.companionsByRegion
  );
}

function marginPerRoundByRegion(region) {
  return memberProfitByRegion(region) + companionProfitByRegion(region);
}

function actualRoundsByRegion(scenario, region) {
  return region.roundLimitByRegion * (getAverageUsageRateByRegion(scenario, region) / 100);
}

function totalActualRounds(scenario) {
  return scenario.regions.reduce(
    (sum, region) => sum + actualRoundsByRegion(scenario, region),
    0,
  );
}

function weightedAverageByActualRounds(scenario, pickValue) {
  const totalRounds = totalActualRounds(scenario);
  if (totalRounds === 0) {
    return 0;
  }

  return scenario.regions.reduce((sum, region) => {
    const weight = actualRoundsByRegion(scenario, region) / totalRounds;
    return sum + weight * pickValue(region);
  }, 0);
}

function totalAnnualRounding(scenario) {
  return scenario.regions.reduce(
    (sum, region) =>
      sum + marginPerRoundByRegion(region) * actualRoundsByRegion(scenario, region),
    0,
  );
}

function savingPerRoundByRegion(region) {
  return memberSavingByRegion(region) + companionSavingByRegion(region);
}

function totalAnnualSaving(scenario) {
  return scenario.regions.reduce(
    (sum, region) =>
      sum + savingPerRoundByRegion(region) * actualRoundsByRegion(scenario, region),
    0,
  );
}

function sumExpectedByYear(scenario, pickValue) {
  let total = 0;
  let previousSurviving = 1;

  for (let yearIndex = 0; yearIndex < scenario.contractYears; yearIndex += 1) {
    total += pickValue(yearIndex, previousSurviving);
    previousSurviving = yearSurvivingEnd(
      previousSurviving,
      yearChurnRate(scenario, yearIndex),
    );
  }

  return total;
}

function roundValue(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function buildYears(scenario) {
  const years = [];
  let previousSurviving = 1;
  let cumulativeLtv = 0;

  for (let yearIndex = 0; yearIndex < scenario.contractYears; yearIndex += 1) {
    const churnRate = yearChurnRate(scenario, yearIndex);
    const refundAmount = yearRefundAmount(scenario, yearIndex);
    const enrollFeeThisYear = yearIndex === 0 ? scenario.salePrice : 0;
    const surviving = yearSurvivingEnd(previousSurviving, churnRate);
    const refundCost = yearRefundCost(previousSurviving, churnRate, refundAmount);
    const totalRoundLimit = getTotalRoundLimit(scenario);

    const yearUsageWeighted =
      scenario.regions.reduce(
        (sum, region) =>
          sum +
          getYearUsageRate(scenario, region, yearIndex) *
            (region.roundLimitByRegion / totalRoundLimit),
        0,
      ) * 100;

    const yearActualRoundsExpected = scenario.regions.reduce(
      (sum, region) =>
        sum +
        region.roundLimitByRegion *
          getYearUsageRate(scenario, region, yearIndex) *
          previousSurviving,
      0,
    );

    const yearMemberRevenueExpected = scenario.regions.reduce(
      (sum, region) =>
        sum +
        region.roundLimitByRegion *
          getYearUsageRate(scenario, region, yearIndex) *
          region.memberPriceByRegion *
          region.membersByRegion *
          previousSurviving,
      0,
    );

    const yearCompanionRevenueExpected = scenario.regions.reduce(
      (sum, region) =>
        sum +
        region.roundLimitByRegion *
          getYearUsageRate(scenario, region, yearIndex) *
          region.companionPriceByRegion *
          region.companionsByRegion *
          previousSurviving,
      0,
    );

    const yearRoundingCostExpected = scenario.regions.reduce(
      (sum, region) =>
        sum +
        region.roundLimitByRegion *
          getYearUsageRate(scenario, region, yearIndex) *
          region.courseCostByRegion *
          (region.membersByRegion + region.companionsByRegion) *
          previousSurviving,
      0,
    );

    const yearRoundingRevenueExpected =
      yearMemberRevenueExpected + yearCompanionRevenueExpected;

    const yearRoundingRevenue = scenario.regions.reduce(
      (sum, region) =>
        sum +
        marginPerRoundByRegion(region) *
          region.roundLimitByRegion *
          getYearUsageRate(scenario, region, yearIndex),
      0,
    );

    const yearVariableProfitExpected =
      yearMemberRevenueExpected +
      yearCompanionRevenueExpected +
      scenario.annualFixedProfit * previousSurviving -
      yearRoundingCostExpected;

    const yearCashFlowExpected =
      enrollFeeThisYear +
      scenario.annualFee * previousSurviving -
      refundCost +
      yearVariableProfitExpected;

    const yearRevenue =
      enrollFeeThisYear +
      scenario.annualFee * previousSurviving +
      scenario.annualFixedProfit * previousSurviving +
      yearRoundingRevenue * previousSurviving -
      refundCost;

    const yearFixedProfit =
      enrollFeeThisYear +
      scenario.annualFee * previousSurviving +
      scenario.annualFixedProfit * previousSurviving -
      refundCost;

    cumulativeLtv += yearRevenue;

    years.push({
      yearByYear: yearIndex + 1,
      yearLabelByYear: `${yearIndex + 1}년차`,
      survivingStartByYear: roundValue(previousSurviving * 100, 1),
      survivingEndByYear: roundValue(surviving * 100, 1),
      usageByYear: roundValue(yearUsageWeighted, 1),
      enrollFeeByYear: roundValue(enrollFeeThisYear),
      annualFeeRevenueByYear: roundValue(scenario.annualFee * previousSurviving),
      annualFixedProfitByYear: roundValue(
        scenario.annualFixedProfit * previousSurviving,
      ),
      actualRoundsExpectedByYear: roundValue(yearActualRoundsExpected, 1),
      memberRevenueExpectedByYear: roundValue(yearMemberRevenueExpected),
      companionRevenueExpectedByYear: roundValue(yearCompanionRevenueExpected),
      roundingRevenueExpectedByYear: roundValue(yearRoundingRevenueExpected),
      roundingCostExpectedByYear: roundValue(yearRoundingCostExpected),
      variableProfitExpectedByYear: roundValue(yearVariableProfitExpected),
      cashFlowExpectedByYear: roundValue(yearCashFlowExpected),
      revenueByYear: roundValue(yearRevenue),
      cumulativeLTVByYear: roundValue(cumulativeLtv),
      refundCostByYear: roundValue(refundCost),
      fixedProfitByYear: roundValue(yearFixedProfit),
      rawPrevSurviving: previousSurviving,
      rawChurnRate: churnRate,
      rawRefundAmount: refundAmount,
    });

    previousSurviving = surviving;
  }

  return years;
}

function buildRegionYearRows(scenario, registryMeta) {
  const rows = [];
  let previousSurviving = 1;

  const customMeta = {
    yearlyUsageRateByRegion: registryMeta.yearlyUsageRateByRegion ?? {},
    yearActualRoundsExpectedByRegion: {
      label: '연간 라운드 횟수',
      unit: '회',
      tip: '구장별 연도별 사용률과 연초 유지율을 반영한 기대 연간 라운드 횟수',
    },
    yearMemberRevenueExpectedByRegion: {
      label: '연간 회원 매출',
      unit: '만원',
      tip: '구장별 연도별 사용률과 연초 유지율을 반영한 기대 연간 회원 매출',
    },
    yearCompanionRevenueExpectedByRegion: {
      label: '연간 동반 매출',
      unit: '만원',
      tip: '구장별 연도별 사용률과 연초 유지율을 반영한 기대 연간 동반 매출',
    },
    yearRoundingRevenueExpectedByRegion: {
      label: '라운딩 매출',
      unit: '만원',
      tip: '구장별 연간 회원 매출과 연간 동반 매출의 합',
    },
    yearRoundingCostExpectedByRegion: {
      label: '연간 매입가(B2B)',
      unit: '만원',
      tip: '구장별 연도별 사용률과 연초 유지율을 반영한 기대 연간 매입가(B2B)',
    },
  };

  for (let yearIndex = 0; yearIndex < scenario.contractYears; yearIndex += 1) {
    for (const region of scenario.regions) {
      const usageRate = getYearUsageRate(scenario, region, yearIndex) * 100;
      const actualRounds =
        region.roundLimitByRegion * (usageRate / 100) * previousSurviving;
      const memberRevenue =
        actualRounds * region.memberPriceByRegion * region.membersByRegion;
      const companionRevenue =
        actualRounds * region.companionPriceByRegion * region.companionsByRegion;
      const roundingRevenue = memberRevenue + companionRevenue;
      const roundingCost =
        actualRounds *
        region.courseCostByRegion *
        (region.membersByRegion + region.companionsByRegion);

      const entries = [
        ['yearlyUsageRateByRegion', usageRate],
        ['yearActualRoundsExpectedByRegion', actualRounds],
        ['yearMemberRevenueExpectedByRegion', memberRevenue],
        ['yearCompanionRevenueExpectedByRegion', companionRevenue],
        ['yearRoundingRevenueExpectedByRegion', roundingRevenue],
        ['yearRoundingCostExpectedByRegion', roundingCost],
      ];

      for (const [variableKey, value] of entries) {
        rows.push(
          makeRow({
            category: '구장-연도별 집계',
            variableKey,
            regionName: region.name,
            yearIndex: yearIndex + 1,
            value,
            meta: customMeta[variableKey],
          }),
        );
      }
    }

    previousSurviving = yearSurvivingEnd(
      previousSurviving,
      yearChurnRate(scenario, yearIndex),
    );
  }

  return rows;
}

function buildResultBundle(scenario) {
  const years = buildYears(scenario);
  const totalRoundLimit = getTotalRoundLimit(scenario);
  const totalActualRoundsValue = totalActualRounds(scenario);
  const weightedMargin = weightedAverageByActualRounds(
    scenario,
    marginPerRoundByRegion,
  );
  const weightedSaving = weightedAverageByActualRounds(
    scenario,
    savingPerRoundByRegion,
  );
  const totalExpectedAnnualFeeRevenue = sumExpectedByYear(
    scenario,
    (_yearIndex, previousSurviving) => scenario.annualFee * previousSurviving,
  );
  const totalExpectedPositiveAnnualFixedProfit = sumExpectedByYear(
    scenario,
    (_yearIndex, previousSurviving) =>
      Math.max(Number(scenario.annualFixedProfit || 0), 0) * previousSurviving,
  );
  const totalExpectedNegativeAnnualFixedCost = sumExpectedByYear(
    scenario,
    (_yearIndex, previousSurviving) =>
      Math.max(-Number(scenario.annualFixedProfit || 0), 0) * previousSurviving,
  );
  const totalExpectedRoundingRevenue = sumExpectedByYear(
    scenario,
    (yearIndex, previousSurviving) =>
      scenario.regions.reduce(
        (sum, region) =>
          sum +
          (region.memberPriceByRegion * region.membersByRegion +
            region.companionPriceByRegion * region.companionsByRegion) *
            region.roundLimitByRegion *
            getYearUsageRate(scenario, region, yearIndex) *
            previousSurviving,
        0,
      ),
  );
  const totalExpectedRoundingCost = sumExpectedByYear(
    scenario,
    (yearIndex, previousSurviving) =>
      scenario.regions.reduce(
        (sum, region) =>
          sum +
          region.courseCostByRegion *
            (region.membersByRegion + region.companionsByRegion) *
            region.roundLimitByRegion *
            getYearUsageRate(scenario, region, yearIndex) *
            previousSurviving,
        0,
      ),
  );
  const totalExpectedVariableRevenue =
    totalExpectedAnnualFeeRevenue +
    totalExpectedPositiveAnnualFixedProfit +
    totalExpectedRoundingRevenue;
  const totalExpectedVariableCost =
    totalExpectedNegativeAnnualFixedCost + totalExpectedRoundingCost;
  const avgAnnualVariableRevenue =
    totalExpectedVariableRevenue / scenario.contractYears;
  const avgAnnualVariableCost = totalExpectedVariableCost / scenario.contractYears;
  const avgAnnualVariableProfit =
    avgAnnualVariableRevenue - avgAnnualVariableCost;
  const totalExpectedRefundCost = sumExpectedByYear(
    scenario,
    (yearIndex, previousSurviving) =>
      previousSurviving *
      yearChurnRate(scenario, yearIndex) *
      yearRefundAmount(scenario, yearIndex),
  );
  const naiveFixedProfit = years.reduce(
    (sum, year) => sum + year.fixedProfitByYear,
    0,
  );
  const ltv = years.at(-1)?.cumulativeLTVByYear ?? 0;
  let companyBEP = null;
  const annualFixedProfitForBep =
    scenario.salePrice / scenario.contractYears +
    scenario.annualFee +
    scenario.annualFixedProfit;

  if (weightedMargin < 0) {
    companyBEP =
      annualFixedProfitForBep > 0
        ? Math.floor(annualFixedProfitForBep / Math.abs(weightedMargin))
        : 0;
  }

  const customerBEP =
    weightedSaving > 0
      ? Math.ceil(
          (scenario.salePrice + scenario.annualFee * scenario.contractYears) /
            weightedSaving,
        )
      : Number.POSITIVE_INFINITY;

  const regionData = {};

  for (const region of scenario.regions) {
    const regionActualRounds = actualRoundsByRegion(scenario, region);

    regionData[region.id] = {
      region,
      avgUsageRate: getAverageUsageRateByRegion(scenario, region),
      actualRoundsByRegion: regionActualRounds,
      weightByRegion: totalActualRoundsValue
        ? (regionActualRounds / totalActualRoundsValue) * 100
        : 0,
      memberProfitByRegion: memberProfitByRegion(region),
      companionProfitByRegion: companionProfitByRegion(region),
      marginPerRoundByRegion: marginPerRoundByRegion(region),
      annualRoundingByRegion:
        marginPerRoundByRegion(region) * regionActualRounds,
      memberSavingByRegion: memberSavingByRegion(region),
      companionSavingByRegion: companionSavingByRegion(region),
      savingPerRoundByRegion: savingPerRoundByRegion(region),
      annualSavingByRegion: savingPerRoundByRegion(region) * regionActualRounds,
      peoplePerRoundByRegion: region.membersByRegion + region.companionsByRegion,
      membersPerRoundByRegion: region.membersByRegion,
      companionsPerRoundByRegion: region.companionsByRegion,
    };
  }

  return {
    scenario,
    years,
    regionData,
    totalRoundLimit,
    weightedUsageRate: scenario.regions.reduce(
      (sum, region) =>
        sum +
        getAverageUsageRateByRegion(scenario, region) *
          (region.roundLimitByRegion / totalRoundLimit),
      0,
    ),
    weightedCourseCost: weightedAverageByActualRounds(
      scenario,
      (region) => region.courseCostByRegion,
    ),
    weightedMemberPrice: weightedAverageByActualRounds(
      scenario,
      (region) => region.memberPriceByRegion,
    ),
    weightedMembers: weightedAverageByActualRounds(
      scenario,
      (region) => region.membersByRegion,
    ),
    weightedCompanionPrice: weightedAverageByActualRounds(
      scenario,
      (region) => region.companionPriceByRegion,
    ),
    weightedCompanions: weightedAverageByActualRounds(
      scenario,
      (region) => region.companionsByRegion,
    ),
    weightedPeoplePerRound: weightedAverageByActualRounds(
      scenario,
      (region) => region.membersByRegion + region.companionsByRegion,
    ),
    weightedPublicPrice: weightedAverageByActualRounds(
      scenario,
      (region) => region.publicPriceByRegion,
    ),
    totalActualRounds: totalActualRoundsValue,
    weightedMarginPerRound: weightedMargin,
    weightedMemberProfit: weightedAverageByActualRounds(
      scenario,
      memberProfitByRegion,
    ),
    weightedCompanionProfit: weightedAverageByActualRounds(
      scenario,
      companionProfitByRegion,
    ),
    weightedMemberSaving: weightedAverageByActualRounds(
      scenario,
      memberSavingByRegion,
    ),
    weightedCompanionSaving: weightedAverageByActualRounds(
      scenario,
      companionSavingByRegion,
    ),
    totalAnnualRounding: totalAnnualRounding(scenario),
    weightedSavingPerRound: weightedSaving,
    totalAnnualSaving: totalAnnualSaving(scenario),
    avgChurnRate: average(
      scenario.churnByYear ?? [],
      Number(scenario.yearlyChurnRate || 0),
    ),
    avgRefundAmount: average(
      scenario.refundAmountByYear ?? [],
      Number(scenario.yearlyRefundAmount || 0),
    ),
    naiveFixedProfit,
    ltv,
    companyBEP,
    customerBEP,
    naiveCustomerFixedCost:
      scenario.salePrice + scenario.annualFee * scenario.contractYears,
    avgAnnualProfit: ltv / scenario.contractYears,
    avgAnnualRounds: totalActualRoundsValue,
    customerNetProfit:
      weightedSaving * totalActualRoundsValue * scenario.contractYears -
      scenario.salePrice -
      scenario.annualFee * scenario.contractYears,
    totalExpectedAnnualFeeRevenue,
    totalExpectedPositiveAnnualFixedProfit,
    totalExpectedNegativeAnnualFixedCost,
    totalExpectedRoundingRevenue,
    totalExpectedRoundingCost,
    totalExpectedVariableRevenue,
    totalExpectedVariableCost,
    avgAnnualVariableRevenue,
    avgAnnualVariableCost,
    avgAnnualVariableProfit,
    totalExpectedRefundCost,
    expectedEnrollProfit: scenario.salePrice - totalExpectedRefundCost,
    expectedMaturitySurvivingRate: years.at(-1)?.survivingEndByYear ?? 0,
  };
}

function cleanValue(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number' && (!Number.isFinite(value) || Number.isNaN(value))) {
    return null;
  }

  return value;
}

function makeRow({
  category,
  variableKey,
  value,
  meta,
  regionName = '',
  yearIndex = '',
}) {
  return {
    분류: category,
    변수명: variableKey,
    라벨: meta?.label ?? variableKey,
    구장명: regionName,
    연도: yearIndex,
    값: cleanValue(value),
    단위: meta?.unit ?? '',
    tip: meta?.tip ?? '',
  };
}

function appendSheetRows(sheet, rows) {
  const headers = ['분류', '변수명', '라벨', '구장명', '연도', '값', '단위', 'tip'];
  sheet.addRow(headers);

  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  for (const row of rows) {
    sheet.addRow(headers.map((header) => row[header]));
  }

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = {
    from: 'A1',
    to: 'H1',
  };

  const widths = {
    A: 16,
    B: 32,
    C: 24,
    D: 18,
    E: 8,
    F: 14,
    G: 10,
    H: 56,
  };

  for (const [column, width] of Object.entries(widths)) {
    sheet.getColumn(column).width = width;
  }

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    sheet.getCell(`F${rowNumber}`).numFmt = '0.0########';
  }
}

function buildRowsForScenario(scenario, registryMeta) {
  const result = buildResultBundle(scenario);
  const rows = [];

  const scenarioInputKeys = [
    'salePrice',
    'annualFee',
    'annualFixedProfit',
    'contractYears',
    'yearlyChurnRate',
    'yearlyRefundAmount',
  ];

  for (const key of scenarioInputKeys) {
    rows.push(
      makeRow({
        category: '입력변수',
        variableKey: key,
        value: scenario[key],
        meta: registryMeta[key] ?? {},
      }),
    );
  }

  const regionInputKeys = [
    'roundLimitByRegion',
    'courseCostByRegion',
    'memberPriceByRegion',
    'membersByRegion',
    'companionPriceByRegion',
    'companionsByRegion',
    'publicPriceByRegion',
  ];

  for (const region of scenario.regions) {
    for (const key of regionInputKeys) {
      rows.push(
        makeRow({
          category: '입력변수',
          variableKey: key,
          regionName: region.name,
          value: region[key],
          meta: registryMeta[key] ?? {},
        }),
      );
    }
  }

  const totalKeys = [
    'totalRoundLimit',
    'weightedUsageRate',
    'weightedCourseCost',
    'weightedMemberPrice',
    'weightedMembers',
    'weightedCompanionPrice',
    'weightedCompanions',
    'weightedPeoplePerRound',
    'weightedPublicPrice',
    'totalActualRounds',
    'weightedMarginPerRound',
    'weightedMemberProfit',
    'weightedCompanionProfit',
    'weightedMemberSaving',
    'weightedCompanionSaving',
    'totalAnnualRounding',
    'weightedSavingPerRound',
    'totalAnnualSaving',
    'avgChurnRate',
    'avgRefundAmount',
    'naiveFixedProfit',
    'ltv',
    'companyBEP',
    'customerBEP',
    'naiveCustomerFixedCost',
    'avgAnnualProfit',
    'avgAnnualRounds',
    'customerNetProfit',
    'totalExpectedAnnualFeeRevenue',
    'totalExpectedPositiveAnnualFixedProfit',
    'totalExpectedNegativeAnnualFixedCost',
    'totalExpectedRoundingRevenue',
    'totalExpectedRoundingCost',
    'totalExpectedVariableRevenue',
    'totalExpectedVariableCost',
    'avgAnnualVariableRevenue',
    'avgAnnualVariableCost',
    'avgAnnualVariableProfit',
    'totalExpectedRefundCost',
    'expectedEnrollProfit',
    'expectedMaturitySurvivingRate',
  ];

  for (const key of totalKeys) {
    rows.push(
      makeRow({
        category: '총집계',
        variableKey: key,
        value: result[key],
        meta: registryMeta[key] ?? {},
      }),
    );
  }

  const regionMetricKeys = [
    'avgUsageRateByRegion',
    'actualRoundsByRegion',
    'weightByRegion',
    'marginPerRoundByRegion',
    'memberProfitByRegion',
    'companionProfitByRegion',
    'annualRoundingByRegion',
    'memberSavingByRegion',
    'companionSavingByRegion',
    'savingPerRoundByRegion',
    'annualSavingByRegion',
    'peoplePerRoundByRegion',
    'membersPerRoundByRegion',
    'companionsPerRoundByRegion',
  ];

  for (const regionEntry of Object.values(result.regionData)) {
    for (const key of regionMetricKeys) {
      rows.push(
        makeRow({
          category: '구장별 집계',
          variableKey: key,
          regionName: regionEntry.region.name,
          value: regionEntry[key],
          meta: registryMeta[key] ?? {},
        }),
      );
    }
  }

  const yearKeyMap = [
    ['yearSurvivingStartRate', 'survivingStartByYear'],
    ['yearWeightedUsageRate', 'usageByYear'],
    ['yearChurnRate', 'rawChurnRate'],
    ['yearRefundAmount', 'rawRefundAmount'],
    ['yearEnrollFee', 'enrollFeeByYear'],
    ['annualFee', 'annualFeeRevenueByYear'],
    ['annualFixedProfit', 'annualFixedProfitByYear'],
    ['yearActualRoundsExpected', 'actualRoundsExpectedByYear'],
    ['yearMemberRevenueExpected', 'memberRevenueExpectedByYear'],
    ['yearCompanionRevenueExpected', 'companionRevenueExpectedByYear'],
    ['yearRoundingRevenueExpected', 'roundingRevenueExpectedByYear'],
    ['yearRoundingCostExpected', 'roundingCostExpectedByYear'],
    ['yearRefundCost', 'refundCostByYear'],
    ['yearVariableProfitExpected', 'variableProfitExpectedByYear'],
    ['yearCashFlowExpected', 'cashFlowExpectedByYear'],
    ['yearCumulativeLtv', 'cumulativeLTVByYear'],
  ];

  for (const year of result.years) {
    for (const [variableKey, field] of yearKeyMap) {
      rows.push(
        makeRow({
          category: '연도별 집계',
          variableKey,
          yearIndex: year.yearByYear,
          value: year[field],
          meta: registryMeta[variableKey] ?? {},
        }),
      );
    }
  }

  rows.push(...buildRegionYearRows(scenario, registryMeta));
  return rows;
}

async function buildWorkbook() {
  const workbook = new ExcelJS.Workbook();
  const registryMeta = await parseRegistryMeta();
  const scenarios = defaultScenarios();

  for (const scenario of scenarios) {
    const sheet = workbook.addWorksheet(String(scenario.name).slice(0, 31));
    appendSheetRows(sheet, buildRowsForScenario(scenario, registryMeta));
  }

  return workbook;
}

async function main() {
  const workbook = await buildWorkbook();
  await workbook.xlsx.writeFile(OUTPUT_FILE);
  process.stdout.write(`${OUTPUT_FILE}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
