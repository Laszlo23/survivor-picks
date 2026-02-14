/**
 * Show Configuration System
 *
 * Defines each TV show's structure, terminology, question patterns,
 * and search hints so the AI agent can verify results and generate
 * questions for any reality competition show.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface QuestionTemplate {
  type: string; // maps to QuestionType enum
  promptTemplate: string; // e.g. "Who wins the {terminology.immunity} in Episode {episode}?"
  optionsSource: "contestants" | "tribes" | "yesno" | "custom";
  customOptions?: string[];
  defaultOdds: number;
  /** Only generate for these episode tags (if set) */
  episodeTags?: string[];
}

export interface ShowConfig {
  slug: string;
  name: string;
  network: string;
  country: string;
  /** Search terms for web queries (most specific first) */
  searchTerms: string[];
  /** Wikipedia article name pattern: {season} is replaced */
  wikiPattern: string;
  /** Show-specific terminology */
  terminology: Record<string, string>;
  /** Question templates the agent uses to generate predictions */
  questionTemplates: QuestionTemplate[];
  /** Tags for special episode types */
  episodeTags: Record<string, string[]>; // e.g. { premiere: ["1"], merge: ["7","8"], finale: ["last"] }
  /** Helpful context for the LLM */
  rulesContext: string;
}

// ─── Survivor 2026 (Turkey) ──────────────────────────────────────────

export const SURVIVOR_2026: ShowConfig = {
  slug: "survivor-2026",
  name: "Survivor 2026 — Island of Competition",
  network: "TV8",
  country: "Turkey",
  searchTerms: [
    "Survivor 2026 Turkey results",
    "Survivor 2026 Ada Yarismasi",
    "Survivor 2026 elimination",
    "Survivor 2026 episode recap",
  ],
  wikiPattern: "Survivor_2026_(Turkish_TV_series)",
  terminology: {
    elimination: "tribal council elimination",
    immunity: "immunity challenge",
    reward: "reward challenge",
    tribe: "tribe",
    merge: "merge",
    idol: "hidden immunity idol",
    council: "tribal council",
  },
  questionTemplates: [
    {
      type: "IMMUNITY",
      promptTemplate: "Which tribe wins immunity in Episode {episode}?",
      optionsSource: "tribes",
      defaultOdds: -110,
    },
    {
      type: "ELIMINATION",
      promptTemplate: "Who gets eliminated in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 350,
    },
    {
      type: "CHALLENGE_WINNER",
      promptTemplate: "Which tribe wins the challenge in Episode {episode}?",
      optionsSource: "tribes",
      defaultOdds: 100,
    },
    {
      type: "REWARD",
      promptTemplate: "Which tribe wins the reward challenge in Episode {episode}?",
      optionsSource: "tribes",
      defaultOdds: 100,
    },
    {
      type: "TWIST",
      promptTemplate: "Does someone play a hidden immunity idol in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: 200,
    },
    {
      type: "TRIBAL_COUNCIL",
      promptTemplate:
        "How many votes does the eliminated person receive in Episode {episode}?",
      optionsSource: "custom",
      customOptions: ["3 or fewer", "4-6", "7 or more", "Unanimous"],
      defaultOdds: 200,
    },
    // Post-merge individual immunity
    {
      type: "IMMUNITY",
      promptTemplate: "Who wins individual immunity in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 450,
      episodeTags: ["merge", "post-merge"],
    },
    {
      type: "REWARD",
      promptTemplate: "Who wins the individual reward in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 500,
      episodeTags: ["merge", "post-merge"],
    },
  ],
  episodeTags: {
    premiere: ["1"],
    merge: ["7", "8"],
    "post-merge": ["9", "10", "11", "12", "13", "14"],
    finale: ["last"],
  },
  rulesContext: `Survivor is a reality TV competition where contestants are divided into tribes.
Each episode typically features a reward challenge, an immunity challenge, and a tribal council.
The losing tribe goes to tribal council where one member is voted out.
After the merge (usually around episode 7-8), it becomes individual immunity.
Hidden immunity idols can be played at tribal council to negate votes.
The show airs weekly on TV8 in Turkey.`,
};

