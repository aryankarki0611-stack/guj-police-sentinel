import os
import time
import threading
from typing import Optional, Any, Dict, List

import cv2
import requests
from bs4 import BeautifulSoup

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

try:
    from supabase import create_client
except ImportError:
    create_client = None


# ============================================================
# CONFIG
# ============================================================

PORTAL_BASE_URL = os.getenv(
    "SENTINEL_PORTAL_URL",
    "https://live.sentinelgujarat.in",
).rstrip("/")

CATALOGUE_URL = os.getenv(
    "SENTINEL_CATALOGUE_URL",
    PORTAL_BASE_URL + "/api/ingest",
)

LOGIN_URL = PORTAL_BASE_URL + "/auth/login"

SENTINEL_EMAIL = os.getenv(
    "SENTINEL_EMAIL",
    "",
)

SENTINEL_PASSWORD = os.getenv(
    "SENTINEL_PASSWORD",
    "",
)

SUPABASE_URL = os.getenv(
    "SUPABASE_URL",
    "",
)

SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "",
)

YOLO_MODEL = os.getenv(
    "YOLO_MODEL",
    "yolo11n.pt",
)

CAMERA_LIMIT = int(
    os.getenv("CAMERA_LIMIT", "1")
)

BACKEND_PORT = int(
    os.getenv("BACKEND_PORT", "8000")
)

RECONNECT_INITIAL_SECONDS = 2
RECONNECT_MAX_SECONDS = 30

DETECTION_INTERVAL = int(
    os.getenv("DETECTION_INTERVAL", "5")
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="SENTINEL Live Inference Backend",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GLOBAL STATE
# ============================================================

session = requests.Session()

session.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 "
            "(Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/140.0 Safari/537.36"
        )
    }
)

supabase = None
yolo_model = None

catalogue_cache: List[Dict[str, Any]] = []

pipeline_running = False

pipeline_lock = threading.Lock()

last_detections: List[Dict[str, Any]] = []

processed_frames = 0

successful_detections = 0


# ============================================================
# SUPABASE
# ============================================================

def setup_supabase():
    global supabase

    if not SUPABASE_URL:
        print("[SUPABASE] SUPABASE_URL not configured.")
        print("[SUPABASE] Database inserts are disabled.")
        return

    if not SUPABASE_SERVICE_ROLE_KEY:
        print("[SUPABASE] SUPABASE_SERVICE_ROLE_KEY not configured.")
        print("[SUPABASE] Database inserts are disabled.")
        return

    if create_client is None:
        print("[SUPABASE] supabase package is not installed.")
        return

    try:
        supabase = create_client(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
        )

        print("[SUPABASE] Connected.")

    except Exception as exc:
        supabase = None
        print(
            "[SUPABASE] Connection failed:",
            exc,
        )


def save_detection_to_supabase(
    camera_id: str,
    detection: Dict[str, Any],
):
    if supabase is None:
        return

    try:
        row = {
            "camera_id": camera_id,
            "object_class": detection.get("class"),
            "confidence": detection.get("confidence"),
            "bbox": detection.get("bbox"),
            "created_at": time.strftime(
                "%Y-%m-%dT%H:%M:%SZ",
                time.gmtime(),
            ),
        }

        # Change "detections" if your Supabase table
        # has a different name.
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
        print("[YOLO] ultralytics is not installed.")
        print("[YOLO] YOLO detection is disabled.")
        return

    try:
        print(
            "[YOLO] Loading model:",
            YOLO_MODEL,
        )

        yolo_model = YOLO(YOLO_MODEL)

        print("[YOLO] Model loaded successfully.")

    except Exception as exc:
        yolo_model = None

        print(
            "[YOLO] Model loading failed:",
            exc,
        )


