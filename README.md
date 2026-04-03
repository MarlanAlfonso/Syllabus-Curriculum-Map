# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Syllabus & Curriculum Map — Knowledge Mapping System

A web application that visualizes how courses connect across a program —
showing prerequisites, skills learned, and knowledge flow from foundational to advanced courses.

Built for Professional Elective 2 | New Era University — College of Computer Studies | AY 2025–2026

---

## KM Framework
This system applies the **Knowledge Mapping** framework: courses are knowledge nodes,
prerequisite links are knowledge edges, and the directed graph reveals the knowledge flow
and gaps across the curriculum.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Visualization | React Flow |
| Database | Firebase Firestore (Spark free tier) |
| Hosting | Firebase Hosting (free tier) |
| Version Control | Git + GitHub |

---

## Team
| Name | Role |
|---|---|
| Alfonso, Marlan | Scrum Master + KM Analyst |
| Hernandez, Janice | Full Stack Developer |
| Militar, Angela | UI/UX Designer |
| Florendo, Angel | QA & Documentation Lead |

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher installed (`node -v` to check)
- Git installed (`git --version` to check)
- Access to the Firebase project (ask Alfonso for the Editor invite)

### Steps
1. Clone the repo:
   git clone https://github.com/[username]/scm-knowledge-mapping.git
2. Move into the project folder:
   cd scm-knowledge-mapping
3. Install dependencies:
   npm install
4. Set up your environment file:
   - Copy `.env.example` to `.env`
   - Fill in the Firebase values (ask Alfonso for the real values)
5. Start the development server:
   npm run dev
6. Open your browser: http://localhost:5173

---

## Repo Structure
| Folder/File | Purpose |
|---|---|
| `src/` | All React source code |
| `src/pages/` | Page-level components (one per route) |
| `src/components/` | Reusable UI components |
| `src/lib/` | Firebase client and utility files |
| `src/services/` | Firestore service functions (Sprint 2+) |
| `docs/` | All project documentation |
| `docs/wireframes/` | Screen wireframes with KM annotations |
| `docs/sprint-logs/` | Sprint logs for all 4 sprints |
| `scripts/` | One-time scripts (e.g., Firestore seed) |
| `.env.example` | Template for environment variables |

---

## Branching Strategy
- `main` — production only; no direct pushes
- `dev` — integration branch; all PRs merge here first
- `feature/*` — new features (branch from dev)
- `fix/*` — bug fixes
- `docs/*` — documentation
- `test/*` — test files only
- `chore/*` — config, tooling, deployment

Workflow: feature branch → PR → dev → release PR → main
All PRs require at least 1 reviewer approval before merging.
🔒 Never push directly to main or dev.
