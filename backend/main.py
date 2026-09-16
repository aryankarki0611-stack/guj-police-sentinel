import os
import time
import threading
import subprocess
from typing import Any, Dict, List, Optional

import cv2
import requests
from dotenv import load_dotenv
from fastapi import FastAPI

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None


# ============================================================
# CONFIG
# ============================================================

load_dotenv()

PORTAL_BASE_URL = os.getenv(
    "PORTAL_BASE_URL",
    "https://cctv.corp8.cloud",
).rstrip("/")

SENTINEL_COOKIE = os.getenv(
    "SENTINEL_COOKIE",
    "",
).strip()

USER_AGENT = os.getenv(
    "USER_AGENT",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/152.0.0.0 Safari/537.36",
)

CAMERA_LIMIT = int(
    os.getenv("CAMERA_LIMIT", "30")
)

DETECTION_INTERVAL = float(
    os.getenv("DETECTION_INTERVAL", "5")
)

BACKEND_PORT = int(
    os.getenv("BACKEND_PORT", "8000")
)

YOLO_MODEL = os.getenv(
    "YOLO_MODEL",
    "yolo11n.pt",
)

RECONNECT_INITIAL_SECONDS = 2
RECONNECT_MAX_SECONDS = 30


# ============================================================
# REAL CAMERA CATALOGUE
# ============================================================

CAMERAS = [
    {"id": "cam01", "name": "01 Chiman bhai Bridge"},
    {"id": "cam02", "name": "02 Janpath"},
    {"id": "cam03", "name": "03 O.N.G.C. Office"},
    {"id": "cam04", "name": "04 Paldi Circle"},
    {"id": "cam05", "name": "05 Visat teen Rasta"},
    {"id": "cam06", "name": "06 Timbavadi gate-Junagadh"},
    {"id": "cam07", "name": "07 hero-showroom-gir-somnath"},
    {"id": "cam08", "name": "08 majewadi-gate-junagadh"},
    {"id": "cam09", "name": "09 new-bypass-near-by-circle-junagadh-2"},
    {"id": "cam10", "name": "10 char-chowk-road-2-junagadh"},
    {"id": "cam11", "name": "11 dolatpara-junagadh"},
    {"id": "cam12", "name": "12 Tri Mandir Adalaj Tollnaka"},
    {"id": "cam13", "name": "13 CN Vidhyalaya"},
    {"id": "cam14", "name": "14 Delight RLVD"},
    {"id": "cam15", "name": "15 Suvidha park"},
    {"id": "cam16", "name": "16 Visat P2"},
    {"id": "cam17", "name": "17 Rajkot Bus Port CCTV"},
    {"id": "cam18", "name": "18 Rajkot CCTV"},
    {
        "id": "cam19",
        "name": "19 KHAPARIA GRAM PANCHAYAT, TALUKA GANDEVI, DISTRICT NAVSARI",
    },
    {"id": "cam20", "name": "20 Mohanpura"},
    {"id": "cam21", "name": "23 Patan Dethali Char Rasta"},
    {"id": "cam22", "name": "28 BK Mervada tran Rasta"},
    {"id": "cam23", "name": "30 kheram"},
    {"id": "cam24", "name": "33 dehgam"},
    {"id": "cam25", "name": "34 dhanori"},
    {"id": "cam26", "name": "35 TANKAL"},
    {"id": "cam27", "name": "36 bilimora"},
    {"id": "cam28", "name": "37 bilimora"},
    {"id": "cam29", "name": "38 bilimora"},
    {"id": "cam30", "name": "Gandhidham Rambaugh p2"},
]


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="SENTINEL Live Inference Backend"
)


# ============================================================
# GLOBAL STATE
# ============================================================

pipeline_running = False

pipeline_lock = threading.Lock()

processed_frames = 0
successful_detections = 0

last_detections: List[Dict[str, Any]] = []

camera_status: Dict[str, Dict[str, Any]] = {}

yolo_model = None


