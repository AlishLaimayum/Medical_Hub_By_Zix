import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  Eye,
  EyeOff,
  Zap,
  Syringe,
  BookOpen,
  Info,
  Layers,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { nerveService } from "../services/nerveService";
import { FUNCTIONAL_TYPE_CONFIG } from "../types/nerveTypes";
import { TEETH_DATA } from "../data/teethData";

export default function NerveDetailCard({
  selectedNerveId,
  onDeselect,
  onFocusNerve,
  isIsolated,
  onToggleIsolate,
  onHighlightInnervatedTeeth,
  onSelectTooth,
  highlightedTeeth = [],
  canalVisibility,
  onToggleCanal,
}) {
  const [nerveData, setNerveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("offline_bundle");
  const [activeTab, setActiveTab] = useState("clinical"); // 'clinical' | 'anesthesia' | 'revision'

  // Fetch data via nerveService with loading & error handling
  useEffect(() => {
    if (!selectedNerveId) {
      setNerveData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    nerveService
      .getNerveById(selectedNerveId, { preferLive: true })
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setNerveData(res.data);
          setDataSource(res.source);
        } else {
          setError(res.error || "Failed to load anatomical nerve data.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "An unexpected network error occurred.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedNerveId]);

  const handleRetry = () => {
    if (!selectedNerveId) return;
    setLoading(true);
    setError(null);
    nerveService
      .getNerveById(selectedNerveId, { preferLive: true })
      .then((res) => {
        if (res.success && res.data) {
          setNerveData(res.data);
          setDataSource(res.source);
        } else {
          setError(res.error || "Failed to load anatomical nerve data.");
        }
      })
      .catch((err) => {
        setError(err.message || "Retry failed.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!selectedNerveId) {
    return (
      <div className="inspector-empty-state">
        <div className="empty-state-icon neural">
          <Zap size={28} />
        </div>
        <h3 className="empty-state-title">No Nerve Selected</h3>
        <p className="empty-state-desc">
          Click any 3D nerve branch or label in the viewport to inspect its clinical course, functional classification, supplied teeth, and dental local anesthesia blocks.
        </p>

        <div className="empty-overview-box">
          <div className="overview-row">
            <span className="overview-key">Cranial System</span>
            <span className="overview-val">Trigeminal Nerve (CN V)</span>
          </div>
          <div className="overview-row">
            <span className="overview-key">Divisions</span>
            <span className="overview-val">Maxillary (V2) & Mandibular (V3)</span>
          </div>
          <div className="overview-row">
            <span className="overview-key">Anatomy Dataset</span>
            <span className="overview-val">BodyParts3D & Z-Anatomy Atlas</span>
          </div>
          <div className="overview-row">
            <span className="overview-key">Clinical Scope</span>
            <span className="overview-val">15 Dental Nerves & Pathways</span>
          </div>
        </div>

        <div className="empty-neuro-legend">
          <span className="shortcuts-title">FUNCTIONAL NEURAL FIBERS:</span>
          <div className="neuro-legend-grid">
            <div className="legend-row">
              <span className="legend-dot sensory" />
              <span>Sensory (Teeth, Gingiva, Lips, Face)</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot motor" />
              <span>Branchial Motor (Mastication, Mylohyoid)</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot special" />
              <span>Taste / Autonomic Hitchhiking Fibers</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="inspector-loading-state">
        <div className="loading-spinner-ring" />
        <span className="loading-state-text">Loading anatomical nerve details...</span>
      </div>
    );
  }

  // Error state
  if (error || !nerveData) {
    return (
      <div className="inspector-error-state">
        <AlertCircle size={32} className="error-icon" />
        <h3 className="error-title">Data Unavailable</h3>
        <p className="error-msg">{error || "Educational record not yet supplied by backend."}</p>
        <button type="button" className="retry-btn" onClick={handleRetry}>
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const funcConfig = FUNCTIONAL_TYPE_CONFIG[nerveData.functionalType] || {
    label: nerveData.functionalType,
    color: "#FACC15",
    bg: "rgba(250, 204, 21, 0.15)",
    border: "rgba(250, 204, 21, 0.4)",
  };

  const hasTeeth = (nerveData.innervatedToothIds || []).length > 0;
  const isTeethHighlighted =
    hasTeeth &&
    nerveData.innervatedToothIds.every((id) => highlightedTeeth.includes(id));

  return (
    <div className="inspector-panel-content">
      {/* Identity Banner */}
      <div className="inspector-entity-card neural-theme">
        <div className="entity-identifiers">
          <div className="neural-code-badge">
            <Zap size={12} />
            <span className="neural-abbr">{nerveData.abbreviation}</span>
          </div>
          <div className="entity-tags">
            <span className="clinical-div-tag">{nerveData.division}</span>
            <span className="clinical-quad-tag">{nerveData.region.toUpperCase()}</span>
          </div>
          <button
            type="button"
            className="clinical-deselect-btn"
            onClick={onDeselect}
            title="Deselect Nerve (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        <h2 className="entity-anatomical-name">{nerveData.name}</h2>

        <div className="entity-common-row">
          <span
            className="entity-class-chip"
            style={{
              color: funcConfig.color,
              borderColor: funcConfig.border,
              backgroundColor: funcConfig.bg,
            }}
          >
            {funcConfig.label}
          </span>

          {nerveData.isProceduralBranch && (
            <span
              className="entity-procedural-chip"
              title="Anatomically grounded supplementary pathway awaiting high-resolution dissection mesh"
            >
              Supplementary Path
            </span>
          )}
        </div>

        {/* Backend Synchronization Badge */}
        <div className="data-source-indicator">
          {dataSource === "live_api" ? (
            <span className="source-badge live">
              <ShieldCheck size={11} />
              <span>Live Spring Boot API</span>
            </span>
          ) : (
            <span className="source-badge local">
              <CheckCircle2 size={11} />
              <span>Local Validated Atlas (Offline Ready)</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="inspector-subtabs">
        <button
          type="button"
          className={`subtab-btn ${activeTab === "clinical" ? "active" : ""}`}
          onClick={() => setActiveTab("clinical")}
        >
          <Activity size={13} />
          <span>Anatomy & Origin</span>
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === "anesthesia" ? "active" : ""}`}
          onClick={() => setActiveTab("anesthesia")}
        >
          <Syringe size={13} />
          <span>Anesthesia ({nerveData.anesthesiaApplications?.length || 0})</span>
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === "revision" ? "active" : ""}`}
          onClick={() => setActiveTab("revision")}
        >
          <BookOpen size={13} />
          <span>Board Notes</span>
        </button>
      </div>

      {/* TAB 1: Clinical Anatomy & Course */}
      {activeTab === "clinical" && (
        <>
          {/* Key Anatomical Specs */}
          <div className="inspector-section">
            <div className="section-label">NEUROLOGICAL SPECIFICATIONS</div>
            <div className="spec-table">
              <div className="spec-row">
                <span className="spec-param">Parent Trunk</span>
                <span className="spec-data">{nerveData.parentNerveName || "N/A"}</span>
              </div>
              <div className="spec-row">
                <span className="spec-param">Division / Region</span>
                <span className="spec-data">
                  {nerveData.division} · {nerveData.region}
                </span>
              </div>
              <div className="spec-row full">
                <span className="spec-param">Anatomical Origin</span>
                <span className="spec-data">{nerveData.origin}</span>
              </div>
            </div>
          </div>

          {/* Anatomical Course */}
          <div className="inspector-section">
            <div className="section-label">ANATOMICAL COURSE & LANDMARKS</div>
            <div className="morphology-text-card">
              <p>{nerveData.course}</p>
            </div>
          </div>

          {/* Structures Supplied */}
          <div className="inspector-section">
            <div className="section-label">INNERVATED STRUCTURES</div>
            <ul className="structures-supplied-list">
              {nerveData.structuresSupplied.map((item, idx) => (
                <li key={idx}>
                  <span className="bullet-dot" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Supplied Teeth Badges */}
          {hasTeeth && (
            <div className="inspector-section">
              <div className="section-label">SUPPLIED PERMANENT TEETH ({nerveData.innervatedToothIds.length})</div>
              <div className="supplied-teeth-pills">
                {nerveData.innervatedToothIds.map((toothId) => {
                  const tooth = TEETH_DATA[toothId];
                  return (
                    <button
                      key={toothId}
                      type="button"
                      className="tooth-pill-btn"
                      onClick={() => onSelectTooth && onSelectTooth(toothId)}
                      title={`Inspect ${tooth?.name || toothId}`}
                    >
                      <span className="tooth-pill-fdi">{tooth?.fdi || toothId.replace("tooth-", "")}</span>
                      <span className="tooth-pill-name">{tooth?.commonName || toothId}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Major Branches */}
          {nerveData.majorBranches && nerveData.majorBranches.length > 0 && (
            <div className="inspector-section">
              <div className="section-label">MAJOR SUB-BRANCHES</div>
              <div className="branches-tag-cloud">
                {nerveData.majorBranches.map((branch, idx) => (
                  <span key={idx} className="branch-tag">
                    {branch}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dental & Surgical Significance */}
          <div className="inspector-section">
            <div className="section-label">DENTAL & SURGICAL SIGNIFICANCE</div>
            <div className="clinical-significance-box">
              <p>{nerveData.clinicalSignificance}</p>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: Local Anesthesia Applications */}
      {activeTab === "anesthesia" && (
        <div className="inspector-section">
          <div className="section-label">LOCAL ANESTHESIA TECHNIQUES & BLOCKS</div>

          {!nerveData.anesthesiaApplications || nerveData.anesthesiaApplications.length === 0 ? (
            <div className="empty-tab-notice">
              <Info size={18} />
              <span>No direct solitary nerve injection described for this structure. Innervation is typically blocked via parent trunk or terminal infiltration.</span>
            </div>
          ) : (
            <div className="anesthesia-cards-stack">
              {nerveData.anesthesiaApplications.map((block) => (
                <div key={block.id} className="anesthesia-block-card">
                  <div className="block-header">
                    <Syringe size={14} className="block-syringe-icon" />
                    <h4 className="block-name">{block.name}</h4>
                  </div>

                  <div className="block-field">
                    <span className="field-title">Technique:</span>
                    <span className="field-val">{block.technique}</span>
                  </div>

                  <div className="block-field">
                    <span className="field-title">Target Anatomical Site:</span>
                    <span className="field-val highlight">{block.targetSite}</span>
                  </div>

                  <div className="block-field">
                    <span className="field-title">Key Landmarks:</span>
                    <span className="field-val">{block.landmarks}</span>
                  </div>

                  <div className="block-field">
                    <span className="field-title">Reported Failure Rate:</span>
                    <span className="field-val failure-tag">{block.failureRate}</span>
                  </div>

                  {block.complications && block.complications.length > 0 && (
                    <div className="block-complications">
                      <span className="field-title">Clinical Risks & Complications:</span>
                      <ul>
                        {block.complications.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Board Exam Revision Notes */}
      {activeTab === "revision" && (
        <div className="inspector-section">
          <div className="section-label">HIGH-YIELD BOARD EXAM REVISION</div>
          <div className="revision-card">
            <div className="revision-header">
              <BookOpen size={16} />
              <span>Key Takeaway for Examinations (INBDE / NDBEB / ORE)</span>
            </div>
            <p className="revision-body">{nerveData.boardRevisionNote}</p>
          </div>
        </div>
      )}

      {/* Clinical Operations Stack */}
      <div className="inspector-section">
        <div className="section-label">3D VIEWPORT OPERATIONS</div>
        <div className="action-stack">
          {/* Focus Camera on Nerve */}
          <button
            type="button"
            className="clinical-action-btn primary neural-primary"
            onClick={onFocusNerve}
            title="Orient camera and center orbit pivot on this nerve structure"
          >
            <Target size={14} />
            <span>Center Camera On Nerve</span>
          </button>

          {/* Isolate Nerve */}
          <button
            type="button"
            className={`clinical-action-btn ${isIsolated ? "active-warning" : "secondary"}`}
            onClick={onToggleIsolate}
            title={isIsolated ? "Restore full anatomical view" : "Isolate this nerve branch from surrounding bone and teeth"}
          >
            {isIsolated ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{isIsolated ? "Exit Isolate Mode" : "Isolate Nerve Pathway"}</span>
          </button>

          {/* Highlight Innervated Teeth in Odontogram */}
          {hasTeeth && onHighlightInnervatedTeeth && (
            <button
              type="button"
              className={`clinical-action-btn ${isTeethHighlighted ? "active-type-btn" : "secondary"}`}
              onClick={() => onHighlightInnervatedTeeth(nerveData.innervatedToothIds)}
              title="Highlight all teeth supplied by this nerve in the odontogram"
            >
              <Zap size={14} style={{ color: "#FACC15" }} />
              <span>
                {isTeethHighlighted
                  ? `Innervated Teeth (${nerveData.innervatedToothIds.length}) Highlighted`
                  : `Highlight Innervated Teeth (${nerveData.innervatedToothIds.length})`}
              </span>
            </button>
          )}

          {/* Mandibular Canal Toggle (for IAN or canal) */}
          {(selectedNerveId === "nerve-ian" || selectedNerveId === "structure-mandibular-canal") && (
            <button
              type="button"
              className={`clinical-action-btn ${canalVisibility !== "hidden" ? "active" : "secondary"}`}
              onClick={onToggleCanal}
              title="Toggle mandibular canal skeletal envelope"
            >
              <Layers size={14} />
              <span>
                {canalVisibility === "hidden"
                  ? "Show Mandibular Canal Envelope"
                  : "Hide Mandibular Canal Envelope"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
