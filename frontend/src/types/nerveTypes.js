/**
 * Dental Nerve Anatomy Type Definitions & Data Contracts
 * Defines the schema matching the Medical Hub By Zix Spring Boot backend DTOs.
 */

/**
 * @typedef {'sensory' | 'motor' | 'mixed' | 'parasympathetic_secretomotor' | 'special_sensory'} NerveFunctionType
 * @typedef {'CN V' | 'V1' | 'V2' | 'V3'} TrigeminalDivision
 * @typedef {'mandibular' | 'maxillary' | 'cranial_trunk'} NerveRegion
 * @typedef {'solid' | 'ghost' | 'hidden'} LayerVisibility
 */

/**
 * @typedef {Object} LocalAnesthesiaBlock
 * @property {string} id - Unique identifier (e.g. 'ian-block', 'psa-block')
 * @property {string} name - Official clinical name (e.g. 'Inferior Alveolar Nerve Block')
 * @property {string} technique - Clinical injection technique (e.g. 'Halsted Technique', 'Gow-Gates')
 * @property {string} targetSite - Anatomical target site
 * @property {string} landmarks - Key palpation and visual landmarks
 * @property {string[]} structuresAnesthetized - List of anatomical structures anesthetized
 * @property {string[]} teethCovered - List of FDI tooth IDs covered (e.g. ['tooth-48', 'tooth-47'])
 * @property {string} failureRate - Documented clinical failure rate / anatomical variations
 * @property {string[]} complications - Potential clinical complications
 */

/**
 * @typedef {Object} DentalNerve
 * @property {string} id - Stable anatomical ID (e.g. 'nerve-ian', 'nerve-psan')
 * @property {string} name - Formal anatomical Latin/English name
 * @property {string} abbreviation - Clinical abbreviation (e.g. 'IAN', 'PSAN', 'ASAN', 'V3')
 * @property {TrigeminalDivision} division - Trigeminal division
 * @property {NerveRegion} region - Mandibular or Maxillary dental region
 * @property {string} parentNerveId - ID of parent trunk or branch
 * @property {string} parentNerveName - Display name of parent trunk
 * @property {NerveFunctionType} functionalType - Functional neural classification
 * @property {string} functionalTypeLabel - User-friendly classification label
 * @property {string} origin - Anatomical origin / exit foramen
 * @property {string} course - Detailed anatomical path through bones, canals, and fascial spaces
 * @property {string[]} structuresSupplied - Structures innervated (pulpal, periodontal, osseous, mucosal, cutaneous)
 * @property {string[]} innervatedToothIds - List of FDI tooth keys innervated (e.g. ['tooth-31', 'tooth-32'])
 * @property {string[]} majorBranches - Major sub-branches given off
 * @property {string} clinicalSignificance - Dental and surgical significance (extractions, implants, endodontics)
 * @property {LocalAnesthesiaBlock[]} anesthesiaApplications - Applicable dental local anesthesia techniques
 * @property {string} boardRevisionNote - High-yield examination revision summary
 * @property {string[]} glbNodeNames - Associated 3D node names in the GLB asset
 * @property {boolean} isProceduralBranch - True if rendered via anatomically grounded supplementary curve
 * @property {[number, number, number]} [labelPosition] - 3D label anchor coordinate [x, y, z]
 */

export const NERVE_REGIONS = {
  MANDIBULAR: 'mandibular',
  MAXILLARY: 'maxillary',
  CRANIAL_TRUNK: 'cranial_trunk',
};

export const FUNCTIONAL_TYPE_CONFIG = {
  sensory: {
    label: 'Sensory (General Somatic Afferent)',
    color: '#FACC15',
    bg: 'rgba(250, 204, 21, 0.15)',
    border: 'rgba(250, 204, 21, 0.4)',
  },
  motor: {
    label: 'Branchial Motor (Special Visceral Efferent)',
    color: '#F87171',
    bg: 'rgba(248, 113, 113, 0.15)',
    border: 'rgba(248, 113, 113, 0.4)',
  },
  mixed: {
    label: 'Mixed (Sensory & Motor)',
    color: '#FB923C',
    bg: 'rgba(251, 146, 60, 0.15)',
    border: 'rgba(251, 146, 60, 0.4)',
  },
  parasympathetic_secretomotor: {
    label: 'Parasympathetic Hitchhiking (Visceral Motor)',
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.4)',
  },
  special_sensory: {
    label: 'Special Sensory (Taste - Chorda Tympani)',
    color: '#A855F7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
  },
};
