# Dental Neurovascular Anatomy — Spring Boot & MySQL Integration Specification
**Medical Hub By Zix — Interactive Anatomical Platform**  
*Document Version: 1.0.0 | Target Architecture: Spring Boot 3.x / Java 21 / MySQL 8.0+*

---

## 1. Overview & Architectural Contract

The frontend dental explorer in **Medical Hub By Zix** features an interactive 3D dental nerve layer built with **React Three Fiber (Three.js)**. It renders the trigeminal pathway (CN V), the maxillary division (V2), the mandibular division (V3), the mandibular canal, and their terminal dental/periodontal branches.

To decouple development, the frontend includes a client-side data service (`frontend/src/services/nerveService.js`) with an offline-first fallback. When the Spring Boot backend is running, the service queries REST endpoints under `/api/v1/anatomy/nerves`. This document specifies all data contracts, schemas, DTOs, endpoints, and database seed scripts required for the backend implementation.

```
+-------------------------------------------------------------+
|                      React Three Fiber                      |
| (InteractiveNervesModel, NerveDetailCard, DentalOdontogram) |
+------------------------------+------------------------------+
                               |
                               v
               [ frontend/src/services/nerveService.js ]
                               |
         +---------------------+---------------------+
         | (HTTP Fetch with Offline Fallback)        |
         v                                           v
[ Spring Boot REST API ]                   [ Local Bundled Dataset ]
  /api/v1/anatomy/nerves                      (nervesData.js)
         |
         v
  [ MySQL 8.0+ DB ]
```

---

## 2. Stable Anatomical Identifiers

The frontend references all anatomical structures and 3D meshes using kebab-case **Anatomical IDs**. The backend database and API **must** preserve these exact IDs as primary keys or unique lookup keys:

| Division / Scope | Anatomical ID (`nerve_id`) | Anatomical Name | Abbr | 3D Asset Source |
| :--- | :--- | :--- | :--- | :--- |
| **Major Pathway** | `trigeminal-nerve` | Trigeminal Nerve (Cranial Nerve V) | CN V | GLB Mesh Node |
| **Mandibular (V3)** | `mandibular-nerve-v3` | Mandibular Nerve (CN V3) | V3 | GLB Mesh Node |
| **Mandibular (V3)** | `inferior-alveolar-nerve` | Inferior Alveolar Nerve | IAN | GLB Mesh Node |
| **Mandibular (V3)** | `mental-nerve` | Mental Nerve | MN | GLB Mesh Node |
| **Mandibular (V3)** | `incisive-nerve` | Incisive Nerve | IN | GLB Mesh Node |
| **Mandibular (V3)** | `lingual-nerve` | Lingual Nerve | LN | GLB Mesh Node |
| **Mandibular (V3)** | `long-buccal-nerve` | Long Buccal Nerve | LBN / BN | GLB Mesh Node |
| **Mandibular (V3)** | `mylohyoid-nerve` | Mylohyoid Nerve | MHN | Procedural Tube (Registered to mylohyoid groove) |
| **Maxillary (V2)** | `maxillary-nerve-v2` | Maxillary Nerve (CN V2) | V2 | GLB Mesh Node |
| **Maxillary (V2)** | `infraorbital-nerve` | Infraorbital Nerve | ION | GLB Mesh Node |
| **Maxillary (V2)** | `anterior-superior-alveolar-nerve` | Anterior Superior Alveolar Nerve | ASAN | GLB Mesh Node |
| **Maxillary (V2)** | `middle-superior-alveolar-nerve` | Middle Superior Alveolar Nerve | MSAN | GLB Mesh Node |
| **Maxillary (V2)** | `posterior-superior-alveolar-nerve` | Posterior Superior Alveolar Nerve | PSAN | GLB Mesh Node |
| **Maxillary (V2)** | `greater-palatine-nerve` | Greater Palatine Nerve | GPN | Procedural Tube (Registered to greater palatine foramen) |
| **Maxillary (V2)** | `nasopalatine-nerve` | Nasopalatine Nerve | NPN | Procedural Tube (Registered to incisive foramen) |
| **Canal / Landmark**| `mandibular-canal` | Mandibular Canal & Mental Foramen | MC | GLB Mesh Node |

---

## 3. REST API Endpoint Specifications

All endpoints must be mounted under `/api/v1/anatomy`. Standard JSON responses should include standard HTTP status codes: `200 OK`, `404 Not Found`, and `500 Internal Server Error`.

### 3.1. List All Dental Nerves
- **Endpoint**: `GET /api/v1/anatomy/nerves`
- **Query Parameters**:
  - `division` *(optional, string)*: Filter by division (`V2`, `V3`, or `CN_V`).
  - `region` *(optional, string)*: Filter by jaw region (`mandibular`, `maxillary`, or `cranial`).
  - `suppliesTooth` *(optional, integer)*: Filter by FDI tooth notation (e.g. `36`, `48`, `11`).
- **Response**: `200 OK` — `application/json`

