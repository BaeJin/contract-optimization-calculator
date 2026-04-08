function buildYearlySeries({ scenario, evaluateFormula, values = {} }) {
  const years = [];
  let previousSurviving = 1;
  let cumulativeLtv = 0;

  const annualFeeRevenue = evaluateFormula('annualFeeRevenueValue');
  const annualFixedProfit = evaluateFormula('annualFixedProfitValue');

  for (let yearIndex = 0; yearIndex < scenario.contractYears; yearIndex += 1) {
    const churnRate = evaluateFormula('yearChurnRate', { yearIndex, values });
    const refundAmount = evaluateFormula('yearRefundAmount', { yearIndex, values });
    const yearRoundingRevenue = evaluateFormula('yearRoundingRevenue', { yearIndex, values });
    const yearActualRoundsExpected = evaluateFormula('yearActualRoundsExpected', {
      yearIndex,
      values: { ...values, prevSurviving: previousSurviving },
    });
    const yearSurvivingStartRate = evaluateFormula('yearSurvivingStartRate', {
      values: { ...values, prevSurviving: previousSurviving },
    });
    const yearMemberRevenueExpected = evaluateFormula('yearMemberRevenueExpected', {
      yearIndex,
      values: { ...values, prevSurviving: previousSurviving },
    });
    const yearCompanionRevenueExpected = evaluateFormula('yearCompanionRevenueExpected', {
      yearIndex,
      values: { ...values, prevSurviving: previousSurviving },
    });
    const yearRoundingRevenueExpected = evaluateFormula('yearRoundingRevenueExpected', {
      values: { yearMemberRevenueExpected, yearCompanionRevenueExpected },
    });
    const yearRoundingCostExpected = evaluateFormula('yearRoundingCostExpected', {
      yearIndex,
      values: { ...values, prevSurviving: previousSurviving },
    });
    const usageRate = evaluateFormula('yearWeightedUsageRate', { yearIndex, values });
    const enrollFeeThisYear = evaluateFormula('yearEnrollFee', { yearIndex, values });
    const surviving = evaluateFormula('yearSurvivingEnd', {
      values: { ...values, prevSurviving: previousSurviving, churnRate },
    });
    const refundCost = evaluateFormula('yearRefundCost', {
      values: { ...values, prevSurviving: previousSurviving, churnRate, refundAmount },
    });
    const yearFixedProfit = evaluateFormula('yearFixedProfitValue', {
      values: {
        ...values,
        enrollFeeThisYear,
        annualFeeRevenue,
        annualFixedProfit,
        prevSurviving: previousSurviving,
        refundCost,
      },
    });
    const yearRevenue = evaluateFormula('yearRevenue', {
      values: {
        ...values,
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
        ...values,
        yearMemberRevenueExpected,
        yearCompanionRevenueExpected,
        annualFixedProfit,
        prevSurviving: previousSurviving,
        yearRoundingCostExpected,
      },
    });
    const yearCashFlowExpected = evaluateFormula('yearCashFlowExpected', {
      values: {
        ...values,
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

  return { years, cumulativeLtv };
}

export { buildYearlySeries };
