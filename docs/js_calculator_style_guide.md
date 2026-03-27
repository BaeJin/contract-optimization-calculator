# JS/JSX 웹서비스용 코드 스타일 & 컨벤션 가이드

## 목적
이 문서는 **JS/JSX 기반의 간단한 웹서비스**를 만들 때, 특히 **계산기형 서비스**처럼 수많은 변수의 `label`, `unit`, `format`, `formula`, `defaultValue`, `validation` 등을 **한 곳에서 일관되게 관리**해야 하는 상황을 위한 실무형 코드 스타일 가이드입니다.

핵심 목표는 다음 3가지입니다.

1. **유명하고 검증된 스타일**을 기반으로 한다.
2. **심플해서 팀이 바로 적용 가능**해야 한다.
3. **유지보수성**이 높아야 한다.

---

## 최종 추천안

가장 추천하는 조합은 아래입니다.

- **코드 스타일 기준:** Airbnb JavaScript Style Guide
- **자동 포맷팅:** Prettier
- **정적 검사:** ESLint (flat config)
- **UI 설계 원칙:** React 컴포넌트는 최대한 pure 하게 유지
- **프로젝트 구조 원칙:** feature 기반 + 계산 로직은 domain 모듈 분리

이 조합을 추천하는 이유는 다음과 같습니다.

- Airbnb 스타일 가이드는 JavaScript 커뮤니티에서 가장 널리 알려진 스타일 가이드 중 하나입니다.
- Prettier는 포맷팅 논쟁을 줄이고 자동 정렬을 강제하기 좋습니다.
- ESLint는 규칙 위반과 잠재 버그를 조기에 잡아줍니다.
- React 공식 문서는 컴포넌트를 pure 하게 유지하라고 권장하며, 계산 로직을 UI에서 분리하는 설계와 잘 맞습니다.

즉, **"스타일은 Airbnb + 포맷은 Prettier + 품질은 ESLint + 계산은 순수 함수 + 메타데이터는 중앙 registry"** 조합이 가장 무난하고 강력합니다.

---

## 이 프로젝트에 맞는 핵심 설계 원칙

### 1) 계산 관련 메타데이터는 한 모듈에서 관리한다
변수 정의가 여러 컴포넌트에 흩어지면 유지보수가 급격히 어려워집니다.
따라서 아래 정보는 한 곳에서 선언적으로 관리합니다.

- 변수 key
- label
- 단위(unit)
- 입력 타입(number, percent 등)
- 포맷터(format)
- 기본값(defaultValue)
- 검증(validation)
- 계산식(formula)
- 설명(description)
- 노출 여부(hidden)
- 입력 가능 여부(readonly)

이 원칙의 핵심은 **UI에서 계산 규칙을 직접 들고 있지 않게 만드는 것**입니다.

---

### 2) 계산식은 반드시 pure function 으로 분리한다
계산 로직은 JSX 안에 직접 쓰지 않습니다.

좋은 예:

```js
export function calcMonthlyPayment({ principal, rate, months }) {
  if (!months) return 0;
  return (principal * (1 + rate)) / months;
}
```

나쁜 예:

```jsx
const value = principal && months ? (principal * (1 + rate)) / months : 0;
```

이유:

- 테스트가 쉬워집니다.
- 계산식 변경 영향 범위를 좁힐 수 있습니다.
- UI와 비즈니스 로직이 분리됩니다.

---

### 3) UI는 registry를 읽어서 렌더링만 한다
컴포넌트는 다음 역할만 담당합니다.

- 어떤 필드를 보여줄지
- 어떤 입력 컴포넌트를 쓸지
- 현재 state를 어떻게 표시할지
- 계산 결과를 어디에 렌더링할지

즉, **정책은 domain**, **표현은 ui**로 분리합니다.

---

## 권장 폴더 구조

```txt
src/
  app/
    App.jsx
    routes.js

  pages/
    CalculatorPage/
      CalculatorPage.jsx
      CalculatorPage.test.js

  features/
    calculator/
      components/
        InputField.jsx
        ResultCard.jsx
        SectionPanel.jsx
      hooks/
        useCalculatorState.js
      utils/
        normalizeInput.js

  domain/
    calculator/
      variableRegistry.js
      formulas.js
      formatters.js
      validators.js
      selectors.js
      constants.js
      types.js

  shared/
    components/
    utils/
    constants/
```