#### Example Response Body:
```json
[
  {
    "id": "inferior-alveolar-nerve",
    "name": "Inferior Alveolar Nerve",
    "latinName": "Nervus alveolaris inferior",
    "abbreviation": "IAN",
    "division": "V3",
    "region": "mandibular",
    "type": "Mixed (Sensory predominant with mylohyoid motor branch)",
    "color": "#FACC15",
    "parentNerve": "Mandibular Nerve (V3) — Posterior Division",
    "origin": "Infratemporal fossa, posterior division of V3, descending deep to lateral pterygoid muscle",
    "foramen": "Enters Mandibular Foramen; exits as Mental Nerve via Mental Foramen",
    "course": "Originates in the infratemporal fossa from the posterior division of V3. Descends medial to the ramus of the mandible, enters the mandibular foramen guarded by the lingula, traverses the mandibular canal accompanied by the inferior alveolar artery and vein, supplying all mandibular molar and premolar teeth via the dental plexus. At the mental foramen, it divides into the mental and incisive terminal branches.",
    "meshNodeNames": ["inferior-alveolar-nerve-left", "inferior-alveolar-nerve-right"],
    "innervatedToothIds": [
      "tooth-38", "tooth-37", "tooth-36", "tooth-35", "tooth-34",
      "tooth-48", "tooth-47", "tooth-46", "tooth-45", "tooth-44"
    ]
  }
]
```

---

### 3.2. Get Single Nerve by ID
- **Endpoint**: `GET /api/v1/anatomy/nerves/{id}`
- **Path Variable**: `id` *(string)* — e.g., `inferior-alveolar-nerve`
- **Response**: `200 OK` — Complete anatomical entity with structures supplied, major branches, local anesthesia blocks, and examination revision notes.

#### Example Response Body:
```json
{
  "id": "inferior-alveolar-nerve",
  "name": "Inferior Alveolar Nerve",
  "latinName": "Nervus alveolaris inferior",
  "abbreviation": "IAN",
  "division": "V3",
  "region": "mandibular",
  "type": "Mixed (Sensory predominant with mylohyoid motor branch)",
  "color": "#FACC15",
  "parentNerve": "Mandibular Nerve (V3) — Posterior Division",
  "origin": "Infratemporal fossa, posterior division of V3, descending deep to lateral pterygoid muscle",
  "foramen": "Enters Mandibular Foramen; exits as Mental Nerve via Mental Foramen",
  "course": "Originates in the infratemporal fossa from the posterior division of V3...",
  "structuresSupplied": [
    "Pulp and dentin of all mandibular molar teeth (teeth 38-36, 46-48)",
    "Pulp and dentin of mandibular premolars (teeth 35-34, 44-45)",
    "Surrounding alveolar bone and periodontal ligament of the mandibular posterior quadrant",
    "Buccal periosteum adjacent to mandibular premolars",
    "Contributes to lower lip and chin sensation via terminal mental branch"
  ],
  "majorBranches": [
    "Mylohyoid nerve (given off immediately before entering mandibular foramen — motor to mylohyoid and anterior belly of digastric)",
    "Inferior dental plexus (rami dentales and rami gingivales ad inferiores)",
    "Mental nerve (terminal branch exiting mental foramen)",
    "Incisive nerve (terminal continuation within mandibular canal anteriorly)"
  ],
  "clinicalSignificance": "The most frequently anesthetized peripheral nerve in clinical dentistry. IAN injury is a recognized complication during surgical odontectomy of impacted lower third molars (wisdom teeth) and dental implant placement in the posterior mandible. Assessment of the neurovascular canal position relative to root apices on CBCT is essential preoperatively to avoid permanent paresthesia, hypoesthesia, or dysesthesia of the lower lip and chin.",
  "localAnesthesia": {
    "techniqueName": "Inferior Alveolar Nerve Block (Halstead Method) / Gow-Gates / Vazirani-Akinosi",
    "targetArea": "Pterygomandibular space, superior to the mandibular foramen and lingula on the medial surface of the mandibular ramus",
    "anatomicalLandmarks": [
      "Coronoid notch (greatest concavity on the anterior border of the ramus)",
      "Pterygomandibular raphe (mucous fold along the anterior border of internal pterygoid)",
      "Occlusal plane of mandibular posterior teeth (insert needle 6-10 mm superior to occlusal plane)",
      "Internal oblique ridge of the mandible"
    ],
    "needleGaugeAndLength": "25-gauge or 27-gauge Long needle (32 mm)",
    "structuresAnesthetized": [
      "Mandibular teeth to the dental midline in that quadrant",
      "Body of the mandible and inferior portion of the ramus",
      "Buccal mucoperiosteum anterior to the first mandibular molar (via mental branch)",
      "Anterior two-thirds of the tongue and lingual soft tissues (when lingual nerve is concurrently blocked)"
    ],
    "complications": [
      "Transient facial nerve paralysis (inadvertent deposition into parotid gland capsule)",
      "Hematoma due to puncture of inferior alveolar or maxillary artery / pterygoid plexus",
      "Persistent paresthesia / dysesthesia (<0.01% incidence, higher with 4% articaine/prilocaine)",
      "Trismus (spasm of medial pterygoid muscle following intramuscular injection)"
    ],
    "troubleshooting": "Failure rate is approximately 15-20% due to accessory innervation (mylohyoid nerve, cervical plexus) or ectopic mandibular foramen positioning. If bone contact is not made, withdraw slightly and redirect barrel more posteriorly. If bone contact occurs prematurely (<15 mm), redirect syringe barrel more anteriorly over mandibular incisors."
  },
  "examRevisionNotes": "High-yield Dental Board Pearl: The mylohyoid nerve branches OFF the IAN BEFORE it enters the mandibular foramen. It is MOTOR to mylohyoid and anterior belly of digastric, but carries sensory fibers that can innervate mandibular molars (causing IANB failure). The lingula shields the entry of the IAN. The needle MUST contact bone before depositing anesthetic to prevent parotid gland infiltration.",
  "meshNodeNames": [
    "inferior-alveolar-nerve-left",
    "inferior-alveolar-nerve-right"
  ],
  "innervatedToothIds": [
    "tooth-38", "tooth-37", "tooth-36", "tooth-35", "tooth-34",
    "tooth-48", "tooth-47", "tooth-46", "tooth-45", "tooth-44"
  ]
}
```

