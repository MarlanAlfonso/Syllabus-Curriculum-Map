# ADR-001: Firebase Firestore as Backend Database

**Date:** 2026-03-27
**Status:** Accepted
**Decided by:** Marlan Alfonso -- Scrum Master + Knowledge Management Analyst

## Context
The project required a backend database and hosting solution with the following constraints:
- No credit card required (must work on a free tier)
- Real-time data capability for live curriculum map updates
- Easy integration with a JavaScript/React frontend
- Minimal backend infrastructure to manage

A decision was needed between available BaaS (Backend-as-a-Service) platforms that could satisfy these requirements without incurring cost.

## Decision
**Firebase Firestore (Spark plan)** was selected as the backend database.

## Alternatives Considered
| Option | Reason Rejected |
|--------|----------------|
| Supabase (PostgreSQL-based) | Also has a free tier, but requires more relational schema design; document model in Firestore fits the nested course/prerequisite data structure more naturally |
| PlanetScale | MySQL-compatible serverless DB, but requires separate hosting solution; no built-in real-time support |
|Plain JSON files |No real-time capability, no multi-user support, not scalable beyond local dev |

## Consequences

**Positive:** 
- Free hosting and database on a single platform (Spark plan) — no credit card required
- Firestore's document model maps cleanly onto the course data structure (each course as a document with prerequisite references)
- Official JavaScript SDK (firebase/firestore) is well-documented and integrates seamlessly with React
- Real-time listeners (onSnapshot) enable live updates to the curriculum map without polling
- Single firebase.json config covers both Firestore and Hosting

**Negative / Trade-offs:** 
- Cloud Functions are not available on the Spark plan — any server-side logic must be handled client-side or deferred to a paid tier
- Firestore does not support full-text search natively; a third-party solution (e.g., Algolia) would be required for search features
- Vendor lock-in to Google's Firebase ecosystem makes future migration more involved