### 구조 원칙

- `pages`: 화면 단위
- `features`: 사용자 기능 단위 UI 조합
- `domain`: 계산 규칙, 산식, 변수 메타데이터
- `shared`: 공통 요소

계산기 서비스에서는 **domain 분리**가 가장 중요합니다.

---

## 중앙 registry 설계 규칙

`variableRegistry.js` 한 파일 또는 관련 모듈 묶음에서 모든 변수 정의를 관리합니다.

예시:

```js
import { formatCurrency, formatPercent } from './formatters';
import { required, min } from './validators';
import { calcMonthlyPayment, calcLtv } from './formulas';

export const VARIABLE_KEYS = {
  HOUSE_PRICE: 'housePrice',
  LOAN_AMOUNT: 'loanAmount',
  INTEREST_RATE: 'interestRate',
  LOAN_MONTHS: 'loanMonths',
  MONTHLY_PAYMENT: 'monthlyPayment',
  LTV: 'ltv',
};

export const variableRegistry = {
  [VARIABLE_KEYS.HOUSE_PRICE]: {
    key: VARIABLE_KEYS.HOUSE_PRICE,
    label: '주택 가격',
    unit: 'KRW',
    inputType: 'currency',
    defaultValue: 0,
    format: formatCurrency,
    validate: [required(), min(0)],
    readonly: false,
    description: '총 매입 금액',
  },
  [VARIABLE_KEYS.INTEREST_RATE]: {
    key: VARIABLE_KEYS.INTEREST_RATE,
    label: '금리',
    unit: '%',
    inputType: 'percent',
    defaultValue: 0.04,
    format: formatPercent,
    validate: [required(), min(0)],
    readonly: false,
    description: '연 이자율',
  },
  [VARIABLE_KEYS.MONTHLY_PAYMENT]: {
    key: VARIABLE_KEYS.MONTHLY_PAYMENT,
    label: '월 상환액',
    unit: 'KRW',
    inputType: 'computed',
    format: formatCurrency,
    readonly: true,
    formula: calcMonthlyPayment,
    dependsOn: [
      VARIABLE_KEYS.LOAN_AMOUNT,
      VARIABLE_KEYS.INTEREST_RATE,
      VARIABLE_KEYS.LOAN_MONTHS,
    ],
  },
  [VARIABLE_KEYS.LTV]: {
    key: VARIABLE_KEYS.LTV,
    label: 'LTV',
    unit: '%',
    inputType: 'computed',
    format: formatPercent,
    readonly: true,
    formula: calcLtv,
    dependsOn: [VARIABLE_KEYS.LOAN_AMOUNT, VARIABLE_KEYS.HOUSE_PRICE],
  },
};
```

### registry 필드 표준

각 변수 객체는 가능한 한 아래 필드를 동일하게 유지합니다.

```js
{
  key: 'loanAmount',
  label: '대출금',
  description: '설명',
  unit: 'KRW',
  inputType: 'currency',
  defaultValue: 0,
  format: formatCurrency,
  parse: parseCurrency,
  validate: [required(), min(0)],
  formula: null,
  dependsOn: [],
  readonly: false,
  hidden: false,
  group: 'loan',
  order: 1,
}
```

### registry 규칙

- key는 **camelCase**
- 상수 key 맵은 **UPPER_SNAKE_CASE**
- formula는 반드시 함수 참조
- dependsOn은 문자열 literal 대신 상수 key 사용
- format/parse/validate는 registry 밖의 별도 모듈 함수 사용
- UI 문구(label, description)는 registry에만 둠

---

## 네이밍 컨벤션

### 파일명
- React 컴포넌트: `PascalCase.jsx`
- 훅: `useSomething.js`
- 일반 유틸/도메인 모듈: `camelCase.js`
- 상수 모듈: `constants.js` 또는 도메인 성격이 명확하면 `variableKeys.js`

