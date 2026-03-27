# Agent Rules

## Encoding

- All text files in this repository must be read and written as UTF-8.
- When creating or editing `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.html`, `.css`, or `.md` files, preserve UTF-8 encoding.
- Do not save Korean text in any legacy encoding such as CP949 or EUC-KR.
- If a file contains broken Korean text, fix the text and resave the file as UTF-8.

## Editing

- Prefer targeted edits that preserve existing encoding and line endings.
- After editing user-facing Korean text, quickly verify that no mojibake strings remain.

## Scope Control

- If the user asks to add or adjust only default scenario data, do not change calculation logic, UI logic, or state logic unless the user explicitly asks for it.
- Keep data-seed changes isolated to scenario/default-value files whenever possible.

## Domain Assumptions

- Churn is treated as year-end only. Members can cancel only at the end of each year.
- `previousSurviving` means the prior year's `survivingByYear`, and year 1 always starts at `100%`.
- Annual fee and rounding revenue are recognized on the year-start surviving base. Refund cost is recognized at year-end.
- `yearlyChurnRate` means the churn rate at each year-end.
- `yearlyRefundAmount` means the per-person lump-sum refund paid when a cancellation happens at each year-end.

## Financial Model

- `annualFee` and `annualFixedProfit` are separate concepts and must not be merged.
- `annualFee` means the customer-paid recurring annual fee.
- `annualFixedProfit` means the company's recurring annual fixed profit or loss that occurs regardless of rounding volume.
- Customer BEP is based only on `salePrice + total annualFee over the contract period`.
- Company BEP is based only on `salePrice + total annualFee over the contract period + total annualFixedProfit over the contract period`.
- For BEP, churn is intentionally ignored unless the user explicitly changes that rule.

## LTV Analysis Metrics

- LTV analysis metrics that use `totalExpected` must be based on year-by-year expected values, not simple average usage shortcuts.
- `totalExpected` means the sum across all contract years after applying that year's usage assumptions and the year-start surviving base.
- `totalExpectedAnnualFeeRevenue` must be the sum of yearly `annualFee * previousSurviving`.
- `totalExpectedPositiveAnnualFixedProfit` must include only the positive portion of `annualFixedProfit`, applied on the yearly surviving base.
- `totalExpectedNegativeAnnualFixedCost` must include only the negative portion of `annualFixedProfit` as a cost, using its absolute value on the yearly surviving base.
- `totalExpectedRoundingRevenue` must be the sum of yearly rounding revenue using that year's usage rate and surviving base.
- `totalExpectedRoundingCost` must be the sum of yearly rounding cost using that year's usage rate and surviving base.
- `totalExpectedVariableRevenue` must equal `totalExpectedAnnualFeeRevenue + totalExpectedPositiveAnnualFixedProfit + totalExpectedRoundingRevenue`.
- `totalExpectedVariableCost` must equal `totalExpectedNegativeAnnualFixedCost + totalExpectedRoundingCost`.
- `avgAnnualVariableRevenue` must equal `totalExpectedVariableRevenue / contractYears`.
- `avgAnnualVariableCost` must equal `totalExpectedVariableCost / contractYears`.
- `avgAnnualVariableProfit` must equal `avgAnnualVariableRevenue - avgAnnualVariableCost`.
- Do not label a metric as `연 평균` if it is actually a contract-total value.
- Do not classify negative `annualFixedProfit` as revenue, and do not classify positive `annualFixedProfit` as cost.

## Labels And Display Text

- `simulator/registry.js` is the single source of truth for metric labels, units, prefixes, suffixes, stickers, and tips.
- For Korean business labels, prefer `매출` instead of `수입`, and prefer `손익` instead of `수익` when standardizing display text.
- Do not introduce or keep a separate hardcoded display-text map that overrides registry labels unless the user explicitly requests a separate override layer.
- When a label appears not to update, check registry-driven rendering first before adding any fallback text.
- In general, prefer extending the source-of-truth layer over patching the UI with hardcoded text or values.
- If a new label, metric, style, or display rule is needed, add or update it in the proper source layer such as variables, formulas, registry metadata, theme tokens, or shared styles.
- Avoid one-off hardcoding in tabs or components when the same behavior should be driven by shared variables, functions, theme, or style definitions.
- Keep aggregation axes explicit and separate. Do not mix total metrics, region metrics, annual metrics, and region-plus-annual metrics under ambiguous names or mismatched labels.
- If a displayed value is a weighted aggregate, use a weighted metric key and weighted registry metadata. If it is a per-region value, use a region metric key. If it is annual or year-by-year, keep that axis in both the variable naming and display metadata.
- Before wiring a metric into a card or table, verify that the value source, variable name, formula scope, and registry label all describe the same aggregation axis.
- Exception for BEP graph rebuild work: newly derived variables and formulas used only inside graph rendering do not need to be added to `simulator/registry.js` or other shared source-of-truth layers for now.
- This exception is limited to graph-only calculations. If a value is later reused in cards, tables, labels, tips, exports, or shared UI/model logic, promote it into the proper shared layer at that time.

## Theme Stability

- Preserve the current simulator theme unless the user explicitly asks for a theme or visual redesign change.
- Avoid incidental changes to colors, typography, spacing, card styling, or overall visual tone while making logic or content updates.
- When a task is not specifically about design, keep the existing theme and visual language as stable as possible.

## Card UI

- Metric cards should use a unified structure:
  - top: label
  - middle: `prefix + value + unit + suffix`
  - bottom: tip
- Do not special-case BEP or other cards by embedding unit or suffix directly into the formatted value when the card can render them in dedicated slots.
- Card text other than the main value must remain readable. Avoid overly muted label, prefix, unit, or suffix styling.
- Keep card tip text style stable unless the user explicitly asks to change it.
- When adding a new card or user-facing metric, first add a proper registry variable and, if needed, a dedicated formula.
- Avoid one-off UI-only calculations for new metrics. New displayed numbers should come from named variables in the model layer whenever practical.
- Exception: graph-only derived values that are not user-facing outside the chart may remain local to the graph implementation during the current BEP graph rebuild.
