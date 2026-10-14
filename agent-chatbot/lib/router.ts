import OpenAI from "openai";
import { chat } from "./llm";
import { tools } from "./tools";

// 1. Specialist Agent Type Definition
export type SpecialistAgent = {
  name: "coder" | "researcher" | "summarizer";
  title: string;
  description: string;
  systemPrompt: string;
  tools: OpenAI.ChatCompletionTool[];
};

// 2. Define Specialist Agents
export const agents: Record<string, SpecialistAgent> = {
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
    description: "Searches the web, explains factual queries, current events, and live information.",
    systemPrompt: `You are an expert Research Analyst. Use the web_search and get_current_time tools to verify current facts before answering. Cite your findings accurately.`,
    tools: tools, // Has access to web search, time, and calculator
  },
  summarizer: {
    name: "summarizer",
    title: "Executive Summarizer Agent",
    description: "Summarizes complex topics, long articles, or explanations into structured, easy-to-read bullet points.",
    systemPrompt: `You are an Executive Summarization Specialist. Your goal is to synthesize information into clear, structured, high-impact bullet points with bold key takeaways.`,
    tools: [], // Focused purely on synthesis
  },
};

// 3. Supervisor Router Function (Fast single call to determine intent)
export async function routeUserMessage(userMessage: string): Promise<SpecialistAgent> {
  const agentList = Object.values(agents)
    .map((a) => `- "${a.name}": ${a.description}`)
    .join("\n");

  const supervisorPrompt = `You are a supervisor router in a multi-agent system.
Your job is to inspect the user's message and select the single best specialist agent to handle it:
${agentList}

Respond ONLY with a JSON object in this exact format:
{"agent": "coder" | "researcher" | "summarizer"}`;

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

    return agents.researcher; // Safe fallback
  } catch (err) {
    console.warn("⚠️ Router failed to parse JSON, falling back to researcher agent.");
    return agents.researcher;
  }
}
