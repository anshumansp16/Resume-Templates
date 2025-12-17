export const LINKEDIN_EXTRACTION_PROMPT = (htmlContent: string) => `
You are a data extraction expert. Extract professional resume information from this LinkedIn profile HTML.

HTML Content (truncated for processing):
${htmlContent.substring(0, 15000)}

Extract and return ONLY valid JSON with this exact structure (no additional text):

{
  "personalInfo": {
    "name": "Full name",
    "location": "City, Country",
    "headline": "Professional headline/title"
  },
  "summary": "Professional summary/about section (if available)",
  "workExperience": [
    {
      "company": "Company name",
      "role": "Job title",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "description": "Brief description or key point"
    }
  ],
  "education": [
    {
      "institution": "School name",
      "degree": "Degree name and field",
      "startDate": "Year",
      "endDate": "Year"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Month Year"
    }
  ]
}

Rules:
1. Return ONLY the JSON object, no markdown, no explanation
2. If a field is not found, use empty string "" or empty array []
3. Extract at least 2-3 work experiences if available
4. Extract at least 1-2 education entries
5. Extract 5-10 key skills
6. Keep descriptions concise (1-2 sentences max)
7. Ensure all dates are in readable format (e.g., "Jan 2020", "Present")
8. Do not invent data - only extract what's clearly present

Return the JSON now:`.trim();
