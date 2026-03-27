import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const registryPath = path.join(rootDir, 'simulator', 'registry.js');
const formulasPath = path.join(rootDir, 'simulator', 'formulas.js');
const docsDir = path.join(rootDir, 'docs');
const jsonOutputPath = path.join(docsDir, 'variable_dependency_graph.json');
const mdOutputPath = path.join(docsDir, 'variable_dependency_graph.md');

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function extractMetricKeys(registrySource) {
  const metricBlockMatch = registrySource.match(/const metricDefinitions = \{([\s\S]*?)\n\};/);
  if (!metricBlockMatch) {
    throw new Error('Could not find metricDefinitions in simulator/registry.js');
  }

  const metricBlock = metricBlockMatch[1];
  const keys = [];
  const keyRegex = /^\s{2}([A-Za-z0-9_]+):\screateMeta\(/gm;
  let match = keyRegex.exec(metricBlock);

  while (match) {
    keys.push(match[1]);
    match = keyRegex.exec(metricBlock);
  }

  return keys;
}

function extractObjectBlock(source, startToken) {
  const startIndex = source.indexOf(startToken);
  if (startIndex === -1) {
    throw new Error(`Could not find token: ${startToken}`);
  }

  const braceStart = source.indexOf('{', startIndex);
  if (braceStart === -1) {
    throw new Error(`Could not find opening brace for: ${startToken}`);
  }

  let depth = 0;

  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart + 1, index);
      }
    }
  }

  throw new Error(`Could not find closing brace for: ${startToken}`);
}

function splitTopLevelEntries(objectBody) {
  const entries = [];
  let current = '';
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;
  let quote = null;
  let escaped = false;

  for (let index = 0; index < objectBody.length; index += 1) {
    const char = objectBody[index];

    current += char;

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }

    if (char === '(') depthParen += 1;
    if (char === ')') depthParen -= 1;
    if (char === '{') depthBrace += 1;
    if (char === '}') depthBrace -= 1;
    if (char === '[') depthBracket += 1;
    if (char === ']') depthBracket -= 1;

    if (
      char === ',' &&
      depthParen === 0 &&
      depthBrace === 0 &&
      depthBracket === 0
    ) {
      const trimmed = current.slice(0, -1).trim();
      if (trimmed) {
        entries.push(trimmed);
      }
      current = '';
    }
  }

  const trimmed = current.trim();
  if (trimmed) {
    entries.push(trimmed);
  }

  return entries;
}

function extractFormulaBodies(formulasSource) {
  const formulasBody = extractObjectBlock(formulasSource, 'export const formulaRegistry =');
  const entries = splitTopLevelEntries(formulasBody);
  const formulas = new Map();

  for (const entry of entries) {
    const separatorIndex = entry.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = entry.slice(0, separatorIndex).trim();
    const expression = entry.slice(separatorIndex + 1).trim();
    formulas.set(key, expression);
  }

  return formulas;
}

function collectMatches(source, pattern) {
  const results = new Set();
  let match = pattern.exec(source);

  while (match) {
    results.add(match[1]);
    match = pattern.exec(source);
  }

  return [...results].sort();
}

function buildGraphData(metricKeys, formulaBodies) {
  const metricKeySet = new Set(metricKeys);
  const nodes = new Map();
  const edges = [];

  function ensureNode(id, type) {
    if (!nodes.has(id)) {
      nodes.set(id, { id, type });
    }
  }

  for (const key of metricKeys) {
    ensureNode(key, 'metric');
  }

  for (const key of metricKeys) {
    const body = formulaBodies.get(key);
    if (!body) {
      continue;
    }

    const metricDeps = collectMatches(body, /formulaRegistry\.([A-Za-z0-9_]+)/g).filter(
      (dep) => dep !== key && metricKeySet.has(dep),
    );
    const scenarioDeps = collectMatches(body, /scenario\.([A-Za-z0-9_]+)/g);
    const regionDeps = collectMatches(body, /region\.([A-Za-z0-9_]+)/g);
    const valueDeps = collectMatches(body, /values\.([A-Za-z0-9_]+)/g);

    for (const dep of metricDeps) {
      ensureNode(dep, 'metric');
      edges.push({ from: key, to: dep, type: 'metric' });
    }

    for (const dep of scenarioDeps) {
      const nodeId = `scenario.${dep}`;
      ensureNode(nodeId, 'scenario');
      edges.push({ from: key, to: nodeId, type: 'scenario' });
    }

    for (const dep of regionDeps) {
      const nodeId = `region.${dep}`;
      ensureNode(nodeId, 'region');
      edges.push({ from: key, to: nodeId, type: 'region' });
    }

    for (const dep of valueDeps) {
      const nodeId = metricKeySet.has(dep) ? dep : `values.${dep}`;
      ensureNode(nodeId, metricKeySet.has(dep) ? 'metric' : 'value');
      edges.push({
        from: key,
        to: nodeId,
        type: metricKeySet.has(dep) ? 'metric-value' : 'value',
      });
    }
  }

  const nodeList = [...nodes.values()].sort((left, right) => left.id.localeCompare(right.id));
  const edgeList = edges.sort((left, right) => {
    const leftKey = `${left.from}->${left.to}`;
    const rightKey = `${right.from}->${right.to}`;
    return leftKey.localeCompare(rightKey);
  });

  const metrics = metricKeys.map((key) => ({
    key,
    hasFormula: formulaBodies.has(key),
    dependencies: edgeList.filter((edge) => edge.from === key),
  }));

  return {
    generatedAt: new Date().toISOString(),
    nodeCount: nodeList.length,
    edgeCount: edgeList.length,
    nodes: nodeList,
    edges: edgeList,
    metrics,
  };
}

