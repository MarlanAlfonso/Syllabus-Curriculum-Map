# Sprint 4 Log — Final Wrap-up & Production Deployment

**Period:** April 13, 2026 – April 26, 2026  
**Status:** ✅ COMPLETED  
**Team:** Alfonso (SM), Hernandez (Dev), Militar (UI/UX), Florendo (QA)

## 1. Completed Tasks (T-036 to T-047)
| ID | Task Description | Status |
|----|------------------|--------|
| T-036 | Finalize Course Service Logic & CRUD Polish | Completed |
| T-037 | Complete KM Conceptual Report Sections 3–6 | Completed |
| T-038 | Refine Map Filter Sidebar & Visual Indicators | Completed |
| T-039 | Configure Firebase Hosting & Deploy to Production | Completed |
| T-040 | Update Firestore Security Rules for Production | Completed |
| T-041 | Write 4+ Architecture Decision Records (ADRs) | Completed |
| T-042 | Consolidate Documentation into /docs/ Folder | Completed |
| T-043 | Final UI Polish & Mobile Responsiveness | Completed |
| T-044 | Conduct Usability Walkthrough & Screenshots | Completed |
| T-045 | Run Full 20-Case Regression Test on Production | Completed |
| T-046 | Write Failure Analysis Report & Finalize Wiki | Completed |
| T-047 | Final Participation Audit & Project Closure | Completed |

## 2. Blocked / Carried Over
* **T-043, T-044, T-045:** These tasks were successfully completed but experienced a 48-hour delay (blocked) while waiting for the stability of the production environment (T-039).
* **T-046:** Execution was blocked until the final regression data (T-045) was available to ensure the Failure Analysis was based on real production results.

## 3. PR Summary (Sprint 4)
* **#95:** Configure Firebase Hosting and deploy production build
* **#96:** Update Firestore security rules for production
* **#98:** Add 4 Architecture Decision Records in /docs/adr/
* **#99:** Final code cleanup and removal of dead code
* **#100:** Execute full 20-case regression on production URL
* **#101:** Mobile responsive fixes and loading states
* **#102:** Final Failure Analysis Report
* **#103:** Usability walkthrough notes and production screenshots

## 4. Final Gate Status
* **Production URL:** [Insert Live URL Here] — Accessible and verified.
* **Regression Testing:** All 20 Test Cases (TC-001 to TC-020) passed on the live build.
* **Security Audit:** Zero instances of `deleteDoc()` found in the codebase; soft-delete integrity confirmed.
* **KM Deliverable:** Conceptual Report finalized in `/docs/`.
* **Design Rationale:** UI/UX documentation finalized in `/docs/`.
* **Failure Analysis:** Report documenting 5+ major/critical bugs finalized in `/docs/`.
* **ADR History:** 4+ entries recorded in `/docs/adr/` documenting major tech stack choices.
* **GitHub Wiki:** User Manual and Contribution Log pages are public and complete.
* **Participation:** All 4 members met the 3+ Commits and 3+ PRs academic requirement.

## 5. Retrospective Notes

### What went well across the whole project?
The modular approach to the **graphDataBuilder** utility allowed the team to separate data logic from visualization. This made the transition from Sprint 2 (Table View) to Sprint 3 (Graph View) much smoother than anticipated. Additionally, early adoption of a Soft-Delete strategy prevented data loss during testing.

### What would we do differently?
If starting over, we would implement **TypeScript** from Sprint 1. Many minor bugs discovered in Sprint 3 were related to data types (Strings vs Numbers) that TypeScript would have flagged immediately during development. We would also set up a **CI/CD pipeline** earlier to avoid deployment bottlenecks in the final week.

### What was the hardest part?
* **Technical:** Managing the complex state of the React Flow canvas, especially ensuring that edges (arrows) rendered correctly across different browser engines in the production build.
* **Team:** Coordinating the massive documentation push in Sprint 4. Balancing the technical deployment with the academic writing requirements was the most significant time-management challenge.

---
**Final Approval:**
*Alfonso, Marlan — Scrum Master* *April 26, 2026*