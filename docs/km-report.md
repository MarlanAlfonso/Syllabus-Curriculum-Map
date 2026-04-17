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

Knowledge Mapping is a knowledge management framework concerned with making the structure of knowledge visible. Rather than focusing on the capture or transfer of individual knowledge items, Knowledge Mapping focuses on the relationships between knowledge units — identifying what knowledge exists, how it connects, where it flows, and where it is missing. As Eppler (2006) describes, a knowledge map is "a visual representation of knowledge assets and their relationships, used to navigate, evaluate, and communicate the knowledge structure of an organization or domain." In an academic context, this framework translates directly to the challenge of visualizing how courses, skills, and competencies relate to one another across a program of study.

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

### 2.4 References

Eppler, M. J. (2006). A comparison between concept maps, mind maps, conceptual diagrams, and visual metaphors as complementary tools for knowledge construction and sharing. *Information Visualization, 5*(3), 202–210. https://doi.org/10.1057/palgrave.ivs.9500131

Wenger, E. (1998). *Communities of practice: Learning, meaning, and identity.* Cambridge University Press.

Tergan, S. O., & Keller, T. (Eds.). (2005). *Knowledge and information visualization: Searching for synergies.* Springer. https://doi.org/10.1007/b138081