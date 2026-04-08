import {
  CartesianGrid,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
} from 'recharts';

import { buildInputDerivedState } from '../selectors.js';
import { CHART_TYPOGRAPHY, SIMULATOR_STYLES, SIMULATOR_TYPOGRAPHY } from '../styles.js';
import { getDisplayLabel, getDisplayMeta } from '../text.js';
import { Card, Tip } from '../ui.jsx';

function buildBepChartData(scenario, result) {
  const maxRounds = Math.max(1, Math.ceil(result.sumRoundLimit * scenario.contractYears));
  const step = Math.max(1, Math.round(maxRounds / 80));
  const data = [];

  const companyFixedProfit =
    scenario.salePrice +
    scenario.annualFee * scenario.contractYears +
    scenario.annualFixedProfit * scenario.contractYears;
  const customerFixedCost = scenario.salePrice + scenario.annualFee * scenario.contractYears;

  for (let x = 0; x <= maxRounds + step * 0.1; x += step) {
    const totalRounds = Math.min(x, maxRounds);
    const companyTotalProfit = companyFixedProfit + result.wMargin * totalRounds;
    const customerTotalProfit = result.wSaving * totalRounds - customerFixedCost;

    data.push({
      x: totalRounds,
      companyTotalProfit: Math.round(companyTotalProfit),
      customerTotalProfit: Math.round(customerTotalProfit),
    });

    if (totalRounds >= maxRounds) {
      break;
    }
  }

  return data;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const companyEntry = payload.find((entry) => entry.dataKey === 'companyTotalProfit');
  const customerEntry = payload.find((entry) => entry.dataKey === 'customerTotalProfit');

  return (
    <div className={SIMULATOR_STYLES.inlineInfoBox}>
      <div className={`mb-1 ${SIMULATOR_TYPOGRAPHY.body}`}>라운딩 {label}회</div>
      {companyEntry && (
        <div style={{ color: companyEntry.color }} className={SIMULATOR_TYPOGRAPHY.bodyStrong}>
          회사 총 손익: {companyEntry.value.toLocaleString()}만원
        </div>
      )}
      {customerEntry && (
        <div style={{ color: customerEntry.color }} className={SIMULATOR_TYPOGRAPHY.bodyStrong}>
          고객 총 손익: {customerEntry.value.toLocaleString()}만원
        </div>
      )}
    </div>
  );
}

