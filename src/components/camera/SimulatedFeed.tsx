import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatedFeedProps {
  cameraId: string;
  online: boolean;
  timestamp?: string | null;
  size?: "sm" | "lg";
  className?: string;
}

export function SimulatedFeed({
  cameraId,
  online,
  timestamp,
  size = "sm",
  className,
}: SimulatedFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!online || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl =
      `http://127.0.0.1:8000/api/hls/${cameraId}/index.m3u8`;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;

      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [cameraId, online]);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-black",
        size === "sm" ? "aspect-video" : "aspect-[16/9]",
        className,
      )}
    >
      {online ? (
        <video
          ref={videoRef}
          muted
          playsInline
          controls
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <VideoOff
              className={size === "lg" ? "h-10 w-10" : "h-6 w-6"}
              strokeWidth={1.5}
            />
            <span className="text-[10px] uppercase tracking-widest">
              No signal
            </span>
          </div>
        </div>
      )}

      <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
        {online ? (
          <span className="h-1.5 w-1.5 rounded-full bg-alert" />
        ) : null}
        {online ? "LIVE" : "OFFLINE"} · {cameraId}
      </div>

      {timestamp ? (
        <div className="absolute bottom-2 right-2 z-10 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {timestamp}
        </div>
      ) : null}
    </div>
  );
}