def run_yolo(frame) -> List[Dict[str, Any]]:
    if yolo_model is None:
        return []

    try:
        results = yolo_model(
            frame,
            verbose=False,
        )

        detections = []

        for result in results:

            boxes = result.boxes

            if boxes is None:
                continue

            for box in boxes:

                try:
                    xyxy = box.xyxy[0].tolist()

                    confidence = float(
                        box.conf[0]
                    )

                    class_id = int(
                        box.cls[0]
                    )

                    class_name = str(
                        result.names[class_id]
                    )

                    detections.append(
                        {
                            "class": class_name,
                            "confidence": confidence,
                            "bbox": xyxy,
                        }
                    )

                except Exception:
                    continue

        return detections

    except Exception as exc:
        print(
            "[YOLO] Detection error:",
            exc,
        )

        return []


# ============================================================
# PORTAL LOGIN
# ============================================================

def login_to_portal() -> bool:
    """
    Login to Sentinel Gujarat portal.

    The portal currently redirects the login page to
    cctv.corp8.cloud and returns HTTP 302 + a "sentinel"
    session cookie after a successful login.
    """

    if not SENTINEL_EMAIL:
        print("[AUTH] SENTINEL_EMAIL is not configured.")
        return False

    if not SENTINEL_PASSWORD:
        print("[AUTH] SENTINEL_PASSWORD is not configured.")
        return False

    try:
        print("[AUTH] Opening login page...")

        # Follow the portal's redirect to the real login host.
        login_page = session.get(
            LOGIN_URL,
            timeout=20,
            allow_redirects=True,
        )

        print(
            "[AUTH] Login page:",
            login_page.status_code,
            login_page.url,
        )

        if login_page.status_code >= 400:
            print("[AUTH] Could not open login page.")
            return False

        # ----------------------------------------------------
        # Extract any hidden form fields.
        # ----------------------------------------------------

        login_data = {}

        try:
            soup = BeautifulSoup(
                login_page.text,
                "html.parser",
            )

            form = soup.find("form")

            if form is not None:
                for input_tag in form.find_all("input"):
                    name = input_tag.get("name")
                    value = input_tag.get("value", "")

                    if name:
                        login_data[name] = value

        except Exception as exc:
            print(
                "[AUTH] Could not parse login form:",
                exc,
            )

        # Add the credentials supplied through environment variables.
        login_data["email"] = SENTINEL_EMAIL
        login_data["password"] = SENTINEL_PASSWORD

        print("[AUTH] Submitting login...")

        # POST to the actual login URL after redirects.
        response = session.post(
            login_page.url,
            data=login_data,
            timeout=20,
            allow_redirects=False,
        )

        print(
            "[AUTH] Login response:",
            response.status_code,
            response.url,
        )

        if response.status_code >= 400:
            print(
                "[AUTH] Login request failed:",
                response.status_code,
            )
            return False

        # ----------------------------------------------------
        # SUCCESS:
        # The portal returns HTTP 302, Location: / and a
        # HttpOnly cookie named "sentinel".
        # ----------------------------------------------------

        sentinel_cookie = session.cookies.get("sentinel")

        if response.status_code in (301, 302, 303, 307, 308):
            location = response.headers.get("Location", "")

            print("[AUTH] Redirect:", location or "(none)")

            if sentinel_cookie:
                print("[AUTH] Sentinel session cookie received.")
                print("[AUTH] Login successful.")
                return True

            print(
                "[AUTH] Redirect received, but no Sentinel session cookie."
            )
            return False

        # Some deployments may return the authenticated page directly.
        if sentinel_cookie:
            print("[AUTH] Sentinel session cookie received.")
            print("[AUTH] Login successful.")
            return True

        page_text = response.text.lower()

        if (
            "sign in" in page_text
            and "access password" in page_text
        ):
            print("[AUTH] Login was NOT accepted.")
            print("[AUTH] The portal returned the sign-in page.")
            return False

        print("[AUTH] Login response was unexpected.")
        return False

    except requests.RequestException as exc:
        print("[AUTH] Network error:", exc)
        return False

    except Exception as exc:
        print("[AUTH] Login error:", exc)
        return False


# ============================================================
# CATALOGUE
# ============================================================

