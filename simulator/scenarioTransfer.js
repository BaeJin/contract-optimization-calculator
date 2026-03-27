import { ensureUsage } from './scenario';
import { sanitizeImportedScenarios } from './scenarioState';

export function buildScenarioExportText(scenarios) {
  const exportPayload = scenarios.map((scenario) => ({
    ...scenario,
    usageByRegion: ensureUsage(scenario),
  }));

  return JSON.stringify(exportPayload[0] ?? null, null, 2);
}

export function parseScenarioImportText(text) {
  const parsed = JSON.parse(text);

  return sanitizeImportedScenarios(Array.isArray(parsed) ? parsed : [parsed]);
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return false;
}

export function downloadJsonText(text, filenamePrefix) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const linkElement = document.createElement('a');
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;

  linkElement.href = url;
  linkElement.download = `${filenamePrefix}-${localDate}.json`;
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(String(event.target?.result || ''));
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsText(file);
  });
}
