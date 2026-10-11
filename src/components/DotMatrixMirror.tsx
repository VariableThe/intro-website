"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";

type Mode = "ambient" | "interactive";
type Glyph = "circle" | "square" | "ring";
type Stage = "idle" | "busy" | "mirror";

interface DotMatrixMirrorProps {
  mode?: Mode;
  className?: string;
  cols?: number;
  /** Landing page: notified when the circular mirror takes over / releases, so the hero can shift. */
  onMirrorChange?: (active: boolean) => void;
}

interface Settings {
  cols: number;
  dotScale: number;
  brightness: number;
  contrast: number;
  threshold: number;
  invert: boolean;
  glyph: Glyph;
}

const DEFAULTS: Settings = {
  cols: 56,
  dotScale: 0.85,
  brightness: 1.15,
  contrast: 1.25,
  threshold: 12,
  invert: false,
  glyph: "circle",
};

const STORE_KEY = "dm-camera";

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function easeOut(v: number): number {
  const t = clamp01(v);
  return 1 - Math.pow(1 - t, 3);
}

function applyLevels(v: number, brightness: number, contrast: number, threshold: number, invert: boolean): number {
  let x = (v - 128) * contrast + 128;
  x *= brightness;
  if (x < threshold) return 0;
  if (invert) x = 255 - x;
  return Math.max(0, Math.min(255, x));
}

function fluidValue(nx: number, ny: number, t: number): number {
  // Automated drift: coordinates wander slowly so the field feels fluid even untouched
  const fx = nx + 0.055 * Math.sin(t * 0.24 + ny * 3.1) + 0.03 * Math.sin(t * 0.11 + ny * 7.3);
  const fy = ny + 0.055 * Math.cos(t * 0.2 + nx * 2.7) + 0.03 * Math.cos(t * 0.13 + nx * 6.1);
  const a = Math.sin(fx * 5.2 + t * 0.7) + Math.sin(fy * 4.1 - t * 0.55);
  const b = Math.sin((fx + fy) * 3.0 + t * 0.4);
  const c = Math.sin(Math.hypot(fx - 0.5, fy - 0.55) * 7.0 - t * 0.9);
  return 128 + (a * 30 + b * 26 + c * 38);
}

// ─── Ambient landing backdrop ────────────────────────────────────────────────
// Idle: fluid + pointer-reactive dot field. On camera start the dots collect
// into one orb on the right, hold, then bloom into a circular live mirror.

