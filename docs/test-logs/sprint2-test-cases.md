# Sprint 2 Test Cases: Course CRUD & Audit

**Date:** April 9, 2026
**Tester:** Angel Florendo
**Mandatory Sign-off:** TC-006 (Soft-Disable), TC-008 (Audit Trail)

---

## TC-001: Add course with all required fields
**Feature:** Add Course
**Precondition:** App is running, CourseListPage is visible.
**Steps:**
1. Go to /courses
2. Click "Add Course"
3. Fill in code, title, and description.
4. Click Save.
**Expected Result:** Course appears in table; Firestore doc has `isActive: true`.
**Actual Result:** Course "CS101" appeared immediately; verified `isActive: true` in Firebase console.
**Status:** PASS

## TC-002: Add course with missing required fields
**Status:** PASS (Form showed validation errors; Save button remained disabled)

## TC-003: Edit existing course details
**Status:** PASS (Changes reflected in UI and Firestore immediately)

## TC-004: Prerequisite validation (Circular Reference)
**Status:** PASS (System blocked adding a course as its own prerequisite)

## TC-005: Prerequisite validation (Valid chain)
**Status:** PASS (Prerequisites saved and displayed correctly)

## TC-006: Soft-disable behavior (MANDATORY)
**Feature:** Soft-Disable
**Precondition:** Course exists and is currently active.
**Steps:**
1. Locate course in list.
2. Click "Disable" icon.
3. Confirm in `SoftDisableConfirmDialog`.
**Expected Result:** Course remains in Firestore but `isActive` changes to `false`. UI shows "Inactive" badge.
**Actual Result:** UI updated to "Inactive". Firestore document was NOT deleted; `isActive` field successfully toggled to `false`.
**Status:** PASS ✅

## TC-007: Reactivate soft-disabled course
**Status:** PASS (isActive toggled back to true; badge updated)

## TC-008: No-hard-delete audit (MANDATORY)
**Feature:** Audit Security
**Precondition:** Course exists.
**Steps:**
1. Attempt to find a "Delete" button.
2. Search codebase for `deleteDoc` Firebase function.
**Expected Result:** No "Delete" button in UI. Zero instances of `deleteDoc` used for course records in code.
**Actual Result:** Confirmed no Delete option in `CourseListPage`. Grep search of `/src` returned 0 results for `deleteDoc` on course collections.
**Status:** PASS ✅

## TC-009: Course search/filter functionality
**Status:** PASS (List filtered correctly by Course Code)

## TC-010: Firestore state persistence on refresh
**Status:** PASS (Data remains consistent after browser refresh)