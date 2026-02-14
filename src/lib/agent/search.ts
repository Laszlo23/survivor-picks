/**
 * Web Search Wrapper
 *
 * Uses Tavily API for real-time web search. Falls back to a simple
 * fetch-based scraper if Tavily is not configured.
 *
 * Tavily: https://tavily.com — $0.01/search, 1000 free/month
 */

export interface SearchResult {
  title: string;
  url: string;
  content: string; // snippet or full content
  score: number; // relevance 0-1
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string; // Tavily's AI-generated answer (if available)
}

// ─── Tavily Search ───────────────────────────────────────────────────

async function tavilySearch(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeAnswer?: boolean;
    includeDomains?: string[];
  } = {}
): Promise<SearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY not set");
  }

  const {
    maxResults = 5,
    searchDepth = "basic",
    includeAnswer = true,
    includeDomains = [],
  } = options;

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_answer: includeAnswer,
      include_domains: includeDomains.length > 0 ? includeDomains : undefined,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Tavily search failed (${response.status}): ${err}`);
  }

  const data = await response.json();

  return {
    query,
    results: (data.results || []).map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      content: r.content || "",
      score: r.score || 0,
    })),
    answer: data.answer || undefined,
  };
}

// ─── Fallback: Simple Google Search Scraper ──────────────────────────

async function fallbackSearch(query: string): Promise<SearchResponse> {
  // Use a basic fetch to DuckDuckGo instant answer API as fallback
  const encoded = encodeURIComponent(query);
  const response = await fetch(
    `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`
  );

  if (!response.ok) {
    return { query, results: [] };
  }

  const data = await response.json();
  const results: SearchResult[] = [];

  if (data.AbstractText) {
    results.push({
      title: data.Heading || query,
      url: data.AbstractURL || "",
      content: data.AbstractText,
      score: 0.8,
    });
  }

  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics.slice(0, 4)) {
      if (topic.Text) {
        results.push({
          title: topic.Text.slice(0, 100),
          url: topic.FirstURL || "",
          content: topic.Text,
          score: 0.5,
        });
      }
    }
  }

  return { query, results };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Search the web for information about a topic.
 * Uses Tavily if API key is configured, otherwise falls back to DuckDuckGo.
 */
export async function searchWeb(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeAnswer?: boolean;
    includeDomains?: string[];
  } = {}
): Promise<SearchResponse> {
  if (process.env.TAVILY_API_KEY) {
    return tavilySearch(query, options);
  }
  return fallbackSearch(query);
}

/**
 * Search multiple queries in parallel and merge results.
 */
export async function searchMultiple(
  queries: string[],
  options: {
    maxResults?: number;
    includeDomains?: string[];
  } = {}
): Promise<SearchResponse> {
  const responses = await Promise.all(
    queries.map((q) => searchWeb(q, { maxResults: options.maxResults ?? 3, ...options }))
  );

  // Merge and deduplicate by URL
  const seen = new Set<string>();
  const allResults: SearchResult[] = [];

  for (const resp of responses) {
    for (const result of resp.results) {
      if (!seen.has(result.url)) {
        seen.add(result.url);
        allResults.push(result);
      }
    }
  }

  // Sort by relevance score
  allResults.sort((a, b) => b.score - a.score);

  return {
    query: queries.join(" | "),
    results: allResults.slice(0, options.maxResults ?? 10),
    answer: responses.find((r) => r.answer)?.answer,
  };
}
