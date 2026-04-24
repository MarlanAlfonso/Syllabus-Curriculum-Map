# ADR-003: Firebase Hosting for Static Site Deployment

**Date:** 2026-03-27
**Status:** Accepted
**Decided by:** Marlan Alfonso -- Scrum Master + Knowledge Management Analyst

## Context
The Vite + React application needed a free static hosting solution for production deployment. Requirements:

- Free tier with no credit card
- Support for single-page application (SPA) routing (redirect all paths to index.html)
- Compatible with the existing Firebase project setup
- Minimal additional configuration overhead

## Decision
**Firebase Hosting** was selected as the deployment platform.

## Alternatives Considered
| Option | Reason Rejected |
|--------|----------------|
| Vercel | Excellent platform with superior CI/CD GitHub integration, but introduces a second platform account and separate configuration alongside the existing Firebase project |
| Netlify |Similar to Vercel — strong CI/CD and preview deployments, but again adds a separate platform with its own config (```netlify.toml```) separate from ```firebase.json``` |
| GitHub Pages | Free and tightly integrated with the repo, but requires workarounds for SPA client-side routing and does not support custom rewrites easily |

## Consequences

**Positive:** 

- Everything lives on one platform — Firestore, Authentication (if added later), and Hosting are all managed under a single Firebase project and ```firebase.json```
- No additional account or dashboard to manage
- SPA rewrite rules (```"rewrites": [{ "source": "**", "destination": "/index.html" }]```) are simple to configure in ```firebase.json```
- ```firebase deploy --only hosting``` gives a fast, predictable deploy command

**Negative / Trade-offs:** 

- Vercel offers automatic GitHub-triggered deployments and per-PR preview URLs out of the box — Firebase Hosting requires a manual ```firebase deploy``` or custom CI/CD pipeline setup to match this
- Firebase Hosting's CDN and edge network is less globally distributed compared to Vercel's edge network
- Build step (```vite build```) must be run locally or in CI before deploying; there is no built-in build integration like Vercel provides