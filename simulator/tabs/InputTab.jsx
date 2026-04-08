import { useEffect, useMemo, useState } from 'react';

import { MAX_REGIONS } from '../constants.js';
import { buildInputDerivedState } from '../selectors.js';
import {
  getUsageEditButtonClass,
  SIMULATOR_STYLES,
  SIMULATOR_TYPOGRAPHY,
} from '../styles.js';
import {
  getDisplayLabel,
  getDisplayMeta,
  getDisplayPrefix,
  getDisplaySticker,
  getDisplayUnit,
} from '../text.js';
import { Tip } from '../ui.jsx';

function getProfitClass(cfmt, value, fallback = SIMULATOR_TYPOGRAPHY.tableNumber) {
  if (cfmt !== 'profit') {
    return fallback;
  }

  if (value > 0) {
    return 'text-cyan-400';
  }

  if (value < 0) {
    return 'text-rose-400';
  }

  return 'text-slate-300';
}

function AggregateValue({ metric, showUnit = false }) {
  if (!metric) {
    return null;
  }

  const displayMeta = getDisplayMeta(metric.key);
  const prefix = displayMeta.prefix ?? metric.prefix;
  const unit = displayMeta.unit ?? metric.unit;

  return (
    <div className='flex items-center justify-center gap-1'>
      {prefix && <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>{prefix}</span>}
      <span className={getProfitClass(metric.cfmt, metric.value)}>{metric.formatted}</span>
      {showUnit && unit && <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>{unit}</span>}
    </div>
  );
}

function BaseInputRow({ labelKey, value, prefix, unit, tip, sticker, onChange, step = 1 }) {
  const [draftValue, setDraftValue] = useState(String(value ?? ''));

  useEffect(() => {
    setDraftValue(String(value ?? ''));
  }, [value]);

  return (
    <tr>
      <td className='px-3 py-3'>
        <div className='flex items-center gap-2'>
          <Tip text={tip}>
            <span
              className={`border-b border-dotted border-slate-600 ${SIMULATOR_TYPOGRAPHY.tableCell}`}
            >
              {labelKey}
            </span>
          </Tip>
          {sticker && <span className={SIMULATOR_STYLES.forecastSticker}>{sticker}</span>}
        </div>
      </td>
      <td className='px-3 py-3 text-center'>
        <div className='grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3'>
          <span className={`min-w-[2.5ch] text-left ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>
            {prefix || ''}
          </span>
          <input
            type='text'
            inputMode='decimal'
            value={draftValue}
            onChange={(event) => {
              const nextValue = event.target.value;

              if (!/^-?\d*\.?\d*$/.test(nextValue)) {
                return;
              }

              setDraftValue(nextValue);

              if (nextValue === '' || nextValue === '-' || nextValue === '.' || nextValue === '-.') {
                return;
              }

              onChange(Number(nextValue));
            }}
            onBlur={() => {
              if (
                draftValue === '' ||
                draftValue === '-' ||
                draftValue === '.' ||
                draftValue === '-.'
              ) {
                setDraftValue(String(value ?? '0'));
              }
            }}
            step={step}
            className={SIMULATOR_STYLES.inputField}
          />
          <span className={`min-w-[3.5ch] text-right ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>
            {unit}
          </span>
        </div>
      </td>
    </tr>
  );
}

function YearSeriesEditor({
  title,
  values,
  bulkValue,
  unitLabel,
  onBulkChange,
  onChangeValue,
  onApplyAll,
  onClose,
}) {
  const actionButtonClass =
    'rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[13px] font-semibold tracking-[0.01em] text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/18 hover:text-white';
  const subtleActionButtonClass =
    'px-2 py-1.5 text-[13px] font-medium tracking-[0.01em] text-slate-300 transition hover:text-cyan-100';

  return (
    <div className='flex flex-wrap items-center gap-3 rounded-[18px] bg-slate-800/40 px-3 py-3'>
      <span className='shrink-0 text-[13px] font-semibold leading-[1.4] tracking-[0.01em] text-cyan-400'>
        {title}
      </span>
      {values.map((value, yearIndex) => (
        <div key={yearIndex} className='flex items-center gap-1'>
          <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>{yearIndex + 1}년차</span>
          <input
            type='number'
            value={value ?? 0}
            onChange={(event) => onChangeValue(yearIndex, Number(event.target.value))}
            step={1}
            className={SIMULATOR_STYLES.yearNumberInput}
          />
        </div>
      ))}
      <span className='mx-1 text-slate-600'>|</span>
      <div className='flex items-center gap-1'>
        <input
          type='number'
          value={bulkValue}
          onChange={(event) => onBulkChange(Number(event.target.value))}
          step={1}
          className={SIMULATOR_STYLES.yearNumberInput}
        />
        {unitLabel && <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>{unitLabel}</span>}
        <button
          onClick={() => onApplyAll(bulkValue)}
          className={`${subtleActionButtonClass} whitespace-nowrap`}
        >
          일괄 적용
        </button>
      </div>
      {onClose && (
        <button
          type='button'
          onClick={onClose}
          className='ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-[20px] leading-none text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200'
          aria-label='닫기'
          title='닫기'
        >
          &times;
        </button>
      )}
    </div>
  );
}

function SeriesSummaryRow({
  label,
  tip,
  sticker,
  metricKey,
  metric,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <>
      <tr>
        <td className='px-3 py-3'>
          <div className='flex items-center gap-2'>
            <Tip text={tip}>
              <span
                className={`border-b border-dotted border-slate-600 ${SIMULATOR_TYPOGRAPHY.tableCell}`}
              >
                {label}
              </span>
            </Tip>
            {sticker && <span className={SIMULATOR_STYLES.forecastSticker}>{sticker}</span>}
          </div>
        </td>
        <td className='px-3 py-3'>
          <div className='flex items-center justify-end gap-1.5'>
            <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>
              {getDisplayPrefix(metricKey, metric.prefix)}
            </span>
            <span className={SIMULATOR_TYPOGRAPHY.tableNumber}>{metric.formatted}</span>
            <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>
              {getDisplayUnit(metricKey, metric.unit)}
            </span>
            <button onClick={onToggle} className={getUsageEditButtonClass(isOpen)}>
              {isOpen ? '닫기' : '수정'}
            </button>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={2} className='px-3 pb-3'>
            {children}
          </td>
        </tr>
      )}
    </>
  );
}

