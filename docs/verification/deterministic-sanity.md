# Deterministic sanity scenario manual verification

목적: 계산 로직이 수기 계산과 일치하는지 빠르게 검증하는 기준 시나리오.

## Scenario

- salePrice = 100
- annualFee = 10
- annualFixedProfit = 5
- contractYears = 2
- churn = 0%
- refund = 0
- region count = 1
- roundLimit = 10
- memberPrice = 7
- companionPrice = 6
- courseCost = 5
- members = 1
- companions = 1
- usage = 100%

## Per-round math

- member profit = (7 - 5) × 1 = 2
- companion profit = (6 - 5) × 1 = 1
- margin per round = 3
- member saving = (9 - 7) × 1 = 2
- companion saving = (9 - 6) × 1 = 3
- saving per round = 5

## Annual math

- actual rounds = 10 × 100% = 10
- annual rounding profit = 3 × 10 = 30
- annual total (year 1 style) = salePrice 100 + annualFee 10 + annualFixedProfit 5 + rounding 30 = 145

## Year-by-year revenue

### Year 1
- enroll fee = 100
- annual fee = 10
- annual fixed profit = 5
- rounding profit = 30
- refund = 0
- revenue = 145

### Year 2
- enroll fee = 0
- annual fee = 10
- annual fixed profit = 5
- rounding profit = 30
- refund = 0
- revenue = 45

## Final outputs

- LTV = 145 + 45 = 190
- avgAnnualProfit = 190 / 2 = 95
- customer fixed cost = 100 + (10 × 2) = 120
- customer BEP = ceil(120 / 5) = 24
- company BEP = null (round margin is positive)
- maturity surviving rate = 100%

## Why this matters

이 시나리오는 churn/refund/region weighting이 모두 제거되어 있어서,
핵심 공식이 조금만 틀어져도 바로 숫자가 어긋난다.
