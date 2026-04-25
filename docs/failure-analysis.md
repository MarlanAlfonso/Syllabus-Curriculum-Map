# Failure Analysis Report

## Bug #1: Hard Delete Violation (Audit Failure)
**Test Case:** TC-005  
**Sprint Discovered:** Sprint 2  
**Severity:** Critical

### Steps to Reproduce
1. Go to Course List.
2. Click "Delete" button on a course row.
3. Check Firestore console.

### Expected Result
Course should remain in Firestore with `isActive: false` (Soft Delete).

### Actual Result
The `deleteDoc()` function was called, removing the record permanently from the database.

### Root Cause
The developer used the standard Firebase `deleteDoc` method instead of an `updateDoc` call to toggle the `isActive` boolean.

### Fix Applied
Refactored the delete handler to use `updateDoc(docRef, { isActive: false })`.

---

## Bug #2: Graph Filter Logic Mismatch
**Test Case:** TC-014  
**Sprint Discovered:** Sprint 3  
**Severity:** Major

### Steps to Reproduce
1. Go to /map.
2. Select "Year 2" in the filter sidebar.

### Expected Result
Canvas should show only Year 2 courses.

### Actual Result
The canvas became entirely blank even though Year 2 data existed.

### Root Cause
The `graphDataBuilder.js` was comparing a String "2" from the UI to a Number `2` in Firestore using strict equality (`===`).

### Fix Applied
Added `parseInt()` to the filter value before comparison to ensure type matching.

---

## Bug #3: Visual Overlap on Tablet View
**Test Case:** TC-020  
**Sprint Discovered:** Sprint 3  
**Severity:** Minor

### Steps to Reproduce
1. Open DevTools and set width to 768px.
2. Open the Course Detail Panel.

### Expected Result
Panel should slide over or compress, keeping the filter sidebar accessible.

### Actual Result
The Detail Panel covered the filter toggle buttons, making them unclickable.

### Root Cause
CSS z-index values were not properly layered for the sidebar and the detail drawer.

### Fix Applied
Adjusted z-index hierarchy and added a media query to reduce panel width on screens < 1024px.

---

## Bug #4: Duplicate Skill Tags
**Test Case:** TC-008  
**Sprint Discovered:** Sprint 4  
**Severity:** Minor

### Steps to Reproduce
1. Edit a course.
2. Type a skill that already exists (e.g., "React").
3. Press Enter.

### Expected Result
The system should prevent duplicate tags in the array.

### Actual Result
The same skill was added multiple times to the `skillsLearned` array.

### Root Cause
The input handler lacked a check for existing values in the local state array.

### Fix Applied
Updated the `handleAddSkill` function to check `if (!skills.includes(newSkill))`.

---

## Bug #5: Broken Edge Rendering (Production Regression)
**Test Case:** TC-012  
**Sprint Discovered:** Sprint 4 (Production)  
**Severity:** Major

### Steps to Reproduce
1. Deploy to Production URL.
2. View Map.

### Expected Result
Edges (arrows) should connect prerequisites.

### Actual Result
Nodes appeared, but no lines (edges) were visible on the production build.

### Root Cause
The React Flow edge styles were being purged by Tailwind CSS during the production build process (Tree Shaking).

### Fix Applied
Added the React Flow classes to the Tailwind `safelist` in `tailwind.config.js`.

---
## Lesson Learned
Moving forward, we will implement stricter "Type Checking" (TypeScript) to prevent logic errors like Bug #2 and use a "Soft Delete" utility wrapper to prevent accidental data loss like Bug #1.