# ============================================================
# HTTP SESSION
# ============================================================

session = requests.Session()

session.headers.update(
    {
        "User-Agent": USER_AGENT,
        "Referer": f"{PORTAL_BASE_URL}/",
        "Accept": "*/*",
    }
)


# ============================================================
# AUTHENTICATED COOKIE
# ============================================================

def setup_authenticated_session():

    if not SENTINEL_COOKIE:

        print(
            "[AUTH] SENTINEL_COOKIE is not configured."
        )

        print(
            "[AUTH] Add the browser sentinel cookie to .env."
        )

        return False

    cookie_value = SENTINEL_COOKIE

    # Allow either:
    #
    # sentinel=abc123
    #
    # or just:
    #
    # abc123
    #
    if "=" in cookie_value:

        cookie_name, cookie_data = (
            cookie_value.split("=", 1)
        )

    else:

        cookie_name = "sentinel"
        cookie_data = cookie_value

    session.cookies.set(
        cookie_name,
        cookie_data,
        domain="cctv.corp8.cloud",
        path="/",
    )

    print(
        "[AUTH] Authenticated cookie loaded."
    )

    print(
        "[AUTH] Cookie name:",
        cookie_name,
    )

    return True


# ============================================================
# CAMERA HELPERS
# ============================================================

def get_camera_id(
    camera: Dict[str, Any],
) -> Optional[str]:

    value = camera.get("id")

    if value is None:
        return None

    return str(value)


def get_hls_url(
    camera: Dict[str, Any],
) -> Optional[str]:

    camera_id = get_camera_id(camera)

    if not camera_id:
        return None

    return (
        f"{PORTAL_BASE_URL}"
        f"/{camera_id}/index.m3u8"
    )


# ============================================================
# TEST CAMERA ACCESS
# ============================================================

def test_camera_stream(
    camera_id: str,
) -> bool:

    stream_url = (
        f"{PORTAL_BASE_URL}"
        f"/{camera_id}/index.m3u8"
    )

    print(
        "[HLS] Testing:",
        stream_url,
    )

    try:

        response = session.get(
            stream_url,
            allow_redirects=False,
            timeout=10,
        )

        print(
            "[HLS] HTTP:",
            response.status_code,
        )

        print(
            "[HLS] URL:",
            response.url,
        )

        if response.status_code in (301, 302, 303, 307, 308):

            print(
                "[HLS] Redirect:",
                response.headers.get(
                    "location"
                ),
            )

            return False

        if response.status_code != 200:

            return False

        content_type = (
            response.headers
            .get("content-type", "")
            .lower()
        )

        print(
            "[HLS] Content-Type:",
            content_type,
        )

        return True

    except Exception as exc:

        print(
            "[HLS] Test failed:",
            exc,
        )

        return False


# ============================================================
# SUPABASE
# ============================================================

supabase = None


def setup_supabase():

    global supabase

    supabase_url = os.getenv(
        "SUPABASE_URL",
        "",
    ).strip()

    supabase_key = os.getenv(
        "SUPABASE_KEY",
        "",
    ).strip()

    if not supabase_url:

        print(
            "[SUPABASE] SUPABASE_URL not configured."
        )

        print(
            "[SUPABASE] Database inserts are disabled."
        )

        return

    if not supabase_key:

        print(
            "[SUPABASE] SUPABASE_KEY not configured."
        )

        print(
            "[SUPABASE] Database inserts are disabled."
        )

        return

    try:

        from supabase import create_client

        supabase = create_client(
            supabase_url,
            supabase_key,
        )

        print(
            "[SUPABASE] Connected."
        )

    except Exception as exc:

        supabase = None

        print(
            "[SUPABASE] Connection failed:",
            exc,
        )


# ============================================================
# SAVE DETECTION
# ============================================================

