"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BetSuggestion {
  prompt: string;
  category: "elimination" | "challenge" | "drama" | "flash" | "prop";
  options: string[];
  suggestedOdds: Record<string, number>;
  windowSeconds: number;
  multiplier: number;
  confidence: number;
}

export interface BetResolution {
  betId: string;
  correctOption: string;
  confidence: number;
  reasoning: string;
}

export interface AnalysisResult {
  sceneDescription: string;
  detectedEvents: string[];
  betSuggestions: BetSuggestion[];
  betResolutions: BetResolution[];
  showMoment: string; // "challenge" | "tribal" | "social" | "commercial" | "unknown"
}

interface ActivBet {
  id: string;
  prompt: string;
  options: string[];
  category: string;
}

interface ShowContext {
  showTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  contestants: string[];
  tribes?: string[];
  activeBets: ActivBet[];
}

// ─── Gemini client ───────────────────────────────────────────────────────────

function getGemini() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

// ─── Analysis response schema (JSON mode) ────────────────────────────────────

const analysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    sceneDescription: {
      type: SchemaType.STRING,
      description: "Brief description of what is happening in this frame",
    },
    detectedEvents: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of notable events detected (elimination, challenge win, argument, etc.)",
    },
    betSuggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          prompt: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          suggestedOdds: { type: SchemaType.OBJECT },
          windowSeconds: { type: SchemaType.NUMBER },
          multiplier: { type: SchemaType.NUMBER },
          confidence: { type: SchemaType.NUMBER },
        },
        required: ["prompt", "category", "options", "windowSeconds", "confidence"],
      },
    },
    betResolutions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          betId: { type: SchemaType.STRING },
          correctOption: { type: SchemaType.STRING },
          confidence: { type: SchemaType.NUMBER },
          reasoning: { type: SchemaType.STRING },
        },
        required: ["betId", "correctOption", "confidence", "reasoning"],
      },
    },
    showMoment: { type: SchemaType.STRING },
  },
  required: ["sceneDescription", "detectedEvents", "betSuggestions", "betResolutions", "showMoment"],
};

// ─── Build prompt ────────────────────────────────────────────────────────────

function buildPrompt(ctx: ShowContext): string {
  return `You are an AI analyst for a live reality TV prediction betting app called RealityPicks.

SHOW CONTEXT:
- Show: ${ctx.showTitle}
- Episode ${ctx.episodeNumber}: "${ctx.episodeTitle}"
- Active contestants: ${ctx.contestants.join(", ")}
${ctx.tribes?.length ? `- Tribes: ${ctx.tribes.join(", ")}` : ""}

CURRENTLY ACTIVE BETS (you can resolve these if you see the outcome):
${ctx.activeBets.length > 0 ? ctx.activeBets.map((b) => `  [${b.id}] "${b.prompt}" — options: ${b.options.join(", ")} (category: ${b.category})`).join("\n") : "  (no active bets)"}

INSTRUCTIONS:
1. Analyze the video frame and describe what you see happening.
2. Detect any notable events (elimination, challenge completion, tribal council vote, dramatic moment, argument, alliance discussion, etc.)
3. Suggest NEW bets that would be exciting for viewers. Focus on:
   - Flash bets (30-60s window, 3-5x multiplier): Quick, fun micro-bets ("Will someone cry?" "Will Jeff say 'blindside'?")
   - Challenge bets (120-300s): Who will win a physical/puzzle challenge
   - Elimination bets (300-600s): Who goes home tonight
   - Drama/Prop bets (60-180s): Social dynamics, alliances, arguments
4. For each active bet, determine if you can resolve it based on what you see.

IMPORTANT:
- Only suggest bets with confidence > 0.6
- Only resolve bets with confidence > 0.7
- Keep bet prompts short, exciting, and TV-style
- Each bet must have 2-6 options
- suggestedOdds should be a mapping of option → decimal odds (e.g. {"Yes": 1.8, "No": 2.2})
- Multiplier for flash bets: 3-5, challenge: 2, elimination: 1.5, drama: 2-4
- If you see a commercial break or nothing happening, return empty suggestions`;
}

// ─── Main analysis function ──────────────────────────────────────────────────

export async function analyzeFrame(
  frameBase64: string,
  mimeType: string,
  context: ShowContext
): Promise<AnalysisResult> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema as any,
      temperature: 0.3,
    },
  });

  const prompt = buildPrompt(context);

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: frameBase64,
      },
    },
  ]);

  const text = result.response.text();
  const parsed = JSON.parse(text) as AnalysisResult;

  return parsed;
}

// ─── Lightweight scene check (cheaper, for high-frequency polling) ────────────

export async function quickSceneCheck(
  frameBase64: string,
  mimeType: string
): Promise<{ moment: string; hasAction: boolean }> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          moment: { type: SchemaType.STRING },
          hasAction: { type: SchemaType.BOOLEAN },
        },
        required: ["moment", "hasAction"],
      } as any,
      temperature: 0.1,
    },
  });

  const result = await model.generateContent([
    {
      text: 'Classify this TV frame. Return moment type (challenge/tribal/social/commercial/intro/unknown) and whether there is active action happening (hasAction: true if gameplay, vote, challenge in progress).',
    },
    { inlineData: { mimeType, data: frameBase64 } },
  ]);

  return JSON.parse(result.response.text());
}
