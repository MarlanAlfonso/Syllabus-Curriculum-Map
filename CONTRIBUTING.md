# Contributing to SCM Knowledge Map

## How to Set Up Locally
Follow the setup steps in README.md exactly.
If `npm run dev` fails after following the README, create a GitHub Issue before asking in the GC.

## Branch Naming Convention
| Prefix | When to Use | Example |
|---|---|---|
| `feat/` | New feature | `feat/course-list-page` |
| `fix/` | Bug fix | `fix/prerequisite-circular-check` |
| `docs/` | Documentation | `docs/sprint2-log` |
| `test/` | Test files only | `test/sprint2-crud-tests` |
| `chore/` | Config, tooling, deployment | `chore/firebase-hosting-deploy` |

## Commit Message Standards
- Use imperative mood, present tense
- Format: `type: short description` (under 72 characters)
- Examples:
  - ✅ `feat: add CourseListPage with Firestore integration`
  - ✅ `fix: prevent circular prerequisite from being saved`
  - ❌ `Added the course list` (past tense, no type prefix)

## Pull Request Process
1. Branch from `dev` — never from `main`
2. Push your branch and open a PR into `dev`
3. Fill in the PR description: What changed, Why it was needed, How to test it
4. Tag at least 1 teammate as reviewer
5. Do not merge your own PR — wait for approval
6. After merge, delete your branch from GitHub

## Code Review Checklist
Reviewers must verify before approving:
- [ ] Branch was created from `dev`, not `main`
- [ ] No `.env` or Firebase secrets committed
- [ ] No `console.log` statements in production code
- [ ] No `deleteDoc()` call on the `courses` collection anywhere in changed files
- [ ] All Vitest tests pass (`npm run test:run`)
- [ ] PR title follows naming convention

## Hard Rules
🔒 Never call `deleteDoc()` on the `courses` Firestore collection. All removals set `isActive = false`.
🔒 Never merge directly into `main`. Always go through a PR and reviewer approval.
🔒 Never commit `.env` — only `.env.example` goes to GitHub.