// ─── Big Brother (Template) ──────────────────────────────────────────

export const BIG_BROTHER_TEMPLATE: ShowConfig = {
  slug: "big-brother-template",
  name: "Big Brother",
  network: "",
  country: "",
  searchTerms: ["Big Brother results", "Big Brother eviction"],
  wikiPattern: "Big_Brother_{season}",
  terminology: {
    elimination: "eviction",
    immunity: "Head of Household",
    reward: "Power of Veto",
    tribe: "house",
    merge: "jury phase",
    idol: "Power of Veto",
    council: "eviction ceremony",
  },
  questionTemplates: [
    {
      type: "IMMUNITY",
      promptTemplate: "Who wins Head of Household in Week {episode}?",
      optionsSource: "contestants",
      defaultOdds: 400,
    },
    {
      type: "ELIMINATION",
      promptTemplate: "Who gets evicted in Week {episode}?",
      optionsSource: "contestants",
      defaultOdds: 300,
    },
    {
      type: "REWARD",
      promptTemplate: "Who wins the Power of Veto in Week {episode}?",
      optionsSource: "contestants",
      defaultOdds: 400,
    },
    {
      type: "TWIST",
      promptTemplate: "Is the Power of Veto used in Week {episode}?",
      optionsSource: "yesno",
      defaultOdds: -150,
    },
    {
      type: "TRIBAL_COUNCIL",
      promptTemplate: "How many votes does the evicted houseguest receive?",
      optionsSource: "custom",
      customOptions: ["2 or fewer", "3-4", "5 or more", "Unanimous"],
      defaultOdds: 200,
    },
  ],
  episodeTags: {
    premiere: ["1"],
    jury: ["5", "6", "7", "8", "9", "10", "11"],
    finale: ["last"],
  },
  rulesContext: `Big Brother is a reality TV show where houseguests live together in a house.
Each week, the Head of Household (HOH) nominates two houseguests for eviction.
The Power of Veto (POV) competition gives the winner the ability to save a nominee.
The remaining houseguests vote to evict one of the nominees.`,
};

// ─── The Bachelor / Bachelorette (Template) ──────────────────────────

export const BACHELOR_TEMPLATE: ShowConfig = {
  slug: "bachelor-template",
  name: "The Bachelor",
  network: "",
  country: "",
  searchTerms: ["The Bachelor results", "The Bachelor rose ceremony"],
  wikiPattern: "The_Bachelor_{season}",
  terminology: {
    elimination: "rose ceremony elimination",
    immunity: "group date rose",
    reward: "one-on-one date",
    tribe: "",
    merge: "hometown dates",
    idol: "first impression rose",
    council: "rose ceremony",
  },
  questionTemplates: [
    {
      type: "ELIMINATION",
      promptTemplate: "Who gets eliminated at the rose ceremony in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 300,
    },
    {
      type: "REWARD",
      promptTemplate: "Who gets the one-on-one date in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 400,
    },
    {
      type: "TWIST",
      promptTemplate: "Does someone self-eliminate in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: 250,
    },
    {
      type: "CUSTOM",
      promptTemplate: "How many contestants are eliminated in Episode {episode}?",
      optionsSource: "custom",
      customOptions: ["1", "2", "3 or more"],
      defaultOdds: 150,
    },
  ],
  episodeTags: {
    premiere: ["1"],
    hometowns: ["8", "9"],
    finale: ["last"],
  },
  rulesContext: `The Bachelor/Bachelorette features one lead dating multiple contestants.
Each episode has group dates, one-on-one dates, and a rose ceremony.
Contestants who don't receive a rose are eliminated.
The show progresses to hometown dates, fantasy suites, and a final rose ceremony.`,
};

// ─── Love Island (Template) ──────────────────────────────────────────

