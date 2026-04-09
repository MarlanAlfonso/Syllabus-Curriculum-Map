# Sprint 2 Log
## Completed Tasks
| Task ID | Description | Assigned To | Status |
|---|---|---|---|
| T-016 | Build CourseListPage | Janice | ✅ Done |
| T-017 | Build Add/Edit Course Modals | Janice | ✅ Done |
| T-018 | Build Soft-Disable Dialogs | Janice | ✅ Done |
| T-023 | Execute Sprint 2 Test Cases | Angel | ✅ Done |

---

## Blocked / Carried Over
| Task ID | Reason for Delay | Resolution Plan |
|---|---|---|
| TC-009 | UI Filter component not prioritized | Moved to Sprint 3 Backlog |

---

## PR Summary
| PR Title | Author | Merged? |
|---|---|---|
| feat: course list and crud modals | @Janice | Yes |
| test: sprint 2 execution results | @Angel | Yes |

---

## Sprint Gate Status
- [x] CRUD operations fully functional (Except Duplicate Check)
- [x] Mandatory Sign-off: Soft-disable (TC-006) Verified
- [x] Mandatory Sign-off: No hard-delete (TC-008) Verified
- [x] All Sprint 2 PRs merged to dev

---

## Retrospective Notes

**What went well:**
The team successfully implemented a complex CRUD system with Firebase integration. The soft-disable logic was built robustly, meeting the primary security gate for the audit trail.

**What to improve next sprint:**
We need to implement backend-level validation for duplicate keys earlier to prevent data corruption during testing. 

**What was most difficult:**
Handling the circular dependency logic for prerequisites required several refactors to ensure the UI didn't crash during edge cases.