def save_detection_to_supabase(
    camera_id: str,
    detection: Dict[str, Any],
):

    if supabase is None:
        return

    try:

        row = {
            "camera_id": camera_id,
            "object_class": detection.get(
                "class"
            ),
            "confidence": detection.get(
                "confidence"
            ),
            "bbox": detection.get(
                "bbox"
            ),
            "created_at": time.strftime(
                "%Y-%m-%dT%H:%M:%SZ",
                time.gmtime(),
            ),
        }

        response = (
            supabase
            .table("detections")
            .insert(row)
            .execute()
        )

        if response.data:

            print(
                "[SUPABASE] Detection inserted:",
                detection.get("class"),
            )

    except Exception as exc:

        print(
            "[SUPABASE] Insert failed:",
            exc,
        )


# ============================================================
# YOLO
# ============================================================

def setup_yolo():

    global yolo_model

    if YOLO is None:

        print(
            "[YOLO] ultralytics is not installed."
        )

        return

    try:

        print(
            "[YOLO] Loading model:",
            YOLO_MODEL,
        )

        yolo_model = YOLO(
            YOLO_MODEL
        )

        print(
            "[YOLO] Model loaded successfully."
        )

    except Exception as exc:

        yolo_model = None

        print(
            "[YOLO] Model loading failed:",
            exc,
        )


def run_yolo(
    frame,
) -> List[Dict[str, Any]]:

    if yolo_model is None:
        return []

    try:

        results = yolo_model(
            frame,
            verbose=False,
        )

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                confidence = float(
                    box.conf[0]
                )

                class_id = int(
                    box.cls[0]
                )

                class_name = (
                    result.names
                    .get(
                        class_id,
                        str(class_id),
                    )
                )

                coordinates = (
                    box.xyxy[0]
                    .tolist()
                )

                detections.append(
                    {
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": coordinates,
                    }
                )

        return detections

    except Exception as exc:

        print(
            "[YOLO] Inference failed:",
            exc,
        )

        return []


# ============================================================
# CAMERA WORKER
# ============================================================

