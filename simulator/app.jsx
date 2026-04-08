import { useCallback, useMemo, useState } from 'react';

import { MAX_SCENARIOS, TABS } from './constants.js';
import { calculate } from './engine.js';
import { fmt, fmt1 } from './formatters.js';
import { fmtBEP, V } from './registry.js';
import {
  addRegionToScenario,
  addScenarioItem,
  applyUsageValueToAllYears,
  createInitialScenarios,
  removeRegionFromScenario,
  removeScenarioItem,
  replaceScenarioItem,
  updateChurnValue,
  updateRefundAmountValue,
  updateRegionValue,
  updateScenarioValue,
  updateUsageValue,
} from './scenarioState.js';
import {
  buildScenarioExportText,
  copyText,
  downloadJsonText,
  parseScenarioImportText,
  readJsonFile,
} from './scenarioTransfer.js';
import { ensureChurn, ensureRefundAmount, ensureUsage } from './scenario.js';
import {
  getScenarioChipClass,
  getTabButtonClass,
  SIMULATOR_STYLES,
  SIMULATOR_TYPOGRAPHY,
} from './styles.js';
import { getSimulatorStyleText, getTooltipTheme, SIMULATOR_THEME } from './theme.js';
import { BEPTab } from './tabs/BEPTab.jsx';
import { CompareTab } from './tabs/CompareTab.jsx';
import { LTVTab } from './tabs/LTVTab.jsx';
import { InputTab } from './tabs/InputTab.jsx';
import { SensitivityTab } from './tabs/SensitivityTab.jsx';