function AmbientMirror({
  cols,
  onMirrorChange,
  className,
}: {
  cols: number;
  onMirrorChange?: (active: boolean) => void;
  className: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sampleRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const visibleRef = useRef(true);
  // Reveal progress: 0 = hidden, 1 = circular mirror fully formed
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const liveRef = useRef(false);
  const stageRef = useRef<Stage>("idle");

  const [stage, setStage] = useState<Stage>("idle");
  const [note, setNote] = useState<string | null>(null);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  const setStageBoth = useCallback(
    (s: Stage) => {
      stageRef.current = s;
      setStage(s);
      onMirrorChange?.(s !== "idle");
    },
    [onMirrorChange]
  );

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    liveRef.current = false;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleCamera = useCallback(async () => {
    if (stageRef.current === "busy") return;
    if (stageRef.current === "mirror") {
      // Fade the mirror out
      targetRef.current = 0;
      setStageBoth("busy");
      window.setTimeout(stopTracks, 700);
      setNote(null);
      return;
    }
    setNote(null);
    setStageBoth("busy");

    if (!navigator.mediaDevices?.getUserMedia) {
      setStageBoth("idle");
      setNote("Camera API not available in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      try {
        window.localStorage.setItem(STORE_KEY, "granted");
      } catch {
        /* storage unavailable — mirror still works for this visit */
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play().catch(() => undefined);
        liveRef.current = true;
      }
      // Reveal only once frames are actually flowing
      targetRef.current = 1;
      if (reducedMotion) progressRef.current = 1;
    } catch {
      try {
        window.localStorage.setItem(STORE_KEY, "denied");
      } catch {
        /* ignore */
      }
      setStageBoth("idle");
      setNote("Camera blocked. Tap the button to retry.");
    }
  }, [reducedMotion, setStageBoth, stopTracks]);

  // Silent restore on revisit when permission was already granted
  useEffect(() => {
    let cancelled = false;
    try {
      if (window.localStorage.getItem(STORE_KEY) !== "granted") return;
    } catch {
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        targetRef.current = 1;
        setStageBoth("busy");
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => undefined);
          liveRef.current = true;
        }
      } catch {
        if (!cancelled) {
          targetRef.current = 0;
          setStageBoth("idle");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setStageBoth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    io.observe(canvas);
    return () => io.disconnect();
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!sampleRef.current) sampleRef.current = document.createElement("canvas");
    const sample = sampleRef.current;
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let last = performance.now();
    // Pure white in dark mode; near-black in light mode so the dots survive both.
    const themeFg = () =>
      document.documentElement.classList.contains("dark") ? "#ffffff" : "#1b1a18";
    let FG = themeFg();
    let lastFgCheck = 0;
    const step = reducedMotion ? 1 : 0;

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (!visibleRef.current) {
        last = now;
        return;
      }
      const dt = Math.min(64, now - last);
      last = now;
      if (now - lastFgCheck > 500) {
        FG = themeFg();
        lastFgCheck = now;
      }

      // Reveal progress: 0 = hidden, 1 = mirror fully formed
      const target = targetRef.current;
      let p = progressRef.current;
      if (target === 1 && p < 1) {
        p = Math.min(1, p + (step || dt / 850));
        progressRef.current = p;
        if (p >= 1 && stageRef.current !== "mirror") setStageBoth("mirror");
      } else if (target === 0 && p > 0) {
        p = Math.max(0, p - (step || dt / 600));
        progressRef.current = p;
        if (p <= 0 && stageRef.current !== "idle") setStageBoth("idle");
      }

      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      const W = Math.round(cssW * dpr);
      const H = Math.round(cssH * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      ctx.clearRect(0, 0, W, H);
      if (p <= 0) return;

      // Disk anchor: right side on wide screens, bottom-center on narrow.
      const narrow = cssW < 700;
      const cx = (narrow ? 0.5 : 0.72) * W;
      const cy = (narrow ? 0.72 : 0.48) * H;
      const R = Math.min(W, H) * (narrow ? 0.4 : 0.28);

      const reveal = easeOut(p);

      // Center-crop the video so a centered sitter lands in the disk center.
      const video = videoRef.current;
      const live = liveRef.current && video && video.readyState >= 2 && video.videoWidth > 0;
      let grid: Uint8ClampedArray | null = null;
      let SN = 0;
      if (live && video) {
        SN = Math.max(32, Math.min(80, Math.round(cols)));
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const crop = Math.min(vw, vh);
        const sx = (vw - crop) / 2;
        const sy = (vh - crop) / 2;
        sample.width = SN;
        sample.height = SN;
        sctx.save();
        sctx.scale(-1, 1); // selfie flip
        sctx.drawImage(video, sx, sy, crop, crop, -SN, 0, SN, SN);
        sctx.restore();
        grid = sctx.getImageData(0, 0, SN, SN).data;
      }
      if (!grid) return;

      // Fixed dot pitch across the disk diameter — independent of screen size.
      const across = 46;
      const s = (2 * R) / across;
      const dotR = (s / 2) * 0.72;
      ctx.fillStyle = FG;

      const n = Math.ceil(R / s);
      for (let j = -n; j <= n; j++) {
        for (let i = -n; i <= n; i++) {
          const gx = cx + i * s;
          const gy = cy + j * s;
          const distC = Math.hypot(i * s, j * s);
          if (distC > R) continue;
          // Ripple in from the center as the disk forms
          const a = clamp01(reveal * 1.7 - (distC / R) * 0.7);
          if (a <= 0) continue;

          const u = (gx - (cx - R)) / (2 * R);
          const v = (gy - (cy - R)) / (2 * R);
          const si = Math.min(SN - 1, Math.max(0, Math.floor(u * SN)));
          const sj = Math.min(SN - 1, Math.max(0, Math.floor(v * SN)));
          const k = (sj * SN + si) * 4;
          const raw = grid[k] * 0.2126 + grid[k + 1] * 0.7152 + grid[k + 2] * 0.0722;
          const lv = applyLevels(raw, 1.1, 1.2, 10, false);
          if (lv < 4) continue;
          const r = (lv / 255) * dotR * (0.35 + 0.65 * a);
          if (r < 0.4) continue;

          ctx.beginPath();
          ctx.arc(gx, gy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cols, reducedMotion, setStageBoth]);

  useEffect(() => stopTracks, [stopTracks]);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      <video ref={videoRef} className="hidden" playsInline muted aria-hidden tabIndex={-1} />
      <div className="pointer-events-auto absolute bottom-5 right-5 z-20 flex flex-col items-end gap-2">
        {note && <p className="max-w-[240px] text-right font-mono text-[11px] text-foreground/50">{note}</p>}
        <button
          onClick={handleCamera}
          aria-label={stage === "mirror" ? "Close camera mirror" : "Open camera mirror"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/25 bg-background/70 text-foreground/70 backdrop-blur transition-all hover:border-primary hover:text-primary"
        >
          <Camera size={18} />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/35">
          {stage === "mirror" ? "mirror live" : stage === "busy" ? "…" : "mirror"}
        </span>
      </div>
    </div>
  );
}

// ─── Interactive full-page mirror (unchanged behavior) ───────────────────────

function InteractiveMirror({ cols, className }: { cols: number; className: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sampleRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(true);
  const frameRef = useRef({ last: 0, count: 0 });

  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS, cols });
  const [camera, setCamera] = useState<"off" | "starting" | "live" | "denied" | "unavailable">("off");
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState<number | null>(null);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const cameraRef = useRef(camera);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamera((c) => (c === "live" || c === "starting" ? "off" : c));
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("unavailable");
      setError("Camera API not available in this browser.");
      return;
    }
    setCamera("starting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setCamera("live");
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setCamera("denied");
      setError(
        name === "NotAllowedError"
          ? "Camera blocked. Showing demo pattern — allow access and press Start to go live."
          : "Could not open camera. Showing demo pattern instead."
      );
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    io.observe(canvas);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!sampleRef.current) sampleRef.current = document.createElement("canvas");
    const sample = sampleRef.current;
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (!visibleRef.current) return;
      const s = settingsRef.current;
      const t = now / 1000;

      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      const W = Math.round(cssW * dpr);
      const H = Math.round(cssH * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      const fg = getComputedStyle(canvas).getPropertyValue("--dm-fg").trim() || "#fff";

      const colsN = Math.max(16, Math.min(120, Math.round(s.cols)));
      const aspect = cssH / cssW;
      const rowsN = Math.max(8, Math.round(colsN * aspect));
      const cell = Math.min(W / colsN, H / rowsN);
      const maxR = (cell / 2) * s.dotScale;
      const ox = (W - colsN * cell) / 2;
      const oy = (H - rowsN * cell) / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = fg;

      const video = videoRef.current;
      const live = cameraRef.current === "live" && video && video.readyState >= 2 && video.videoWidth > 0;

      let grid: Uint8ClampedArray | null = null;
      if (live) {
        sample.width = colsN;
        sample.height = rowsN;
        sctx.save();
        sctx.scale(-1, 1);
        sctx.drawImage(video, -colsN, 0, colsN, rowsN);
        sctx.restore();
        grid = sctx.getImageData(0, 0, colsN, rowsN).data;
      }

      for (let y = 0; y < rowsN; y++) {
        for (let x = 0; x < colsN; x++) {
          let raw: number;
          if (grid) {
            const i = (y * colsN + x) * 4;
            raw = grid[i] * 0.2126 + grid[i + 1] * 0.7152 + grid[i + 2] * 0.0722;
          } else {
            raw = fluidValue(x / colsN, y / rowsN, t);
          }
          const v = applyLevels(raw, s.brightness, s.contrast, s.threshold, s.invert);
          if (v < 4) continue;
          const r = (v / 255) * maxR;
          if (r < 0.4) continue;
          const cx = ox + x * cell + cell / 2;
          const cy = oy + y * cell + cell / 2;

          if (s.glyph === "square") {
            const d = r * 2;
            ctx.fillRect(cx - d / 2, cy - d / 2, d, d);
          } else if (s.glyph === "ring") {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(0.6, r), 0, Math.PI * 2);
            ctx.lineWidth = Math.max(1, r * 0.35);
            ctx.strokeStyle = fg;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const f = frameRef.current;
      f.count++;
      if (now - f.last > 1000) {
        setFps(Math.round((f.count * 1000) / (now - f.last)));
        f.last = now;
        f.count = 0;
      }
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v }));

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `dotmatrix-${Date.now()}.png`;
    a.click();
  }, []);

  const slider = "h-1 w-full cursor-pointer appearance-none bg-foreground/15 accent-primary";

  return (
    <div className={`w-full ${className}`}>
      <video ref={videoRef} className="hidden" playsInline muted aria-hidden tabIndex={-1} />

      <div className="relative w-full overflow-hidden border border-foreground/15 bg-black text-white">
        <canvas
          ref={canvasRef}
          className="block h-[320px] w-full sm:h-[420px]"
          style={{ ["--dm-fg" as string]: "#ffffff" }}
          role="img"
          aria-label={camera === "live" ? "Live dot-matrix mirror from your webcam" : "Dot-matrix demo pattern"}
        />
        <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              camera === "live" ? "bg-red-500 animate-pulse" : "bg-white/30"
            }`}
          />
          <span className="text-white/70">{camera === "live" ? `live${fps ? ` · ${fps}fps` : ""}` : "demo"}</span>
        </div>
        {camera === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-sm text-white/80">
            Opening camera…
          </div>
        )}
      </div>

      {error && <p className="mt-3 font-mono text-xs text-foreground/50">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {camera === "live" ? (
          <button
            onClick={stopCamera}
            className="border border-foreground/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground/70 transition-colors hover:border-foreground/50 hover:text-foreground"
          >
            Stop camera
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-85"
          >
            {camera === "starting" ? "Starting…" : "Start camera"}
          </button>
        )}
        <button
          onClick={snapshot}
          className="border border-foreground/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground/70 transition-colors hover:border-foreground/50 hover:text-foreground"
        >
          Save PNG
        </button>
        <div className="ml-auto flex gap-1" role="group" aria-label="Dot style">
          {(["circle", "square", "ring"] as Glyph[]).map((g) => (
            <button
              key={g}
              onClick={() => set("glyph", g)}
              aria-pressed={settings.glyph === g}
              className={`border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                settings.glyph === g
                  ? "border-primary text-primary"
                  : "border-foreground/20 text-foreground/50 hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {(
          [
            ["Density", settings.cols, 24, 96, 1, (v: number) => set("cols", Math.round(v))],
            ["Dot size", settings.dotScale, 0.2, 1, 0.05, (v: number) => set("dotScale", v)],
            ["Brightness", settings.brightness, 0.2, 2.5, 0.05, (v: number) => set("brightness", v)],
            ["Contrast", settings.contrast, 0.2, 2.5, 0.05, (v: number) => set("contrast", v)],
            ["Threshold", settings.threshold, 0, 120, 1, (v: number) => set("threshold", Math.round(v))],
          ] as const
        ).map(([label, value, min, max, step, onChange]) => (
          <label key={label} className="block">
            <span className="mb-1 flex justify-between font-mono text-[11px] uppercase tracking-widest text-foreground/50">
              <span>{label}</span>
              <span className="text-foreground/80">
                {typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}
              </span>
            </span>
            <input
              type="range"
              className={slider}
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              aria-label={label}
            />
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-foreground/50">
          <input
            type="checkbox"
            checked={settings.invert}
            onChange={(e) => set("invert", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Invert
        </label>
      </div>

      <p className="mt-4 font-mono text-[11px] leading-relaxed text-foreground/35">
        Video never leaves your browser — frames are sampled to a tiny grid and drawn as dots locally. No uploads, no
        recording.
      </p>
    </div>
  );
}

export function DotMatrixMirror({
  mode = "interactive",
  className = "",
  cols,
  onMirrorChange,
}: DotMatrixMirrorProps) {
  if (mode === "ambient") {
    return <AmbientMirror cols={cols ?? 64} onMirrorChange={onMirrorChange} className={className} />;
  }
  return <InteractiveMirror cols={cols ?? DEFAULTS.cols} className={className} />;
}