예시:

```txt
CalculatorPage.jsx
InputField.jsx
useCalculatorState.js
variableRegistry.js
formatters.js
formulas.js
validators.js
```

### 변수명
- 일반 변수: `camelCase`
- boolean: `is`, `has`, `can`, `should` 접두어 사용
- 상수: `UPPER_SNAKE_CASE`
- 이벤트 핸들러: `handleChange`, `handleSubmit`
- selector: `selectVisibleFields`, `selectComputedResults`

좋은 예:

```js
const loanAmount = 300000000;
const isReadonly = true;
const hasError = false;
const DEFAULT_INTEREST_RATE = 0.04;
```

---

## JSX / React 작성 규칙

### 1) 컴포넌트는 작게 유지한다
한 컴포넌트 파일이 다음 역할을 동시에 가지면 분리합니다.

- 데이터 조회
- 상태 계산
- 레이아웃
- 입력 렌더링
- 결과 렌더링

기준:

- 페이지 컴포넌트: orchestration 중심
- 필드 컴포넌트: 입력/표시 중심
- 계산 로직: domain 중심

### 2) 렌더 중 계산하지 말고 selector/useMemo로 분리한다

좋은 예:

```js
const visibleFields = useMemo(
  () => selectVisibleFields(variableRegistry, values),
  [values],
);
```

### 3) 렌더 함수 안에서 복잡한 if/ternary 중첩을 피한다
조건이 복잡하면 helper 함수나 별도 컴포넌트로 분리합니다.

### 4) state는 입력값 source of truth만 가진다
이미 계산 가능한 값은 state에 중복 저장하지 않습니다.

좋은 예:

- state: `housePrice`, `loanAmount`, `interestRate`
- derived: `ltv`, `monthlyPayment`

---

## 함수 작성 규칙

### 함수는 한 가지 역할만 한다

```js
export function calcLtv({ loanAmount, housePrice }) {
  if (!housePrice) return 0;
  return loanAmount / housePrice;
}
```

### 인자가 3개 이상이면 객체 파라미터를 사용한다

```js
export function calcMonthlyPayment({ principal, annualRate, months }) {
  // ...
}
```

### 함수 이름은 동사 + 목적어 패턴을 우선한다

- `calcLtv`
- `formatCurrency`
- `parsePercent`
- `validateLoanAmount`
- `selectVisibleFields`

---

## 포맷 / 파싱 / 검증 분리 규칙

이 3가지는 절대 JSX 안에 직접 쓰지 않습니다.

### formatters.js

```js
export function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function formatPercent(value) {
  return `${((value ?? 0) * 100).toFixed(2)}%`;
}
```

### validators.js

```js
export function required() {
  return (value) => (value === null || value === undefined || value === ''
    ? '필수 입력입니다.'
    : null);
}

export function min(minValue) {
  return (value) => (Number(value) < minValue
    ? `${minValue} 이상이어야 합니다.`
    : null);
}
```

### 장점
- 재사용 가능
- 테스트 가능
- 로직 위치가 명확함

---

## 스타일 규칙 요약

아래 규칙은 실무적으로 가장 무난합니다.

### 문법 / 표현
- 문자열은 **single quote**
- 세미콜론 사용
- 후행 쉼표 사용
- 들여쓰기는 2 spaces
- 한 줄이 너무 길어지면 자동 줄바꿈은 Prettier에 위임
- `var` 사용 금지, `const` 우선, 필요 시 `let`
- 매직 넘버는 상수화
- 깊은 중첩보다 early return 선호
- 배열/객체 메서드 사용 우선 (`map`, `filter`, `reduce`)

### import 순서
1. 외부 라이브러리
2. 절대 경로 내부 모듈
3. 상대 경로 모듈
4. 스타일 파일

예시:

```js
import React, { useMemo } from 'react';
import clsx from 'clsx';

import { variableRegistry } from '@/domain/calculator/variableRegistry';
import { selectVisibleFields } from '@/domain/calculator/selectors';

import InputField from '../components/InputField';

import './CalculatorPage.css';
```

---

## 권장 ESLint / Prettier 정책

