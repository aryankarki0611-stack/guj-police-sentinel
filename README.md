# Sentinel Hub

Build the first frontend MVP for a Gujarat Police CCTV Intelligence and Investigation platform called **SENTINEL**.

This is a hackathon prototype for the Gujarat Police Innovation Hackathon 2026.

IMPORTANT:

* Build ONLY the frontend/UI in this first version.

* Do NOT build a backend, database, authentication system, AI model, or real CCTV integration yet.

* Use realistic mock data so every screen is functional and easy to demonstrate.

* Structure the frontend so it can later connect cleanly to a FastAPI backend and PostgreSQL/PostGIS database through REST APIs.

* Do not hardcode fake AI responses into the UI logic. Keep mock data in separate files/services so it can later be replaced with API calls.

* Make the application look like a serious professional police command-and-investigation platform, NOT a generic AI dashboard.

## TECH STACK

Use:

* React

* TypeScript

* Tailwind CSS

* shadcn/ui where useful

* Leaflet or another suitable map library

* Lucide icons

* Responsive desktop-first design

Use a dark professional command-center interface with high readability.

Avoid:

* excessive gradients

* flashy animations

* unnecessary glassmorphism

* huge cards

* cartoon-like graphics

* unnecessary chatbot styling

The UI should look suitable for a government/law-enforcement technology demonstration.

---

# APPLICATION NAME

SENTINEL

Subtitle:

"Unified CCTV Intelligence & Investigation Platform"

Header should show:

SENTINEL

Gujarat Police Innovation Hackathon 2026

---

# MAIN NAVIGATION

Create a left sidebar with:

1. Command Center

2. Live Cameras

3. Investigation

4. Vehicle Search

5. Alerts

6. Cases

7. Evidence

8. Audit Trail

9. System Status

At the bottom show:

System Status: Operational

Cameras Online: 47/50

Last Updated: live-style timestamp

---

# 1. COMMAND CENTER

This is the main landing page.

Layout:

Top:

* Total Cameras

* Online Cameras

* Active Alerts

* Active Investigations

* Evidence Preserved

Main area:

Large Gujarat map.

Show camera markers across different Gujarat locations such as:

* Ahmedabad

* Gandhinagar

* Mehsana

* Palanpur

* Vadodara

* Surat

* Valsad

* Dahod

* Somnath

* Jamnagar

* Dwarka

Use different marker states:

* Green = online

* Gray = offline

* Red = alert

* Yellow = attention

Clicking a camera marker should open a small camera information panel containing:

* Camera ID

* Location

* Department

* VMS source

* Status

* Last detection

* View Camera button

Below/alongside the map show:

LIVE ALERTS

Each alert should show:

* Alert type

* Vehicle/plate

* Location

* Time

* Confidence

* Why this alert fired

* View Investigation button

Also show a small "Recent Activity" timeline.

---

# 2. LIVE CAMERAS

Create a camera monitoring page.

Show a grid of camera cards.

Each card:

* Camera ID

* Location

* Department

* Online/offline status

* Simulated live video area

* Last detected object

* Timestamp

* View button

Use placeholder/simulated video frames rather than real CCTV.

Add filters:

* Department

* Location

* Status

* Camera type

* VMS source

Add search by Camera ID.

Clicking "View" opens a detailed camera page/modal with:

* Large video area

* Camera information

* Recent detections

* Timeline

* Detected vehicles

* Alerts associated with this camera

---

# 3. INVESTIGATION

This should be one of the most important pages.

Create an investigation workspace.

At the top:

Search bar with placeholder:

"Search vehicles, cameras, locations, events..."

Example queries:

* "Find GJ01AB1234"

* "Show white SUVs near Ahmedabad yesterday"

* "Track vehicle GJ05CD7788"

* "Show all detections between Ahmedabad and Gandhinagar"

Include a Search button.

Below the search area:

RESULTS

Show:

* Number of detections found

* Time range

* Locations

* Cameras involved

Then show an Investigation Timeline.

Example:

10:32 — CAM-014 — Ahmedabad

11:04 — CAM-021 — Gandhinagar

