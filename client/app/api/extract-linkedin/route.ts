import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import axios from "axios";
import { LINKEDIN_EXTRACTION_PROMPT } from "@/lib/linkedin-prompts";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

export async function POST(request: NextRequest) {
    try {
        const { linkedinUrl } = await request.json();

        if (!linkedinUrl || !linkedinUrl.includes("linkedin.com")) {
            return NextResponse.json(
                { success: false, error: "Invalid LinkedIn URL" },
                { status: 400 }
            );
        }

        console.log(`[LinkedIn] Extracting profile from: ${linkedinUrl}`);

        // Launch Puppeteer in headless mode
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
            ],
        });

        const page = await browser.newPage();

        // Set user agent to avoid detection
        await page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // Navigate to LinkedIn profile (public view)
        // Note: This works for public profiles. For private profiles, user would need to be logged in
        try {
            await page.goto(linkedinUrl, {
                waitUntil: "networkidle2",
                timeout: 30000,
            });

            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Get the page HTML
            const htmlContent = await page.content();

            await browser.close();

            console.log(`[LinkedIn] Page content extracted, length: ${htmlContent.length}`);

            // Use AI to extract structured data from HTML
            console.log(`[LinkedIn] Calling AI to extract structured data...`);

            const ollamaResponse = await axios.post(
                OLLAMA_API_URL,
                {
                    model: "llama3",
                    prompt: LINKEDIN_EXTRACTION_PROMPT(htmlContent),
                    stream: false,
                    options: {
                        temperature: 0.3, // Lower temperature for more accurate extraction
                        num_predict: 2000,
                    },
                },
                {
                    timeout: 120000, // 2 minute timeout for AI processing
                }
            );

            const aiResponse = ollamaResponse.data.response?.trim();

            if (!aiResponse) {
                return NextResponse.json(
                    { success: false, error: "AI failed to extract data" },
                    { status: 500 }
                );
            }

            console.log(`[LinkedIn] AI response received:`, aiResponse.substring(0, 200));

            // Parse JSON response
            let extractedData;
            try {
                // Try to extract JSON from response (in case AI wrapped it in markdown)
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    extractedData = JSON.parse(jsonMatch[0]);
                } else {
                    extractedData = JSON.parse(aiResponse);
                }
            } catch (parseError) {
                console.error("[LinkedIn] JSON parse error:", parseError);
                return NextResponse.json(
                    {
                        success: false,
                        error: "Failed to parse extracted data",
                        rawResponse: aiResponse.substring(0, 500),
                    },
                    { status: 500 }
                );
            }

            console.log(`[LinkedIn] Successfully extracted data for: ${extractedData.personalInfo?.name}`);

            return NextResponse.json({
                success: true,
                data: extractedData,
            });
        } catch (navigationError: any) {
            await browser.close();
            console.error("[LinkedIn] Navigation error:", navigationError.message);

            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to load LinkedIn profile. Make sure the profile is public or try a different URL.",
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("[LinkedIn] Extraction error:", error.message);

        // Check for specific errors
        if (error.code === "ECONNREFUSED") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Ollama is not running. Please start Ollama server.",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to extract LinkedIn profile",
            },
            { status: 500 }
        );
    }
}
