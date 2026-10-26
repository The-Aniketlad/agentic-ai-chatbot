import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent";
import { routeUserMessage } from "@/lib/router";

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      preferredProvider,
      preferredModel,
      customGroqKey,
      customOpenRouterKey,
      temperature,
      tone,
      customInstructions,
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages array", { status: 400 });
    }
    
    const MAX_HISTORY = 10;
    const windowedMessages = messages.length > MAX_HISTORY 
      ? messages.slice(-MAX_HISTORY) 
      : messages;

    // 1. Get latest user prompt
    const lastUserMessage = [...windowedMessages].reverse().find((m) => m.role === "user")?.content || "";

    // 2. 🚦 Supervisor Router selects the best specialist agent
    const selectedAgent = await routeUserMessage(lastUserMessage);
    console.log(`✦ Supervisor dispatched task to: [${selectedAgent.title}] (${selectedAgent.name})`);

    // 3. Augment systemPrompt with user response style and custom instructions
    let effectiveSystemPrompt = selectedAgent.systemPrompt;

    if (tone) {
      const toneDirectives: Record<string, string> = {
        concise: "TONE & STYLE REQUIREMENT: Be extremely concise, direct, and to the point. Prefer bullet points over long paragraphs. Eliminate conversational filler.",
        professional: "TONE & STYLE REQUIREMENT: Maintain an executive, formal, and polished corporate tone with clear structure and thorough analysis.",
        friendly: "TONE & STYLE REQUIREMENT: Speak in a warm, friendly, encouraging, and collaborative tone while remaining helpful and accurate.",
        developer: "TONE & STYLE REQUIREMENT: Act as a Principal Staff Software Engineer & System Architect. Provide production-ready code with TypeScript types, architectural insights, and edge cases.",
      };
      if (toneDirectives[tone]) {
        effectiveSystemPrompt += `\n\n${toneDirectives[tone]}`;
      }
    }

    if (customInstructions && typeof customInstructions === "string" && customInstructions.trim()) {
      effectiveSystemPrompt += `\n\nUSER PERSISTENT INSTRUCTIONS:\n${customInstructions.trim()}`;
    }

    // 4. Run specialist agent with assigned persona, tools, preferred provider, and custom temperature
    const { content, provider, model } = await runAgent(
      windowedMessages,
      effectiveSystemPrompt,
      selectedAgent.tools,
      preferredProvider,
      preferredModel,
      customGroqKey,
      customOpenRouterKey,
      typeof temperature === "number" ? temperature : 0.7
    );

    // 2. Stream the agent's final answer smoothly to the UI
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // Natural word-by-word streaming effect
        const words = content.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(chunk));
          // Micro delay for realistic typing feel
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Provider": provider,
        "X-Model": model,
        "X-Agent": selectedAgent.name,
        "X-Agent-Title": selectedAgent.title,
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Agent API error:", error);
    return new Response(error?.message || "Internal Server Error", { status: 500 });
  }
}
