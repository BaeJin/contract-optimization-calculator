function makeRegion(id, name, overrides = {}) {
  return {
    id,
    name,
    roundLimitByRegion: 40,
    courseCostByRegion: 5.9,
    membersByRegion: 1,
    memberPriceByRegion: 0,
    companionPriceByRegion: 6.9,
    publicPriceByRegion: 7.9,
    companionsByRegion: 2,
    ...overrides,
  };
}

function defaultScenarios() {
  return [
    {
      name: '시그니처 멤버십',
      salePrice: 1890,
      annualFee: 120,
      annualFixedProfit: 18,
      contractYears: 5,
      yearlyChurnRate: 6,
      churnByYear: [4, 5, 6, 7, 8],
      yearlyRefundAmount: 260,
      refundAmountByYear: [420, 340, 260, 180, 120],
      regions: [
        makeRegion('R1000000000001', '도심 프리미엄', {
          roundLimitByRegion: 18,
          courseCostByRegion: 17.8,
          membersByRegion: 1.8,
          memberPriceByRegion: 11.4,
          companionPriceByRegion: 18.9,
          publicPriceByRegion: 22.6,
          companionsByRegion: 1.7,
        }),
        makeRegion('R1000000000002', '리조트 이스트', {
          roundLimitByRegion: 14,
          courseCostByRegion: 14.6,
          membersByRegion: 2,
          memberPriceByRegion: 9.8,
          companionPriceByRegion: 15.8,
          publicPriceByRegion: 18.7,
          companionsByRegion: 1.9,
        }),
        makeRegion('R1000000000003', '밸리 셀렉트', {
          roundLimitByRegion: 16,
          courseCostByRegion: 12.9,
          membersByRegion: 2.1,
          memberPriceByRegion: 8.7,
          companionPriceByRegion: 14.2,
          publicPriceByRegion: 16.8,
          companionsByRegion: 2.2,
        }),
        makeRegion('R1000000000004', '오션 링크스', {
          roundLimitByRegion: 10,
          courseCostByRegion: 21.5,
          membersByRegion: 1.6,
          memberPriceByRegion: 12.4,
          companionPriceByRegion: 23.6,
          publicPriceByRegion: 27.4,
          companionsByRegion: 1.4,
        }),
      ],
      usageByRegion: {
        R1000000000001: [68, 64, 60, 57, 54],
        R1000000000002: [62, 60, 58, 55, 52],
        R1000000000003: [74, 70, 67, 64, 60],
        R1000000000004: [55, 52, 48, 46, 42],
      },
    },
    {
      name: '그로스 라운드형',
      salePrice: 690,
      annualFee: 48,
      annualFixedProfit: -12,
      contractYears: 5,
      yearlyChurnRate: 9,
      churnByYear: [6, 8, 9, 11, 12],
      yearlyRefundAmount: 90,
      refundAmountByYear: [180, 140, 100, 70, 40],
      regions: [
        makeRegion('S1000000000001', '메트로 위크데이', {
          roundLimitByRegion: 42,
          courseCostByRegion: 6.1,
          memberPriceByRegion: 4.2,
          companionPriceByRegion: 7.1,
          publicPriceByRegion: 8.3,
          companionsByRegion: 1.8,
        }),
        makeRegion('S1000000000002', '서부 레이크', {
          roundLimitByRegion: 28,
          courseCostByRegion: 7.6,
          memberPriceByRegion: 5.1,
          companionPriceByRegion: 8.6,
          publicPriceByRegion: 10.1,
          companionsByRegion: 2,
        }),
        makeRegion('S1000000000003', '남부 필드', {
          roundLimitByRegion: 24,
          courseCostByRegion: 5.8,
          memberPriceByRegion: 4.1,
          companionPriceByRegion: 6.8,
          publicPriceByRegion: 8.1,
          companionsByRegion: 2.1,
        }),
        makeRegion('S1000000000004', '아일랜드 코스트', {
          roundLimitByRegion: 12,
          courseCostByRegion: 10.9,
          memberPriceByRegion: 7.4,
          companionPriceByRegion: 12.2,
          publicPriceByRegion: 14.4,
          companionsByRegion: 1.4,
        }),
      ],
      usageByRegion: {
        S1000000000001: [78, 74, 71, 68, 64],
        S1000000000002: [72, 69, 66, 63, 60],
        S1000000000003: [80, 77, 74, 70, 67],
        S1000000000004: [58, 55, 52, 49, 46],
      },
    },
    {
      name: '프레스티지 셀렉트',
      salePrice: 1290,
      annualFee: 84,
      annualFixedProfit: 9,
      contractYears: 5,
      yearlyChurnRate: 5,
      churnByYear: [3, 4, 5, 6, 7],
      yearlyRefundAmount: 150,
      refundAmountByYear: [260, 220, 160, 120, 80],
      regions: [
        makeRegion('G1000000000001', '프라임 시티', {
          roundLimitByRegion: 54,
          courseCostByRegion: 9.4,
          membersByRegion: 1.4,
          memberPriceByRegion: 6.3,
          companionPriceByRegion: 10.8,
          publicPriceByRegion: 12.6,
          companionsByRegion: 0.8,
        }),
        makeRegion('G1000000000002', '헤리티지 힐', {
          roundLimitByRegion: 26,
          courseCostByRegion: 11.6,
          membersByRegion: 1.3,
          memberPriceByRegion: 7.2,
          companionPriceByRegion: 12.8,
          publicPriceByRegion: 14.9,
          companionsByRegion: 0.9,
        }),
        makeRegion('G1000000000003', '가든 루프', {
          roundLimitByRegion: 22,
          courseCostByRegion: 8.1,
          membersByRegion: 1.5,
          memberPriceByRegion: 5.7,
          companionPriceByRegion: 9.5,
          publicPriceByRegion: 11.3,
          companionsByRegion: 0.7,
        }),
        makeRegion('G1000000000004', '클리프 포인트', {
          roundLimitByRegion: 18,
          courseCostByRegion: 13.8,
          membersByRegion: 1.2,
          memberPriceByRegion: 8.5,
          companionPriceByRegion: 15.1,
          publicPriceByRegion: 17.8,
          companionsByRegion: 0.6,
        }),
      ],
      usageByRegion: {
        G1000000000001: [76, 74, 71, 69, 66],
        G1000000000002: [68, 66, 64, 61, 58],
        G1000000000003: [72, 70, 67, 64, 61],
        G1000000000004: [60, 58, 55, 52, 48],
      },
    },
  ];
}

