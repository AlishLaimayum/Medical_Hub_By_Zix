import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF, Html } from "@react-three/drei";
import { DENTAL_NERVES_DATA } from "../data/nervesData";

// GLB Node Name to Anatomical Nerve ID Mapping (supports bilateral left/right nodes)
export const GLB_NODE_TO_NERVE_ID = {
  // Trigeminal Main
  "trigeminal-nerve-left": "nerve-cn-v",
  "trigeminal-nerve-right": "nerve-cn-v",

  // Mandibular Division V3
  "mandibular-nerve-left": "nerve-v3-mandibular",
  "mandibular-nerve-right": "nerve-v3-mandibular",
  "inferior-alveolar-nerve-left": "nerve-ian",
  "inferior-alveolar-nerve-right": "nerve-ian",
  "mental-nerve-left": "nerve-mental",
  "mental-nerve-right": "nerve-mental",
  "incisive-nerve-left": "nerve-incisive-mandibular",
  "incisive-nerve-right": "nerve-incisive-mandibular",
  "lingual-nerve-left": "nerve-lingual",
  "lingual-nerve-right": "nerve-lingual",
  "buccal-nerve-left": "nerve-long-buccal",
  "buccal-nerve-right": "nerve-long-buccal",

  // Maxillary Division V2
  "maxillary-nerve-left": "nerve-v2-maxillary",
  "maxillary-nerve-right": "nerve-v2-maxillary",
  "infraorbital-nerve-left": "nerve-infraorbital",
  "infraorbital-nerve-right": "nerve-infraorbital",
  "posterior-superior-alveolar-nerve-left": "nerve-psan",
  "posterior-superior-alveolar-nerve-right": "nerve-psan",
  "middle-superior-alveolar-nerve-left": "nerve-msan",
  "middle-superior-alveolar-nerve-right": "nerve-msan",
  "anterior-superior-alveolar-nerve-left": "nerve-asan",
  "anterior-superior-alveolar-nerve-right": "nerve-asan",

  // Skeletal Mandibular Canal
  "mandibular-canal-left": "structure-mandibular-canal",
  "mandibular-canal-right": "structure-mandibular-canal",
};

