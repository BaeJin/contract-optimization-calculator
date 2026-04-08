import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MAX_SCENARIOS } from "../constants.js";
import { ensureUsage } from "../scenario.js";
import { CHART_TYPOGRAPHY, SIMULATOR_STYLES, SIMULATOR_TYPOGRAPHY } from "../styles.js";
import { getDisplayLabel } from "../text.js";
import { Tip } from "../ui.jsx";

export function CompareTab({ scenarios, allResults, addScenario, V, fmt, fmtBEP, tt }) {
  const lineColors = ["#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6"];
  const compactScenarioColumnCount = Math.min(allResults.length, 5);
  const compareTableMinWidth =
    320 + compactScenarioColumnCount * 88 + Math.max(allResults.length - 5, 0) * 120;
  const sanitizeComparisonValue = (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const sanitized = value.replace(/[^0-9.-]/g, "");
    return sanitized || "-";
  };

  const formatMetric = (metricKey, value) => {
    const meta = V[metricKey];
    if (value == null || !Number.isFinite(value)) {
      return "-";
    }

    return sanitizeComparisonValue(meta?.fmt ? meta.fmt(value) : fmt(value));
  };

  const getScenarioMetricValue = (metricKey, scenario) => {
    const formula = V[metricKey]?.formula;

    if (!formula || !scenario) {
      return null;
    }

    return formula({ scenario, usage: ensureUsage(scenario) });
  };

  const buildMetricRow = (metricKey, pickValue, options = {}) => ({
    key: metricKey,
    label: options.label || getDisplayLabel(metricKey, V[metricKey]?.label || metricKey),
    unit: options.unit ?? V[metricKey]?.unit ?? "-",
    tip: options.tip || V[metricKey]?.tip || "",
    format: (result, scenario) => pickValue(result, scenario),
    className: options.className || SIMULATOR_TYPOGRAPHY.tableCellStrong,
  });

  const escapeCsvCell = (value) => {
    const normalized = String(value ?? "").replaceAll('"', '""');
    return `"${normalized}"`;
  };

  if (scenarios.length < 2) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
          <div className={SIMULATOR_TYPOGRAPHY.body}>시나리오가 2개 이상 있어야 비교할 수 있습니다.</div>
          {scenarios.length < MAX_SCENARIOS && (
            <button onClick={addScenario} className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/20 px-3 py-1.5 text-[13px] font-medium tracking-[0.01em] text-cyan-400">+ 시나리오 추가</button>
          )}
        </div>
      </div>
    );
  }

  const rows = [
    buildMetricRow("salePrice", (_, scenario) => formatMetric("salePrice", scenario.salePrice)),
    buildMetricRow(
      "contractYears",
      (_, scenario) => formatMetric("contractYears", scenario.contractYears),
    ),
    buildMetricRow("annualFee", (_, scenario) => formatMetric("annualFee", scenario.annualFee)),
    buildMetricRow(
      "totalRoundLimit",
      (_, scenario) => formatMetric("totalRoundLimit", getScenarioMetricValue("totalRoundLimit", scenario)),
    ),
    buildMetricRow(
      "weightedUsageRate",
      (_, scenario) =>
        formatMetric("weightedUsageRate", getScenarioMetricValue("weightedUsageRate", scenario)),
    ),
    buildMetricRow(
      "avgAnnualRounds",
      (result) => formatMetric("avgAnnualRounds", result.avgAnnualRounds),
    ),
    buildMetricRow(
      "weightedPublicPrice",
      (_, scenario) =>
        formatMetric("weightedPublicPrice", getScenarioMetricValue("weightedPublicPrice", scenario)),
    ),
    buildMetricRow(
      "weightedCourseCost",
      (_, scenario) =>
        formatMetric("weightedCourseCost", getScenarioMetricValue("weightedCourseCost", scenario)),
    ),
    buildMetricRow(
      "weightedMemberPrice",
      (_, scenario) =>
        formatMetric("weightedMemberPrice", getScenarioMetricValue("weightedMemberPrice", scenario)),
    ),
    buildMetricRow(
      "weightedCompanionPrice",
      (_, scenario) =>
        formatMetric("weightedCompanionPrice", getScenarioMetricValue("weightedCompanionPrice", scenario)),
    ),
    buildMetricRow(
      "weightedMembers",
      (_, scenario) => formatMetric("weightedMembers", getScenarioMetricValue("weightedMembers", scenario)),
    ),
    buildMetricRow(
      "weightedCompanions",
      (_, scenario) =>
        formatMetric("weightedCompanions", getScenarioMetricValue("weightedCompanions", scenario)),
    ),
    buildMetricRow(
      "weightedMarginPerRound",
      (_, scenario) =>
        formatMetric("weightedMarginPerRound", getScenarioMetricValue("weightedMarginPerRound", scenario)),
    ),
    buildMetricRow(
      "weightedSavingPerRound",
      (_, scenario) =>
        formatMetric("weightedSavingPerRound", getScenarioMetricValue("weightedSavingPerRound", scenario)),
    ),
    {
      key: "companyBEP",
      label: getDisplayLabel("companyBEP", V.companyBEP.label).split(" (")[0],
      unit: V.companyBEP.unit || "-",
      tip: V.companyBEP.tip,
      format: (result) =>
        result.companyBEP === null
          ? "-"
          : sanitizeComparisonValue(
              fmtBEP("companyBEP", result.companyBEP * (result.years?.length || 5)),
            ),
      className: SIMULATOR_TYPOGRAPHY.tableCellStrong,
    },
    {
      key: "customerBEP",
      label: getDisplayLabel("customerBEP", V.customerBEP.label).split(" (")[0],
      unit: V.customerBEP.unit || "-",
      tip: V.customerBEP.tip,
      format: (result) => sanitizeComparisonValue(fmtBEP("customerBEP", result.customerBEP)),
      className: SIMULATOR_TYPOGRAPHY.tableCellStrong,
    },
    buildMetricRow(
      "expectedMaturitySurvivingRate",
      (result) => formatMetric("expectedMaturitySurvivingRate", result.expectedMaturitySurvivingRate),
    ),
    buildMetricRow(
      "avgAnnualVariableRevenue",
      (result) => formatMetric("avgAnnualVariableRevenue", result.avgAnnualVariableRevenue),
    ),
    buildMetricRow(
      "avgAnnualVariableCost",
      (result) => formatMetric("avgAnnualVariableCost", result.avgAnnualVariableCost),
    ),
    buildMetricRow(
      "avgAnnualVariableProfit",
      (result) => formatMetric("avgAnnualVariableProfit", result.avgAnnualVariableProfit),
    ),
    buildMetricRow(
      "totalExpectedRefundCost",
      (result) => formatMetric("totalExpectedRefundCost", result.totalExpectedRefundCost),
    ),
    buildMetricRow("ltv", (result) => formatMetric("ltv", result.ltv)),
  ];

  const handleDownloadCsv = () => {
    const headerRow = ["항목", "단위", "팁", ...allResults.map((result) => result.name)];
    const csvRows = [
      headerRow,
      ...rows.map((row) => [
        row.label,
        row.unit || "-",
        row.tip || "",
        ...allResults.map((result, index) => row.format(result, scenarios[index])),
      ]),
    ];
    const csvText = `\uFEFF${csvRows
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
      .join("\r\n")}`;
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement("a");
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;

    linkElement.href = url;
    linkElement.download = `compare-table-${localDate}.csv`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 flex items-center justify-end">
          <button
            onClick={handleDownloadCsv}
            type="button"
            title="CSV 다운로드"
            aria-label="CSV 다운로드"
            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-slate-400 transition hover:border-white/16 hover:bg-white/[0.1] hover:text-slate-200"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v11" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 20h14" />
            </svg>
            <span className="text-[10px] font-semibold leading-none tracking-[0.06em] text-current">CSV</span>
          </button>
        </div>
        <div className={SIMULATOR_STYLES.panelScroll}>
          <table className="w-full table-fixed" style={{ minWidth: `${compareTableMinWidth}px` }}>
            <colgroup>
              <col style={{ width: "240px" }} />
              <col style={{ width: "80px" }} />
              {allResults.map((_, index) => (
                <col key={index} style={{ width: index < 5 ? "88px" : "120px" }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="py-1.5 text-left">
                  <span className={`block ${SIMULATOR_TYPOGRAPHY.tableHead}`}>항목</span>
                </th>
                <th className="py-1.5 text-right">
                  <span className={`block whitespace-nowrap text-slate-500 ${SIMULATOR_TYPOGRAPHY.tableHead}`}>단위</span>
                </th>
                {allResults.map((result, index) => (
                  <th key={index} className="py-1.5 text-right">
                    <span className={`block whitespace-nowrap truncate ${SIMULATOR_TYPOGRAPHY.tableHead}`}>
                      {result.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className={`py-1.5 pr-3 ${SIMULATOR_TYPOGRAPHY.tableCell} whitespace-nowrap`}>
                    <Tip text={row.tip}>
                      <span className="border-b border-dotted border-slate-600">{row.label}</span>
                    </Tip>
                  </td>
                  <td className={`py-1.5 text-right whitespace-nowrap text-slate-500 ${SIMULATOR_TYPOGRAPHY.tableCell}`}>
                    {row.unit || "-"}
                  </td>
                  {allResults.map((result, index) => (
                    <td
                      key={index}
                      className={`py-1.5 text-right ${row.className || SIMULATOR_TYPOGRAPHY.tableCellStrong} whitespace-nowrap`}
                    >
                      {row.format(result, scenarios[index])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={SIMULATOR_STYLES.panel}>
          <div className={SIMULATOR_STYLES.panelHeading}>LTV 비교</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={allResults.map((result) => ({ name: result.name, ltv: result.ltv }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={CHART_TYPOGRAPHY.tick} />
              <YAxis tick={CHART_TYPOGRAPHY.tick} tickFormatter={(value) => fmt(value)} />
              <Tooltip {...tt} formatter={(value) => [fmt(value)]} />
              <Bar dataKey="ltv" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={SIMULATOR_STYLES.panel}>
          <div className={SIMULATOR_STYLES.panelHeading}>누적 LTV 추이</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="yearLabelByYear" tick={CHART_TYPOGRAPHY.tick} allowDuplicatedCategory={false} />
              <YAxis tick={CHART_TYPOGRAPHY.tick} tickFormatter={(value) => fmt(value)} />
              <Tooltip {...tt} formatter={(value) => [fmt(value)]} />
              <Legend wrapperStyle={CHART_TYPOGRAPHY.legend} />
              {allResults.map((result, index) => <Line key={index} data={result.years} dataKey="cumulativeLTVByYear" name={result.name} type="monotone" stroke={lineColors[index % lineColors.length]} strokeWidth={2} dot={{ r: 2 }} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}