def camera_worker(
    camera: Dict[str, Any],
):

    global processed_frames
    global successful_detections
    global last_detections

    camera_id = get_camera_id(
        camera
    )

    stream_url = get_hls_url(
        camera
    )

    if not camera_id:

        print(
            "[PIPELINE] Camera has no ID."
        )

        return

    if not stream_url:

        print(
            "[PIPELINE]",
            camera_id,
            "has no stream URL."
        )

        return

    print(
        "=========================================="
    )

    print(
        "[PIPELINE] Starting camera:",
        camera_id,
    )

    print(
        "[PIPELINE] Stream:",
        stream_url,
    )

    print(
        "=========================================="
    )

    camera_status[
        camera_id
    ] = {
        "id": camera_id,
        "name": camera.get(
            "name",
            camera_id,
        ),
        "status": "connecting",
        "stream_url": stream_url,
        "frames": 0,
        "detections": 0,
    }

    reconnect_delay = (
        RECONNECT_INITIAL_SECONDS
    )

    frame_counter = 0
    last_detection_time = 0

    while pipeline_running:

        print(
            "[STREAM] Connecting:",
            camera_id,
        )

        # ----------------------------------------------------
        # COOKIE
        # ----------------------------------------------------

        cookie_header = (
            "; ".join(
                f"{cookie.name}={cookie.value}"
                for cookie in session.cookies
            )
        )

        # ----------------------------------------------------
        # HLS HEADERS
        # ----------------------------------------------------

        headers = (
            f"Cookie: {cookie_header}\r\n"
            f"User-Agent: {USER_AGENT}\r\n"
            f"Referer: {PORTAL_BASE_URL}/\r\n"
            f"Origin: {PORTAL_BASE_URL}\r\n"
        )

        # ----------------------------------------------------
        # FFMPEG
        # ----------------------------------------------------

        ffmpeg_cmd = [

            "/opt/homebrew/bin/ffmpeg",

            "-hide_banner",

            "-loglevel",
            "warning",

            # HTTP headers
            "-headers",
            headers,

            # HLS
            "-i",
            stream_url,

            # Raw BGR frames
            "-f",
            "rawvideo",

            "-pix_fmt",
            "bgr24",

            # Resize
            "-vf",
            "scale=640:360",

            "pipe:1",
        ]

        try:

            ffmpeg_process = (
                subprocess.Popen(
                    ffmpeg_cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    bufsize=10**8,
                )
            )

        except FileNotFoundError:

            print(
                "[HLS] FFmpeg not found."
            )

            return

        frame_width = 640
        frame_height = 360

        frame_size = (
            frame_width
            * frame_height
            * 3
        )

        print(
            "[HLS] FFmpeg started:",
            camera_id,
        )

        camera_status[
            camera_id
        ]["status"] = "connected"

        connected = False

        reconnect_delay = (
            RECONNECT_INITIAL_SECONDS
        )

        while pipeline_running:

            raw_frame = (
                ffmpeg_process
                .stdout
                .read(frame_size)
            )

            if (
                not raw_frame
                or len(raw_frame)
                != frame_size
            ):

                break

            # ------------------------------------------------
            # RAW BGR → NUMPY
            # ------------------------------------------------

            try:

                import numpy as np

                frame = (
                    np.frombuffer(
                        raw_frame,
                        dtype=np.uint8,
                    )
                    .reshape(
                        (
                            frame_height,
                            frame_width,
                            3,
                        )
                    )
                )

            except Exception as exc:

                print(
                    "[FRAME] Decode failed:",
                    exc,
                )

                break

            if not connected:

                print(
                    "[STREAM] CONNECTED:",
                    camera_id,
                )

                connected = True

            frame_counter += 1
            processed_frames += 1

            camera_status[
                camera_id
            ]["frames"] = frame_counter

            # ------------------------------------------------
            # DETECTION INTERVAL
            # ------------------------------------------------

            now = time.time()

            if (
                now - last_detection_time
                >= DETECTION_INTERVAL
            ):

                last_detection_time = now

                detections = run_yolo(
                    frame
                )

                last_detections = (
                    detections
                )

                camera_status[
                    camera_id
                ]["detections"] += len(
                    detections
                )

                if detections:

                    successful_detections += (
                        len(detections)
                    )

                    print(
                        "[INFERENCE]",
                        camera_id,
                        "| frame=",
                        frame_counter,
                        "| detections=",
                        len(detections),
                    )

                    for detection in detections:

                        print(
                            "   ",
                            detection[
                                "class"
                            ],
                            f"{detection['confidence']:.2f}",
                        )

                        save_detection_to_supabase(
                            camera_id,
                            detection,
                        )

                else:

                    print(
                        "[INFERENCE]",
                        camera_id,
                        "| frame=",
                        frame_counter,
                        "| detections=0",
                    )

        # ----------------------------------------------------
        # STOP FFMPEG
        # ----------------------------------------------------

        try:

            ffmpeg_process.terminate()

            ffmpeg_process.wait(
                timeout=3
            )

        except Exception:

            try:
                ffmpeg_process.kill()
            except Exception:
                pass

        camera_status[
            camera_id
        ]["status"] = "disconnected"

        print(
            "[STREAM] Disconnected:",
            camera_id,
        )

        # ----------------------------------------------------
        # RECONNECT
        # ----------------------------------------------------

        if pipeline_running:

            print(
                "[STREAM] Reconnecting in",
                reconnect_delay,
                "seconds...",
            )

            time.sleep(
                reconnect_delay
            )

            reconnect_delay = min(
                reconnect_delay * 2,
                RECONNECT_MAX_SECONDS,
            )


# ============================================================
# PIPELINE
# ============================================================

