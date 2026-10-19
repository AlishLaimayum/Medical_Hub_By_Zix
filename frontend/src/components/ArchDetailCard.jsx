import React from "react";
import {
  Eye,
  EyeOff,
  Crosshair,
  Layers,
  Activity,
  X,
  Zap,
  Info,
} from "lucide-react";

export default function ArchDetailCard({
  arch, // 'mandibular' | 'maxillary'
  archFilter, // 'all' | 'mandibular' | 'maxillary'
  onToggleSoloArch,
  onDeselect,
  onSelectPreset,
}) {
  const isMandibular = arch === "mandibular";
  const isSoloActive = archFilter === arch;

  return (
    <div className="inspector-panel-content">
      {/* 1. Identity Banner Card */}
      <div className="inspector-entity-card neural-theme">
        <div className="entity-identifiers">
          <div className="fdi-code-badge" style={{ borderColor: "rgba(56, 189, 248, 0.4)", backgroundColor: "rgba(56, 189, 248, 0.12)" }}>
            <span className="fdi-prefix" style={{ color: "#38BDF8" }}>ARCH</span>
            <span className="fdi-number" style={{ color: "#F1F5F9" }}>{isMandibular ? "V3" : "V2"}</span>
          </div>
          <div className="entity-tags">
            <span className="clinical-univ-tag">{isMandibular ? "MANDIBULAR" : "MAXILLARY"}</span>
            <span className="clinical-quad-tag">{isMandibular ? "Q3 & Q4" : "Q1 & Q2"}</span>
          </div>
          <button
            type="button"
            className="clinical-deselect-btn"
            onClick={onDeselect}
            title="Deselect Arch (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        <h2 className="entity-anatomical-name">
          {isMandibular ? "Mandible & Lower Arch" : "Maxilla & Upper Arch"}
        </h2>

        <div className="entity-common-row">
          <span className="entity-common-name">
            {isMandibular
              ? "Movable lower jaw bone housing 16 mandibular teeth"
              : "Fixed upper jaw bone housing 16 maxillary teeth & sinuses"}
          </span>
        </div>
      </div>

      {/* 2. Primary Arch Isolation Control */}
      <div className="inspector-section">
        <div className="section-label">ARCH VIEW ISOLATION</div>
        <button
          type="button"
          className={`arch-solo-toggle-btn ${isSoloActive ? "active" : ""}`}
          onClick={() => onToggleSoloArch(arch)}
        >
          {isSoloActive ? (
            <>
              <Eye size={18} style={{ flexShrink: 0, color: "#34D399" }} />
              <div className="btn-text-group">
                <span className="btn-main-label" style={{ color: "#34D399" }}>
                  Showing Only {isMandibular ? "Mandibular" : "Maxillary"}
                </span>
                <span className="btn-sub-label">Click to restore both upper and lower arches</span>
              </div>
            </>
          ) : (
            <>
              <EyeOff size={18} style={{ flexShrink: 0, color: "#38BDF8" }} />
              <div className="btn-text-group">
                <span className="btn-main-label" style={{ color: "#38BDF8" }}>
                  See Only {isMandibular ? "Mandibular" : "Maxillary"} Arch
                </span>
                <span className="btn-sub-label">
                  Make opposing arch, teeth & nerves invisible
                </span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* 3. Anatomical Specifications */}
      <div className="inspector-section">
        <div className="section-label">OSTEOLOGY & SKELETAL CONSTITUENTS</div>
        <div className="spec-table">
          <div className="spec-row full">
            <span className="spec-param">Bone Elements</span>
            <span className="spec-data">
              {isMandibular
                ? "Mandible body (corpus), bilateral rami, condyloid processes, coronoid processes, alveolar process"
                : "Maxilla (body, zygomatic, frontal, alveolar, palatine processes), Palatine bones"}
            </span>
          </div>

          <div className="spec-row">
            <span className="spec-param">Dentition Coverage</span>
            <span className="spec-data">
              {isMandibular
                ? "16 permanent teeth (FDI 31–38, 41–48)"
                : "16 permanent teeth (FDI 11–18, 21–28)"}
            </span>
          </div>

          <div className="spec-row">
            <span className="spec-param">Neural Division</span>
            <span className="spec-data">
              {isMandibular
                ? "Trigeminal V3 (Mandibular)"
                : "Trigeminal V2 (Maxillary)"}
            </span>
          </div>

          <div className="spec-row full">
            <span className="spec-param">Primary Nerves</span>
            <span className="spec-data">
              {isMandibular
                ? "Inferior Alveolar (IAN), Mental, Incisive, Lingual, Long Buccal, Mylohyoid"
                : "Posterior/Middle/Anterior Superior Alveolar (PSA, MSA, ASA), Infraorbital, Greater Palatine"}
            </span>
          </div>

          <div className="spec-row full">
            <span className="spec-param">Skeletal Foramina</span>
            <span className="spec-data">
              {isMandibular
                ? "Mandibular Foramen (medial ramus entrance), Mental Foramen (below premolars)"
                : "Infraorbital Foramen, Incisive Foramen, Greater/Lesser Palatine Foramina"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Clinical & Anesthetic Highlights */}
      <div className="inspector-section">
        <div className="section-label">CLINICAL & LOCAL ANESTHESIA LANDMARKS</div>
        <div className="morphology-text-card">
          {isMandibular ? (
            <p style={{ margin: 0, lineHeight: "1.6" }}>
              • <strong>Inferior Alveolar Nerve Block (IANB):</strong> Puncture pterygomandibular space aiming for mandibular sulcus above lingula.<br />
              • <strong>Cortical Density:</strong> Dense mandibular cortical plate prevents standard supraperiosteal infiltration for molars; block techniques required.<br />
              • <strong>Mental Foramen Proximity:</strong> Apices of premolars lie close to mental nerve exit; high risk during apicoectomy or implant osteotomy.
            </p>
          ) : (
            <p style={{ margin: 0, lineHeight: "1.6" }}>
              • <strong>Supraperiosteal Infiltration:</strong> Porous, thin maxillary cortical plate allows rapid local anesthetic diffusion directly at root apices.<br />
              • <strong>Maxillary Sinus (Antrum):</strong> Roots of upper molars (16, 17, 26, 27) frequently project into the sinus floor; caution for oroantral fistula.<br />
              • <strong>PSA Nerve Block:</strong> Administered posterior to zygomatic buttress above maxillary tuberosity to anesthetize molar pulps.
            </p>
          )}
        </div>
      </div>

      {/* 5. 3D Viewport Quick Operations */}
      <div className="inspector-section">
        <div className="section-label">3D VIEWPORT ORIENTATION</div>
        <div className="action-stack">
          <button
            type="button"
            className="clinical-action-btn primary"
            onClick={() => onSelectPreset(isMandibular ? "lower" : "upper")}
          >
            <Crosshair size={13} />
            <span>{isMandibular ? "Inferior Occlusal View" : "Superior Occlusal View"}</span>
          </button>
          <button
            type="button"
            className="clinical-action-btn secondary"
            onClick={() => onSelectPreset("front")}
          >
            <Layers size={13} />
            <span>Frontal Anterior View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
