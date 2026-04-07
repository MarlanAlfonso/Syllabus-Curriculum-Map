# Course Taxonomy

## Field Definitions

| Field          | Type             | Allowed Values / Notes                                          |
|----------------|------------------|-----------------------------------------------------------------|
| courseCode     | string           | Unique. Format: e.g., CS101, IT201. Required.                  |
| courseTitle    | string           | Full course name. Required.                                     |
| units          | number           | Credit units. Typical values: 3, 6.                            |
| yearLevel      | number           | 1, 2, 3, or 4 only.                                            |
| semester       | string           | "1st", "2nd", or "Summer" only.                                |
| prerequisites  | array of strings | Array of courseCode values. Empty array [] = no prerequisites. |
| skillsLearned  | array of strings | Lowercase, hyphenated tags. e.g., ["data-structures", "oop"]  |
| knowledgeBuilt | string           | Short description of what knowledge this course builds.        |
| department     | string           | e.g., "CS", "IT", "IS"                                         |
| isActive       | boolean          | true = shown on map. false = hidden (soft disable only).       |
| createdAt      | timestamp        | Firestore server timestamp. Set on document creation.          |
| updatedAt      | timestamp        | Firestore server timestamp. Updated on every edit.             |

## Prerequisite Policy
- Prerequisites are stored as an array of courseCode strings
- A course with prerequisites: [] is a foundational/entry-level course (root node)
- The system must detect and block circular prerequisites
  - Example of invalid circular chain: CS101 requires CS201, CS201 requires CS101
- Prerequisite links must reference courseCodes that actually exist in Firestore

## Soft-Disable Rule
🔒 No hard deletes. NEVER call deleteDoc() on the courses collection.
All removals set isActive = false only.
This preserves historical prerequisite links and prevents orphaned edges on the map.