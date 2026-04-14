## Completed Tasks
| ID | Task Description | Assigned To | Status |
| :--- | :--- | :--- | :--- |
| **T-013** | Write Firestore service functions (no deleteDoc) | Alfonso, Marlan | Completed |
| **T-014** | Implement prerequisite validation logic | Alfonso, Marlan | Completed |
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

---

## Blocked / Carried Over
* **T-017:** Blocked waiting for **T-014** (prerequisite validation logic) to ensure multi-select field constraints were functional.
* **T-023:** Blocked waiting for **T-016**, **T-017**, and **T-018** to be merged into `dev` for integrated environment testing.

## PR Summary
* **PR #18** — Feature: Firestore CRUD Services
* **PR #19** — Feature: Prerequisite Validation & Circular Check
* **PR #20** — UI: Course Management Modals & Tables
* **PR #21** — Fix: Soft-Disable Logic and Dialogs
* **PR #22** — Style: Tailwind Layouts for Sprint 2

## Bugs / GitHub Issues Filed
* **Issue #40:** [BUG] TC-011 — Vitest environment failing (document is not defined)
* **Issue #41:** [BUG] TC-005 — Recursive loop detection edge case

---

## Sprint 2 Gate Status
> **Verification Details**
* **TC-001 to TC-010:** All test cases have reached **PASS** status after environment hotfix.
* **TC-006 PASS:** Soft-disable confirmed. Database confirms `isActive: false` status; document persists in Firestore.
* **TC-008 PASS:** Manual code audit confirmed zero instances of `deleteDoc()` in `src/services/`.
* **Sign-off:** Florendo has formally signed off to Alfonso on TC-006 and TC-008.
* **Main Integration:** All Sprint 2 Pull Requests successfully merged to `main`.

---

## Retrospective Notes
* **What went well:** The team successfully maintained data integrity by strictly adhering to the "no-delete" policy. Collaboration between the UI and Service layers was excellent.
* **What to improve:** Environment setup (Vitest/jsdom) needs to be standardized in the project scaffold to prevent testing delays at the sprint deadline.
* **Technical Difficulty:** **T-014** (Prerequisite Validation) was the most difficult due to the complexity of detecting recursive dependencies within the course structure.