def fetch_catalogue() -> List[Dict[str, Any]]:
    global catalogue_cache

    try:

        print(
            "[CATALOGUE] GET",
            CATALOGUE_URL,
        )

        response = session.get(
            CATALOGUE_URL,
            timeout=20,
            allow_redirects=True,
        )

        print(
            "[CATALOGUE] HTTP",
            response.status_code,
            "->",
            response.url,
        )

        if response.status_code != 200:

            print(
                "[CATALOGUE] HTTP error:",
                response.status_code,
            )

            return []

        content_type = response.headers.get(
            "content-type",
            "",
        ).lower()

        # ----------------------------------------------------
        # HTML means authentication page or another portal page
        # ----------------------------------------------------

        if "text/html" in content_type:

            print(
                "[CATALOGUE] Server returned HTML, not JSON."
            )

            if (
                "sign in" in response.text.lower()
                or "/auth/login" in response.url.lower()
            ):

                print(
                    "[CATALOGUE] Authentication is required."
                )

            return []

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        try:

            data = response.json()

        except Exception as exc:

            print(
                "[CATALOGUE] JSON parsing failed:",
                exc,
            )

            print(
                "[CATALOGUE] Response preview:"
            )

            print(
                response.text[:1000]
            )

            return []

        # ----------------------------------------------------
        # Normalize camera list
        # ----------------------------------------------------

        cameras = []

        if isinstance(data, list):

            cameras = data

        elif isinstance(data, dict):

            for key in [
                "cameras",
                "streams",
                "data",
                "results",
            ]:

                value = data.get(key)

                if isinstance(value, list):

                    cameras = value

                    break

        if not isinstance(cameras, list):

            cameras = []

        # Keep dictionaries only.
        cameras = [
            camera
            for camera in cameras
            if isinstance(camera, dict)
        ]

        catalogue_cache = cameras

        print(
            "[CATALOGUE] Cameras available:",
            len(cameras),
        )

        # ----------------------------------------------------
        # Print camera information
        # ----------------------------------------------------

        for camera in cameras[:CAMERA_LIMIT]:

            camera_id = get_camera_id(
                camera
            )

            print(
                "------------------------------------------"
            )

            print(
                "[CAMERA]",
                camera_id or "unknown",
            )

            print(
                " location:",
                camera.get(
                    "location",
                    "unknown",
                ),
            )

            print(
                " name:",
                camera.get(
                    "name",
                    "unknown",
                ),
            )

            print(
                " live:",
                camera.get(
                    "live",
                    camera.get(
                        "online",
                        "unknown",
                    ),
                ),
            )

            rtsp = get_rtsp_url(
                camera
            )

            print(
                " RTSP:",
                "FOUND" if rtsp else "NOT FOUND",
            )

        return cameras

    except requests.RequestException as exc:

        print(
            "[CATALOGUE] Request failed:",
            exc,
        )

        return []

    except Exception as exc:

        print(
            "[CATALOGUE] Failed:",
            exc,
        )

        return []


# ============================================================
# CAMERA HELPERS
# ============================================================

def get_camera_id(
    camera: Dict[str, Any]
) -> Optional[str]:

    for key in [
        "id",
        "camera_id",
        "cameraId",
        "cameraID",
        "uuid",
        "name",
    ]:

        value = camera.get(key)

        if value is not None:

            return str(value)

    return None


def get_rtsp_url(
    camera: Dict[str, Any]
) -> Optional[str]:
    """Return an RTSP or HLS stream URL for a camera."""

    possible_keys = [
        "rtsp", "rtsp_url", "rtspUrl", "rtsp_uri", "rtspUri",
        "stream_url", "streamUrl", "url", "hls", "hls_url",
        "hlsUrl", "m3u8",
    ]

    for key in possible_keys:
        value = camera.get(key)
        if isinstance(value, str):
            lower = value.lower()
            if lower.startswith("rtsp://") or ".m3u8" in lower:
                return value

    for parent_key in ["urls", "streams", "stream", "source"]:
        nested = camera.get(parent_key)
        if isinstance(nested, dict):
            for key in possible_keys:
                value = nested.get(key)
                if isinstance(value, str):
                    lower = value.lower()
                    if lower.startswith("rtsp://") or ".m3u8" in lower:
                        return value

    camera_id = get_camera_id(camera)
    if camera_id and PORTAL_BASE_URL:
        return f"{PORTAL_BASE_URL}/{camera_id}/index.m3u8"

    return None