export function BEPTab({ scenario, result, usage, V, fmt }) {
  const { computedFields, aggregateMetrics } = buildInputDerivedState({ scenario, usage });
  const displayFields = computedFields.filter(
    (field) =>
      ![
        'actualRoundsByRegion',
        'weightByRegion',
        'annualRoundingByRegion',
        'annualSavingByRegion',
      ].includes(field.id),
  );

  const chartData = buildBepChartData(scenario, result);
  const customerBepX = Number.isFinite(result.customerBEP) ? result.customerBEP : null;
  const companyBepX =
    result.companyBEP === null ? null : Math.round(result.companyBEP * scenario.contractYears);
  const xAxisMin = chartData.length ? chartData[0].x : 0;
  const xAxisMax = chartData.length ? chartData[chartData.length - 1].x : 0;
  const winWinStart =
    customerBepX !== null && companyBepX !== null ? Math.min(customerBepX, companyBepX) : null;
  const winWinEnd =
    customerBepX !== null && companyBepX !== null ? Math.max(customerBepX, companyBepX) : null;
  const highlightStart =
    winWinStart === null || winWinEnd === null || winWinEnd < xAxisMin || winWinStart > xAxisMax
      ? null
      : Math.max(xAxisMin, winWinStart);
  const highlightEnd =
    winWinStart === null || winWinEnd === null || winWinEnd < xAxisMin || winWinStart > xAxisMax
      ? null
      : Math.min(xAxisMax, winWinEnd);

  const getAggregateMetric = (metricKey) => aggregateMetrics?.[metricKey];

  const getCfmtClass = (cfmt, value, fallback = SIMULATOR_TYPOGRAPHY.tableNumber) => {
    if (cfmt === 'profit') {
      if (value > 0) return 'text-cyan-400';
      if (value < 0) return 'text-rose-400';
      return 'text-slate-300';
    }

    return fallback;
  };

  const renderAggregateValue = (metric, options = {}) => {
    if (!metric) return null;

    const displayMeta = getDisplayMeta(metric.key);
    const prefix = displayMeta.prefix ?? metric.prefix;
    const unit = displayMeta.unit ?? metric.unit;

    return (
      <div className='flex items-center justify-center gap-1'>
        {prefix && <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>{prefix}</span>}
        <span
          className={getCfmtClass(metric.cfmt, metric.value, SIMULATOR_TYPOGRAPHY.tableNumber)}
        >
          {metric.formatted}
        </span>
        {options.showUnit && unit && (
          <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>{unit}</span>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6'>
        <Card
          label={getDisplayLabel('companyBEP', V.companyBEP.label)}
          prefix={V.companyBEP.prefix}
          value={
            result.companyBEP === null
              ? '-'
              : V.companyBEP.fmt(result.companyBEP * scenario.contractYears)
          }
          numericValue={result.companyBEP === null ? null : result.companyBEP * scenario.contractYears}
          suffix={result.companyBEP === null ? '' : V.companyBEP.suffix}
          tip={V.companyBEP.tip}
          accent={result.companyBEP === null ? 'green' : 'amber'}
          cfmt={V.companyBEP.cfmt}
        />
        <Card
          label={getDisplayLabel('customerBEP', V.customerBEP.label)}
          prefix={V.customerBEP.prefix}
          value={V.customerBEP.fmt(result.customerBEP)}
          numericValue={result.customerBEP}
          suffix={V.customerBEP.suffix}
          tip={V.customerBEP.tip}
          accent='rose'
          cfmt={V.customerBEP.cfmt}
        />
        <Card
          label={getDisplayLabel('naiveFixedProfit', V.naiveFixedProfit.label)}
          prefix={V.naiveFixedProfit.prefix}
          value={V.naiveFixedProfit.fmt(result.naiveFixedProfit)}
          numericValue={result.naiveFixedProfit}
          unit={V.naiveFixedProfit.unit}
          suffix={V.naiveFixedProfit.suffix}
          tip={V.naiveFixedProfit.tip}
          accent={result.naiveFixedProfit >= 0 ? 'cyan' : 'rose'}
          cfmt={V.naiveFixedProfit.cfmt}
        />
        <Card
          label={getDisplayLabel('naiveCustomerFixedCost', V.naiveCustomerFixedCost.label)}
          prefix={V.naiveCustomerFixedCost.prefix}
          value={V.naiveCustomerFixedCost.fmt(result.naiveCustomerFixedCost)}
          numericValue={result.naiveCustomerFixedCost}
          unit={V.naiveCustomerFixedCost.unit}
          tip={V.naiveCustomerFixedCost.tip}
          accent='amber'
          cfmt={V.naiveCustomerFixedCost.cfmt}
        />
        <Card
          label={getDisplayLabel('weightedMarginPerRound', V.weightedMarginPerRound.label)}
          prefix={V.weightedMarginPerRound.prefix}
          value={V.weightedMarginPerRound.fmt(result.wMargin)}
          numericValue={result.wMargin}
          unit={V.weightedMarginPerRound.unit}
          tip={V.weightedMarginPerRound.tip}
          accent={result.wMargin >= 0 ? 'cyan' : 'rose'}
          cfmt={V.weightedMarginPerRound.cfmt}
        />
        <Card
          label={getDisplayLabel('weightedSavingPerRound', V.weightedSavingPerRound.label)}
          prefix={V.weightedSavingPerRound.prefix}
          value={V.weightedSavingPerRound.fmt(result.wSaving)}
          numericValue={result.wSaving}
          unit={V.weightedSavingPerRound.unit}
          tip={V.weightedSavingPerRound.tip}
          accent='green'
          cfmt='saving'
        />
      </div>

      <div className={`${SIMULATOR_STYLES.tableSectionShell} p-4 md:p-5`}>
        <table className='w-full text-sm'>
          <thead>
            <tr>
              <th className={`py-1.5 text-left ${SIMULATOR_TYPOGRAPHY.tableHead}`} />
              <th className={`py-1.5 text-center ${SIMULATOR_TYPOGRAPHY.tableHead}`} />
              {scenario.regions.map((region) => (
                <th
                  key={region.id}
                  className={`py-1.5 text-center ${SIMULATOR_TYPOGRAPHY.tableHead}`}
                >
                  {region.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const weightField = computedFields.find((field) => field.id === 'weightByRegion');

              if (!weightField) {
                return null;
              }

              return (
                <tr key={weightField.id}>
                  <td className='py-1.5'>
                    <Tip text={weightField.tip}>
                      <span
                        className={[
                          'border-b border-dotted border-slate-600',
                          SIMULATOR_TYPOGRAPHY.tableCell,
                        ].join(' ')}
                      >
                        {getDisplayLabel(weightField.id, weightField.label)}
                      </span>
                    </Tip>
                  </td>
                  <td className='py-1.5 text-center text-[13px] font-medium leading-[1.45] tabular-nums text-slate-400'>
                    {weightField.aggregateMetricKey ? (
                      renderAggregateValue(getAggregateMetric(weightField.aggregateMetricKey), {
                        showUnit: true,
                      })
                    ) : (
                      <div className='flex items-center justify-center gap-1'>
                        <span>{weightField.aggregateDisplay || ''}</span>
                      </div>
                    )}
                  </td>
                  {scenario.regions.map((region) => {
                    const regionData = result.regionData[region.id];

                    if (!regionData) {
                      return <td key={region.id} />;
                    }

                    const value = weightField.value ? weightField.value(region, regionData) : null;

                    return (
                      <td
                        key={region.id}
                        className={`py-1.5 text-right text-[13px] leading-[1.45] tabular-nums ${
                          weightField.bold ? 'font-semibold' : 'font-medium'
                        } ${getCfmtClass(weightField.cfmt, value, 'text-slate-300')}`}
                      >
                        {weightField.calc(region, regionData)}
                      </td>
                    );
                  })}
                </tr>
              );
            })()}
            {displayFields.map((field) => (
              <tr key={field.id}>
                <td className='py-1.5'>
                  <Tip text={field.tip}>
                    <span
                      className={[
                        'border-b border-dotted border-slate-600',
                        field.depth === 0
                          ? SIMULATOR_TYPOGRAPHY.tableCell
                          : `${SIMULATOR_TYPOGRAPHY.bodyMuted} pl-4`,
                        field.bold ? 'font-medium text-slate-200' : '',
                      ].join(' ')}
                    >
                      {getDisplayLabel(field.id, field.label)}
                    </span>
                  </Tip>
                </td>
                <td className='py-1.5 text-center text-[13px] font-medium leading-[1.45] tabular-nums text-slate-400'>
                  {field.aggregateMetricKey ? (
                    renderAggregateValue(getAggregateMetric(field.aggregateMetricKey), {
                      showUnit: true,
                    })
                  ) : (
                    <div className='flex items-center justify-center gap-1'>
                      <span>{field.aggregateDisplay || ''}</span>
                    </div>
                  )}
                </td>
                {scenario.regions.map((region) => {
                  const regionData = result.regionData[region.id];

                  if (!regionData) {
                    return <td key={region.id} />;
                  }

                  const value = field.value ? field.value(region, regionData) : null;

                  return (
                    <td
                      key={region.id}
                      className={`py-1.5 text-right text-[13px] leading-[1.45] tabular-nums ${
                        field.bold ? 'font-semibold' : 'font-medium'
                      } ${getCfmtClass(field.cfmt, value, 'text-slate-300')}`}
                    >
                      {field.calc(region, regionData)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={SIMULATOR_STYLES.panel}>
        <div className='mb-2 flex items-center justify-between'>
          <div className={SIMULATOR_STYLES.panelHeading}>라운딩 횟수별 회사와 고객의 총 손익</div>
          <div className='flex flex-wrap items-center gap-3'>
            <span className={`flex items-center gap-1 ${SIMULATOR_TYPOGRAPHY.controlSmall}`}>
              <span className='h-3 w-3 rounded-sm bg-cyan-500/20' />
              회사 총 손익
            </span>
            <span className={`flex items-center gap-1 ${SIMULATOR_TYPOGRAPHY.controlSmall}`}>
              <span
                className='h-3 w-3 rounded-sm'
                style={{ background: 'rgba(34, 197, 94, 0.24)' }}
              />
              고객 총 손익
            </span>
            {highlightStart !== null && highlightEnd !== null && (
              <span className={`flex items-center gap-1 ${SIMULATOR_TYPOGRAPHY.controlSmall}`}>
                <span className='h-3 w-3 rounded-sm bg-violet-400/25' />
                WIN-WIN 구간
              </span>
            )}
          </div>
        </div>
        <ResponsiveContainer width='100%' height={320}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 32, left: 8 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            {highlightStart !== null && highlightEnd !== null && (
              <ReferenceArea
                x1={highlightStart}
                x2={highlightEnd}
                fill='#8b5cf6'
                fillOpacity={0.22}
              />
            )}
            <XAxis
              dataKey='x'
              type='number'
              domain={[xAxisMin, xAxisMax]}
              tick={CHART_TYPOGRAPHY.tick}
              tickFormatter={(value) => value.toLocaleString()}
              label={{
                value: '라운딩 횟수',
                position: 'insideBottom',
                offset: -5,
                ...CHART_TYPOGRAPHY.label,
              }}
            />
            <YAxis
              tick={CHART_TYPOGRAPHY.tick}
              tickFormatter={(value) => fmt(value)}
              label={{
                value: '총 손익 (만원)',
                angle: -90,
                position: 'insideLeft',
                ...CHART_TYPOGRAPHY.label,
              }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign='top'
              align='right'
              wrapperStyle={CHART_TYPOGRAPHY.legend}
              payload={[
                { value: '회사 총 손익', type: 'line', color: '#06b6d4' },
                { value: '고객 총 손익', type: 'line', color: '#22c55e' },
              ]}
            />
            <Line
              type='monotone'
              dataKey='companyTotalProfit'
              name='회사 총 손익'
              stroke='#06b6d4'
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type='monotone'
              dataKey='customerTotalProfit'
              name='고객 총 손익'
              stroke='#22c55e'
              strokeWidth={2.5}
              dot={false}
            />
            <ReferenceLine y={0} stroke='#64748b' strokeDasharray='3 3' />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
