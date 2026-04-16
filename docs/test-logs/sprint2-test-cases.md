# Sprint 2 Test Cases: Course CRUD & Audit

**Date:** April 9, 2026

**Tester:** Angel Florendo | Marlan Alfonso

**Mandatory Sign-off:** TC-006 (Soft-Disable), TC-008 (Audit Trail)

---

## TC-001: Add course with all required fields
- **Feature:** Add Course
- **Precondition:** App is running, CourseListPage is visible.

**Steps:**
1. Go to /courses
2. Click "Add Course"
3. Fill in all required fields with valid data (Course Code: CS101, Title: Introduction to Computer Science, Units: 3, Year Level: Year 1, Semester: 1st)
4. Click Save

- **Expected Result:** New course appears in the CourseListPage table. Document visible in Firestore console with isActive: true.
- **Actual Result:** Course "Introduction to Computer Science" (CS101) appeared in the table. Firestore document confirmed with isActive: true, correct fields, and createdAt timestamp.
- **Status:** PASS

---

## TC-002: Add course with a missing required field

**Feature:** Add Course
**Precondition:** App is running

**Steps:**
1. Go to /courses
2. Click "Add Course"
3. Leave Course Code blank, fill in all other fields
4. Click Save

**Expected Result:** Validation error shown, course NOT saved to Firestore.
**Actual Result:** Browser native validation tooltip appeared: "Please fill out this field." Course was not submitted or saved to Firestore.
**Status:** PASS

---
## TC-003: Edit an existing course

**Feature:** Edit Course
**Precondition:** At least one course exists in Firestore

**Steps:**
1. Go to /courses
2. Click "Edit" on the CS101 (Introduction to Computer Science) course
3. Change Course Title to "Introduction to Computer Science - Updated"
4. Click "Update Course"

**Expected Result:** Updated title appears in the CourseListPage table. Firestore document reflects the new courseTitle.
**Actual Result:** Title updated to "Introduction to Computer Science - Updated" visible in the table. Firestore confirmed courseTitle: "Introduction to Computer Science - Updated" on the same document (isActive: true preserved).
**Status:** PASS

---

## TC-004: Add a prerequisite to a course

**Feature:** Edit Course / Prerequisites
**Precondition:** A course with no prerequisites exists in Firestore

**Steps:**
1. Go to /courses
2. Click "Edit" on CS402 (Intelligent Systems), which had no prerequisites
3. Select "CS101 — Introduction to Programming" from the prerequisites list
4. Click "Update Course"

**Expected Result:** Prerequisites column for CS402 shows CS101 in the table. Firestore prerequisites array includes "CS101".
**Actual Result:** CS402 (Intelligent Systems) now shows CS101 in the Prerequisites column. Firestore confirmed update.
**Status:** PASS

---

## TC-005: Attempt to add a circular prerequisite

**Feature:** Circular Dependency Validation
**Precondition:** CS402 has CS101 as a prerequisite

**Steps:**
1. Go to /courses
2. Click "Edit" on CS101 (Introduction to Programming)
3. Select CS402 (Intelligent Systems) as a prerequisite — which already depends on CS101
4. Click "Update Course"

**Expected Result:** Circular dependency error shown, change NOT saved to Firestore.
**Actual Result:** "Update Course" button became unclickable/disabled upon selecting CS402, preventing the circular dependency from being saved.
**Status:** PASS

---

## TC-006: Soft-disable a course 🔒 MANDATORY SIGN-OFF

**Feature:** Soft Disable
**Precondition:** At least one active course exists

**Steps:**
1. Go to /courses
2. Click "Disable" on CS402 (Intelligent Systems)
3. Confirm in the dialog
4. Check the table and Firestore console

**Expected Result:** Course disappears from the table. Firestore document has isActive: false. Document still exists (not deleted).
- **Actual Result:** CS402 (Intelligent Systems) disappeared from the CourseListPage table. Firestore confirmed isActive: false on document BW3z6uoLCaKK1zwibbzN. Document still exists — not deleted.
**Status:** PASS ✅ MANDATORY SIGN-OFF CLEARED

---

## TC-007: Verify disabled course is hidden from the list

**Feature:** Course List Filtering by isActive
**Precondition:** At least one course exists in Firestore

**Steps:**
1. In Firestore console, manually set isActive: false on an active course document
2. Go to /courses and refresh the page

**Expected Result:** The manually disabled course does NOT appear in the table.
**Actual Result:** Course with isActive: false did not appear in the CourseListPage table after refresh.
**Status:** PASS

---

## TC-008: No-hard-delete audit (MANDATORY)
**Feature:** Audit Security
**Precondition:** Course exists.
**Steps:**
1. Attempt to find a "Delete" button.
2. Search codebase for `deleteDoc` Firebase function.
**Expected Result:** No "Delete" button in UI. Zero instances of `deleteDoc` used for course records in code.
**Actual Result:** Confirmed no Delete option in `CourseListPage`. Grep search of `/src` returned 0 results for `deleteDoc` on course collections.
**Status:** PASS ✅

---

## TC-009: Filter CourseListPage by year level

**Feature:** Year Level Filter
**Precondition:** App is running with multiple courses of different year levels

**Steps:**
1. Go to /courses
2. Look for a Year Level filter on the page

**Expected Result:** If filter exists, only courses matching selected year level appear.
**Actual Result:** No year level filter found on the CourseListPage.
**Status:** DEFERRED — Feature not yet implemented, moved to Sprint 3

---

## TC-010: Add course with duplicate courseCode

**Feature:** Duplicate Course Code Validation
**Precondition:** CS101 already exists in Firestore

**Steps:**
1. Go to /courses
2. Click "Add New Course"
3. Enter CS101 as the Course Code (already exists)
4. Fill in all other fields with valid data
5. Click "Add Course"

**Expected Result:** Duplicate code error shown, no second document created in Firestore.
**Actual Result:** Course was saved successfully with duplicate code CS101 — no validation error shown, second document created in Firestore.
**Status:** FAIL ❌ — GitHub Issue required