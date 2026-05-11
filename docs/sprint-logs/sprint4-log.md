# Sprint 4 Log — Final Wrap-up & Production Deployment

**Period:** April 13, 2026 – April 26, 2026  
**Status:** ✅ COMPLETED  
**Team:** Alfonso (SM), Hernandez (Dev), Militar (UI/UX), Florendo (QA)

## 1. Completed Tasks (Sprint 4)
| ID | Task Description | Status |
|:---|:---|:---|
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
* **Infrastructure Dependency:** T-043 (UI Polish), T-044 (Walkthrough), and T-045 (Regression) were blocked until T-039 (Firebase Deployment) was completed to ensure all testing occurred on the live production URL.
* **Sequential Documentation:** T-046 (Failure Analysis) was blocked pending the results of T-045, as regression failures provided the primary data for the analysis.

## 3. PR Summary (Sprint 4)
* **#95:** Configure Firebase Hosting and deploy production build
* **#96:** Update Firestore security rules for production
* **#97:** Complete KM Conceptual Report (Sections 1–6)
* **#98:** Add 4 Architecture Decision Records in /docs/adr/
* **#99:** Final code cleanup (remove console.logs, unused imports)
* **#100:** Execute full 20-case regression on production URL
* **#101:** Mobile responsiveness fixes and loading states
* **#102:** Final Failure Analysis Report
* **#103:** Usability walkthrough notes and production screenshots

## 4. Bugs / Issues Closed (T-047 Cleanup)
| Issue | Note | Resolution |
|:---|:---|:---|
| #90 (T-043) | UI/UX inconsistencies on mobile | Fixed via Tailwind responsive breakpoints in PR #101 |
| #88 (T-041) | Documentation gap for tech stack choices | Resolved with ADRs added to /docs/adr/ |
| #52 (TC-009) | Year level filter not updating map nodes | Logic corrected in graphDataBuilder.js |
| #XX (Security) | Potential for accidental data deletion | Audit confirmed no `deleteDoc()` calls; implemented Soft-Delete |

## 5. Final Gate Status
* **[PASS] Live URL:** Firebase Hosting is active, SSL secured, and accessible.
* **[PASS] QA Regression:** All 20 Test Cases (TC-001 to TC-020) verified PASS on production build.
* **[PASS] Code Integrity:** No `deleteDoc()` found on courses collection (Soft-delete only).
* **[PASS] Deliverables:** KM Report, Design Rationale, and Failure Analysis committed to `/docs/`.
* **[PASS] ADRs:** 4+ Architecture Decision Records documented in `/docs/adr/`.
* **[PASS] Wiki:** User Manual and Contribution Log finalized on GitHub Wiki.
* **[PASS] Readiness:** Presentation slides committed; 4 members meet 3+ commits/PRs requirement.

## 6. Retrospective Notes

### What went well across the whole project?
The team successfully implemented a complex interactive curriculum map using React Flow and Firebase. The decision to prioritize a **Soft-Delete** strategy early on ensured data integrity throughout the testing phases. The use of a centralized **graphDataBuilder** utility allowed for seamless filtering without re-fetching data from Firestore.

### What would we do differently?
If starting over, we would implement **TypeScript** from the beginning. Many Sprint 3 logic errors regarding prerequisite IDs would have been caught during development rather than testing. Additionally, we would set up an automated **CI/CD pipeline** in Sprint 1 to avoid the deployment bottlenecks encountered in the final week.

### What was the hardest part?
* **Technical:** Synchronizing the state of the React Flow canvas with complex sidebar filters (Year, Semester, and Skills) while maintaining high performance.
* **Team:** Coordinating the massive documentation push required for the M-12 Final Review. Balancing the technical deployment with academic report-writing was a significant time-management challenge.

---
**Final Approval:** *Alfonso, Marlan — Scrum Master*