11:42 — CAM-033 — Mehsana

12:36 — CAM-041 — Palanpur

Each event should contain:

* Camera

* Location

* Timestamp

* Vehicle plate

* Vehicle type

* Color

* Confidence

* View Frame button

Also show a map beside the timeline with the journey route.

IMPORTANT:

Make this look like a real investigation tool, not a chatbot.

---

# 4. VEHICLE SEARCH

Create a dedicated vehicle investigation page.

Search fields:

* License plate

* Vehicle type

* Color

* Date/time range

* Location

* Department

Example result:

Vehicle:

GJ01AB1234

White SUV

Journey:

Ahmedabad → Gandhinagar → Mehsana → Palanpur

Show:

* Detection count

* First seen

* Last seen

* Cameras encountered

* Estimated journey timeline

Include:

* Map route

* Detection timeline

* Camera list

* Evidence buttons

Add a "Create Case" button.

---

# 5. ALERTS

Create an alerts dashboard.

Tabs:

* Open

* Verified

* Dismissed

Each alert should contain:

Alert:

"Watchlist Vehicle Detected"

Vehicle:

GJ01AB1234

Camera:

CAM-021

Location:

Gandhinagar

Confidence:

94%

IMPORTANT: Add an expandable section:

"WHY DID THIS ALERT FIRE?"

Show an explainable chain such as:

✓ Plate matched active watchlist

✓ Vehicle detected by CAM-021

✓ Previous detection found at CAM-014

✓ Detection occurred within expected travel interval

Buttons:

* View Investigation

* Verify

* Dismiss

* Create Case

Do NOT make unsupported claims about AI certainty.

---

# 6. CASES

Create a case-management page.

Show case cards/table with:

* Case ID

* Case title

* Officer

* Created date

* Status

* Number of detections

* Number of evidence items

Example:

CASE-2026-0142

"Vehicle Movement Investigation"

Officer: Demo Officer

Status: Open

Clicking a case opens:

CASE OVERVIEW

* Case information

* Investigation timeline

* Vehicle journey

* Alerts

* Evidence

* Audit history

Add:

"Create Case"

---

# 7. EVIDENCE

This is one of the main differentiating features of SENTINEL.

Create an Evidence Management page.

Show evidence items with:

* Evidence ID

* Case ID

* Camera

* Capture time

* Status

* SHA-256 hash

* Confirmed by

* Confirmed at

Example:

EV-000381

Status:

PRESERVED

Hash:

a3f8...91bc

Create an Evidence Detail page.

Show:

ORIGINAL FOOTAGE

[large frame/video placeholder]

METADATA

Camera:

CAM-021

Location:

Gandhinagar

Capture timestamp:

2026-09-12 11:04:32

AI Model:

VehicleDetector

Model Version:

v1.2.0

AI Confidence:

94%

HASH

SHA-256:

[long hash displayed in monospace]

Then provide:

"VERIFY INTEGRITY"

When clicked, show a professional verification result:

✓ INTEGRITY VERIFIED

"Current file hash matches the preserved SHA-256 hash."

Also design the failure state:

⚠ INTEGRITY CHECK FAILED

"Current file hash does not match the preserved hash."

Do NOT claim that hashing automatically makes evidence legally admissible. The UI should describe this as integrity verification and chain-of-custody support.

---

# 8. AUDIT TRAIL

Create an audit log page.

Show a chronological table:

Entry #

Timestamp

Actor

Action

Case

Evidence

Entry Hash

Previous Hash

Example actions:

SEARCHED

AI_RESULT_GENERATED

EVIDENCE_CONFIRMED

REPORT_GENERATED

INTEGRITY_CHECKED

Each row should be expandable to show the payload/details.

At the top show:

CHAIN STATUS

✓ HASH CHAIN VALID

"All recorded entries verified through Entry #341."

Also create a simulated failure state that can be displayed during development:

⚠ CHAIN BREAK DETECTED

"Integrity verification failed at Entry #342."

Add:

"Verify Entire Chain"

button.

---

# 9. SYSTEM STATUS

Create a technical monitoring page.

