import { NextRequest, NextResponse } from "next/server";

interface ATSScanRequest {
  resumeData: {
    personalInfo: any;
    summary?: string;
    workExperience: any[];
    education: any[];
    skills: any[];
    projects?: any[];
    certifications?: any[];
  };
  jobDescription?: string;
}

interface ATSIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

interface ATSScanResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  issues: ATSIssue[];
  strengths: string[];
  improvements: string[];
  keywordMatches?: {
    matched: string[];
    missing: string[];
    matchRate: number;
  };
}

// ATS-friendly keywords by category
const ATS_KEYWORDS = {
  action: ['achieved', 'improved', 'increased', 'decreased', 'managed', 'led', 'developed', 'created', 'implemented', 'launched', 'delivered', 'designed', 'built', 'analyzed', 'optimized'],
  quantifiable: ['%', 'increased', 'reduced', 'saved', 'generated', '$', 'million', 'thousand'],
  skills: ['technical', 'leadership', 'communication', 'problem-solving', 'analytical', 'teamwork', 'project management'],
};

function analyzeATS(data: ATSScanRequest): ATSScanResult {
  const issues: ATSIssue[] = [];
  const strengths: string[] = [];
  let score = 100;

  // 1. Check personal information
  if (!data.resumeData.personalInfo.name) {
    issues.push({
      type: 'error',
      category: 'Contact Information',
      message: 'Missing name',
      suggestion: 'Add your full name to ensure ATS can identify your application'
    });
    score -= 10;
  }

  if (!data.resumeData.personalInfo.email) {
    issues.push({
      type: 'error',
      category: 'Contact Information',
      message: 'Missing email address',
      suggestion: 'Add a professional email address'
    });
    score -= 10;
  }

  if (!data.resumeData.personalInfo.phone) {
    issues.push({
      type: 'warning',
      category: 'Contact Information',
      message: 'Missing phone number',
      suggestion: 'Add a phone number for better reachability'
    });
    score -= 5;
  } else {
    strengths.push('Contact information is complete');
  }

  // 2. Check professional summary
  if (!data.resumeData.summary || data.resumeData.summary.length < 50) {
    issues.push({
      type: 'warning',
      category: 'Professional Summary',
      message: 'Professional summary is missing or too short',
      suggestion: 'Add a compelling 2-3 sentence summary (150-300 characters)'
    });
    score -= 8;
  } else if (data.resumeData.summary.length > 500) {
    issues.push({
      type: 'info',
      category: 'Professional Summary',
      message: 'Professional summary might be too long',
      suggestion: 'Keep it concise (150-300 characters for better ATS parsing)'
    });
    score -= 2;
  } else {
    strengths.push('Professional summary is well-sized');
  }

  // 3. Check work experience
  if (!data.resumeData.workExperience || data.resumeData.workExperience.length === 0) {
    issues.push({
      type: 'error',
      category: 'Work Experience',
      message: 'No work experience listed',
      suggestion: 'Add at least one work experience entry'
    });
    score -= 20;
  } else {
    let hasQuantifiableAchievements = false;
    let hasActionVerbs = false;
    let totalAchievements = 0;

    data.resumeData.workExperience.forEach((exp, index) => {
      if (!exp.company || !exp.role) {
        issues.push({
          type: 'error',
          category: 'Work Experience',
          message: `Experience #${index + 1} is missing company or role`,
          suggestion: 'Fill in all required fields for each work experience'
        });
        score -= 5;
      }

      if (!exp.startDate) {
        issues.push({
          type: 'warning',
          category: 'Work Experience',
          message: `Experience #${index + 1} is missing start date`,
          suggestion: 'Add dates to show your work history timeline'
        });
        score -= 2;
      }

      // Check achievements
      if (!exp.achievements || exp.achievements.length === 0) {
        issues.push({
          type: 'warning',
          category: 'Work Experience',
          message: `Experience #${index + 1} has no achievements listed`,
          suggestion: 'Add 3-5 bullet points highlighting your accomplishments'
        });
        score -= 5;
      } else {
        totalAchievements += exp.achievements.length;

        exp.achievements.forEach((achievement: string) => {
          // Check for quantifiable results
          if (/\d+/.test(achievement) || /increased|decreased|improved|reduced|saved|generated/i.test(achievement)) {
            hasQuantifiableAchievements = true;
          }

          // Check for action verbs
          const actionVerbs = ATS_KEYWORDS.action;
          if (actionVerbs.some(verb => achievement.toLowerCase().includes(verb))) {
            hasActionVerbs = true;
          }
        });
      }
    });

    if (hasQuantifiableAchievements) {
      strengths.push('Achievements include quantifiable results');
    } else {
      issues.push({
        type: 'info',
        category: 'Work Experience',
        message: 'Add more quantifiable achievements',
        suggestion: 'Include numbers, percentages, or metrics (e.g., "Increased sales by 30%")'
      });
      score -= 5;
    }

    if (hasActionVerbs) {
      strengths.push('Strong action verbs used in achievements');
    } else {
      issues.push({
        type: 'info',
        category: 'Work Experience',
        message: 'Use more action verbs',
        suggestion: 'Start bullets with strong verbs like "Led", "Developed", "Achieved"'
      });
      score -= 3;
    }

    if (totalAchievements < data.resumeData.workExperience.length * 3) {
      issues.push({
        type: 'info',
        category: 'Work Experience',
        message: 'Add more achievement bullets',
        suggestion: 'Aim for 3-5 bullet points per work experience'
      });
      score -= 3;
    }
  }

  // 4. Check education
  if (!data.resumeData.education || data.resumeData.education.length === 0) {
    issues.push({
      type: 'warning',
      category: 'Education',
      message: 'No education listed',
      suggestion: 'Add your educational background'
    });
    score -= 10;
  } else {
    data.resumeData.education.forEach((edu, index) => {
      if (!edu.degree || !edu.institution) {
        issues.push({
          type: 'warning',
          category: 'Education',
          message: `Education #${index + 1} is incomplete`,
          suggestion: 'Include degree and institution name'
        });
        score -= 3;
      }
    });
    strengths.push('Education section is present');
  }

  // 5. Check skills
  if (!data.resumeData.skills || data.resumeData.skills.length === 0) {
    issues.push({
      type: 'error',
      category: 'Skills',
      message: 'No skills listed',
      suggestion: 'Add relevant technical and soft skills'
    });
    score -= 15;
  } else {
    const totalSkills = data.resumeData.skills.reduce((sum, cat) => sum + (cat.items?.length || 0), 0);

    if (totalSkills < 5) {
      issues.push({
        type: 'warning',
        category: 'Skills',
        message: 'Too few skills listed',
        suggestion: 'Add at least 8-12 relevant skills for better keyword matching'
      });
      score -= 5;
    } else if (totalSkills > 30) {
      issues.push({
        type: 'info',
        category: 'Skills',
        message: 'Very long skills list',
        suggestion: 'Focus on most relevant skills (15-20 is optimal)'
      });
      score -= 2;
    } else {
      strengths.push(`Good number of skills listed (${totalSkills})`);
    }
  }

  // 6. Check for special characters or formatting issues
  const allText = JSON.stringify(data.resumeData);
  if (/[^\x00-\x7F]/.test(allText)) {
    issues.push({
      type: 'warning',
      category: 'Formatting',
      message: 'Special characters detected',
      suggestion: 'Some ATS systems may have trouble with special characters'
    });
    score -= 2;
  }

  // 7. Check job description keywords (if provided)
  let keywordMatches;
  if (data.jobDescription) {
    const jdLower = data.jobDescription.toLowerCase();
    const jdKeywords = jdLower
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter((word, index, self) => self.indexOf(word) === index)
      .slice(0, 50); // Top 50 keywords

    const resumeText = JSON.stringify(data.resumeData).toLowerCase();
    const matched = jdKeywords.filter(keyword => resumeText.includes(keyword));
    const missing = jdKeywords.filter(keyword => !resumeText.includes(keyword)).slice(0, 10);

    const matchRate = (matched.length / jdKeywords.length) * 100;

    keywordMatches = {
      matched,
      missing,
      matchRate: Math.round(matchRate)
    };

    if (matchRate < 30) {
      issues.push({
        type: 'error',
        category: 'Keyword Match',
        message: `Low keyword match with job description (${matchRate}%)`,
        suggestion: 'Incorporate more keywords from the job description'
      });
      score -= 15;
    } else if (matchRate < 50) {
      issues.push({
        type: 'warning',
        category: 'Keyword Match',
        message: `Moderate keyword match (${matchRate}%)`,
        suggestion: 'Try to include more relevant keywords from the job posting'
      });
      score -= 8;
    } else {
      strengths.push(`Strong keyword match (${matchRate}%)`);
    }
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine grade
  let grade: ATSScanResult['grade'];
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 65) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  // Generate improvements
  const improvements = issues
    .filter(issue => issue.type === 'error' || issue.type === 'warning')
    .map(issue => issue.suggestion)
    .slice(0, 5);

  return {
    score,
    grade,
    issues,
    strengths,
    improvements,
    keywordMatches
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ATSScanRequest = await request.json();

    if (!body.resumeData) {
      return NextResponse.json(
        { success: false, error: "Resume data is required" },
        { status: 400 }
      );
    }

    const result = analyzeATS(body);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error("ATS scan error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to scan resume" },
      { status: 500 }
    );
  }
}
