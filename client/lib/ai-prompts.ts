interface AIPromptContext {
    role?: string;
    company?: string;
    years?: number;
    skills?: string[];
    achievements?: string[];
    industry?: string;
}

export const AI_PROMPTS = {
    professionalSummary: (context: AIPromptContext) => `
Generate a professional resume summary (2-3 sentences, max 150 words) for a ${context.role || "professional"} ${context.years ? `with ${context.years} years of experience` : ""}.
${context.skills ? `Key skills: ${context.skills.join(", ")}` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}

Requirements:
- Highlight expertise and specializations
- Mention key achievements or metrics if relevant
- Professional tone, active voice
- No fluff or clichés
- Start directly with expertise, no "I am" or "Motivated professional"

Generate only the summary text, no additional commentary.
  `.trim(),

    achievementBullets: (context: {
        role: string;
        company: string;
        responsibilities?: string;
        count?: number;
    }) => `
Generate ${context.count || 3} professional achievement bullet points for a ${context.role} at ${context.company}.
${context.responsibilities ? `Focus areas: ${context.responsibilities}` : ""}

Requirements for each bullet:
- Start with strong action verb (Led, Architected, Implemented, Designed, etc.)
- Include specific metrics/results when possible (e.g., "40% increase", "10K+ users", "99.9% uptime")
- Focus on impact and results, not just tasks
- 1-2 lines maximum per bullet
- Technical and quantifiable
- No generic statements

Generate only the bullet points (without bullet symbols), one per line. No additional commentary.
  `.trim(),

    projectDescription: (context: {
        projectName: string;
        technologies?: string[];
        purpose?: string;
    }) => `
Generate a concise project description (1-2 sentences, max 80 words) for: ${context.projectName}
${context.technologies ? `Technologies used: ${context.technologies.join(", ")}` : ""}
${context.purpose ? `Purpose: ${context.purpose}` : ""}

Requirements:
- Describe what was built and its impact
- Include key technologies if relevant
- Mention scale/metrics if applicable (users, performance, etc.)
- Professional and concise
- Active voice

Generate only the description text, no additional commentary.
  `.trim(),

    skillSuggestions: (context: { role: string; existingSkills: string[] }) => `
Suggest 5-8 additional relevant skills for a ${context.role} role.
Skills already listed: ${context.existingSkills.join(", ")}

Requirements:
- Industry-standard skills and technologies
- Relevant to the role
- Mix of technical and professional skills
- No duplicates from existing skills
- Modern and currently in-demand

Generate only a comma-separated list of skills, no additional commentary.
  `.trim(),

    keyAchievements: (context: {
        role?: string;
        experience?: string;
        industry?: string;
    }) => `
Generate 3-4 standout career achievements for a ${context.role || "professional"}.
${context.experience ? `Background: ${context.experience}` : ""}
${context.industry ? `Industry: ${context.industry}` : ""}

Requirements:
- High-level career highlights
- Quantifiable results (percentages, numbers, scale)
- Demonstrate leadership, innovation, or significant impact
- 1 line each
- Professional tone

Generate only the achievements (without bullet symbols), one per line. No additional commentary.
  `.trim(),
};

export function buildPrompt(
    type: keyof typeof AI_PROMPTS,
    context: any
): string {
    const promptBuilder = AI_PROMPTS[type];
    if (!promptBuilder) {
        throw new Error(`Unknown prompt type: ${type}`);
    }
    return promptBuilder(context);
}
