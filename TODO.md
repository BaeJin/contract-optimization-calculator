# Tourlinks Calculator TODO

우선순위 기준: P0 > P1 > P2

## P0. 즉시 수정

- [ ] Node ESM import 경로 정리
  - `simulator/**`, `src/**` 내부 상대 import에 `.js` / `.jsx` 확장자 명시
  - 목표: 브라우저 번들러 외 환경에서도 모듈 해석 실패 없게 만들기
  - 검증: `node` 기반 import smoke test 통과

- [ ] 최소 실행 체계 추가
  - `package.json`에 검증용 script 추가
  - 추천
    - `check:imports`: 핵심 모듈 import smoke test
    - `test`: 계산 로직 검증 실행
  - 목표: 깨진 상태를 바로 감지 가능하게 하기

## P1. 높은 우선순위

- [ ] 계산 로직 회귀 테스트 추가
  - 기본 시나리오 기준 주요 결과값 고정 검증
  - 추천 검증 항목
    - `ltv`
    - `companyBEP`
    - `customerBEP`
    - `avgAnnualVariableProfit`
    - `expectedMaturitySurvivingRate`
  - 목표: 수식 수정 시 숫자 깨짐 방지

- [ ] 입력값 범위 보정 강화
  - 이용률: 0~100 clamp
  - 해지율: 0~100 clamp
  - 계약기간: 1~10 유지
  - count / fee / refund 등 음수 허용 여부 정책 명확화
  - 목표: 비정상 입력으로 인한 조용한 오염 방지

- [ ] import JSON sanitization 강화
  - region 내부 숫자 필드 전부 정규화
  - 누락 id/name 보정
  - contractYears 변화에 따른 usage/churn/refund 길이 정합성 보장
  - 목표: 외부 JSON 로드 시 안전성 확보

## P2. 다음 단계

- [ ] 계산 중복 리팩터링
  - `engine.js` 와 `formulas.js` 사이 중복 연산 정리
  - 연차별 계산 파이프라인 공통 함수화 검토

- [ ] 실행 환경 정리
  - Vite 등 실제 프런트엔드 빌드 체계 도입 여부 결정
  - CDN 의존 감소

- [ ] 문구/브랜딩 정리
  - 남아있는 `Contract Optimization Calculator` 문구 정리 여부 검토

## 이번 작업 범위

이번 턴에서는 P0, P1을 우선 처리한다.
