import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  Suspense,
  useCallback,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Html } from "@react-three/drei";
import {
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  PanelRightClose,
  PanelRightOpen,
  Layers,
  Activity,
  Crosshair,
  Eye,
  EyeOff,
  Palette,
  Check,
  X,
  Pipette,
  Zap,
  Tag,
  GripHorizontal,
  Pin,
  PinOff,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { TEETH_DATA, ALL_TEETH_IDS, TOOTH_TYPES_CONFIG } from "../data/teethData";
import { DENTAL_NERVES_DATA, ALL_NERVE_IDS } from "../data/nervesData";
import DentalOdontogram from "./DentalOdontogram";
import ToothDetailCard from "./ToothDetailCard";
import ToothInspectionModal from "./ToothInspectionModal";
import InteractiveNervesModel from "./InteractiveNervesModel";
import NerveDetailCard from "./NerveDetailCard";
import ArchDetailCard from "./ArchDetailCard";

export const BG_PRESETS = [
  { id: "obsidian", label: "Obsidian Dark", color: "#0B1117" },
  { id: "slate", label: "Studio Slate", color: "#1E293B" },
  { id: "navy", label: "Deep Navy", color: "#0F172A" },
  { id: "gray", label: "Neutral Gray", color: "#334155" },
  { id: "medical-light", label: "Medical Light", color: "#E2E8F0" },
  { id: "pure-white", label: "Pure White", color: "#FFFFFF" },
];

// --- Three.js Scene Background & Clear Color Synchronizer ---
function SceneBackground({ color }) {
  const { scene, gl } = useThree();
  useEffect(() => {
    if (!color) return;
    try {
      const c = new THREE.Color(color);
      scene.background = c;
      gl.setClearColor(c, 1);
    } catch (e) {
      console.warn("Invalid background color:", color);
    }
  }, [color, scene, gl]);
  return null;
}

// --- Anatomical Arch Classifier Helper ---
export function getMeshArch(meshName) {
  if (!meshName) return null;
  const lower = meshName.toLowerCase();
  if (lower.startsWith("tooth-")) {
    const toothNum = parseInt(lower.replace("tooth-", ""), 10);
    if (toothNum >= 11 && toothNum <= 28) return "maxillary";
    if (toothNum >= 31 && toothNum <= 48) return "mandibular";
  }
  if (lower.includes("mandib") || lower.includes("gingiva-lower")) {
    return "mandibular";
  }
  if (lower.includes("maxill") || lower.includes("sinus") || lower.includes("gingiva-upper")) {
    return "maxillary";
  }
  return null;
}

// --- 3D Anatomical Jaw Model with Dynamic Materials & Tooth Classification Colors ---
function InteractiveJawModel({
  selectedTooth,
  hoveredTooth,
  selectedArch = null,
  hoveredArch = null,
  archFilter = "all", // 'all' | 'mandibular' | 'maxillary'
  isIsolated,
  colorByTypeActive,
  activeTypeFilter,
  gumsVisibility,
  boneVisibility,
  teethVisibility = "solid",
  highlightedToothIds = [],
  selectedNerve = null,
  onSelectTooth,
  onHoverTooth,
  onSelectArch,
  onHoverArch,
  modelRef,
  isOrbitingRef,
}) {
  const { scene } = useGLTF(
    "/models/dental/dentition/complete_adult_dentition_and_jaws.glb"
  );

  // Clone scene once and assign dedicated material instances per mesh
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      if (!obj.isMesh) return;
      const name = obj.name.toLowerCase();

      if (name.startsWith("tooth-")) {
        // Enamel tooth material
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#F3EEE5"),
          roughness: 0.28,
          metalness: 0.02,
          emissive: new THREE.Color("#000000"),
          emissiveIntensity: 0,
          side: THREE.DoubleSide,
        });
      } else if (name.startsWith("gingiva-")) {
        // Gingiva mucosal tissue
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#C96570"),
          roughness: 0.58,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });
      } else if (name.includes("sinus")) {
        // Maxillary sinus cavity
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#7E91A6"),
          roughness: 0.6,
          opacity: 0.25,
          transparent: true,
          side: THREE.DoubleSide,
        });
      } else {
        // Cortical bone (mandible, maxilla, alveolar process)
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#D5C7AB"),
          roughness: 0.72,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });
      }
    });

    return clone;
  }, [scene]);

  // Reactively apply genuine material selection, classification colors, neural highlights, and layer visibility states
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (!obj.isMesh) return;
      const name = obj.name;
      const lowerName = name.toLowerCase();
      const meshArch = getMeshArch(name);

      // 1. Arch Solo Filter: Hide non-matching arch entirely
      if (archFilter !== "all" && meshArch && meshArch !== archFilter) {
        obj.visible = false;
        return;
      }

      if (lowerName.startsWith("tooth-")) {
        const isSelected = selectedTooth === name;
        const isHovered = hoveredTooth === name;
        const toothData = TEETH_DATA[name];
        const toothType = toothData?.type;
        const typeConfig = toothType ? TOOTH_TYPES_CONFIG[toothType] : null;
        const isInnervated = highlightedToothIds.includes(name);

        const isMatchingFilter =
          !activeTypeFilter ||
          activeTypeFilter === "all" ||
          toothType === activeTypeFilter;

        if (isIsolated && selectedTooth) {
          // Tooth isolation mode: hide non-selected teeth completely
          if (isSelected) {
            obj.visible = true;
            if (colorByTypeActive && typeConfig) {
              obj.material.color.set(typeConfig.color);
              obj.material.emissive.set(typeConfig.emissive);
            } else {
              obj.material.color.set("#FFFFFF");
              obj.material.emissive.set("#258AB5");
            }
            obj.material.emissiveIntensity = 0.85;
            obj.material.roughness = 0.15;
            obj.material.opacity = 1.0;
            obj.material.transparent = false;
            obj.material.depthWrite = true;
          } else {
            obj.visible = false;
          }
        } else if (isIsolated && selectedNerve) {
          // Nerve isolation mode: show supplied teeth in ghost neural highlight
          if (isInnervated) {
            obj.visible = true;
            obj.material.color.set("#FEF08A");
            obj.material.emissive.set("#F59E0B");
            obj.material.emissiveIntensity = 0.65;
            obj.material.roughness = 0.2;
            obj.material.opacity = 0.35;
            obj.material.transparent = true;
            obj.material.depthWrite = false;
          } else {
            obj.visible = false;
          }
        } else if (teethVisibility === "hidden" && !isSelected) {
          obj.visible = false;
        } else if (teethVisibility === "ghost" && !isSelected) {
          obj.visible = true;
          obj.material.color.set("#F3EEE5");
          obj.material.emissive.set("#000000");
          obj.material.emissiveIntensity = 0;
          obj.material.opacity = 0.22;
          obj.material.transparent = true;
          obj.material.depthWrite = false;
        } else if (colorByTypeActive && typeConfig) {
          // Classification color map mode (Canines red, Molars purple, Incisors cyan, Premolars green)
          if (!isMatchingFilter) {
            obj.visible = true;
            obj.material.color.set("#CBD5E1");
            obj.material.emissive.set("#000000");
            obj.material.emissiveIntensity = 0;
            obj.material.roughness = 0.5;
            obj.material.opacity = 0.12;
            obj.material.transparent = true;
            obj.material.depthWrite = false;
          } else {
            obj.visible = true;
            if (isSelected) {
              obj.material.color.set("#FFFFFF");
              obj.material.emissive.set(typeConfig.color);
              obj.material.emissiveIntensity = 0.95;
              obj.material.roughness = 0.12;
            } else if (isHovered) {
              obj.material.color.set(typeConfig.color);
              obj.material.emissive.set("#FFFFFF");
              obj.material.emissiveIntensity = 0.45;
              obj.material.roughness = 0.2;
            } else {
              obj.material.color.set(typeConfig.color);
              obj.material.emissive.set(typeConfig.emissive);
              obj.material.emissiveIntensity = 0.35;
              obj.material.roughness = 0.25;
            }
            obj.material.opacity = 1.0;
            obj.material.transparent = false;
            obj.material.depthWrite = true;
          }
        } else if (isInnervated) {
          // Neural highlight for teeth innervated by the selected nerve
          obj.visible = true;
          if (isSelected) {
            obj.material.color.set("#FFFFFF");
            obj.material.emissive.set("#258AB5");
            obj.material.emissiveIntensity = 0.85;
            obj.material.roughness = 0.15;
          } else if (isHovered) {
            obj.material.color.set("#FFFBEB");
            obj.material.emissive.set("#F59E0B");
            obj.material.emissiveIntensity = 0.85;
            obj.material.roughness = 0.2;
          } else {
            obj.material.color.set("#FFFBEB");
            obj.material.emissive.set("#F59E0B");
            obj.material.emissiveIntensity = 0.55;
            obj.material.roughness = 0.25;
          }
          obj.material.opacity = 1.0;
          obj.material.transparent = false;
          obj.material.depthWrite = true;
        } else {
          // Standard viewport mode (Ivory enamel)
          obj.visible = true;

          if (isSelected) {
            obj.material.color.set("#FFFFFF");
            obj.material.emissive.set("#258AB5");
            obj.material.emissiveIntensity = 0.75;
            obj.material.roughness = 0.15;
            obj.material.opacity = 1.0;
            obj.material.transparent = false;
            obj.material.depthWrite = true;
          } else if (isHovered) {
            obj.material.color.set("#FFFFFF");
            obj.material.emissive.set("#1E5D7B");
            obj.material.emissiveIntensity = 0.4;
            obj.material.roughness = 0.22;
            obj.material.opacity = 1.0;
            obj.material.transparent = false;
            obj.material.depthWrite = true;
          } else {
            obj.material.color.set("#F3EEE5");
            obj.material.emissive.set("#000000");
            obj.material.emissiveIntensity = 0;
            obj.material.roughness = 0.28;
            obj.material.opacity = 1.0;
            obj.material.transparent = false;
            obj.material.depthWrite = true;
          }
        }
      } else if (lowerName.startsWith("gingiva-")) {
        // Gingiva mucosal tissue
        if ((isIsolated && (selectedTooth || selectedNerve)) || gumsVisibility === "hidden") {
          obj.visible = false;
        } else if (gumsVisibility === "ghost") {
          obj.visible = true;
          obj.material.color.set("#C96570");
          obj.material.opacity = 0.25;
          obj.material.transparent = true;
          obj.material.depthWrite = false;
        } else {
          obj.visible = true;
          obj.material.color.set("#C96570");
          obj.material.opacity = 1.0;
          obj.material.transparent = false;
          obj.material.depthWrite = true;
        }
      } else if (lowerName.includes("sinus")) {
        // Maxillary sinuses
        if ((isIsolated && (selectedTooth || selectedNerve)) || boneVisibility === "hidden") {
          obj.visible = false;
        } else {
          obj.visible = true;
          obj.material.opacity = boneVisibility === "ghost" ? 0.12 : 0.25;
          obj.material.transparent = true;
        }
      } else {
        // Cortical Jaw Bone (Mandible, Maxilla, Condyle, Alveolar Process)
        if ((isIsolated && (selectedTooth || selectedNerve)) || boneVisibility === "hidden") {
          obj.visible = false;
        } else if (boneVisibility === "ghost") {
          obj.visible = true;
          obj.material.color.set("#D5C7AB");
          obj.material.opacity = 0.20;
          obj.material.transparent = true;
          obj.material.depthWrite = false;
        } else {
          obj.visible = true;
          const isArchSelected = selectedArch && meshArch === selectedArch;
          const isArchHovered = hoveredArch && meshArch === hoveredArch && !selectedArch;

          if (isArchSelected) {
            obj.material.color.set("#E2D8C3");
            obj.material.emissive.set("#0284C7");
            obj.material.emissiveIntensity = 0.35;
            obj.material.roughness = 0.55;
          } else if (isArchHovered) {
            obj.material.color.set("#E5DAC7");
            obj.material.emissive.set("#0369A1");
            obj.material.emissiveIntensity = 0.2;
            obj.material.roughness = 0.6;
          } else {
            obj.material.color.set("#D5C7AB");
            obj.material.emissive.set("#000000");
            obj.material.emissiveIntensity = 0;
            obj.material.roughness = 0.72;
          }
          obj.material.opacity = 1.0;
          obj.material.transparent = false;
          obj.material.depthWrite = true;
        }
      }
    });
  }, [
    clonedScene,
    selectedTooth,
    hoveredTooth,
    selectedArch,
    hoveredArch,
    archFilter,
    isIsolated,
    colorByTypeActive,
    activeTypeFilter,
    gumsVisibility,
    boneVisibility,
    teethVisibility,
    highlightedToothIds,
    selectedNerve,
  ]);

  return (
    <primitive
      ref={modelRef}
      object={clonedScene}
      onClick={(e) => {
        e.stopPropagation();
        const meshName = e.object.name;
        if (meshName.startsWith("tooth-")) {
          onSelectTooth(meshName);
        } else {
          const arch = getMeshArch(meshName);
          if (arch && onSelectArch) {
            onSelectArch(arch);
          }
        }
      }}
      onPointerOver={(e) => {
        if (isOrbitingRef?.current) return;
        e.stopPropagation();
        const meshName = e.object.name;
        if (meshName.startsWith("tooth-")) {
          onHoverTooth(meshName);
          document.body.style.cursor = "pointer";
        } else {
          const arch = getMeshArch(meshName);
          if (arch && onHoverArch) {
            onHoverArch(arch);
            document.body.style.cursor = "pointer";
          }
        }
      }}
      onPointerOut={(e) => {
        if (isOrbitingRef?.current) return;
        e.stopPropagation();
        onHoverTooth(null);
        if (onHoverArch) onHoverArch(null);
        document.body.style.cursor = "default";
      }}
    />
  );
}

