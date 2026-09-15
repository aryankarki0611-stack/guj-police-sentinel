/**
 * SENTINEL mock data layer.
 * This file is the ONLY place demo records live. Services read from here today
 * and will later read from the FastAPI backend instead.
 */

export type CameraStatus = "online" | "offline" | "alert" | "attention";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Camera {
  id: string;
  location: string;
  district: string;
  department: string;
  vmsSource: string;
  type: string;
  status: CameraStatus;
  coords: GeoPoint;
  lastDetection: string | null;
  installedOn: string;
}

export interface Detection {
  id: string;
  cameraId: string;
  location: string;
  timestamp: string;
  plate: string;
  vehicleType: string;
  color: string;
  confidence: number;
  direction: string;
  frameRef: string;
}

export type AlertState = "open" | "verified" | "dismissed";

export interface Alert {
  id: string;
  type: string;
  plate: string;
  cameraId: string;
  location: string;
  timestamp: string;
  confidence: number;
  severity: "critical" | "high" | "medium";
  state: AlertState;
  reasoning: string[];
  detectionId: string;
}

export interface CaseRecord {
  id: string;
  title: string;
  officer: string;
  createdAt: string;
  status: "Open" | "Under Review" | "Closed";
  district: string;
  summary: string;
  plates: string[];
  detectionIds: string[];
  evidenceIds: string[];
  alertIds: string[];
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  cameraId: string;
  detectionId: string;
  location: string;
  captureTime: string;
  status: "PRESERVED" | "PENDING" | "RELEASED";
  sha256: string;
  confirmedBy: string;
  confirmedAt: string;
  model: string;
  modelVersion: string;
  confidence: number;
  tampered?: boolean;
}

export interface AuditEntry {
  entry: number;
  timestamp: string;
  actor: string;
  action:
    | "SEARCHED"
    | "AI_RESULT_GENERATED"
    | "EVIDENCE_CONFIRMED"
    | "REPORT_GENERATED"
    | "INTEGRITY_CHECKED"
    | "CASE_CREATED"
    | "ALERT_VERIFIED";
  caseId: string | null;
  evidenceId: string | null;
  entryHash: string;
  previousHash: string;
  payload: Record<string, string | number>;
}

export type IntegrationProtocol = "RTSP" | "ONVIF" | "Vendor API" | "Existing VMS";

export interface IntegrationSource {
  id: string;
  department: string;
  status: "Connected" | "Attention";
  vms: string;
  cameras: number;
  protocols: IntegrationProtocol[];
  lastSync: string;
}

export interface JourneyTransition {
  id: string;
  plate: string;
  fromCameraId: string;
  fromLocation: string;
  fromTime: string;
  toCameraId: string;
  toLocation: string;
  toTime: string;
  distanceKm: number;
  expectedMinutes: number;
  observedMinutes: number;
  status: "plausible" | "review";
  reasons: string[];
}

/* ------------------------------------------------------------------ */
/* Reference geography                                                 */
/* ------------------------------------------------------------------ */

