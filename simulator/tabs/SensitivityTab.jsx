import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_TYPOGRAPHY, SIMULATOR_STYLES, SIMULATOR_TYPOGRAPHY } from "../styles";
import { getDisplayLabel } from "../text";

export function SensitivityTab({ result, V, fmt, tt }) {
  const charts = [
    { title: `${getDisplayLabel("companionsByRegion", V.companionsByRegion.label)} 민감도`, sub: "LTV 기준", data: result.companionSensitivity, color: "#8b5cf6", axisLabel: getDisplayLabel("companionsByRegion", V.companionsByRegion.label) },
    { title: `${getDisplayLabel("membersByRegion", V.membersByRegion.label)} 민감도`, sub: "LTV 기준", data: result.membersSensitivity, color: "#f59e0b", axisLabel: getDisplayLabel("membersByRegion", V.membersByRegion.label) },
    { title: `${getDisplayLabel("yearlyUsageRateByRegion", V.yearlyUsageRateByRegion.label)} 민감도`, sub: `LTV 기준 (${getDisplayLabel("yearlyUsageRateByRegion", V.yearlyUsageRateByRegion.label)} 고정 적용)`, data: result.usageSensitivity, color: "#10b981", axisLabel: getDisplayLabel("yearlyUsageRateByRegion", V.yearlyUsageRateByRegion.label) },
  ];

  return (
    <div className="space-y-3">
      {charts.map((chart) => (
        <div key={chart.title} className={SIMULATOR_STYLES.panel}>
          <div className={SIMULATOR_STYLES.panelHeading}>{chart.title}<span className={SIMULATOR_TYPOGRAPHY.bodyMuted}> · {chart.sub}</span></div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="rate" tick={CHART_TYPOGRAPHY.tick} label={{ value: chart.axisLabel, position: "insideBottom", offset: -5, ...CHART_TYPOGRAPHY.label }} />
              <YAxis tick={CHART_TYPOGRAPHY.tick} tickFormatter={(value) => fmt(value)} label={{ value: "LTV", angle: -90, position: "insideLeft", ...CHART_TYPOGRAPHY.label }} />
              <Tooltip {...tt} formatter={(value) => [fmt(value), "LTV"]} />
              <Area type="monotone" dataKey="ltv" name="LTV" fill={chart.color} fillOpacity={0.15} stroke={chart.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}




