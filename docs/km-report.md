# KM Conceptual Report
## Syllabus & Curriculum Map — Knowledge Mapping System

**Course:** Professional Elective 2
**Institution:** New Era University — College of Computer Studies
**Academic Year:** 2025–2026
**Author:** Alfonso, Marlan (Scrum Master + KM Analyst)
**Date:** April 2026

---

## Section 1: Problem Statement

Academic programs in higher education are built on a foundation of interconnected knowledge — courses that build upon one another, skills that compound across semesters, and prerequisites that define the order in which learning must occur. Despite this inherent interconnectedness, the knowledge structure of most academic curricula remains fragmented, implicit, and difficult to navigate. Course information is scattered across individual syllabi, departmental handbooks, and enrollment systems, none of which present a unified, visual picture of how knowledge flows across a program. Students, instructors, and program administrators must piece together this structure manually — a process that is inefficient, error-prone, and often incomplete.

This fragmentation constitutes a knowledge management problem at its core. The knowledge that defines a curriculum — what each course teaches, what it requires, and what it enables — is largely tacit and distributed. It exists in the minds of faculty members, buried in course documents, and encoded in prerequisite lists that few students ever read holistically. Because this knowledge is implicit rather than explicit, it cannot be easily shared, audited, or improved upon. A new instructor designing a course may be unaware that the knowledge they intend to introduce has already been covered in a prerequisite course. A student choosing electives may not realize that skipping a foundational course will leave critical gaps in their understanding. A program chair reviewing the curriculum may not see that an entire skill domain — such as software testing or database design — is introduced too late or not reinforced across year levels.

The impact of this problem is significant. Students who enroll in courses without the appropriate knowledge background are more likely to struggle or fail, not because the material is too difficult, but because the prerequisite knowledge was never made visible to them. Instructors who design courses in isolation — without a map of what knowledge already exists upstream and downstream — risk redundancy, inconsistency, and missed opportunities for reinforcement. At the program level, knowledge gaps and redundancies go undetected until they manifest as poor student outcomes or accreditation findings. In all of these cases, the root cause is the same: the knowledge structure of the curriculum is not visible.

The Syllabus and Curriculum Map — Knowledge Mapping System addresses this problem directly. By extracting course relationships from Firestore and rendering them as an interactive prerequisite graph, the system makes the curriculum's knowledge structure explicit, navigable, and visual. Courses appear as nodes on a directed graph; prerequisite relationships appear as edges pointing from foundational knowledge to advanced knowledge. Filters allow users to isolate specific year levels, semesters, departments, or skill tags. A detail panel attached to each node surfaces the full knowledge profile of a course — its skills, prerequisites, and the knowledge it builds. Isolated nodes — courses with no connections — are visually flagged, prompting program designers to examine whether those courses belong in the curriculum or need to be linked.

This system does not merely display data. It transforms implicit curriculum knowledge into an explicit, queryable, and visual knowledge map — making it possible for students, instructors, and administrators to understand the program's knowledge architecture at a glance.

**Design Question:** How can a web-based knowledge mapping system make curriculum knowledge relationships explicit and navigable for academic program stakeholders?

---

## Section 2: KM Framework Description

### 2.1 Defining Knowledge Mapping

Knowledge Mapping is a knowledge management framework concerned with making the structure of knowledge visible. Rather than focusing on the capture or transfer of individual knowledge items, Knowledge Mapping focuses on the relationships between knowledge units — identifying what knowledge exists, how it connects, where it flows, and where it is missing. As Eppler (2006) describes, a knowledge map is a visual representation of knowledge assets and their relationships, used to navigate, evaluate, and communicate the knowledge structure of an organization or domain. In an academic context, this framework translates directly to the challenge of visualizing how courses, skills, and competencies relate to one another across a program of study.

Knowledge Mapping was selected as the guiding framework for this system because it addresses the precise nature of the problem: curriculum knowledge is not missing — it exists in syllabi and course documents — but its structure and relationships are invisible. The framework's emphasis on making knowledge relationships explicit through visual representation aligns with the system's core function of rendering a prerequisite graph.

### 2.2 The Five KM Concepts Applied to This System