export const GUJARAT_CITIES: {
  name: string;
  district: string;
  coords: GeoPoint;
}[] = [
  {
    name: "Ahmedabad",
    district: "Ahmedabad",
    coords: { lat: 23.0225, lng: 72.5714 },
  },
  {
    name: "Palanpur",
    district: "Banaskantha",
    coords: { lat: 24.1717, lng: 72.4381 },
  },
  {
    name: "Vadodara",
    district: "Vadodara",
    coords: { lat: 22.3072, lng: 73.1812 },
  },
  {
    name: "Surat",
    district: "Surat",
    coords: { lat: 21.1702, lng: 72.8311 },
  },
  {
    name: "Valsad",
    district: "Valsad",
    coords: { lat: 20.5992, lng: 72.9342 },
  },
  {
    name: "Dahod",
    district: "Dahod",
    coords: { lat: 22.8352, lng: 74.2533 },
  },
  {
    name: "Mehsana",
    district: "Mehsana",
    coords: { lat: 23.588, lng: 72.3693 },
  },
  {
    name: "Gandhinagar",
    district: "Gandhinagar",
    coords: { lat: 23.2156, lng: 72.6369 },
  },
  {
    name: "Somnath",
    district: "Gir Somnath",
    coords: { lat: 20.888, lng: 70.4012 },
  },
  {
    name: "Jamnagar",
    district: "Jamnagar",
    coords: { lat: 22.4707, lng: 70.0577 },
  },
  {
    name: "Dwarka",
    district: "Devbhumi Dwarka",
    coords: { lat: 22.2394, lng: 68.9678 },
  },
  {
    name: "Rajkot",
    district: "Rajkot",
    coords: { lat: 22.3039, lng: 70.8022 },
  },
  {
    name: "Bhuj",
    district: "Kachchh",
    coords: { lat: 23.242, lng: 69.6669 },
  },
];

export const DEPARTMENTS = [
  "Home Department",
  "Traffic Police",
  "RTO",
  "Transport Department",
  "Food & Civil Supplies",
  "Municipal Corporation",
  "Highway Patrol",
  "State Reserve Police",
];

export const VMS_SOURCES = [
  "Milestone XProtect",
  "Genetec Security Center",
  "Hikvision HikCentral",
  "Dahua DSS",
  "Axis Camera Station",
  "NetraDrishti VMS",
];

export const CAMERA_TYPES = [
  "Fixed ANPR",
  "PTZ Dome",
  "Bullet",
  "Thermal",
  "Junction Overview",
];

export const VEHICLE_TYPES = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Truck",
  "Motorcycle",
];

export const VEHICLE_COLORS = [
  "White",
  "Black",
  "Blue",
  "Silver",
  "Red",
];

export const PLATES = [
  "GJ01AB1234",
  "GJ05CD7788",
  "GJ18EF4421",
  "GJ06XY9123",
  "GJ27GH5540",
];

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random helpers                                */
/* ------------------------------------------------------------------ */

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(rand(seed) * arr.length) % arr.length]!;
}

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

export const DEMO_DATE = "2026-09-12";

