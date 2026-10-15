import OpenAI from "openai";
import { chat } from "./llm";
import { tools } from "./tools";

// 1. Specialist Agent Type Definition
export type SpecialistAgent = {
  name: "conversational" | "document_analyst" | "coder" | "researcher" | "summarizer";
  title: string;
  description: string;
  systemPrompt: string;
  tools: OpenAI.ChatCompletionTool[];
};

// 2. Define Specialist Agents
export const agents: Record<string, SpecialistAgent> = {
  conversational: {
    name: "conversational",
    title: "Astra Companion Agent",
    description: "Handles greetings, casual chit-chat, friendly banter, empathy, everyday questions, and conversational dialogue.",
    systemPrompt: `You are Astra Companion, the core conversational AI of Astra AI. You are warm, engaging, witty, empathetic, and intelligent. For greetings, casual questions, and friendly discussions, respond naturally and conversationally without being overly formal or robotic.`,
    tools: tools.filter((t) => t.type === "function" && t.function.name === "get_current_time"),
  },
  document_analyst: {
    name: "document_analyst",
    title: "Document & Data Intelligence Agent",
    description: "Specializes in inspecting, analyzing, and answering queries about files, documents, CSV tables, JSON structures, error logs, and datasets.",
    systemPrompt: `You are the Document & Data Intelligence Specialist. You excel at reading, inspecting, parsing, and extracting clear insights from files, documents, datasets, CSV sheets, error logs, and configuration files. Present your analysis using structured bullet points, key metrics, tables, and actionable findings.`,
    tools: tools, // Has full access to tools including calculator and web search
  },
  coder: {
    name: "coder",
    title: "Software Engineer Agent",
    description: "Writes, debugs, explains, and optimizes code across all languages. Handles algorithms and technical architectures.",
    systemPrompt: `You are an elite Senior Software Engineer. Provide clean, robust, well-commented code with concise technical explanations. Use available tools (like calculator) if algorithmic math is needed.`,
    tools: tools.filter((t) => t.type === "function" && t.function.name === "calculator"),
  },
  researcher: {
    name: "researcher",
    title: "Research Analyst Agent",
    description: "Searches the live web, explains factual queries, current news, live facts, and live information.",
    systemPrompt: `You are an expert Research Analyst. Use the web_search and get_current_time tools to verify current facts before answering. Cite your findings accurately.`,
    tools: tools,
  },
  summarizer: {
    name: "summarizer",
    title: "Executive Summarizer Agent",
    description: "Summarizes complex topics, long articles, notes, or explanations into structured, easy-to-read bullet points.",
    systemPrompt: `You are an Executive Summarization Specialist. Your goal is to synthesize information into clear, structured, high-impact bullet points with bold key takeaways.`,
    tools: [],
  },
};

// 3. Supervisor Router Function (Fast single call to determine intent)
export async function routeUserMessage(userMessage: string): Promise<SpecialistAgent> {
  const trimmed = userMessage.trim().toLowerCase();

  // 1. Quick heuristic for common greetings / small talk
  const commonGreetings = [
    "hi",
    "hello",
    "hey",
    "hola",
    "namaste",
    "sup",
    "yo",
    "good morning",
    "good afternoon",
    "good evening",
    "kya haal hai",
    "kaise ho",
    "how are you",
    "kaisa hai",
  ];
  if (commonGreetings.some((g) => trimmed === g || trimmed.startsWith(g + " "))) {
    console.log("🚦 Supervisor Router: Greeting detected -> [CONVERSATIONAL] Astra Companion Agent");
    return agents.conversational;
  }

  // 2. Quick heuristic for file / document queries
  const fileKeywords = ["file", "document", "csv", "json", "log", "logs", "dataset", "table", "readme"];
  if (
    fileKeywords.some(
      (k) =>
        trimmed.includes(k) &&
        (trimmed.includes("analyze") ||
          trimmed.includes("read") ||
          trimmed.includes("parse") ||
          trimmed.includes("check") ||
          trimmed.includes("explain") ||
          trimmed.includes("inspect"))
    )
  ) {
    console.log("🚦 Supervisor Router: File query detected -> [DOCUMENT_ANALYST] Document & Data Intelligence Agent");
    return agents.document_analyst;
  }

  const agentList = Object.values(agents)
    .map((a) => `- "${a.name}": ${a.description}`)
    .join("\n");

  const supervisorPrompt = `You are a supervisor router in an autonomous multi-agent system.
Your job is to inspect the user's message and select the single best specialist agent to handle it:
${agentList}

Routing guidelines:
- If the user is greeting, chatting, or having casual conversation: choose "conversational".
- If the user is asking about files, documents, datasets, CSVs, logs, or file analysis: choose "document_analyst".
- If the user is asking for coding, debugging, or technical architecture: choose "coder".
- If the user is asking for current web events, live news, or real-time lookups: choose "researcher".
- If the user is asking to summarize or condense information: choose "summarizer".

Respond ONLY with a JSON object in this exact format:
{"agent": "conversational" | "document_analyst" | "coder" | "researcher" | "summarizer"}`;

  try {
    const res = await chat([
      { role: "system", content: supervisorPrompt },
      { role: "user", content: userMessage },
    ]);

    // Parse JSON safely
    const cleanJson = res.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.agent && agents[parsed.agent]) {
      console.log(`🚦 Supervisor Router selected: [${parsed.agent.toUpperCase()}] agent`);
      return agents[parsed.agent];
    }

    return agents.conversational; // Safe fallback
  } catch {
    console.warn("⚠️ Router failed to parse JSON, falling back to conversational agent.");
    return agents.conversational;
  }
}