function defaultUsageForYears(length) {
  const baseValues = [100, 95, 85, 75, 65];

  return Array.from(
    { length },
    (_, index) =>
      baseValues[index] ??
      Math.max(40, baseValues[baseValues.length - 1] - (index - baseValues.length + 1) * 5),
  );
}

function defaultValuesForYears(length, baseValue = 0) {
  return Array.from({ length }, () => baseValue);
}

function ensureUsage(scenario) {
  const length = scenario.contractYears;
  const usageByRegion = { ...scenario.usageByRegion };

  scenario.regions.forEach((region) => {
    if (!usageByRegion[region.id] || usageByRegion[region.id].length !== length) {
      const previousValues = usageByRegion[region.id] || [];
      const baseValues = defaultUsageForYears(length);

      usageByRegion[region.id] = Array.from(
        { length },
        (_, index) => previousValues[index] ?? baseValues[index],
      );
    }
  });

  Object.keys(usageByRegion).forEach((regionId) => {
    if (!scenario.regions.find((region) => region.id === regionId)) {
      delete usageByRegion[regionId];
    }
  });

  return usageByRegion;
}

function ensureChurn(scenario) {
  const length = scenario.contractYears;
  const previousValues = Array.isArray(scenario.churnByYear) ? scenario.churnByYear : [];
  const baseValue = Number(scenario.yearlyChurnRate || 0);

  return Array.from(
    { length },
    (_, index) => previousValues[index] ?? defaultValuesForYears(length, baseValue)[index],
  );
}

function ensureRefundAmount(scenario) {
  const length = scenario.contractYears;
  const previousValues = Array.isArray(scenario.refundAmountByYear)
    ? scenario.refundAmountByYear
    : [];
  const baseValue = Number(scenario.yearlyRefundAmount || 0);

  return Array.from(
    { length },
    (_, index) => previousValues[index] ?? defaultValuesForYears(length, baseValue)[index],
  );
}

export {
  defaultScenarios,
  ensureChurn,
  ensureRefundAmount,
  ensureUsage,
  makeRegion,
};
