import { V } from './registry.js';

function createMetric(key, value, extra = {}) {
  return {
    key,
    label: V[key].label,
    unit: V[key].unit,
    value,
    formatted: V[key].fmt(value),
    prefix: V[key].prefix,
    sticker: V[key].sticker,
    tip: V[key].tip,
    cfmt: V[key].cfmt,
    ...extra,
  };
}

export function buildInputDerivedState({ scenario, usage }) {
  const context = { scenario, usage };
  const evaluate = (key, extra = {}) => V[key].formula({ ...context, ...extra });

  const averageUsageRateByRegionValues = Object.fromEntries(
    scenario.regions.map((region) => [region.id, evaluate('avgUsageRateByRegion', { region })]),
  );

  const aggregateMetrics = {
    totalRoundLimit: createMetric('totalRoundLimit', evaluate('totalRoundLimit')),
    weightedUsageRate: createMetric('weightedUsageRate', evaluate('weightedUsageRate')),
    weightedCourseCost: createMetric('weightedCourseCost', evaluate('weightedCourseCost')),
    weightedMemberPrice: createMetric('weightedMemberPrice', evaluate('weightedMemberPrice')),
    weightedMembers: createMetric('weightedMembers', evaluate('weightedMembers')),
    weightedCompanionPrice: createMetric(
      'weightedCompanionPrice',
      evaluate('weightedCompanionPrice'),
    ),
    weightedCompanions: createMetric('weightedCompanions', evaluate('weightedCompanions')),
    weightedPeoplePerRound: createMetric(
      'weightedPeoplePerRound',
      evaluate('weightedPeoplePerRound'),
    ),
    weightedPublicPrice: createMetric('weightedPublicPrice', evaluate('weightedPublicPrice')),
    totalActualRounds: createMetric('totalActualRounds', evaluate('totalActualRounds')),
    totalWeightByRegion: createMetric('totalWeightByRegion', evaluate('totalWeightByRegion')),
    weightedMarginPerRound: createMetric(
      'weightedMarginPerRound',
      evaluate('weightedMarginPerRound'),
    ),
    weightedMemberProfit: createMetric(
      'weightedMemberProfit',
      evaluate('weightedMemberProfit'),
    ),
    weightedCompanionProfit: createMetric(
      'weightedCompanionProfit',
      evaluate('weightedCompanionProfit'),
    ),
    weightedMemberSaving: createMetric(
      'weightedMemberSaving',
      evaluate('weightedMemberSaving'),
    ),
    weightedCompanionSaving: createMetric(
      'weightedCompanionSaving',
      evaluate('weightedCompanionSaving'),
    ),
    totalAnnualRounding: createMetric('totalAnnualRounding', evaluate('totalAnnualRounding')),
    weightedSavingPerRound: createMetric(
      'weightedSavingPerRound',
      evaluate('weightedSavingPerRound'),
    ),
    totalAnnualSaving: createMetric('totalAnnualSaving', evaluate('totalAnnualSaving')),
    avgChurnRate: createMetric('avgChurnRate', evaluate('avgChurnRate')),
    avgRefundAmount: createMetric('avgRefundAmount', evaluate('avgRefundAmount')),
    avgUsageRateByRegion: {
      key: 'avgUsageRateByRegion',
      label: V.avgUsageRateByRegion.label,
      unit: V.avgUsageRateByRegion.unit,
      prefix: V.avgUsageRateByRegion.prefix,
      sticker: V.avgUsageRateByRegion.sticker,
      valuesByRegion: averageUsageRateByRegionValues,
      formattedValuesByRegion: Object.fromEntries(
        Object.entries(averageUsageRateByRegionValues).map(([regionId, value]) => [
          regionId,
          V.avgUsageRateByRegion.fmt(value),
        ]),
      ),
    },
  };

  return {
    inputFieldsTop: [
      {
        key: 'roundLimitByRegion',
        label: V.roundLimitByRegion.label,
        unit: V.roundLimitByRegion.unit,
        aggregateMetricKey: 'totalRoundLimit',
      },
    ],
    inputFieldsBottom: [
      {
        key: 'courseCostByRegion',
        label: V.courseCostByRegion.label,
        unit: V.courseCostByRegion.unit,
        aggregateMetricKey: 'weightedCourseCost',
      },
      {
        key: 'memberPriceByRegion',
        label: V.memberPriceByRegion.label,
        unit: V.memberPriceByRegion.unit,
        aggregateMetricKey: 'weightedMemberPrice',
      },
      {
        key: 'membersByRegion',
        label: V.membersByRegion.label,
        unit: V.membersByRegion.unit,
        aggregateMetricKey: 'weightedMembers',
      },
      {
        key: 'companionPriceByRegion',
        label: V.companionPriceByRegion.label,
        unit: V.companionPriceByRegion.unit,
        aggregateMetricKey: 'weightedCompanionPrice',
      },
      {
        key: 'companionsByRegion',
        label: V.companionsByRegion.label,
        unit: V.companionsByRegion.unit,
        aggregateMetricKey: 'weightedCompanions',
      },
      {
        key: 'publicPriceByRegion',
        label: V.publicPriceByRegion.label,
        unit: V.publicPriceByRegion.unit,
        aggregateMetricKey: 'weightedPublicPrice',
      },
    ],
    computedFields: [
      {
        id: 'peoplePerRoundByRegion',
        label: V.peoplePerRoundByRegion.label,
        unit: V.peoplePerRoundByRegion.unit,
        tip: V.peoplePerRoundByRegion.tip,
        cfmt: V.peoplePerRoundByRegion.cfmt,
        depth: 0,
        bold: true,
        value: (region) => evaluate('peoplePerRoundByRegion', { region }),
        calc: (region) => V.peoplePerRoundByRegion.fmt(evaluate('peoplePerRoundByRegion', { region })),
        aggregateMetricKey: 'weightedPeoplePerRound',
      },
      {
        id: 'membersPerRoundByRegion',
        label: V.membersPerRoundByRegion.label,
        unit: V.membersPerRoundByRegion.unit,
        tip: V.membersPerRoundByRegion.tip,
        cfmt: V.membersPerRoundByRegion.cfmt,
        depth: 1,
        value: (region) => evaluate('membersPerRoundByRegion', { region }),
        calc: (region) =>
          V.membersPerRoundByRegion.fmt(evaluate('membersPerRoundByRegion', { region })),
        aggregateMetricKey: 'weightedMembers',
      },
      {
        id: 'companionsPerRoundByRegion',
        label: V.companionsPerRoundByRegion.label,
        unit: V.companionsPerRoundByRegion.unit,
        tip: V.companionsPerRoundByRegion.tip,
        cfmt: V.companionsPerRoundByRegion.cfmt,
        depth: 1,
        value: (region) => evaluate('companionsPerRoundByRegion', { region }),
        calc: (region) =>
          V.companionsPerRoundByRegion.fmt(evaluate('companionsPerRoundByRegion', { region })),
        aggregateMetricKey: 'weightedCompanions',
      },
      {
        id: 'actualRoundsByRegion',
        label: V.actualRoundsByRegion.label,
        unit: V.actualRoundsByRegion.unit,
        tip: V.actualRoundsByRegion.tip,
        cfmt: V.actualRoundsByRegion.cfmt,
        depth: 0,
        bold: true,
        value: (region) => evaluate('actualRoundsByRegion', { region }),
        calc: (region) => V.actualRoundsByRegion.fmt(evaluate('actualRoundsByRegion', { region })),
        aggregateMetricKey: 'totalActualRounds',
      },
      {
        id: 'weightByRegion',
        label: V.weightByRegion.label,
        unit: V.weightByRegion.unit,
        tip: V.weightByRegion.tip,
        cfmt: V.weightByRegion.cfmt,
        depth: 1,
        value: (region) => evaluate('weightByRegion', { region }),
        calc: (region) => V.weightByRegion.fmt(evaluate('weightByRegion', { region })),
        aggregateMetricKey: 'totalWeightByRegion',
      },
      {
        id: 'marginPerRoundByRegion',
        label: V.marginPerRoundByRegion.label,
        unit: V.marginPerRoundByRegion.unit,
        tip: V.marginPerRoundByRegion.tip,
        cfmt: V.marginPerRoundByRegion.cfmt,
        depth: 0,
        bold: true,
        value: (region) => evaluate('marginPerRoundByRegion', { region }),
        calc: (region) =>
          V.marginPerRoundByRegion.fmt(evaluate('marginPerRoundByRegion', { region })),
        aggregateMetricKey: 'weightedMarginPerRound',
      },
      {
        id: 'memberProfitByRegion',
        label: V.memberProfitByRegion.label,
        unit: V.memberProfitByRegion.unit,
        tip: V.memberProfitByRegion.tip,
        cfmt: V.memberProfitByRegion.cfmt,
        depth: 1,
        value: (region) => evaluate('memberProfitByRegion', { region }),
        calc: (region) =>
          V.memberProfitByRegion.fmt(evaluate('memberProfitByRegion', { region })),
        aggregateMetricKey: 'weightedMemberProfit',
      },
      {
        id: 'companionProfitByRegion',
        label: V.companionProfitByRegion.label,
        unit: V.companionProfitByRegion.unit,
        tip: V.companionProfitByRegion.tip,
        cfmt: V.companionProfitByRegion.cfmt,
        depth: 1,
        value: (region) => evaluate('companionProfitByRegion', { region }),
        calc: (region) =>
          V.companionProfitByRegion.fmt(evaluate('companionProfitByRegion', { region })),
        aggregateMetricKey: 'weightedCompanionProfit',
      },
      {
        id: 'annualRoundingByRegion',
        label: V.annualRoundingByRegion.label,
        unit: V.annualRoundingByRegion.unit,
        tip: V.annualRoundingByRegion.tip,
        cfmt: V.annualRoundingByRegion.cfmt,
        depth: 0,
        bold: true,
        value: (region) => evaluate('annualRoundingByRegion', { region }),
        calc: (region) =>
          V.annualRoundingByRegion.fmt(evaluate('annualRoundingByRegion', { region })),
        aggregateMetricKey: 'totalAnnualRounding',
      },
      {
        id: 'savingPerRoundByRegion',
        label: V.savingPerRoundByRegion.label,
        unit: V.savingPerRoundByRegion.unit,
        tip: V.savingPerRoundByRegion.tip,
        cfmt: V.savingPerRoundByRegion.cfmt,
        depth: 0,
        bold: true,
        value: (region) => evaluate('savingPerRoundByRegion', { region }),
        calc: (region) =>
          V.savingPerRoundByRegion.fmt(evaluate('savingPerRoundByRegion', { region })),
        aggregateMetricKey: 'weightedSavingPerRound',
      },
      {
        id: 'memberSavingByRegion',
        label: V.memberSavingByRegion.label,
        unit: V.memberSavingByRegion.unit,
        tip: V.memberSavingByRegion.tip,
        cfmt: V.memberSavingByRegion.cfmt,
        depth: 1,
        value: (region) => evaluate('memberSavingByRegion', { region }),
        calc: (region) =>
          V.memberSavingByRegion.fmt(evaluate('memberSavingByRegion', { region })),
        aggregateMetricKey: 'weightedMemberSaving',
      },
      {
        id: 'companionSavingByRegion',
        label: V.companionSavingByRegion.label,
        unit: V.companionSavingByRegion.unit,
        tip: V.companionSavingByRegion.tip,
        cfmt: V.companionSavingByRegion.cfmt,
        depth: 1,
        value: (region) => evaluate('companionSavingByRegion', { region }),
        calc: (region) =>
          V.companionSavingByRegion.fmt(evaluate('companionSavingByRegion', { region })),
        aggregateMetricKey: 'weightedCompanionSaving',
      },
      {
        id: 'annualSavingByRegion',
        label: V.annualSavingByRegion.label,
        unit: V.annualSavingByRegion.unit,
        tip: V.annualSavingByRegion.tip,
        cfmt: V.annualSavingByRegion.cfmt,
        depth: 0,
        bold: true,
        value: (region) => evaluate('annualSavingByRegion', { region }),
        calc: (region) =>
          V.annualSavingByRegion.fmt(evaluate('annualSavingByRegion', { region })),
        aggregateMetricKey: 'totalAnnualSaving',
      },
    ],
    aggregateMetrics,
    weightedUsageRateMetric: aggregateMetrics.weightedUsageRate,
    avgUsageRateByRegionMetric: aggregateMetrics.avgUsageRateByRegion,
    avgChurnRateMetric: aggregateMetrics.avgChurnRate,
    avgRefundAmountMetric: aggregateMetrics.avgRefundAmount,
  };
}