// Anatomically Grounded Procedural Nerve Pathways for branches not modeled as discrete meshes in source GLB
// Coordinates aligned with BodyParts3D dental jaw coordinate system (+Y up, +Z anterior, cm)
const PROCEDURAL_BRANCHES = [
  // --- Left Nerve to Mylohyoid ---
  {
    nerveId: "nerve-mylohyoid",
    side: "left",
    curve: [
      new THREE.Vector3(1.75, 0.15, -1.65), // Branches from IAN just above mandibular foramen
      new THREE.Vector3(1.68, -0.35, -1.45), // Enters mylohyoid groove on medial ramus
      new THREE.Vector3(1.52, -0.90, -1.15), // Descends along medial surface of mandible
      new THREE.Vector3(1.25, -1.50, -0.75), // Runs forward below mylohyoid line
      new THREE.Vector3(0.95, -1.90, -0.35), // Terminal motor arborization to mylohyoid & digastric
    ],
    radius: 0.045,
  },
  // --- Right Nerve to Mylohyoid ---
  {
    nerveId: "nerve-mylohyoid",
    side: "right",
    curve: [
      new THREE.Vector3(-1.75, 0.15, -1.65),
      new THREE.Vector3(-1.68, -0.35, -1.45),
      new THREE.Vector3(-1.52, -0.90, -1.15),
      new THREE.Vector3(-1.25, -1.50, -0.75),
      new THREE.Vector3(-0.95, -1.90, -0.35),
    ],
    radius: 0.045,
  },
  // --- Left Greater Palatine Nerve ---
  {
    nerveId: "nerve-greater-palatine",
    side: "left",
    curve: [
      new THREE.Vector3(1.55, 1.45, -1.55), // Exits pterygopalatine ganglion
      new THREE.Vector3(1.45, 0.95, -1.25), // Descends through greater palatine canal
      new THREE.Vector3(1.30, 0.45, -0.85), // Emerges from greater palatine foramen opposite M2/M3
      new THREE.Vector3(1.15, 0.38, -0.35), // Courses forward along hard palate groove
      new THREE.Vector3(0.95, 0.35, 0.25),  // Anastomoses near canine with nasopalatine
    ],
    radius: 0.04,
  },
  // --- Right Greater Palatine Nerve ---
  {
    nerveId: "nerve-greater-palatine",
    side: "right",
    curve: [
      new THREE.Vector3(-1.55, 1.45, -1.55),
      new THREE.Vector3(-1.45, 0.95, -1.25),
      new THREE.Vector3(-1.30, 0.45, -0.85),
      new THREE.Vector3(-1.15, 0.38, -0.35),
      new THREE.Vector3(-0.95, 0.35, 0.25),
    ],
    radius: 0.04,
  },
  // --- Left Nasopalatine Nerve ---
  {
    nerveId: "nerve-nasopalatine",
    side: "left",
    curve: [
      new THREE.Vector3(0.55, 1.35, -0.45), // From sphenopalatine foramen across septum
      new THREE.Vector3(0.35, 0.95, 0.15),  // Descends along vomer on nasal septum
      new THREE.Vector3(0.18, 0.65, 0.65),  // Enters incisive canal
      new THREE.Vector3(0.06, 0.48, 1.10),  // Emerges onto hard palate at incisive foramen
    ],
    radius: 0.038,
  },
  // --- Right Nasopalatine Nerve ---
  {
    nerveId: "nerve-nasopalatine",
    side: "right",
    curve: [
      new THREE.Vector3(-0.55, 1.35, -0.45),
      new THREE.Vector3(-0.35, 0.95, 0.15),
      new THREE.Vector3(-0.18, 0.65, 0.65),
      new THREE.Vector3(-0.06, 0.48, 1.10),
    ],
    radius: 0.038,
  },
];

/**
 * Procedural Nerve Branch Tube Component
 */
function ProceduralNerveTube({
  branch,
  isSelected,
  isHovered,
  visibility,
  isIsolated,
  anyNerveSelected,
  onSelect,
  onHover,
  isOrbitingRef,
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(branch.curve);
    return new THREE.TubeGeometry(curve, 32, branch.radius, 10, false);
  }, [branch]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.32,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
  }, []);

  useEffect(() => {
    if (visibility === "hidden") {
      material.visible = false;
      return;
    }

    if (isIsolated && anyNerveSelected) {
      if (isSelected) {
        material.visible = true;
        material.color.set("#FFE066");
        material.emissive.set("#F59E0B");
        material.emissiveIntensity = 0.95;
        material.opacity = 1.0;
        material.transparent = false;
      } else {
        material.visible = false;
      }
      return;
    }

    material.visible = true;
    if (isSelected) {
      material.color.set("#FFE066");
      material.emissive.set("#F59E0B");
      material.emissiveIntensity = 0.95;
      material.opacity = 1.0;
      material.transparent = false;
    } else if (isHovered) {
      material.color.set("#FFF3A3");
      material.emissive.set("#FBBF24");
      material.emissiveIntensity = 0.55;
      material.opacity = 1.0;
      material.transparent = false;
    } else if (visibility === "ghost") {
      material.color.set("#FACC15");
      material.emissive.set("#000000");
      material.emissiveIntensity = 0;
      material.opacity = 0.22;
      material.transparent = true;
    } else {
      material.color.set("#FACC15");
      material.emissive.set("#D97706");
      material.emissiveIntensity = 0.18;
      material.opacity = 1.0;
      material.transparent = false;
    }
  }, [isSelected, isHovered, visibility, isIsolated, anyNerveSelected, material]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(branch.nerveId);
      }}
      onPointerOver={(e) => {
        if (isOrbitingRef?.current) return;
        e.stopPropagation();
        onHover(branch.nerveId);
      }}
      onPointerOut={(e) => {
        if (isOrbitingRef?.current) return;
        e.stopPropagation();
        onHover(null);
      }}
    />
  );
}

