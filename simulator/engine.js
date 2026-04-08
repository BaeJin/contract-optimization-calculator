import { V } from './registry.js';
import { ensureChurn, ensureRefundAmount, ensureUsage } from './scenario.js';

function buildSensitivitySeries(evaluateFormula, points, buildRateLabel, buildOverrides) {
  return points.map((point) => ({
    rate: buildRateLabel(point),
    ltv: Math.round(evaluateFormula('sensitivityLtv', { values: buildOverrides(point) })),
  }));
}

function calculate(scenario) {
  const normalizedScenario = {
    ...scenario,
    usageByRegion: ensureUsage(scenario),
    churnByYear: ensureChurn(scenario),
    refundAmountByYear: ensureRefundAmount(scenario),
  };

  const baseContext = {
    scenario: normalizedScenario,
    usage: normalizedScenario.usageByRegion,
  };
  const evaluateFormula = (key, extra = {}) => V[key]?.formula?.({ ...baseContext, ...extra });
  const { regions } = normalizedScenario;

  const sumRoundLimit = evaluateFormula('totalRoundLimit');
  const regionData = {};

  regions.forEach((region) => {
    regionData[region.id] = {
      companionProfitPer1: region.companionPriceByRegion - region.courseCostByRegion,
      avgCompanions: region.companionsByRegion,
      companionProfitByRegion: evaluateFormula('companionProfitByRegion', { region }),
      memberSubsidy: -evaluateFormula('memberProfitByRegion', { region }),
      memberProfitByRegion: evaluateFormula('memberProfitByRegion', { region }),
      marginPerRoundByRegion: evaluateFormula('marginPerRoundByRegion', { region }),
      actualRoundsByRegion: evaluateFormula('actualRoundsByRegion', { region }),
      avgUsageRate: evaluateFormula('avgUsageRateByRegion', { region }),
      annualRoundingByRegion: evaluateFormula('annualRoundingByRegion', { region }),
      savingPerRoundByRegion: evaluateFormula('savingPerRoundByRegion', { region }),
      memberSavingByRegion: evaluateFormula('memberSavingByRegion', { region }),
      companionSavingByRegion: evaluateFormula('companionSavingByRegion', { region }),
    };
  });

  const sumActualRounds = evaluateFormula('totalActualRounds');
  const wMargin = evaluateFormula('weightedMarginPerRound');
  const wCompanionProfitTotal = evaluateFormula('weightedCompanionProfit');
  const wMemberSubsidy = -evaluateFormula('weightedMemberProfit');
  const wSaving = evaluateFormula('weightedSavingPerRound');
  const roundingRevenue = evaluateFormula('totalAnnualRounding');
  const enrollFeeAnnual = evaluateFormula('enrollFeeAnnualValue');
  const annualFeeRevenue = evaluateFormula('annualFeeRevenueValue');
  const annualFixedProfit = evaluateFormula('annualFixedProfitValue');
  const annualTotal = evaluateFormula('annualTotalValue', {
    values: { enrollFeeAnnual, annualFeeRevenue, annualFixedProfit, roundingRevenue },
  });
  const totalExpectedAnnualFeeRevenue = evaluateFormula('totalExpectedAnnualFeeRevenue');
  const totalExpectedPositiveAnnualFixedProfit = evaluateFormula(
    'totalExpectedPositiveAnnualFixedProfit',
  );
  const totalExpectedNegativeAnnualFixedCost = evaluateFormula(
    'totalExpectedNegativeAnnualFixedCost',
  );
  const totalExpectedRoundingRevenue = evaluateFormula('totalExpectedRoundingRevenue');
  const totalExpectedRoundingCost = evaluateFormula('totalExpectedRoundingCost');
  const totalExpectedVariableRevenue = evaluateFormula('totalExpectedVariableRevenue', {
    values: {
      totalExpectedAnnualFeeRevenue,
      totalExpectedPositiveAnnualFixedProfit,
      totalExpectedRoundingRevenue,
    },
  });
  const totalExpectedVariableCost = evaluateFormula('totalExpectedVariableCost', {
    values: {
      totalExpectedNegativeAnnualFixedCost,
      totalExpectedRoundingCost,
    },
  });
  const avgAnnualVariableRevenueWithTotals = evaluateFormula('avgAnnualVariableRevenue', {
    values: { totalExpectedVariableRevenue },
  });
  const avgAnnualVariableCost = evaluateFormula('avgAnnualVariableCost', {
    values: { totalExpectedVariableCost },
  });
  const avgAnnualVariableProfit = evaluateFormula('avgAnnualVariableProfit', {
    values: {
      avgAnnualVariableRevenue: avgAnnualVariableRevenueWithTotals,
      avgAnnualVariableCost,
    },
  });
  const totalExpectedRefundCost = evaluateFormula('totalExpectedRefundCost');
  const avgChurnRate = evaluateFormula('avgChurnRate');
  const avgRefundAmount = evaluateFormula('avgRefundAmount');

  const years = [];
  // This is the prior year's survivingByYear. Year 1 always starts at 100%.
  let previousSurviving = 1;
  let cumulativeLtv = 0;

  for (let yearIndex = 0; yearIndex < normalizedScenario.contractYears; yearIndex += 1) {
    const churnRate = evaluateFormula('yearChurnRate', { yearIndex });
    const refundAmount = evaluateFormula('yearRefundAmount', { yearIndex });
    const yearRoundingRevenue = evaluateFormula('yearRoundingRevenue', { yearIndex });
    const yearActualRoundsExpected = evaluateFormula('yearActualRoundsExpected', {
      yearIndex,
      values: { prevSurviving: previousSurviving },
    });
    const yearSurvivingStartRate = evaluateFormula('yearSurvivingStartRate', {
      values: { prevSurviving: previousSurviving },
    });
    const yearMemberRevenueExpected = evaluateFormula('yearMemberRevenueExpected', {
      yearIndex,
      values: { prevSurviving: previousSurviving },
    });
    const yearCompanionRevenueExpected = evaluateFormula('yearCompanionRevenueExpected', {
      yearIndex,
      values: { prevSurviving: previousSurviving },
    });
    const yearRoundingRevenueExpected = evaluateFormula('yearRoundingRevenueExpected', {
      values: { yearMemberRevenueExpected, yearCompanionRevenueExpected },
    });
    const yearRoundingCostExpected = evaluateFormula('yearRoundingCostExpected', {
      yearIndex,
      values: { prevSurviving: previousSurviving },
    });
    const usageRate = evaluateFormula('yearWeightedUsageRate', { yearIndex });
    const enrollFeeThisYear = evaluateFormula('yearEnrollFee', { yearIndex });
    const surviving = evaluateFormula('yearSurvivingEnd', {
      values: { prevSurviving: previousSurviving, churnRate },
    });
    const refundCost = evaluateFormula('yearRefundCost', {
      values: { prevSurviving: previousSurviving, churnRate, refundAmount },
    });
    const yearFixedProfit = evaluateFormula('yearFixedProfitValue', {
      values: {
        enrollFeeThisYear,
        annualFeeRevenue,
        annualFixedProfit,
        prevSurviving: previousSurviving,
        refundCost,
      },
    });
    const yearRevenue = evaluateFormula('yearRevenue', {
      values: {
        enrollFeeThisYear,
        annualFeeRevenue,
        annualFixedProfit,
        yearRoundingRevenue,
        prevSurviving: previousSurviving,
        refundCost,
      },
    });
    const yearVariableProfitExpected = evaluateFormula('yearVariableProfitExpected', {
      values: {
        yearMemberRevenueExpected,
        yearCompanionRevenueExpected,
        annualFixedProfit,
        prevSurviving: previousSurviving,
        yearRoundingCostExpected,
      },
    });
    const yearCashFlowExpected = evaluateFormula('yearCashFlowExpected', {
      values: {
        enrollFeeThisYear,
        annualFeeRevenue,
        prevSurviving: previousSurviving,
        refundCost,
        yearVariableProfitExpected,
      },
    });

    cumulativeLtv += yearRevenue;

    years.push({
      yearByYear: yearIndex + 1,
      yearLabelByYear: `${yearIndex + 1}년차`,
      survivingStartByYear: Math.round(yearSurvivingStartRate * 10) / 10,
      survivingEndByYear: Math.round(surviving * 1000) / 10,
      usageByYear: Math.round(usageRate * 10) / 10,
      enrollFeeByYear: Math.round(enrollFeeThisYear),
      annualFeeRevenueByYear: Math.round(annualFeeRevenue * previousSurviving),
      annualFixedProfitByYear: Math.round(annualFixedProfit * previousSurviving),
      actualRoundsExpectedByYear: Math.round(yearActualRoundsExpected * 10) / 10,
      memberRevenueExpectedByYear: Math.round(yearMemberRevenueExpected),
      companionRevenueExpectedByYear: Math.round(yearCompanionRevenueExpected),
      roundingRevenueExpectedByYear: Math.round(yearRoundingRevenueExpected),
      roundingCostExpectedByYear: Math.round(yearRoundingCostExpected),
      variableProfitExpectedByYear: Math.round(yearVariableProfitExpected),
      cashFlowExpectedByYear: Math.round(yearCashFlowExpected),
      revenueByYear: Math.round(yearRevenue),
      cumulativeLTVByYear: Math.round(cumulativeLtv),
      refundCostByYear: Math.round(refundCost),
      fixedProfitByYear: Math.round(yearFixedProfit),
    });

    previousSurviving = surviving;
  }

  const valueContext = {
    ...baseContext,
    years,
    values: {
      wMargin,
      wSaving,
      sumActualRounds,
    },
  };

  const naiveFixedProfit = V.naiveFixedProfit.formula(valueContext);
  const ltv = V.ltv.formula(valueContext);
  const companyBEP = V.companyBEP.formula(valueContext);
  const customerBEP = V.customerBEP.formula(valueContext);
  const customerBEPAnnual = customerBEP / normalizedScenario.contractYears;
  const customerBEPFeasibility =
    customerBEP > 0
      ? ((sumActualRounds * normalizedScenario.contractYears) / customerBEP) * 100
      : Infinity;
  const avgAnnualProfit = V.avgAnnualProfit.formula({
    ...valueContext,
    values: { ...valueContext.values, ltv },
  });
  const avgAnnualRounds = V.avgAnnualRounds.formula(valueContext);
  const customerNetProfit = V.customerNetProfit.formula(valueContext);
  const naiveCustomerFixedCost = V.naiveCustomerFixedCost.formula(valueContext);
  const expectedEnrollProfit = evaluateFormula('expectedEnrollProfit', {
    values: { totalExpectedRefundCost },
  });
  const expectedMaturitySurvivingRate = V.expectedMaturitySurvivingRate.formula({
    ...valueContext,
    years,
  });

  return {
    regionData,
    wMargin,
    wCompanionProfitTotal,
    wMemberSubsidy,
    sumRoundLimit,
    sumActualRounds,
    wSaving,
    enrollFeeAnnual,
    annualFeeRevenue,
    annualFixedProfit,
    roundingRevenue,
    annualTotal,
    totalExpectedAnnualFeeRevenue,
    totalExpectedPositiveAnnualFixedProfit,
    totalExpectedNegativeAnnualFixedCost,
    totalExpectedRoundingRevenue,
    totalExpectedRoundingCost,
    totalExpectedVariableRevenue,
    totalExpectedVariableCost,
    totalExpectedRefundCost,
    avgAnnualVariableRevenue: avgAnnualVariableRevenueWithTotals,
    avgAnnualVariableCost,
    avgAnnualVariableProfit,
    years,
    avgChurnRate,
    avgRefundAmount,
    ltv,
    companyBEP,
    naiveCustomerFixedCost,
    customerBEP,
    customerBEPAnnual,
    customerBEPFeasibility,
    avgAnnualProfit,
    avgAnnualRounds,
    customerNetProfit,
    naiveFixedProfit,
    expectedEnrollProfit,
    expectedMaturitySurvivingRate,
    companionSensitivity: buildSensitivitySeries(
      evaluateFormula,
      [0, 0.5, 1, 1.5, 2, 2.5, 3],
      (value) => `${value}명`,
      (value) => ({ companionCountOverride: value }),
    ),
    usageSensitivity: buildSensitivitySeries(
      evaluateFormula,
      [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      (value) => `${value}%`,
      (value) => ({ usageRateOverride: value / 100 }),
    ),
    membersSensitivity: buildSensitivitySeries(
      evaluateFormula,
      [1, 1.5, 2, 2.5, 3, 3.5, 4],
      (value) => `${value}명`,
      (value) => ({ memberCountOverride: value }),
    ),
  };
}

export { calculate };
