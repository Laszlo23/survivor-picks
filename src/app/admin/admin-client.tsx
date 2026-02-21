"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import {
  createSeason,
  updateSeason,
  createEpisode,
  updateEpisode,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  resolveEpisode,
  createContestant,
  updateContestant,
  eliminateContestant,
  reinstateContestant,
  deleteContestant,
  createTribe,
  deleteTribe,
} from "@/lib/actions/admin";
import { toast } from "sonner";
import {
  Plus,
  Play,
  Lock,
  CheckCircle,
  Loader2,
  Shield,
  Tv,
  HelpCircle,
  Flame,
  Users,
  UserX,
  UserCheck,
  Trash2,
  BarChart3,
  Trophy,
  Target,
  Zap,
  AlertTriangle,
  ChevronRight,
  Edit,
  Bot,
  RefreshCw,
  Search,
  Sparkles,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LIVE_SHOWS } from "@/lib/shows";

// ─── Types ───────────────────────────────────────────────────────────────────

type QuestionType =
  | "CHALLENGE_WINNER"
  | "ELIMINATION"
  | "TWIST"
  | "TRIBAL_COUNCIL"
  | "IMMUNITY"
  | "REWARD"
  | "CUSTOM";

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  odds: number;
  options: unknown;
  correctOption: string | null;
  status: string;
  sortOrder: number;
}

interface Episode {
  id: string;
  number: number;
  title: string;
  airAt: Date;
  lockAt: Date;
  status: string;
  questions: Question[];
}

interface Tribe {
  id: string;
  name: string;
  color: string;
}

interface Contestant {
  id: string;
  name: string;
  status: string;
  imageUrl: string | null;
  tribe: { id: string; name: string; color: string } | null;
}

interface Season {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  episodes: Episode[];
  tribes: Tribe[];
  contestants: Contestant[];
  _count: { episodes: number; seasonStats: number };
}

interface Stats {
  userCount: number;
  predictionCount: number;
  activeSeasons: number;
  totalPoints: number;
}

// ─── Main Admin ──────────────────────────────────────────────────────────────