// --- Bounding Box & Camera Framing Calculations ---
// Calculates bounding box of all visible meshes across jaws and nerves
function getVisibleBounds(rootObj, nervesObj) {
  const box = new THREE.Box3();

  const expandWithVisible = (obj) => {
    if (!obj) return;
    obj.updateWorldMatrix(true, true);
    obj.traverse((child) => {
      if (child.isMesh && child.visible && child.geometry) {
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
        if (child.geometry.boundingBox) {
          const meshBox = new THREE.Box3();
          meshBox.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);
          box.union(meshBox);
        }
      }
    });
  };

  expandWithVisible(rootObj);
  expandWithVisible(nervesObj);

  // Fallback to standard setFromObject if box is still empty
  if (box.isEmpty() && rootObj) {
    box.setFromObject(rootObj);
    if (nervesObj) {
      const nBox = new THREE.Box3().setFromObject(nervesObj);
      if (!nBox.isEmpty()) box.union(nBox);
    }
  }

  return box;
}

// Compute comfortable framing distance based on bounding box, camera FOV, and aspect ratio
function computeFrameDistance(box, camera, marginFactor = 1.20) {
  if (!box || box.isEmpty()) return 13.5;

  const size = new THREE.Vector3();
  box.getSize(size);

  // Vertical and horizontal FOV in radians
  const vFovRad = (camera.fov * Math.PI) / 180;
  const aspect = camera.aspect || 1.0;
  const halfVFov = vFovRad / 2;
  const halfHFov = Math.atan(Math.tan(halfVFov) * aspect);

  // Distances to fit bounding box dimensions
  const distY = (size.y * 0.5) / Math.tan(halfVFov);
  const distX = (size.x * 0.5) / Math.tan(halfHFov);

  // Depth buffer margin so front faces are not at the near clipping plane
  const depthPadding = (size.z * 0.5) * 0.4;

  const baseDist = Math.max(distY, distX) + depthPadding;
  return Math.max(baseDist * marginFactor, 5.0);
}

