# ADR-002: React Flow for Curriculum Graph Visualization

**Date:** 2026-04-04
**Status:** Accepted
**Decided by:** Angela Militar -- UI/UX Designer

## Context
The curriculum map feature required an interactive graph visualization library capable of:

- Rendering course nodes and prerequisite edges as a navigable graph
- Supporting zoom, pan, and drag interactions
- Allowing custom node and edge rendering (e.g., showing course status, credits, or color coding)
- Integrating naturally within the existing React component tree

A decision was needed on which graph/visualization library to adopt.

## Decision
**React Flow** was selected as the graph visualization library.

## Alternatives Considered
| Option | Reason Rejected |
|--------|----------------|
| D3.js | Extremely powerful, but operates directly on the DOM — requires imperative code that conflicts with React's declarative model; significant boilerplate for zoom/pan/drag behaviors |
| Cytoscape.js | Feature-rich for graph theory use cases, but not React-native; integration requires a wrapper and manual lifecycle management |
| Vis.js | Good built-in physics layouts, but similarly not React-native and has a heavier, older API surface |

## Consequences

**Positive:** 

- React-native component model means nodes and edges are standard React components — no manual DOM manipulation or useEffect hacks to sync D3 with React state
- Built-in zoom, pan, minimap, and controls are available out of the box with minimal configuration
- Custom node types and edge types are straightforward to implement using React components, enabling rich course card UI within the graph
- Active community and well-maintained documentation reduce onboarding time

**Negative / Trade-offs:** 

- Larger bundle size compared to a purpose-built, minimal D3 implementation
- Physics-based or force-directed layouts (common in D3) require additional plugins or manual implementation in React Flow
- Less flexibility for highly custom graph algorithms or rendering pipelines that D3 would expose directly