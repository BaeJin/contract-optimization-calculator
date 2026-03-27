# Input/BEP Registry Wording Guide

## 목적

이 문서는 `simulator/registry.js`에서 이미 수기 교정된 정보 입력과 BEP 분석 변수만을 기준으로, 라벨과 tip의 공통 문체를 다시 추출한 기준서입니다. LTV 분석 메타는 이 두 영역에서 확인된 패턴만 선택적으로 반영합니다.

## 분석 범위

- 정보 입력 탭 직접 노출 변수
  - `salePrice`
  - `annualFee`
  - `annualFixedProfit`
  - `contractYears`
  - `yearlyChurnRate`
  - `yearlyRefundAmount`
  - `roundLimitByRegion`
  - `yearlyUsageRateByRegion`
  - `courseCostByRegion`
  - `memberPriceByRegion`
  - `membersByRegion`
  - `companionPriceByRegion`
  - `companionsByRegion`
  - `publicPriceByRegion`
- BEP 분석 탭 직접 노출 변수
  - `weightedUsageRate`
  - `avgUsageRateByRegion`
  - `weightedCourseCost`
  - `weightedMemberPrice`
  - `weightedMembers`
  - `weightedCompanionPrice`
  - `weightedCompanions`
  - `weightedPeoplePerRound`
  - `totalActualRounds`
  - `weightedMarginPerRound`
  - `weightedMemberProfit`
  - `weightedCompanionProfit`
  - `weightedSavingPerRound`
  - `weightedMemberSaving`
  - `weightedCompanionSaving`
  - `totalAnnualRounding`
  - `totalAnnualSaving`
  - `naiveFixedProfit`
  - `companyBEP`
  - `customerBEP`
  - `naiveCustomerFixedCost`

## 라벨 문체 규칙

- 라벨은 짧은 명사형으로 유지합니다.
- 표시 축은 라벨 앞에서 먼저 밝힙니다.
- 자주 쓰는 축 표기는 `연간`, `연 평균`, `만기`, `총`, `평균`, `합계`를 우선 사용합니다.
- 대상 명칭은 일관되게 유지합니다.
- `고객` 대신 `회원`, `분양금` 대신 `분양가`, `해지금` 대신 `환불금`처럼 이미 교정된 표현을 우선 사용합니다.
- 같은 개념은 탭이 달라도 같은 단어를 유지합니다.
- 값의 범위나 집계 축이 다르면 라벨에도 그 차이를 드러냅니다.
- 입력값 라벨은 계산식 설명보다 입력 대상 자체를 우선 드러냅니다.
- BEP 라벨은 `회사`, `회원`, `라운딩당`, `연간`, `만기`처럼 관점과 축을 먼저 밝히는 경향이 강합니다.

## Tip 문체 규칙

- tip은 설명형 한 문장으로 작성합니다.
- 핵심은 의도 또는 산출 방법을 오해하지 않도록, 짧고 바로 이해되는 표현을 쓰는 것입니다.
- 문장 종결은 `입니다`체로 고정하지 않습니다.
- 계산 항목이 여러 개면 포함 항목과 집계 축을 함께 적습니다.
- `기대`, `연 평균`, `만기`, `계약기간`, `합계` 같은 집계 축 용어를 tip에도 동일하게 유지합니다.
- 매출과 비용은 혼용하지 않고, 양수와 음수 분리 기준이 있으면 문장에 직접 적습니다.
- 불필요한 구어체나 축약형 대신 계산 기준이 드러나는 표현을 사용합니다.
- 입력 tip은 `무엇을 입력하는 값인지`를 설명합니다.
- BEP tip은 `무엇을 기준으로 계산된 결과인지`를 설명합니다.
- 기준 문체는 현재 BEP 분석 카드 tip 수준의 짧고 간명한 설명입니다.

## 용어 기준

- `회원권 분양가`: 초기 판매 가격
- `연회비`: 회원이 매년 납부하는 recurring fee
- `기타 고정 손익`: 라운딩 여부와 무관한 반복 손익
- `회원`: customer 계열 표현의 기본 용어
- `손익`: 회사 기준의 company-side 표현
- `비용`: 회사 기준의 negative-side 표현
- `절감액`: 회원 기준 benefit 표현
- `잔존율`: 해지 이후 남아 있는 회원 비율

## 정보 입력에서 확인되는 공통점

- 입력 라벨은 대부분 계산 결과가 아니라 원천 입력 항목명 자체를 사용합니다.
- 입력 라벨은 단위를 라벨에 섞지 않고 `unit` 슬롯으로 분리합니다.
- tip은 입력 주체와 시점을 먼저 밝힙니다.
- `연간`, `각 연도 종료 시점`, `1인당`, `라운딩당`처럼 시간 축과 기준 단위를 분명히 적습니다.
- 입력값 중 예측치 성격이 강한 값은 `sticker`에서 `예측치`로 보조 표현합니다.

## BEP 분석에서 확인되는 공통점

- 결과 라벨은 관점이 다른 두 주체를 분리합니다.
  - 회사 기준: `회사 BEP`, `라운딩당 평균 손익`, `만기 고정 손익`
  - 회원 기준: `회원 BEP`, `회원 연간 절감액`, `라운딩당 회원 절감액`
- 평균값은 `평균`, 총량은 `총` 또는 `합계`, 계약 종료 기준은 `만기`로 구분합니다.
- `손익`과 `절감액`을 구분해 회사 관점과 회원 관점을 혼동하지 않습니다.
- 라운딩 기준 값은 `라운딩당`, 연 단위 값은 `연간`, 계약 전체 기준 값은 `만기` 또는 `총`으로 구분합니다.
- tip은 산식 전체를 장황하게 쓰기보다 계산 기준만 짧게 적습니다.

## LTV 분석 반영 기준

- 정보 입력과 BEP에서 반복되는 축 표기 방식인 `연 평균`, `만기`, `회원`, `손익`, `비용`, `잔존율`을 우선 사용합니다.
- LTV처럼 입력/BEP에 없는 고유 지표는 기존 약어를 유지하되, tip에서만 계산 축을 보완합니다.
- 기대값 기반 지표는 라벨보다 tip에서 기대 산식과 계약기간 기준을 설명합니다.
- BEP에서 `손익`과 `절감액`의 관점 분리가 강하므로, LTV에서는 회사 관점 금액을 `매출/비용/손익`으로 일관되게 유지합니다.

## LTV 분석 적용 결과

- `ltv`: `LTV`
- `avgAnnualVariableProfit`: `연 평균 변동 손익`
- `avgAnnualVariableRevenue`: `연 평균 매출`
- `avgAnnualVariableCost`: `연 평균 비용`
- `expectedEnrollProfit`: `회원권 분양 기대 손익`
- `expectedMaturitySurvivingRate`: `만기 회원 기대 잔존율`

## 작성 체크리스트

- 라벨만 봐도 집계 축이 드러나는가
- tip 한 문장만 읽어도 계산 범위가 이해되는가
- 같은 개념이 다른 탭에서 다른 단어로 보이지 않는가
- `회원`, `손익`, `비용`, `절감액`, `잔존율` 같은 핵심 용어가 일관적인가
- 총계와 연평균, 기대값과 실적값이 혼동되지 않는가