### Prettier 예시

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

`printWidth`는 엄격한 최대 길이 제한이라기보다, Prettier가 줄바꿈을 시도하는 기준값으로 이해하는 것이 맞습니다.

### ESLint 방향
- Airbnb 기반 규칙 사용
- Prettier와 충돌하는 포맷 규칙은 비활성화
- 미사용 변수, shadowing, import cycle, jsx key 누락 등은 강하게 검출

예시 개념:

```js
// eslint.config.js
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-shadow': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'import/order': ['error', {
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      }],
    },
  },
  prettierConfig,
];
```

---

## 계산기형 서비스 전용 컨벤션

### 1) 변수 정의와 계산 정의를 분리한다
작은 프로젝트라도 아래 둘은 최소 분리합니다.

- `variableRegistry.js`: 변수 메타데이터
- `formulas.js`: 순수 계산 함수

### 2) dependsOn을 명시한다
계산 필드가 어떤 입력에 의존하는지 registry에 써둡니다.
이렇게 하면:

- 재계산 타이밍 제어 가능
- 테스트 대상 명확
- 나중에 그래프/자동 문서화 가능

### 3) 숫자/표시 문자열을 섞지 않는다
상태에는 가능한 한 원시 숫자값을 저장합니다.
화면에 그릴 때만 format 합니다.

좋은 예:

- state: `0.035`
- display: `3.50%`

나쁜 예:

- state: `'3.50%'`

### 4) 계산 결과는 derived data로 본다
파생 가능한 값은 입력 state에 넣지 않고 selector 또는 formula 결과로 만듭니다.

### 5) UI hidden 조건도 registry 또는 selector에 모은다
예:

```js
hidden: ({ loanType }) => loanType !== 'mortgage'
```

단, hidden 조건이 복잡해지면 selector로 옮깁니다.

---

## 안티패턴

### 안티패턴 1: JSX 안에 산식 하드코딩
```jsx
<div>{((housePrice - deposit) * rate * 12).toFixed(0)}</div>
```

### 안티패턴 2: label/unit을 컴포넌트마다 중복 선언
```jsx
<label>금리(%)</label>
```

### 안티패턴 3: 포맷된 문자열을 state에 저장
```js
setInterestRate('3.5%');
```

### 안티패턴 4: 한 파일에 화면, 검증, 산식, 포맷, API 호출을 모두 작성

---

## 팀 규칙으로 바로 채택할 수 있는 최소 규칙

팀에 바로 적용하려면 아래 10개만 먼저 고정해도 충분합니다.

1. JS/JSX 스타일은 **Airbnb 계열**로 간다.
2. 포맷은 **Prettier**가 강제한다.
3. 린트는 **ESLint flat config**로 관리한다.
4. 계산식은 **순수 함수**로 분리한다.
5. 변수 메타데이터는 **registry 한 곳**에 둔다.
6. 화면 컴포넌트는 **렌더링 중심**으로 유지한다.
7. state에는 **원시 입력값만 저장**한다.
8. 결과값은 **derived data**로 계산한다.
9. 포맷/파싱/검증은 **별도 모듈**로 분리한다.
10. key, label, unit, dependsOn 네 가지는 반드시 표준 필드로 유지한다.

---

## 최종 결론

이 프로젝트에 가장 적합한 스타일은 다음처럼 정리할 수 있습니다.

> **Airbnb 스타일 가이드를 기본 규범으로 삼고, Prettier + ESLint로 자동 강제하며, 계산기 도메인은 중앙 registry + pure formula + formatter/validator 분리 구조로 설계한다.**

이 방식은 다음 균형이 가장 좋습니다.

- **대중성**: 많은 개발자가 이미 익숙함
- **단순성**: 도입 난도가 낮음
- **유지보수성**: 계산기형 서비스에 특히 강함
- **확장성**: 변수 수가 많아질수록 장점이 커짐

---

## 참고 기준

- Airbnb JavaScript Style Guide
- Prettier Options 문서
- ESLint Configuration / Flat Config 문서
- React 공식 문서: Keeping Components Pure
- React FAQ: feature/route 기준 구조화 예시