**Knowledge Nodes** are the discrete, identifiable units of knowledge within a domain. In Knowledge Mapping theory, a node represents a bounded body of knowledge that can be described, located, and connected to other nodes. In this system, each course in the curriculum is a knowledge node. Every node carries a rich profile: a course code that uniquely identifies it, a title that names the knowledge domain it covers, the year level and semester in which it is taught, the skills it imparts, and the broader knowledge it contributes to the program. By treating courses as nodes, the system grounds the abstract concept of a knowledge unit in a concrete, queryable data structure stored in Firestore.

**Knowledge Links** are the relationships that connect knowledge nodes. In Knowledge Mapping, links are directed — they express not just that two knowledge units are related, but which one must precede the other. In this system, knowledge links are implemented as prerequisite relationships. When a course lists another course as a prerequisite, that relationship is stored as an array of course codes in Firestore and rendered as a directed edge on the React Flow graph — an arrow pointing from the prerequisite course to the dependent course. This directionality is essential: it communicates that knowledge flows in one direction, from foundational to advanced, and that the order of learning matters.

**Knowledge Taxonomy** refers to the classification system used to organize and categorize knowledge nodes. A taxonomy imposes structure on a knowledge domain, making it possible to filter, group, and navigate the knowledge space. In this system, the taxonomy is implemented through the course data model: courses are classified by year level (1 through 4), semester (1st, 2nd, or Summer), department, and skills learned. These taxonomic attributes serve as the basis for the filter functions in `graphDataBuilder.js`, allowing users to narrow the map to a specific subset of the curriculum — for example, all Year 2 courses in the first semester that involve data structures.

**Knowledge Flow** describes how knowledge moves through a domain over time — how foundational knowledge enables advanced knowledge, and how learning builds from one stage to the next. In a curriculum, knowledge flow is the sequence of courses across year levels and semesters. This system makes knowledge flow visible through the directed graph: following the edges from a root node (a course with no prerequisites) to its descendants reveals the intended learning path through the program. The graph layout — which positions courses by year level along the horizontal axis — reinforces the temporal dimension of knowledge flow, allowing users to trace a student's knowledge journey from Year 1 to Year 4.

**Knowledge Gaps** are points in the knowledge structure where connections are missing, where knowledge is isolated, or where the flow from foundational to advanced knowledge is broken. In curriculum design, knowledge gaps manifest as courses that have no connection to the rest of the program — they neither require prior knowledge nor enable future knowledge. This system detects knowledge gaps algorithmically: the `buildGraphData()` function flags any course node that has no prerequisites and no dependents as an isolated node (`isIsolated: true`). These nodes are visually distinguished on the map, drawing the attention of program designers to courses that may be disconnected from the curriculum's knowledge structure.

### 2.3 Why Knowledge Mapping Over Other KM Frameworks

Several established KM frameworks were considered for this project. Communities of Practice (Wenger, 1998) focuses on the social dynamics of knowledge sharing within groups — it is well-suited for understanding how instructors share pedagogical knowledge, but it does not provide a mechanism for visualizing structured knowledge relationships between subject domains. Knowledge Transfer frameworks focus on the movement of knowledge from expert to novice — relevant to instruction, but not to the structural problem of mapping curriculum prerequisites. Ontology-based KM frameworks offer powerful semantic modeling but require significant infrastructure and expertise that exceeds the scope of a four-week capstone project.

Knowledge Mapping was chosen because it directly addresses the structural and visual nature of the problem. The curriculum is a network of knowledge relationships, and Knowledge Mapping is the framework designed specifically to represent, navigate, and communicate such networks. Its core constructs — nodes, links, taxonomy, flow, and gaps — map directly onto the data model and user interface of this system, making it both theoretically grounded and practically implementable within the project's constraints.

---

## Section 3: Framework-to-App Mapping

The following table summarizes how each KM concept from the Knowledge Mapping framework is implemented as a concrete feature in the Syllabus and Curriculum Map system.

| KM Concept | App Feature | Where in Code |
|---|---|---|
| Knowledge Nodes | Course documents in Firestore | `courses` collection, `CourseListPage.jsx` |
| Knowledge Links | `prerequisites[]` array + React Flow edges | `graphDataBuilder.js`, edges array |
| Knowledge Taxonomy | `yearLevel`, `semester`, `skillsLearned` tags | Firestore fields, filter sidebar |
| Knowledge Flow | Directed graph (prereq → course) | `CurriculumMapPage.jsx`, React Flow canvas |
| Knowledge Gaps | Isolated nodes visual indicator | `graphDataBuilder.js` `isIsolated` flag |

