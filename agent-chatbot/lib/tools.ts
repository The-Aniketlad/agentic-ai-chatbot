import OpenAI from "openai";

// 1. OpenAI-compatible Tool Definitions (AI ko batane ke liye ki kya-kya tools hain)
export const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Returns the current date, time, and timezone.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Evaluates a mathematical expression accurately. Example: '4873 * 29' or 'sqrt(144)'",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The mathematical expression to evaluate.",
          },
        },
        required: ["expression"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Searches the live web for recent facts, news, or current events.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to look up on the web.",
          },
        },
        required: ["query"],
      },
    },
  },
];

// 2. Tool Implementations (Asli code jo execute hoga)
export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  console.log(`🔧 Executing Tool: [${name}] with args:`, args);

  switch (name) {
    case "get_current_time": {
      const now = new Date();
      return {
        currentTime: `${now.toDateString()} ${now.toLocaleTimeString()}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    case "calculator": {
      try {
        // Safe math evaluation
        const sanitized = args.expression.replace(/[^0-9+\-*/().%^e ]/g, "");
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${sanitized})`)();
        return { result: String(result) };
      } catch (err: unknown) {
        return { error: `Failed to calculate: ${(err as Error).message}` };
      }
    }

    case "web_search": {
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey) {
        return {
          results: `Tavily API key is not set yet. Mock result: '${args.query}' is trending!`,
        };
      }

      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            query: args.query,
            max_results: 3,
          }),
        });
        const data = (await res.json()) as {
          results?: Array<{ title?: string; content?: string; url?: string }>;
        };
        return {
          results: data.results?.map((r) => ({ title: r.title, content: r.content, url: r.url })),
        };
      } catch (err: unknown) {
        return { error: `Search failed: ${(err as Error).message}` };
      }
    }

    default:
      return { error: `Unknown tool name: ${name}` };
  }
}