function ScenarioModal({
  modalMode,
  modalText,
  onChangeText,
  onClose,
  onConfirmImport,
  onCopy,
  onDownload,
  onUpload,
}) {
  if (!modalMode) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/72 px-4 backdrop-blur-md'
      onClick={onClose}
    >
      <div className={SIMULATOR_STYLES.modalPanel} onClick={(event) => event.stopPropagation()}>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <div className='text-[20px] font-semibold leading-tight tracking-[-0.03em] text-white'>
              {modalMode === 'export' ? '시나리오 내보내기' : '시나리오 불러오기'}
            </div>
          </div>
          <button onClick={onClose} className={SIMULATOR_STYLES.closeButton}>
            &times;
          </button>
        </div>

        {modalMode === 'export' ? (
          <>
            <div className={`mb-3 ${SIMULATOR_TYPOGRAPHY.body}`}>
              현재 선택한 시나리오를 JSON으로 복사하거나 다운로드할 수 있습니다.
            </div>
            <div className='relative'>
              <textarea
                id='modal-textarea'
                readOnly
                value={modalText}
                className={`${SIMULATOR_STYLES.modalTextarea} pr-20`}
              />
              <button
                onClick={onCopy}
                type='button'
                title='JSON 복사'
                aria-label='JSON 복사'
                className='absolute right-5 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-slate-900/88 text-slate-300 shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition hover:border-white/18 hover:bg-slate-800 hover:text-white'
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
                  <rect x='9' y='9' width='11' height='11' rx='2' />
                  <path d='M5 15V6a2 2 0 0 1 2-2h9' />
                </svg>
              </button>
            </div>
            <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
              <button onClick={onDownload} className={SIMULATOR_STYLES.secondaryButtonBlock}>
                JSON 다운로드
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`mb-3 ${SIMULATOR_TYPOGRAPHY.body}`}>
              저장한 JSON 내용을 붙여넣거나 로컬 JSON 파일로 현재 선택한 시나리오를 덮어쓸 수 있습니다.
            </div>
            <textarea
              id='modal-textarea'
              value={modalText}
              onChange={(event) => onChangeText(event.target.value)}
              placeholder='[{"name":"Base","salePrice":5000}]'
              className={SIMULATOR_STYLES.modalTextarea}
            />
            <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
              <label
                className={`${SIMULATOR_STYLES.secondaryButtonBlock} cursor-pointer text-center`}
              >
                JSON 업로드
                <input type='file' accept='.json' onChange={onUpload} className='hidden' />
              </label>
              <button
                onClick={onConfirmImport}
                disabled={!modalText.trim()}
                className={`${SIMULATOR_STYLES.primaryButtonBlock} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                적용
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTabId, setActiveTabId] = useState('input');
  const [scenarios, setScenarios] = useState(createInitialScenarios);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [editingScenarioIndex, setEditingScenarioIndex] = useState(null);
  const [editingScenarioName, setEditingScenarioName] = useState('');
  const [editingScenarioSource, setEditingScenarioSource] = useState(null);
  const [usageEditorRegionId, setUsageEditorRegionId] = useState(null);
  const [showChurnEditor, setShowChurnEditor] = useState(false);
  const [showRefundEditor, setShowRefundEditor] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [modalText, setModalText] = useState('');
  const [showScenarioList, setShowScenarioList] = useState(false);

  const activeScenario = scenarios[activeScenarioIndex];
  const usageByRegion = useMemo(() => ensureUsage(activeScenario), [activeScenario]);
  const churnByYear = useMemo(() => ensureChurn(activeScenario), [activeScenario]);
  const refundAmountByYear = useMemo(() => ensureRefundAmount(activeScenario), [activeScenario]);
  const result = useMemo(
    () => calculate({ ...activeScenario, usageByRegion }),
    [activeScenario, usageByRegion],
  );
  const allResults = useMemo(
    () =>
      scenarios.map((scenario) => ({
        ...calculate({ ...scenario, usageByRegion: ensureUsage(scenario) }),
        name: scenario.name,
      })),
    [scenarios],
  );

  const tooltipTheme = getTooltipTheme(isDarkMode);
  const simulatorStyleText = getSimulatorStyleText();
  const activeTab = TABS.find((tab) => tab.id === activeTabId) || TABS[0];

  const handleScenarioValueChange = useCallback(
    (key, value) => {
      setScenarios((previousScenarios) =>
        updateScenarioValue(previousScenarios, activeScenarioIndex, key, value),
      );
    },
    [activeScenarioIndex],
  );

  const handleRegionValueChange = useCallback(
    (regionId, key, value) => {
      setScenarios((previousScenarios) =>
        updateRegionValue(previousScenarios, activeScenarioIndex, regionId, key, value),
      );
    },
    [activeScenarioIndex],
  );

  const handleUsageChange = useCallback(
    (regionId, yearIndex, value) => {
      setScenarios((previousScenarios) =>
        updateUsageValue(previousScenarios, activeScenarioIndex, regionId, yearIndex, value),
      );
    },
    [activeScenarioIndex],
  );

  const handleApplyUsageToAllYears = useCallback(
    (regionId, value) => {
      setScenarios((previousScenarios) =>
        applyUsageValueToAllYears(previousScenarios, activeScenarioIndex, regionId, value),
      );
    },
    [activeScenarioIndex],
  );

  const handleChurnChange = useCallback(
    (yearIndex, value) => {
      setScenarios((previousScenarios) =>
        updateChurnValue(previousScenarios, activeScenarioIndex, yearIndex, value),
      );
    },
    [activeScenarioIndex],
  );

  const handleRefundAmountChange = useCallback(
    (yearIndex, value) => {
      setScenarios((previousScenarios) =>
        updateRefundAmountValue(previousScenarios, activeScenarioIndex, yearIndex, value),
      );
    },
    [activeScenarioIndex],
  );

  const handleAddRegion = useCallback(() => {
    setScenarios((previousScenarios) =>
      addRegionToScenario(previousScenarios, activeScenarioIndex),
    );
  }, [activeScenarioIndex]);

  const handleRemoveRegion = useCallback(
    (regionId) => {
      setScenarios((previousScenarios) =>
        removeRegionFromScenario(previousScenarios, activeScenarioIndex, regionId),
      );
      setUsageEditorRegionId((currentRegionId) =>
        currentRegionId === regionId ? null : currentRegionId,
      );
    },
    [activeScenarioIndex],
  );

  const handleAddScenario = useCallback(() => {
    setScenarios((previousScenarios) => {
      const nextScenarios = addScenarioItem(previousScenarios);

      if (nextScenarios.length !== previousScenarios.length) {
        setActiveScenarioIndex(nextScenarios.length - 1);
      }

      return nextScenarios;
    });
  }, []);

  const handleRemoveScenario = useCallback((scenarioIndex) => {
    setScenarios((previousScenarios) => removeScenarioItem(previousScenarios, scenarioIndex));
    setEditingScenarioIndex(null);
    setActiveScenarioIndex(0);
    setUsageEditorRegionId(null);
    setShowChurnEditor(false);
    setShowRefundEditor(false);
  }, []);

  const handleOpenExport = useCallback(() => {
    setModalText(buildScenarioExportText([activeScenario]));
    setModalMode('export');
  }, [activeScenario]);

  const handleOpenImport = useCallback(() => {
    setModalText('');
    setModalMode('import');
  }, []);

  const handleFinishScenarioTitleEdit = useCallback(() => {
    if (editingScenarioIndex !== null) {
      const trimmedName = editingScenarioName.trim();

      if (trimmedName) {
        setScenarios((previousScenarios) =>
          updateScenarioValue(previousScenarios, editingScenarioIndex, 'name', trimmedName),
        );
      }
    }

    setEditingScenarioIndex(null);
    setEditingScenarioName('');
    setEditingScenarioSource(null);
  }, [editingScenarioIndex, editingScenarioName]);

  const handleCancelScenarioTitleEdit = useCallback(() => {
    setEditingScenarioIndex(null);
    setEditingScenarioName('');
    setEditingScenarioSource(null);
  }, []);

  const handleStartScenarioTitleEdit = useCallback((scenarioIndex, source) => {
    setEditingScenarioName(scenarios[scenarioIndex]?.name || '');
    setEditingScenarioIndex(scenarioIndex);
    setEditingScenarioSource(source);
  }, [scenarios]);

  const handleImport = useCallback(() => {
    try {
      const importedScenarios = parseScenarioImportText(modalText);
      const importedScenario = importedScenarios[0];

      setScenarios((previousScenarios) =>
        replaceScenarioItem(previousScenarios, activeScenarioIndex, importedScenario),
      );
      setEditingScenarioIndex(null);
      setUsageEditorRegionId(null);
      setShowChurnEditor(false);
      setShowRefundEditor(false);
      setModalMode(null);
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  }, [activeScenarioIndex, modalText]);

  const handleCopyExport = useCallback(async () => {
    try {
      const didCopy = await copyText(modalText);

      if (!didCopy) {
        const textareaElement = document.getElementById('modal-textarea');

        if (textareaElement) {
          textareaElement.select();
          document.execCommand('copy');
        }
      }

      alert('Copied');
    } catch (error) {
      alert('Copy failed');
    }
  }, [modalText]);

  const handleDownloadExport = useCallback(() => {
    try {
      downloadJsonText(modalText, 'simulator-scenarios');
    } catch (error) {
      alert('Download failed. Use copy instead.');
    }
  }, [modalText]);

  const handleUploadImportFile = useCallback(async (event) => {
    const file = event.target.files?.[0];
    const inputElement = event.target;

    if (!file) {
      return;
    }

    try {
      const fileText = await readJsonFile(file);

      setModalText(fileText);
    } catch (error) {
      alert('Upload failed');
    } finally {
      inputElement.value = '';
    }
  }, []);

  return (
    <div
      className={
        isDarkMode
          ? SIMULATOR_THEME.rootClassName.dark
          : SIMULATOR_THEME.rootClassName.light
      }
      style={{ fontFamily: SIMULATOR_THEME.fontFamily }}
    >
      <style>{simulatorStyleText}</style>

      <div className='relative min-h-screen overflow-hidden'>
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute left-[-10%] top-[-14rem] h-[26rem] w-[26rem] rounded-full bg-cyan-500/8 blur-3xl' />
          <div className='absolute right-[-10%] top-[-6rem] h-[20rem] w-[20rem] rounded-full bg-sky-400/6 blur-3xl' />
        </div>

        <header className='sticky top-0 z-50 bg-slate-950/50 backdrop-blur-xl'>
          <div className='mx-auto max-w-[1400px] px-4 py-3 md:px-6'>
            <div>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex min-w-0 items-center gap-3'>
                  <div className={SIMULATOR_STYLES.headerBadge} aria-hidden='true'>
                    <svg
                      viewBox='0 0 24 24'
                      className='h-8 w-8'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <rect x='4.5' y='3.5' width='15' height='17' rx='1.2' />
                      <rect
                        x='7.2'
                        y='7.2'
                        width='9.6'
                        height='3.1'
                        rx='1.55'
                        fill='currentColor'
                        stroke='none'
                      />
                    </svg>
                  </div>
                  <div className='min-w-0'>
                    <div className={SIMULATOR_STYLES.headerEyebrow}>
                      Contract Optimization Calculator
                    </div>
                    <div className={SIMULATOR_STYLES.headerTitleRow}>
                      {editingScenarioIndex === activeScenarioIndex &&
                      editingScenarioSource === 'header' ? (
                        <input
                          autoFocus
                          value={editingScenarioName}
                          onChange={(event) => setEditingScenarioName(event.target.value)}
                          onBlur={handleFinishScenarioTitleEdit}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              handleFinishScenarioTitleEdit();
                            }
                            if (event.key === 'Escape') {
                              handleCancelScenarioTitleEdit();
                            }
                          }}
                          className={SIMULATOR_STYLES.headerTitleInput}
                        />
                      ) : (
                        <button
                          type='button'
                          onDoubleClick={() =>
                            handleStartScenarioTitleEdit(activeScenarioIndex, 'header')
                          }
                          className={SIMULATOR_STYLES.headerTitle}
                          title='Double-click to rename'
                        >
                          {activeScenario?.name || ''}
                        </button>
                      )}
                      <button
                        type='button'
                        onClick={() => setShowScenarioList((currentValue) => !currentValue)}
                        className={SIMULATOR_STYLES.headerScenarioTrigger}
                        aria-expanded={showScenarioList}
                        aria-label='시나리오 목록 열기'
                      >
                        <svg
                          viewBox='0 0 24 24'
                          className={`h-4 w-4 transition ${showScenarioList ? 'rotate-180' : ''}`}
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='1.8'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          aria-hidden='true'
                        >
                          <path d='m6 9 6 6 6-6' />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setIsDarkMode((currentValue) => !currentValue)}
                    className={SIMULATOR_STYLES.utilityIconButton}
                    title={isDarkMode ? 'Light mode' : 'Dark mode'}
                    aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
                  >
                    {isDarkMode ? (
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
                        <circle cx='12' cy='12' r='4' />
                        <path d='M12 2v2.5' />
                        <path d='M12 19.5V22' />
                        <path d='m4.93 4.93 1.77 1.77' />
                        <path d='m17.3 17.3 1.77 1.77' />
                        <path d='M2 12h2.5' />
                        <path d='M19.5 12H22' />
                        <path d='m4.93 19.07 1.77-1.77' />
                        <path d='m17.3 6.7 1.77-1.77' />
                      </svg>
                    ) : (
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
                        <path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {showScenarioList ? (
                <div className={SIMULATOR_STYLES.headerScenarioPanel}>
                  <div className='flex flex-wrap gap-2'>
                    {scenarios.map((scenario, scenarioIndex) => (
                      <div
                        key={scenario.name + scenarioIndex}
                        className={getScenarioChipClass(scenarioIndex === activeScenarioIndex)}
                      >
                        {editingScenarioIndex === scenarioIndex &&
                        editingScenarioSource === 'list' ? (
                          <input
                            autoFocus
                            value={editingScenarioName}
                            onChange={(event) => setEditingScenarioName(event.target.value)}
                            onBlur={handleFinishScenarioTitleEdit}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                handleFinishScenarioTitleEdit();
                              }
                              if (event.key === 'Escape') {
                                handleCancelScenarioTitleEdit();
                              }
                            }}
                            className={SIMULATOR_STYLES.scenarioChipInput}
                          />
                        ) : (
                          <button
                            type='button'
                            onClick={() => setActiveScenarioIndex(scenarioIndex)}
                            onDoubleClick={() => {
                              setActiveScenarioIndex(scenarioIndex);
                              handleStartScenarioTitleEdit(scenarioIndex, 'list');
                            }}
                            className='truncate'
                            title='Double-click to rename'
                          >
                            {scenario.name}
                          </button>
                        )}
                        {scenarios.length > 1 && (
                          <button
                            type='button'
                            onClick={() => handleRemoveScenario(scenarioIndex)}
                            className='ml-1 text-slate-500 transition hover:text-rose-400'
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                    {scenarios.length < MAX_SCENARIOS && (
                      <button onClick={handleAddScenario} className={SIMULATOR_STYLES.ghostButton}>
                        + 시나리오 추가
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className='relative mx-auto max-w-[1400px] px-4 pb-5 pt-3 md:px-6 md:pb-6 md:pt-4'>
          <section className={SIMULATOR_STYLES.contentShell}>
            <div className={SIMULATOR_STYLES.contentShellHeader}>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                <div className='max-w-[640px]'>
                  <h2 className={SIMULATOR_TYPOGRAPHY.tabHero}>{activeTab.label}</h2>
                  <p className={`mt-2 ${SIMULATOR_TYPOGRAPHY.body}`}>{activeTab.description}</p>
                </div>
                <div className='w-full lg:max-w-[640px]'>
                  <div className='overflow-x-auto pb-1'>
                    <div className={`${SIMULATOR_STYLES.tabSwitcherWrap} justify-end`}>
                      {TABS.map((tabItem) => (
                        <button
                          key={tabItem.id}
                          onClick={() => setActiveTabId(tabItem.id)}
                          className={getTabButtonClass(activeTabId === tabItem.id)}
                        >
                          {tabItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={SIMULATOR_STYLES.contentShellBody}>
              {activeTabId === 'input' && (
                <InputTab
                  scenario={activeScenario}
                  usage={usageByRegion}
                  result={result}
                  churnByYear={churnByYear}
                  refundAmountByYear={refundAmountByYear}
                  V={V}
                  update={handleScenarioValueChange}
                  updateRegion={handleRegionValueChange}
                  updateUsage={handleUsageChange}
                  updateChurn={handleChurnChange}
                  updateRefundAmount={handleRefundAmountChange}
                  addRegion={handleAddRegion}
                  removeRegion={handleRemoveRegion}
                  usageEditRegion={usageEditorRegionId}
                  setUsageEditRegion={setUsageEditorRegionId}
                  showChurnEditor={showChurnEditor}
                  setShowChurnEditor={setShowChurnEditor}
                  showRefundEditor={showRefundEditor}
                  setShowRefundEditor={setShowRefundEditor}
                  applyUsageToAllYears={handleApplyUsageToAllYears}
                  onOpenExport={handleOpenExport}
                  onOpenImport={handleOpenImport}
                />
              )}
              {activeTabId === 'ltv' && (
                <LTVTab
                  scenario={activeScenario}
                  result={result}
                  V={V}
                  fmt={fmt}
                  tt={tooltipTheme}
                />
              )}
              {activeTabId === 'bep' && (
                <BEPTab
                  scenario={activeScenario}
                  result={result}
                  usage={usageByRegion}
                  V={V}
                  fmt={fmt}
                />
              )}
              {activeTabId === 'sensitivity' && (
                <SensitivityTab result={result} V={V} fmt={fmt} tt={tooltipTheme} />
              )}
              {activeTabId === 'compare' && (
                <CompareTab
                  scenarios={scenarios}
                  allResults={allResults}
                  addScenario={handleAddScenario}
                  V={V}
                  fmt={fmt}
                  fmtBEP={fmtBEP}
                  tt={tooltipTheme}
                />
              )}
            </div>
          </section>

          <ScenarioModal
            modalMode={modalMode}
            modalText={modalText}
            onChangeText={setModalText}
            onClose={() => setModalMode(null)}
            onConfirmImport={handleImport}
            onCopy={handleCopyExport}
            onDownload={handleDownloadExport}
            onUpload={handleUploadImportFile}
          />
        </main>
      </div>
    </div>
  );
}

