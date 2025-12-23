import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PDF_RESUME_EXTRACTION_PROMPT } from "@/lib/pdf-prompts";
import { parseWithGroq, isGroqConfigured } from "@/lib/groq-service";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Set up the worker for pdfjs-dist (legacy build for Node.js)
const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No PDF file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { success: false, error: "File must be a PDF" },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: "PDF file too large. Maximum size is 10MB" },
                { status: 400 }
            );
        }

        console.log(`[PDF Parse] Processing file: ${file.name}, size: ${file.size} bytes`);

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Extract text from PDF using pdfjs-dist
        console.log(`[PDF Parse] Extracting text from PDF...`);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocument = await loadingTask.promise;

        let pdfText = "";
        const numPages = pdfDocument.numPages;

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
            pdfText += pageText + "\n";
        }

        if (!pdfText || pdfText.trim().length < 50) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Could not extract text from PDF. The file might be scanned or empty.",
                },
                { status: 400 }
            );
        }

        console.log(`[PDF Parse] Extracted ${pdfText.length} characters from PDF`);

        // Use AI to extract structured data from PDF text
        console.log(`[PDF Parse] Calling AI to extract structured resume data...`);

        let aiResponse: string;
        let usedGroq = false;

        try {
            // Try Ollama first
            const ollamaResponse = await axios.post(
                OLLAMA_API_URL,
                {
                    model: "llama3",
                    prompt: PDF_RESUME_EXTRACTION_PROMPT(pdfText),
                    stream: false,
                    options: {
                        temperature: 0.2, // Low temperature for accurate extraction
                        num_predict: 3000, // Allow longer responses for detailed resumes
                    },
                },
                {
                    timeout: 180000, // 3 minute timeout for AI processing
                }
            );

            aiResponse = ollamaResponse.data.response?.trim();
            console.log(`[PDF Parse] Using Ollama for PDF parsing`);
        } catch (ollamaError: any) {
            // If Ollama is not available, fall back to Groq
            if (ollamaError.code === "ECONNREFUSED" && isGroqConfigured()) {
                console.log(`[PDF Parse] Ollama not available, falling back to Groq API...`);
                try {
                    aiResponse = await parseWithGroq({
                        prompt: PDF_RESUME_EXTRACTION_PROMPT(pdfText),
                        temperature: 0.2,
                        maxTokens: 3000,
                    });
                    usedGroq = true;
                } catch (groqError: any) {
                    console.error(`[PDF Parse] Groq fallback failed:`, groqError.message);
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Both Ollama and Groq API are unavailable. Please try again later.",
                        },
                        { status: 503 }
                    );
                }
            } else if (ollamaError.code === "ECONNREFUSED") {
                // Ollama not available and Groq not configured
                return NextResponse.json(
                    {
                        success: false,
                        error: "Ollama is not running. Please start Ollama server to parse PDFs.",
                    },
                    { status: 503 }
                );
            } else {
                // Re-throw other errors to be handled by the outer catch block
                throw ollamaError;
            }
        }

        if (!aiResponse) {
            return NextResponse.json(
                { success: false, error: "AI failed to extract data from PDF" },
                { status: 500 }
            );
        }

        console.log(`[PDF Parse] AI response received (first 200 chars):`, aiResponse.substring(0, 200));

        // Parse JSON response
        let extractedData;
        try {
            // Clean the AI response
            let cleanedResponse = aiResponse.trim();

            // Remove common preambles
            const preambles = [
                /^Here is the extracted JSON:\s*/i,
                /^Here is the JSON:\s*/i,
                /^Here's the extracted data:\s*/i,
                /^Here's the JSON:\s*/i,
                /^```json\s*/,
                /^```\s*/,
            ];

            for (const preamble of preambles) {
                cleanedResponse = cleanedResponse.replace(preamble, '');
            }

            // Remove trailing markdown code block markers
            cleanedResponse = cleanedResponse.replace(/\s*```\s*$/, '');
            cleanedResponse = cleanedResponse.trim();

            // Extract JSON object (find outermost { })
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                extractedData = JSON.parse(jsonMatch[0]);
            } else {
                extractedData = JSON.parse(cleanedResponse);
            }

            console.log(`[PDF Parse] Successfully parsed JSON. Name found: ${extractedData.personalInfo?.name || 'NOT FOUND'}`);
        } catch (parseError) {
            console.error("[PDF Parse] JSON parse error:", parseError);
            console.error("[PDF Parse] Raw AI response:", aiResponse);
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to parse extracted data from AI response",
                    rawResponse: aiResponse.substring(0, 500),
                },
                { status: 500 }
            );
        }

        // Validate extracted data has required fields
        if (!extractedData.personalInfo || !extractedData.personalInfo.name || extractedData.personalInfo.name.trim() === "") {
            console.error("[PDF Parse] Name extraction failed. Personal info:", JSON.stringify(extractedData.personalInfo, null, 2));
            console.error("[PDF Parse] First 500 chars of PDF text:", pdfText.substring(0, 500));
            return NextResponse.json(
                {
                    success: false,
                    error: "Could not extract name from PDF. Please ensure your name is clearly visible at the top of the resume.",
                    debug: {
                        personalInfo: extractedData.personalInfo,
                        pdfTextPreview: pdfText.substring(0, 300),
                    }
                },
                { status: 400 }
            );
        }

        console.log(`[PDF Parse] Successfully extracted resume data for: ${extractedData.personalInfo?.name}`);

        return NextResponse.json({
            success: true,
            data: extractedData,
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                textLength: pdfText.length,
                pages: numPages,
            },
        });
    } catch (error: any) {
        console.error("[PDF Parse] Error:", error.message);

        // Check for specific errors
        if (error.message?.includes("timeout")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "PDF processing timed out. Please try with a shorter resume or try again.",
                },
                { status: 408 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to parse PDF resume",
            },
            { status: 500 }
        );
    }
}
