export const SIMULATOR_TYPOGRAPHY = {
  eyebrow: "text-[11px] font-medium tracking-[0.08em] text-slate-500",
  eyebrowAccent: "text-[11px] font-medium tracking-[0.08em] text-cyan-200/65",
  sectionTitle: "mb-4 flex items-center gap-3 text-[13px] font-semibold tracking-[0.03em] text-cyan-300/70",
  body: "text-[14px] leading-[1.6] text-slate-400",
  bodyStrong: "text-[14px] font-medium leading-[1.6] text-slate-300",
  bodyMuted: "text-[13px] leading-[1.55] text-slate-500",
  control: "text-[13px] font-medium leading-[1.4] tracking-[0.01em]",
  controlSmall: "text-[12px] font-medium leading-[1.35] tracking-[0.01em]",
  metric: "text-[28px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-slate-100",
  metricSub: "text-[13px] leading-[1.45] text-slate-500",
  tableHead: "text-[12px] font-medium leading-[1.35] text-slate-500",
  tableCell: "text-[13px] leading-[1.45] text-slate-300",
  tableCellStrong: "text-[13px] font-medium leading-[1.45] tabular-nums text-slate-200",
  tableNumber: "text-[13px] font-medium leading-[1.45] tabular-nums text-slate-300",
  chartTitle: "mb-2 text-[13px] font-semibold leading-[1.35] text-slate-400",
  tabKicker: "text-[11px] font-medium tracking-[0.08em] text-cyan-300/70",
  tabHero: "text-[22px] font-semibold leading-[1.08] tracking-[-0.04em] text-slate-100",
};

export const CHART_TYPOGRAPHY = {
  tick: { fill: "#94a3b8", fontSize: 11, fontWeight: 500 },
  label: { fill: "#64748b", fontSize: 11, fontWeight: 500 },
  legend: { fontSize: 11, fontWeight: 500 },
};

