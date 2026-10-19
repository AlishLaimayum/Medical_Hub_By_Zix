import React, { useMemo, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Bounds, Html } from "@react-three/drei";
import { X, Layers, Info, Pipette } from "lucide-react";
import { TEETH_DATA } from "../data/teethData";
import { BG_PRESETS } from "./DentalViewer";

function IndividualToothModel({
  modelPath,
  enamelMode,
  dentinMode,
  pdlVisible,
  pulpHighlighted,
}) {
  const { scene } = useGLTF(modelPath);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      if (!obj.isMesh) return;
      const name = obj.name.toLowerCase();

      if (name.includes("enamel")) {
        // Enamel layer
        if (enamelMode === "hidden") {
          obj.visible = false;
        } else if (enamelMode === "translucent") {
          obj.visible = true;
          obj.material = new THREE.MeshPhysicalMaterial({
            color: "#F8FAFC",
            roughness: 0.12,
            transmission: 0.75,
            opacity: 0.35,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
        } else {
          obj.visible = true;
          obj.material = new THREE.MeshStandardMaterial({
            color: "#FAF7F2",
            roughness: 0.25,
            metalness: 0.05,
            side: THREE.DoubleSide,
          });
        }
      } else if (name.includes("dentin")) {
        // Coronal or radicular dentin
        if (dentinMode === "hidden") {
          obj.visible = false;
        } else if (dentinMode === "ghost") {
          obj.visible = true;
          obj.material = new THREE.MeshStandardMaterial({
            color: "#E2BF72",
            roughness: 0.5,
            opacity: 0.25,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
        } else {
          obj.visible = true;
          obj.material = new THREE.MeshStandardMaterial({
            color: "#D8B463",
            roughness: 0.45,
            metalness: 0.0,
            side: THREE.DoubleSide,
          });
        }
      } else if (name.includes("cementum")) {
        // Root cementum
        obj.visible = enamelMode !== "hidden" || dentinMode !== "hidden";
        obj.material = new THREE.MeshStandardMaterial({
          color: "#CBB184",
          roughness: 0.65,
          side: THREE.DoubleSide,
        });
      } else if (name.includes("pdl")) {
        // Periodontal ligament
        obj.visible = pdlVisible;
        obj.material = new THREE.MeshStandardMaterial({
          color: "#E084A4",
          opacity: 0.4,
          transparent: true,
          side: THREE.DoubleSide,
        });
      } else if (name.includes("pulp") || name.includes("canal")) {
        // Living pulp chamber & root canals
        obj.visible = true;
        obj.material = new THREE.MeshStandardMaterial({
          color: "#DC2626",
          emissive: pulpHighlighted ? "#B91C1C" : "#7F1D1D",
          emissiveIntensity: pulpHighlighted ? 0.75 : 0.25,
          roughness: 0.35,
          side: THREE.DoubleSide,
        });
      } else {
        obj.material = new THREE.MeshStandardMaterial({
          color: "#FAF7F2",
          roughness: 0.3,
          side: THREE.DoubleSide,
        });
      }
    });

    return clone;
  }, [scene, enamelMode, dentinMode, pdlVisible, pulpHighlighted]);

  return <primitive object={model} />;
}