---

### 3.3. Get Local Anesthesia Protocols
- **Endpoint**: `GET /api/v1/anatomy/anesthesia-blocks`
- **Query Parameters**:
  - `nerveId` *(optional, string)*: Filter by target nerve (e.g. `inferior-alveolar-nerve`).
- **Response**: `200 OK` — Array of clinical local anesthesia block protocols.

---

## 4. MySQL Relational Schema (DDL)

The schema is normalized into 5 tables with explicit foreign keys, indexes, and full text search support:

```sql
-- ============================================================================
-- Medical Hub By Zix — Dental Neurovascular Anatomy Relational Schema
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `medical_hub_zix` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `medical_hub_zix`;

-- 1. Main Anatomical Nerves Table
CREATE TABLE IF NOT EXISTS `anatomical_nerves` (
  `id` VARCHAR(64) NOT NULL COMMENT 'Kebab-case anatomical ID matching 3D nodes (e.g. inferior-alveolar-nerve)',
  `name` VARCHAR(128) NOT NULL COMMENT 'Official anatomical name',
  `latin_name` VARCHAR(128) DEFAULT NULL COMMENT 'Terminologia Anatomica latin name',
  `abbreviation` VARCHAR(16) NOT NULL COMMENT 'Clinical acronym (e.g. IAN, ASAN, V3)',
  `division` ENUM('CN_V', 'V1', 'V2', 'V3', 'AUTONOMIC', 'CANAL') NOT NULL COMMENT 'Trigeminal division',
  `region` ENUM('mandibular', 'maxillary', 'cranial', 'palatal') NOT NULL COMMENT 'Anatomical region',
  `functional_type` VARCHAR(96) NOT NULL COMMENT 'Classification (Sensory, Motor, Mixed, Parasympathetic)',
  `display_color` VARCHAR(16) NOT NULL DEFAULT '#FACC15' COMMENT 'Hex color for 3D highlights and badges',
  `parent_nerve` VARCHAR(128) DEFAULT NULL COMMENT 'Origin branch or parent trunk',
  `origin` TEXT DEFAULT NULL COMMENT 'Anatomical root origin',
  `foramen` VARCHAR(128) DEFAULT NULL COMMENT 'Cranial or bony foramen of transit',
  `course` TEXT NOT NULL COMMENT 'Detailed anatomical trajectory description',
  `clinical_significance` TEXT NOT NULL COMMENT 'Clinical, surgical, and implantology relevance',
  `exam_revision_notes` TEXT DEFAULT NULL COMMENT 'High-yield board examination pearl',
  `is_procedural_asset` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'True if rendered procedurally in Three.js',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_division` (`division`),
  KEY `idx_region` (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 3D GLTF Mesh Node Mappings
CREATE TABLE IF NOT EXISTS `nerve_mesh_nodes` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `nerve_id` VARCHAR(64) NOT NULL,
  `mesh_node_name` VARCHAR(128) NOT NULL COMMENT 'Node name inside dental_neurovascular_complete.glb',
  `side` ENUM('left', 'right', 'bilateral', 'midline') NOT NULL DEFAULT 'bilateral',
  KEY `idx_nerve_mesh_id` (`nerve_id`),
  CONSTRAINT `fk_nerve_mesh_nodes` 
    FOREIGN KEY (`nerve_id`) REFERENCES `anatomical_nerves` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Innervated Teeth Relationships (Cross-highlighting with DentalOdontogram)
CREATE TABLE IF NOT EXISTS `nerve_innervated_teeth` (
  `nerve_id` VARCHAR(64) NOT NULL,
  `tooth_id` VARCHAR(16) NOT NULL COMMENT 'FDI tooth id: tooth-11 to tooth-48',
  `fdi_number` INT NOT NULL COMMENT 'FDI two-digit notation (e.g. 36, 48)',
  `innervation_type` ENUM('pulpal', 'periodontal', 'buccal_gingival', 'lingual_gingival') NOT NULL DEFAULT 'pulpal',
  PRIMARY KEY (`nerve_id`, `tooth_id`),
  KEY `idx_tooth_fdi` (`fdi_number`),
  CONSTRAINT `fk_nerve_innervated_teeth` 
    FOREIGN KEY (`nerve_id`) REFERENCES `anatomical_nerves` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Anatomical Structures Supplied & Major Branches
CREATE TABLE IF NOT EXISTS `nerve_structures_supplied` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `nerve_id` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  KEY `idx_supp_nerve_id` (`nerve_id`),
  CONSTRAINT `fk_nerve_structures` 
    FOREIGN KEY (`nerve_id`) REFERENCES `anatomical_nerves` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nerve_major_branches` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `nerve_id` VARCHAR(64) NOT NULL,
  `branch_name` VARCHAR(255) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  KEY `idx_branch_nerve_id` (`nerve_id`),
  CONSTRAINT `fk_nerve_branches` 
    FOREIGN KEY (`nerve_id`) REFERENCES `anatomical_nerves` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Dental Local Anesthesia Protocols
CREATE TABLE IF NOT EXISTS `local_anesthesia_protocols` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `nerve_id` VARCHAR(64) NOT NULL,
  `technique_name` VARCHAR(128) NOT NULL,
  `target_area` TEXT NOT NULL,
  `needle_gauge_and_length` VARCHAR(96) NOT NULL,
  `troubleshooting` TEXT DEFAULT NULL,
  KEY `idx_anes_nerve_id` (`nerve_id`),
  CONSTRAINT `fk_nerve_anesthesia` 
    FOREIGN KEY (`nerve_id`) REFERENCES `anatomical_nerves` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `anesthesia_landmarks` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `protocol_id` BIGINT NOT NULL,
  `landmark_description` VARCHAR(255) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_anes_landmarks` 
    FOREIGN KEY (`protocol_id`) REFERENCES `local_anesthesia_protocols` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `anesthesia_complications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `protocol_id` BIGINT NOT NULL,
  `complication_description` VARCHAR(255) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_anes_complications` 
    FOREIGN KEY (`protocol_id`) REFERENCES `local_anesthesia_protocols` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. Spring Boot Entity & DTO Architecture (Java 21)

### 5.1. Spring Data JPA Entity (`AnatomicalNerve.java`)
```java
package com.medicalhub.zix.domain.anatomy;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "anatomical_nerves")
@Getter
@Setter
@NoArgsConstructor
public class AnatomicalNerve {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "latin_name", length = 128)
    private String latinName;

    @Column(name = "abbreviation", nullable = false, length = 16)
    private String abbreviation;

    @Enumerated(EnumType.STRING)
    @Column(name = "division", nullable = false)
    private NerveDivision division;

    @Enumerated(EnumType.STRING)
    @Column(name = "region", nullable = false)
    private NerveRegion region;

    @Column(name = "functional_type", nullable = false, length = 96)
    private String functionalType;

    @Column(name = "display_color", nullable = false, length = 16)
    private String displayColor = "#FACC15";

    @Column(name = "parent_nerve", length = 128)
    private String parentNerve;

    @Column(name = "origin", columnDefinition = "TEXT")
    private String origin;

    @Column(name = "foramen", length = 128)
    private String foramen;

    @Column(name = "course", nullable = false, columnDefinition = "TEXT")
    private String course;

    @Column(name = "clinical_significance", nullable = false, columnDefinition = "TEXT")
    private String clinicalSignificance;

    @Column(name = "exam_revision_notes", columnDefinition = "TEXT")
    private String examRevisionNotes;

    @Column(name = "is_procedural_asset", nullable = false)
    private Boolean isProceduralAsset = false;

    @ElementCollection
    @CollectionTable(name = "nerve_mesh_nodes", joinColumns = @JoinColumn(name = "nerve_id"))
    @Column(name = "mesh_node_name")
    private List<String> meshNodeNames = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "nerve_innervated_teeth", joinColumns = @JoinColumn(name = "nerve_id"))
    @Column(name = "tooth_id")
    private List<String> innervatedToothIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "nerve_structures_supplied", joinColumns = @JoinColumn(name = "nerve_id"))
    @OrderColumn(name = "display_order")
    @Column(name = "description")
    private List<String> structuresSupplied = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "nerve_major_branches", joinColumns = @JoinColumn(name = "nerve_id"))
    @OrderColumn(name = "display_order")
    @Column(name = "branch_name")
    private List<String> majorBranches = new ArrayList<>();

    @OneToOne(mappedBy = "nerve", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LocalAnesthesiaProtocol localAnesthesia;
}
```

---

### 5.2. REST DTO Record (`NerveDetailDTO.java`)
```java
package com.medicalhub.zix.dto.anatomy;

import java.util.List;

public record NerveDetailDTO(
    String id,
    String name,
    String latinName,
    String abbreviation,
    String division,
    String region,
    String type,
    String color,
    String parentNerve,
    String origin,
    String foramen,
    String course,
    List<String> structuresSupplied,
    List<String> majorBranches,
    String clinicalSignificance,
    LocalAnesthesiaDTO localAnesthesia,
    String examRevisionNotes,
    List<String> meshNodeNames,
    List<String> innervatedToothIds
) {
    public record LocalAnesthesiaDTO(
        String techniqueName,
        String targetArea,
        List<String> anatomicalLandmarks,
        String needleGaugeAndLength,
        List<String> structuresAnesthetized,
        List<String> complications,
        String troubleshooting
    ) {}
}
```

---

### 5.3. Spring MVC Controller (`AnatomicalNerveController.java`)
```java
package com.medicalhub.zix.controller.anatomy;

import com.medicalhub.zix.dto.anatomy.NerveDetailDTO;
import com.medicalhub.zix.dto.anatomy.NerveSummaryDTO;
import com.medicalhub.zix.service.anatomy.AnatomicalNerveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/anatomy/nerves")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class AnatomicalNerveController {

    private final AnatomicalNerveService nerveService;

    @GetMapping
    public ResponseEntity<List<NerveSummaryDTO>> listAllNerves(
            @RequestParam(required = false) String division,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Integer suppliesTooth) {
        return ResponseEntity.ok(nerveService.findNerves(division, region, suppliesTooth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NerveDetailDTO> getNerveById(@PathVariable String id) {
        return nerveService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

---

## 6. Seed SQL Script for Database Initialization

Save and execute the following SQL script to populate all 15 dental nerves, structures supplied, branches, and anesthesia blocks:

```sql
USE `medical_hub_zix`;

-- 1. Insert Master Nerve Entries
INSERT INTO `anatomical_nerves` 
  (`id`, `name`, `latin_name`, `abbreviation`, `division`, `region`, `functional_type`, `display_color`, `parent_nerve`, `origin`, `foramen`, `course`, `clinical_significance`, `exam_revision_notes`, `is_procedural_asset`) 
VALUES
('trigeminal-nerve', 'Trigeminal Nerve (Cranial Nerve V)', 'Nervus trigeminus', 'CN V', 'CN_V', 'cranial', 'Mixed (Large Sensory Root + Smaller Motor Root)', '#EAB308', 'Brainstem (Mid-lateral surface of the Pons)', 'Superior Orbital Fissure (V1), Foramen Rotundum (V2), Foramen Ovale (V3)', 'Emerges from pons, forms trigeminal ganglion in Meckel cave, splits into V1, V2, and V3.', 'Largest cranial nerve. Primary sensory nerve of face, teeth, oral mucosa, and motor to muscles of mastication.', 'Trigeminal neuralgia (tic douloureux) causes excruciating paroxysmal shock-like pain.', 'The motor root bypasses the trigeminal ganglion entirely and joins ONLY the mandibular nerve (V3).', FALSE),

('mandibular-nerve-v3', 'Mandibular Nerve (CN V3)', 'Nervus mandibularis', 'V3', 'V3', 'mandibular', 'Mixed (Sensory + Motor)', '#FACC15', 'Trigeminal ganglion (Sensory root) + Pons (Motor root)', 'Foramen Ovale into Infratemporal Fossa', 'Exits skull via foramen ovale, gives off meningeal branch and nerve to medial pterygoid, then divides into anterior and posterior divisions.', 'Innervates all lower teeth, lower lip, chin, anterior 2/3 of tongue, and muscles of mastication (masseter, temporalis, medial/lateral pterygoids).', 'Only trigeminal division carrying branchial motor fibers. Sensory to lower face, motor to 8 muscles.', FALSE),

('inferior-alveolar-nerve', 'Inferior Alveolar Nerve', 'Nervus alveolaris inferior', 'IAN', 'V3', 'mandibular', 'Mixed (Sensory predominant with motor to mylohyoid)', '#FACC15', 'Mandibular Nerve (V3) — Posterior Division', 'Infratemporal fossa deep to lateral pterygoid', 'Mandibular Foramen to Mental Foramen', 'Descends medial to mandibular ramus, enters mandibular canal guarded by lingula, traverses canal to mental foramen.', 'Most frequently anesthetized nerve in dentistry. Risk of permanent paresthesia during lower 3rd molar odontectomy.', 'Mylohyoid nerve branches OFF before IAN enters mandibular foramen. Lingula shields entry.', FALSE),

('mental-nerve', 'Mental Nerve', 'Nervus mentalis', 'MN', 'V3', 'mandibular', 'Pure Sensory (General Somatic Afferent)', '#FACC15', 'Terminal branch of Inferior Alveolar Nerve', 'Mental Foramen (inferior to apices of mandibular premolars)', 'Exits Mental Foramen', 'Exits mandibular canal via mental foramen beneath premolar roots, branching into mental and labial branches.', 'Anesthetized via Mental/Incisive nerve block. Surgical retraction flap risk during premolar implant placement.', 'Mental nerve does NOT innervate tooth pulp; incisive nerve provides pulpal innervation to anterior teeth.', FALSE),

('incisive-nerve', 'Incisive Nerve', 'Nervus incisivus', 'IN', 'V3', 'mandibular', 'Pure Sensory (General Somatic Afferent)', '#FACC15', 'Terminal continuation of Inferior Alveolar Nerve', 'Mandibular Canal at Mental Foramen junction', 'Internal bony incisive canal', 'Continues forward inside mandibular bone anterior to mental foramen, forming incisive nerve plexus.', 'Supplies pulp and periodontal ligament of mandibular canine and incisors across midline.', 'Crossover innervation across midline from contralateral incisive nerve can cause profound anesthesia failure in central incisors.', FALSE),

('lingual-nerve', 'Lingual Nerve', 'Nervus lingualis', 'LN', 'V3', 'mandibular', 'Sensory + Special Sensory & Parasympathetic hitchhikers', '#FACC15', 'Mandibular Nerve (V3) — Posterior Division', 'Infratemporal fossa, running anterior and medial to IAN', 'Sublingual space adjacent to mandibular third molar', 'Descends in pterygomandibular space, passes submandibular duct (Wharton duct) twice ("winds around duct"), enters tongue.', 'Extremely vulnerable during mandibular third molar lingual flap reflection. Injury causes tongue numbness and loss of taste.', 'Chorda tympani (CN VII) hitchhikes on lingual nerve in infratemporal fossa, carrying taste (anterior 2/3) and preganglionic parasympathetics to submandibular ganglion.', FALSE),

('long-buccal-nerve', 'Long Buccal Nerve (Buccal Nerve of V3)', 'Nervus buccalis', 'LBN', 'V3', 'mandibular', 'Pure Sensory (General Somatic Afferent)', '#FACC15', 'Mandibular Nerve (V3) — Anterior Division', 'Between two heads of lateral pterygoid muscle', 'Crosses anterior border of ramus at occlusal level', 'Passes over retromolar pad to supply cheek mucosa and buccal gingiva of lower molars.', 'Requires separate local anesthesia infiltration during lower molar extractions or clamp placement.', 'Long buccal nerve is SENSORY to cheek mucosa. Do NOT confuse with buccal branch of Facial Nerve (CN VII), which is MOTOR to buccinator muscle!', FALSE),

('mylohyoid-nerve', 'Mylohyoid Nerve', 'Nervus mylohyoideus', 'MHN', 'V3', 'mandibular', 'Motor (Branchial Motor) with variable sensory fibers', '#FACC15', 'Inferior Alveolar Nerve (given off immediately before mandibular foramen)', 'Branching point in pterygomandibular space', 'Runs in mylohyoid groove on medial mandibular surface', 'Pierces sphenomandibular ligament, runs in mylohyoid groove, enters submandibular triangle.', 'Frequent source of accessory sensory innervation to mandibular first molar; causes of failure of classical IAN block.', 'Motor to Mylohyoid and Anterior belly of Digastric. Branches BEFORE the mandibular foramen.', TRUE),

('maxillary-nerve-v2', 'Maxillary Nerve (CN V2)', 'Nervus maxillaris', 'V2', 'V2', 'maxillary', 'Pure Sensory (General Somatic Afferent)', '#38BDF8', 'Trigeminal Ganglion (Middle division)', 'Foramen Rotundum into Pterygopalatine Fossa', 'Exits skull via Foramen Rotundum', 'Traverses pterygopalatine fossa, enters orbit via inferior orbital fissure as infraorbital nerve.', 'High tuberosity block or pterygopalatine canal block anesthetizes entire maxillary hemimaxilla.', 'Exits via Foramen Rotundum. Pterygopalatine ganglion is suspended from V2 by two pterygopalatine nerves.', FALSE),

('infraorbital-nerve', 'Infraorbital Nerve', 'Nervus infraorbitalis', 'ION', 'V2', 'maxillary', 'Pure Sensory (General Somatic Afferent)', '#38BDF8', 'Direct continuation of Maxillary Nerve (V2)', 'Inferior Orbital Fissure to Infraorbital Canal', 'Exits Infraorbital Foramen', 'Traverses infraorbital groove and canal in floor of orbit, gives off MSA/ASA nerves, emerges on facial surface of maxilla.', 'Orbital blowout fractures routinely entrap or contuse infraorbital nerve, producing numbness of midface and upper teeth.', 'Terminal cutaneous branches: Inferior palpebral (lower eyelid), Lateral nasal (side of nose), Superior labial (upper lip).', FALSE),

('posterior-superior-alveolar-nerve', 'Posterior Superior Alveolar Nerve', 'Nervus alveolaris superior posterior', 'PSAN', 'V2', 'maxillary', 'Pure Sensory (General Somatic Afferent)', '#38BDF8', 'Maxillary Nerve (V2) in Pterygopalatine Fossa', 'Posterior surface of maxilla (alveolar canals)', 'Posterior superior alveolar foramina', 'Descends on maxillary tuberosity, gives branches to gingiva, enters alveolar canals to form superior dental plexus.', 'PSA block provides profound anesthesia for maxillary molars. Hematoma risk if needle enters pterygoid venous plexus.', 'PSA block innervates 1st, 2nd, and 3rd molars EXCEPT the mesiobuccal root of the maxillary 1st molar (supplied by MSA in 28% of population).', FALSE),

('middle-superior-alveolar-nerve', 'Middle Superior Alveolar Nerve', 'Nervus alveolaris superior medius', 'MSAN', 'V2', 'maxillary', 'Pure Sensory (General Somatic Afferent)', '#38BDF8', 'Infraorbital Nerve inside Infraorbital Groove/Canal', 'Infraorbital canal (lateral wall of maxillary sinus)', 'Traverses lateral wall of maxillary sinus within bone', 'Descends along lateral wall of maxillary sinus to join superior dental plexus above premolars.', 'Anesthetizes maxillary premolars and mesiobuccal root of maxillary 1st molar.', 'Present in approximately 28-30% of human specimens; absent in others, where ASA or PSA compensate.', FALSE),

('anterior-superior-alveolar-nerve', 'Anterior Superior Alveolar Nerve', 'Nervus alveolaris superior anterior', 'ASAN', 'V2', 'maxillary', 'Pure Sensory (General Somatic Afferent)', '#38BDF8', 'Infraorbital Nerve inside Infraorbital Canal', 'Infraorbital canal 6-10 mm prior to infraorbital foramen', 'Canalis sinuosus in anterior wall of maxilla', 'Descends through canalis sinuosus in anterior wall of maxilla, curves toward nasal septum.', 'Supplies maxillary central/lateral incisors and canine. Blocked via ASA or infraorbital injection.', 'Canalis sinuosus transmitted by ASA nerve is an important radiographic landmark on CBCT for anterior implant planning.', FALSE),

('greater-palatine-nerve', 'Greater Palatine Nerve', 'Nervus palatinus major', 'GPN', 'V2', 'palatal', 'Sensory + Postganglionic Parasympathetic/Sympathetic', '#38BDF8', 'Pterygopalatine ganglion (V2 fibers)', 'Pterygopalatine canal to Greater Palatine Foramen', 'Greater Palatine Foramen (near palatal root of maxillary 2nd/3rd molar)', 'Emerges from greater palatine foramen, runs anteriorly in palatal groove toward incisive fossa.', 'Required for palatal periodontal procedures, scaling, and extractions of maxillary posterior teeth.', 'Greater palatine foramen is located 3-4 mm anterior to the junction of hard and soft palates opposite the maxillary 3rd or 2nd molar.', TRUE),

('nasopalatine-nerve', 'Nasopalatine Nerve', 'Nervus nasopalatinus', 'NPN', 'V2', 'palatal', 'Sensory + Postganglionic Parasympathetic/Sympathetic', '#38BDF8', 'Pterygopalatine ganglion (V2 fibers)', 'Sphenopalatine foramen, crosses roof of nasal cavity', 'Incisive Foramen / Incisive Canal (behind maxillary central incisors)', 'Descends along nasal septum, traverses incisive canal to enter anterior hard palate.', 'Most sensitive palatal injection in dentistry. Supplies palatal gingiva from canine to canine.', 'Exits via the Incisive Foramen. Anesthetizes palatal tissue of anterior 6 maxillary teeth (canine to canine).', TRUE);

-- 2. Populate 3D Mesh Node Mappings
INSERT INTO `nerve_mesh_nodes` (`nerve_id`, `mesh_node_name`, `side`) VALUES
('trigeminal-nerve', 'trigeminal-nerve-left', 'left'),
('trigeminal-nerve', 'trigeminal-nerve-right', 'right'),
('mandibular-nerve-v3', 'mandibular-nerve-left', 'left'),
('mandibular-nerve-v3', 'mandibular-nerve-right', 'right'),
('inferior-alveolar-nerve', 'inferior-alveolar-nerve-left', 'left'),
('inferior-alveolar-nerve', 'inferior-alveolar-nerve-right', 'right'),
('mental-nerve', 'mental-nerve-left', 'left'),
('mental-nerve', 'mental-nerve-right', 'right'),
('incisive-nerve', 'incisive-nerve-left', 'left'),
('incisive-nerve', 'incisive-nerve-right', 'right'),
('lingual-nerve', 'lingual-nerve-left', 'left'),
('lingual-nerve', 'lingual-nerve-right', 'right'),
('long-buccal-nerve', 'buccal-nerve-left', 'left'),
('long-buccal-nerve', 'buccal-nerve-right', 'right'),
('maxillary-nerve-v2', 'maxillary-nerve-left', 'left'),
('maxillary-nerve-v2', 'maxillary-nerve-right', 'right'),
('infraorbital-nerve', 'infraorbital-nerve-left', 'left'),
('infraorbital-nerve', 'infraorbital-nerve-right', 'right'),
('posterior-superior-alveolar-nerve', 'posterior-superior-alveolar-nerve-left', 'left'),
('posterior-superior-alveolar-nerve', 'posterior-superior-alveolar-nerve-right', 'right'),
('middle-superior-alveolar-nerve', 'middle-superior-alveolar-nerve-left', 'left'),
('middle-superior-alveolar-nerve', 'middle-superior-alveolar-nerve-right', 'right'),
('anterior-superior-alveolar-nerve', 'anterior-superior-alveolar-nerve-left', 'left'),
('anterior-superior-alveolar-nerve', 'anterior-superior-alveolar-nerve-right', 'right');

-- 3. Populate Innervated Teeth (FDI cross-highlighting)
INSERT INTO `nerve_innervated_teeth` (`nerve_id`, `tooth_id`, `fdi_number`, `innervation_type`) VALUES
('inferior-alveolar-nerve', 'tooth-38', 38, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-37', 37, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-36', 36, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-35', 35, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-34', 34, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-48', 48, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-47', 47, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-46', 46, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-45', 45, 'pulpal'),
('inferior-alveolar-nerve', 'tooth-44', 44, 'pulpal'),

('incisive-nerve', 'tooth-33', 33, 'pulpal'),
('incisive-nerve', 'tooth-32', 32, 'pulpal'),
('incisive-nerve', 'tooth-31', 31, 'pulpal'),
('incisive-nerve', 'tooth-41', 41, 'pulpal'),
('incisive-nerve', 'tooth-42', 42, 'pulpal'),
('incisive-nerve', 'tooth-43', 43, 'pulpal'),

('posterior-superior-alveolar-nerve', 'tooth-18', 18, 'pulpal'),
('posterior-superior-alveolar-nerve', 'tooth-17', 17, 'pulpal'),
('posterior-superior-alveolar-nerve', 'tooth-16', 16, 'pulpal'),
('posterior-superior-alveolar-nerve', 'tooth-26', 26, 'pulpal'),
('posterior-superior-alveolar-nerve', 'tooth-27', 27, 'pulpal'),
('posterior-superior-alveolar-nerve', 'tooth-28', 28, 'pulpal'),

('middle-superior-alveolar-nerve', 'tooth-15', 15, 'pulpal'),
('middle-superior-alveolar-nerve', 'tooth-14', 14, 'pulpal'),
('middle-superior-alveolar-nerve', 'tooth-24', 24, 'pulpal'),
('middle-superior-alveolar-nerve', 'tooth-25', 25, 'pulpal'),

('anterior-superior-alveolar-nerve', 'tooth-13', 13, 'pulpal'),
('anterior-superior-alveolar-nerve', 'tooth-12', 12, 'pulpal'),
('anterior-superior-alveolar-nerve', 'tooth-11', 11, 'pulpal'),
('anterior-superior-alveolar-nerve', 'tooth-21', 21, 'pulpal'),
('anterior-superior-alveolar-nerve', 'tooth-22', 22, 'pulpal'),
('anterior-superior-alveolar-nerve', 'tooth-23', 23, 'pulpal');

-- 4. Populate Local Anesthesia Protocols
INSERT INTO `local_anesthesia_protocols` 
  (`nerve_id`, `technique_name`, `target_area`, `needle_gauge_and_length`, `troubleshooting`) 
VALUES
('inferior-alveolar-nerve', 
 'Inferior Alveolar Nerve Block (Halstead) / Gow-Gates / Vazirani-Akinosi', 
 'Pterygomandibular space, superior to mandibular foramen and lingula on medial ramus', 
 '25-gauge or 27-gauge Long needle (32 mm)', 
 '15-20% failure rate due to mylohyoid accessory innervation or high mandibular foramen. If bone contact is not made, withdraw slightly and redirect barrel posteriorly over contralateral premolars.'),

('posterior-superior-alveolar-nerve',
 'Posterior Superior Alveolar Nerve Block (PSA Block)',
 'Posterior, superior, and medial to the posterior border of the maxillary tuberosity',
 '25-gauge or 27-gauge Short needle (20 mm)',
 'Risk of hematoma from pterygoid venous plexus or maxillary artery if needle is inserted too far posteriorly or laterally. Do not exceed 16 mm insertion depth.'),

('anterior-superior-alveolar-nerve',
 'Infraorbital Nerve Block / ASA Field Infiltration',
 'Infraorbital foramen or mucobuccal fold above canine fossa',
 '25-gauge or 27-gauge Long needle (32 mm)',
 'Finger palpation over infraorbital foramen during injection ensures anesthetic enters the canal; maintain digital pressure for 60 seconds.');
```

---

## 7. 3D Asset Inventory & Provenance

### 7.1. Bundled Binary Assets
- **Dentition & Bones**: `frontend/public/models/dental/dentition/complete_adult_dentition_and_jaws.glb` (Meshopt compressed, authentic adult skull and mandible with 32 discrete tooth meshes `tooth-11` to `tooth-48`, gingiva, and cortical bone).
- **Neurovascular System**: `frontend/public/models/dental/nerves/dental_neurovascular_complete.glb` (Meshopt compressed, 72 discrete nodes containing bilateral CN V trunks, V2, V3, IAN, mental, incisive, lingual, buccal, infraorbital, superior alveolar nerves, and bilateral mandibular canals).

### 7.2. Procedural Supplementary Geometry
The following branches are not modeled as standalone sub-meshes in the source GLB file and are therefore generated procedurally by `InteractiveNervesModel.jsx` using high-precision anatomical spline trajectories:
1. **Mylohyoid Nerve (`mylohyoid-nerve`)**: 3D CatmullRom spline emerging from the pterygomandibular space near the mandibular foramen, running along the internal mylohyoid groove beneath the mylohyoid line to the submandibular triangle.
2. **Greater Palatine Nerve (`greater-palatine-nerve`)**: 3D CatmullRom spline emerging from the greater palatine foramen opposite the maxillary 3rd molar, coursing anteriorly in the palatal vault toward the canine region.
3. **Nasopalatine Nerve (`nasopalatine-nerve`)**: 3D CatmullRom spline emerging from the incisive foramen behind the central incisors, fanning out across the premaxillary lingual papilla.

*License Note*: All embedded 3D assets in `frontend/public/models/` are provided for clinical education and academic research within Medical Hub By Zix under standard 3D anatomical visualization licenses.