export const SIMULATOR_STYLES = {
  panel: "rounded-[24px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md md:p-5",
  panelScroll: "rounded-[24px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md overflow-x-auto md:p-5",
  modalPanel: "w-full max-w-2xl rounded-[28px] bg-slate-950/92 p-5 backdrop-blur-xl",
  tableWrap: "overflow-x-auto rounded-[24px] bg-slate-950/80",
  inlineInfoBox: "rounded-2xl bg-slate-950/92 px-3 py-2.5 text-[13px] leading-[1.5] backdrop-blur-md",
  inputField: "w-full rounded-xl border border-white/18 bg-slate-800/96 px-3 py-2.5 text-[14px] font-medium leading-[1.3] tabular-nums text-slate-100 text-right outline-none transition focus:border-cyan-300/44 focus:ring-1 focus:ring-cyan-400/18",
  selectField: "w-full rounded-xl border border-white/18 bg-slate-800/96 px-3 py-2.5 text-[14px] font-medium leading-[1.3] text-slate-100 outline-none transition focus:border-cyan-300/44 focus:ring-1 focus:ring-cyan-400/18",
  tableNumberInput: "w-20 rounded-lg border border-white/18 bg-slate-800/96 px-2 py-2 text-center text-[13px] font-medium leading-[1.35] tabular-nums text-slate-100 outline-none transition focus:border-cyan-300/44 focus:ring-1 focus:ring-cyan-400/18",
  yearNumberInput: "w-14 rounded-lg border border-white/18 bg-slate-800/96 px-2 py-1.5 text-center text-[13px] font-medium leading-[1.35] tabular-nums text-slate-100 outline-none transition focus:border-cyan-300/44 focus:ring-1 focus:ring-cyan-400/18",
  modalTextarea: "min-h-[260px] w-full rounded-[22px] border border-transparent bg-slate-950/95 p-4 font-mono text-[12px] leading-[1.55] text-slate-200 outline-none resize-none transition focus:ring-1 focus:ring-cyan-500/30",
  cardTitle: "text-[12px] font-semibold tracking-[0.05em] text-slate-300",
  cardValue: "mt-3 text-[28px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-slate-100",
  cardMeta: "text-[14px] font-medium leading-[1.2] tracking-[0.01em] text-slate-300",
  cardSub: "mt-2.5 text-[13px] leading-[1.5] text-slate-400",
  sectionTitle: SIMULATOR_TYPOGRAPHY.sectionTitle,
  tipBubble: "pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-[320px] rounded-2xl bg-slate-950/95 px-3 py-2.5 text-[13px] leading-[1.5] text-slate-200 opacity-0 transition duration-150 group-hover:opacity-100 whitespace-pre-line",
  topIconButton: "inline-flex h-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] px-4 text-[13px] font-medium tracking-[0.01em] text-slate-300 transition hover:border-white/18 hover:bg-white/[0.13] hover:text-slate-100",
  utilityIconButton: "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] text-slate-400 transition hover:border-white/18 hover:bg-white/[0.13] hover:text-slate-100",
  ghostButton: "inline-flex items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/14 px-3 py-2 text-[13px] font-medium tracking-[0.01em] text-cyan-50 transition hover:border-cyan-300/30 hover:bg-cyan-500/22 hover:text-white",
  ghostButtonSmall: "inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/[0.08] px-2.5 py-1.5 text-[12px] font-medium tracking-[0.01em] text-slate-300 transition hover:border-white/18 hover:bg-white/[0.13] hover:text-slate-100",
  primaryButton: "border border-cyan-300/26 bg-cyan-400/22 text-cyan-50 hover:border-cyan-200/36 hover:bg-cyan-400/30 hover:text-white",
  primaryButtonBlock: "inline-flex w-full items-center justify-center rounded-2xl border border-cyan-300/26 bg-cyan-400/22 px-4 py-3 text-[13px] font-medium tracking-[0.01em] text-cyan-50 transition hover:border-cyan-200/36 hover:bg-cyan-400/30 hover:text-white",
  secondaryButtonBlock: "inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3 text-[13px] font-medium tracking-[0.01em] text-slate-300 transition hover:border-white/18 hover:bg-white/[0.13] hover:text-slate-100",
  closeButton: "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl text-slate-500 transition hover:text-slate-100",
  closeTextButton: "text-[13px] font-medium tracking-[0.01em] text-slate-500 transition hover:text-slate-200",
  heroInput: "min-w-[220px] rounded-2xl border border-transparent bg-slate-950/86 px-4 py-3 text-[14px] font-medium leading-[1.3] text-slate-200 outline-none transition focus:ring-1 focus:ring-cyan-500/30",
  headerBadge: "flex h-16 w-16 items-center justify-center text-cyan-100",
  headerEyebrow: "text-[11px] font-medium tracking-[0.08em] text-cyan-200/65",
  headerTitle: "truncate text-left text-[22px] font-semibold leading-[1.1] tracking-[-0.035em] text-white",
  headerTitleInput: "w-full max-w-[240px] border-0 bg-transparent p-0 text-[22px] font-semibold leading-[1.1] tracking-[-0.035em] text-white outline-none shadow-none ring-0 focus:border-0 focus:ring-0 focus:outline-none",
  headerTitleRow: "flex min-w-0 items-center gap-2",
  headerScenarioTrigger: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/[0.08] hover:text-white",
  headerScenarioPanel: "mt-4 rounded-[24px] border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md",
  scenarioChipInput: "min-w-[120px] border-0 bg-transparent p-0 text-[13px] font-medium leading-[1.35] text-current/75 outline-none shadow-none ring-0 focus:border-0 focus:ring-0 focus:outline-none",
  panelHeading: SIMULATOR_TYPOGRAPHY.chartTitle,
  contentShell: "mt-2 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] backdrop-blur-xl",
  contentShellHeader: "px-4 py-4 md:px-5",
  contentShellBody: "p-4 md:p-5",
  tabSwitcherWrap: "mt-4 flex min-w-max gap-1.5 pt-3 md:min-w-0 md:flex-wrap",
  inputGroupShell: "rounded-[24px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md md:p-5",
  inputGroupHeader: "mb-4 flex items-start justify-between gap-3 border-b border-white/5 bg-transparent pb-3",
  tableSectionShell: "overflow-x-auto rounded-[20px] border border-white/10 bg-white/[0.07] backdrop-blur-md",
  inputGroupContract: "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]",
  inputGroupForecast: "bg-[linear-gradient(180deg,rgba(6,182,212,0.06),rgba(6,182,212,0))]",
  inputGroupLabelContract: "inline-flex items-center rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-medium tracking-[0.01em] text-slate-300",
  inputGroupLabelForecast: "inline-flex items-center rounded-full bg-cyan-500/12 px-2.5 py-1 text-[12px] font-medium tracking-[0.01em] text-cyan-200",
  forecastSticker: "inline-flex items-center rounded-full bg-cyan-500/12 px-2 py-0.5 text-[11px] font-medium tracking-[0.01em] text-cyan-200",
  inputReadonlyBox: "rounded-[22px] border border-white/10 bg-white/[0.08] p-3.5",
  tableGroupContract: "bg-white/[0.05]",
  tableGroupForecast: "bg-cyan-500/[0.08]",
};

export function getTabButtonClass(active) {
  return [
    "inline-flex shrink-0 items-center rounded-xl px-3 py-2 text-[13px] font-medium tracking-[0.01em] transition",
    active
      ? "border border-cyan-300/24 bg-cyan-400/18 text-cyan-50"
      : "border border-transparent bg-transparent text-slate-500 hover:border-white/12 hover:bg-white/[0.08] hover:text-slate-200",
  ].join(" ");
}

export function getScenarioChipClass(active) {
  return [
    "inline-flex max-w-full items-center rounded-2xl border px-3 py-2.5 text-[13px] font-medium leading-[1.35] tracking-[0.01em] transition",
    active
      ? "border-cyan-300/24 bg-cyan-400/18 text-white"
      : "border-white/10 bg-white/[0.07] text-slate-400 hover:border-white/16 hover:bg-white/[0.12] hover:text-slate-200",
  ].join(" ");
}

export function getUsageEditButtonClass(active) {
  return [
    "inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-[12px] font-medium tracking-[0.01em] transition",
    active
      ? "border-cyan-300/24 bg-cyan-400/18 text-cyan-50"
      : "border-white/10 bg-white/[0.07] text-slate-400 hover:border-white/16 hover:bg-white/[0.12] hover:text-slate-200",
  ].join(" ");
}