export const LOVE_ISLAND_TEMPLATE: ShowConfig = {
  slug: "love-island-template",
  name: "Love Island",
  network: "",
  country: "",
  searchTerms: ["Love Island results", "Love Island dumped"],
  wikiPattern: "Love_Island_{season}",
  terminology: {
    elimination: "dumping",
    immunity: "couple immunity",
    reward: "date card",
    tribe: "couple",
    merge: "casa amor",
    idol: "public vote save",
    council: "recoupling",
  },
  questionTemplates: [
    {
      type: "ELIMINATION",
      promptTemplate: "Who gets dumped from the island in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 350,
    },
    {
      type: "TWIST",
      promptTemplate: "Is there a recoupling in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: -110,
    },
    {
      type: "CUSTOM",
      promptTemplate: "Does a new islander enter the villa in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: 150,
    },
  ],
  episodeTags: {
    premiere: ["1"],
    "casa-amor": ["15", "16", "17", "18"],
    finale: ["last"],
  },
  rulesContext: `Love Island features singles living in a villa, coupling up with each other.
Recouplings happen regularly where islanders choose their partners.
Islanders who are not in a couple risk being "dumped" (eliminated).
Casa Amor is a twist where a second villa is introduced with new contestants.`,
};

// ─── Survivor 50 (CBS, US — Feb 2026) ────────────────────────────────

export const SURVIVOR_50: ShowConfig = {
  slug: "survivor-50",
  name: "Survivor 50",
  network: "CBS",
  country: "USA",
  searchTerms: [
    "Survivor season 50 results",
    "Survivor 50 CBS episode recap",
    "Survivor 50 elimination",
    "Survivor 50 immunity challenge winner",
  ],
  wikiPattern: "Survivor_50",
  terminology: {
    elimination: "tribal council elimination",
    immunity: "immunity challenge",
    reward: "reward challenge",
    tribe: "tribe",
    merge: "merge",
    idol: "hidden immunity idol",
    council: "tribal council",
  },
  questionTemplates: [
    {
      type: "IMMUNITY",
      promptTemplate: "Which tribe wins immunity in Episode {episode}?",
      optionsSource: "tribes",
      defaultOdds: -110,
    },
    {
      type: "ELIMINATION",
      promptTemplate: "Who gets eliminated in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 350,
    },
    {
      type: "TWIST",
      promptTemplate: "Does someone play a hidden immunity idol in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: 200,
    },
    {
      type: "REWARD",
      promptTemplate: "Which tribe wins the reward challenge in Episode {episode}?",
      optionsSource: "tribes",
      defaultOdds: 100,
    },
    {
      type: "TRIBAL_COUNCIL",
      promptTemplate: "How many votes does the eliminated person receive?",
      optionsSource: "custom",
      customOptions: ["3 or fewer", "4-6", "7 or more", "Unanimous"],
      defaultOdds: 200,
    },
    {
      type: "IMMUNITY",
      promptTemplate: "Who wins individual immunity in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 450,
      episodeTags: ["merge", "post-merge"],
    },
  ],
  episodeTags: {
    premiere: ["1"],
    merge: ["7", "8"],
    "post-merge": ["9", "10", "11", "12", "13", "14"],
    finale: ["last"],
  },
  rulesContext: `Survivor 50 is a milestone season airing on CBS (USA) starting February 25, 2026.
Contestants are divided into tribes. Each episode: reward challenge, immunity challenge, tribal council.
The losing tribe votes someone out. After the merge (~episode 7-8), it becomes individual immunity.
Hidden immunity idols can negate votes at tribal council. 50th season features returning legends.`,
};

// ─── The Traitors US Season 4 (Peacock — Jan 2026) ───────────────────

