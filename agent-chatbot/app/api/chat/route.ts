import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent";
import { routeUserMessage } from "@/lib/router";

export async function POST(req: NextRequest) {
  try {
    const { messages, preferredProvider, preferredModel } = await req.json();

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

    // 3. Run specialist agent with assigned persona, tools, and user's chosen provider
    const { content, provider, model } = await runAgent(
      windowedMessages,
      selectedAgent.systemPrompt,
      selectedAgent.tools,
      preferredProvider,
      preferredModel
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
