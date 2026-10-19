# 3D Dental Anatomy Models — Asset Inventory

This inventory documents all 3D dental anatomy models downloaded, organized, and optimized for **Medical Hub By Zix** inside `frontend/public/models/dental/`.

## Provenance & Attribution Summary

- **Primary Source Data:** BodyParts3D 3.0, © The Database Center for Life Science (DBCLS), Japan.
  - Source distribution: [dbarchive.biosciencedbc.jp](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)
  - STL archive: [github.com/Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)
  - Primary Citation: Mitsuhashi N, et al. *BodyParts3D: 3D structure database for anatomical concepts.* Nucleic Acids Research 37 (2009) D782–D785.
  - License: [Creative Commons Attribution-ShareAlike 2.1 Japan (CC BY-SA 2.1 JP)](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en)
- **Neurovascular Atlas Data:** Z-Anatomy (Open anatomical atlas by Lluís Vinent & contributors).
  - Source: [github.com/Z-Anatomy/Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy)
  - License: [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
- **Curation, Morphological Refinement & Export Pipeline:** Dental Scope project (MIT code / CC BY-SA 2.1 JP & CC BY-SA 4.0 content).
  - Source: [github.com/Yoosseph/dental-scope](https://github.com/Yoosseph/dental-scope)
  - Live Demo: [dental-scope.com](https://dental-scope.com)
  - Commercial / Educational Use: Permitted with attribution under CC BY-SA (ShareAlike). Any adaptations must be shared under a compatible CC BY-SA license.
- **Coordinate System:** Y-Up, Centimeters, centered on the dentition (+Y Superior, -Y Inferior, +Z Anterior, -Z Posterior, +X Patient Left, -X Patient Right).

---

## Directory Summary

| Directory | Description | Asset Count | Key Anatomical Scope |
|---|---|---|---|
| `dentition/` | Complete adult dental arches and jaws | 4 | All 32 permanent teeth, maxilla, mandible, gingiva, condyles, TMJ, masticatory muscles |
| `individual-teeth/` | Separate tooth models | 48 | Complete set of 32 permanent teeth (FDI 11–48) plus descriptive anatomical aliases |
| `cutaway-teeth/` | Internal dental layers & cutaways | 8 | Enamel, coronal/radicular dentin, cementum, PDL, pulp chamber, root canals (incisor, canine, premolar, multirooted molars) |
| `cross-sections/` | Longitudinal & transverse sections | 5 | Longitudinal and transverse cross-sections exposing internal pulp floors, bifurcated & trifurcated canals |
| `periodontal/` | Periodontium and tooth support | 6 | Periodontal ligament (PDL), root cementum, radicular dentin, alveolar bone processes (mandibular & maxillary) |
| `nerves/` | Dental & maxillofacial nerves | 5 | Trigeminal (CN V), Inferior Alveolar Nerve, Incisive, Mental, Lingual, Buccal, Superior Alveolar Nerve plexus, Mandibular canal |

---

## Detailed Asset Records

### 1. Dentition (`frontend/public/models/dental/dentition/`)

#### 1.1 Complete Adult Dentition and Jaws
- **Filename & Relative Path:** `dentition/complete_adult_dentition_and_jaws.glb`
- **Model Name:** Complete Adult Dentition and Jaws with Gingiva and Sinuses
- **Original Download Page URL:** [github.com/Yoosseph/dental-scope](https://github.com/Yoosseph/dental-scope)
- **Author / Creator:** The Database Center for Life Science (DBCLS) / Dental Scope contributors
- **License Name & URL:** Creative Commons Attribution-ShareAlike 2.1 Japan ([CC BY-SA 2.1 JP](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en))
- **Commercial / Educational Use:** Yes, permitted under CC BY-SA with appropriate attribution and share-alike terms.
- **File Format & Size:** Binary glTF (`.glb`), **6.09 MB** (6,389,592 bytes)
- **Anatomical Structures Visible:**
  - Complete upper and lower permanent dentition: all 32 teeth (`tooth-11` through `tooth-48`).
  - Maxilla (left and right), Maxillary sinuses (left and right cavities).
  - Maxillary alveolar processes (left and right bone borders).
  - Upper and lower gingiva (gums) with anatomically fitted cervical margins.
  - Mandible body, Mandibular alveolar process, Mandibular condyles (left and right).
- **Separate Objects:** **Yes, 44 discrete named meshes/nodes**. Every single tooth (11–48), bone segment, sinus cavity, and gingival arch is an independently addressable, selectable object.
- **Known Limitations:** Meshes are decimation-optimized and meshopt-compressed. Maxillary sinuses are modeled cavities inside the solid DBCLS maxilla. Third molars (18, 28, 38, 48) were derived and scaled from second molars to complete the full 32-tooth arch.

#### 1.2 Maxillary Arch (Upper Dentition)
- **Filename & Relative Path:** `dentition/maxillary_arch_upper_dentition.glb`
- **Model Name:** Maxillary Dental Arch and Upper Jaw Unit
- **Original Download Page URL:** [github.com/Yoosseph/dental-scope](https://github.com/Yoosseph/dental-scope)
- **Author / Creator:** DBCLS / Dental Scope contributors
- **License Name & URL:** CC BY-SA 2.1 JP
- **Commercial / Educational Use:** Permitted under CC BY-SA.
- **File Format & Size:** Binary glTF (`.glb`), **6.09 MB** (6,389,532 bytes)
- **Anatomical Structures Visible:** All 16 maxillary teeth (`tooth-11` to `tooth-18`, `tooth-21` to `tooth-28`), maxilla bone (left & right), maxillary alveolar processes, upper gingiva, and bilateral maxillary sinuses.
- **Separate Objects:** **Yes, 23 active distinct nodes/meshes**.
- **Known Limitations:** Retains shared buffer layout with core dataset; non-maxillary nodes are omitted from the default scene hierarchy.

#### 1.3 Mandibular Arch (Lower Dentition)
- **Filename & Relative Path:** `dentition/mandibular_arch_lower_dentition.glb`
- **Model Name:** Mandibular Dental Arch and Lower Jaw Unit
- **Original Download Page URL:** [github.com/Yoosseph/dental-scope](https://github.com/Yoosseph/dental-scope)
- **Author / Creator:** DBCLS / Dental Scope contributors
- **License Name & URL:** CC BY-SA 2.1 JP
- **Commercial / Educational Use:** Permitted under CC BY-SA.
- **File Format & Size:** Binary glTF (`.glb`), **6.09 MB** (6,389,528 bytes)
- **Anatomical Structures Visible:** All 16 mandibular teeth (`tooth-31` to `tooth-38`, `tooth-41` to `tooth-48`), mandible body, mandibular alveolar process, lower gingiva, and bilateral mandibular condyles.
- **Separate Objects:** **Yes, 21 active distinct nodes/meshes**.
- **Known Limitations:** Condylar heads articulate at the TMJ; condylar discs are in `cranial_and_tmj_context.glb`.

#### 1.4 Cranial and TMJ Context
- **Filename & Relative Path:** `dentition/cranial_and_tmj_context.glb`
- **Model Name:** Cranial Bones, TMJ Articulation, and Masticatory Muscles
- **Original Download Page URL:** [github.com/Yoosseph/dental-scope](https://github.com/Yoosseph/dental-scope)
- **Author / Creator:** DBCLS / Dental Scope contributors
- **License Name & URL:** CC BY-SA 2.1 JP
- **Commercial / Educational Use:** Permitted under CC BY-SA.
- **File Format & Size:** Binary glTF (`.glb`), **1,007.7 KB** (1,031,904 bytes)
- **Anatomical Structures Visible:**
  - Temporomandibular Joint (TMJ): Bilateral articular discs (`articular-disc-left`, `articular-disc-right`) and articular fossae of temporal bone.
  - Muscles of Mastication: Masseter (superficial and deep heads, L & R), Temporalis (L & R), Medial Pterygoid (L & R), Lateral Pterygoid (upper and lower heads, L & R), Buccinator (L & R), Mentalis (L & R), Orbicularis Oris.
  - Supporting Cranial Bones: Temporal bones, Zygomatic bones, Palatine bones, Sphenoid bone, Ethmoid bone, Frontal bone, Parietal bones, Occipital bone, Nasal bones, Lacrimal bones, Inferior nasal conchae, Vomer, Hyoid bone.
- **Separate Objects:** **Yes, 45 discrete named meshes/nodes**.
- **Known Limitations:** TMJ articular discs are schematic meshes fitted to condylar landmarks following anatomical descriptions (Detamore & Athanasiou, 2003).

---

### 2. Individual Teeth (`frontend/public/models/dental/individual-teeth/`)

All 32 permanent human teeth are supplied using standard **FDI Two-Digit Dental Notation** (`tooth-11.glb` to `tooth-48.glb`), alongside descriptive anatomical name files for major morphological tooth groups.

#### Notation Quick Reference:
- **Quadrant 1 (Upper Right):** `tooth-11` (Central Incisor) through `tooth-18` (3rd Molar / Wisdom Tooth)
- **Quadrant 2 (Upper Left):** `tooth-21` (Central Incisor) through `tooth-28` (3rd Molar / Wisdom Tooth)
- **Quadrant 3 (Lower Left):** `tooth-31` (Central Incisor) through `tooth-38` (3rd Molar / Wisdom Tooth)
- **Quadrant 4 (Lower Right):** `tooth-41` (Central Incisor) through `tooth-48` (3rd Molar / Wisdom Tooth)

#### Representative Asset Inventory Table:

| Filename | Tooth Type & Arch | Size | Node Count | Internal Sub-objects Included |
|---|---|---|---|---|
| `central_incisor_maxillary_tooth11.glb` / `tooth-11.glb` | Maxillary Central Incisor (11) | 536.0 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `lateral_incisor_maxillary_tooth12.glb` / `tooth-12.glb` | Maxillary Lateral Incisor (12) | 539.0 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `canine_cuspid_maxillary_tooth13.glb` / `tooth-13.glb` | Maxillary Canine / Cuspid (13) | 1.89 MB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `premolar_1st_maxillary_tooth14.glb` / `tooth-14.glb` | Maxillary 1st Premolar / Bicuspid (14) | 2.23 MB | 8 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Buccal Canal, Palatal Canal |
| `premolar_2nd_maxillary_tooth15.glb` / `tooth-15.glb` | Maxillary 2nd Premolar (15) | 644.2 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `molar_1st_maxillary_multirooted_tooth16.glb` / `tooth-16.glb` | Maxillary 1st Molar (16, 3 roots) | 3.22 MB | 10 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, MB1, MB2, DB, Palatal Canals |
| `molar_2nd_maxillary_tooth17.glb` / `tooth-17.glb` | Maxillary 2nd Molar (17) | 1.37 MB | 9 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, MB, DB, Palatal Canals |
| `molar_3rd_maxillary_wisdom_tooth18.glb` / `tooth-18.glb` | Maxillary 3rd Molar / Wisdom Tooth (18) | 2.33 MB | 9 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, MB, DB, Palatal Canals |
| `central_incisor_mandibular_tooth41.glb` / `tooth-41.glb` | Mandibular Central Incisor (41) | 826.7 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `lateral_incisor_mandibular_tooth42.glb` / `tooth-42.glb` | Mandibular Lateral Incisor (42) | 841.9 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `canine_cuspid_mandibular_tooth43.glb` / `tooth-43.glb` | Mandibular Canine / Cuspid (43) | 534.5 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `premolar_1st_mandibular_tooth44.glb` / `tooth-44.glb` | Mandibular 1st Premolar (44) | 963.5 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `premolar_2nd_mandibular_tooth45.glb` / `tooth-45.glb` | Mandibular 2nd Premolar (45) | 841.0 KB | 7 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Single Canal |
| `molar_1st_mandibular_multirooted_tooth46.glb` / `tooth-46.glb` | Mandibular 1st Molar (46, 2 roots) | 3.32 MB | 9 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Mesial-1, Mesial-2, Distal Canals |
| `molar_2nd_mandibular_tooth47.glb` / `tooth-47.glb` | Mandibular 2nd Molar (47) | 1.66 MB | 9 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Mesial-1, Mesial-2, Distal Canals |
| `molar_3rd_mandibular_wisdom_tooth48.glb` / `tooth-48.glb` | Mandibular 3rd Molar / Wisdom Tooth (48) | 1.44 MB | 8 | Enamel, Coronal Dentin, Radicular Dentin, Cementum, PDL, Pulp Chamber, Mesial, Distal Canals |

- **Original Download Page URL:** [github.com/Yoosseph/dental-scope](https://github.com/Yoosseph/dental-scope)
- **Author / Creator:** DBCLS / Dental Scope contributors
- **License:** CC BY-SA 2.1 JP
- **Commercial / Educational Use:** Permitted under CC BY-SA terms.
- **Separate Objects:** **Yes**, every individual tooth `.glb` contains separate internal submeshes corresponding to the physiological tooth layers.
- **Known Limitations:** Third molars are derived geometrically from second molars and scaled to ~90%. Root canal counts follow the most common demographic configurations documented by Monsarrat et al. (2016) and Al-Qudah et al. (2023).

---

### 3. Cutaway Teeth (`frontend/public/models/dental/cutaway-teeth/`)

These models expose the full internal histology and endodontic structures of the teeth.

#### 3.1 Incisor Cutaway Internal Anatomy
- **Filename & Relative Path:** `cutaway-teeth/tooth_11_incisor_cutaway_internal_anatomy.glb`
- **Model Name:** Maxillary Central Incisor Layered Cutaway
- **File Format & Size:** Binary glTF (`.glb`), **536.0 KB**
- **Structures Visible:** `enamel-11`, `dentin-coronal-11`, `dentin-radicular-11`, `cementum-11`, `pdl-11`, `pulp-chamber-11`, `canal-single-11`.
- **Separate Objects:** **Yes, 7 distinct submeshes**.

#### 3.2 Canine Cutaway Internal Anatomy
- **Filename & Relative Path:** `cutaway-teeth/tooth_13_canine_cutaway_internal_anatomy.glb`
- **Model Name:** Maxillary Canine Layered Cutaway
- **File Format & Size:** Binary glTF (`.glb`), **1.89 MB**
- **Structures Visible:** Longest single root in human dentition with internal pulp canal, cementum sheath, coronal dentin, enamel crown, and periodontal ligament.
- **Separate Objects:** **Yes, 7 distinct submeshes**.

#### 3.3 Maxillary Premolar Cutaway (Bifurcated Canals)
- **Filename & Relative Path:** `cutaway-teeth/tooth_14_maxillary_premolar_cutaway_internal_anatomy.glb`
- **Model Name:** Maxillary First Premolar Cutaway with Bifurcated Canals
- **File Format & Size:** Binary glTF (`.glb`), **2.23 MB**
- **Structures Visible:** Demonstrates classic bifurcation of pulp chamber into two distinct canals: `canal-buccal-14` and `canal-palatal-14`.
- **Separate Objects:** **Yes, 8 distinct submeshes**.

#### 3.4 Multirooted Maxillary Molar Cutaway (1st Molar, 16)
- **Filename & Relative Path:** `cutaway-teeth/tooth_16_maxillary_molar_multirooted_cutaway.glb`
- **Model Name:** Maxillary First Molar Multirooted Cutaway (3 Roots, 4 Canals)
- **File Format & Size:** Binary glTF (`.glb`), **3.22 MB**
- **Structures Visible:**
  - 3 distinct anatomical roots: Mesiobuccal root, Distobuccal root, Palatal root.
  - Large coronal pulp chamber (`pulp-chamber-16`).
  - 4 root canals: `canal-mesiobuccal-1-16` (MB1), `canal-mesiobuccal-2-16` (MB2), `canal-distobuccal-16` (DB), and `canal-palatal-16` (Palatal).
  - Radicular dentin, root cementum, and periodontal ligament.
- **Separate Objects:** **Yes, 10 distinct submeshes**.

#### 3.5 Multirooted Mandibular Molar Cutaway (1st Molar, 46)
- **Filename & Relative Path:** `cutaway-teeth/tooth_46_mandibular_molar_multirooted_cutaway.glb`
- **Model Name:** Mandibular First Molar Multirooted Cutaway (2 Roots, 3 Canals)
- **File Format & Size:** Binary glTF (`.glb`), **3.32 MB**
- **Structures Visible:**
  - 2 distinct anatomical roots: Mesial root and Distal root.
  - Pulp chamber (`pulp-chamber-46`).
  - 3 root canals: `canal-mesial-1-46`, `canal-mesial-2-46`, and `canal-distal-46`.
  - Coronal enamel, coronal/radicular dentin, cementum, and PDL.
- **Separate Objects:** **Yes, 9 distinct submeshes**.

#### 3.6 Multirooted Molar 16 Pulp System & Canals (Exposed)
- **Filename & Relative Path:** `cutaway-teeth/tooth_16_pulp_chamber_and_canals_exposed.glb`
- **Model Name:** Maxillary Molar Endodontic Pulp & Canal Cast
- **File Format & Size:** Binary glTF (`.glb`), **3.22 MB**
- **Structures Visible:** Opaque crown enamel removed to directly reveal the 3D branching of the coronal pulp chamber and the four root canals (MB1, MB2, DB, Palatal) through the radicular dentin roots.
- **Separate Objects:** **Yes, 6 active distinct submeshes**.

#### 3.7 Mandibular Molar 46 Pulp System & Canals (Exposed)
- **Filename & Relative Path:** `cutaway-teeth/tooth_46_pulp_chamber_and_canals_exposed.glb`
- **Model Name:** Mandibular Molar Endodontic Pulp & Canal Cast
- **File Format & Size:** Binary glTF (`.glb`), **3.32 MB**
- **Structures Visible:** Opaque enamel removed; directly reveals coronal pulp chamber branching into Mesial-1, Mesial-2, and Distal canals down to apical foramina.
- **Separate Objects:** **Yes, 5 active distinct submeshes**.

#### 3.8 Incisor 11 Pulp Chamber & Canal (Exposed)
- **Filename & Relative Path:** `cutaway-teeth/tooth_11_pulp_chamber_and_canal_exposed.glb`
- **Model Name:** Maxillary Central Incisor Endodontic Pulp Cast
- **File Format & Size:** Binary glTF (`.glb`), **536.0 KB**
- **Structures Visible:** Direct visualization of the incisal pulp horns, coronal chamber, and single root canal in radicular dentin.
- **Separate Objects:** **Yes, 3 active distinct submeshes**.

---

### 4. Cross Sections (`frontend/public/models/dental/cross-sections/`)

These models expose longitudinal and transverse sections through the teeth, revealing internal anatomy without layer obstruction.

#### 4.1 Incisor 11 Longitudinal Internal Cross Section
- **Filename & Relative Path:** `cross-sections/incisor_11_longitudinal_internal_cross_section.glb`
- **Model Name:** Incisor Longitudinal Section through Pulp Chamber and Root Canal
- **File Format & Size:** Binary glTF (`.glb`), **536.0 KB**
- **Structures Visible:** Longitudinal exposure of coronal dentin, radicular dentin, root cementum, coronal pulp chamber, and the full longitudinal length of the single root canal.
- **Separate Objects:** **Yes, 5 distinct submeshes**.

#### 4.2 Premolar 14 Longitudinal Bifurcated Canal Section
- **Filename & Relative Path:** `cross-sections/premolar_14_longitudinal_bifurcated_canal_section.glb`
- **Model Name:** First Premolar Section through Bifurcated Pulp Canals
- **File Format & Size:** Binary glTF (`.glb`), **2.23 MB**
- **Structures Visible:** Longitudinal plane revealing coronal dentin, radicular dentin, cementum, and the bifurcation into buccal and palatal root canals.
- **Separate Objects:** **Yes, 6 distinct submeshes**.

#### 4.3 Maxillary Molar 16 Multirooted Internal Cross Section
- **Filename & Relative Path:** `cross-sections/molar_16_maxillary_multirooted_internal_cross_section.glb`
- **Model Name:** Upper First Molar Section through Pulp Chamber Floor and 3 Roots
- **File Format & Size:** Binary glTF (`.glb`), **3.22 MB**
- **Structures Visible:** Cross-sectional longitudinal exposure across the three roots (mesiobuccal, distobuccal, palatal), showing radicular dentin, cementum, pulp chamber floor, and the four canal orifices (MB1, MB2, DB, Palatal).
- **Separate Objects:** **Yes, 7 distinct submeshes**.

#### 4.4 Mandibular Molar 46 Multirooted Internal Cross Section
- **Filename & Relative Path:** `cross-sections/molar_46_mandibular_multirooted_internal_cross_section.glb`
- **Model Name:** Lower First Molar Section through Mesial and Distal Roots
- **File Format & Size:** Binary glTF (`.glb`), **3.32 MB**
- **Structures Visible:** Section exposing the interior of the mesial and distal roots, radicular dentin, cementum, pulp chamber, and root canal pathways (Mesial-1, Mesial-2, Distal).
- **Separate Objects:** **Yes, 6 distinct submeshes**.

#### 4.5 Molar 16 Transverse Pulp Floor Section
- **Filename & Relative Path:** `cross-sections/molar_16_transverse_pulp_floor_section.glb`
- **Model Name:** Upper Molar Transverse Section at Pulp Chamber Floor
- **File Format & Size:** Binary glTF (`.glb`), **3.22 MB**
- **Structures Visible:** Transverse view isolating the pulp chamber floor where the endodontic canal orifices (MB1, MB2, DB, Palatal) diverge into their respective roots.
- **Separate Objects:** **Yes, 5 distinct submeshes**.

---

### 5. Periodontal Anatomy (`frontend/public/models/dental/periodontal/`)

These models capture the periodontium: alveolar bone processes, tooth sockets, periodontal ligament (PDL), cementum, and supporting radicular dentin.

#### 5.1 Mandibular Arch Periodontal Apparatus with Alveolar Bone
- **Filename & Relative Path:** `periodontal/periodontal_mandibular_arch_with_alveolar_bone.glb`
- **Model Name:** Mandibular Alveolar Bone Process and Periodontal Root Complex
- **File Format & Size:** Binary glTF (`.glb`), **6.09 MB**
- **Structures Visible:** Mandibular alveolar process (`mandibular-alveolar-process`), mandible base body (`mandible-body`), lower gingiva (`gingiva-lower`), and all 16 lower tooth root insertions (`tooth-31` through `tooth-48`).
- **Separate Objects:** **Yes, 19 active distinct submeshes**.

#### 5.2 Maxillary Arch Periodontal Apparatus with Alveolar Bone
- **Filename & Relative Path:** `periodontal/periodontal_maxillary_arch_with_alveolar_bone.glb`
- **Model Name:** Maxillary Alveolar Bone Processes and Periodontal Root Complex
- **File Format & Size:** Binary glTF (`.glb`), **6.09 MB**
- **Structures Visible:** Bilateral maxillary alveolar processes (`maxillary-alveolar-process-left`, `maxillary-alveolar-process-right`), upper gingival margin (`gingiva-upper`), and all 16 upper tooth root insertions (`tooth-11` through `tooth-28`).
- **Separate Objects:** **Yes, 19 active distinct submeshes**.

#### 5.3 Periodontal Unit: Maxillary Molar 16
- **Filename & Relative Path:** `periodontal/periodontal_unit_molar_16.glb`
- **Model Name:** Periodontal Attachment Unit: Upper First Molar
- **File Format & Size:** Binary glTF (`.glb`), **3.22 MB**
- **Structures Visible:** Isolated periodontal ligament (`pdl-16`), root cementum sheath (`cementum-16`), and radicular dentin roots (`dentin-radicular-16`).
- **Separate Objects:** **Yes, 3 distinct submeshes**.

#### 5.4 Periodontal Unit: Mandibular Molar 46
- **Filename & Relative Path:** `periodontal/periodontal_unit_molar_46.glb`
- **Model Name:** Periodontal Attachment Unit: Lower First Molar
- **File Format & Size:** Binary glTF (`.glb`), **3.32 MB**
- **Structures Visible:** Periodontal ligament (`pdl-46`), root cementum (`cementum-46`), and bifurcated radicular dentin roots (`dentin-radicular-46`).
- **Separate Objects:** **Yes, 3 distinct submeshes**.

#### 5.5 Periodontal Unit: Central Incisor 11
- **Filename & Relative Path:** `periodontal/periodontal_unit_incisor_11.glb`
- **Model Name:** Periodontal Attachment Unit: Upper Central Incisor
- **File Format & Size:** Binary glTF (`.glb`), **536.0 KB**
- **Structures Visible:** Periodontal ligament (`pdl-11`), cementum layer (`cementum-11`), and conical radicular dentin root (`dentin-radicular-11`).
- **Separate Objects:** **Yes, 3 distinct submeshes**.

#### 5.6 Periodontal Unit: Canine 13
- **Filename & Relative Path:** `periodontal/periodontal_unit_canine_13.glb`
- **Model Name:** Periodontal Attachment Unit: Upper Canine (Cuspid)
- **File Format & Size:** Binary glTF (`.glb`), **1.89 MB**
- **Structures Visible:** Deep periodontal ligament (`pdl-13`), root cementum (`cementum-13`), and elongated canine radicular root (`dentin-radicular-13`).
- **Separate Objects:** **Yes, 3 distinct submeshes**.

---

### 6. Dental Nerves & Neurovascular Models (`frontend/public/models/dental/nerves/`)

These models illustrate the complete innervation of the jaws and dentition derived from the Z-Anatomy atlas and fitted to the BodyParts3D maxillofacial landmarks.

#### 6.1 Complete Dental & Maxillofacial Neurovascular System
- **Filename & Relative Path:** `nerves/dental_neurovascular_complete.glb`
- **Model Name:** Complete Dental and Oral Neurovascular Supply
- **Original Download Page URL:** [github.com/Yoosseph/dental-scope](https://github.com/Yoosseph/dental-scope)
- **Author / Creator:** Z-Anatomy contributors (CC BY-SA 4.0) / DBCLS (CC BY-SA 2.1 JP) / Dental Scope
- **License Name & URL:** Creative Commons Attribution-ShareAlike 4.0 International ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/))
- **Commercial / Educational Use:** Permitted under CC BY-SA terms.
- **File Format & Size:** Binary glTF (`.glb`), **335.7 KB** (343,776 bytes)
- **Anatomical Structures Visible:**
  - Trigeminal Root & Ganglion (CN V) bilateral.
  - Mandibular Division (V3): Mandibular nerve trunk, Inferior Alveolar Nerve (IAN) traversing the mandibular canal to root apices, Incisive nerve supplying anterior teeth, Mental nerve exiting mental foramen, Lingual nerve, Buccal nerve.
  - Maxillary Division (V2): Maxillary nerve trunk, Infraorbital nerve, Posterior Superior Alveolar Nerve (PSAN), Middle Superior Alveolar Nerve (MSAN), Anterior Superior Alveolar Nerve (ASAN).
  - Skeletal Markers: Mandibular canal translucent envelopes (`mandibular-canal-left`, `mandibular-canal-right`).
  - Maxillofacial Arteries: External carotid artery, Maxillary artery, Inferior alveolar artery, Posterior superior alveolar artery, Descending palatine artery, Facial artery, Buccal artery.
  - Maxillofacial Veins: Internal jugular vein, Retromandibular vein, Maxillary vein, Facial vein, Inferior alveolar vein, Pterygoid venous plexus.
  - Cranial Teaching Paths: Ophthalmic (V1), Facial (VII), Glossopharyngeal (IX), Vagus (X), Hypoglossal (XII).
- **Separate Objects:** **Yes, 72 discrete named meshes/nodes**.

#### 6.2 Inferior Alveolar Nerve and Mandibular Canal
- **Filename & Relative Path:** `nerves/inferior_alveolar_nerve_and_mandibular_canal.glb`
- **Model Name:** Inferior Alveolar Nerve, Mandibular Canal, and Dental Branches
- **File Format & Size:** Binary glTF (`.glb`), **335.6 KB**
- **Structures Visible:** Focuses on the lower jaw nerve pathway: Mandibular nerve trunk, Inferior alveolar nerve entering mandibular foramen, traveling through the mandibular canal envelope (`mandibular-canal`), branching to the molar and premolar apices, dividing into the Mental nerve (exiting mental foramen) and Incisive nerve (to canine and incisors), along with the Lingual and Buccal nerves.
- **Separate Objects:** **Yes, 14 active distinct submeshes**.

#### 6.3 Superior Alveolar Nerve Plexus
- **Filename & Relative Path:** `nerves/superior_alveolar_nerve_plexus.glb`
- **Model Name:** Maxillary Nerve and Superior Alveolar Nerve Plexus
- **File Format & Size:** Binary glTF (`.glb`), **335.5 KB**
- **Structures Visible:** Maxillary nerve (V2), Infraorbital nerve, and the tripartite superior dental innervation:
  - Posterior Superior Alveolar Nerve (PSAN) supplying maxillary molars.
  - Middle Superior Alveolar Nerve (MSAN) supplying maxillary premolars and MB root of 1st molar.
  - Anterior Superior Alveolar Nerve (ASAN) supplying maxillary canine and incisors.
- **Separate Objects:** **Yes, 10 active distinct submeshes**.

#### 6.4 Mandibular Nerve Branches (V3 Isolated)
- **Filename & Relative Path:** `nerves/mandibular_nerve_branches_isolated.glb`
- **Model Name:** Trigeminal Nerve Mandibular Division (V3)
- **File Format & Size:** Binary glTF (`.glb`), **335.6 KB**
- **Structures Visible:** Trigeminal ganglion, Mandibular nerve trunk, Inferior alveolar nerve, Incisive nerve, Mental nerve, Lingual nerve, Buccal nerve (bilateral).
- **Separate Objects:** **Yes, 14 active distinct submeshes**.

#### 6.5 Maxillary Nerve Branches (V2 Isolated)
- **Filename & Relative Path:** `nerves/maxillary_nerve_branches_isolated.glb`
- **Model Name:** Trigeminal Nerve Maxillary Division (V2)
- **File Format & Size:** Binary glTF (`.glb`), **335.6 KB**
- **Structures Visible:** Trigeminal ganglion, Maxillary nerve trunk, Infraorbital nerve, and the complete Superior Alveolar Nerve plexus (anterior, middle, posterior branches bilateral).
- **Separate Objects:** **Yes, 12 active distinct submeshes**.

---

## Technical Integration Notes for Frontend / Three.js / React Three Fiber

1. **glTF Extensions Used:**
   - All production GLB models are compressed with `EXT_meshopt_compression` and `KHR_mesh_quantization`.
   - In Three.js / `@react-three/drei`, enable the Meshopt decoder:
     ```javascript
     import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
     // or with useGLTF:
     useGLTF.preload(url, undefined, undefined, (loader) => {
       loader.setMeshoptDecoder(MeshoptDecoder);
     });
     ```
2. **Coordinate Alignment:**
   - All models (`core`, `neurovascular`, `context`, individual teeth, nerves) share an identical origin and scale (centimeters, +Y Up, +Z Anterior).
   - They can be loaded at position `[0, 0, 0]` and rotation `[0, 0, 0]` to form an exact composite anatomical scene.
3. **Exploding / Selective Visibility:**
   - In individual tooth models and cutaway models, mesh names follow strict conventions:
     - `enamel-XX`: Crown enamel
     - `dentin-coronal-XX`: Coronal dentin
     - `dentin-radicular-XX`: Radicular root dentin
     - `cementum-XX`: Root cementum
     - `pdl-XX`: Periodontal ligament
     - `pulp-chamber-XX`: Coronal pulp chamber
     - `canal-*-XX`: Root canals
   - These can be toggled by name or moved along translation vectors to create exploded interactive views.