export function InputTab({
  scenario,
  usage,
  result,
  churnByYear,
  refundAmountByYear,
  V,
  update,
  updateRegion,
  updateUsage,
  updateChurn,
  updateRefundAmount,
  addRegion,
  removeRegion,
  usageEditRegion,
  setUsageEditRegion,
  showChurnEditor,
  setShowChurnEditor,
  showRefundEditor,
  setShowRefundEditor,
  applyUsageToAllYears,
  onOpenExport,
  onOpenImport,
}) {
  const {
    inputFieldsTop,
    inputFieldsBottom,
    computedFields,
    aggregateMetrics,
    weightedUsageRateMetric,
    avgUsageRateByRegionMetric,
    avgChurnRateMetric,
    avgRefundAmountMetric,
  } = buildInputDerivedState({
    scenario,
    usage,
  });

  const [bulkChurnValue, setBulkChurnValue] = useState(Math.round(avgChurnRateMetric.value));
  const [bulkRefundValue, setBulkRefundValue] = useState(
    Math.round(avgRefundAmountMetric.value),
  );
  const [bulkUsageValue, setBulkUsageValue] = useState(100);

  useEffect(() => {
    setBulkChurnValue(Math.round(avgChurnRateMetric.value));
  }, [avgChurnRateMetric.value]);

  useEffect(() => {
    setBulkRefundValue(Math.round(avgRefundAmountMetric.value));
  }, [avgRefundAmountMetric.value]);

  useEffect(() => {
    if (!usageEditRegion) {
      return;
    }

    const regionUsage = usage[usageEditRegion];

    if (!regionUsage?.length) {
      setBulkUsageValue(100);
      return;
    }

    const averageUsage =
      regionUsage.reduce((sum, value) => sum + value, 0) / regionUsage.length;

    setBulkUsageValue(Math.round(averageUsage));
  }, [usage, usageEditRegion]);

  const regionalFields = useMemo(
    () => [...inputFieldsTop, ...inputFieldsBottom],
    [inputFieldsBottom, inputFieldsTop],
  );
  const regionalFieldMap = useMemo(
    () => Object.fromEntries(regionalFields.map((field) => [field.key, field])),
    [regionalFields],
  );
  const regionContractFields = useMemo(
    () =>
      [
        regionalFieldMap.roundLimitByRegion,
        regionalFieldMap.memberPriceByRegion,
        regionalFieldMap.companionPriceByRegion,
        regionalFieldMap.publicPriceByRegion,
        regionalFieldMap.courseCostByRegion,
      ].filter(Boolean),
    [regionalFieldMap],
  );
  const regionForecastFields = useMemo(
    () =>
      [regionalFieldMap.membersByRegion, regionalFieldMap.companionsByRegion].filter(Boolean),
    [regionalFieldMap],
  );
  const actualRoundsField = computedFields.find((field) => field.id === 'actualRoundsByRegion');
  const weightField = computedFields.find((field) => field.id === 'weightByRegion');
  const activeUsageRegion = scenario.regions.find((region) => region.id === usageEditRegion);

  function getAggregateMetric(metricKey) {
    return aggregateMetrics?.[metricKey];
  }

  function renderInputRow(field) {
    return (
      <tr key={field.key}>
        <td className='sticky left-0 z-10 whitespace-nowrap bg-white/[0.07] px-3 py-3'>
          <div className='flex items-center gap-2'>
            <Tip text={V[field.key]?.tip}>
              <span
                className={`border-b border-dotted border-slate-600 ${SIMULATOR_TYPOGRAPHY.tableCell}`}
              >
                {getDisplayLabel(field.key, field.label)}
              </span>
            </Tip>
            {getDisplaySticker(field.key, V[field.key]?.sticker) && (
              <span className={SIMULATOR_STYLES.forecastSticker}>
                {getDisplaySticker(field.key, V[field.key]?.sticker)}
              </span>
            )}
          </div>
        </td>
        <td className='px-3 py-3 text-center'>
          <AggregateValue metric={getAggregateMetric(field.aggregateMetricKey)} showUnit />
        </td>
        {scenario.regions.map((region) => (
          <td key={region.id} className='px-2 py-3 text-center'>
            <input
              type='number'
              value={region[field.key]}
              step={1}
              onChange={(event) =>
                updateRegion(region.id, field.key, Number(event.target.value))
              }
              className={SIMULATOR_STYLES.tableNumberInput}
            />
          </td>
        ))}
      </tr>
    );
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-end gap-1.5'>
        <button
          type='button'
          onClick={onOpenExport}
          className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-400 transition hover:border-white/16 hover:bg-white/[0.1] hover:text-slate-200'
          title='JSON 다운로드'
          aria-label='JSON 다운로드'
        >
          <svg
            viewBox='0 0 24 24'
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M12 3v11' />
            <path d='m8 10 4 4 4-4' />
            <path d='M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1' />
          </svg>
        </button>
        <button
          type='button'
          onClick={onOpenImport}
          className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-400 transition hover:border-white/16 hover:bg-white/[0.1] hover:text-slate-200'
          title='JSON 업로드'
          aria-label='JSON 업로드'
        >
          <svg
            viewBox='0 0 24 24'
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M12 21V10' />
            <path d='m8 14 4-4 4 4' />
            <path d='M4 7V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1' />
          </svg>
        </button>
      </div>

      <div className={SIMULATOR_STYLES.tableSectionShell}>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-slate-500'>
              <th className='px-3 py-3 text-left'>
                <span className='text-[13px] font-semibold tracking-[0.03em] text-cyan-300/70'>
                  기본 정보 입력
                </span>
              </th>
              <th className='px-3 py-3 text-right' />
            </tr>
          </thead>
          <tbody>
            <BaseInputRow
              labelKey={getDisplayLabel('salePrice', V.salePrice.label)}
              value={scenario.salePrice}
              prefix={getDisplayPrefix('salePrice', V.salePrice.prefix || '')}
              unit={getDisplayUnit('salePrice', V.salePrice.unit || '')}
              tip={V.salePrice.tip}
              sticker={getDisplaySticker('salePrice', V.salePrice.sticker)}
              onChange={(value) => update('salePrice', value)}
            />
            <BaseInputRow
              labelKey={getDisplayLabel('contractYears', V.contractYears.label)}
              value={scenario.contractYears}
              prefix={getDisplayPrefix('contractYears', V.contractYears.prefix || '')}
              unit={getDisplayUnit('contractYears', V.contractYears.unit || '')}
              tip={V.contractYears.tip}
              sticker={getDisplaySticker('contractYears', V.contractYears.sticker)}
              onChange={(value) => update('contractYears', Math.max(1, Math.min(10, value)))}
            />
            <BaseInputRow
              labelKey={getDisplayLabel('annualFee', V.annualFee.label)}
              value={scenario.annualFee}
              prefix={getDisplayPrefix('annualFee', V.annualFee.prefix || '')}
              unit={getDisplayUnit('annualFee', V.annualFee.unit || '')}
              tip={V.annualFee.tip}
              sticker={getDisplaySticker('annualFee', V.annualFee.sticker)}
              onChange={(value) => update('annualFee', value)}
            />
            <BaseInputRow
              labelKey={getDisplayLabel('annualFixedProfit', V.annualFixedProfit.label)}
              value={scenario.annualFixedProfit}
              prefix={getDisplayPrefix('annualFixedProfit', V.annualFixedProfit.prefix || '')}
              unit={getDisplayUnit('annualFixedProfit', V.annualFixedProfit.unit || '')}
              tip={V.annualFixedProfit.tip}
              sticker={getDisplaySticker('annualFixedProfit', V.annualFixedProfit.sticker)}
              onChange={(value) => update('annualFixedProfit', value)}
            />

            <SeriesSummaryRow
              label={getDisplayLabel('yearlyChurnRate', V.yearlyChurnRate.label)}
              tip={V.yearlyChurnRate.tip}
              sticker={V.yearlyChurnRate.sticker}
              metricKey='avgChurnRate'
              metric={avgChurnRateMetric}
              isOpen={showChurnEditor}
              onToggle={() => setShowChurnEditor(!showChurnEditor)}
            >
              <YearSeriesEditor
                title='연도별 해지율'
                values={churnByYear}
                bulkValue={bulkChurnValue}
                unitLabel={getDisplayUnit('avgChurnRate', avgChurnRateMetric.unit)}
                onBulkChange={setBulkChurnValue}
                onChangeValue={updateChurn}
                onApplyAll={(value) =>
                  churnByYear.forEach((_, yearIndex) => updateChurn(yearIndex, value))
                }
                onClose={() => setShowChurnEditor(false)}
              />
            </SeriesSummaryRow>

            <SeriesSummaryRow
              label={getDisplayLabel('yearlyRefundAmount', V.yearlyRefundAmount.label)}
              tip={V.yearlyRefundAmount.tip}
              sticker={V.yearlyRefundAmount.sticker}
              metricKey='avgRefundAmount'
              metric={avgRefundAmountMetric}
              isOpen={showRefundEditor}
              onToggle={() => setShowRefundEditor(!showRefundEditor)}
            >
              <YearSeriesEditor
                title='연도별 일괄 해지 환불금'
                values={refundAmountByYear}
                bulkValue={bulkRefundValue}
                unitLabel={getDisplayUnit('avgRefundAmount', avgRefundAmountMetric.unit)}
                onBulkChange={setBulkRefundValue}
                onChangeValue={updateRefundAmount}
                onApplyAll={(value) =>
                  refundAmountByYear.forEach((_, yearIndex) =>
                    updateRefundAmount(yearIndex, value),
                  )
                }
                onClose={() => setShowRefundEditor(false)}
              />
            </SeriesSummaryRow>
          </tbody>
        </table>
      </div>

      <div className={SIMULATOR_STYLES.tableSectionShell}>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-slate-500'>
              <th className='sticky left-0 z-10 min-w-[240px] px-3 py-3 text-left'>
                <div className='flex items-center gap-3'>
                  <span className='text-[13px] font-semibold tracking-[0.03em] text-cyan-300/70'>
                    라운딩 옵션 정보 입력
                  </span>
                  <button
                    onClick={addRegion}
                    disabled={scenario.regions.length >= MAX_REGIONS}
                    className='rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-[13px] font-medium tracking-[0.01em] text-cyan-100 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-cyan-100'
                  >
                    + 옵션 추가
                  </button>
                </div>
              </th>

              <th className='min-w-[96px] px-3 py-3 text-center' />
              {scenario.regions.map((region) => (
                <th key={region.id} className='min-w-[104px] px-2 py-3 text-center'>
                  <div className='flex items-center justify-center gap-1'>
                    <input
                      value={region.name}
                      onChange={(event) => updateRegion(region.id, 'name', event.target.value)}
                      className='w-24 rounded-xl border border-white/10 bg-white/[0.08] px-2 py-2 text-center text-[13px] font-semibold leading-[1.35] tracking-[0.01em] text-white outline-none transition focus:border-cyan-300/34 focus:bg-white/[0.12]'
                    />
                    {scenario.regions.length > 1 && (
                      <button
                        onClick={() => removeRegion(region.id)}
                        className='text-slate-600 hover:text-rose-400'
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionContractFields.slice(0, 1).map(renderInputRow)}
            <tr>
              <td className='sticky left-0 z-10 whitespace-nowrap px-3 py-3'>
                <div className='flex items-center gap-2'>
                  <Tip text={V.yearlyUsageRateByRegion.tip}>
                    <span
                      className={`border-b border-dotted border-slate-600 ${SIMULATOR_TYPOGRAPHY.tableCell}`}
                    >
                      {getDisplayLabel(
                        'yearlyUsageRateByRegion',
                        V.yearlyUsageRateByRegion.label,
                      )}
                    </span>
                  </Tip>
                  {V.yearlyUsageRateByRegion.sticker && (
                    <span className={SIMULATOR_STYLES.forecastSticker}>
                      {V.yearlyUsageRateByRegion.sticker}
                    </span>
                  )}
                </div>
              </td>
              <td className='px-3 py-3'>
                <AggregateValue metric={weightedUsageRateMetric} showUnit />
              </td>
              {scenario.regions.map((region) => {
                const averageUsage =
                  avgUsageRateByRegionMetric.formattedValuesByRegion[region.id] ??
                  V.avgUsageRateByRegion.fmt(100);

                return (
                  <td key={region.id} className='px-2 py-3 text-center'>
                    <div className='flex items-center justify-center gap-1.5'>
                      <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>
                        {getDisplayPrefix(
                          'avgUsageRateByRegion',
                          avgUsageRateByRegionMetric.prefix,
                        )}
                      </span>
                      <span className={SIMULATOR_TYPOGRAPHY.tableNumber}>{averageUsage}</span>
                      <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>
                        {getDisplayUnit(
                          'avgUsageRateByRegion',
                          avgUsageRateByRegionMetric.unit,
                        )}
                      </span>
                      <button
                        onClick={() =>
                          setUsageEditRegion(
                            usageEditRegion === region.id ? null : region.id,
                          )
                        }
                        className={getUsageEditButtonClass(usageEditRegion === region.id)}
                      >
                        {usageEditRegion === region.id ? '닫기' : '수정'}
                      </button>
                    </div>
                  </td>
                );
              })}
            </tr>
            {activeUsageRegion && (
              <tr>
                <td colSpan={scenario.regions.length + 2} className='px-3 py-3'>
                  <YearSeriesEditor
                    title={`${activeUsageRegion.name} 연도별 이용률`}
                    values={usage[activeUsageRegion.id] ?? Array(scenario.contractYears).fill(100)}
                    bulkValue={bulkUsageValue}
                    unitLabel={getDisplayUnit(
                      'avgUsageRateByRegion',
                      avgUsageRateByRegionMetric.unit,
                    )}
                    onBulkChange={setBulkUsageValue}
                    onChangeValue={(yearIndex, value) =>
                      updateUsage(activeUsageRegion.id, yearIndex, value)
                    }
                    onApplyAll={(value) => applyUsageToAllYears(activeUsageRegion.id, value)}
                    onClose={() => setUsageEditRegion(null)}
                  />
                </td>
              </tr>
            )}

            {actualRoundsField && (
              <tr key={actualRoundsField.id}>
                <td className='sticky left-0 z-10 whitespace-nowrap px-3 py-3'>
                  <div className='flex justify-start'>
                    <Tip text={actualRoundsField.tip}>
                      <span
                        className={[
                          'border-b border-dotted border-slate-600',
                          actualRoundsField.depth === 0
                            ? SIMULATOR_TYPOGRAPHY.tableCell
                            : `${SIMULATOR_TYPOGRAPHY.bodyMuted} pl-4`,
                          actualRoundsField.bold ? 'font-medium text-slate-200' : '',
                        ].join(' ')}
                      >
                        {getDisplayLabel(actualRoundsField.id, actualRoundsField.label)}
                      </span>
                    </Tip>
                  </div>
                </td>
                <td className='px-3 py-3 text-center text-[13px] font-medium leading-[1.45] tabular-nums text-slate-400'>
                  {actualRoundsField.aggregateMetricKey ? (
                    <div className='flex items-center justify-center gap-1'>
                      <AggregateValue
                        metric={getAggregateMetric(actualRoundsField.aggregateMetricKey)}
                        showUnit
                      />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center gap-1'>
                      <span>{actualRoundsField.aggregateDisplay || ''}</span>
                    </div>
                  )}
                </td>
                {scenario.regions.map((region) => {
                  const regionData = result.regionData[region.id];

                  if (!regionData) {
                    return <td key={region.id} />;
                  }

                  const value = actualRoundsField.value?.(region, regionData);

                  return (
                    <td
                      key={region.id}
                      className={`px-3 py-3 text-center text-[13px] leading-[1.45] tabular-nums ${
                        actualRoundsField.bold ? 'font-semibold' : 'font-medium'
                      } ${getProfitClass(actualRoundsField.cfmt, value, 'text-slate-300')}`}
                    >
                      <div className='flex items-center justify-center gap-1'>
                        <span>{actualRoundsField.calc(region, regionData)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            )}

            {regionContractFields.slice(1).map(renderInputRow)}
            {regionForecastFields.map(renderInputRow)}
          </tbody>
        </table>
      </div>

    </div>
  );
}