export default function ToothInspectionModal({ toothId, onClose, initialBgColor = "#0B1117" }) {
  const [modalBgColor, setModalBgColor] = useState(initialBgColor);
  const [enamelMode, setEnamelMode] = useState("translucent"); // 'solid', 'translucent', 'hidden'
  const [dentinMode, setDentinMode] = useState("ghost"); // 'solid', 'ghost', 'hidden'
  const [pdlVisible, setPdlVisible] = useState(false);
  const [pulpHighlighted, setPulpHighlighted] = useState(true);

  const data = TEETH_DATA[toothId];
  if (!data) return null;

  const modelPath = data.modelPath || `/models/dental/individual-teeth/${toothId}.glb`;

  return (
    <div className="clinical-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="clinical-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="clinical-modal-header">
          <div className="modal-title-lockup">
            <span className="modal-fdi-tag">FDI {data.fdi}</span>
            <div className="modal-heading-text">
              <h3 className="modal-title">{data.name}</h3>
              <span className="modal-subtitle">
                3D Histological Sub-Mesh Inspection · Universal #{data.universal}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            title="Close Inspector (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="clinical-modal-body">
          <div className="modal-viewport-area" style={{ backgroundColor: modalBgColor }}>
            {/* Viewport Bg HUD inside modal */}
            <div className="modal-viewport-hud">
              <span className="hud-group-label">Bg:</span>
              <div className="hud-bg-presets">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`hud-color-swatch-btn ${
                      modalBgColor.toLowerCase() === preset.color.toLowerCase() ? "active" : ""
                    }`}
                    style={{ backgroundColor: preset.color }}
                    onClick={() => setModalBgColor(preset.color)}
                    title={`${preset.label} (${preset.color})`}
                    aria-label={preset.label}
                  />
                ))}
              </div>
              <label className="hud-custom-color-picker" title="Pick any custom background color">
                <input
                  type="color"
                  value={modalBgColor.startsWith("#") && modalBgColor.length === 7 ? modalBgColor : "#0B1117"}
                  onChange={(e) => setModalBgColor(e.target.value)}
                  className="hud-color-hidden-input"
                />
                <Pipette size={11} className="hud-color-picker-icon" />
                <span
                  className="hud-color-indicator"
                  style={{ backgroundColor: modalBgColor }}
                />
              </label>
            </div>

            <Canvas
              camera={{ position: [0, 0, 5], fov: 35 }}
              dpr={[1, 2]}
              style={{ background: modalBgColor }}
            >
              <color attach="background" args={[modalBgColor]} key={modalBgColor} />

              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 8, 8]} intensity={2.2} />
              <directionalLight position={[-5, 4, -6]} intensity={1.4} />

              <Suspense
                fallback={
                  <Html center style={{ color: "#93A2B5", fontSize: "12px", whiteSpace: "nowrap" }}>
                    Loading histological mesh...
                  </Html>
                }
              >
                <Bounds fit clip observe margin={1.2}>
                  <Center>
                    <IndividualToothModel
                      modelPath={modelPath}
                      enamelMode={enamelMode}
                      dentinMode={dentinMode}
                      pdlVisible={pdlVisible}
                      pulpHighlighted={pulpHighlighted}
                    />
                  </Center>
                </Bounds>
              </Suspense>

              <OrbitControls makeDefault enableDamping autoRotate autoRotateSpeed={0.8} />
            </Canvas>

            <div className="modal-viewport-hint">
              Drag to rotate · Scroll to zoom
            </div>
          </div>

          {/* Histological Layers Sidebar */}
          <div className="modal-sidebar-area">
            <div className="sidebar-group-header">
              <Layers size={13} />
              <span>ANATOMICAL SUB-MESH LAYERS</span>
            </div>

            {/* Enamel Toggle */}
            <div className="layer-setting-card">
              <div className="layer-setting-label">
                <span className="setting-color-chip enamel" />
                <span>Enamel Shell</span>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={enamelMode === "solid" ? "active" : ""}
                  onClick={() => setEnamelMode("solid")}
                >
                  Solid
                </button>
                <button
                  type="button"
                  className={enamelMode === "translucent" ? "active" : ""}
                  onClick={() => setEnamelMode("translucent")}
                >
                  Translucent
                </button>
                <button
                  type="button"
                  className={enamelMode === "hidden" ? "active" : ""}
                  onClick={() => setEnamelMode("hidden")}
                >
                  Hidden
                </button>
              </div>
            </div>

            {/* Dentin Toggle */}
            <div className="layer-setting-card">
              <div className="layer-setting-label">
                <span className="setting-color-chip dentin" />
                <span>Dentin Core</span>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={dentinMode === "solid" ? "active" : ""}
                  onClick={() => setDentinMode("solid")}
                >
                  Solid
                </button>
                <button
                  type="button"
                  className={dentinMode === "ghost" ? "active" : ""}
                  onClick={() => setDentinMode("ghost")}
                >
                  Ghost (25%)
                </button>
                <button
                  type="button"
                  className={dentinMode === "hidden" ? "active" : ""}
                  onClick={() => setDentinMode("hidden")}
                >
                  Hidden
                </button>
              </div>
            </div>

            {/* Pulp & Canal Highlight */}
            <div className="layer-setting-card">
              <div className="layer-setting-label">
                <span className="setting-color-chip pulp" />
                <span>Pulp Chamber & Canals</span>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={pulpHighlighted ? "active" : ""}
                  onClick={() => setPulpHighlighted(true)}
                >
                  Vascular Accent
                </button>
                <button
                  type="button"
                  className={!pulpHighlighted ? "active" : ""}
                  onClick={() => setPulpHighlighted(false)}
                >
                  Standard
                </button>
              </div>
            </div>

            {/* Periodontal Ligament (PDL) */}
            <div className="layer-setting-card">
              <div className="layer-setting-label">
                <span className="setting-color-chip pdl" />
                <span>Periodontal Ligament (PDL)</span>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={pdlVisible ? "active" : ""}
                  onClick={() => setPdlVisible(!pdlVisible)}
                >
                  {pdlVisible ? "Visible" : "Hidden"}
                </button>
              </div>
            </div>

            {/* Clinical Note Box */}
            <div className="modal-info-box">
              <div className="info-box-title">
                <Info size={13} />
                <span>Histology Note</span>
              </div>
              <p>
                Set <strong>Enamel</strong> to <em>Translucent</em> and <strong>Dentin</strong> to <em>Ghost</em> to visualize internal root canal branches and pulp horns inside the clinical crown.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