function ts(
  hour: number,
  minute: number,
  second = 0,
  date = DEMO_DATE
) {
  return `${date} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function hash(seed: number, len = 64) {
  const chars = "0123456789abcdef";
  let out = "";

  for (let i = 0; i < len; i++) {
    out += chars[
      Math.floor(rand(seed + i * 7.31) * 16)
    ];
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Cameras (50)                                                       */
/* ------------------------------------------------------------------ */

const OFFLINE_CAMS = [7, 26, 45];
const ALERT_CAMS = [21, 33];
const ATTENTION_CAMS = [4, 18, 38];

export const cameras: Camera[] = Array.from(
  { length: 50 },
  (_, i) => {
    const n = i + 1;
    const city =
      GUJARAT_CITIES[i % GUJARAT_CITIES.length]!;

    const jitter = (s: number) =>
      (rand(s) - 0.5) * 0.16;

    const status: CameraStatus =
      OFFLINE_CAMS.includes(n)
        ? "offline"
        : ALERT_CAMS.includes(n)
          ? "alert"
          : ATTENTION_CAMS.includes(n)
            ? "attention"
            : "online";

    const zones = [
      "Ring Road Junction",
      "Toll Plaza",
      "Bus Terminus",
      "Sector Gate",
      "Market Chowk",
      "Bypass Highway",
      "Railway Crossing",
      "Riverfront Approach",
    ];

    return {
      id: `CAM-${pad(n, 3)}`,
      location: `${city.name} — ${pick(zones, n * 3.7)}`,
      district: city.district,
      department: pick(DEPARTMENTS, n * 1.9),
      vmsSource: pick(VMS_SOURCES, n * 2.3),
      type: pick(CAMERA_TYPES, n * 5.1),
      status,
      coords: {
        lat:
          city.coords.lat +
          jitter(n * 1.3),
        lng:
          city.coords.lng +
          jitter(n * 4.7),
      },
      lastDetection:
        status === "offline"
          ? null
          : ts(
              9 + (n % 4),
              (n * 7) % 60,
              (n * 13) % 60
            ),
      installedOn: `202${3 + (n % 3)}-0${
        1 + (n % 9)
      }-1${n % 9}`,
    };
  }
);

export const cameraCity = (cameraId: string) => {
  const cam = cameras.find(
    (c) => c.id === cameraId
  );

  return cam
    ? cam.location.split(" — ")[0]!
    : "Unknown";
};

/* ------------------------------------------------------------------ */
/* Detections                                                         */
/* ------------------------------------------------------------------ */

// Primary demo journey:
// Ahmedabad -> Gandhinagar -> Mehsana -> Palanpur

const journeyLegs: {
  cameraId: string;
  hour: number;
  minute: number;
  confidence: number;
  direction: string;
}[] = [
  {
    cameraId: "CAM-014",
    hour: 10,
    minute: 32,
    confidence: 0.96,
    direction: "Northbound",
  },
  {
    cameraId: "CAM-021",
    hour: 11,
    minute: 4,
    confidence: 0.94,
    direction: "Northbound",
  },
  {
    cameraId: "CAM-033",
    hour: 11,
    minute: 42,
    confidence: 0.91,
    direction: "Northbound",
  },
  {
    cameraId: "CAM-041",
    hour: 12,
    minute: 36,
    confidence: 0.89,
    direction: "Northbound",
  },
];

const journeyDetections: Detection[] =
  journeyLegs.map((leg, idx) => ({
    id: `DET-${pad(9000 + idx, 5)}`,
    cameraId: leg.cameraId,
    location: cameraCity(leg.cameraId),
    timestamp: ts(
      leg.hour,
      leg.minute,
      12 + idx * 7
    ),
    plate: "GJ01AB1234",
    vehicleType: "SUV",
    color: "White",
    confidence: leg.confidence,
    direction: leg.direction,
    frameRef: `frame_${leg.cameraId}_${leg.hour}${pad(
      leg.minute
    )}`,
  }));

// Secondary journey:
// Surat -> Vadodara -> Ahmedabad

const secondaryLegs = [
  {
    cameraId: "CAM-004",
    hour: 8,
    minute: 12,
    confidence: 0.93,
  },
  {
    cameraId: "CAM-003",
    hour: 9,
    minute: 48,
    confidence: 0.9,
  },
  {
    cameraId: "CAM-027",
    hour: 11,
    minute: 25,
    confidence: 0.87,
  },
];

const secondaryDetections: Detection[] =
  secondaryLegs.map((leg, idx) => ({
    id: `DET-${pad(9500 + idx, 5)}`,
    cameraId: leg.cameraId,
    location: cameraCity(leg.cameraId),
    timestamp: ts(
      leg.hour,
      leg.minute,
      30 + idx
    ),
    plate: "GJ05CD7788",
    vehicleType: "Sedan",
    color: "Black",
    confidence: leg.confidence,
    direction: "Northbound",
    frameRef: `frame_${leg.cameraId}_${leg.hour}${pad(
      leg.minute
    )}`,
  }));

// Watchlist detections referenced by alerts / evidence records.

const watchlistDetections: Detection[] = [
  {
    id: "DET-01005",
    cameraId: "CAM-033",
    location: "Mehsana",
    timestamp: ts(8, 21, 44),
    plate: "GJ18EF4421",
    vehicleType: "Truck",
    color: "Blue",
    confidence: 0.91,
    direction: "Westbound",
    frameRef: "frame_CAM-033_0821",
  },
  {
    id: "DET-01021",
    cameraId: "CAM-018",
    location: "Gandhinagar",
    timestamp: ts(7, 55, 12),
    plate: "GJ18EF4421",
    vehicleType: "Truck",
    color: "Blue",
    confidence: 0.83,
    direction: "Westbound",
    frameRef: "frame_CAM-018_0755",
  },
  {
    id: "DET-01012",
    cameraId: "CAM-045",
    location: "Valsad",
    timestamp: ts(7, 12, 18),
    plate: "GJ06XY9123",
    vehicleType: "Motorcycle",
    color: "Red",
    confidence: 0.61,
    direction: "Southbound",
    frameRef: "frame_CAM-045_0712",
  },
];

// Background traffic uses its own plate pool.

const LETTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ";

const backgroundPlates = Array.from(
  { length: 70 },
  (_, i) => {
    const l = (s: number) =>
      LETTERS[
        Math.floor(
          rand(s) * LETTERS.length
        )
      ]!;

    const digits =
      1000 +
      Math.floor(
        rand(i * 7.7) * 8999
      );

    const rtoCode = pad(
      1 +
        Math.floor(
          rand(i * 2.1) * 38
        )
    );

    return `GJ${rtoCode}${l(
      i * 1.4
    )}${l(i * 3.6)}${digits}`;
  }
).filter(
  (p) => !PLATES.includes(p)
);

const backgroundDetections: Detection[] =
  Array.from({ length: 240 }, (_, i) => {
    const cam =
      cameras[
        Math.floor(
          rand(i * 3.11) *
            cameras.length
        )
      ]!;

    const hour =
      6 +
      Math.floor(
        rand(i * 1.7) * 16
      );

    const minute =
      Math.floor(
        rand(i * 2.9) * 60
      );

    return {
      id: `DET-${pad(
        2000 + i,
        5
      )}`,
      cameraId: cam.id,
      location: cameraCity(cam.id),
      timestamp: ts(
        hour,
        minute,
        Math.floor(
          rand(i * 5.5) * 60
        )
      ),
      plate: pick(
        backgroundPlates,
        i * 6.3
      ),
      vehicleType: pick(
        VEHICLE_TYPES,
        i * 8.1
      ),
      color: pick(
        VEHICLE_COLORS,
        i * 9.7
      ),
      confidence:
        0.72 +
        rand(i * 4.4) * 0.26,
      direction: pick(
        [
          "Northbound",
          "Southbound",
          "Eastbound",
          "Westbound",
        ],
        i * 2.2
      ),
      frameRef: `frame_${cam.id}_${hour}${pad(
        minute
      )}`,
    };
  });

export const detections: Detection[] = [
  ...journeyDetections,
  ...secondaryDetections,
  ...watchlistDetections,
  ...backgroundDetections,
].sort((a, b) =>
  a.timestamp.localeCompare(
    b.timestamp
  )
);

export const integrationSources: IntegrationSource[] = [
  { id: "INT-HOME", department: "Home Department", status: "Connected", vms: "Vendor A VMS", cameras: 18, protocols: ["ONVIF", "RTSP", "Existing VMS"], lastSync: "12 sec ago" },
  { id: "INT-RTO", department: "RTO", status: "Connected", vms: "Vendor B VMS", cameras: 12, protocols: ["Vendor API", "RTSP"], lastSync: "28 sec ago" },
  { id: "INT-FCS", department: "Food & Civil Supplies", status: "Connected", vms: "Vendor C VMS", cameras: 8, protocols: ["Existing VMS", "ONVIF"], lastSync: "41 sec ago" },
  { id: "INT-OTHER", department: "Other Government Sources", status: "Connected", vms: "3 federated sources", cameras: 12, protocols: ["RTSP", "ONVIF", "Vendor API"], lastSync: "36 sec ago" },
];

export const onboardingCameras = [
  { cameraId: "CAM-021", department: "Home Department", location: "Gandhinagar", vmsSource: "Vendor A VMS", protocol: "ONVIF" as const, status: "Connected" as const },
  { cameraId: "CAM-014", department: "RTO", location: "Ahmedabad", vmsSource: "Vendor B VMS", protocol: "Vendor API" as const, status: "Connected" as const },
  { cameraId: "CAM-033", department: "Food & Civil Supplies", location: "Mehsana", vmsSource: "Vendor C VMS", protocol: "Existing VMS" as const, status: "Connected" as const },
  { cameraId: "CAM-041", department: "Other Government Sources", location: "Palanpur", vmsSource: "Federated gateway", protocol: "RTSP" as const, status: "Connected" as const },
];

export const journeyTransitions: JourneyTransition[] = [
  { id: "TRN-014-021-REVIEW", plate: "GJ01AB1234", fromCameraId: "CAM-014", fromLocation: "Ahmedabad", fromTime: ts(10, 32, 12), toCameraId: "CAM-021", toLocation: "Gandhinagar", toTime: ts(10, 35, 12), distanceKm: 28, expectedMinutes: 18, observedMinutes: 3, status: "review", reasons: ["Possible OCR error", "Possible false vehicle association", "Duplicate or incorrect detection", "Possible timestamp problem"] },
  { id: "TRN-021-033", plate: "GJ01AB1234", fromCameraId: "CAM-021", fromLocation: "Gandhinagar", fromTime: ts(10, 51, 12), toCameraId: "CAM-033", toLocation: "Mehsana", toTime: ts(11, 42, 12), distanceKm: 42, expectedMinutes: 45, observedMinutes: 51, status: "plausible", reasons: ["Observed interval meets the graph-constrained minimum travel time"] },
  { id: "TRN-033-041", plate: "GJ01AB1234", fromCameraId: "CAM-033", fromLocation: "Mehsana", fromTime: ts(11, 42, 12), toCameraId: "CAM-041", toLocation: "Palanpur", toTime: ts(12, 36, 33), distanceKm: 71, expectedMinutes: 50, observedMinutes: 54, status: "plausible", reasons: ["Observed interval meets the graph-constrained minimum travel time"] },
];

/* ------------------------------------------------------------------ */
/* Alerts                                                             */
/* ------------------------------------------------------------------ */

export const alerts: Alert[] = [
  {
    id: "ALT-2026-0451",
    type: "Watchlist Vehicle Detected",
    plate: "GJ01AB1234",
    cameraId: "CAM-021",
    location: "Gandhinagar",
    timestamp: ts(11, 4, 32),
    confidence: 0.94,
    severity: "critical",
    state: "open",
    detectionId: "DET-09001",
    reasoning: [
      "Plate matched active watchlist entry WL-0093",
      "Vehicle detected by CAM-021 (Gandhinagar — Sector Gate)",
      "Previous detection found at CAM-014 (Ahmedabad) at 10:32",
      "Detection occurred within expected travel interval (32 min for 27 km)",
      "Plate read confidence 94% — above 85% review threshold",
    ],
  },

  {
    id: "ALT-2026-0452",
    type: "Repeated Corridor Movement",
    plate: "GJ05CD7788",
    cameraId: "CAM-027",
    location: "Ahmedabad",
    timestamp: ts(11, 25, 30),
    confidence: 0.87,
    severity: "high",
    state: "open",
    detectionId: "DET-09502",
    reasoning: [
      "Same plate observed on Surat–Vadodara–Ahmedabad corridor 3 times today",
      "Interval between detections consistent with continuous travel",
      "No watchlist match — flagged on movement pattern rule MR-12",
    ],
  },

  {
    id: "ALT-2026-0453",
    type: "Camera Feed Interruption",
    plate: "—",
    cameraId: "CAM-026",
    location: "Mehsana",
    timestamp: ts(9, 47, 5),
    confidence: 1,
    severity: "medium",
    state: "open",
    detectionId: "",
    reasoning: [
      "No frames received from CAM-026 for 14 minutes",
      "VMS source Dahua DSS reports stream disconnected",
      "Last successful heartbeat 09:33:11",
    ],
  },

  {
    id: "ALT-2026-0448",
    type: "Watchlist Vehicle Detected",
    plate: "GJ18EF4421",
    cameraId: "CAM-033",
    location: "Mehsana",
    timestamp: ts(8, 21, 44),
    confidence: 0.91,
    severity: "high",
    state: "verified",
    detectionId: "DET-01005",
    reasoning: [
      "Plate matched active watchlist entry WL-0071",
      "Verified by Insp. R. Chaudhary against source frame",
      "Detection linked to CASE-2026-0139",
    ],
  },

  {
    id: "ALT-2026-0444",
    type: "Low Confidence Plate Read",
    plate: "GJ06XY9123",
    cameraId: "CAM-045",
    location: "Valsad",
    timestamp: ts(7, 12, 18),
    confidence: 0.61,
    severity: "medium",
    state: "dismissed",
    detectionId: "DET-01012",
    reasoning: [
      "Plate read confidence 61% — below 85% review threshold",
      "Manual review found glare obstruction on plate region",
      "Dismissed by Insp. M. Patel — insufficient image quality",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Cases                                                              */
/* ------------------------------------------------------------------ */

export const cases: CaseRecord[] = [
  {
    id: "CASE-2026-0142",
    title: "Vehicle Movement Investigation",
    officer: "Demo Officer",
    createdAt: ts(12, 40, 0),
    status: "Open",
    district: "Gandhinagar",
    summary:
      "Northbound movement of white SUV GJ01AB1234 tracked from Ahmedabad to Palanpur following a watchlist hit at CAM-021.",
    plates: ["GJ01AB1234"],
    detectionIds:
      journeyDetections.map(
        (d) => d.id
      ),
    evidenceIds: [
      "EV-000381",
      "EV-000382",
    ],
    alertIds: [
      "ALT-2026-0451",
    ],
  },

  {
    id: "CASE-2026-0139",
    title: "Highway Corridor Watchlist Hit",
    officer: "Insp. R. Chaudhary",
    createdAt: ts(8, 55, 0),
    status: "Under Review",
    district: "Mehsana",
    summary:
      "Watchlist vehicle GJ18EF4421 observed on the Mehsana bypass corridor during early morning hours.",
    plates: ["GJ18EF4421"],
    detectionIds: [
      "DET-01005",
    ],
    evidenceIds: [
      "EV-000377",
    ],
    alertIds: [
      "ALT-2026-0448",
    ],
  },

  {
    id: "CASE-2026-0131",
    title: "Goods Vehicle Route Verification",
    officer: "Insp. M. Patel",
    createdAt:
      "2026-09-10 15:20:00",
    status: "Closed",
    district: "Surat",
    summary:
      "Route verification for a goods carrier flagged by the Food & Civil Supplies department.",
    plates: ["GJ05CD7788"],
    detectionIds:
      secondaryDetections.map(
        (d) => d.id
      ),
    evidenceIds: [],
    alertIds: [
      "ALT-2026-0452",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Evidence                                                           */
/* ------------------------------------------------------------------ */

export const evidence: EvidenceItem[] = [
  {
    id: "EV-000381",
    caseId: "CASE-2026-0142",
    cameraId: "CAM-021",
    detectionId: "DET-09001",
    location: "Gandhinagar",
    captureTime: ts(11, 4, 32),
    status: "PRESERVED",
    sha256: hash(381),
    confirmedBy: "Demo Officer",
    confirmedAt: ts(12, 44, 10),
    model: "VehicleDetector",
    modelVersion: "v1.2.0",
    confidence: 0.94,
  },

  {
    id: "EV-000382",
    caseId: "CASE-2026-0142",
    cameraId: "CAM-041",
    detectionId: "DET-09003",
    location: "Palanpur",
    captureTime: ts(12, 36, 33),
    status: "PRESERVED",
    sha256: hash(382),
    confirmedBy: "Demo Officer",
    confirmedAt: ts(12, 47, 2),
    model: "VehicleDetector",
    modelVersion: "v1.2.0",
    confidence: 0.89,
  },

  {
    id: "EV-000377",
    caseId: "CASE-2026-0139",
    cameraId: "CAM-033",
    detectionId: "DET-01005",
    location: "Mehsana",
    captureTime: ts(8, 21, 44),
    status: "PRESERVED",
    sha256: hash(377),
    confirmedBy: "Insp. R. Chaudhary",
    confirmedAt: ts(9, 2, 55),
    model: "VehicleDetector",
    modelVersion: "v1.2.0",
    confidence: 0.91,
  },

  {
    id: "EV-000374",
    caseId: "CASE-2026-0139",
    cameraId: "CAM-018",
    detectionId: "DET-01021",
    location: "Gandhinagar",
    captureTime: ts(7, 55, 12),
    status: "PENDING",
    sha256: hash(374),
    confirmedBy: "—",
    confirmedAt: "—",
    model: "VehicleDetector",
    modelVersion: "v1.2.0",
    confidence: 0.83,
    tampered: true,
  },
];

/* ------------------------------------------------------------------ */
/* Audit trail                                                        */
/* ------------------------------------------------------------------ */

const auditSeed: {
  actor: string;
  action: AuditEntry["action"];
  caseId: string | null;
  evidenceId: string | null;
  payload: Record<string, string | number>;
  time: [number, number];
}[] = [
  {
    actor: "Demo Officer",
    action: "SEARCHED",
    caseId: null,
    evidenceId: null,
    time: [12, 38],
    payload: {
      query: "GJ01AB1234",
      results: 4,
      scope: "all cameras",
    },
  },

  {
    actor: "SENTINEL Engine",
    action: "AI_RESULT_GENERATED",
    caseId: null,
    evidenceId: null,
    time: [12, 38],
    payload: {
      model: "VehicleDetector v1.2.0",
      matches: 4,
      avg_confidence: 0.925,
    },
  },

  {
    actor: "Demo Officer",
    action: "CASE_CREATED",
    caseId: "CASE-2026-0142",
    evidenceId: null,
    time: [12, 40],
    payload: {
      title: "Vehicle Movement Investigation",
      district: "Gandhinagar",
    },
  },

  {
    actor: "Demo Officer",
    action: "EVIDENCE_CONFIRMED",
    caseId: "CASE-2026-0142",
    evidenceId: "EV-000381",
    time: [12, 44],
    payload: {
      camera: "CAM-021",
      sha256_prefix:
        hash(381).slice(0, 12),
    },
  },

  {
    actor: "Demo Officer",
    action: "EVIDENCE_CONFIRMED",
    caseId: "CASE-2026-0142",
    evidenceId: "EV-000382",
    time: [12, 47],
    payload: {
      camera: "CAM-041",
      sha256_prefix:
        hash(382).slice(0, 12),
    },
  },

  {
    actor: "Demo Officer",
    action: "INTEGRITY_CHECKED",
    caseId: "CASE-2026-0142",
    evidenceId: "EV-000381",
    time: [12, 49],
    payload: {
      result: "MATCH",
      algorithm: "SHA-256",
    },
  },

  {
    actor: "Insp. R. Chaudhary",
    action: "ALERT_VERIFIED",
    caseId: "CASE-2026-0139",
    evidenceId: null,
    time: [12, 51],
    payload: {
      alert: "ALT-2026-0448",
      decision: "verified",
    },
  },

  {
    actor: "Demo Officer",
    action: "REPORT_GENERATED",
    caseId: "CASE-2026-0142",
    evidenceId: "EV-000381",
    time: [12, 55],
    payload: {
      format: "PDF",
      pages: 3,
      includes_hash_chain: "yes",
    },
  },
];

export const auditEntries: AuditEntry[] =
  auditSeed.map((s, i) => {
    const entry = 334 + i;

    return {
      entry,
      timestamp: ts(
        s.time[0],
        s.time[1],
        (i * 17) % 60
      ),
      actor: s.actor,
      action: s.action,
      caseId: s.caseId,
      evidenceId: s.evidenceId,
      entryHash: hash(
        entry * 3.3
      ),
      previousHash:
        i === 0
          ? hash(333 * 3.3)
          : hash(
              (entry - 1) * 3.3
            ),
      payload: s.payload,
    };
  });

export const AUDIT_CHAIN_TIP =
  auditEntries[
    auditEntries.length - 1
  ]!.entry;

/* ------------------------------------------------------------------ */
/* System status                                                      */
/* ------------------------------------------------------------------ */

export const systemStatus = {
  camerasOnline: cameras.filter(
    (c) => c.status !== "offline"
  ).length,

  camerasTotal: cameras.length,

  departmentsConnected: 8,

  vmsSources: VMS_SOURCES.length,

  services: [
    {
      name: "AI Processing",
      state: "Operational",
      detail:
        "VehicleDetector v1.2.0 · 12 workers",
    },
    {
      name: "Database",
      state: "Connected",
      detail:
        "PostgreSQL 16 · PostGIS 3.4",
    },
    {
      name: "API",
      state: "Operational",
      detail:
        "REST · p95 latency 118 ms",
    },
    {
      name: "Realtime",
      state: "Connected",
      detail:
        "WebSocket channel · 214 subscribers",
    },
    {
      name: "Object Storage",
      state: "Operational",
      detail:
        "Evidence bucket · 78% free",
    },
    {
      name: "Hash Chain Service",
      state: "Operational",
      detail: `Verified through entry #${AUDIT_CHAIN_TIP}`,
    },
  ],

  departments: [
    {
      name: "Home Department",
      cameras: 18,
      status: "Connected",
      vms: "Milestone XProtect",
      sync: "2 min ago",
    },
    {
      name: "Food & Civil Supplies",
      cameras: 5,
      status: "Connected",
      vms: "Dahua DSS",
      sync: "6 min ago",
    },
    {
      name: "RTO",
      cameras: 9,
      status: "Connected",
      vms: "Genetec Security Center",
      sync: "1 min ago",
    },
    {
      name: "Transport Department",
      cameras: 7,
      status: "Degraded",
      vms: "Hikvision HikCentral",
      sync: "27 min ago",
    },
    {
      name: "Municipal Corporation",
      cameras: 6,
      status: "Connected",
      vms: "Axis Camera Station",
      sync: "4 min ago",
    },
    {
      name: "Other Government Sources",
      cameras: 5,
      status: "Connected",
      vms: "NetraDrishti VMS",
      sync: "9 min ago",
    },
  ],
};

export const recentActivity = [
  {
    time: ts(12, 55),
    text: "Evidence report generated for CASE-2026-0142",
    kind: "info" as const,
  },
  {
    time: ts(12, 49),
    text: "Integrity check passed for EV-000381",
    kind: "ok" as const,
  },
  {
    time: ts(12, 44),
    text: "EV-000381 preserved from CAM-021 frame",
    kind: "ok" as const,
  },
  {
    time: ts(12, 40),
    text: "CASE-2026-0142 opened by Demo Officer",
    kind: "info" as const,
  },
  {
    time: ts(12, 36),
    text: "GJ01AB1234 detected at CAM-041 Palanpur",
    kind: "warn" as const,
  },
  {
    time: ts(11, 4),
    text: "Watchlist alert raised at CAM-021 Gandhinagar",
    kind: "alert" as const,
  },
  {
    time: ts(9, 47),
    text: "CAM-026 stream disconnected (Dahua DSS)",
    kind: "warn" as const,
  },
];