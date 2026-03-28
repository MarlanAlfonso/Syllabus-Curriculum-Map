# Syllabus-Curriculum-Map
Professional Elective 2 (Knowledge Management) final group project. About Knowledge Mapping System.

## Branching Strategy
- main       → production only; no direct pushes
- dev        → integration branch; all PRs merge here first
- feature/*  → new features (branch from dev)
- fix/*      → bug fixes (branch from dev)
- docs/*     → documentation updates
- test/*     → test files only
- chore/*    → config, tooling, deployment

Workflow: feature branch → PR → dev → release PR → main
All PRs require at least 1 reviewer approval before merging.
Never push directly to main or dev.