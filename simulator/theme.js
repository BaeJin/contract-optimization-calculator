export const SIMULATOR_THEME = {
  fontFamily: "'SUIT Variable', 'SUIT', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  rootClassName: {
    dark: "sim-dark",
    light: "sim-light",
  },
  tooltip: {
    dark: {
      contentStyle: {
        background: "rgba(18, 26, 33, 0.98)",
        border: "1px solid rgba(86, 102, 118, 0.18)",
        borderRadius: 18,
        fontFamily: "'SUIT Variable', 'SUIT', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 12,
        fontWeight: 500,
        backdropFilter: "blur(18px)",
      },
      itemStyle: { color: "#d4dde6" },
      labelStyle: { color: "#8894a3", fontSize: 12, fontWeight: 500 },
    },
    light: {
      contentStyle: {
        background: "rgba(255, 252, 247, 0.98)",
        border: "1px solid rgba(194, 184, 168, 0.45)",
        borderRadius: 18,
        fontFamily: "'SUIT Variable', 'SUIT', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 12,
        fontWeight: 500,
        backdropFilter: "blur(18px)",
      },
      itemStyle: { color: "#23313d" },
      labelStyle: { color: "#6a7785", fontSize: 12, fontWeight: 500 },
    },
  },
  cardAccents: {
    cyan: "border-transparent shadow-[inset_0_1px_0_rgba(111,169,160,0.08)]",
    green: "border-transparent shadow-[inset_0_1px_0_rgba(129,171,141,0.08)]",
    amber: "border-transparent shadow-[inset_0_1px_0_rgba(188,156,105,0.08)]",
    rose: "border-transparent shadow-[inset_0_1px_0_rgba(185,133,142,0.08)]",
    purple: "border-transparent shadow-[inset_0_1px_0_rgba(146,140,182,0.08)]",
    blue: "border-transparent shadow-[inset_0_1px_0_rgba(114,154,183,0.08)]",
  },
};

export function getTooltipTheme(isDark) {
  return isDark ? SIMULATOR_THEME.tooltip.dark : SIMULATOR_THEME.tooltip.light;
}