function toMermaidId(nodeId) {
  return nodeId.replace(/[^A-Za-z0-9_]/g, '_');
}

function toMermaidLabel(nodeId) {
  return nodeId.replace(/"/g, '\\"');
}

function buildMermaid(graph) {
  const lines = ['graph LR'];

  for (const node of graph.nodes) {
    const mermaidId = toMermaidId(node.id);
    const label = toMermaidLabel(node.id);
    let shape = `["${label}"]`;

    if (node.type === 'metric') {
      shape = `["${label}"]`;
    } else if (node.type === 'scenario') {
      shape = `(["${label}"])`;
    } else if (node.type === 'region') {
      shape = `(["${label}"])`;
    } else if (node.type === 'value') {
      shape = `{{"${label}"}}`;
    }

    lines.push(`  ${mermaidId}${shape}`);
  }

  for (const edge of graph.edges) {
    lines.push(`  ${toMermaidId(edge.from)} --> ${toMermaidId(edge.to)}`);
  }

  lines.push('');
  lines.push('  classDef metric fill:#0f172a,stroke:#38bdf8,color:#e2e8f0,stroke-width:1px;');
  lines.push('  classDef scenario fill:#0f172a,stroke:#22c55e,color:#e2e8f0,stroke-width:1px;');
  lines.push('  classDef region fill:#0f172a,stroke:#f59e0b,color:#e2e8f0,stroke-width:1px;');
  lines.push('  classDef value fill:#0f172a,stroke:#a78bfa,color:#e2e8f0,stroke-width:1px;');

  for (const node of graph.nodes) {
    lines.push(`  class ${toMermaidId(node.id)} ${node.type};`);
  }

  return lines.join('\n');
}

function buildMarkdown(graph) {
  const mermaid = buildMermaid(graph);
  const topMetrics = graph.metrics
    .filter((metric) => metric.dependencies.length > 0)
    .sort((left, right) => right.dependencies.length - left.dependencies.length)
    .slice(0, 15);

  return `# Variable Dependency Graph

Generated from static analysis of \`simulator/registry.js\` and \`simulator/formulas.js\`.

- Generated at: \`${graph.generatedAt}\`
- Nodes: \`${graph.nodeCount}\`
- Edges: \`${graph.edgeCount}\`
- Scope:
  - rectangle: registry metric
  - rounded: scenario/region input field
  - diamond: intermediate \`values.*\`

\`\`\`mermaid
${mermaid}
\`\`\`

## High-Degree Metrics

| Metric | Dependency Count |
| --- | ---: |
${topMetrics.map((metric) => `| \`${metric.key}\` | ${metric.dependencies.length} |`).join('\n')}

## Source Files

- \`simulator/registry.js\`
- \`simulator/formulas.js\`
- \`docs/variable_dependency_graph.json\`
`;
}

function main() {
  ensureDir(docsDir);

  const registrySource = readUtf8(registryPath);
  const formulasSource = readUtf8(formulasPath);
  const metricKeys = extractMetricKeys(registrySource);
  const formulaBodies = extractFormulaBodies(formulasSource);
  const graph = buildGraphData(metricKeys, formulaBodies);

  fs.writeFileSync(jsonOutputPath, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdOutputPath, `${buildMarkdown(graph)}\n`, 'utf8');

  console.log(`Wrote ${path.relative(rootDir, mdOutputPath)}`);
  console.log(`Wrote ${path.relative(rootDir, jsonOutputPath)}`);
  console.log(`Nodes: ${graph.nodeCount}, Edges: ${graph.edgeCount}`);
}

main();
