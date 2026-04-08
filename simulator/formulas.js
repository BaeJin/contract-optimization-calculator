import { buildYearlySeries } from './yearlyModel.js';

const FALLBACK_USAGE_RATE = 65;

function sumValues(values, pickValue = (value) => value) {
  return (values || []).reduce((total, value) => total + pickValue(value), 0);
}

function averageValues(values, fallback = 0) {
  if (!values || values.length === 0) {
    return fallback;
  }

  return sumValues(values) / values.length;
}

function getUsageValues(usageByRegion, regionId) {
  return usageByRegion?.[regionId] || [];
}

function getAverageUsageRateByRegion({ usage, region }) {
  return averageValues(getUsageValues(usage, region.id), 100);
}

function getTotalRoundLimit({ scenario }) {
  return Math.max(
    sumValues(scenario.regions, (region) => Number(region.roundLimitByRegion || 0)),
    1,
  );
}

function getYearOverrideValue(override, fallback) {
  return override ?? fallback;
}

function getYearUsageRate({ scenario, region, yearIndex, values = {} }) {
  if (values.usageRateOverride != null) {
    return values.usageRateOverride;
  }

  return (scenario.usageByRegion?.[region.id]?.[yearIndex] ?? FALLBACK_USAGE_RATE) / 100;
}

function sumExpectedByYear({ scenario }, pickValue) {
  let total = 0;
  let previousSurviving = 1;

  for (let yearIndex = 0; yearIndex < scenario.contractYears; yearIndex += 1) {
    total += pickValue({ yearIndex, previousSurviving });

    const churnRate = formulaRegistry.yearChurnRate({ scenario, yearIndex });
    previousSurviving = formulaRegistry.yearSurvivingEnd({
      values: { prevSurviving: previousSurviving, churnRate },
    });
  }

  return total;
}

