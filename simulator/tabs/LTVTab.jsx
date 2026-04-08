import {
  Bar,
  Cell,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_TYPOGRAPHY, SIMULATOR_STYLES, SIMULATOR_TYPOGRAPHY } from "../styles.js";
import { getDisplayLabel } from "../text.js";
import { Card, Tip } from "../ui.jsx";

function formatTableAmount(value, fmt) {
  const formatted = fmt(value);
  return typeof formatted === "string" && formatted.endsWith("만")
    ? formatted.slice(0, -1)
    : formatted;
}

export function LTVTab({ scenario, result, V, fmt, tt }) {
  const avgRevenueItems = [
    {
      name: "라운딩 매출",
      value: result.totalExpectedRoundingRevenue / scenario.contractYears,
      color: "#10b981",
    },
    {
      name: "연회비 매출",
      value: result.totalExpectedAnnualFeeRevenue / scenario.contractYears,
      color: "#3b82f6",
    },
    {
      name: "기타 고정 손익",
      value: result.totalExpectedPositiveAnnualFixedProfit / scenario.contractYears,
      color: "#8b5cf6",
    },
  ];
  const avgRevenueTotal = avgRevenueItems.reduce((sum, item) => sum + item.value, 0);
  const avgCostItems = [
    {
      name: "라운딩 비용",
      value: result.totalExpectedRoundingCost / scenario.contractYears,
      color: "#ef4444",
    },
    {
      name: "기타 고정 손익",
      value: result.totalExpectedNegativeAnnualFixedCost / scenario.contractYears,
      color: "#f97316",
    },
  ];
  const avgCostTotal = avgCostItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
        <Card
          label={getDisplayLabel("ltv", V.ltv.label)}
          prefix={V.ltv.prefix}
          value={V.ltv.fmt(result.ltv)}
          numericValue={result.ltv}
          unit={V.ltv.unit}
          suffix={V.ltv.suffix}
          tip={V.ltv.tip}
          accent={result.ltv >= 0 ? "cyan" : "rose"}
          cfmt={V.ltv.cfmt}
        />
        <Card
          label={getDisplayLabel(
            "expectedMaturitySurvivingRate",
            V.expectedMaturitySurvivingRate.label,
          )}
          prefix={V.expectedMaturitySurvivingRate.prefix}
          value={V.expectedMaturitySurvivingRate.fmt(result.expectedMaturitySurvivingRate)}
          numericValue={result.expectedMaturitySurvivingRate}
          unit={V.expectedMaturitySurvivingRate.unit}
          suffix={V.expectedMaturitySurvivingRate.suffix}
          tip={V.expectedMaturitySurvivingRate.tip}
          accent="green"
          cfmt={V.expectedMaturitySurvivingRate.cfmt}
        />
        <Card
          label={getDisplayLabel("expectedEnrollProfit", V.expectedEnrollProfit.label)}
          prefix={V.expectedEnrollProfit.prefix}
          value={V.expectedEnrollProfit.fmt(result.expectedEnrollProfit)}
          numericValue={result.expectedEnrollProfit}
          unit={V.expectedEnrollProfit.unit}
          suffix={V.expectedEnrollProfit.suffix}
          tip={V.expectedEnrollProfit.tip}
          accent={result.expectedEnrollProfit >= 0 ? "cyan" : "rose"}
          cfmt={V.expectedEnrollProfit.cfmt}
        />
        <Card
          label={getDisplayLabel("avgAnnualVariableProfit", V.avgAnnualVariableProfit.label)}
          prefix={V.avgAnnualVariableProfit.prefix}
          value={V.avgAnnualVariableProfit.fmt(result.avgAnnualVariableProfit)}
          numericValue={result.avgAnnualVariableProfit}
          unit={V.avgAnnualVariableProfit.unit}
          suffix={V.avgAnnualVariableProfit.suffix}
          tip={V.avgAnnualVariableProfit.tip}
          accent={result.avgAnnualVariableProfit >= 0 ? "cyan" : "rose"}
          cfmt={V.avgAnnualVariableProfit.cfmt}
        />
        <Card
          label={getDisplayLabel("avgAnnualVariableRevenue", V.avgAnnualVariableRevenue.label)}
          prefix={V.avgAnnualVariableRevenue.prefix}
          value={V.avgAnnualVariableRevenue.fmt(result.avgAnnualVariableRevenue)}
          numericValue={result.avgAnnualVariableRevenue}
          unit={V.avgAnnualVariableRevenue.unit}
          suffix={V.avgAnnualVariableRevenue.suffix}
          tip={V.avgAnnualVariableRevenue.tip}
          accent="green"
          cfmt={V.avgAnnualVariableRevenue.cfmt}
        />
        <Card
          label={getDisplayLabel("avgAnnualVariableCost", V.avgAnnualVariableCost.label)}
          prefix={V.avgAnnualVariableCost.prefix}
          value={V.avgAnnualVariableCost.fmt(result.avgAnnualVariableCost)}
          numericValue={result.avgAnnualVariableCost}
          unit={V.avgAnnualVariableCost.unit}
          suffix={V.avgAnnualVariableCost.suffix}
          tip={V.avgAnnualVariableCost.tip}
          accent="amber"
          cfmt={V.avgAnnualVariableCost.cfmt}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={SIMULATOR_STYLES.panel}>
          <div className={SIMULATOR_STYLES.panelHeading}>연 평균 변동 매출 구성</div>
          <div>
            <div className="mb-2 flex h-8 gap-0.5 overflow-hidden rounded">
              {avgRevenueItems.map((item) => {
                const pct =
                  avgRevenueTotal !== 0 ? Math.max((item.value / avgRevenueTotal) * 100, 0) : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={item.name}
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                    className="h-full opacity-80 transition-all"
                    title={`${item.name}: ${fmt(item.value)} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4">
              {avgRevenueItems.map((item) => {
                const pct = avgRevenueTotal !== 0 ? (item.value / avgRevenueTotal) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center gap-1.5 text-[13px] leading-[1.45]">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>{item.name}</span>
                    <span className={SIMULATOR_TYPOGRAPHY.tableCellStrong}>{fmt(item.value)}</span>
                    <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>({pct.toFixed(1)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={SIMULATOR_STYLES.panel}>
          <div className={SIMULATOR_STYLES.panelHeading}>연 평균 변동 비용 구성</div>
          <div>
            <div className="mb-2 flex h-8 gap-0.5 overflow-hidden rounded">
              {avgCostItems.map((item) => {
                const pct =
                  avgCostTotal !== 0 ? Math.max((item.value / avgCostTotal) * 100, 0) : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={item.name}
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                    className="h-full opacity-80 transition-all"
                    title={`${item.name}: ${fmt(item.value)} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4">
              {avgCostItems.map((item) => {
                const pct = avgCostTotal !== 0 ? (item.value / avgCostTotal) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center gap-1.5 text-[13px] leading-[1.45]">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>{item.name}</span>
                    <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-rose-400">
                      {fmt(item.value)}
                    </span>
                    <span className={SIMULATOR_TYPOGRAPHY.bodyMuted}>({pct.toFixed(1)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={SIMULATOR_STYLES.panelScroll}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={`py-1.5 text-left ${SIMULATOR_TYPOGRAPHY.tableHead}`} />
              {result.years.map((year) => (
                <th
                  key={year.yearByYear}
                  className={`py-1.5 text-right ${SIMULATOR_TYPOGRAPHY.tableHead}`}
                >
                  {year.yearLabelByYear}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearSurvivingStartRate.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel("yearSurvivingStartRate", V.yearSurvivingStartRate.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`surviving-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className={SIMULATOR_TYPOGRAPHY.tableNumber}>
                    {V.yearSurvivingStartRate.fmt(year.survivingStartByYear)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>%</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearActualRoundsExpected.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel("yearActualRoundsExpected", V.yearActualRoundsExpected.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`rounds-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className={SIMULATOR_TYPOGRAPHY.tableNumber}>
                    {V.yearActualRoundsExpected.fmt(year.actualRoundsExpectedByYear)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>
                    {V.yearActualRoundsExpected.unit}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearRoundingRevenueExpected.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel(
                        "yearRoundingRevenueExpected",
                        V.yearRoundingRevenueExpected.label,
                      )}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`rounding-revenue-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-cyan-400">
                    {formatTableAmount(year.roundingRevenueExpectedByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearMemberRevenueExpected.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={`${SIMULATOR_TYPOGRAPHY.bodyMuted} pl-4`}>
                      {getDisplayLabel("yearMemberRevenueExpected", V.yearMemberRevenueExpected.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`member-revenue-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-cyan-400">
                    {formatTableAmount(year.memberRevenueExpectedByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearCompanionRevenueExpected.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={`${SIMULATOR_TYPOGRAPHY.bodyMuted} pl-4`}>
                      {getDisplayLabel(
                        "yearCompanionRevenueExpected",
                        V.yearCompanionRevenueExpected.label,
                      )}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`companion-revenue-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-cyan-400">
                    {formatTableAmount(year.companionRevenueExpectedByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearRoundingCostExpected.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>라운딩 비용</span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`rounding-cost-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-rose-400">
                    {formatTableAmount(year.roundingCostExpectedByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearRoundingCostExpected.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={`${SIMULATOR_TYPOGRAPHY.bodyMuted} pl-4`}>
                      {getDisplayLabel("yearRoundingCostExpected", V.yearRoundingCostExpected.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`b2b-cost-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-rose-400">
                    {formatTableAmount(year.roundingCostExpectedByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.annualFee.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel("annualFee", V.annualFee.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`annual-fee-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-cyan-400">
                    {formatTableAmount(year.annualFeeRevenueByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.annualFixedProfit.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel("annualFixedProfit", V.annualFixedProfit.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`annual-fixed-profit-${year.yearByYear}`} className="py-1.5 text-right">
                  <span
                    className={`text-[13px] font-medium leading-[1.45] tabular-nums ${
                      year.annualFixedProfitByYear > 0
                        ? "text-cyan-400"
                        : year.annualFixedProfitByYear < 0
                          ? "text-rose-400"
                          : "text-slate-300"
                    }`}
                  >
                    {formatTableAmount(year.annualFixedProfitByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.salePrice.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel("salePrice", V.salePrice.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`sale-price-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-cyan-400">
                    {formatTableAmount(year.yearByYear === 1 ? scenario.salePrice : 0, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearRefundCost.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel("yearRefundCost", V.yearRefundCost.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`refund-cost-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-rose-400">
                    {formatTableAmount(year.refundCostByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5">
                <Tip text={V.yearCumulativeLtv.tip}>
                  <span className="border-b border-dotted border-slate-600">
                    <span className={SIMULATOR_TYPOGRAPHY.tableCell}>
                      {getDisplayLabel("yearCumulativeLtv", V.yearCumulativeLtv.label)}
                    </span>
                  </span>
                </Tip>
              </td>
              {result.years.map((year) => (
                <td key={`ltv-${year.yearByYear}`} className="py-1.5 text-right">
                  <span className="text-[13px] font-medium leading-[1.45] tabular-nums text-cyan-400">
                    {formatTableAmount(year.cumulativeLTVByYear, fmt)}
                  </span>
                  <span className={`ml-1 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>만원</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className={SIMULATOR_STYLES.panel}>
        <div className={SIMULATOR_STYLES.panelHeading}>연간 현금 흐름</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={result.years}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="yearLabelByYear" tick={CHART_TYPOGRAPHY.tick} />
            <YAxis
              tick={CHART_TYPOGRAPHY.tick}
              tickFormatter={(value) => fmt(value)}
              label={{
                value: "현금흐름",
                angle: -90,
                position: "insideLeft",
                ...CHART_TYPOGRAPHY.label,
              }}
            />
            <Tooltip
              {...tt}
              formatter={(value, name) => [fmt(value), name]}
            />
            <Legend wrapperStyle={CHART_TYPOGRAPHY.legend} />
            <Line
              type="monotone"
              dataKey="cumulativeLTVByYear"
              name="누적 LTV"
              stroke="#e2e8f0"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Bar
              dataKey="cashFlowExpectedByYear"
              name="현금흐름"
              radius={[3, 3, 0, 0]}
            >
              {result.years.map((year) => (
                <Cell
                  key={year.yearByYear}
                  fill={year.cashFlowExpectedByYear < 0 ? "#fb7185" : "#38bdf8"}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
