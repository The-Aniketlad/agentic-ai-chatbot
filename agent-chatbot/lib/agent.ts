import OpenAI from "openai";
import { chat } from "./llm";
import { tools, executeTool } from "./tools";

export type AgentResult = {
  content: string;
  provider: string;
  model: string;
  stepsTaken: number;
};

export async function runAgent(
  messages: OpenAI.ChatCompletionMessageParam[],
  systemPrompt: string = "You are an intelligent AI agent with access to real-time tools...",
  agentTools: OpenAI.ChatCompletionTool[] = tools,
  preferredProvider?: string,
  preferredModel?: string,
  customGroqKey?: string,
  customOpenRouterKey?: string,
  temperature?: number,
  customAgentKey?: string
): Promise<AgentResult> {
  // 1. Prepare conversation array with system prompt
  const convo: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.filter((m) => m.role !== "system"),
  ];

  const MAX_STEPS = 5; // Safety limit: loop kabhi infinite na chale

  for (let step = 0; step < MAX_STEPS; step++) {
    console.log(`✦ Agent Loop: Step ${step + 1}/${MAX_STEPS}...`);

    // 2. Call our multi-provider fallback engine with available tools and preferred provider
    const res = await chat(
      convo,
      {
        tools: agentTools.length > 0 ? agentTools : undefined,
        temperature: typeof temperature === "number" ? temperature : 0.7,
      },
      preferredProvider,
      preferredModel,
      customGroqKey,
      customOpenRouterKey,
      customAgentKey
    );
    const message = res.rawMessage;

    // 3. Agar model ne Tools call kiye hain:
    if (message?.tool_calls && message.tool_calls.length > 0) {
      console.log(`🎯 Model requested ${message.tool_calls.length} tool call(s)`);
      convo.push(message); // assistant message with tool_calls ko history me daalo

      // Har ek tool ko run karo
      for (const call of message.tool_calls) {
        if (call.type !== "function") continue;

        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments);
        } catch {
          args = {};
        }

        // Execute function in our code
        const toolResult = await executeTool(call.function.name, args);

        // Feed tool result back to the conversation
        convo.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(toolResult),
        });
      }
      // Loop continues: next step me model tool result ko padhega!
    } else {
      // 4. Model ne final text answer de diya -> Agent kaam khatam kar chuka hai!
      console.log(`✅ Agent finished in ${step + 1} step(s).`);
      return {
        content: res.content || "",
        provider: res.provider,
        model: res.model,
        stepsTaken: step + 1,
      };
    }
  }

  return {
    content: "I reached the maximum step limit while trying to complete your request.",
    provider: "agent",
    model: "safety-limit",
    stepsTaken: MAX_STEPS,
  };
}