export const formulaRegistry = {
  memberSavingByRegion: ({ region }) =>
    (region.publicPriceByRegion - region.memberPriceByRegion) * region.membersByRegion,

  companionSavingByRegion: ({ region }) =>
    (region.publicPriceByRegion - region.companionPriceByRegion) * region.companionsByRegion,

  totalRoundLimit: (context) => getTotalRoundLimit(context),

  avgUsageRateByRegion: ({ usage, region }) => getAverageUsageRateByRegion({ usage, region }),

  actualRoundsByRegion: ({ usage, region }) =>
    region.roundLimitByRegion * (getAverageUsageRateByRegion({ usage, region }) / 100),

  totalActualRounds: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) =>
      formulaRegistry.actualRoundsByRegion({ scenario, usage, region }),
    ),

  weightByRegion: ({ scenario, usage, region }) => {
    const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
    if (totalActualRounds === 0) {
      return 0;
    }

    return (
      (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) * 100
    );
  },

  totalWeightByRegion: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => formulaRegistry.weightByRegion({ scenario, usage, region })),

  memberProfitByRegion: ({ region }) =>
    (region.memberPriceByRegion - region.courseCostByRegion) * region.membersByRegion,

  companionProfitByRegion: ({ region }) =>
    (region.companionPriceByRegion - region.courseCostByRegion) * region.companionsByRegion,

  marginPerRoundByRegion: (context) =>
    formulaRegistry.memberProfitByRegion(context) + formulaRegistry.companionProfitByRegion(context),

  annualRoundingByRegion: (context) =>
    formulaRegistry.marginPerRoundByRegion(context) * formulaRegistry.actualRoundsByRegion(context),

  savingPerRoundByRegion: (context) =>
    formulaRegistry.memberSavingByRegion(context) + formulaRegistry.companionSavingByRegion(context),

  annualSavingByRegion: (context) =>
    formulaRegistry.savingPerRoundByRegion(context) * formulaRegistry.actualRoundsByRegion(context),

  weightedUsageRate: ({ scenario, usage }) =>
    sumValues(
      scenario.regions,
      (region) =>
        getAverageUsageRateByRegion({ usage, region }) *
        (region.roundLimitByRegion / getTotalRoundLimit({ scenario })),
    ),

  weightedCourseCost: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        Number(region.courseCostByRegion || 0)
      );
    }),

  weightedMemberPrice: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        Number(region.memberPriceByRegion || 0)
      );
    }),

  weightedMembers: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        Number(region.membersByRegion || 0)
      );
    }),

  weightedCompanionPrice: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        Number(region.companionPriceByRegion || 0)
      );
    }),

  weightedCompanions: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        Number(region.companionsByRegion || 0)
      );
    }),

  weightedPeoplePerRound: ({ scenario, usage }) =>
    formulaRegistry.weightedMembers({ scenario, usage }) +
    formulaRegistry.weightedCompanions({ scenario, usage }),

  peoplePerRoundByRegion: ({ region }) =>
    Number(region.membersByRegion || 0) + Number(region.companionsByRegion || 0),

  membersPerRoundByRegion: ({ region }) => Number(region.membersByRegion || 0),

  companionsPerRoundByRegion: ({ region }) => Number(region.companionsByRegion || 0),

  weightedPublicPrice: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        Number(region.publicPriceByRegion || 0)
      );
    }),

  weightedMarginPerRound: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        formulaRegistry.marginPerRoundByRegion({ scenario, usage, region })
      );
    }),

  weightedMemberProfit: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        formulaRegistry.memberProfitByRegion({ scenario, usage, region })
      );
    }),

  weightedCompanionProfit: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        formulaRegistry.companionProfitByRegion({ scenario, usage, region })
      );
    }),

  weightedMemberSaving: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        formulaRegistry.memberSavingByRegion({ scenario, usage, region })
      );
    }),

  weightedCompanionSaving: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        formulaRegistry.companionSavingByRegion({ scenario, usage, region })
      );
    }),

  totalAnnualRounding: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) =>
      formulaRegistry.annualRoundingByRegion({ scenario, usage, region }),
    ),

  weightedSavingPerRound: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) => {
      const totalActualRounds = formulaRegistry.totalActualRounds({ scenario, usage });
      if (totalActualRounds === 0) return 0;
      return (
        (formulaRegistry.actualRoundsByRegion({ scenario, usage, region }) / totalActualRounds) *
        formulaRegistry.savingPerRoundByRegion({ scenario, usage, region })
      );
    }),

  totalAnnualSaving: ({ scenario, usage }) =>
    sumValues(scenario.regions, (region) =>
      formulaRegistry.annualSavingByRegion({ scenario, usage, region }),
    ),

  avgChurnRate: ({ scenario }) =>
    averageValues(scenario.churnByYear, Number(scenario.yearlyChurnRate || 0)),

  avgRefundAmount: ({ scenario }) =>
    averageValues(scenario.refundAmountByYear, Number(scenario.yearlyRefundAmount || 0)),

  naiveFixedProfit: ({ years }) => sumValues(years || [], (year) => year.fixedProfitByYear || 0),

  ltv: ({ years }) => (years && years.length > 0 ? years[years.length - 1].cumulativeLTVByYear : 0),

  companyBEP: ({ scenario, values }) => {
    const annualFixedProfit =
      scenario.salePrice / scenario.contractYears +
      scenario.annualFee +
      scenario.annualFixedProfit;
    if (values.wMargin >= 0) return null;
    return annualFixedProfit > 0 ? Math.floor(annualFixedProfit / Math.abs(values.wMargin)) : 0;
  },

  customerBEP: ({ scenario, values }) =>
    values.wSaving > 0
      ? Math.ceil((scenario.salePrice + scenario.annualFee * scenario.contractYears) / values.wSaving)
      : Number.POSITIVE_INFINITY,

  naiveCustomerFixedCost: ({ scenario }) =>
    scenario.salePrice + scenario.annualFee * scenario.contractYears,

  avgAnnualProfit: ({ scenario, values }) => values.ltv / scenario.contractYears,

  avgAnnualRounds: ({ values }) => values.sumActualRounds,

  customerNetProfit: ({ scenario, values }) =>
    values.wSaving * values.sumActualRounds * scenario.contractYears -
    scenario.salePrice -
    scenario.annualFee * scenario.contractYears,

  enrollFeeAnnualValue: ({ scenario }) => scenario.salePrice,

  annualFeeRevenueValue: ({ scenario }) => scenario.annualFee,

  annualFixedProfitValue: ({ scenario }) => scenario.annualFixedProfit,

  annualTotalValue: ({ values = {} }) =>
    values.enrollFeeAnnual +
    values.annualFeeRevenue +
    values.annualFixedProfit +
    values.roundingRevenue,

  totalExpectedAnnualFeeRevenue: ({ scenario }) =>
    sumExpectedByYear({ scenario }, ({ previousSurviving }) => scenario.annualFee * previousSurviving),

  totalExpectedPositiveAnnualFixedProfit: ({ scenario }) =>
    sumExpectedByYear(
      { scenario },
      ({ previousSurviving }) =>
        Math.max(Number(scenario.annualFixedProfit || 0), 0) * previousSurviving,
    ),

  totalExpectedNegativeAnnualFixedCost: ({ scenario }) =>
    sumExpectedByYear(
      { scenario },
      ({ previousSurviving }) =>
        Math.max(-Number(scenario.annualFixedProfit || 0), 0) * previousSurviving,
    ),

  totalExpectedRoundingRevenue: ({ scenario, usage }) =>
    sumExpectedByYear({ scenario }, ({ yearIndex, previousSurviving }) =>
      sumValues(scenario.regions, (region) => {
        const roundsThisYear =
          Number(region.roundLimitByRegion || 0) * getYearUsageRate({ scenario, region, yearIndex });
        const revenuePerRound =
          Number(region.memberPriceByRegion || 0) * Number(region.membersByRegion || 0) +
          Number(region.companionPriceByRegion || 0) * Number(region.companionsByRegion || 0);

        return revenuePerRound * roundsThisYear * previousSurviving;
      }),
    ),

  totalExpectedRoundingCost: ({ scenario }) =>
    sumExpectedByYear({ scenario }, ({ yearIndex, previousSurviving }) =>
      sumValues(scenario.regions, (region) => {
        const roundsThisYear =
          Number(region.roundLimitByRegion || 0) * getYearUsageRate({ scenario, region, yearIndex });
        const costPerRound =
          Number(region.courseCostByRegion || 0) *
          (Number(region.membersByRegion || 0) + Number(region.companionsByRegion || 0));

        return costPerRound * roundsThisYear * previousSurviving;
      }),
    ),

  totalExpectedVariableRevenue: ({ values = {} }) =>
    values.totalExpectedAnnualFeeRevenue +
    values.totalExpectedPositiveAnnualFixedProfit +
    values.totalExpectedRoundingRevenue,

  totalExpectedVariableCost: ({ values = {} }) =>
    values.totalExpectedNegativeAnnualFixedCost + values.totalExpectedRoundingCost,

  avgAnnualVariableRevenue: ({ scenario, values = {} }) =>
    values.totalExpectedVariableRevenue / scenario.contractYears,

  avgAnnualVariableCost: ({ scenario, values = {} }) =>
    values.totalExpectedVariableCost / scenario.contractYears,

  avgAnnualVariableProfit: ({ values = {} }) =>
    values.avgAnnualVariableRevenue - values.avgAnnualVariableCost,

  totalExpectedRefundCost: ({ scenario }) =>
    sumExpectedByYear({ scenario }, ({ yearIndex, previousSurviving }) => {
      const churnRate = formulaRegistry.yearChurnRate({ scenario, yearIndex });
      const refundAmount = formulaRegistry.yearRefundAmount({ scenario, yearIndex });

      return previousSurviving * churnRate * refundAmount;
    }),

  expectedEnrollProfit: ({ scenario, values = {} }) =>
    Number(scenario.salePrice || 0) - values.totalExpectedRefundCost,

  expectedMaturitySurvivingRate: ({ years }) =>
    years && years.length > 0 ? (years[years.length - 1].survivingEndByYear || 0) : 0,

  yearWeightedUsageRate: ({ scenario, yearIndex, values = {} }) =>
    sumValues(
      scenario.regions,
      (region) =>
        getYearUsageRate({ scenario, region, yearIndex, values }) *
        (region.roundLimitByRegion / getTotalRoundLimit({ scenario })),
    ) * 100,

  yearChurnRate: ({ scenario, yearIndex }) =>
    (scenario.churnByYear?.[yearIndex] ?? scenario.yearlyChurnRate ?? 0) / 100,

  yearRefundAmount: ({ scenario, yearIndex }) =>
    Number(scenario.refundAmountByYear?.[yearIndex] ?? scenario.yearlyRefundAmount ?? 0),

  yearEnrollFee: ({ scenario, yearIndex }) => (yearIndex === 0 ? scenario.salePrice : 0),

  yearSurvivingEnd: ({ values = {} }) =>
    values.prevSurviving - values.prevSurviving * values.churnRate,

  yearRefundCost: ({ values = {} }) =>
    values.prevSurviving * values.churnRate * values.refundAmount,

  yearSurvivingStartRate: ({ values = {} }) => values.prevSurviving * 100,

  yearActualRoundsExpected: ({ scenario, yearIndex, values = {} }) =>
    sumValues(
      scenario.regions,
      (region) =>
        Number(region.roundLimitByRegion || 0) *
        getYearUsageRate({ scenario, region, yearIndex, values }) *
        values.prevSurviving,
    ),

  yearMemberRevenueExpected: ({ scenario, yearIndex, values = {} }) =>
    sumValues(
      scenario.regions,
      (region) =>
        Number(region.roundLimitByRegion || 0) *
        getYearUsageRate({ scenario, region, yearIndex, values }) *
        Number(region.memberPriceByRegion || 0) *
        Number(region.membersByRegion || 0) *
        values.prevSurviving,
    ),

  yearCompanionRevenueExpected: ({ scenario, yearIndex, values = {} }) =>
    sumValues(
      scenario.regions,
      (region) =>
        Number(region.roundLimitByRegion || 0) *
        getYearUsageRate({ scenario, region, yearIndex, values }) *
        Number(region.companionPriceByRegion || 0) *
        Number(region.companionsByRegion || 0) *
        values.prevSurviving,
    ),

  yearRoundingCostExpected: ({ scenario, yearIndex, values = {} }) =>
    sumValues(
      scenario.regions,
      (region) =>
        Number(region.roundLimitByRegion || 0) *
        getYearUsageRate({ scenario, region, yearIndex, values }) *
        Number(region.courseCostByRegion || 0) *
        (Number(region.membersByRegion || 0) + Number(region.companionsByRegion || 0)) *
        values.prevSurviving,
    ),

  yearRoundingRevenueExpected: ({ values = {} }) =>
    values.yearMemberRevenueExpected + values.yearCompanionRevenueExpected,

  yearVariableProfitExpected: ({ values = {} }) =>
    values.yearMemberRevenueExpected +
    values.yearCompanionRevenueExpected +
    values.annualFixedProfit * values.prevSurviving -
    values.yearRoundingCostExpected,

  yearCashFlowExpected: ({ values = {} }) =>
    values.enrollFeeThisYear +
    values.annualFeeRevenue * values.prevSurviving -
    values.refundCost +
    values.yearVariableProfitExpected,

  regionMarginPerRoundValue: ({ region, values = {} }) => {
    const companionCount = getYearOverrideValue(
      values.companionCountOverride,
      region.companionsByRegion,
    );
    const memberCount = getYearOverrideValue(values.memberCountOverride, region.membersByRegion);
    const companionProfit =
      (region.companionPriceByRegion - region.courseCostByRegion) * companionCount;
    const memberProfit =
      (region.memberPriceByRegion - region.courseCostByRegion) * memberCount;

    return companionProfit + memberProfit;
  },

  yearRoundingRevenue: ({ scenario, yearIndex, values = {} }) =>
    sumValues(
      scenario.regions,
      (region) =>
        formulaRegistry.regionMarginPerRoundValue({ scenario, region, values }) *
        region.roundLimitByRegion *
        getYearUsageRate({ scenario, region, yearIndex, values }),
    ),

  yearRevenue: ({ values = {} }) =>
    values.enrollFeeThisYear +
    values.annualFeeRevenue * values.prevSurviving +
    values.annualFixedProfit * values.prevSurviving +
    values.yearRoundingRevenue * values.prevSurviving -
    values.refundCost,

  yearFixedProfitValue: ({ values = {} }) =>
    values.enrollFeeThisYear +
    values.annualFeeRevenue * values.prevSurviving +
    values.annualFixedProfit * values.prevSurviving -
    values.refundCost,

  sensitivityLtv: ({ scenario, usage, values = {} }) => {
    const evaluateFormula = (key, extra = {}) =>
      formulaRegistry[key]?.({ scenario, usage, ...extra });

    return buildYearlySeries({
      scenario,
      evaluateFormula,
      values,
    }).cumulativeLtv;
  },
};

