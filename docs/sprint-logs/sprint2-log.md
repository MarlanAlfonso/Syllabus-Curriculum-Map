# Sprint 2 Log

## Completed Tasks
| ID | Task Description | Assigned To | Status |
| :--- | :--- | :--- | :--- |
| **T-013** | Firestore service functions: getCourses, add, update, disable | Alfonso, Marlan | Completed |
| **T-014** | Prerequisite validation (circular dependency check) | Alfonso, Marlan | Completed |
| **T-015** | Build graphDataBuilder.js utility | Alfonso, Marlan | Completed |
| **T-016** | Build CourseListPage (isActive=true filter) | Hernandez, Janice | Completed |
| **T-017** | Build AddCourseModal and EditCourseModal | Hernandez, Janice | Completed |
| **T-018** | Build SoftDisableConfirmDialog | Hernandez, Janice | Completed |
| **T-019** | Build basic CourseMapPage (tree view) | Hernandez, Janice | Completed |
| **T-020** | Style CourseListPage and Modals (Tailwind) | Militar, Angela | Completed |
| **T-021** | Build reusable tag-input component | Militar, Angela | Completed |
| **T-022** | Style basic CourseMapPage groupings | Militar, Angela | Completed |
| **T-023** | Write and execute TC-001 to TC-010 | Florendo, Angel | Completed |
| **T-024** | File GitHub Issues and write Sprint 2 log | Florendo, Angel | Completed |

## Blocked / Carried Over
* **T-017:** Blocked waiting for **T-014** (prerequisite validation) to be finalized so the multi-select fields could be properly validated during data entry.
* **T-023:** Blocked waiting for **T-016**, **T-017**, and **T-018** to be merged into the `dev` branch to allow for full end-to-end test execution.

## PR Summary
* **PR #18:** Feature: Firestore CRUD Services & Data Model
* **PR #19:** Feature: Prerequisite Validation Logic
* **PR #20:** UI: Course Management Modals and List View
* **PR #21:** Fix: Soft-Disable Logic and Confirmation UI
* **PR #22:** Style: Tailwind Layouts and Responsive Refinement

## Bugs / GitHub Issues Filed
* **Issue #40:** [BUG] TC-011 — Vitest environment failing (document is not defined)
* **Issue #41:** [BUG] TC-005 — Circular prerequisite check failure on recursive loops

## Sprint 2 Gate Status
- **TC-001 to TC-010:** All test cases pass.
- **TC-006 PASS:** Soft-disable confirmed (isActive: false, document not deleted in Firestore).
- **TC-008 PASS:** No `deleteDoc()` found in `src/services/` after full code audit.
- **Sign-off:** Florendo has formally signed off to Alfonso on TC-006 and TC-008.
- **Main Integration:** All Sprint 2 PRs merged to main.

## Retrospective Notes
* **What went well:** The team maintained high data integrity by successfully implementing the soft-disable policy across all components. 
* **What to improve:** We should standardize the testing environment configurations earlier in the sprint to avoid setup blockers during the final audit phase.
* **Technical Difficulty:** **T-014** was the most technically difficult task due to the recursive logic required for circular dependency detection.