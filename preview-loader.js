const root = document.getElementById('root');
const previewVersion = '20260328-2';

const sourceFiles = [
  'simulator/scenario.js',
  'simulator/formatters.js',
  'simulator/formulas.js',
  'simulator/registry.js',
  'simulator/selectors.js',
  'simulator/text.js',
  'simulator/theme.js',
  'simulator/styles.js',
  'simulator/ui.jsx',
  'simulator/constants.js',
  'simulator/scenarioState.js',
  'simulator/scenarioTransfer.js',
  'simulator/tabs/InputTab.jsx',
  'simulator/tabs/LTVTab.jsx',
  'simulator/tabs/BEPTab.jsx',
  'simulator/tabs/SensitivityTab.jsx',
  'simulator/tabs/CompareTab.jsx',
  'simulator/engine.js',
  'simulator/app.jsx',
];

function setStatus(message) {
  root.innerHTML = `<div class="preview-status">${message}</div>`;
}

function withPreviewVersion(path) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}v=${previewVersion}`;
}

function stripImports(text) {
  return text
    .replace(/^\s*import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?\s*/gm, '')
    .replace(/^\s*import\s+["'][^"']+["'];?\s*/gm, '');
}

function stripExports(text) {
  return text
    .replace(/^\s*export\s*\{[\s\S]*?\};?\s*$/gm, '')
    .replace(/^export\s+/gm, '');
}

function createRechartsFallback(React) {
  const passthrough = ({ children }) => React.createElement(React.Fragment, null, children);
  const box = ({ children }) =>
    React.createElement('div', { style: { minHeight: '120px' } }, children);

  return {
    LineChart: box,
    Line: passthrough,
    BarChart: box,
    Bar: passthrough,
    Cell: passthrough,
    XAxis: passthrough,
    YAxis: passthrough,
    CartesianGrid: passthrough,
    Tooltip: passthrough,
    Legend: passthrough,
    ResponsiveContainer: box,
    ComposedChart: box,
    Area: passthrough,
    ReferenceLine: passthrough,
    ReferenceArea: passthrough,
  };
}

function assertPreviewDependencies() {
  if (!window.React) {
    throw new Error('React failed to load');
  }

  if (!window.ReactDOM) {
    throw new Error('ReactDOM failed to load');
  }

  if (!window.Babel) {
    throw new Error('Babel failed to load');
  }

  if (!window.Recharts) {
    throw new Error('Recharts failed to load');
  }
}

function buildRuntimeSource(files) {
  const [
    scenario,
    formatters,
    formulas,
    registry,
    selectors,
    text,
    theme,
    styles,
    ui,
    constants,
    scenarioState,
    scenarioTransfer,
    inputTab,
    dashboardTab,
    bepTab,
    sensitivityTab,
    compareTab,
    engine,
    app,
  ] = files;
  const appBody = stripImports(app)
    .replace('export default function App(', 'function App(')
    .trim();

  return `
const { useEffect, useState, useMemo, useCallback } = React;
  const {
    LineChart,
    Line,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  ReferenceLine,
  ReferenceArea,
} = Recharts;

${stripExports(stripImports(scenario)).trim()}

${stripExports(stripImports(formatters)).trim()}

${stripExports(stripImports(formulas)).trim()}

${stripExports(stripImports(registry)).trim()}

${stripExports(stripImports(selectors)).trim()}

${stripExports(stripImports(text)).trim()}

${stripExports(stripImports(theme)).trim()}

${stripExports(stripImports(styles)).trim()}

${stripExports(stripImports(ui)).trim()}

${stripExports(stripImports(constants)).trim()}

${stripExports(stripImports(scenarioState)).trim()}

${stripExports(stripImports(scenarioTransfer)).trim()}

${stripExports(stripImports(inputTab)).trim()}

${stripExports(stripImports(dashboardTab)).trim()}

${stripExports(stripImports(bepTab)).trim()}

${stripExports(stripImports(sensitivityTab)).trim()}

${stripExports(stripImports(compareTab)).trim()}

${stripExports(stripImports(engine)).trim()}

${appBody}

const previewRoot = ReactDOM.createRoot(document.getElementById('root'));
previewRoot.render(<App />);
`;
}

async function loadSources() {
  const responses = await Promise.all(
    sourceFiles.map(async (path) => {
      const response = await fetch(withPreviewVersion(path));

      if (!response.ok) {
        throw new Error(`${path} 불러오기 실패 (${response.status})`);
      }

      return response.text();
    }),
  );

  return responses;
}

async function boot() {
  try {
    await window.__previewDepsReady;
    assertPreviewDependencies();
    const rechartsGlobal = window.Recharts || createRechartsFallback(window.React);

    const files = await loadSources();
    const source = buildRuntimeSource(files);
    const transformed = Babel.transform(source, {
      presets: ['react'],
      sourceType: 'script',
    }).code;

    new Function('React', 'ReactDOM', 'Recharts', transformed)(
      window.React,
      window.ReactDOM,
      rechartsGlobal,
    );
  } catch (error) {
    console.error(error);
    setStatus(
      [
        '미리보기 실행에 실패했습니다.',
        '',
        `오류: ${error.message}`,
        '',
        '브라우저에서 file:// 경로의 fetch가 막히면 간단한 로컬 서버로 여세요.',
        '예: <code>python -m http.server 8000</code>',
      ].join('<br />'),
    );
  }
}

boot();

