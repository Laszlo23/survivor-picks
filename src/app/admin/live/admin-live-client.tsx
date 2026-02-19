"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  Plus,
  Tv,
  Zap,
  Shield,
  AlertTriangle,
  RefreshCw,
  Clock,
  Eye,
  Target,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SessionData {
  id: string;
  episodeId: string;
  streamUrl: string;
  streamType: string;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  viewerCount: number;
  createdAt: string;
  episode: {
    number: number;
    title: string;
    season: { title: string; showSlug: string | null };
  };
  _count: { bets: number };
}

interface EpisodeData {
  id: string;
  number: number;
  title: string;
  season: { title: string; showSlug: string | null };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminLiveClient({
  sessions: initialSessions,
  episodes,
}: {
  sessions: SessionData[];
  episodes: EpisodeData[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [showCreate, setShowCreate] = useState(false);
  const [showManualBet, setShowManualBet] = useState<string | null>(null);

  // Create form state
  const [newEpisodeId, setNewEpisodeId] = useState(episodes[0]?.id || "");
  const [newStreamUrl, setNewStreamUrl] = useState("");
  const [newStreamType, setNewStreamType] = useState("youtube");

  // Manual bet form state
  const [betPrompt, setBetPrompt] = useState("");
  const [betOptions, setBetOptions] = useState("Yes,No");
  const [betCategory, setBetCategory] = useState("prop");
  const [betWindow, setBetWindow] = useState("120");
  const [betMultiplier, setBetMultiplier] = useState("1");

  const [loading, setLoading] = useState(false);

  // ─── Session actions ──────────────────────────────────────────

  const sessionAction = useCallback(
    async (action: string, sessionId?: string, extra?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const res = await fetch("/api/live/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, sessionId, ...extra }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed");
        }
        toast.success(`Session ${action} successful`);
        window.location.reload();
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreate = async () => {
    if (!newEpisodeId || !newStreamUrl) {
      toast.error("Episode and stream URL are required");
      return;
    }
    await sessionAction("create", undefined, {
      episodeId: newEpisodeId,
      streamUrl: newStreamUrl,
      streamType: newStreamType,
    });
  };

  // ─── Manual bet creation ──────────────────────────────────────

  const handleCreateBet = async (sessionId: string) => {
    if (!betPrompt || !betOptions) {
      toast.error("Prompt and options are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/live/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          sessionId,
          prompt: betPrompt,
          category: betCategory,
          options: betOptions.split(",").map((o) => o.trim()),
          windowSeconds: parseInt(betWindow) || 120,
          multiplier: parseFloat(betMultiplier) || 1,
        }),
      });
      if (!res.ok) throw new Error("Failed to create bet");
      toast.success("Live bet created!");
      setBetPrompt("");
      setShowManualBet(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Trigger AI analysis ──────────────────────────────────────

  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/live/analyze");
      const data = await res.json();
      toast.success(
        `Analysis complete: ${data.results?.reduce(
          (s: number, r: any) => s + r.betsCreated,
          0
        ) || 0} bets created`
      );
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Emergency stop ───────────────────────────────────────────

  const emergencyStop = async () => {
    if (
      !confirm(
        "EMERGENCY STOP: This will end all live sessions and cancel all open bets. Continue?"
      )
    )
      return;

    const liveSessions = sessions.filter((s) => s.status === "live");
    for (const s of liveSessions) {
      await sessionAction("end", s.id);
    }
  };

  // ─── Status badge ─────────────────────────────────────────────

  const statusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string }> = {
      scheduled: { bg: "bg-blue-500/10", text: "text-blue-400" },
      live: { bg: "bg-red-500/10", text: "text-red-400" },
      paused: { bg: "bg-amber-500/10", text: "text-amber-400" },
      ended: { bg: "bg-white/5", text: "text-white/30" },
    };
    const cfg = configs[status] || configs.ended;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text}`}
      >
        {status === "live" && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
          </span>
        )}
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">
            Live Betting Control
          </h1>
          <p className="text-xs text-white/30 mt-0.5">
            Manage live sessions, AI analysis, and bets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerAnalysis}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-cyan/10 text-neon-cyan text-xs font-bold hover:bg-neon-cyan/20 transition disabled:opacity-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Run AI Analysis
          </button>
          <button
            onClick={emergencyStop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Emergency Stop
          </button>
        </div>
      </div>

      {/* ── Create session ────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition"
        >
          <Plus className="h-4 w-4" />
          New Live Session
        </button>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={newEpisodeId}
                  onChange={(e) => setNewEpisodeId(e.target.value)}
                  className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                >
                  {episodes.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.season.title} — Ep {ep.number}: {ep.title}
                    </option>
                  ))}
                </select>

                <input
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                  placeholder="Stream URL (YouTube, Twitch, etc.)"
                  className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                />

                <div className="flex gap-2">
                  <select
                    value={newStreamType}
                    onChange={(e) => setNewStreamType(e.target.value)}
                    className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="twitch">Twitch</option>
                    <option value="custom">Custom</option>
                  </select>

                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan text-sm font-bold hover:bg-neon-cyan/30 transition disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sessions list ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Tv className="h-10 w-10 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/20">No live sessions yet</p>
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
            >
              {/* Session header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusBadge(s.status)}
                  <div>
                    <p className="text-sm font-bold text-white/80">
                      {s.episode.season.title} — Ep {s.episode.number}:{" "}
                      {s.episode.title}
                    </p>
                    <p className="text-[10px] text-white/30 truncate max-w-[250px]">
                      {s.streamUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Target className="h-3 w-3" />
                  {s._count.bets} bets
                </div>
              </div>

              {/* Session actions */}
              <div className="flex items-center gap-2">
                {s.status === "scheduled" && (
                  <button
                    onClick={() => sessionAction("start", s.id)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition disabled:opacity-50"
                  >
                    <Play className="h-3 w-3" />
                    Go Live
                  </button>
                )}

                {s.status === "live" && (
                  <>
                    <button
                      onClick={() => sessionAction("pause", s.id)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition disabled:opacity-50"
                    >
                      <Pause className="h-3 w-3" />
                      Pause
                    </button>
                    <button
                      onClick={() => sessionAction("end", s.id)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      <Square className="h-3 w-3" />
                      End
                    </button>
                    <button
                      onClick={() =>
                        setShowManualBet(
                          showManualBet === s.id ? null : s.id
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-gold/10 text-neon-gold text-xs font-bold hover:bg-neon-gold/20 transition"
                    >
                      <Zap className="h-3 w-3" />
                      Create Bet
                    </button>
                  </>
                )}

                {s.status === "paused" && (
                  <button
                    onClick={() => sessionAction("start", s.id)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition disabled:opacity-50"
                  >
                    <Play className="h-3 w-3" />
                    Resume
                  </button>
                )}

                <a
                  href={`/live/${s.id}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/40 text-xs font-bold hover:bg-white/[0.08] transition"
                >
                  <Eye className="h-3 w-3" />
                  View
                </a>
              </div>

              {/* Manual bet form */}
              <AnimatePresence>
                {showManualBet === s.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-2">
                      <input
                        value={betPrompt}
                        onChange={(e) => setBetPrompt(e.target.value)}
                        placeholder="Bet prompt (e.g. 'Will Jeff say blindside?')"
                        className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input
                          value={betOptions}
                          onChange={(e) => setBetOptions(e.target.value)}
                          placeholder="Options (comma-sep)"
                          className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                        />
                        <select
                          value={betCategory}
                          onChange={(e) => setBetCategory(e.target.value)}
                          className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                        >
                          <option value="flash">Flash (30-60s)</option>
                          <option value="challenge">Challenge (2-5m)</option>
                          <option value="elimination">Elimination</option>
                          <option value="drama">Drama/Prop</option>
                          <option value="prop">Prop Bet</option>
                        </select>
                        <input
                          value={betWindow}
                          onChange={(e) => setBetWindow(e.target.value)}
                          placeholder="Window (seconds)"
                          type="number"
                          className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                        />
                        <input
                          value={betMultiplier}
                          onChange={(e) => setBetMultiplier(e.target.value)}
                          placeholder="Multiplier"
                          type="number"
                          step="0.5"
                          className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleCreateBet(s.id)}
                        disabled={loading}
                        className="w-full py-2 rounded-lg bg-neon-gold/20 text-neon-gold text-sm font-bold hover:bg-neon-gold/30 transition disabled:opacity-50"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Zap className="h-4 w-4" />
                          Push Live Bet
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