The treatment of courses as Knowledge Nodes reflects a deliberate architectural decision rooted in KM theory. Each Firestore document in the `courses` collection is not simply a data record — it is a bounded knowledge unit with a defined identity (`courseCode`), a domain (`courseTitle`, `department`), a temporal position in the program (`yearLevel`, `semester`), and a set of competencies it develops (`skillsLearned`, `knowledgeBuilt`). The `CourseListPage` makes these nodes queryable and manageable, allowing administrators to add, edit, and soft-disable knowledge nodes without disrupting the historical integrity of the knowledge graph. By treating the course document as the atomic unit of curriculum knowledge, the system enables the rest of the KM framework to be built on top of it.

The implementation of Knowledge Links as the `prerequisites[]` array is a minimalist but powerful design choice. Rather than creating a separate edge collection in Firestore — which would require joins and transaction management — prerequisite relationships are stored directly on each course document as an array of `courseCode` strings. This keeps the data model flat and readable while preserving the full semantics of a directed knowledge link. The `graphDataBuilder.js` utility reads these arrays at render time and constructs the edges array that React Flow consumes, drawing an arrow from each prerequisite course to its dependent. The direction of the arrow is not arbitrary: it encodes the knowledge dependency — the source node represents knowledge that must exist before the target node's knowledge can be acquired.

The Knowledge Taxonomy is implemented through Firestore's flexible document schema and surfaced through the filter sidebar on the curriculum map. Courses are tagged with `yearLevel` (1–4), `semester` (1st, 2nd, Summer), `department`, and an array of `skillsLearned` strings. The `filterByYearLevel()`, `filterBySemester()`, `filterBySkill()`, and `filterByDepartment()` functions in `graphDataBuilder.js` apply these taxonomy attributes to produce filtered subsets of the graph. This means the taxonomy is not merely a display concern — it is a first-class query mechanism that shapes the knowledge map in real time based on the user's navigational intent.

Knowledge Flow is made visible through the directed React Flow canvas on `CurriculumMapPage`. When a user views the unfiltered curriculum map, they see the full knowledge flow of the program: foundational Year 1 courses with no incoming edges on the left, and advanced Year 4 courses with multiple incoming edges on the right. Following any edge from source to target traces a single step in the program's knowledge flow. Following a chain of edges from a root node to its deepest descendant reveals a complete knowledge learning path — for example, from Introduction to Computing through Intermediate Programming, Data Structures, Object-Oriented Programming, Software Engineering, and finally to the Thesis. This visual representation of knowledge flow is the primary value proposition of the system: it makes implicit curriculum sequencing explicit and navigable.

The detection and display of Knowledge Gaps completes the KM framework implementation. The `buildGraphData()` function identifies isolated nodes — courses with an empty `prerequisites` array and no other course listing them as a prerequisite — and sets `isIsolated: true` on their node data object. Militar's styling task (T-032) uses this flag to render these nodes with a distinct visual treatment, drawing the attention of program designers to potential gaps in the curriculum's knowledge structure. This feature transforms the system from a passive display tool into an active diagnostic instrument for curriculum quality assurance.

---

## Section 4: Knowledge Architecture

The knowledge architecture of this system is built on Firebase Firestore's document-oriented data model, which aligns naturally with the concept of discrete, self-contained knowledge nodes. Each course is stored as a single Firestore document in the `courses` collection, containing all of its knowledge attributes — code, title, year level, semester, prerequisites, skills learned, and knowledge built — in one place. This flat document structure eliminates the need for joins or relational queries, making knowledge retrieval fast and straightforward. The `getCourses()` function in `courseService.js` fetches all active courses in a single query, filtered by `isActive === true`, and returns them as a plain JavaScript array that the rest of the application can consume directly. This simplicity is by design: in a knowledge mapping system, the goal is to make knowledge accessible, not to hide it behind complex query logic.

The encoding of prerequisite relationships as an array of `courseCode` strings within each course document is the most architecturally significant decision in the system. Rather than normalizing relationships into a separate edges collection — which would require additional reads and introduce referential integrity concerns — each course document carries its own knowledge link data. This denormalized approach means that the full knowledge graph can be reconstructed from a single Firestore query, without secondary lookups. The `graphDataBuilder.js` utility performs this reconstruction at render time: it iterates over the courses array, reads each course's `prerequisites` field, and constructs a directed edge for each valid prerequisite link. The result is a `{ nodes, edges }` object that React Flow renders directly as an interactive graph.

