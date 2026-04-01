# Sprint 1 Log

**Sprint dates:** March 20, 2026 – April 3, 2026
**Scrum Master:** Marlan
**Date written:** April 1, 2026

---

## Completed Tasks
| Task ID | Description | Assigned To | Status |
|---|---|---|---|
| T-001 | Create GitHub Repo, Branch Protection & Kanban | Marlan | ✅ Done |
| T-002 | Vite + React Project Scaffolding | Team | ✅ Done |
| T-003 | Firebase Project Initialization | Team | ✅ Done |
| T-004 | Environment Variable Setup (.env.example) | Team | ✅ Done |
| T-005 | Firestore Schema Design | Team | ✅ Done |
| T-006 | Seed Firestore with 10 Course Documents | Team | ✅ Done |
| T-007 | Wireframe: Landing Page | Team | ✅ Done |
| T-008 | Wireframe: Course Dashboard | Team | ✅ Done |
| T-009 | Wireframe: Student Profile | Team | ✅ Done |
| T-010 | Wireframe: Settings | Team | ✅ Done |
| T-011 | KM Annotations for Wireframes | Team | ✅ Done |
| T-012 | Create Sprint Log Template & Sprint 1 Log | (You) | ✅ Done |

---

## Blocked / Carried Over
| Task ID | Reason for Delay | Resolution Plan |
|---|---|---|
| None | N/A | All Sprint 1 tasks completed on schedule. |

---

## PR Summary
| PR Title | Author | Merged? |
|---|---|---|
| feat: initial repo structure and protection | Marlan | Yes |
| chore: vite-react scaffold and firebase init | Team | Yes |
| docs: wireframes and km-annotations | Team | Yes |
| docs: sprint-log-template and sprint1-log | (You) | Yes |

---

## Bugs / GitHub Issues Filed
| Issue # | Description | Filed By | Status |
|---|---|---|---|
| #1 | T-001: Initial Repo Setup | Marlan | Closed |
| #2 | Firestore connection timeout in local dev | Team | Closed |

---

## Sprint Gate Status
- [x] Vite + React scaffold runs from a clean clone (npm install && npm run dev)
- [x] Firebase project initialized and .env.example committed and shared
- [x] 10 course documents visible in Firestore with correct schema
- [x] 4 wireframes committed to /docs/wireframes/ with KM annotations
- [x] All Sprint 1 PRs merged to dev before EOD Apr 3

---

## Retrospective Notes

**What went well:**
The initial project setup was highly efficient, particularly the Firebase integration and the Firestore seeding process. Team communication regarding the wireframe annotations ensured that the design requirements were clear before moving into the next phase.

**What to improve next sprint:**
We should aim to submit Pull Requests earlier in the week to avoid a bottleneck on the final day of the sprint. Standardizing the naming conventions for our GitHub Issues early on will also help with Kanban board organization.

**What was most difficult:**
Ensuring the Firestore schema was flexible enough for future sprints while meeting the immediate requirement of 10 course documents was a challenge. Additionally, coordinating the local environment variables across the whole team required extra troubleshooting.