import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface GroqPDFParseOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Parse PDF content using Groq's LLM API
 * This is used as a fallback when Ollama is not available
 */
export async function parseWithGroq(options: GroqPDFParseOptions): Promise<string> {
  const {
    prompt,
    temperature = 0.2, // Low temperature for accurate extraction
    maxTokens = 3000, // Allow longer responses for detailed resumes
  } = options;

  try {
    console.log("[Groq Service] Using Groq API as fallback for PDF parsing...");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: temperature,
      max_completion_tokens: maxTokens,
      top_p: 1,
      stream: false,
    });

    const response = chatCompletion.choices[0]?.message?.content || "";

    if (!response) {
      throw new Error("Groq API returned an empty response");
    }

    console.log("[Groq Service] Successfully received response from Groq API");
    return response.trim();
  } catch (error: any) {
    console.error("[Groq Service] Error:", error.message);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

/**
 * Check if Groq API is configured
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}
