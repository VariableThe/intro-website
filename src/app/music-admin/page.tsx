"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  AlertTriangle,
  HardDrive,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LibraryStatus {
  exists: boolean;
  lastModified?: string;
  sizeBytes?: number;
  trackCount?: number;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MusicAdminPage() {
  const [secret, setSecret] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current library status on load
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/music-upload");
        if (res.ok) {
          const data = await res.json();
          setLibraryStatus(data);
        }
      } catch {
        // silently fail — status is informational
      } finally {
        setStatusLoading(false);
      }
    }
    fetchStatus();
  }, []);

  // ── Drag-and-drop handlers ─────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".xml")) {
      setFile(dropped);
      setUploadState({ status: "idle" });
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setUploadState({ status: "idle" });
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setUploadState({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Upload handler ─────────────────────────────────────────────────────────

  const handleUpload = useCallback(async () => {
    if (!file || !secret.trim()) return;

    setUploadState({ status: "uploading", progress: 0 });

    const formData = new FormData();
    formData.append("library", file);

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadState({ status: "uploading", progress: pct });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadState({ status: "success" });
      } else {
        let message = `Server error (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.error) message = body.error;
        } catch {
          // use default message
        }
        setUploadState({ status: "error", message });
      }
    });

    xhr.addEventListener("error", () => {
      setUploadState({
        status: "error",
        message: "Network error — check your connection and try again.",
      });
    });

    xhr.open("POST", "/api/music-upload");
    xhr.setRequestHeader("Authorization", `Bearer ${secret.trim()}`);
    xhr.send(formData);
  }, [file, secret]);

  const canUpload =
    file !== null &&
    secret.trim().length > 0 &&
    uploadState.status !== "uploading" &&
    uploadState.status !== "success";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen font-mono"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        {/* Page header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs tracking-widest uppercase mb-4">
            <Lock className="w-3 h-3" />
            <span>Admin</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Music Library Upload
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload an Apple Music XML export to re-parse the music library.
          </p>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-3 px-4 py-3 border border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-sm text-yellow-200/80 leading-relaxed">
            Uploading a new file will{" "}
            <span className="text-yellow-400 font-semibold">completely replace</span> the current
            library. All existing parsed data will be overwritten. Make sure you&apos;re uploading
            the correct export.
          </p>
        </div>

        {/* Current library status */}
        <div
          className="border p-5 space-y-3"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HardDrive className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            Current Library Status
          </div>

          {statusLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking…
            </div>
          ) : libraryStatus?.exists ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {libraryStatus.lastModified && (
                <>
                  <dt className="text-muted-foreground">Last modified</dt>
                  <dd className="text-foreground">{formatDate(libraryStatus.lastModified)}</dd>
                </>
              )}
              {libraryStatus.sizeBytes !== undefined && (
                <>
                  <dt className="text-muted-foreground">File size</dt>
                  <dd className="text-foreground">{formatBytes(libraryStatus.sizeBytes)}</dd>
                </>
              )}
              {libraryStatus.trackCount !== undefined && (
                <>
                  <dt className="text-muted-foreground">Tracks</dt>
                  <dd className="text-foreground">{libraryStatus.trackCount.toLocaleString()}</dd>
                </>
              )}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              No library file found. Upload one to get started.
            </p>
          )}
        </div>

        {/* Admin secret input */}
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground tracking-widest uppercase">
            Admin Secret
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50"
              strokeWidth={1.5}
            />
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter admin secret"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Drag-and-drop zone */}
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground tracking-widest uppercase">
            Library XML File
          </label>

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 px-4 py-4 border border-primary/40 bg-primary/5"
              >
                <FileText className="w-8 h-8 text-primary shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={clearFile}
                  className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="drop-zone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer"
              >
                <motion.div
                  animate={
                    isDragging
                      ? { borderColor: "var(--primary)", backgroundColor: "oklch(0.536 0.207 25.437 / 0.08)" }
                      : { borderColor: "var(--border)", backgroundColor: "transparent" }
                  }
                  transition={{ duration: 0.15 }}
                  className="border-2 border-dashed px-8 py-12 text-center space-y-3"
                >
                  <div className="flex justify-center">
                    <motion.div
                      animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-12 h-12 flex items-center justify-center bg-muted"
                    >
                      <Upload
                        className={`w-5 h-5 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`}
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      Drop your <span className="text-primary font-semibold">.xml</span> file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 tracking-wider uppercase">
                    Apple Music XML exports only
                  </p>
                </motion.div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xml,application/xml,text/xml"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  tabIndex={-1}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upload button + state feedback */}
        <div className="space-y-4">
          <button
            onClick={handleUpload}
            disabled={!canUpload}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.99] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {uploadState.status === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                Upload &amp; Re-parse Library
              </>
            )}
          </button>

          {/* Progress bar */}
          <AnimatePresence>
            {uploadState.status === "uploading" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <div className="h-1.5 w-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadState.progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground tabular-nums text-right">
                  {uploadState.progress}%
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence>
            {uploadState.status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 px-5 py-4 border border-green-500/30 bg-green-500/5"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 text-green-400 shrink-0 mt-0.5"
                    strokeWidth={1.5}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-green-300">Re-parse complete</p>
                    <p className="text-xs text-muted-foreground">
                      The library has been updated. Visit the music dashboard to see changes —
                      cached data may take up to 20 minutes to refresh.
                    </p>
                  </div>
                </div>
                <Link
                  href="/music"
                  className="inline-flex items-center gap-2 self-start px-4 py-2 text-xs font-semibold border border-green-500/40 text-green-300 hover:bg-green-500/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Visit /music
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {uploadState.status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 px-5 py-4 border border-red-500/30 bg-red-500/5"
              >
                <AlertCircle
                  className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-300">Upload failed</p>
                  <p className="text-xs text-muted-foreground">{uploadState.message}</p>
                </div>
                <button
                  onClick={() => setUploadState({ status: "idle" })}
                  className="ml-auto shrink-0 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="pt-4 border-t border-border">
          <Link
            href="/music"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            Go to music dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
