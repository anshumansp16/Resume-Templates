import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { buildPrompt } from "@/lib/ai-prompts";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

export interface GenerateRequest {
    type:
    | "professionalSummary"
    | "achievementBullets"
    | "projectDescription"
    | "skillSuggestions"
    | "keyAchievements";
    context: any;
}

export interface GenerateResponse {
    success: boolean;
    generated?: string;
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();
        const { type, context } = body;

        if (!type || !context) {
            return NextResponse.json(
                { success: false, error: "Missing type or context" },
                { status: 400 }
            );
        }

        // Build the prompt
        const prompt = buildPrompt(type, context);

        console.log(`[AI Generate] Type: ${type}`);
        console.log(`[AI Generate] Prompt:`, prompt);

        // Call Ollama API
        const ollamaResponse = await axios.post(
            OLLAMA_API_URL,
            {
                model: "llama3",
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 500, // Max tokens
                },
            },
            {
                timeout: 60000, // 60 second timeout
            }
        );

        const generatedText = ollamaResponse.data.response?.trim();

        if (!generatedText) {
            return NextResponse.json(
                { success: false, error: "No content generated" },
                { status: 500 }
            );
        }

        console.log(`[AI Generate] Success:`, generatedText.substring(0, 100));

        return NextResponse.json({
            success: true,
            generated: generatedText,
        });
    } catch (error: any) {
        console.error("[AI Generate] Error:", error.message);

        // Check if Ollama is not running
        if (error.code === "ECONNREFUSED") {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Ollama is not running. Please start Ollama server with 'ollama serve'",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to generate content",
            },
            { status: 500 }
        );
    }
}
