import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const SCRAPEHUB_API_URL = process.env.SCRAPEHUB_API_URL || "http://localhost:8000";
const SCRAPEHUB_API_KEY = process.env.SCRAPEHUB_API_KEY;

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

        // Call ScrapeHub API to extract LinkedIn profile data
        try {
            const scrapeHubResponse = await axios.post(
                `${SCRAPEHUB_API_URL}/api/scrape/linkedin`,
                {
                    url: linkedinUrl,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(SCRAPEHUB_API_KEY && { 'Authorization': `Bearer ${SCRAPEHUB_API_KEY}` })
                    },
                    timeout: 60000, // 1 minute timeout
                }
            );

            if (!scrapeHubResponse.data || !scrapeHubResponse.data.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: scrapeHubResponse.data?.error || "Failed to extract LinkedIn data"
                    },
                    { status: 500 }
                );
            }

            const extractedData = scrapeHubResponse.data.data;

            console.log(`[LinkedIn] Successfully extracted data for: ${extractedData.personalInfo?.name}`);

            // Transform the data to match our expected format
            const formattedData = {
                personalInfo: {
                    name: extractedData.name || extractedData.personalInfo?.name || "",
                    location: extractedData.location || extractedData.personalInfo?.location || "",
                    email: extractedData.email || extractedData.personalInfo?.email || "",
                    phone: extractedData.phone || extractedData.personalInfo?.phone || "",
                    linkedin: linkedinUrl,
                },
                summary: extractedData.summary || extractedData.about || "",
                workExperience: (extractedData.experience || extractedData.workExperience || []).map((exp: any, index: number) => ({
                    id: `exp-linkedin-${index}`,
                    company: exp.company || "",
                    role: exp.title || exp.role || "",
                    startDate: exp.startDate || exp.start || "",
                    endDate: exp.endDate || exp.end || "Present",
                    location: exp.location || "",
                    achievements: exp.description ? [exp.description] : []
                })),
                education: (extractedData.education || []).map((edu: any, index: number) => ({
                    id: `edu-linkedin-${index}`,
                    degree: edu.degree || "",
                    institution: edu.school || edu.institution || "",
                    startDate: edu.startDate || edu.start || "",
                    endDate: edu.endDate || edu.end || "",
                    location: edu.location || ""
                })),
                skills: (extractedData.skills || []).map((skill: string) => skill.trim()).filter(Boolean),
                certifications: (extractedData.certifications || []).map((cert: any, index: number) => ({
                    id: `cert-linkedin-${index}`,
                    name: cert.name || cert.title || "",
                    issuer: cert.issuer || cert.organization || "",
                    date: cert.date || cert.issueDate || ""
                }))
            };

            return NextResponse.json({
                success: true,
                data: formattedData,
            });

        } catch (scrapError: any) {
            console.error("[LinkedIn] ScrapeHub API error:", scrapError.message);

            // Handle specific ScrapeHub errors
            if (scrapError.code === "ECONNREFUSED") {
                return NextResponse.json(
                    {
                        success: false,
                        error: "ScrapeHub API is not running. Please start the ScrapeHub server.",
                    },
                    { status: 503 }
                );
            }

            if (scrapError.response?.status === 401) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid ScrapeHub API key.",
                    },
                    { status: 401 }
                );
            }

            if (scrapError.response?.status === 404) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "LinkedIn profile not found or is private.",
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    error: scrapError.response?.data?.error || scrapError.message || "Failed to scrape LinkedIn profile",
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("[LinkedIn] Extraction error:", error.message);

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to extract LinkedIn profile",
            },
            { status: 500 }
        );
    }
}
