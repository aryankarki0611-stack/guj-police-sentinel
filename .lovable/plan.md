# SENTINEL Six-Capability Frontend Update

## Goal
Refine the existing prototype around one connected product story: federate existing CCTV/VMS sources, reconstruct vehicle journeys, validate route plausibility, explain watchlist alerts, and preserve officer-confirmed evidence with verifiable integrity.

## User experience

### 1. Navigation and Command Center
- Update the sidebar order and labels to include **Integration Center** and **Journey Validation** while preserving every existing destination.
- Replace the Command Center summary with six operational measures: cameras online, active alerts, vehicles tracked, integration sources, journey anomalies, and evidence preserved.
- Keep the Gujarat camera network map, then organize the supporting rail into **Live Alerts**, **Journey Validation**, and **Evidence Integrity** summaries with direct links into each workflow.
- Add a compact six-capability strip so the complete SENTINEL story is visible without turning the page into marketing content.

### 2. Integration Center
- Add a dedicated `/integration-center` page showing four connected government source groups, 50 cameras, six VMS sources, protocols, and onboarding status.
- Visualize the federation flow from government cameras through adapters and the SENTINEL VMS federation layer into unified detections, investigations, alerts, GIS, and evidence.
- Add a camera onboarding table with camera ID, department, location, VMS source, protocol, and connection state.
- Add a system overview showing incremental expansion from 50 to 500 to 5,000 cameras, clearly described as an architecture direction rather than a measured capacity claim.

### 3. Journey reconstruction and validation
- Preserve the existing Investigation and Vehicle Search screens, strengthening the synchronized timeline, map route, camera detection details, and **View Frame** actions.
- Add a dedicated `/journey-validation` page with a route graph, journey-consistency summary, and transition cards for distance, expected minimum time, observed time, and status.
- Include both plausible and physically implausible transitions, with possible OCR/association/timestamp causes and a **Review Anomaly** action.
- Clearly state that anomaly flags require human review and do not prove a detection false.

### 4. Watchlist alerts and officer decisions
- Strengthen alert cards so the explanation distinguishes the AI-detected plate read, registered source validation, journey plausibility result, and officer review state.
- Keep Open, Verified, and Dismissed states and existing actions, while adding a direct route from an alert to journey validation.
- Use precise language throughout: AI-detected, watchlist match, flagged for review, officer confirmed, and physically implausible transition.

### 5. Evidence integrity and audit chain
- Add a visible evidence workflow from detection through officer confirmation, preservation, SHA-256 calculation, storage, report generation, and later verification.
- Expand evidence metadata to explicitly show evidence ID, case ID, source camera, capture time, original file hash, model/version/confidence, confirmer, confirmation time, and status.
- Preserve the existing integrity success and simulated failure states, framed only as evidence-integrity and chain-of-custody support.
- Add a visual three-entry audit chain where every previous hash connects to the prior entry hash, alongside the existing expandable table and full-chain verification/failure simulation.

### 6. One continuous investigation flow
- Add contextual links across the existing screens for: camera source → detection → vehicle journey → journey validation → alert review → case → evidence preservation → integrity verification → audit trail.
- Reuse current pages, mock services, cards, map, and status components; no backend, authentication, database, AI model, or live CCTV integration will be added.

## Technical implementation
- Extend `src/data/mock.ts` with typed integration sources, protocols, transition validation records, and architecture-stage data; keep all demo records out of UI logic.
- Add frontend-only integration and journey-validation services matching the existing API-ready service pattern.
- Add focused reusable components for the federation flow, transition graph/status, evidence workflow, and audit hash-chain visualization.
- Create the two new TanStack routes and update the sidebar and cross-page links in the same change.
- Ensure every content route touched or added includes unique title, description, Open Graph metadata, `og:type`, and `twitter:card`.
- Preserve the current semantic color tokens, compact command-center styling, responsive behavior, and accessibility conventions.

## Validation
- Run the project typecheck and targeted lint checks.
- Exercise the complete demo flow in the browser on desktop and the current compact viewport, verifying navigation, search results, maps, alert explanations, anomaly review, evidence verification, audit-chain success/failure, and no overlapping content.