// --- Camera Target and Preset Controller ---
function CameraController({
  controlsRef,
  selectedTooth,
  selectedNerve,
  modelRef,
  nervesModelRef,
  focusSignal,
  viewPreset,
  presetTick,
  archFilter,
  isOrbitingRef,
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const cameraPos = useRef(null);
  const isTransitioning = useRef(false);
  const hasInitializedRef = useRef(false);
  const prevArchFilterRef = useRef(archFilter);

  // 1. Initial Framing: Frame entire model once geometry is ready
  useFrame(() => {
    if (!hasInitializedRef.current && controlsRef.current && modelRef.current) {
      const box = getVisibleBounds(modelRef.current, nervesModelRef?.current);
      if (!box.isEmpty()) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        const fitDist = computeFrameDistance(box, camera, 1.34);

        const controls = controlsRef.current;
        targetPos.current.copy(center);
        controls.target.copy(center);

        // Position camera in front of model at the dynamically calculated distance
        controls.object.position.set(center.x, center.y, center.z + fitDist);
        controls.object.lookAt(center);
        controls.update();

        hasInitializedRef.current = true;
      }
    }

    // 2. Smooth programmatic transitions (presets, focus signal, deselect)
    if (isTransitioning.current && controlsRef.current) {
      // If user starts orbiting manually, immediately cancel transition
      if (isOrbitingRef?.current) {
        isTransitioning.current = false;
        return;
      }

      const controls = controlsRef.current;
      controls.target.lerp(targetPos.current, 0.14);
      if (cameraPos.current) {
        controls.object.position.lerp(cameraPos.current, 0.14);
      }
      controls.update();

      const targetReached = controls.target.distanceTo(targetPos.current) < 0.005;
      const cameraReached =
        !cameraPos.current ||
        controls.object.position.distanceTo(cameraPos.current) < 0.01;

      if (targetReached && cameraReached) {
        controls.target.copy(targetPos.current);
        if (cameraPos.current) controls.object.position.copy(cameraPos.current);
        controls.update();
        isTransitioning.current = false;
      }
    }
  });

  // Smoothly center orbit pivot on selected tooth or selected nerve
  useEffect(() => {
    if (!controlsRef.current) return;

    if (selectedTooth && modelRef.current) {
      const toothObj = modelRef.current.getObjectByName(selectedTooth);
      if (toothObj) {
        const box = new THREE.Box3().setFromObject(toothObj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        targetPos.current.copy(center);
        cameraPos.current = null; // keep current camera distance & angle
        isTransitioning.current = true;
      }
    } else if (selectedNerve) {
      const nerveData = DENTAL_NERVES_DATA[selectedNerve];
      if (nerveData && nerveData.labelPosition) {
        targetPos.current.set(...nerveData.labelPosition);
        cameraPos.current = null;
        isTransitioning.current = true;
      }
    } else if (!selectedTooth && !selectedNerve && hasInitializedRef.current) {
      if (modelRef.current) {
        const box = getVisibleBounds(modelRef.current, nervesModelRef?.current);
        if (!box.isEmpty()) {
          const center = new THREE.Vector3();
          box.getCenter(center);
          targetPos.current.copy(center);
          cameraPos.current = null;
          isTransitioning.current = true;
        }
      }
    }
  }, [selectedTooth, selectedNerve, focusSignal, modelRef]);

  // Handle Preset Viewpoints (Front, Superior, Inferior, Right, Left, Reset)
  useEffect(() => {
    if (!controlsRef.current || !modelRef.current) return;
    if (!hasInitializedRef.current) return;

    const box = getVisibleBounds(modelRef.current, nervesModelRef?.current);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    if (!box.isEmpty()) {
      box.getCenter(center);
      box.getSize(size);
    }
    const fitDist = computeFrameDistance(box, camera, 1.34);

    switch (viewPreset) {
      case "front":
        targetPos.current.copy(center);
        cameraPos.current = new THREE.Vector3(center.x, center.y, center.z + fitDist);
        isTransitioning.current = true;
        break;
      case "upper": // Superior / Maxillary occlusal view
        targetPos.current.set(center.x, center.y + size.y * 0.1, center.z);
        cameraPos.current = new THREE.Vector3(
          center.x,
          center.y + fitDist * 0.95,
          center.z + fitDist * 0.25
        );
        isTransitioning.current = true;
        break;
      case "lower": // Inferior / Mandibular occlusal view
        targetPos.current.set(center.x, center.y - size.y * 0.1, center.z);
        cameraPos.current = new THREE.Vector3(
          center.x,
          center.y - fitDist * 0.95,
          center.z + fitDist * 0.25
        );
        isTransitioning.current = true;
        break;
      case "right": // Right lateral view
        targetPos.current.copy(center);
        cameraPos.current = new THREE.Vector3(
          center.x + fitDist,
          center.y,
          center.z + fitDist * 0.15
        );
        isTransitioning.current = true;
        break;
      case "left": // Left lateral view
        targetPos.current.copy(center);
        cameraPos.current = new THREE.Vector3(
          center.x - fitDist,
          center.y,
          center.z + fitDist * 0.15
        );
        isTransitioning.current = true;
        break;
      case "reset":
        targetPos.current.copy(center);
        cameraPos.current = new THREE.Vector3(center.x, center.y, center.z + fitDist);
        isTransitioning.current = true;
        break;
      default:
        break;
    }
  }, [viewPreset, presetTick, controlsRef, camera]);

  // Handle switching anatomical models or arch filters (e.g. Mandibular vs Maxillary vs All)
  useEffect(() => {
    if (!hasInitializedRef.current || !controlsRef.current || !modelRef.current) return;
    if (prevArchFilterRef.current === archFilter) return;
    prevArchFilterRef.current = archFilter;

    const timer = setTimeout(() => {
      if (!modelRef.current || !controlsRef.current) return;
      const box = getVisibleBounds(modelRef.current, nervesModelRef?.current);
      if (!box.isEmpty()) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        const fitDist = computeFrameDistance(box, camera, 1.34);

        targetPos.current.copy(center);
        cameraPos.current = new THREE.Vector3(center.x, center.y, center.z + fitDist);
        isTransitioning.current = true;
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [archFilter, camera]);

  return null;
}

// --- Main Application Component ---
export default function DentalViewer() {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [hoveredTooth, setHoveredTooth] = useState(null);
  const [selectedNerve, setSelectedNerve] = useState(null);
  const [hoveredNerve, setHoveredNerve] = useState(null);

  // Arch selection & isolation state ('all' | 'mandibular' | 'maxillary')
  const [archFilter, setArchFilter] = useState("all");
  const [selectedArch, setSelectedArch] = useState(null);
  const [hoveredArch, setHoveredArch] = useState(null);

  const [isIsolated, setIsIsolated] = useState(false);
  const [colorByTypeActive, setColorByTypeActive] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState("all"); // "all" | "Canine" | "Molar" | "Incisor" | "Premolar"

  const [gumsVisibility, setGumsVisibility] = useState("solid"); // 'solid', 'ghost', 'hidden'
  const [boneVisibility, setBoneVisibility] = useState("solid"); // 'solid', 'ghost', 'hidden'
  const [teethVisibility, setTeethVisibility] = useState("solid"); // 'solid', 'ghost', 'hidden'
  const [nervesVisibility, setNervesVisibility] = useState("solid"); // 'solid', 'ghost', 'hidden'
  const [canalVisibility, setCanalVisibility] = useState("ghost"); // 'solid', 'ghost', 'hidden'
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [activeNerveDivision, setActiveNerveDivision] = useState("all"); // 'all', 'V3', 'V2', 'mandibular', 'maxillary'
  const [highlightedNerveTeeth, setHighlightedNerveTeeth] = useState([]);

  const [viewPreset, setViewPreset] = useState("front");
  const [presetTick, setPresetTick] = useState(0);
  const handleSelectPreset = useCallback((preset) => {
    setViewPreset(preset);
    setPresetTick((t) => t + 1);
  }, []);

  const [canvasBgColor, setCanvasBgColor] = useState("#0B1117");
  const [focusSignal, setFocusSignal] = useState(0);
  const [inspectingToothId, setInspectingToothId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOdontogramCollapsed, setIsOdontogramCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isInspectorFloating, setIsInspectorFloating] = useState(false);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState(false);
  const [inspectorPos, setInspectorPos] = useState({ x: 0, y: 0 });
  const [isInspectorDragging, setIsInspectorDragging] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(360); // px – docked sidebar width
  const isResizingInspectorRef = useRef(false);
  const [isResizingInspector, setIsResizingInspector] = useState(false);
  const inspectorPanelRef = useRef(null);
  const dragStartRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const workspaceRef = useRef(null);
  const resizeStartRef = useRef({ startX: 0, startWidth: 360 });

  // Initialize inspector floating coordinates on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setInspectorPos({
        x: Math.max(20, window.innerWidth - 440),
        y: 60,
      });
    }
  }, []);

  // Handle pointer down on inspector header to allow dragging across viewport
  const handleInspectorPointerDown = useCallback(
    (e) => {
      // Ignore interactive clicks on buttons, inputs, links
      if (e.target.closest("button, input, select, a, textarea")) return;

      let initialX = inspectorPos.x;
      let initialY = inspectorPos.y;

      // If currently docked, transition to floating seamlessly at current rect
      if (!isInspectorFloating && inspectorPanelRef.current) {
        const rect = inspectorPanelRef.current.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        setInspectorPos({ x: initialX, y: initialY });
        setIsInspectorFloating(true);
      } else if (inspectorPos.x === 0 && inspectorPos.y === 0) {
        initialX = Math.max(20, window.innerWidth - 440);
        initialY = 60;
        setInspectorPos({ x: initialX, y: initialY });
      }

      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        posX: initialX,
        posY: initialY,
      };

      setIsInspectorDragging(true);

      const onPointerMove = (moveEvt) => {
        const dx = moveEvt.clientX - dragStartRef.current.startX;
        const dy = moveEvt.clientY - dragStartRef.current.startY;
        const panelWidth = inspectorPanelRef.current?.offsetWidth || 380;

        const maxX = Math.max(10, window.innerWidth - panelWidth - 10);
        const maxY = Math.max(50, window.innerHeight - 80);

        const nextX = Math.min(Math.max(10, dragStartRef.current.posX + dx), maxX);
        const nextY = Math.min(Math.max(50, dragStartRef.current.posY + dy), maxY);

        setInspectorPos({ x: nextX, y: nextY });
      };

      const onPointerUp = () => {
        setIsInspectorDragging(false);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [isInspectorFloating, inspectorPos]
  );

  // Toggle docked / floating window mode
  const handleToggleInspectorFloating = useCallback(() => {
    if (!isInspectorFloating) {
      if (inspectorPanelRef.current) {
        const rect = inspectorPanelRef.current.getBoundingClientRect();
        setInspectorPos({
          x: Math.max(20, Math.min(rect.left, window.innerWidth - 440)),
          y: Math.max(56, rect.top),
        });
      } else {
        setInspectorPos({
          x: Math.max(20, window.innerWidth - 440),
          y: 60,
        });
      }
      setIsInspectorExpanded(false);
      setIsInspectorFloating(true);
    } else {
      setIsInspectorFloating(false);
      setIsInspectorExpanded(false);
    }
  }, [isInspectorFloating]);

  // Toggle full-width expand mode (covers viewport toward left edge)
  const handleToggleInspectorExpanded = useCallback(() => {
    if (!isInspectorExpanded) {
      // Switch to floating if not already so we can position it freely
      if (!isInspectorFloating) {
        setIsInspectorFloating(true);
      }
      // Snap to top-left with full screen size
      setInspectorPos({ x: 10, y: 56 });
      setIsInspectorExpanded(true);
    } else {
      setIsInspectorExpanded(false);
      // Return to default right-docked floating position
      setInspectorPos({
        x: Math.max(20, window.innerWidth - 460),
        y: 60,
      });
    }
  }, [isInspectorExpanded, isInspectorFloating]);

  // ─── Docked Sidebar Resize Divider ───────────────────────────────────────
  // Only active when inspector is NOT floating (docked mode).
  const MIN_INSPECTOR_W = 280;
  const MAX_INSPECTOR_W = 650;

  const handleResizePointerDown = useCallback(
    (e) => {
      // Resizing must happen ONLY when user holds the primary (left) mouse button and docked
      if (e.button !== 0 || isInspectorFloating) return;

      e.preventDefault();
      e.stopPropagation();

      const dividerEl = e.currentTarget;
      const pointerId = e.pointerId;

      isResizingInspectorRef.current = true;
      setIsResizingInspector(true);

      resizeStartRef.current = {
        startX: e.clientX,
        startWidth: inspectorWidth,
      };

      if (dividerEl && typeof dividerEl.setPointerCapture === "function") {
        try {
          dividerEl.setPointerCapture(pointerId);
        } catch (err) {}
      }

      // Prevent accidental text selection during a drag, but only while resizing
      const prevUserSelect = document.body.style.userSelect;
      const prevCursor = document.body.style.cursor;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const stopResizing = () => {
        if (!isResizingInspectorRef.current) return;
        isResizingInspectorRef.current = false;
        setIsResizingInspector(false);

        document.body.style.userSelect = prevUserSelect;
        document.body.style.cursor = prevCursor;

        if (dividerEl && typeof dividerEl.releasePointerCapture === "function") {
          try {
            if (dividerEl.hasPointerCapture?.(pointerId)) {
              dividerEl.releasePointerCapture(pointerId);
            }
          } catch (err) {}
        }

        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopResizing);
        window.removeEventListener("pointercancel", stopResizing);
        if (dividerEl) {
          dividerEl.removeEventListener("lostpointercapture", stopResizing);
          dividerEl.removeEventListener("pointerup", stopResizing);
        }
      };

      const onPointerMove = (moveEvt) => {
        if (!isResizingInspectorRef.current) {
          stopResizing();
          return;
        }

        // Resizing must happen ONLY while primary mouse button is actively held down
        if ((moveEvt.buttons & 1) !== 1) {
          stopResizing();
          return;
        }

        // Dragging LEFT → inspector grows; dragging RIGHT → inspector shrinks
        const delta = resizeStartRef.current.startX - moveEvt.clientX;
        const next = Math.min(
          MAX_INSPECTOR_W,
          Math.max(MIN_INSPECTOR_W, Math.round(resizeStartRef.current.startWidth + delta))
        );
        setInspectorWidth(next);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", stopResizing);
      window.addEventListener("pointercancel", stopResizing);
      if (dividerEl) {
        dividerEl.addEventListener("lostpointercapture", stopResizing);
        dividerEl.addEventListener("pointerup", stopResizing);
      }
    },
    [isInspectorFloating, inspectorWidth]
  );
  // ─────────────────────────────────────────────────────────────────────────

  const controlsRef = useRef();
  const modelRef = useRef();
  const nervesModelRef = useRef();
  // Track orbit drag so we can suppress Html labels during rotation
  const isOrbitingRef = useRef(false);
  const [isOrbiting, setIsOrbiting] = useState(false);

  // Tooth selection handler
  const handleSelectTooth = useCallback((toothId) => {
    setSelectedTooth(toothId);
    if (!toothId) {
      setIsIsolated(false);
    } else {
      setSelectedNerve(null);
      setSelectedArch(null);
      setHighlightedNerveTeeth([]);
      setIsInspectorCollapsed(false);
    }
  }, []);

  // Nerve selection handler
  const handleSelectNerve = useCallback((nerveId) => {
    setSelectedNerve(nerveId);
    if (!nerveId) {
      setIsIsolated(false);
      setHighlightedNerveTeeth([]);
    } else {
      setSelectedTooth(null);
      setSelectedArch(null);
      setIsInspectorCollapsed(false);
      const data = DENTAL_NERVES_DATA[nerveId];
      if (data && data.innervatedToothIds) {
        setHighlightedNerveTeeth(data.innervatedToothIds);
      }
      setFocusSignal((prev) => prev + 1);
    }
  }, []);

  // Arch selection handler (Mandibular or Maxillary)
  const handleSelectArch = useCallback((arch) => {
    setSelectedArch((prev) => (prev === arch ? null : arch));
    setSelectedTooth(null);
    setSelectedNerve(null);
    setHighlightedNerveTeeth([]);
    setIsInspectorCollapsed(false);
  }, []);

  const handleFocusTooth = useCallback(() => {
    setFocusSignal((prev) => prev + 1);
  }, []);

  const handleFocusNerve = useCallback(() => {
    setFocusSignal((prev) => prev + 1);
  }, []);

  const handleHighlightType = useCallback((type) => {
    setColorByTypeActive(true);
    setActiveTypeFilter(type);
  }, []);

  // Keyboard shortcut: Esc to deselect / close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (inspectingToothId) {
          setInspectingToothId(null);
        } else if (selectedNerve) {
          setSelectedNerve(null);
          setHighlightedNerveTeeth([]);
          setIsIsolated(false);
        } else if (selectedTooth) {
          setSelectedTooth(null);
          setIsIsolated(false);
        } else if (selectedArch) {
          setSelectedArch(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTooth, selectedNerve, inspectingToothId]);

  // Unified Search (matches both teeth AND dental nerves)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    // Match nerves first
    const matchedNerves = ALL_NERVE_IDS.filter((id) => {
      const data = DENTAL_NERVES_DATA[id];
      if (!data) return false;
      return (
        data.name.toLowerCase().includes(q) ||
        data.abbreviation.toLowerCase().includes(q) ||
        data.division.toLowerCase().includes(q) ||
        data.region.toLowerCase().includes(q)
      );
    }).map((id) => ({
      kind: "nerve",
      id,
      title: DENTAL_NERVES_DATA[id].name,
      sub: `${DENTAL_NERVES_DATA[id].abbreviation} · ${DENTAL_NERVES_DATA[id].division} (${DENTAL_NERVES_DATA[id].region})`,
      badge: "NERVE",
    }));

    // Match teeth
    const matchedTeeth = ALL_TEETH_IDS.filter((id) => {
      const data = TEETH_DATA[id];
      if (!data) return false;
      return (
        data.name.toLowerCase().includes(q) ||
        data.commonName.toLowerCase().includes(q) ||
        data.fdi.toString().includes(q) ||
        data.universal.toString().includes(q) ||
        data.type.toLowerCase().includes(q)
      );
    }).map((id) => ({
      kind: "tooth",
      id,
      title: TEETH_DATA[id].name,
      sub: `FDI ${TEETH_DATA[id].fdi} · Univ #${TEETH_DATA[id].universal}`,
      badge: "TOOTH",
    }));

    return [...matchedNerves, ...matchedTeeth].slice(0, 7);
  }, [searchQuery]);

  return (
    <div className="clinical-app-shell">
      {/* 1. Compact Top Clinical Toolbar */}
      <header className="clinical-topbar">
        <div className="topbar-branding">
          <Crosshair size={18} className="branding-icon" />
          <div className="branding-text">
            <span className="branding-title">MEDICAL HUB BY ZIX · DENTAL EXPLORER</span>
            <span className="branding-meta">Complete Dentition, Jaws & Neurovascular Anatomy</span>
          </div>
        </div>

        {/* Unified Search / Quick Jump */}
        <div className="topbar-search-wrapper">
          <div className="clinical-search-input">
            <Search size={14} className="search-symbol" />
            <input
              type="text"
              placeholder="Search teeth (FDI / name) or nerves (IAN, V3, V2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="search-results-menu">
              {searchResults.map((item) => {
                const isNerve = item.kind === "nerve";
                return (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="search-item"
                    onClick={() => {
                      if (isNerve) {
                        handleSelectNerve(item.id);
                        handleFocusNerve();
                      } else {
                        handleSelectTooth(item.id);
                        handleFocusTooth();
                      }
                      setSearchQuery("");
                    }}
                  >
                    <span className={`search-fdi ${isNerve ? "search-badge-nerve" : ""}`}>
                      {item.badge}
                    </span>
                    <div className="search-names">
                      <span className="search-primary">{item.title}</span>
                      <span className="search-secondary">{item.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* View Orientation Controls & Color Mode Button */}
        <div className="topbar-tools">
          {/* Classification Color Toggle Button */}
          <button
            type="button"
            className={`clinical-tool-btn ${colorByTypeActive ? "active-palette" : ""}`}
            onClick={() => {
              if (colorByTypeActive && activeTypeFilter === "all") {
                setColorByTypeActive(false);
              } else {
                setColorByTypeActive(true);
                setActiveTypeFilter("all");
              }
            }}
            title="Highlight by tooth type: Canines (Red), Molars (Purple), Incisors (Cyan), Premolars (Green)"
          >
            <Palette size={14} />
            <span>Color by Type</span>
          </button>

          <div className="orientation-segmented-group">
            <button
              type="button"
              className={`segmented-btn ${viewPreset === "front" ? "active" : ""}`}
              onClick={() => handleSelectPreset("front")}
              title="Anterior / Frontal View"
            >
              Front
            </button>
            <button
              type="button"
              className={`segmented-btn ${viewPreset === "upper" ? "active" : ""}`}
              onClick={() => handleSelectPreset("upper")}
              title="Maxillary / Superior Occlusal View"
            >
              Superior
            </button>
            <button
              type="button"
              className={`segmented-btn ${viewPreset === "lower" ? "active" : ""}`}
              onClick={() => handleSelectPreset("lower")}
              title="Mandibular / Inferior Occlusal View"
            >
              Inferior
            </button>
            <button
              type="button"
              className={`segmented-btn ${viewPreset === "right" ? "active" : ""}`}
              onClick={() => handleSelectPreset("right")}
              title="Right Lateral View"
            >
              Right
            </button>
            <button
              type="button"
              className={`segmented-btn ${viewPreset === "left" ? "active" : ""}`}
              onClick={() => handleSelectPreset("left")}
              title="Left Lateral View"
            >
              Left
            </button>
          </div>

          <button
            type="button"
            className="clinical-tool-btn"
            onClick={() => {
              handleSelectPreset("reset");
              setSelectedTooth(null);
              setSelectedNerve(null);
              setHighlightedNerveTeeth([]);
              setIsIsolated(false);
              setColorByTypeActive(false);
              setActiveTypeFilter("all");
              setGumsVisibility("solid");
              setBoneVisibility("solid");
              setTeethVisibility("solid");
              setNervesVisibility("solid");
              setCanalVisibility("ghost");
              setLabelsVisible(true);
              setActiveNerveDivision("all");
              setArchFilter("all");
              setSelectedArch(null);
              setCanvasBgColor("#0B1117");
            }}
            title="Reset Camera, Layers & Selections"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className={`clinical-tool-btn ${!isInspectorCollapsed ? "active" : ""}`}
            onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
            title={isInspectorCollapsed ? "Open Inspector" : "Collapse Inspector"}
          >
            {isInspectorCollapsed ? <PanelRightOpen size={14} /> : <PanelRightClose size={14} />}
            <span>Inspector</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace: Viewport Column (3D + Odontogram) + Docked Right Inspector */}
      <div
        ref={workspaceRef}
        className="clinical-workspace"
        style={{ userSelect: isResizingInspector ? "none" : undefined }}
      >
        {/* Viewport Column */}
        <div className="clinical-viewport-col">
          {/* Central 3D Viewport Area */}
          <main className="clinical-viewport-container" style={{ backgroundColor: canvasBgColor }}>
            {/* Top Viewport HUD Stack: Vertical non-overlapping flow */}
            <div className="viewport-hud-stack">
              {/* Row 1: Layer & View Controls */}
              <div className="viewport-hud-top">
                {/* Dental Arch Isolation Toggle */}
                <div className="hud-layer-group hud-arch-group">
                  <span className="hud-group-label" style={{ color: "#38BDF8" }}>Arch:</span>
                  <div className="hud-segmented">
                    <button
                      type="button"
                      className={archFilter === "all" ? "active" : ""}
                      onClick={() => {
                        setArchFilter("all");
                        setSelectedArch(null);
                      }}
                      title="Show complete dentition (Both Upper & Lower Arches)"
                    >
                      Both
                    </button>
                    <button
                      type="button"
                      className={archFilter === "mandibular" ? "active" : ""}
                      onClick={() => {
                        const next = archFilter === "mandibular" ? "all" : "mandibular";
                        setArchFilter(next);
                        setSelectedArch(next === "mandibular" ? "mandibular" : null);
                      }}
                      title="See only Mandibular (Lower) Arch and hide Maxillary Arch"
                    >
                      Mandibular
                    </button>
                    <button
                      type="button"
                      className={archFilter === "maxillary" ? "active" : ""}
                      onClick={() => {
                        const next = archFilter === "maxillary" ? "all" : "maxillary";
                        setArchFilter(next);
                        setSelectedArch(next === "maxillary" ? "maxillary" : null);
                      }}
                      title="See only Maxillary (Upper) Arch and hide Mandibular Arch"
                    >
                      Maxillary
                    </button>
                  </div>
                </div>

                {/* Jaw Bone Layer Toggle */}
                <div className="hud-layer-group">
                  <span className="hud-group-label">Bone:</span>
                  <div className="hud-segmented">
                    <button
                      type="button"
                      className={boneVisibility === "solid" ? "active" : ""}
                      onClick={() => setBoneVisibility("solid")}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      className={boneVisibility === "ghost" ? "active" : ""}
                      onClick={() => setBoneVisibility("ghost")}
                      title="20% Ghost transparency to inspect interior canals"
                    >
                      Ghost
                    </button>
                    <button
                      type="button"
                      className={boneVisibility === "hidden" ? "active" : ""}
                      onClick={() => setBoneVisibility("hidden")}
                    >
                      Hide
                    </button>
                  </div>
                </div>

                {/* Teeth Layer Toggle */}
                <div className="hud-layer-group">
                  <span className="hud-group-label">Teeth:</span>
                  <div className="hud-segmented">
                    <button
                      type="button"
                      className={teethVisibility === "solid" ? "active" : ""}
                      onClick={() => setTeethVisibility("solid")}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      className={teethVisibility === "ghost" ? "active" : ""}
                      onClick={() => setTeethVisibility("ghost")}
                      title="Ghost transparency to view root apex neurovascular plexus"
                    >
                      Ghost
                    </button>
                    <button
                      type="button"
                      className={teethVisibility === "hidden" ? "active" : ""}
                      onClick={() => setTeethVisibility("hidden")}
                    >
                      Hide
                    </button>
                  </div>
                </div>

                {/* Nerves Layer Toggle */}
                <div className="hud-layer-group">
                  <span className="hud-group-label" style={{ color: "#FACC15" }}>
                    <Zap size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                    Nerves:
                  </span>
                  <div className="hud-segmented">
                    <button
                      type="button"
                      className={nervesVisibility === "solid" ? "active" : ""}
                      onClick={() => setNervesVisibility("solid")}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      className={nervesVisibility === "ghost" ? "active" : ""}
                      onClick={() => setNervesVisibility("ghost")}
                      title="Subtle ghost nerve fibers"
                    >
                      Ghost
                    </button>
                    <button
                      type="button"
                      className={nervesVisibility === "hidden" ? "active" : ""}
                      onClick={() => setNervesVisibility("hidden")}
                    >
                      Hide
                    </button>
                  </div>
                </div>

                {/* Gums / Soft Tissue Layer Toggle */}
                <div className="hud-layer-group">
                  <span className="hud-group-label">Gums:</span>
                  <div className="hud-segmented">
                    <button
                      type="button"
                      className={gumsVisibility === "solid" ? "active" : ""}
                      onClick={() => setGumsVisibility("solid")}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      className={gumsVisibility === "ghost" ? "active" : ""}
                      onClick={() => setGumsVisibility("ghost")}
                    >
                      Ghost
                    </button>
                    <button
                      type="button"
                      className={gumsVisibility === "hidden" ? "active" : ""}
                      onClick={() => setGumsVisibility("hidden")}
                    >
                      Hide
                    </button>
                  </div>
                </div>

                {/* Mandibular Canal & Mental Foramen */}
                <div className="hud-layer-group">
                  <span className="hud-group-label" style={{ color: "#38BDF8" }}>Canal:</span>
                  <div className="hud-segmented">
                    <button
                      type="button"
                      className={canalVisibility === "solid" ? "active" : ""}
                      onClick={() => setCanalVisibility("solid")}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      className={canalVisibility === "ghost" ? "active" : ""}
                      onClick={() => setCanalVisibility("ghost")}
                      title="Ghost transparency showing interior passage"
                    >
                      Ghost
                    </button>
                    <button
                      type="button"
                      className={canalVisibility === "hidden" ? "active" : ""}
                      onClick={() => setCanalVisibility("hidden")}
                    >
                      Hide
                    </button>
                  </div>
                </div>

                {/* Anatomical Labels Pin Toggle */}
                <div className="hud-layer-group">
                  <button
                    type="button"
                    className={`hud-toggle-btn ${labelsVisible ? "active" : ""}`}
                    onClick={() => setLabelsVisible(!labelsVisible)}
                    title="Toggle 3D anatomical leader pins and callouts"
                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Tag size={12} />
                    <span>Labels {labelsVisible ? "ON" : "OFF"}</span>
                  </button>
                </div>

                {/* Background Color Quick Presets & Custom Palette */}
                <div className="hud-layer-group hud-bg-group">
                  <span className="hud-group-label">Bg:</span>
                  <div className="hud-bg-presets">
                    {BG_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`hud-color-swatch-btn ${
                          canvasBgColor.toLowerCase() === p.color.toLowerCase() ? "active" : ""
                        }`}
                        style={{ backgroundColor: p.color }}
                        onClick={() => setCanvasBgColor(p.color)}
                        title={`${p.label} (${p.color})`}
                        aria-label={p.label}
                      />
                    ))}
                  </div>
                  <label className="hud-custom-color-picker" title="Pick any custom background color">
                    <input
                      type="color"
                      value={canvasBgColor.startsWith("#") && canvasBgColor.length === 7 ? canvasBgColor : "#0B1117"}
                      onChange={(e) => setCanvasBgColor(e.target.value)}
                      className="hud-color-hidden-input"
                    />
                    <Pipette size={11} className="hud-color-picker-icon" />
                    <span
                      className="hud-color-indicator"
                      style={{ backgroundColor: canvasBgColor }}
                    />
                  </label>
                </div>
              </div>

              {/* Row 2: Division Filter Strip (Shown when nerves are visible) */}
              {nervesVisibility !== "hidden" && (
                <div className="hud-classification-strip">
                  <span className="classification-strip-label" style={{ color: "#FACC15" }}>
                    <Zap size={13} />
                    <span>NERVES:</span>
                  </span>

                  <button
                    type="button"
                    className={`type-filter-chip all ${activeNerveDivision === "all" ? "active" : ""}`}
                    onClick={() => setActiveNerveDivision("all")}
                  >
                    All (CN V)
                  </button>

                  <button
                    type="button"
                    className={`type-filter-chip ${activeNerveDivision === "V3" ? "active" : ""}`}
                    onClick={() => setActiveNerveDivision(activeNerveDivision === "V3" ? "all" : "V3")}
                    title="Filter to Mandibular Division (V3) and branches: IAN, Mental, Lingual, Buccal, Incisive"
                  >
                    Mandibular (V3)
                  </button>

                  {activeNerveDivision === "V3" && (
                    <button
                      type="button"
                      className={`type-filter-chip arch-solo ${archFilter === "mandibular" ? "active" : ""}`}
                      onClick={() => {
                        const next = archFilter === "mandibular" ? "all" : "mandibular";
                        setArchFilter(next);
                        setSelectedArch(next === "mandibular" ? "mandibular" : null);
                      }}
                      title="See only Mandibular Arch (hide Maxillary Arch & Nerves)"
                    >
                      <Eye size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                      {archFilter === "mandibular" ? "Showing Only Mandibular" : "See Only Mandibular"}
                    </button>
                  )}

                  <button
                    type="button"
                    className={`type-filter-chip ${activeNerveDivision === "V2" ? "active" : ""}`}
                    onClick={() => setActiveNerveDivision(activeNerveDivision === "V2" ? "all" : "V2")}
                    title="Filter to Maxillary Division (V2) and branches: ASA, MSA, PSA, Infraorbital, Palatines"
                  >
                    Maxillary (V2)
                  </button>

                  {activeNerveDivision === "V2" && (
                    <button
                      type="button"
                      className={`type-filter-chip arch-solo ${archFilter === "maxillary" ? "active" : ""}`}
                      onClick={() => {
                        const next = archFilter === "maxillary" ? "all" : "maxillary";
                        setArchFilter(next);
                        setSelectedArch(next === "maxillary" ? "maxillary" : null);
                      }}
                      title="See only Maxillary Arch (hide Mandibular Arch & Nerves)"
                    >
                      <Eye size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                      {archFilter === "maxillary" ? "Showing Only Maxillary" : "See Only Maxillary"}
                    </button>
                  )}

                  {selectedNerve && (
                    <button
                      type="button"
                      className="type-filter-close"
                      onClick={() => {
                        setSelectedNerve(null);
                        setHighlightedNerveTeeth([]);
                        setIsIsolated(false);
                      }}
                      title="Deselect active nerve"
                    >
                      <X size={12} />
                      <span>Clear {DENTAL_NERVES_DATA[selectedNerve]?.abbreviation}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Row 3: Classification Color Selector Floating Strip */}
              {colorByTypeActive && (
                <div className="hud-classification-strip">
                  <span className="classification-strip-label">
                    <Palette size={13} />
                    <span>CLASSIFICATION:</span>
                  </span>

                  <button
                    type="button"
                    className={`type-filter-chip all ${activeTypeFilter === "all" ? "active" : ""}`}
                    onClick={() => setActiveTypeFilter("all")}
                  >
                    All Types
                  </button>

                  <button
                    type="button"
                    className={`type-filter-chip canine ${activeTypeFilter === "Canine" ? "active" : ""}`}
                    onClick={() => setActiveTypeFilter(activeTypeFilter === "Canine" ? "all" : "Canine")}
                    title="Highlight all Canines in Red (4 teeth)"
                  >
                    <span className="type-chip-dot canine" />
                    <span>Canines (Red · 4)</span>
                  </button>

                  <button
                    type="button"
                    className={`type-filter-chip molar ${activeTypeFilter === "Molar" ? "active" : ""}`}
                    onClick={() => setActiveTypeFilter(activeTypeFilter === "Molar" ? "all" : "Molar")}
                    title="Highlight all Molars in Purple (12 teeth)"
                  >
                    <span className="type-chip-dot molar" />
                    <span>Molars (Purple · 12)</span>
                  </button>

                  <button
                    type="button"
                    className={`type-filter-chip incisor ${activeTypeFilter === "Incisor" ? "active" : ""}`}
                    onClick={() => setActiveTypeFilter(activeTypeFilter === "Incisor" ? "all" : "Incisor")}
                    title="Highlight all Incisors in Blue/Cyan (8 teeth)"
                  >
                    <span className="type-chip-dot incisor" />
                    <span>Incisors (Cyan · 8)</span>
                  </button>

                  <button
                    type="button"
                    className={`type-filter-chip premolar ${activeTypeFilter === "Premolar" ? "active" : ""}`}
                    onClick={() => setActiveTypeFilter(activeTypeFilter === "Premolar" ? "all" : "Premolar")}
                    title="Highlight all Premolars in Green (8 teeth)"
                  >
                    <span className="type-chip-dot premolar" />
                    <span>Premolars (Green · 8)</span>
                  </button>

                  <button
                    type="button"
                    className="type-filter-close"
                    onClick={() => {
                      setColorByTypeActive(false);
                      setActiveTypeFilter("all");
                    }}
                    title="Turn off color classification"
                  >
                    <X size={12} />
                    <span>Enamel</span>
                  </button>
                </div>
              )}

              {/* Row 4: Non-intrusive Arch Solo Active Indicator */}
              {archFilter !== "all" && (
                <div className="arch-solo-indicator">
                  <span className="solo-dot" />
                  <span>Showing Only: <strong>{archFilter === "mandibular" ? "Mandibular Arch" : "Maxillary Arch"}</strong></span>
                  <button
                    type="button"
                    className="solo-exit-btn"
                    onClick={() => {
                      setArchFilter("all");
                      setSelectedArch(null);
                    }}
                    title="Make both arches visible again"
                  >
                    <Eye size={11} />
                    <span>Show Both Arches</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hover Tooth Name Tooltip */}
            {hoveredTooth && !selectedTooth && TEETH_DATA[hoveredTooth] && (
              <div className="viewport-hover-badge">
                <span className="badge-fdi">FDI {TEETH_DATA[hoveredTooth].fdi}</span>
                <span className="badge-name">{TEETH_DATA[hoveredTooth].name}</span>
                <span className="badge-class">[{TEETH_DATA[hoveredTooth].type}]</span>
              </div>
            )}

            {/* Hover Nerve Tooltip */}
            {hoveredNerve && !selectedNerve && DENTAL_NERVES_DATA[hoveredNerve] && (
              <div className="viewport-hover-badge neural">
                <span className="badge-neural-icon">
                  <Zap size={11} />
                </span>
                <span className="badge-fdi">{DENTAL_NERVES_DATA[hoveredNerve].abbreviation}</span>
                <span className="badge-name">{DENTAL_NERVES_DATA[hoveredNerve].name}</span>
                <span className="badge-class">[{DENTAL_NERVES_DATA[hoveredNerve].division}]</span>
              </div>
            )}

            {/* Hover Jaw Bone / Arch Tooltip */}
            {hoveredArch && !selectedArch && !hoveredTooth && !hoveredNerve && (
              <div className="viewport-hover-badge arch">
                <span className="badge-fdi">{hoveredArch === "mandibular" ? "MANDIBLE" : "MAXILLA"}</span>
                <span className="badge-name">
                  {hoveredArch === "mandibular" ? "Mandibular Arch (Lower Jaw)" : "Maxillary Arch (Upper Jaw)"}
                </span>
                <span className="badge-class">[Click to Inspect & Solo]</span>
              </div>
            )}

            {/* Viewport Bottom HUD Info */}
            <div className="viewport-hud-bottom">
              <span>LMB: Rotate</span>
              <span className="hud-sep">·</span>
              <span>MMB / Wheel: Zoom</span>
              <span className="hud-sep">·</span>
              <span>RMB: Pan</span>
              <span className="hud-sep">·</span>
              <span>Click Mesh: Select Tooth, Arch or Nerve</span>
              <span className="hud-sep">·</span>
              <span>Esc: Deselect</span>
            </div>

            {/* Three.js Canvas — powerPreference for GPU, capped dpr, no superfluous re-renders */}
            <Canvas
              camera={{ position: [0, 0, 14], fov: 38, near: 0.01, far: 1000 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, powerPreference: "high-performance", stencil: false, depth: true }}
              style={{ background: canvasBgColor }}
            >
              <SceneBackground color={canvasBgColor} />
              <color attach="background" args={[canvasBgColor]} key={canvasBgColor} />

              {/* Natural Surgical Suite Studio Lighting */}
              <ambientLight intensity={1.4} />
              <hemisphereLight
                skyColor="#E2E8F0"
                groundColor="#475569"
                intensity={1.0}
              />
              <directionalLight position={[6, 8, 8]} intensity={2.2} />
              <directionalLight position={[-6, 5, -6]} intensity={1.5} />
              <directionalLight position={[0, -5, 4]} intensity={0.8} color="#F1F5F9" />

              <Suspense
                fallback={
                  <Html center style={{ color: "#93A2B5", fontSize: "12px", whiteSpace: "nowrap" }}>
                    Loading anatomical models & neural pathways...
                  </Html>
                }
              >
                <Center>
                  {/* Complete 3D Dentition and Jaws */}
                  <InteractiveJawModel
                    selectedTooth={selectedTooth}
                    hoveredTooth={hoveredTooth}
                    selectedArch={selectedArch}
                    hoveredArch={hoveredArch}
                    archFilter={archFilter}
                    isIsolated={isIsolated && Boolean(selectedTooth)}
                    colorByTypeActive={colorByTypeActive}
                    activeTypeFilter={activeTypeFilter}
                    gumsVisibility={gumsVisibility}
                    boneVisibility={boneVisibility}
                    teethVisibility={teethVisibility}
                    highlightedToothIds={highlightedNerveTeeth}
                    selectedNerve={selectedNerve}
                    onSelectTooth={handleSelectTooth}
                    onHoverTooth={setHoveredTooth}
                    onSelectArch={handleSelectArch}
                    onHoverArch={setHoveredArch}
                    modelRef={modelRef}
                    isOrbitingRef={isOrbitingRef}
                  />

                   {/* Dedicated 3D Dental Nerve Anatomy Layer */}
                  <InteractiveNervesModel
                    selectedNerve={selectedNerve}
                    hoveredNerve={hoveredNerve}
                    nervesVisibility={nervesVisibility}
                    canalVisibility={canalVisibility}
                    labelsVisible={labelsVisible}
                    isIsolated={isIsolated && Boolean(selectedNerve)}
                    activeDivision={activeNerveDivision}
                    archFilter={archFilter}
                    onSelectNerve={handleSelectNerve}
                    onHoverNerve={setHoveredNerve}
                    nervesModelRef={nervesModelRef}
                    isOrbitingRef={isOrbitingRef}
                  />
                </Center>
              </Suspense>

              <CameraController
                controlsRef={controlsRef}
                selectedTooth={selectedTooth}
                selectedNerve={selectedNerve}
                modelRef={modelRef}
                nervesModelRef={nervesModelRef}
                focusSignal={focusSignal}
                viewPreset={viewPreset}
                presetTick={presetTick}
                archFilter={archFilter}
                isOrbitingRef={isOrbitingRef}
              />

              <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.16}
                rotateSpeed={1.0}
                minDistance={0.5}
                maxDistance={80}
                onStart={() => {
                  isOrbitingRef.current = true;
                  setHoveredTooth(null);
                  setHoveredNerve(null);
                  setHoveredArch(null);
                }}
                onEnd={() => {
                  isOrbitingRef.current = false;
                }}
              />
            </Canvas>
          </main>

          {/* 3. Collapsible Bottom Odontogram Panel */}
          <div className={`clinical-odontogram-dock ${isOdontogramCollapsed ? "collapsed" : ""}`}>
            <div className="odontogram-dock-bar">
              <div className="dock-bar-title">
                <span className="dock-title-label">FDI DENTAL CHART</span>
                <span className="dock-title-meta">32 Permanent Teeth</span>
                {selectedNerve && highlightedNerveTeeth.length > 0 && (
                  <span className="dock-color-active-pill neural">
                    <Zap size={11} style={{ marginRight: 3, display: "inline" }} />
                    {DENTAL_NERVES_DATA[selectedNerve]?.abbreviation} Supplies {highlightedNerveTeeth.length} Teeth
                  </span>
                )}
                {colorByTypeActive && (
                  <span className="dock-color-active-pill">
                    {activeTypeFilter === "all" ? "Color by Type Active" : `${activeTypeFilter}s Highlighted`}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="dock-collapse-btn"
                onClick={() => setIsOdontogramCollapsed(!isOdontogramCollapsed)}
                title={isOdontogramCollapsed ? "Expand Dental Chart" : "Collapse Dental Chart"}
              >
                <span>{isOdontogramCollapsed ? "Show Chart" : "Hide Chart"}</span>
                {isOdontogramCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {!isOdontogramCollapsed && (
              <div className="odontogram-dock-content">
                <DentalOdontogram
                  selectedTooth={selectedTooth}
                  hoveredTooth={hoveredTooth}
                  onSelectTooth={handleSelectTooth}
                  onHoverTooth={setHoveredTooth}
                  colorByTypeActive={colorByTypeActive}
                  activeTypeFilter={activeTypeFilter}
                  highlightedNerveTeeth={highlightedNerveTeeth}
                  selectedNerveName={
                    selectedNerve ? DENTAL_NERVES_DATA[selectedNerve]?.abbreviation : null
                  }
                  archFilter={archFilter}
                  onSelectArch={(arch) => {
                    setArchFilter(arch);
                    setSelectedArch(arch === "all" ? null : arch);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. Resize Divider + Draggable & Collapsible Anatomical Inspector Panel */}
        {!isInspectorCollapsed && !isInspectorFloating && (
          <div
            className={`inspector-resize-divider ${isResizingInspector ? "active" : ""}`}
            onPointerDown={handleResizePointerDown}
            title="Drag left/right to resize inspector"
            aria-label="Resize inspector"
            role="separator"
          />
        )}
        {!isInspectorCollapsed && (
          <aside
            ref={inspectorPanelRef}
            className={`clinical-inspector-dock ${isInspectorFloating ? "floating" : "docked"} ${
              isInspectorDragging ? "dragging" : ""
            } ${isInspectorExpanded ? "expanded" : ""}`}
            style={
              isInspectorFloating
                ? {
                    left: `${inspectorPos.x}px`,
                    top: `${inspectorPos.y}px`,
                    ...(isInspectorExpanded
                      ? {
                          width: `calc(100vw - 20px)`,
                          height: `calc(100vh - 66px)`,
                          top: "56px",
                          left: "10px",
                        }
                      : {}),
                  }
                : { width: `${inspectorWidth}px` }
            }
          >
            <div
              className="inspector-dock-header"
              onPointerDown={handleInspectorPointerDown}
              onDoubleClick={handleToggleInspectorFloating}
              title="Click and drag to move anywhere • Double-click to dock/undock"
            >
              <div className="dock-header-drag-zone">
                <GripHorizontal size={14} className="dock-drag-icon" />
                <div className="dock-header-title">
                  {selectedNerve ? (
                    <Zap size={14} style={{ color: "#FACC15" }} />
                  ) : (
                    <Activity size={14} />
                  )}
                  <span>
                    {selectedNerve
                      ? "NEUROVASCULAR INSPECTOR"
                      : selectedTooth
                      ? "TOOTH HISTOLOGY INSPECTOR"
                      : selectedArch
                      ? "ARCH ANATOMY INSPECTOR"
                      : "ANATOMICAL INSPECTOR"}
                  </span>
                </div>
                {isInspectorFloating && (
                  <span className="floating-mode-pill">{isInspectorExpanded ? "Full-Screen" : "Draggable"}</span>
                )}
              </div>

              <div className="dock-header-actions">
                {/* Expand / Shrink */}
                <button
                  type="button"
                  className={`dock-tool-btn ${isInspectorExpanded ? "active-accent" : ""}`}
                  onClick={handleToggleInspectorExpanded}
                  title={isInspectorExpanded ? "Shrink Inspector to Default Size" : "Expand Inspector Full-Screen (Left)"}
                >
                  {isInspectorExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
                {/* Dock / Float */}
                <button
                  type="button"
                  className="dock-tool-btn"
                  onClick={handleToggleInspectorFloating}
                  title={isInspectorFloating ? "Dock to Right Sidebar" : "Float / Undock Inspector Window"}
                >
                  {isInspectorFloating ? <Pin size={13} /> : <PinOff size={13} />}
                </button>
                <button
                  type="button"
                  className="dock-close-btn"
                  onClick={() => setIsInspectorCollapsed(true)}
                  title="Collapse Inspector"
                >
                  <PanelRightClose size={14} />
                </button>
              </div>
            </div>

            <div className="inspector-dock-scroll">
              {selectedNerve ? (
                <NerveDetailCard
                  selectedNerveId={selectedNerve}
                  onDeselect={() => {
                    setSelectedNerve(null);
                    setHighlightedNerveTeeth([]);
                    setIsIsolated(false);
                  }}
                  onFocusNerve={handleFocusNerve}
                  isIsolated={isIsolated && Boolean(selectedNerve)}
                  onToggleIsolate={() => setIsIsolated(!isIsolated)}
                  highlightedTeeth={highlightedNerveTeeth}
                  onHighlightInnervatedTeeth={(toothIds) => {
                    setHighlightedNerveTeeth((prev) => (prev.length > 0 ? [] : toothIds));
                  }}
                  onSelectTooth={handleSelectTooth}
                  canalVisibility={canalVisibility}
                  onToggleCanal={() =>
                    setCanalVisibility((prev) => (prev === "hidden" ? "ghost" : "hidden"))
                  }
                />
              ) : selectedTooth ? (
                <ToothDetailCard
                  selectedTooth={selectedTooth}
                  onDeselect={() => {
                    setSelectedTooth(null);
                    setIsIsolated(false);
                  }}
                  onFocusTooth={handleFocusTooth}
                  isIsolated={isIsolated && Boolean(selectedTooth)}
                  onToggleIsolate={() => setIsIsolated(!isIsolated)}
                  onOpenInspector={(id) => setInspectingToothId(id)}
                  onHighlightType={handleHighlightType}
                  colorByTypeActive={colorByTypeActive}
                  activeTypeFilter={activeTypeFilter}
                />
              ) : selectedArch ? (
                <ArchDetailCard
                  arch={selectedArch}
                  archFilter={archFilter}
                  onToggleSoloArch={(arch) => {
                    setArchFilter(archFilter === arch ? "all" : arch);
                  }}
                  onDeselect={() => setSelectedArch(null)}
                  onSelectPreset={(preset) => handleSelectPreset(preset)}
                />
              ) : (
                <NerveDetailCard
                  selectedNerveId={null}
                  onDeselect={() => {}}
                  onFocusNerve={() => {}}
                  isIsolated={false}
                  onToggleIsolate={() => {}}
                />
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 5. 3D Histological Inspection Modal */}
      {inspectingToothId && (
        <ToothInspectionModal
          toothId={inspectingToothId}
          initialBgColor={canvasBgColor}
          onClose={() => setInspectingToothId(null)}
        />
      )}
    </div>
  );
}