export const TRAITORS_US_4: ShowConfig = {
  slug: "traitors-us-4",
  name: "The Traitors US Season 4",
  network: "Peacock",
  country: "USA",
  searchTerms: [
    "The Traitors US season 4 results",
    "The Traitors US season 4 murder",
    "The Traitors Peacock episode recap",
    "The Traitors US banishment",
  ],
  wikiPattern: "The_Traitors_(American_TV_series)_season_4",
  terminology: {
    elimination: "murder (by traitors) or banishment (by vote)",
    immunity: "shield",
    reward: "mission prize",
    tribe: "team",
    merge: "endgame",
    idol: "shield from murder",
    council: "roundtable",
  },
  questionTemplates: [
    {
      type: "ELIMINATION",
      promptTemplate: "Who gets murdered by the traitors in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 300,
    },
    {
      type: "TRIBAL_COUNCIL",
      promptTemplate: "Who gets banished at the roundtable in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 250,
    },
    {
      type: "TWIST",
      promptTemplate: "Is a traitor banished in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: 150,
    },
    {
      type: "CHALLENGE_WINNER",
      promptTemplate: "Does the group pass the mission in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: -130,
    },
    {
      type: "CUSTOM",
      promptTemplate: "How many people are eliminated in Episode {episode}?",
      optionsSource: "custom",
      customOptions: ["1", "2", "3 or more"],
      defaultOdds: 150,
    },
  ],
  episodeTags: {
    premiere: ["1"],
    endgame: ["8", "9", "10"],
    finale: ["last"],
  },
  rulesContext: `The Traitors US Season 4 airs on Peacock from January 2026.
Players compete in missions for a prize pot. Among them are secret "Traitors" who
"murder" a Faithful each night. At the roundtable, players vote to "banish" someone
they suspect is a Traitor. If all Traitors are banished, remaining Faithfuls split the pot.
If a Traitor reaches the end, they steal the pot.`,
};

// ─── The Bachelor 2026 (ABC — Winter 2026) ───────────────────────────

export const BACHELOR_2026: ShowConfig = {
  slug: "bachelor-2026",
  name: "The Bachelor 2026",
  network: "ABC",
  country: "USA",
  searchTerms: [
    "The Bachelor 2026 results",
    "The Bachelor 2026 rose ceremony",
    "The Bachelor ABC spoilers",
    "The Bachelor 2026 eliminated",
  ],
  wikiPattern: "The_Bachelor_(American_TV_series)_season_30",
  terminology: {
    elimination: "rose ceremony elimination",
    immunity: "group date rose",
    reward: "one-on-one date",
    tribe: "",
    merge: "hometown dates",
    idol: "first impression rose",
    council: "rose ceremony",
  },
  questionTemplates: [
    {
      type: "ELIMINATION",
      promptTemplate: "Who gets eliminated at the rose ceremony in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 300,
    },
    {
      type: "REWARD",
      promptTemplate: "Who gets the one-on-one date in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 400,
    },
    {
      type: "TWIST",
      promptTemplate: "Does someone self-eliminate in Episode {episode}?",
      optionsSource: "yesno",
      defaultOdds: 250,
    },
    {
      type: "CUSTOM",
      promptTemplate: "How many contestants are eliminated in Episode {episode}?",
      optionsSource: "custom",
      customOptions: ["1", "2", "3 or more"],
      defaultOdds: 150,
    },
    {
      type: "CHALLENGE_WINNER",
      promptTemplate: "Who gets the group date rose in Episode {episode}?",
      optionsSource: "contestants",
      defaultOdds: 350,
    },
  ],
  episodeTags: {
    premiere: ["1"],
    hometowns: ["8", "9"],
    finale: ["last"],
  },
  rulesContext: `The Bachelor 2026 airs on ABC in Winter 2026.
One lead dates multiple contestants through group dates, one-on-one dates, and cocktail parties.
Each episode ends with a rose ceremony where contestants without a rose go home.
The season progresses through hometown dates, fantasy suites, and a final rose ceremony.`,
};

// ─── Registry ────────────────────────────────────────────────────────

const SHOW_REGISTRY: Record<string, ShowConfig> = {
  "survivor-2026": SURVIVOR_2026,
  "survivor-50": SURVIVOR_50,
  "traitors-us-4": TRAITORS_US_4,
  "bachelor-2026": BACHELOR_2026,
  "big-brother-template": BIG_BROTHER_TEMPLATE,
  "bachelor-template": BACHELOR_TEMPLATE,
  "love-island-template": LOVE_ISLAND_TEMPLATE,
};

export function getShowConfig(slug: string): ShowConfig | null {
  return SHOW_REGISTRY[slug] ?? null;
}

export function getAllShowConfigs(): ShowConfig[] {
  return Object.values(SHOW_REGISTRY);
}

export function getShowSlugs(): string[] {
  return Object.keys(SHOW_REGISTRY);
}