def start_pipeline():

    global pipeline_running

    with pipeline_lock:

        if pipeline_running:

            print(
                "[PIPELINE] Already running."
            )

            return

        print(
            "=========================================="
        )

        print(
            " SENTINEL LIVE INFERENCE BACKEND"
        )

        print(
            "=========================================="
        )

        print(
            "[CONFIG] Portal:",
            PORTAL_BASE_URL,
        )

        print(
            "[CONFIG] Camera limit:",
            CAMERA_LIMIT,
        )

        print(
            "[CONFIG] Detection interval:",
            DETECTION_INTERVAL,
            "seconds",
        )

        # ----------------------------------------------------
        # AUTHENTICATION
        # ----------------------------------------------------

        authenticated = (
            setup_authenticated_session()
        )

        if not authenticated:

            print(
                "[PIPELINE] No authenticated session."
            )

            print(
                "[PIPELINE] Pipeline will not start."
            )

            return

        # ----------------------------------------------------
        # TEST FIRST CAMERA
        # ----------------------------------------------------

        print(
            "[PIPELINE] Testing cam02..."
        )

        if test_camera_stream(
            "cam02"
        ):

            print(
                "[PIPELINE] cam02 access confirmed."
            )

        else:

            print(
                "[PIPELINE] cam02 test failed."
            )

            print(
                "[PIPELINE] Check whether the browser cookie is still valid."
            )

            return

        # ----------------------------------------------------
        # SELECT CAMERAS
        # ----------------------------------------------------

        selected_cameras = CAMERAS[
            :CAMERA_LIMIT
        ]

        # ----------------------------------------------------
        # RUN
        # ----------------------------------------------------

        pipeline_running = True

        worker_count = 0

        for camera in selected_cameras:

            thread = threading.Thread(
                target=camera_worker,
                args=(camera,),
                daemon=True,
            )

            thread.start()

            worker_count += 1

        print(
            "[PIPELINE] Started",
            worker_count,
            "camera worker(s)."
        )


def stop_pipeline():

    global pipeline_running

    pipeline_running = False

    print(
        "[PIPELINE] Stopping..."
    )


# ============================================================
# API
# ============================================================

@app.get("/")
def root():

    return {
        "service": (
            "SENTINEL Live Inference Backend"
        ),
        "status": "running",
        "pipeline_running": pipeline_running,
        "camera_count": len(CAMERAS),
        "endpoints": {
            "health": "/health",
            "cameras": "/api/ingest",
            "detections": "/api/detections",
            "camera_status": "/api/camera-status",
            "start": "/pipeline/start",
            "stop": "/pipeline/stop",
        },
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
        "pipeline_running": pipeline_running,
        "camera_count": len(CAMERAS),
        "yolo": (
            yolo_model is not None
        ),
        "supabase": (
            supabase is not None
        ),
        "authenticated_cookie": bool(
            SENTINEL_COOKIE
        ),
        "processed_frames": processed_frames,
        "detections": successful_detections,
    }


@app.get("/api/ingest")
def api_ingest():

    return {
        "count": len(CAMERAS),
        "cameras": [
            {
                **camera,
                "stream_url": get_hls_url(
                    camera
                ),
            }
            for camera in CAMERAS
        ],
    }


@app.get("/api/detections")
def api_detections():

    return {
        "count": len(last_detections),
        "detections": last_detections,
    }


@app.get("/api/camera-status")
def api_camera_status():

    return {
        "count": len(camera_status),
        "cameras": camera_status,
    }


@app.post("/pipeline/start")
def api_start_pipeline():

    if not pipeline_running:

        threading.Thread(
            target=start_pipeline,
            daemon=True,
        ).start()

    return {
        "status": "starting",
        "pipeline_running": pipeline_running,
    }


@app.post("/pipeline/stop")
def api_stop_pipeline():

    stop_pipeline()

    return {
        "status": "stopped",
        "pipeline_running": pipeline_running,
    }


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def startup():

    setup_supabase()
    setup_yolo()

    print(
        "[STARTUP] Backend is running."
    )

    print(
        "[STARTUP] Use POST /pipeline/start "
        "to start the live camera pipeline."
    )


@app.on_event("shutdown")
def shutdown():

    stop_pipeline()


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=BACKEND_PORT,
    )