# ============================================================
# CAMERA WORKER
# ============================================================

def camera_worker(
    camera: Dict[str, Any]
):

    global processed_frames
    global successful_detections
    global last_detections

    camera_id = get_camera_id(camera)

    stream_url = get_rtsp_url(camera)

    if not camera_id:
        print("[PIPELINE] Camera has no ID.")
        return

    if not stream_url:
        print(
            "[PIPELINE]",
            camera_id,
            "has no stream URL."
        )
        print("[PIPELINE] Skipping this camera.")
        return

    print("==========================================")
    print("[PIPELINE] Starting camera:", camera_id)
    print("==========================================")

    reconnect_delay = RECONNECT_INITIAL_SECONDS
    frame_counter = 0
    last_detection_time = 0

    while pipeline_running:

        print("[STREAM] Connecting:", camera_id)

        # ----------------------------------------------------
        # AUTHENTICATED HLS
        # ----------------------------------------------------

        cookie_header = "; ".join(
            f"{cookie.name}={cookie.value}"
            for cookie in session.cookies
        )

        user_agent = session.headers.get(
            "User-Agent",
            "Mozilla/5.0"
        )

        if ".m3u8" in stream_url.lower():

            print(
                "[HLS] Opening authenticated stream:",
                camera_id
            )

            # FFmpeg receives the same authentication information
            # that the Python requests session received after login.
            headers = (
                f"Cookie: {cookie_header}\r\n"
                f"User-Agent: {user_agent}\r\n"
                f"Referer: {PORTAL_BASE_URL}/\r\n"
            )

            import subprocess

            ffmpeg_cmd = [
                "/opt/homebrew/bin/ffmpeg",

                "-hide_banner",
                "-loglevel", "error",

                # HTTP headers required by the CCTV server.
                "-headers", headers,

                # HLS input.
                "-i", stream_url,

                # Decode video frames.
                "-f", "rawvideo",
                "-pix_fmt", "bgr24",

                # Fixed frame size so Python knows exactly
                # how many bytes make one frame.
                "-vf", "scale=640:360",

                "pipe:1",
            ]

            try:

                ffmpeg_process = subprocess.Popen(
                    ffmpeg_cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    bufsize=10**8,
                )

            except FileNotFoundError:

                print(
                    "[HLS] FFmpeg not found."
                )

                print(
                    "[HLS] Make sure this works:"
                )

                print(
                    "       ffmpeg -version"
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
                camera_id
            )

            reconnect_delay = (
                RECONNECT_INITIAL_SECONDS
            )

            connected = False

            while pipeline_running:

                raw_frame = (
                    ffmpeg_process.stdout.read(
                        frame_size
                    )
                )

                if len(raw_frame) != frame_size:

                    break

                frame = cv2.imdecode(
                    __import__("numpy").frombuffer(
                        raw_frame,
                        dtype=__import__("numpy").uint8,
                    ),
                    cv2.IMREAD_COLOR,
                )

                # The rawvideo stream is already BGR,
                # so use numpy directly instead of imdecode.
                frame = __import__("numpy").frombuffer(
                    raw_frame,
                    dtype=__import__("numpy").uint8,
                ).reshape(
                    (frame_height, frame_width, 3)
                )

                if not connected:

                    print(
                        "[STREAM] CONNECTED:",
                        camera_id
                    )

                    connected = True

                frame_counter += 1
                processed_frames += 1

                now = time.time()

                if (
                    now - last_detection_time
                    >= DETECTION_INTERVAL
                ):

                    last_detection_time = now

                    detections = run_yolo(
                        frame
                    )

                    last_detections = detections

                    if detections:

                        successful_detections += len(
                            detections
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
                                detection["class"],
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

            # Stop FFmpeg when the stream ends.
            try:
                ffmpeg_process.terminate()
                ffmpeg_process.wait(timeout=3)
            except Exception:
                try:
                    ffmpeg_process.kill()
                except Exception:
                    pass

            print(
                "[STREAM] Disconnected:",
                camera_id
            )

        else:

            # ------------------------------------------------
            # RTSP FALLBACK
            # ------------------------------------------------

            print(
                "[RTSP] Opening:",
                camera_id
            )

            os.environ[
                "OPENCV_FFMPEG_CAPTURE_OPTIONS"
            ] = "rtsp_transport;tcp"

            cap = cv2.VideoCapture(
                stream_url,
                cv2.CAP_FFMPEG,
            )

            if not cap.isOpened():

                print(
                    "[RTSP] Could not open:",
                    camera_id
                )

                cap.release()

            else:

                print(
                    "[STREAM] CONNECTED:",
                    camera_id
                )

                reconnect_delay = (
                    RECONNECT_INITIAL_SECONDS
                )

                while pipeline_running:

                    ok, frame = cap.read()

                    if not ok:

                        print(
                            "[STREAM] Frame read failed:",
                            camera_id
                        )

                        break

                    frame_counter += 1
                    processed_frames += 1

                    now = time.time()

                    if (
                        now - last_detection_time
                        >= DETECTION_INTERVAL
                    ):

                        last_detection_time = now

                        detections = run_yolo(
                            frame
                        )

                        last_detections = detections

                        if detections:

                            successful_detections += len(
                                detections
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
                                    detection["class"],
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

                cap.release()

                print(
                    "[STREAM] Disconnected:",
                    camera_id
                )

        # ----------------------------------------------------
        # RECONNECT
        # ----------------------------------------------------

        if pipeline_running:

            print(
                "[STREAM] Reconnecting in",
                reconnect_delay,
                "seconds..."
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
            "[CONFIG] Catalogue:",
            CATALOGUE_URL,
        )

        print(
            "[CONFIG] Camera limit:",
            CAMERA_LIMIT,
        )

        # ----------------------------------------------------
        # Authenticate
        # ----------------------------------------------------

        authenticated = login_to_portal()

        if not authenticated:

            print(
                "[PIPELINE] Portal authentication failed."
            )

            print(
                "[PIPELINE] Pipeline will not start."
            )

            return

        # ----------------------------------------------------
        # Fetch camera catalogue
        # ----------------------------------------------------

        cameras = fetch_catalogue()

        if not cameras:

            print(
                "[PIPELINE] No cameras received."
            )

            return

        selected_cameras = cameras[
            :CAMERA_LIMIT
        ]

        # ----------------------------------------------------
        # Start workers
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
        "catalogue": "/api/ingest",
        "health": "/health",
        "pipeline_running": pipeline_running,
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
        "pipeline_running": pipeline_running,
        "camera_count": len(
            catalogue_cache
        ),
        "yolo": (
            yolo_model is not None
        ),
        "supabase": (
            supabase is not None
        ),
        "processed_frames": processed_frames,
        "detections": successful_detections,
    }


@app.get("/api/ingest")
def api_ingest():

    return {
        "count": len(
            catalogue_cache
        ),
        "cameras": catalogue_cache,
    }


@app.get("/api/detections")
def api_detections():

    return {
        "count": len(
            last_detections
        ),
        "detections": last_detections,
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

    if (
        SENTINEL_EMAIL
        and SENTINEL_PASSWORD
    ):

        print(
            "[STARTUP] Portal credentials detected."
        )

        threading.Thread(
            target=start_pipeline,
            daemon=True,
        ).start()

    else:

        print(
            "[STARTUP] Portal credentials not configured."
        )

        print(
            "[STARTUP] Backend is running."
        )

        print(
            "[STARTUP] Live camera pipeline is disabled."
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