The soft-disable mechanism — implemented through the `isActive` boolean field and the `disableCourse()` function in `courseService.js` — is a deliberate knowledge architecture decision with significant implications for knowledge integrity. When a course is removed from the curriculum map, the application does not call `deleteDoc()`. Instead, it sets `isActive: false` on the course document, which causes it to be excluded from `getCourses()` results and therefore from the rendered graph. The document — and its prerequisite links — remains intact in Firestore. This means that if a downstream course still lists the disabled course as a prerequisite, that historical knowledge link is preserved in the data model. Program administrators can re-enable the course, inspect its historical relationships, or migrate its prerequisite links to a replacement course without losing any knowledge structure data. This approach treats the knowledge graph as a historical record, not a transient display, and ensures that the system's knowledge architecture degrades gracefully when curriculum changes occur.

---

## Section 5: Limitations and Future Work

**1. No user authentication in the current build.** The current implementation does not include Firebase Authentication. All users who access the application can view, add, edit, and soft-disable courses without any identity verification or role enforcement. This means that in a production academic environment, the system cannot distinguish between a student browsing the map, an instructor editing their course, and a program chair restructuring the curriculum. Future work should integrate Firebase Authentication with role-based access control — for example, read-only access for students, course-level edit access for instructors, and full administrative access for program chairs. Firebase's security rules can enforce these roles at the database level, ensuring that unauthorized writes are rejected even if the frontend is bypassed.

**2. Prerequisite links are stored as courseCode strings, not Firestore document references.** The current data model stores prerequisites as an array of plain string values (e.g., `["CCC112-18", "CCC121-18"]`). While this is simple and readable, it is not referentially enforced: if a course code is changed or a course document is reorganized, the string references in other courses' prerequisites arrays will become stale without any automatic update or error. Future work should evaluate migrating to Firestore document references (`DocumentReference` type), which would allow the database to maintain relational integrity and support cascading updates. Alternatively, a server-side Cloud Function (available on Firestore's Blaze plan) could validate and repair dangling prerequisite references whenever a course document is modified.

**3. The graph layout is auto-positioned by year level, not semantically optimized.** The current `getPosition()` function in `graphDataBuilder.js` arranges nodes in a simple grid: year level determines the x-axis column, and the course's index within its year level group determines the y-axis row. While functional, this layout does not reflect the actual topology of the knowledge graph — nodes that are directly connected by prerequisite links may be far apart visually, and the graph can become cluttered when a year level contains many courses. Future work should implement a proper hierarchical graph layout algorithm such as Dagre (a directed acyclic graph layout library compatible with React Flow), which would position nodes to minimize edge crossings and make the flow of knowledge through the curriculum visually clear.

**4. No version history for curriculum changes.** The current system records the most recent state of each course document but does not maintain a history of changes. If an administrator edits a course's title, changes its prerequisite links, or disables it, there is no audit trail recording who made the change, when, or what the previous state was. In an academic governance context, this is a significant limitation: curriculum changes typically require documentation and approval workflows. Future work should add an audit log collection in Firestore — for example, a `courseChangeLogs` collection — where each document records the previous and new state of a course, the timestamp of the change, and the user who made it. This audit log would support compliance reporting, change review processes, and the ability to roll back unintended modifications.

---

## Section 6: References

Eppler, M. J. (2006). A comparison between concept maps, mind maps, conceptual diagrams, and visual metaphors as complementary tools for knowledge construction and sharing. *Information Visualization, 5*(3), 202–210. https://doi.org/10.1057/palgrave.ivs.9500131

Vail, E. F. (1999). Knowledge mapping: Getting started with knowledge management. *Information Systems Management, 16*(4), 16–23. https://doi.org/10.1201/1078/43189.16.4.19990901/31199.3

Wenger, E. (1998). *Communities of practice: Learning, meaning, and identity.* Cambridge University Press.

Tergan, S. O., & Keller, T. (Eds.). (2005). *Knowledge and information visualization: Searching for synergies.* Springer. https://doi.org/10.1007/b138081

Ebner, K., & Holweg, M. (2007). Curriculum mapping: A tool for transparent and authentic teaching and learning. *Journal of Marketing Education, 29*(1), 1–12. https://doi.org/10.1177/0273475306293802
