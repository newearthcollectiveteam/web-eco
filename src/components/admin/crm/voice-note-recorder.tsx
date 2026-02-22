"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { createClient } from "~/lib/supabase/client";

interface VoiceNote {
  id: number;
  storagePath: string;
  publicUrl: string;
  signedUrl: string;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  mimeType: string | null;
  label: string | null;
  createdAt: Date;
  recorderName: string;
}

interface VoiceNoteRecorderProps {
  contactId: number;
  notes: VoiceNote[];
  onUpdate: () => void;
}

type RecorderState = "idle" | "recording" | "uploading";
type RecorderError = "mic_denied" | null;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceNoteRecorder({ contactId, notes, onUpdate }: VoiceNoteRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [recorderError, setRecorderError] = useState<RecorderError>(null);
  const [elapsed, setElapsed] = useState(0);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  // Ref to track elapsed time accurately for the onstop closure
  const elapsedRef = useRef(0);
  // Ref to store the playing note's known duration for progress calculation
  const knownDurationRef = useRef(0);

  const saveMutation = api.crm.saveVoiceNote.useMutation({
    onSuccess: () => {
      setState("idle");
      onUpdate();
    },
    onError: () => setState("idle"),
  });

  const deleteMutation = api.crm.deleteVoiceNote.useMutation({
    onSuccess: () => {
      setDeleteConfirm(null);
      onUpdate();
    },
  });

  // RAF loop for playback progress — uses refs so no stale closures
  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      const currentTime = audio.currentTime;
      const totalDuration = knownDurationRef.current;
      setPlaybackTime(currentTime);
      setPlaybackProgress(totalDuration > 0 ? Math.min(currentTime / totalDuration, 1) : 0);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // ─── Recording ───────────────────────────────────
  const startRecording = async () => {
    setRecorderError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        // Use ref for accurate elapsed time (state would be stale in this closure)
        void uploadRecording(blob, mimeType, elapsedRef.current);
      };

      // No timeslice — collect all data as one chunk on stop for better quality
      recorder.start();
      mediaRecorderRef.current = recorder;
      elapsedRef.current = 0;
      setElapsed(0);
      setState("recording");

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const secs = Math.round((Date.now() - startTime) / 1000);
        elapsedRef.current = secs;
        setElapsed(secs);
      }, 500);
    } catch {
      setRecorderError("mic_denied");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setState("uploading");
  };

  // ─── Upload ──────────────────────────────────────
  const uploadRecording = async (blob: Blob, mimeType: string, durationSecs: number) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const path = `${user.id}/${contactId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("voice-notes")
      .upload(path, blob, { contentType: mimeType });

    if (error) {
      setState("idle");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("voice-notes")
      .getPublicUrl(path);

    saveMutation.mutate({
      contactId,
      storagePath: path,
      publicUrl: urlData.publicUrl,
      durationSeconds: durationSecs,
      fileSizeBytes: blob.size,
      mimeType,
    });
  };

  // ─── Playback ────────────────────────────────────
  const stopPlayback = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPlayingId(null);
    setPlaybackProgress(0);
    setPlaybackTime(0);
  }, []);

  const togglePlay = (note: VoiceNote) => {
    // Pause if already playing this note
    if (playingId === note.id) {
      audioRef.current?.pause();
      stopPlayback();
      return;
    }

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
    }
    stopPlayback();

    // Store known duration for progress calculation (webm has no metadata duration)
    knownDurationRef.current = note.durationSeconds ?? 0;

    const audio = new Audio(note.signedUrl);

    audio.onended = () => {
      stopPlayback();
    };

    audio.onerror = () => {
      stopPlayback();
    };

    audio.onplay = () => {
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    audioRef.current = audio;
    setPlayingId(note.id);
    setPlaybackProgress(0);
    setPlaybackTime(0);

    audio.play().catch(() => {
      stopPlayback();
    });
  };

  // Seek on progress bar click — use knownDurationRef (webm reports Infinity for duration)
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !playingId || knownDurationRef.current <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTo = pct * knownDurationRef.current;
    audioRef.current.currentTime = seekTo;
    setPlaybackProgress(pct);
    setPlaybackTime(seekTo);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-gray-500 uppercase">
        Voice Notes
      </h3>

      {/* Recorder */}
      <div className="flex items-center gap-2">
        {state === "idle" && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-red-500/30 hover:bg-red-900/10 hover:text-red-400"
          >
            <Mic className="h-4 w-4" />
            Record
          </button>
        )}

        {state === "recording" && (
          <div className="flex items-center gap-3">
            <button
              onClick={stopRecording}
              className="flex min-h-[44px] items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop
            </button>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <span className="text-base font-medium tabular-nums text-red-400">
                {formatDuration(elapsed)}
              </span>
            </div>
          </div>
        )}

        {state === "uploading" && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        )}
      </div>

      {recorderError === "mic_denied" && (
        <p className="text-xs text-red-400">
          Microphone access denied. Please allow microphone access in your browser settings.
        </p>
      )}

      {/* Notes list */}
      {notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note) => {
            const isPlaying = playingId === note.id;
            const duration = note.durationSeconds ?? 0;

            return (
              <div
                key={note.id}
                className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePlay(note)}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isPlaying
                        ? "bg-[#facf39]/20 text-[#facf39]"
                        : "bg-white/10 text-white hover:bg-[#facf39]/20 hover:text-[#facf39]"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Progress bar */}
                    <div
                      className="group relative h-1.5 cursor-pointer rounded-full bg-white/10"
                      onClick={handleSeek}
                    >
                      <div
                        className={`h-full rounded-full ${
                          isPlaying ? "bg-[#facf39]" : "bg-white/20"
                        }`}
                        style={{ width: `${isPlaying ? playbackProgress * 100 : 0}%` }}
                      />
                    </div>

                    {/* Info row */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] tabular-nums text-gray-400">
                        {isPlaying ? formatDuration(playbackTime) : "0:00"}
                        {" / "}
                        {formatDuration(duration)}
                      </span>
                      <span className="truncate text-[10px] text-gray-600">
                        {note.recorderName}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-gray-600">
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {deleteConfirm === note.id ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate({ id: note.id })}
                        disabled={deleteMutation.isPending}
                        className="rounded px-2 py-1 text-[10px] text-red-400 hover:bg-red-900/30"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded px-2 py-1 text-[10px] text-gray-400 hover:text-white"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(note.id)}
                      className="shrink-0 rounded p-1 text-gray-500 hover:bg-white/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notes.length === 0 && state === "idle" && (
        <p className="text-xs text-gray-600">No voice notes yet</p>
      )}
    </div>
  );
}
