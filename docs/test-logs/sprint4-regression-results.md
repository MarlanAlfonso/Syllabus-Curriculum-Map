# Sprint 4 — Full Regression Test Results (Final Production Run)

**Test environment:** Production URL Verified
**Date executed:** April 24, 2026
**Executed by:** Florendo, Angel

## Results Summary
| TC # | Description | Sprint | Status |
|------|-------------|--------|--------|
| TC-001 | Add course with all fields | Sprint 2 | PASS |
| TC-002 | Add course with missing field | Sprint 2 | PASS |
| TC-003 | Edit existing course details | Sprint 2 | PASS |
| TC-004 | Add a prerequisite to a course | Sprint 2 | PASS |
| TC-005 | Attempt a circular prerequisite | Sprint 2 | PASS |
| TC-006 | Soft-disable a course | Sprint 2 | PASS |
| TC-007 | Direct DB change sync | Sprint 2 | PASS |
| TC-008 | No-hard-delete audit (grep) | Sprint 2 | PASS |
| TC-009 | Year Level filter | Sprint 2 | PASS |
| TC-010 | Duplicate courseCode check | Sprint 2 | PASS |
| TC-011 | React Flow: Node Count | Sprint 3 | PASS |
| TC-012 | React Flow: Edge Logic | Sprint 3 | PASS |
| TC-013 | Map Filter: Year Level | Sprint 3 | PASS |
| TC-014 | Map Filter: Semester | Sprint 3 | PASS |
| TC-015 | Map Filter: Skills Tag | Sprint 3 | PASS |
| TC-016 | Node Click: Detail Panel | Sprint 3 | PASS |
| TC-017 | 0 Prerequisite Logic | Sprint 3 | PASS |
| TC-018 | 3 Prerequisite Logic | Sprint 3 | PASS |
| TC-019 | Isolated Node Visuals | Sprint 3 | PASS |
| TC-020 | 768px Mobile Responsiveness | Sprint 3 | PASS |

## Failures Requiring Urgent Fix
*None. All production regression tests passed.*

## No Hard-Delete Audit
**Command:** `grep -r "deleteDoc" src/`
**Result:** No results found
**Status:** PASS