export function getSimulatorStyleText() {
  return `
    @import url("https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css");

    .sim-dark,
    .sim-light {
      font-feature-settings: "tnum" 1, "ss03" 1;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .sim-dark .recharts-text,
    .sim-light .recharts-text,
    .sim-dark .recharts-legend-item-text,
    .sim-light .recharts-legend-item-text {
      font-family: inherit;
      font-feature-settings: "tnum" 1, "ss03" 1;
    }

    .sim-dark {
      min-height: 100vh;
      background:
        radial-gradient(circle at top, rgba(84, 161, 149, 0.06), transparent 24%),
        linear-gradient(180deg, #0b1014 0%, #0e1419 38%, #11181f 100%);
      color: #d7e0e7;
    }
    .sim-dark ::selection {
      background: rgba(84, 161, 149, 0.22);
    }
    .sim-dark [class*="border-white/"],
    .sim-dark [class*="border-slate-"],
    .sim-dark [class*="border-cyan-"],
    .sim-dark [class*="border-emerald-"],
    .sim-dark [class*="border-rose-"] {
      border-color: rgba(120, 134, 148, 0.18) !important;
    }
    .sim-dark .bg-slate-950,
    .sim-dark [class*="bg-slate-950/"] {
      background-color: rgba(32, 41, 51, 0.96) !important;
    }
    .sim-dark .bg-slate-900,
    .sim-dark [class*="bg-slate-900/"] {
      background-color: rgba(38, 49, 60, 0.96) !important;
    }
    .sim-dark .bg-slate-800,
    .sim-dark [class*="bg-slate-800/"] {
      background-color: rgba(46, 57, 69, 0.94) !important;
    }
    .sim-dark [class*="bg-black/"] {
      background-color: rgba(11, 16, 20, 0.78) !important;
    }
    .sim-dark [class*="bg-white/"] {
      background-color: rgba(27, 35, 43, 0.88) !important;
    }
    .sim-dark .bg-white\\/\\[0\\.07\\],
    .sim-dark [class*="bg-white/[0.07]"] {
      background-color: rgba(27, 35, 43, 0.88) !important;
    }
    .sim-dark .bg-white\\/\\[0\\.1\\],
    .sim-dark [class*="bg-white/[0.1]"] {
      background-color: rgba(35, 45, 55, 0.96) !important;
    }
    .sim-dark .bg-white\\/10,
    .sim-dark [class*="bg-white/10"] {
      background-color: rgba(31, 40, 49, 0.92) !important;
    }
    .sim-dark .text-white,
    .sim-dark .text-slate-100 {
      color: #e5edf3 !important;
    }
    .sim-dark .text-slate-200 {
      color: #cfd9e2 !important;
    }
    .sim-dark .text-slate-300 {
      color: #b5c0ca !important;
    }
    .sim-dark .text-slate-400 {
      color: #90a0af !important;
    }
    .sim-dark .text-slate-500,
    .sim-dark .text-slate-600 {
      color: #6f7f8f !important;
    }
    .sim-dark .text-cyan-50,
    .sim-dark .text-cyan-100,
    .sim-dark .text-cyan-200,
    .sim-dark .text-cyan-300,
    .sim-dark .text-cyan-400 {
      color: #9ad2c8 !important;
    }
    .sim-dark .text-emerald-300,
    .sim-dark .text-emerald-400 {
      color: #8fb8a1 !important;
    }
    .sim-dark .text-rose-400 {
      color: #c58b95 !important;
    }
    .sim-dark input,
    .sim-dark select,
    .sim-dark textarea {
      color: #e1e9f0 !important;
      background: #30404d !important;
      border: 1px solid rgba(142, 157, 171, 0.26) !important;
      box-shadow: none !important;
      font-variant-numeric: tabular-nums;
    }
    .sim-dark,
    .sim-dark * {
      scrollbar-width: thin;
      scrollbar-color: rgba(128, 170, 164, 0.58) rgba(18, 26, 33, 0.32);
    }
    .sim-dark ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .sim-dark ::-webkit-scrollbar-track {
      background: rgba(18, 26, 33, 0.32);
      border-radius: 999px;
    }
    .sim-dark ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(136, 190, 181, 0.72), rgba(92, 146, 138, 0.82));
      border: 2px solid rgba(18, 26, 33, 0.2);
      border-radius: 999px;
    }
    .sim-dark ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(152, 206, 197, 0.84), rgba(106, 160, 151, 0.92));
    }
    .sim-dark input:focus,
    .sim-dark select:focus,
    .sim-dark textarea:focus {
      outline: none !important;
      border: 1px solid rgba(132, 206, 194, 0.42) !important;
      box-shadow: 0 0 0 1px rgba(132, 206, 194, 0.18) !important;
    }
    .sim-dark input[class*="bg-slate-"],
    .sim-dark select[class*="bg-slate-"],
    .sim-dark textarea[class*="bg-slate-"] {
      background: #30404d !important;
    }
    .sim-dark .hover\\:text-white:hover {
      color: #dbe3ea !important;
    }
    .sim-dark .hover\\:text-rose-400:hover {
      color: #d4a0a9 !important;
    }

    .sim-light {
      min-height: 100vh;
      background:
        radial-gradient(circle at top, rgba(31, 102, 96, 0.06), transparent 28%),
        linear-gradient(180deg, #f8f3ec 0%, #f2ebe2 40%, #e7ded1 100%);
      color: #24313b;
    }
    .sim-light ::selection {
      background: rgba(31, 102, 96, 0.16);
    }
    .sim-light [class*="border-white/"],
    .sim-light [class*="border-slate-"],
    .sim-light [class*="border-cyan-"],
    .sim-light [class*="border-emerald-"],
    .sim-light [class*="border-rose-"] {
      border-color: rgba(176, 162, 144, 0.48) !important;
    }
    .sim-light .bg-slate-950,
    .sim-light [class*="bg-slate-950/"] {
      background-color: rgba(255, 252, 248, 0.98) !important;
    }
    .sim-light .bg-slate-900,
    .sim-light [class*="bg-slate-900/"] {
      background-color: rgba(245, 238, 229, 0.96) !important;
    }
    .sim-light .bg-slate-800,
    .sim-light [class*="bg-slate-800/"] {
      background-color: rgba(236, 226, 213, 0.96) !important;
    }
    .sim-light [class*="bg-black/"] {
      background-color: rgba(231, 222, 210, 0.92) !important;
    }
    .sim-light [class*="bg-white/"] {
      background-color: rgba(248, 242, 234, 0.96) !important;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.55), 0 10px 24px rgba(115, 98, 78, 0.05) !important;
    }
    .sim-light .bg-white\\/\\[0\\.07\\],
    .sim-light [class*="bg-white/[0.07]"] {
      background-color: rgba(248, 242, 234, 0.96) !important;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.55), 0 10px 24px rgba(115, 98, 78, 0.05) !important;
    }
    .sim-light .bg-white\\/\\[0\\.1\\],
    .sim-light [class*="bg-white/[0.1]"] {
      background-color: rgba(239, 230, 219, 0.98) !important;
    }
    .sim-light .bg-white\\/10,
    .sim-light [class*="bg-white/10"] {
      background-color: rgba(244, 236, 227, 0.98) !important;
    }
    .sim-light .text-white,
    .sim-light .text-slate-100 {
      color: #24313b !important;
    }
    .sim-light .text-slate-200,
    .sim-light .text-slate-300 {
      color: #33414b !important;
    }
    .sim-light .text-slate-400 {
      color: #667380 !important;
    }
    .sim-light .text-slate-500,
    .sim-light .text-slate-600 {
      color: #7f897f !important;
    }
    .sim-light .text-cyan-50,
    .sim-light .text-cyan-100,
    .sim-light .text-cyan-200,
    .sim-light .text-cyan-300,
    .sim-light .text-cyan-400 {
      color: #0f5551 !important;
    }
    .sim-light .text-cyan-200\\/65,
    .sim-light [class*="text-cyan-200/65"] {
      color: #5a6a74 !important;
    }
    .sim-light .text-cyan-300\\/70,
    .sim-light [class*="text-cyan-300/70"] {
      color: #325163 !important;
    }
    .sim-light .text-emerald-300,
    .sim-light .text-emerald-400 {
      color: #3f7755 !important;
    }
    .sim-light .text-rose-400 {
      color: #a05f6c !important;
    }
    .sim-light input,
    .sim-light select,
    .sim-light textarea {
      color: #24313b !important;
      background: #fdf8f1 !important;
      border: 1px solid rgba(180, 166, 149, 0.78) !important;
      box-shadow: none !important;
      font-variant-numeric: tabular-nums;
    }
    .sim-light,
    .sim-light * {
      scrollbar-width: thin;
      scrollbar-color: rgba(79, 124, 120, 0.58) rgba(214, 204, 190, 0.42);
    }
    .sim-light ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .sim-light ::-webkit-scrollbar-track {
      background: rgba(214, 204, 190, 0.42);
      border-radius: 999px;
    }
    .sim-light ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(104, 145, 141, 0.72), rgba(74, 114, 110, 0.84));
      border: 2px solid rgba(249, 243, 234, 0.5);
      border-radius: 999px;
    }
    .sim-light ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(91, 132, 128, 0.82), rgba(62, 102, 98, 0.92));
    }
    .sim-light input:focus,
    .sim-light select:focus,
    .sim-light textarea:focus {
      outline: none !important;
      border: 1px solid rgba(15, 85, 81, 0.52) !important;
      box-shadow: 0 0 0 1px rgba(15, 85, 81, 0.14) !important;
    }
    .sim-light input[class*="bg-slate-"],
    .sim-light select[class*="bg-slate-"],
    .sim-light textarea[class*="bg-slate-"] {
      background: #fdf8f1 !important;
    }
    .sim-light .hover\\:text-white:hover {
      color: #24313b !important;
    }
    .sim-light .hover\\:text-rose-400:hover {
      color: #a05f6c !important;
    }
    .sim-light .bg-cyan-500\\/8,
    .sim-light [class*="bg-cyan-500/8"] {
      background-color: rgba(15, 85, 81, 0.08) !important;
    }
    .sim-light .bg-cyan-500\\/10,
    .sim-light [class*="bg-cyan-500/10"] {
      background-color: rgba(15, 85, 81, 0.09) !important;
    }
    .sim-light .bg-cyan-500\\/12,
    .sim-light [class*="bg-cyan-500/12"] {
      background-color: rgba(15, 85, 81, 0.1) !important;
    }
    .sim-light .bg-cyan-500\\/14,
    .sim-light [class*="bg-cyan-500/14"] {
      background-color: rgba(15, 85, 81, 0.11) !important;
    }
    .sim-light .bg-cyan-500\\/18,
    .sim-light [class*="bg-cyan-500/18"] {
      background-color: rgba(15, 85, 81, 0.12) !important;
    }
    .sim-light .bg-cyan-500\\/20,
    .sim-light [class*="bg-cyan-500/20"] {
      background-color: rgba(15, 85, 81, 0.16) !important;
    }
    .sim-light .bg-cyan-400\\/18,
    .sim-light [class*="bg-cyan-400/18"] {
      background-color: rgba(15, 85, 81, 0.14) !important;
    }
    .sim-light .bg-cyan-400\\/22,
    .sim-light [class*="bg-cyan-400/22"] {
      background-color: rgba(15, 85, 81, 0.18) !important;
    }
    .sim-light .bg-cyan-400\\/30,
    .sim-light [class*="bg-cyan-400/30"] {
      background-color: rgba(15, 85, 81, 0.22) !important;
    }
    .sim-dark .bg-cyan-500\\/8,
    .sim-dark [class*="bg-cyan-500/8"] {
      background-color: rgba(74, 179, 165, 0.1) !important;
    }
    .sim-dark .bg-cyan-500\\/10,
    .sim-dark [class*="bg-cyan-500/10"] {
      background-color: rgba(74, 179, 165, 0.12) !important;
    }
    .sim-dark .bg-cyan-500\\/12,
    .sim-dark [class*="bg-cyan-500/12"] {
      background-color: rgba(74, 179, 165, 0.14) !important;
    }
    .sim-dark .bg-cyan-500\\/14,
    .sim-dark [class*="bg-cyan-500/14"] {
      background-color: rgba(74, 179, 165, 0.16) !important;
    }
    .sim-dark .bg-cyan-500\\/18,
    .sim-dark [class*="bg-cyan-500/18"] {
      background-color: rgba(74, 179, 165, 0.2) !important;
    }
    .sim-dark .bg-cyan-500\\/20,
    .sim-dark [class*="bg-cyan-500/20"] {
      background-color: rgba(74, 179, 165, 0.22) !important;
    }
    .sim-dark .bg-cyan-400\\/18,
    .sim-dark [class*="bg-cyan-400/18"] {
      background-color: rgba(107, 198, 187, 0.2) !important;
    }
    .sim-dark .bg-cyan-400\\/22,
    .sim-dark [class*="bg-cyan-400/22"] {
      background-color: rgba(107, 198, 187, 0.24) !important;
    }
    .sim-dark .bg-cyan-400\\/30,
    .sim-dark [class*="bg-cyan-400/30"] {
      background-color: rgba(107, 198, 187, 0.32) !important;
    }
  `;
}
