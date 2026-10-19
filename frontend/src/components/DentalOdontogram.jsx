import React from "react";
import {
  TEETH_DATA,
  QUADRANT_1,
  QUADRANT_2,
  QUADRANT_3,
  QUADRANT_4,
  TOOTH_TYPES_CONFIG,
} from "../data/teethData";

export default function DentalOdontogram({
  selectedTooth,
  hoveredTooth,
  onSelectTooth,
  onHoverTooth,
  colorByTypeActive,
  activeTypeFilter,
  highlightedNerveTeeth = [],
  selectedNerveName = null,
  archFilter = "all",
  onSelectArch,
}) {
  const getToothAbbr = (data) => {
    switch (data.subType) {
      case "First Molar": return "M1";
      case "Second Molar": return "M2";
      case "Third Molar": return "M3";
      case "First Premolar": return "P1";
      case "Second Premolar": return "P2";
      case "Canine": return "C";
      case "Lateral Incisor": return "LI";
      case "Central Incisor": return "CI";
      default: return "T";
    }
  };

  const renderToothButton = (toothId) => {
    const data = TEETH_DATA[toothId];
    if (!data) return null;

    const isSelected = selectedTooth === toothId;
    const isHovered = hoveredTooth === toothId;
    const isInnervatedBySelectedNerve = highlightedNerveTeeth.includes(toothId);
    const typeConfig = TOOTH_TYPES_CONFIG[data.type];

    const isDimmed =
      colorByTypeActive &&
      activeTypeFilter &&
      activeTypeFilter !== "all" &&
      data.type !== activeTypeFilter;

    return (
      <button
        key={toothId}
        type="button"
        className={`clinical-tooth-btn ${isSelected ? "selected" : ""} ${
          isHovered ? "hovered" : ""
        } ${isInnervatedBySelectedNerve ? "nerve-innervated" : ""} ${
          colorByTypeActive ? `color-mode type-${data.type.toLowerCase()}` : ""
        } ${isDimmed ? "dimmed-type" : ""}`}
        style={
          colorByTypeActive && typeConfig
            ? { "--tooth-type-color": typeConfig.color }
            : undefined
        }
        onClick={() => onSelectTooth(isSelected ? null : toothId)}
        onMouseEnter={() => onHoverTooth(toothId)}
        onMouseLeave={() => onHoverTooth(null)}
        title={`FDI ${data.fdi} (Univ #${data.universal}) — ${data.name} [${data.type}]${
          isInnervatedBySelectedNerve && selectedNerveName
            ? ` · Innervated by ${selectedNerveName}`
            : ""
        }`}
        aria-pressed={isSelected}
      >
        <span className="clinical-fdi-label">{data.fdi}</span>
        <span className="clinical-abbr-label">{getToothAbbr(data)}</span>
        {colorByTypeActive && <span className="type-dot-indicator" />}
      </button>
    );
  };

  return (
    <div className="clinical-odontogram">
      <div className="odontogram-scroll-wrapper">
        <div className="odontogram-arch-grid">
          {/* Upper Arch (Maxillary) */}
          <div className={`odontogram-arch-row ${archFilter === "mandibular" ? "arch-hidden-in-3d" : ""}`}>
            <div className="arch-orientation-label">
              <span>MAXILLARY (UPPER)</span>
              {archFilter === "mandibular" && (
                <span className="arch-hidden-tag">(Hidden in 3D)</span>
              )}
              {onSelectArch && (
                <button
                  type="button"
                  className={`arch-solo-chip ${archFilter === "maxillary" ? "active" : ""}`}
                  onClick={() => onSelectArch(archFilter === "maxillary" ? "all" : "maxillary")}
                  title={
                    archFilter === "maxillary"
                      ? "Showing only Maxillary arch (Click to show both)"
                      : "See only Maxillary arch in 3D (hide Mandibular arch)"
                  }
                >
                  {archFilter === "maxillary" ? "Showing Only" : "See Only"}
                </button>
              )}
            </div>

            <div className="arch-teeth-strip">
              {/* Quadrant 1: Patient Right (18 -> 11) */}
              <div className="quadrant-container q1">
                <div className="quadrant-tag">Q1 · Patient Right</div>
                <div className="teeth-series">
                  {QUADRANT_1.map((id) => renderToothButton(id))}
                </div>
              </div>

              {/* Midline Divider */}
              <div className="clinical-midline" title="Sagittal Dental Midline" />

              {/* Quadrant 2: Patient Left (21 -> 28) */}
              <div className="quadrant-container q2">
                <div className="quadrant-tag">Q2 · Patient Left</div>
                <div className="teeth-series">
                  {QUADRANT_2.map((id) => renderToothButton(id))}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Arch (Mandibular) */}
          <div className={`odontogram-arch-row ${archFilter === "maxillary" ? "arch-hidden-in-3d" : ""}`}>
            <div className="arch-orientation-label">
              <span>MANDIBULAR (LOWER)</span>
              {archFilter === "maxillary" && (
                <span className="arch-hidden-tag">(Hidden in 3D)</span>
              )}
              {onSelectArch && (
                <button
                  type="button"
                  className={`arch-solo-chip ${archFilter === "mandibular" ? "active" : ""}`}
                  onClick={() => onSelectArch(archFilter === "mandibular" ? "all" : "mandibular")}
                  title={
                    archFilter === "mandibular"
                      ? "Showing only Mandibular arch (Click to show both)"
                      : "See only Mandibular arch in 3D (hide Maxillary arch)"
                  }
                >
                  {archFilter === "mandibular" ? "Showing Only" : "See Only"}
                </button>
              )}
            </div>

            <div className="arch-teeth-strip">
              {/* Quadrant 4: Patient Right (48 -> 41) */}
              <div className="quadrant-container q4">
                <div className="quadrant-tag">Q4 · Patient Right</div>
                <div className="teeth-series">
                  {QUADRANT_4.map((id) => renderToothButton(id))}
                </div>
              </div>

              {/* Midline Divider */}
              <div className="clinical-midline" title="Sagittal Dental Midline" />

              {/* Quadrant 3: Patient Left (31 -> 38) */}
              <div className="quadrant-container q3">
                <div className="quadrant-tag">Q3 · Patient Left</div>
                <div className="teeth-series">
                  {QUADRANT_3.map((id) => renderToothButton(id))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
