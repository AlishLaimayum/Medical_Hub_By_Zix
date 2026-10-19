import React from "react";
import {
  X,
  Target,
  Eye,
  EyeOff,
  Layers,
  Palette,
  Info,
} from "lucide-react";
import { TEETH_DATA, TOOTH_TYPES_CONFIG } from "../data/teethData";

export default function ToothDetailCard({
  selectedTooth,
  onDeselect,
  onFocusTooth,
  isIsolated,
  onToggleIsolate,
  onOpenInspector,
  onHighlightType,
  colorByTypeActive,
  activeTypeFilter,
}) {
  if (!selectedTooth) {
    return (
      <div className="inspector-empty-state">
        <div className="empty-state-icon">
          <Info size={28} />
        </div>
        <h3 className="empty-state-title">No Tooth Selected</h3>
        <p className="empty-state-desc">
          Click any tooth mesh in the 3D viewport or select from the arch chart below to inspect clinical anatomy, roots, and internal canal structures.
        </p>

        <div className="empty-overview-box">
          <div className="overview-row">
            <span className="overview-key">Dataset Model</span>
            <span className="overview-val">Adult Dentition & Jaws</span>
          </div>
          <div className="overview-row">
            <span className="overview-key">Notation Standard</span>
            <span className="overview-val">FDI Two-Digit / Universal</span>
          </div>
          <div className="overview-row">
            <span className="overview-key">Permanent Dentition</span>
            <span className="overview-val">32 Discrete Tooth Meshes</span>
          </div>
          <div className="overview-row">
            <span className="overview-key">Anatomical Context</span>
            <span className="overview-val">Mandible, Maxilla, Gingiva</span>
          </div>
        </div>

        {/* Quick Type Highlighter buttons in empty state */}
        <div className="empty-type-shortcuts">
          <span className="shortcuts-title">HIGHLIGHT BY DENTAL CLASS:</span>
          <div className="shortcuts-grid">
            {Object.values(TOOTH_TYPES_CONFIG).map((cfg) => (
              <button
                key={cfg.key}
                type="button"
                className="shortcut-type-btn"
                style={{ "--type-color": cfg.color }}
                onClick={() => onHighlightType && onHighlightType(cfg.key)}
              >
                <span className="shortcut-dot" />
                <span>{cfg.label}</span>
                <span className="shortcut-count">({cfg.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = TEETH_DATA[selectedTooth];
  if (!data) return null;

  const typeConfig = TOOTH_TYPES_CONFIG[data.type];
  const isThisTypeActive =
    colorByTypeActive &&
    (activeTypeFilter === "all" || activeTypeFilter === data.type);

  return (
    <div className="inspector-panel-content">
      {/* Identity Banner */}
      <div className="inspector-entity-card">
        <div className="entity-identifiers">
          <div className="fdi-code-badge">
            <span className="fdi-prefix">FDI</span>
            <span className="fdi-number">{data.fdi}</span>
          </div>
          <div className="entity-tags">
            <span className="clinical-univ-tag">Univ #{data.universal}</span>
            <span className="clinical-quad-tag">{data.quadrant}</span>
          </div>
          <button
            type="button"
            className="clinical-deselect-btn"
            onClick={onDeselect}
            title="Deselect Tooth (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        <h2 className="entity-anatomical-name">{data.name}</h2>
        <div className="entity-common-row">
          <span className="entity-common-name">{data.commonName}</span>
          {typeConfig && (
            <span
              className="entity-class-chip"
              style={{
                color: typeConfig.color,
                borderColor: typeConfig.border,
                backgroundColor: typeConfig.bg,
              }}
            >
              {typeConfig.label}
            </span>
          )}
        </div>
      </div>

      {/* Clinical Metrics Table */}
      <div className="inspector-section">
        <div className="section-label">CLINICAL SPECIFICATIONS</div>
        <div className="spec-table">
          <div className="spec-row">
            <span className="spec-param">Classification</span>
            <span className="spec-data">{data.subType}</span>
          </div>
          <div className="spec-row">
            <span className="spec-param">Roots & Canals</span>
            <span className="spec-data">
              {data.roots} Root{data.roots > 1 ? "s" : ""} · {data.canals} Canal{typeof data.canals === "number" && data.canals > 1 ? "s" : ""}
            </span>
          </div>
          <div className="spec-row">
            <span className="spec-param">Normal Eruption</span>
            <span className="spec-data">{data.eruptionAge}</span>
          </div>
          <div className="spec-row">
            <span className="spec-param">Dental Arch</span>
            <span className="spec-data">{data.arch}</span>
          </div>
          <div className="spec-row full">
            <span className="spec-param">Primary Function</span>
            <span className="spec-data">{data.function}</span>
          </div>
        </div>
      </div>

      {/* Morphology & Notes */}
      <div className="inspector-section">
        <div className="section-label">ANATOMICAL MORPHOLOGY</div>
        <div className="morphology-text-card">
          <p>{data.description}</p>
        </div>
      </div>

      {/* Clinical Operations */}
      <div className="inspector-section">
        <div className="section-label">OPERATIONS</div>
        <div className="action-stack">
          {/* Highlight All of this Type */}
          {typeConfig && onHighlightType && (
            <button
              type="button"
              className={`clinical-action-btn ${isThisTypeActive ? "active-type-btn" : "secondary"}`}
              style={
                isThisTypeActive
                  ? { backgroundColor: typeConfig.bg, borderColor: typeConfig.color, color: typeConfig.color }
                  : {}
              }
              onClick={() => onHighlightType(data.type)}
              title={`Highlight all ${typeConfig.label} in ${typeConfig.label === "Canines" ? "red" : typeConfig.label === "Molars" ? "purple" : "distinct colour"}`}
            >
              <Palette size={14} style={{ color: typeConfig.color }} />
              <span>
                {isThisTypeActive
                  ? `All ${typeConfig.label} Highlighted`
                  : `Highlight All ${typeConfig.label} (${data.type === "Canine" ? "Red" : data.type === "Molar" ? "Purple" : "Color"})`}
              </span>
            </button>
          )}

          <button
            type="button"
            className="clinical-action-btn primary"
            onClick={onFocusTooth}
            title="Orient camera and center orbit pivot on this tooth"
          >
            <Target size={14} />
            <span>Center Camera On Tooth</span>
          </button>

          <button
            type="button"
            className={`clinical-action-btn ${isIsolated ? "active-warning" : "secondary"}`}
            onClick={onToggleIsolate}
            title={isIsolated ? "Restore complete jaw view" : "Isolate tooth geometry"}
          >
            {isIsolated ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{isIsolated ? "Exit Isolate Mode" : "Isolate Tooth Geometry"}</span>
          </button>

          <button
            type="button"
            className="clinical-action-btn secondary"
            onClick={() => onOpenInspector(selectedTooth)}
            title="Inspect 3D histology: enamel shell, dentin core, and root canal system"
          >
            <Layers size={14} />
            <span>3D Internal Histology</span>
          </button>
        </div>
      </div>
    </div>
  );
}
