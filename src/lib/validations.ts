import { z } from "zod";

// ─── Prediction ───────────────────────────────────────────────────────────────

export const createPredictionSchema = z.object({
  questionId: z.string().min(1),
  chosenOption: z.string().min(1),
  isRisk: z.boolean().default(false),
  useJoker: z.boolean().default(false),
  stakeAmount: z.string().optional(), // $PICKS amount as string (bigint)
  txHash: z.string().optional(), // on-chain tx hash
});

export type CreatePredictionInput = z.infer<typeof createPredictionSchema>;

// ─── Season ───────────────────────────────────────────────────────────────────

export const createSeasonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  active: z.boolean().default(false),
});

export const updateSeasonSchema = createSeasonSchema.partial().extend({
  id: z.string().min(1),
});

// ─── Episode ──────────────────────────────────────────────────────────────────

export const createEpisodeSchema = z.object({
  seasonId: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1).max(200),
  airAt: z.string().datetime(),
  lockAt: z.string().datetime(),
});

export const updateEpisodeSchema = createEpisodeSchema.partial().extend({
  id: z.string().min(1),
  status: z.enum(["DRAFT", "OPEN", "LOCKED", "RESOLVED"]).optional(),
});

// ─── Question ─────────────────────────────────────────────────────────────────

export const createQuestionSchema = z.object({
  episodeId: z.string().min(1),
  type: z.enum([
    "CHALLENGE_WINNER",
    "ELIMINATION",
    "TWIST",
    "TRIBAL_COUNCIL",
    "IMMUNITY",
    "REWARD",
    "CUSTOM",
  ]),
  prompt: z.string().min(1),
  odds: z.number().int(),
  options: z.array(z.string().min(1)).min(2),
  sortOrder: z.number().int().default(0),
});

export const updateQuestionSchema = createQuestionSchema.partial().extend({
  id: z.string().min(1),
  correctOption: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "LOCKED", "RESOLVED"]).optional(),
});

// ─── Resolve Episode ──────────────────────────────────────────────────────────

export const resolveQuestionSchema = z.object({
  questionId: z.string().min(1),
  correctOption: z.string().min(1),
});

export const resolveEpisodeSchema = z.object({
  episodeId: z.string().min(1),
  resolutions: z.array(resolveQuestionSchema).min(1),
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const leaderboardQuerySchema = z.object({
  seasonId: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  tribeFilter: z.string().optional(),
});

// ─── Social Tasks ─────────────────────────────────────────────────────────────

export const claimSocialTaskSchema = z.object({
  taskKey: z.string().min(1),
  seasonId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ClaimSocialTaskInput = z.infer<typeof claimSocialTaskSchema>;

// ─── Agent ────────────────────────────────────────────────────────────────────

export const agentEpisodeSchema = z.object({
  episodeId: z.string().min(1).max(100),
});

// ─── Referral ─────────────────────────────────────────────────────────────────

export const referralCodeSchema = z
  .string()
  .length(8)
  .regex(/^[A-Z0-9]+$/, "Invalid referral code format");

export const captureReferralSchema = z.object({
  code: referralCodeSchema,
});