/**
 * 3D Interactive Dental Nerves Model
 */
export default function InteractiveNervesModel({
  selectedNerve,
  hoveredNerve,
  nervesVisibility = "solid", // 'solid', 'ghost', 'hidden'
  canalVisibility = "ghost",   // 'solid', 'ghost', 'hidden'
  labelsVisible = true,
  isIsolated = false,
  activeDivision = "all",      // 'all', 'V2', 'V3', 'mandibular', 'maxillary'
  archFilter = "all",          // 'all', 'mandibular', 'maxillary'
  onSelectNerve,
  onHoverNerve,
  nervesModelRef,
  isOrbitingRef,
}) {
  const { scene } = useGLTF(
    "/models/dental/nerves/dental_neurovascular_complete.glb"
  );

  // Clone scene once and assign dedicated materials per mesh
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      if (!obj.isMesh) return;
      const name = obj.name.toLowerCase();

      if (name.includes("canal")) {
        // Skeletal Mandibular Canal Envelope
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#38BDF8"),
          roughness: 0.45,
          metalness: 0.1,
          opacity: 0.35,
          transparent: true,
          side: THREE.DoubleSide,
        });
      } else if (name.includes("artery")) {
        // Maxillofacial Arteries (subdued/hidden by default to avoid clutter)
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#EF4444"),
          roughness: 0.4,
          opacity: 0.15,
          transparent: true,
          side: THREE.DoubleSide,
        });
      } else if (name.includes("vein") || name.includes("plexus")) {
        // Maxillofacial Veins
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#3B82F6"),
          roughness: 0.4,
          opacity: 0.15,
          transparent: true,
          side: THREE.DoubleSide,
        });
      } else {
        // Dental & Cranial Nerves
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FACC15"),
          roughness: 0.35,
          metalness: 0.05,
          emissive: new THREE.Color("#D97706"),
          emissiveIntensity: 0.18,
          side: THREE.DoubleSide,
        });
      }
    });

    return clone;
  }, [scene]);

  // Reactive updates for nerve materials, selections, canal, and division filtering
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (!obj.isMesh) return;
      const nodeName = obj.name.toLowerCase();

      // Mandibular Canal envelope handling
      if (nodeName.includes("canal")) {
        if (archFilter === "maxillary") {
          obj.visible = false;
          return;
        }

        const isCanalSelected = selectedNerve === "structure-mandibular-canal";
        const isCanalHovered = hoveredNerve === "structure-mandibular-canal";

        if (canalVisibility === "hidden") {
          obj.visible = false;
        } else {
          obj.visible = true;
          if (isCanalSelected) {
            obj.material.color.set("#00F0FF");
            obj.material.emissive.set("#0284C7");
            obj.material.emissiveIntensity = 0.85;
            obj.material.opacity = 0.75;
            obj.material.transparent = true;
          } else if (isCanalHovered) {
            obj.material.color.set("#7DD3FC");
            obj.material.emissive.set("#0369A1");
            obj.material.emissiveIntensity = 0.45;
            obj.material.opacity = 0.55;
            obj.material.transparent = true;
          } else if (canalVisibility === "solid") {
            obj.material.color.set("#38BDF8");
            obj.material.emissive.set("#000000");
            obj.material.emissiveIntensity = 0;
            obj.material.opacity = 0.85;
            obj.material.transparent = false;
          } else {
            // ghost
            obj.material.color.set("#38BDF8");
            obj.material.emissive.set("#000000");
            obj.material.emissiveIntensity = 0;
            obj.material.opacity = 0.28;
            obj.material.transparent = true;
          }
        }
        return;
      }

      // Hide blood vessels to maintain clinical focus on nerves
      if (nodeName.includes("artery") || nodeName.includes("vein") || nodeName.includes("plexus")) {
        obj.visible = false;
        return;
      }

      // Check if this mesh maps to a recognized dental nerve
      const mappedId = GLB_NODE_TO_NERVE_ID[nodeName];
      const isDentalNerve = Boolean(mappedId);
      const isSelected = selectedNerve && mappedId === selectedNerve;
      const isHovered = hoveredNerve && mappedId === hoveredNerve;

      // Division & Arch filtering
      const nerveData = mappedId ? DENTAL_NERVES_DATA[mappedId] : null;
      const nerveRegion = nerveData?.region;
      const nerveDivision = nerveData?.division;

      // Arch Isolation Filter
      if (archFilter === "mandibular") {
        if (nerveRegion === "maxillary" || nerveDivision === "V2") {
          obj.visible = false;
          return;
        }
      } else if (archFilter === "maxillary") {
        if (nerveRegion === "mandibular" || nerveDivision === "V3") {
          obj.visible = false;
          return;
        }
      }

      const matchesDivision =
        !activeDivision ||
        activeDivision === "all" ||
        (nerveData && (nerveData.division === activeDivision || nerveData.region === activeDivision));

      if (nervesVisibility === "hidden") {
        obj.visible = false;
        return;
      }

      // Handle Nerve Isolation Mode
      if (isIsolated && selectedNerve) {
        if (isSelected) {
          obj.visible = true;
          obj.material.color.set("#FFE066");
          obj.material.emissive.set("#F59E0B");
          obj.material.emissiveIntensity = 0.95;
          obj.material.roughness = 0.18;
          obj.material.opacity = 1.0;
          obj.material.transparent = false;
          obj.material.depthWrite = true;
        } else {
          obj.visible = false;
        }
        return;
      }

      // Handle Division Filtering
      if (!matchesDivision) {
        // Dim non-matching division nerves
        obj.visible = true;
        obj.material.color.set("#CBD5E1");
        obj.material.emissive.set("#000000");
        obj.material.emissiveIntensity = 0;
        obj.material.roughness = 0.6;
        obj.material.opacity = 0.12;
        obj.material.transparent = true;
        obj.material.depthWrite = false;
        return;
      }

      // Standard Nerve Visibility
      obj.visible = true;

      if (isSelected) {
        // Vivid amber-gold electric selection glow
        obj.material.color.set("#FFE066");
        obj.material.emissive.set("#F59E0B");
        obj.material.emissiveIntensity = 0.95;
        obj.material.roughness = 0.18;
        obj.material.opacity = 1.0;
        obj.material.transparent = false;
        obj.material.depthWrite = true;
      } else if (isHovered) {
        // Crisp bright hover highlight
        obj.material.color.set("#FFF3A3");
        obj.material.emissive.set("#FBBF24");
        obj.material.emissiveIntensity = 0.55;
        obj.material.roughness = 0.22;
        obj.material.opacity = 1.0;
        obj.material.transparent = false;
        obj.material.depthWrite = true;
      } else if (nervesVisibility === "ghost") {
        // Translucent ghost nerves
        obj.material.color.set("#FACC15");
        obj.material.emissive.set("#000000");
        obj.material.emissiveIntensity = 0;
        obj.material.roughness = 0.4;
        obj.material.opacity = 0.22;
        obj.material.transparent = true;
        obj.material.depthWrite = false;
      } else {
        // Standard high-contrast clinical neural gold
        obj.material.color.set("#FACC15");
        obj.material.emissive.set("#D97706");
        obj.material.emissiveIntensity = 0.18;
        obj.material.roughness = 0.35;
        obj.material.opacity = 1.0;
        obj.material.transparent = false;
        obj.material.depthWrite = true;
      }
    });
  }, [
    clonedScene,
    selectedNerve,
    hoveredNerve,
    nervesVisibility,
    canalVisibility,
    isIsolated,
    activeDivision,
    archFilter,
  ]);

  // Labels to display (filtered by division, arch, and visibility)
  const activeLabels = useMemo(() => {
    if (!labelsVisible || nervesVisibility === "hidden") return [];

    return Object.values(DENTAL_NERVES_DATA).filter((nerve) => {
      if (!nerve.labelPosition) return false;
      if (isIsolated && selectedNerve && nerve.id !== selectedNerve) return false;

      // Arch isolation
      if (archFilter === "mandibular" && (nerve.region === "maxillary" || nerve.division === "V2")) {
        return false;
      }
      if (archFilter === "maxillary" && (nerve.region === "mandibular" || nerve.division === "V3")) {
        return false;
      }

      if (
        activeDivision &&
        activeDivision !== "all" &&
        nerve.division !== activeDivision &&
        nerve.region !== activeDivision
      ) {
        return false;
      }
      return true;
    });
  }, [labelsVisible, nervesVisibility, isIsolated, selectedNerve, activeDivision, archFilter]);

  return (
    <group ref={nervesModelRef}>
      {/* GLB Discrete Meshes */}
      <primitive
        object={clonedScene}
        onClick={(e) => {
          e.stopPropagation();
          const meshName = e.object.name.toLowerCase();
          const mappedId = GLB_NODE_TO_NERVE_ID[meshName];
          if (mappedId) {
            onSelectNerve(mappedId);
          }
        }}
        onPointerOver={(e) => {
          if (isOrbitingRef?.current) return;
          e.stopPropagation();
          const meshName = e.object.name.toLowerCase();
          const mappedId = GLB_NODE_TO_NERVE_ID[meshName];
          if (mappedId) {
            onHoverNerve(mappedId);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={(e) => {
          if (isOrbitingRef?.current) return;
          e.stopPropagation();
          onHoverNerve(null);
          document.body.style.cursor = "default";
        }}
      />

      {/* Supplementary Anatomically Grounded Procedural Branches */}
      {PROCEDURAL_BRANCHES.map((branch, idx) => {
        const isSelected = selectedNerve === branch.nerveId;
        const isHovered = hoveredNerve === branch.nerveId;
        const nerveData = DENTAL_NERVES_DATA[branch.nerveId];

        // Arch isolation
        const branchRegion = nerveData?.region;
        const branchDivision = nerveData?.division;
        if (archFilter === "mandibular" && (branchRegion === "maxillary" || branchDivision === "V2")) {
          return null;
        }
        if (archFilter === "maxillary" && (branchRegion === "mandibular" || branchDivision === "V3")) {
          return null;
        }

        const matchesDivision =
          !activeDivision ||
          activeDivision === "all" ||
          (nerveData &&
            (nerveData.division === activeDivision || nerveData.region === activeDivision));

        if (!matchesDivision) return null;

        return (
          <ProceduralNerveTube
            key={`${branch.nerveId}-${branch.side}-${idx}`}
            branch={branch}
            isSelected={isSelected}
            isHovered={isHovered}
            visibility={nervesVisibility}
            isIsolated={isIsolated}
            anyNerveSelected={Boolean(selectedNerve)}
            onSelect={onSelectNerve}
            onHover={onHoverNerve}
            isOrbitingRef={isOrbitingRef}
          />
        );
      })}

      {/* 3D Anatomical Callout Labels — compact chips, expand on hover */}
      {labelsVisible &&
        activeLabels.map((nerve) => {
          const isSelected = selectedNerve === nerve.id;
          const isHovered = hoveredNerve === nerve.id;

          return (
            <Html
              key={nerve.id}
              position={nerve.labelPosition}
              center
              distanceFactor={14}
              zIndexRange={[20, 0]}
              style={{ pointerEvents: "auto" }}
            >
              <div
                className={`nerve-3d-pin ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNerve(nerve.id);
                }}
                onMouseEnter={() => {
                  if (isOrbitingRef?.current) return;
                  onHoverNerve(nerve.id);
                }}
                onMouseLeave={() => {
                  if (isOrbitingRef?.current) return;
                  onHoverNerve(null);
                }}
                title={nerve.name}
              >
                <span className="pin-dot" />
                <span className="pin-abbr">{nerve.abbreviation}</span>
                <span className="pin-name">{nerve.name}</span>
              </div>
            </Html>
          );
        })}
    </group>
  );
}
