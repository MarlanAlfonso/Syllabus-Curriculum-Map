# ADR-004: Soft-Disable Pattern for Course Removal

**Date:** 2026-03-27
**Status:** Accepted
**Decided by:** Marlan Alfonso -- Scrum Master + Knowledge Management Analyst

## Context
The curriculum map allows courses to be removed from the active view. However, courses in Firestore are referenced by other course documents as prerequisites (via document ID). This creates a referential integrity problem:
 
> If a course document is hard-deleted and another course still lists it as a prerequisite, that edge becomes a broken reference — the graph renders a dangling pointer with no resolvable node.
 
A decision was needed on how to handle course removal in a way that preserves graph integrity.

## Decision
**Soft-disable via `isActive: false`** — course documents are never deleted using `deleteDoc()`. Instead, a boolean field `isActive` is set to `false` to hide the course from the active curriculum map while retaining the document in Firestore.
 
## Alternatives Considered
| Option | Reason Rejected |
|--------|----------------|
| Hard delete (`deleteDoc()`) | Destroys the document permanently — any course that references the deleted course as a prerequisite will have a broken edge with no recoverable data |
| Archive to a separate Firestore collection | Preserves data but requires updating all prerequisite references in other documents to point to the new collection path; adds complexity with no clear benefit over `isActive` |
| Versioning with timestamps | Useful for audit trails but overkill for this use case; adds schema complexity and complicates queries without solving the broken-reference problem more cleanly than soft-disable |
 
## Consequences
**Positive:**
- Prerequisite link integrity is fully preserved — course documents remain in place, so edges in the graph always resolve to a valid document
- UI filtering is simple: all active queries include `.where("isActive", "==", true)` to exclude disabled courses from the map
- Disabled courses can be re-enabled at any time by toggling `isActive` back to `true` — no data recovery needed
- Historical prerequisite chains remain queryable for reporting or debugging purposes
**Negative / Trade-offs:**
- Firestore storage grows monotonically over time as courses are disabled but never purged; a periodic cleanup job would require upgrading to the Blaze plan for Cloud Functions
- Every collection query **must** include the `isActive: true` filter — forgetting this in a new query will silently surface disabled courses in the UI
- Composite indexes may be needed in Firestore when combining `isActive` with other query fields (e.g., `department`, `semester`), adding minor configuration overhead