Show:

Camera Infrastructure:

47/50 online

Departments Connected:

8

VMS Sources:

6

AI Processing:

Operational

Database:

Connected

API:

Operational

Realtime:

Connected

Also show department integration cards.

Example departments:

* Home Department

* Food & Civil Supplies

* RTO

* Transport

* Other Government Sources

This is a demonstration UI only.

---

# DESIGN SYSTEM

Use a professional command-center style.

Colors:

* Dark navy/charcoal background

* White/light gray text

* Blue as the primary action color

* Green for healthy/verified

* Amber for warnings

* Red for active alerts/errors

Do not overuse colors.

Typography:

* Clean modern sans-serif

* Strong hierarchy

* Compact information density

Use icons consistently.

---

# DATA

Create a separate mock data layer.

Create realistic demo data for approximately 50 cameras.

Include locations across Gujarat.

Create realistic detection data including:

Plate numbers:

GJ01AB1234

GJ05CD7788

GJ18EF4421

GJ06XY9123

Vehicle types:

SUV

Sedan

Hatchback

Truck

Motorcycle

Colors:

White

Black

Blue

Silver

Red

Create a realistic vehicle journey:

Ahmedabad

→ Gandhinagar

→ Mehsana

→ Palanpur

This journey must exist in the mock database/data layer so the Investigation and Vehicle Search pages can demonstrate it.

Do NOT hardcode this journey as a response to a specific search query.

Instead, create mock detection records and have the frontend search/filter those records.

---

# COMPONENT ARCHITECTURE

Create reusable components such as:

CameraCard

CameraMarker

AlertCard

DetectionCard

TimelineEvent

VehicleJourney

EvidenceCard

EvidenceHash

IntegrityStatus

AuditLogTable

StatCard

FilterBar

SearchBar

PageHeader

Sidebar

Keep components modular.

---

# API-READY ARCHITECTURE

Even though there is no backend yet, create a service layer such as:

src/services/

with files that can later contain:

cameraService

detectionService

alertService

caseService

evidenceService

auditService

searchService

For now these services can use mock data.

Later we will replace them with FastAPI REST API calls.

Do not mix mock data directly throughout UI components.

---

# IMPORTANT FUTURE API CONTRACTS

Design the frontend expecting APIs similar to:

GET /cameras

GET /cameras/{id}/feed

GET /detections

POST /search

GET /alerts

POST /alerts/{id}/verify

POST /cases

GET /cases/{id}/timeline

POST /evidence

GET /evidence/{id}

POST /evidence/{id}/verify-integrity

GET /evidence/{id}/report

GET /audit-log

GET /audit-log/verify

Do not implement these backend endpoints now.

Only structure the frontend services so they can later call them.

---

# DEMO FLOW

The frontend must support this complete demonstration:

1. Open Command Center

2. Show 50 cameras across Gujarat

3. Open a camera

4. Show a simulated vehicle detection

5. Search for GJ01AB1234

6. Show detections across multiple cameras

7. Show Ahmedabad → Gandhinagar → Mehsana → Palanpur journey

8. Show the route on the map

9. Show an explainable watchlist alert

10. Create/open a case

11. Preserve a selected detection as evidence

12. Show SHA-256 hash

13. Verify evidence integrity

14. Show audit trail

15. Generate/open an evidence report placeholder

The entire flow should feel like ONE connected application.

---

# FINAL REQUIREMENT

Prioritize:

1. Professional UI

2. Working navigation

3. Realistic mock data

4. Reusable components

5. Clean code

6. API-ready service architecture

7. Investigation workflow

8. Evidence integrity workflow

Do NOT add:

* Face recognition

* Metaverse

* Cryptocurrency/blockchain

* Unnecessary chatbot UI

* Prediction dashboards

* Random AI features unrelated to the problem statement

The goal is to create the **first polished frontend foundation** that our team can later connect to a real FastAPI + PostgreSQL/PostGIS backend and AI/CCTV processing pipeline.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://guj-police-sentinel.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e8f0cc87-3015-4a92-8ac7-123d9f77ff99).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
