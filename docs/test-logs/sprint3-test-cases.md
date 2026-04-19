# Sprint 3 Log & Test Cases

**Sprint dates:** April 11 – April 17, 2026
**Scrum Master:** Marlan Alfonso
**QA Lead:** Angel Florendo
**Date written:** April 17, 2026
**Working Branch:** `test/sprint3-map-tests`

---

## 1. Completed Tasks (Sprint 3)
| Task ID | Description | Assigned To | Status |
|---|---|---|---|
| T-025 | Finalize graphDataBuilder.js with filter functions | Alfonso, Marlan | ✅ Done |
| T-026 | Flag isolated nodes (no prereqs/dependents) | Alfonso, Marlan | ✅ Done |
| T-028 | Install React Flow & Rebuild Map Canvas | Hernandez, Janice | ✅ Done |
| T-029 | Add Map Controls & Filter Wiring | Hernandez, Janice | ✅ Done |
| T-030 | Wire node click event to detail panel | Hernandez, Janice | ✅ Done |
| T-031 | Design Custom Node & Build Detail Panel | Militar, Angela | ✅ Done |
| T-032 | Style Filter Sidebar & Isolated Node Indicators | Militar, Angela | ✅ Done |

---

## 2. Sprint 3 Test Execution (TC-011 to TC-020)
| TC # | Feature Area | Expected Result | Status |
|---|---|---|---|
| **TC-011** | React Flow Render | Nodes and prerequisite edges render correctly via `graphDataBuilder`. | PENDING |
| **TC-012** | Custom Node UI | Angela's custom nodes show code/title + Year Level color coding. | PENDING |
| **TC-013** | Canvas Controls | Zoom, Pan, and Fit-to-View controls function smoothly. | PENDING |
| **TC-014** | Logic: Filters | Map re-renders correctly when filtering by Dept, Year, or Skill. | PENDING |
| **TC-015** | Logic: Isolated | Isolated nodes (T-026) are visually flagged/distinguished. | PENDING |
| **TC-016** | Event: Node Click | Clicking a node opens the Detail Panel with correct course info. | PENDING |
| **TC-017** | Data: Soft-Delete | **AUDIT:** Ensure `isActive=false` courses do NOT appear on map. | PENDING |
| **TC-018** | Data: Persistence | Edges update instantly if a prerequisite is changed in a course doc. | PENDING |
| **TC-019** | Performance | Map handles the 10+ seeded courses without lag during zoom/pan. | PENDING |
| **TC-020** | Responsive | Filter sidebar collapses and map remains interactable on mobile. | PENDING |

---

## 3. PR & Issue Summary
| PR Title / Issue # | Author | Status | Notes |
|---|---|---|---|
| feat(map): React Flow Integration #58 | Janice | Merged | Covers T-028, T-029 |
| feat(ui): Custom Nodes & Sidebar #61 | Angela | Merged | Covers T-031, T-032 |
| fix(logic): Filter & Isolated Nodes #65 | Marlan | Merged | Covers T-025, T-026 |

---

## 4. Sprint Gate Status (Sprint 3)
- [ ] **TC-011 to TC-020 Passed:** All 10 Sprint 3 cases verified.
- [ ] **Hard Rule Audit:** Verified no `deleteDoc()` calls exist in the codebase.
- [ ] **KM Rationale:** Design Rationale (T-033) reflects KM framework goals.
- [ ] **Documentation:** README updated with screenshots (T-035).

---

## 5. Retrospective Notes

**What went well:**
The collaboration between Janice (logic) and Angela (UI) on the custom node injection was seamless.

**What to improve next sprint:**
Finalize the KM Conceptual Report earlier to avoid a documentation bottleneck at the end of Sprint 4.

**What was most difficult:**
Ensuring that React Flow edges didn't "tangle" when multiple filters were applied simultaneously.