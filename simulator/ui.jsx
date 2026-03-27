import { SIMULATOR_THEME } from "./theme";
import { SIMULATOR_STYLES, SIMULATOR_TYPOGRAPHY } from "./styles";

function normalizeCardValue(value, unit) {
  if (typeof value !== "string" || !unit) return value;
  if (unit.includes("원") && value.endsWith("만")) {
    return value.slice(0, -1);
  }
  return value;
}

function getCardValueClass(cfmt, numericValue) {
  if (cfmt === "profit") {
    if (numericValue > 0) return "text-cyan-400";
    if (numericValue < 0) return "text-rose-400";
    return "text-slate-100";
  }

  if (cfmt === "revenue") {
    if (numericValue < 0) return "text-rose-400";
    return "text-emerald-400";
  }

  if (cfmt === "cost") {
    if (numericValue < 0) return "text-cyan-400";
    return "text-rose-400";
  }

  if (cfmt === "saving") {
    if (numericValue < 0) return "text-rose-400";
    return "text-emerald-400";
  }

  return "";
}

export function InputField({ label, value, onChange, unit, step = 1 }) {
  return (
    <div className="rounded-[22px] bg-white/[0.04] p-3.5">
      <label className={SIMULATOR_TYPOGRAPHY.eyebrow}>
        {label}
      </label>
      <div className="mt-2 flex items-end gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          className={SIMULATOR_STYLES.inputField}
        />
        {unit && <span className={`pb-2 ${SIMULATOR_TYPOGRAPHY.bodyMuted}`}>{unit}</span>}
      </div>
    </div>
  );
}

export function Card({
  title,
  label,
  prefix = "",
  value,
  numericValue,
  unit = "",
  suffix = "",
  sub,
  tip,
  accent,
  cfmt = "",
}) {
  const accentClass = SIMULATOR_THEME.cardAccents[accent] || SIMULATOR_THEME.cardAccents.cyan;
  const topLabel = label ?? title ?? "";
  const bottomTip = tip ?? sub ?? "";
  const displayValue = normalizeCardValue(value, unit);
  const valueClass = getCardValueClass(cfmt, numericValue);

  return (
    <div className={`rounded-[22px] border border-white/10 bg-white/[0.04] p-4 ${accentClass}`}>
      <div className={SIMULATOR_STYLES.cardTitle}>{topLabel}</div>
      <div className={`${SIMULATOR_STYLES.cardValue} flex flex-wrap items-baseline gap-x-1.5 gap-y-1`}>
        {prefix && <span className={SIMULATOR_STYLES.cardMeta}>{prefix}</span>}
        <span className={valueClass}>{displayValue}</span>
        {unit && <span className={SIMULATOR_STYLES.cardMeta}>{unit}</span>}
        {suffix && <span className={SIMULATOR_STYLES.cardMeta}>{suffix}</span>}
      </div>
      <div className={SIMULATOR_STYLES.cardSub}>{bottomTip}</div>
    </div>
  );
}

export function Tip({ text, children }) {
  return (
    <span className="group relative cursor-help">
      {children}
      <span className={SIMULATOR_STYLES.tipBubble}>{text}</span>
    </span>
  );
}

export function SectionTitle({ children }) {
  return <h3 className={SIMULATOR_STYLES.sectionTitle}>{children}</h3>;
}
