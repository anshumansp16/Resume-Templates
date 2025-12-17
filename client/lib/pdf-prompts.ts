export const PDF_RESUME_EXTRACTION_PROMPT = (pdfText: string) => `You are a precise resume parsing expert. Extract structured information from the resume text below.

CRITICAL INSTRUCTIONS:
- Your response must be PURE JSON only - start with { and end with }
- DO NOT include any preamble like "Here is the JSON:" or explanations
- DO NOT wrap in markdown code blocks
- The VERY FIRST character must be { and the VERY LAST must be }

Resume Content:
${pdfText}

Extract data into this JSON structure:

{
  "personalInfo": {
    "name": "Full name from resume - REQUIRED, look carefully at the top of resume",
    "email": "email@example.com",
    "phone": "IMPORTANT: Extract FULL phone number with country code if available (e.g., +1 234 567 8900, +91 98765 43210, (555) 123-4567). Look for numbers with 10+ digits.",
    "location": "City, State/Country",
    "linkedin": "IMPORTANT: Extract LinkedIn profile URL or username. Look for 'linkedin.com/in/username' or just 'linkedin.com/username'. Include the full URL if present.",
    "github": "IMPORTANT: Extract GitHub profile URL or username. Look for 'github.com/username' or just the username. Common patterns: github.com/user, @username on GitHub. Include the full URL if present.",
    "website": "Personal website URL (if present)"
  },
  "summary": "Professional summary or objective statement (if available)",
  "workExperience": [
    {
      "id": "exp-1",
      "company": "Company name",
      "role": "Job title",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "location": "City, State/Country (if available)",
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "degree": "Degree name and field",
      "institution": "School/University name",
      "location": "City, State/Country (if available)",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "gpa": "GPA if mentioned",
      "honors": "Honors or awards (if mentioned)"
    }
  ],
  "skills": [
    {
      "category": "Programming Languages",
      "items": ["Python", "JavaScript", "Java"]
    },
    {
      "category": "Frameworks",
      "items": ["React", "Node.js", "Django"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"],
      "link": "Project URL (if available)",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Month Year",
      "link": "Credential URL (if available)"
    }
  ],
  "achievements": ["Key achievement or award 1", "Key achievement or award 2"]
}

IMPORTANT RULES:
1. Your response MUST start with { and end with } - nothing else before or after
2. The name field is REQUIRED - look at the very top of the resume for the person's name
3. If a field is not found, use empty string "" or empty array []
4. Generate unique IDs: "exp-1", "exp-2" for work, "edu-1", "edu-2" for education, etc.
5. Extract all work experiences with their bullet points as achievements
6. Categorize skills logically (Programming Languages, Frameworks, Tools, etc.)
7. Keep dates in readable format (e.g., "Jan 2020", "Dec 2023", "Present")
8. Only extract what's clearly present - do not invent data
9. PHONE NUMBERS: Look for phone numbers in multiple formats:
   - With country codes: +1 234 567 8900, +91 12345 67890
   - US format: (555) 123-4567, 555-123-4567
   - International: +44 20 1234 5678
   - Plain numbers: 1234567890 (if 10+ digits)
   Extract the COMPLETE phone number including all formatting, country code, area code, etc.
10. GITHUB: Look for GitHub profiles in these patterns:
   - Full URLs: github.com/username, https://github.com/username
   - Usernames: @username, username (in context of GitHub)
   - Links in contact section or social media section
   If you find a GitHub username without the full URL, add "github.com/" prefix
11. LINKEDIN: Look for LinkedIn profiles:
   - Full URLs: linkedin.com/in/username, https://linkedin.com/in/username
   - Usernames: in/username, /in/username
   If you find just the username, construct the full URL as "linkedin.com/in/username"

Start your response with { now:`.trim();