export function AdminClient({
  seasons,
  stats,
}: {
  seasons: Season[];
  stats: Stats;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage seasons, episodes, questions, contestants, results
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 mb-6">
          <TabsList className="inline-flex h-auto gap-1 w-max">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="seasons" className="gap-1.5">
            <Flame className="h-3.5 w-3.5" />
            Seasons
          </TabsTrigger>
          <TabsTrigger value="episodes" className="gap-1.5">
            <Tv className="h-3.5 w-3.5" />
            Episodes
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="contestants" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Contestants
          </TabsTrigger>
          <TabsTrigger value="resolve" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Resolve
          </TabsTrigger>
          <TabsTrigger value="ai-agent" className="gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            AI Agent
          </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab stats={stats} seasons={seasons} />
        </TabsContent>
        <TabsContent value="seasons">
          <SeasonsTab seasons={seasons} />
        </TabsContent>
        <TabsContent value="episodes">
          <EpisodesTab seasons={seasons} />
        </TabsContent>
        <TabsContent value="questions">
          <QuestionsTab seasons={seasons} />
        </TabsContent>
        <TabsContent value="contestants">
          <ContestantsTab seasons={seasons} />
        </TabsContent>
        <TabsContent value="resolve">
          <ResolveTab seasons={seasons} />
        </TabsContent>
        <TabsContent value="ai-agent">
          <AIAgentTab seasons={seasons} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ stats, seasons }: { stats: Stats; seasons: Season[] }) {
  const activeSeason = seasons.find((s) => s.active);
  const unresolvedEpisodes = activeSeason?.episodes.filter(
    (e) => e.status === "LOCKED"
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-400" />}
          label="Total Players"
          value={stats.userCount.toLocaleString()}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-neon-cyan" />}
          label="Predictions Made"
          value={stats.predictionCount.toLocaleString()}
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-yellow-400" />}
          label="Total Points Awarded"
          value={stats.totalPoints.toLocaleString()}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-primary" />}
          label="Active Seasons"
          value={stats.activeSeasons.toString()}
        />
      </div>

      {/* Urgent Actions */}
      {unresolvedEpisodes && unresolvedEpisodes.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Episodes Waiting for Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unresolvedEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-center justify-between rounded-lg bg-amber-500/10 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      Ep. {ep.number}: {ep.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ep.questions.length} questions need results
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-amber-400"
                  >
                    Locked — needs resolution
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Season Quick View */}
      {activeSeason && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">
              Active: {activeSeason.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold">{activeSeason.episodes.length}</p>
                <p className="text-xs text-muted-foreground">Episodes</p>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold">
                  {activeSeason.contestants.filter((c) => c.status === "ACTIVE").length}
                  <span className="text-sm text-muted-foreground">
                    /{activeSeason.contestants.length}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">Active Contestants</p>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold">{activeSeason._count.seasonStats}</p>
                <p className="text-xs text-muted-foreground">Players</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold font-mono">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Seasons Tab ─────────────────────────────────────────────────────────────

function SeasonsTab({ seasons }: { seasons: Season[] }) {
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showSlug, setShowSlug] = useState("");
  const router = useRouter();

  const handleCreate = () => {
    startTransition(async () => {
      await createSeason({ title, description, active: false, showSlug: showSlug || undefined });
      toast.success("Season created");
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setShowSlug("");
      router.refresh();
    });
  };

  const toggleActive = (season: Season) => {
    startTransition(async () => {
      await updateSeason(season.id, { active: !season.active });
      toast.success(season.active ? "Season deactivated" : "Season activated");
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Seasons</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Season
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Season</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Reality Show 2026"
                />
              </div>
              <div>
                <Label>Show</Label>
                <Select value={showSlug} onValueChange={setShowSlug}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to a show (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIVE_SHOWS.map((show) => (
                      <SelectItem key={show.slug} value={show.slug}>
                        {show.emoji} {show.name} ({show.network})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Season description..."
                />
              </div>
              <Button onClick={handleCreate} disabled={!title || isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Season
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {seasons.map((season) => (
          <Card key={season.id} className="bg-card/50 border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{season.title}</h3>
                    {season.active && (
                      <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {season._count.episodes} episodes ·{" "}
                    {season.contestants.length} contestants ·{" "}
                    {season._count.seasonStats} players
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={season.active}
                    onCheckedChange={() => toggleActive(season)}
                  />
                  <Label className="text-sm">Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {seasons.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No seasons yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Episodes Tab ────────────────────────────────────────────────────────────

function EpisodesTab({ seasons }: { seasons: Season[] }) {
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(
    seasons.find((s) => s.active)?.id || seasons[0]?.id || ""
  );
  const [epNumber, setEpNumber] = useState(1);
  const [epTitle, setEpTitle] = useState("");
  const [airAt, setAirAt] = useState("");
  const [lockAt, setLockAt] = useState("");
  const router = useRouter();

  const activeSeason = seasons.find((s) => s.id === selectedSeason);

  const handleCreate = () => {
    startTransition(async () => {
      await createEpisode({
        seasonId: selectedSeason,
        number: epNumber,
        title: epTitle,
        airAt: new Date(airAt).toISOString(),
        lockAt: new Date(lockAt).toISOString(),
      });
      toast.success("Episode created");
      setShowCreate(false);
      setEpTitle("");
      setEpNumber((activeSeason?.episodes.length || 0) + 2);
      router.refresh();
    });
  };

  const changeStatus = (
    epId: string,
    status: "DRAFT" | "OPEN" | "LOCKED" | "RESOLVED"
  ) => {
    startTransition(async () => {
      await updateEpisode(epId, { status });
      toast.success(`Episode set to ${status.toLowerCase()}`);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {seasons.map((s) => (
          <Button
            key={s.id}
            variant={selectedSeason === s.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSeason(s.id)}
          >
            {s.title}
            {s.active && " *"}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Episodes{activeSeason ? ` — ${activeSeason.title}` : ""}
        </h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" disabled={!selectedSeason}>
              <Plus className="h-4 w-4" />
              New Episode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Episode</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Episode #</Label>
                  <Input
                    type="number"
                    value={epNumber}
                    onChange={(e) => setEpNumber(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    placeholder="Episode title"
                  />
                </div>
              </div>
              <div>
                <Label>Air Date/Time</Label>
                <Input
                  type="datetime-local"
                  value={airAt}
                  onChange={(e) => {
                    setAirAt(e.target.value);
                    if (!lockAt) setLockAt(e.target.value);
                  }}
                />
              </div>
              <div>
                <Label>Lock Time (predictions close)</Label>
                <Input
                  type="datetime-local"
                  value={lockAt}
                  onChange={(e) => setLockAt(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!epTitle || !airAt || isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Episode
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {activeSeason?.episodes.map((ep) => (
          <Card key={ep.id} className="bg-card/50 border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      #{ep.number}
                    </span>
                    <h3 className="font-medium">{ep.title}</h3>
                    <StatusChip status={ep.status as any} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Air: {new Date(ep.airAt).toLocaleString()} ·{" "}
                    {ep.questions.length} questions
                    {ep.questions.some((q) => q.correctOption) && (
                      <span className="text-neon-cyan">
                        {" "}
                        · {ep.questions.filter((q) => q.correctOption).length} resolved
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  {ep.status === "DRAFT" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(ep.id, "OPEN")}
                      disabled={isPending}
                      className="gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Open
                    </Button>
                  )}
                  {ep.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus(ep.id, "LOCKED")}
                      disabled={isPending}
                      className="gap-1"
                    >
                      <Lock className="h-3 w-3" />
                      Lock
                    </Button>
                  )}
                  {ep.status === "RESOLVED" && (
                    <Badge
                      variant="outline"
                      className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!activeSeason || activeSeason.episodes.length === 0) && (
          <p className="text-muted-foreground text-center py-8">
            No episodes yet
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Questions Tab ───────────────────────────────────────────────────────────

function QuestionsTab({ seasons }: { seasons: Season[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedSeason, setSelectedSeason] = useState(
    seasons.find((s) => s.active)?.id || seasons[0]?.id || ""
  );
  const [selectedEpisode, setSelectedEpisode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<QuestionType>("CHALLENGE_WINNER");
  const [odds, setOdds] = useState(150);
  const [optionsText, setOptionsText] = useState("");
  const router = useRouter();

  const activeSeason = seasons.find((s) => s.id === selectedSeason);
  const activeEpisode = activeSeason?.episodes.find(
    (e) => e.id === selectedEpisode
  );

  // Auto-fill options from contestants for certain question types
  const getAutoOptions = (): string => {
    if (!activeSeason) return "";
    if (
      type === "CHALLENGE_WINNER" ||
      type === "IMMUNITY" ||
      type === "ELIMINATION"
    ) {
      // Use tribe names for team-based, contestant names for individual
      const activeContestants = activeSeason.contestants
        .filter((c) => c.status === "ACTIVE")
        .map((c) => c.name);
      return activeContestants.join("\n");
    }
    if (type === "TRIBAL_COUNCIL" || type === "REWARD") {
      const tribes = activeSeason.tribes.map((t) => t.name);
      return tribes.join("\n");
    }
    return "";
  };

  const handleCreate = () => {
    if (!selectedEpisode) return;
    const options = optionsText
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);
    if (options.length < 2) {
      toast.error("Add at least 2 options (one per line)");
      return;
    }
    startTransition(async () => {
      await createQuestion({
        episodeId: selectedEpisode,
        type,
        prompt,
        odds,
        options,
      });
      toast.success("Question created");
      setShowCreate(false);
      setPrompt("");
      setOptionsText("");
      router.refresh();
    });
  };

  const handleDelete = (qId: string) => {
    startTransition(async () => {
      await deleteQuestion(qId);
      toast.success("Question deleted");
      router.refresh();
    });
  };

  const questionTypes: QuestionType[] = [
    "CHALLENGE_WINNER",
    "ELIMINATION",
    "IMMUNITY",
    "REWARD",
    "TRIBAL_COUNCIL",
    "TWIST",
    "CUSTOM",
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {seasons.map((s) => (
          <Button
            key={s.id}
            variant={selectedSeason === s.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedSeason(s.id);
              setSelectedEpisode("");
            }}
          >
            {s.title}
          </Button>
        ))}
      </div>

      {activeSeason && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {activeSeason.episodes.map((ep) => (
            <Button
              key={ep.id}
              variant={selectedEpisode === ep.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedEpisode(ep.id)}
              className="gap-1"
            >
              <span className="font-mono text-xs">#{ep.number}</span>
              {ep.title}
              {ep.questions.length > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {ep.questions.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Questions
          {activeEpisode ? ` — Ep. ${activeEpisode.number}: ${activeEpisode.title}` : ""}
        </h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" disabled={!selectedEpisode}>
              <Plus className="h-4 w-4" />
              New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Question</DialogTitle>
              <DialogDescription>
                Add a prediction question for Episode{" "}
                {activeEpisode?.number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => {
                    setType(v as QuestionType);
                    // Auto-fill options on type change
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((qt) => (
                      <SelectItem key={qt} value={qt}>
                        {qt.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Question Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    type === "CHALLENGE_WINNER"
                      ? "Which team wins the challenge?"
                      : type === "ELIMINATION"
                      ? "Who gets eliminated?"
                      : "Enter your question..."
                  }
                />
              </div>
              <div>
                <Label>Odds (American, e.g. 150 for +150)</Label>
                <Input
                  type="number"
                  value={odds}
                  onChange={(e) => setOdds(Number(e.target.value))}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Options (one per line)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={() => setOptionsText(getAutoOptions())}
                  >
                    Auto-fill from {type === "TRIBAL_COUNCIL" || type === "REWARD" ? "tribes" : "contestants"}
                  </Button>
                </div>
                <Textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder={"Team Rot\nTeam Blau"}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {optionsText.split("\n").filter((l) => l.trim()).length} options
                </p>
              </div>
              <Button
                onClick={handleCreate}
                disabled={!prompt || !optionsText || isPending}
                className="w-full"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Question
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {activeEpisode?.questions.map((q) => {
          const options = q.options as string[];
          return (
            <Card key={q.id} className="bg-card/50 border-border/50">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">
                        {q.type.replace(/_/g, " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs font-mono bg-primary/10 text-primary border-primary/20"
                      >
                        {q.odds >= 0 ? "+" : ""}{q.odds}
                      </Badge>
                      <StatusChip status={q.status as any} />
                      {q.correctOption && (
                        <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs">
                          Winner: {q.correctOption}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{q.prompt}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {options.map((opt) => (
                        <span
                          key={opt}
                          className={`text-xs rounded-full px-2 py-0.5 ${
                            q.correctOption === opt
                              ? "bg-neon-cyan/20 text-neon-cyan font-semibold"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  {q.status !== "RESOLVED" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(q.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!activeEpisode || activeEpisode.questions.length === 0) && (
          <p className="text-muted-foreground text-center py-8">
            {selectedEpisode
              ? "No questions for this episode yet"
              : "Select an episode to view/add questions"}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Contestants Tab ─────────────────────────────────────────────────────────

function ContestantsTab({ seasons }: { seasons: Season[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedSeason, setSelectedSeason] = useState(
    seasons.find((s) => s.active)?.id || seasons[0]?.id || ""
  );
  const [showAddContestant, setShowAddContestant] = useState(false);
  const [showAddTribe, setShowAddTribe] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTribeId, setNewTribeId] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [tribeName, setTribeName] = useState("");
  const [tribeColor, setTribeColor] = useState("#ef4444");
  const router = useRouter();

  const activeSeason = seasons.find((s) => s.id === selectedSeason);

  const handleAddContestant = () => {
    startTransition(async () => {
      await createContestant({
        name: newName,
        seasonId: selectedSeason,
        tribeId: newTribeId || undefined,
        imageUrl: newImageUrl || undefined,
      });
      toast.success(`${newName} added`);
      setNewName("");
      setNewTribeId("");
      setNewImageUrl("");
      setShowAddContestant(false);
      router.refresh();
    });
  };

  const handleAddTribe = () => {
    startTransition(async () => {
      await createTribe({
        name: tribeName,
        color: tribeColor,
        seasonId: selectedSeason,
      });
      toast.success(`Tribe "${tribeName}" created`);
      setTribeName("");
      setShowAddTribe(false);
      router.refresh();
    });
  };

  const handleEliminate = (contestant: Contestant) => {
    startTransition(async () => {
      await eliminateContestant(contestant.id);
      toast.success(`${contestant.name} eliminated`);
      router.refresh();
    });
  };

  const handleReinstate = (contestant: Contestant) => {
    startTransition(async () => {
      await reinstateContestant(contestant.id);
      toast.success(`${contestant.name} reinstated`);
      router.refresh();
    });
  };

  const handleChangeTribe = (contestantId: string, tribeId: string) => {
    startTransition(async () => {
      await updateContestant(contestantId, { tribeId: tribeId || null });
      toast.success("Tribe updated");
      router.refresh();
    });
  };

  const handleDeleteContestant = (contestant: Contestant) => {
    startTransition(async () => {
      await deleteContestant(contestant.id);
      toast.success(`${contestant.name} removed`);
      router.refresh();
    });
  };

  const tribes = activeSeason?.tribes || [];
  const active = activeSeason?.contestants.filter((c) => c.status === "ACTIVE") || [];
  const eliminated = activeSeason?.contestants.filter((c) => c.status === "ELIMINATED") || [];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {seasons.map((s) => (
          <Button
            key={s.id}
            variant={selectedSeason === s.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSeason(s.id)}
          >
            {s.title}
          </Button>
        ))}
      </div>

      {/* Tribes */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Tribes</h2>
        <Dialog open={showAddTribe} onOpenChange={setShowAddTribe}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Tribe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tribe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={tribeName}
                  onChange={(e) => setTribeName(e.target.value)}
                  placeholder="Team Rot"
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={tribeColor}
                    onChange={(e) => setTribeColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={tribeColor}
                    onChange={(e) => setTribeColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button onClick={handleAddTribe} disabled={!tribeName || isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Tribe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tribes.length > 0 ? (
        <div className="flex gap-3 mb-6 flex-wrap">
          {tribes.map((t) => {
            const count = activeSeason?.contestants.filter(
              (c) => c.tribe?.id === t.id && c.status === "ACTIVE"
            ).length;
            return (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-lg border px-4 py-2"
                style={{ borderColor: t.color + "50" }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span className="font-medium text-sm">{t.name}</span>
                <Badge variant="outline" className="text-xs">
                  {count} active
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          No tribes. Add tribes before adding contestants.
        </p>
      )}

      {/* Active Contestants */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">
          Active Contestants ({active.length})
        </h2>
        <Dialog open={showAddContestant} onOpenChange={setShowAddContestant}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contestant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Contestant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contestant name"
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div>
                <Label>Tribe</Label>
                <Select value={newTribeId} onValueChange={setNewTribeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tribe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tribes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: t.color }}
                          />
                          {t.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddContestant}
                disabled={!newName || isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Contestant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 mb-6">
        {active.map((c) => (
          <Card key={c.id} className="bg-card/50 border-border/50">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="h-8 w-8 rounded-full object-cover"
                    style={{
                      outline: `2px solid ${c.tribe?.color || "#888"}`,
                      outlineOffset: "1px",
                    }}
                  />
                ) : (
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: (c.tribe?.color || "#888") + "30",
                      color: c.tribe?.color || "#888",
                    }}
                  >
                    {c.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  {c.tribe && (
                    <p
                      className="text-xs"
                      style={{ color: c.tribe.color }}
                    >
                      {c.tribe.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Select
                  value={c.tribe?.id || "none"}
                  onValueChange={(v) =>
                    handleChangeTribe(c.id, v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger className="h-7 text-xs w-auto min-w-0 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No tribe</SelectItem>
                    {tribes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleEliminate(c)}
                  disabled={isPending}
                  title="Eliminate"
                >
                  <UserX className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Eliminated ({eliminated.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {eliminated.map((c) => (
              <Card key={c.id} className="bg-card/30 border-border/30 opacity-60">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-8 w-8 rounded-full object-cover grayscale opacity-50"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold text-muted-foreground line-through">
                        {c.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm line-through">
                        {c.name}
                      </p>
                      {c.tribe && (
                        <p className="text-xs text-muted-foreground">
                          {c.tribe.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-neon-cyan hover:text-cyan-300 hover:bg-neon-cyan/10"
                      onClick={() => handleReinstate(c)}
                      disabled={isPending}
                      title="Reinstate"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteContestant(c)}
                      disabled={isPending}
                      title="Delete permanently"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Resolve Tab ─────────────────────────────────────────────────────────────

function ResolveTab({ seasons }: { seasons: Season[] }) {
  const activeSeason = seasons.find((s) => s.active);
  const lockedEpisodes =
    activeSeason?.episodes.filter((e) => e.status === "LOCKED") || [];
  const resolvedEpisodes =
    activeSeason?.episodes.filter((e) => e.status === "RESOLVED") || [];

  if (!activeSeason) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No active season. Activate a season first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">
          Set Results — {activeSeason.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          Select the correct answer for each question, then resolve to score all
          predictions.
        </p>
      </div>

      {lockedEpisodes.length === 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-10 w-10 text-neon-cyan mx-auto mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No episodes waiting for results right now.
            </p>
          </CardContent>
        </Card>
      )}

      {lockedEpisodes.map((ep) => (
        <ResolveEpisodeCard key={ep.id} episode={ep} />
      ))}

      {/* Recently resolved */}
      {resolvedEpisodes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Recently Resolved
          </h3>
          <div className="space-y-2">
            {resolvedEpisodes
              .sort((a, b) => b.number - a.number)
              .slice(0, 5)
              .map((ep) => (
                <Card key={ep.id} className="bg-card/30 border-border/30">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-neon-cyan" />
                        <span className="font-mono text-sm text-muted-foreground">
                          #{ep.number}
                        </span>
                        <span className="text-sm">{ep.title}</span>
                      </div>
                      <div className="flex gap-2">
                        {ep.questions.map((q) => (
                          <Badge
                            key={q.id}
                            variant="outline"
                            className="text-xs bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                          >
                            {q.correctOption}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResolveEpisodeCard({ episode }: { episode: Episode }) {
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resolved, setResolved] = useState(false);
  const router = useRouter();

  const allAnswered = episode.questions.every((q) => answers[q.id]);

  const handleResolve = () => {
    if (!allAnswered) {
      toast.error("Set the correct answer for every question first");
      return;
    }

    startTransition(async () => {
      const resolutions = Object.entries(answers).map(
        ([questionId, correctOption]) => ({
          questionId,
          correctOption,
        })
      );
      const result = await resolveEpisode(episode.id, resolutions);
      toast.success(result.message);
      setResolved(true);
      router.refresh();
    });
  };

  if (resolved) {
    return (
      <Card className="border-neon-cyan/30 bg-neon-cyan/5">
        <CardContent className="py-6 text-center">
          <CheckCircle className="h-10 w-10 text-neon-cyan mx-auto mb-2" />
          <p className="font-semibold">
            Episode {episode.number} Resolved!
          </p>
          <p className="text-sm text-muted-foreground">
            All predictions have been scored.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Tv className="h-5 w-5 text-amber-400" />
            Episode {episode.number}: {episode.title}
          </CardTitle>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400">
            {episode.questions.filter((q) => answers[q.id]).length}/
            {episode.questions.length} answered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {episode.questions.map((q, idx) => {
          const options = q.options as string[];
          const selected = answers[q.id];

          return (
            <div key={q.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-muted-foreground">
                  Q{idx + 1}
                </span>
                <Badge variant="outline" className="text-xs capitalize">
                  {q.type.replace(/_/g, " ")}
                </Badge>
                {selected && (
                  <CheckCircle className="h-3.5 w-3.5 text-neon-cyan" />
                )}
              </div>
              <p className="text-sm font-medium mb-3">{q.prompt}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {options.map((opt) => (
                  <Button
                    key={opt}
                    variant={selected === opt ? "default" : "outline"}
                    size="sm"
                    className={`justify-start ${
                      selected === opt
                        ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                        : ""
                    }`}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                    }
                  >
                    {selected === opt && (
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                    )}
                    <span className="truncate">{opt}</span>
                  </Button>
                ))}
              </div>
            </div>
          );
        })}

        <div className="border-t border-border/30 pt-4">
          <Button
            onClick={handleResolve}
            disabled={!allAnswered || isPending}
            className="w-full gap-2"
            size="lg"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isPending
              ? "Resolving & Scoring..."
              : `Resolve Episode ${episode.number} & Score All Predictions`}
          </Button>
          {!allAnswered && (
            <p className="text-xs text-amber-400 text-center mt-2">
              Set the correct answer for all {episode.questions.length} questions
              before resolving
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── AI Agent Tab ────────────────────────────────────────────────────

interface AgentLogEntry {
  id: string;
  type: string;
  episodeId: string | null;
  input: any;
  output: any;
  confidence: number | null;
  status: string;
  createdAt: string;
}

function AIAgentTab({ seasons }: { seasons: Season[] }) {
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [generateResult, setGenerateResult] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<"controls" | "logs" | "review">("controls");
  const router = useRouter();

  // Fetch agent logs
  const loadLogs = async () => {
    try {
      const res = await fetch("/api/admin/agent-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setLogsLoaded(true);
      }
    } catch {
      toast.error("Failed to load agent logs");
    }
  };

  // Run verify
  const runVerify = async (episodeId?: string) => {
    setVerifyResult(null);
    try {
      const url = episodeId
        ? "/api/agent/verify"
        : "/api/agent/verify";

      const options: RequestInit = episodeId
        ? {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-agent-key": "admin-trigger",
            },
            body: JSON.stringify({ episodeId }),
          }
        : {
            method: "GET",
            headers: { "x-agent-key": "admin-trigger" },
          };

      const res = await fetch(url, options);
      const data = await res.json();
      setVerifyResult(data);

      if (data.ok) {
        toast.success(`Verification complete: ${data.processed ?? 1} episode(s) processed`);
        router.refresh();
        loadLogs();
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    }
  };

  // Run generate
  const runGenerate = async (episodeId?: string) => {
    setGenerateResult(null);
    try {
      const options: RequestInit = episodeId
        ? {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-agent-key": "admin-trigger",
            },
            body: JSON.stringify({ episodeId }),
          }
        : {
            method: "GET",
            headers: { "x-agent-key": "admin-trigger" },
          };

      const res = await fetch(
        episodeId ? "/api/agent/generate" : "/api/agent/generate",
        options
      );
      const data = await res.json();
      setGenerateResult(data);

      if (data.ok) {
        toast.success(`Generation complete: ${data.processed ?? data.questions?.length ?? 0} item(s)`);
        router.refresh();
        loadLogs();
      } else {
        toast.error(data.error || "Generation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Generation failed");
    }
  };

  // Get episodes
  const activeSeason = seasons.find((s) => s.active);
  const lockedEpisodes = activeSeason?.episodes.filter((e) => e.status === "LOCKED") || [];
  const draftEpisodes = activeSeason?.episodes.filter((e) => e.status === "DRAFT") || [];
  const draftQuestions = activeSeason?.episodes
    .flatMap((e) => e.questions.filter((q) => q.status === "DRAFT"))
    || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-violet-950/50 to-indigo-950/50 border-violet-800/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Bot className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-violet-100">AI Agent</h2>
              <p className="text-sm text-violet-300">
                Automatic result verification and question generation
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-violet-400 mb-1">Locked Eps</p>
              <p className="text-xl font-bold text-white">{lockedEpisodes.length}</p>
              <p className="text-xs text-muted-foreground">awaiting verify</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-violet-400 mb-1">Draft Eps</p>
              <p className="text-xl font-bold text-white">{draftEpisodes.length}</p>
              <p className="text-xs text-muted-foreground">need questions</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-violet-400 mb-1">Draft Q&apos;s</p>
              <p className="text-xl font-bold text-white">{draftQuestions.length}</p>
              <p className="text-xs text-muted-foreground">in review</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-violet-400 mb-1">Agent Runs</p>
              <p className="text-xl font-bold text-white">{logsLoaded ? logs.length : "—"}</p>
              <p className="text-xs text-muted-foreground">
                {!logsLoaded ? (
                  <button onClick={loadLogs} className="text-violet-400 underline">
                    load
                  </button>
                ) : (
                  "total"
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2 overflow-x-auto">
        {(["controls", "review", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveSubTab(tab);
              if (tab === "logs" && !logsLoaded) loadLogs();
            }}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeSubTab === tab
                ? "bg-violet-500/20 text-violet-300 border-b-2 border-violet-500"
                : "text-muted-foreground hover:text-violet-300"
            }`}
          >
            {tab === "controls" && <><Sparkles className="h-3.5 w-3.5 inline mr-1.5" />Run Agent</>}
            {tab === "review" && <><Eye className="h-3.5 w-3.5 inline mr-1.5" />Review Queue</>}
            {tab === "logs" && <><Clock className="h-3.5 w-3.5 inline mr-1.5" />Activity Log</>}
          </button>
        ))}
      </div>

      {/* Controls Sub-tab */}
      {activeSubTab === "controls" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verify Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-blue-400" />
                Result Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Search the web for aired episode results and auto-resolve predictions
                when confidence is 90%+.
              </p>

              {/* All pending */}
              <Button
                onClick={() => startTransition(() => runVerify())}
                disabled={isPending || lockedEpisodes.length === 0}
                className="w-full gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Verify All Locked Episodes ({lockedEpisodes.length})
              </Button>

              {/* Per-episode */}
              {lockedEpisodes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Or verify individually:</p>
                  {lockedEpisodes.map((ep) => (
                    <Button
                      key={ep.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => startTransition(() => runVerify(ep.id))}
                      disabled={isPending}
                    >
                      <span>Episode {ep.number}: {ep.title}</span>
                      <Search className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              )}

              {/* Result */}
              {verifyResult && (
                <div className={`rounded-lg p-3 text-sm ${
                  verifyResult.ok ? "bg-cyan-950/30 border border-cyan-800/40" : "bg-red-950/30 border border-red-800/40"
                }`}>
                  {verifyResult.ok ? (
                    <div className="space-y-2">
                      <p className="font-medium text-neon-cyan">Verification Complete</p>
                      {(verifyResult.results || [verifyResult]).map((r: any, i: number) => (
                        <div key={i} className="text-xs text-cyan-300">
                          <span className="font-medium">{r.episodeTitle || "Episode"}</span>:{" "}
                          <Badge variant={
                            r.status === "auto_resolved" ? "default" :
                            r.status === "needs_review" ? "secondary" : "outline"
                          } className="text-[10px] h-4">
                            {r.status}
                          </Badge>{" "}
                          {r.averageConfidence != null && (
                            <span>({(r.averageConfidence * 100).toFixed(0)}% confidence)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-400">{verifyResult.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Question Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Search for upcoming episode trends and generate prediction questions.
                Generated questions go to DRAFT status for your review.
              </p>

              {/* All drafts */}
              <Button
                onClick={() => startTransition(() => runGenerate())}
                disabled={isPending || draftEpisodes.length === 0}
                className="w-full gap-2"
                variant="secondary"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate for All Draft Episodes ({draftEpisodes.length})
              </Button>

              {/* Per-episode */}
              {draftEpisodes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Or generate individually:</p>
                  {draftEpisodes.map((ep) => (
                    <Button
                      key={ep.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => startTransition(() => runGenerate(ep.id))}
                      disabled={isPending}
                    >
                      <span>Episode {ep.number}: {ep.title}</span>
                      <Sparkles className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              )}

              {/* Result */}
              {generateResult && (
                <div className={`rounded-lg p-3 text-sm ${
                  generateResult.ok ? "bg-amber-950/30 border border-amber-800/40" : "bg-red-950/30 border border-red-800/40"
                }`}>
                  {generateResult.ok ? (
                    <div className="space-y-2">
                      <p className="font-medium text-amber-400">Generation Complete</p>
                      {(generateResult.results || [generateResult]).map((r: any, i: number) => (
                        <div key={i} className="text-xs text-amber-300">
                          <span className="font-medium">{r.episodeTitle || "Episode"}</span>:{" "}
                          {r.questionCount || r.questions?.length || 0} questions generated
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-400">{generateResult.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Queue Sub-tab */}
      {activeSubTab === "review" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Draft Questions — Review Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {draftQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No draft questions to review.</p>
                <p className="text-sm mt-1">
                  Run the question generator to populate this queue.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSeason?.episodes
                  .filter((e) => e.questions.some((q) => q.status === "DRAFT"))
                  .map((ep) => (
                    <div key={ep.id} className="border border-border/50 rounded-lg p-4">
                      <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Tv className="h-3.5 w-3.5 text-violet-400" />
                        Episode {ep.number}: {ep.title}
                      </h3>
                      <div className="space-y-2">
                        {ep.questions
                          .filter((q) => q.status === "DRAFT")
                          .map((q) => (
                            <div
                              key={q.id}
                              className="flex items-start justify-between gap-3 bg-black/20 rounded-lg p-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{q.prompt}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  <Badge variant="outline" className="text-[10px] h-4">
                                    {q.type}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px] h-4">
                                    {q.odds > 0 ? "+" : ""}{q.odds}
                                  </Badge>
                                  {(Array.isArray(q.options) ? q.options as string[] : []).map((opt, i) => (
                                    <Badge key={i} variant="outline" className="text-[10px] h-4 text-muted-foreground">
                                      {opt}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-neon-cyan hover:text-cyan-300 hover:bg-cyan-950/30"
                                  onClick={async () => {
                                    try {
                                      await updateQuestion(q.id, { status: "OPEN" });
                                      toast.success("Question approved");
                                      router.refresh();
                                    } catch {
                                      toast.error("Failed to approve");
                                    }
                                  }}
                                  title="Approve"
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                  onClick={async () => {
                                    try {
                                      await deleteQuestion(q.id);
                                      toast.success("Question rejected");
                                      router.refresh();
                                    } catch {
                                      toast.error("Failed to delete");
                                    }
                                  }}
                                  title="Reject"
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Log Sub-tab */}
      {activeSubTab === "logs" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Agent Activity Log
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLogs}
              className="gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {!logsLoaded ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No agent activity yet.</p>
                <p className="text-sm mt-1">
                  Run the verification or generation agent to see logs here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-border/30"
                  >
                    <div className={`mt-0.5 p-1.5 rounded-md ${
                      log.type === "verify" ? "bg-blue-500/20" : "bg-amber-500/20"
                    }`}>
                      {log.type === "verify" ? (
                        <Search className="h-3.5 w-3.5 text-blue-400" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">{log.type}</span>
                        <Badge
                          variant={
                            log.status === "success" ? "default" :
                            log.status === "needs_review" ? "secondary" :
                            "destructive"
                          }
                          className="text-[10px] h-4"
                        >
                          {log.status}
                        </Badge>
                        {log.confidence != null && (
                          <span className="text-xs text-muted-foreground">
                            {(log.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.output?.message || log.output?.episodeTitle || "No details"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                        {log.input?.manual && " (manual)"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
