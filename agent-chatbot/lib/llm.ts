import OpenAI from "openai";

export type Provider = {
  name: string;
  client: OpenAI;
  model: string;
};

// 1. Teeno providers ki priority list define karo
export const providers: Provider[] = [
    {
    name: "groq",
    client: new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    }),
    model: "openai/gpt-oss-20b",
  },
  {
    name: "openrouter",
    client: new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    }),
    model: "openrouter/free",
  },
  {
    name: "ollama",
    client: new OpenAI({
      baseURL: "http://localhost:11434/v1",
      apiKey: "ollama", // Ollama doesn't need a real key
    }),
    model: "llama3.2:3b",
  },
];

// 2. Chat function with automatic failover & provider preference
export async function chat(
  messages: OpenAI.ChatCompletionMessageParam[],
  extra: Partial<OpenAI.ChatCompletionCreateParamsNonStreaming> = {},
  preferredProvider?: string,
  preferredModel?: string
) {
  let orderedProviders = [...providers];

  // If user selected a specific provider, prioritize it first with preferred model
  if (preferredProvider && preferredProvider !== "auto") {
    const target = orderedProviders.find((p) => p.name.toLowerCase() === preferredProvider.toLowerCase());
    if (target) {
      const activeModel = preferredModel || target.model;
      const rest = orderedProviders.filter((p) => p.name.toLowerCase() !== preferredProvider.toLowerCase());
      orderedProviders = [{ ...target, model: activeModel }, ...rest];
    }
  }

  for (const p of orderedProviders) {
    try {
      console.log(`⏳ Trying provider: [${p.name}] with model: ${p.model}...`);
      // 'as OpenAI.ChatCompletion' lagane se TypeScript ko pata chal jata hai ki ye normal text response hai!
      const res = (await p.client.chat.completions.create({
        model: p.model,
        messages,
        ...extra,
        stream: false,
      })) as OpenAI.ChatCompletion;

      return {
        content: res.choices[0]?.message?.content || "",
        rawMessage: res.choices[0]?.message,
        provider: p.name,
        model: p.model,
      };
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      console.warn(`⚠️ [${p.name}] failed (Status: ${error?.status || error?.message}), falling back to next provider...`);
    }
  } // 👈 Yeh bracket for-loop ko band karega!

  throw new Error("❌ All AI providers failed in the fallback chain!");
}

// 3. Streaming Chat function with automatic failover
export async function chatStream(
  messages: OpenAI.ChatCompletionMessageParam[],
  extra: Partial<OpenAI.ChatCompletionCreateParamsStreaming> = {}
) {
  for (const p of providers) {
    try {
      console.log(`⏳ Streaming via: [${p.name}] with model: ${p.model}...`);
      
      const stream = await p.client.chat.completions.create({
        model: p.model,
        messages,
        ...extra,
        stream: true,
      });
      return {
        stream,
        provider: p.name,
        model: p.model,
      };
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      console.warn(`⚠️ [${p.name}] stream failed (${error?.status || error?.message}), trying next provider...`);
    }
  }
  throw new Error("❌ All AI providers failed to initiate stream!");
}
