import { ResumeData } from "./types";

/**
 * Universal template renderer that makes EVERY element dynamic
 * Ensures single-page compliance by prioritizing content
 */
export function renderTemplate(
    htmlTemplate: string,
    data: Partial<ResumeData>
): string {
    let rendered = htmlTemplate;

    // Replace name
    const name = data.personalInfo?.name || "Your Name";
    rendered = rendered.replace(/{{NAME}}/g, name);

    // Build contact info dynamically
    const contactParts: string[] = [];
    if (data.personalInfo?.email) contactParts.push(data.personalInfo.email);
    if (data.personalInfo?.phone) contactParts.push(data.personalInfo.phone);
    if (data.personalInfo?.location) contactParts.push(data.personalInfo.location);

    // Add LinkedIn/GitHub/Website only if provided
    if (data.personalInfo?.linkedin) {
        const linkedin = data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '');
        contactParts.push(linkedin);
    }
    if (data.personalInfo?.github) {
        const github = data.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '');
        contactParts.push(github);
    }
    if (data.personalInfo?.website) {
        const website = data.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '');
        contactParts.push(website);
    }

    const contactInfo = contactParts.join(' <span class="contact-divider">|</span> ');
    rendered = rendered.replace(/{{CONTACT_INFO}}/g, contactInfo);

    // Replace summary
    if (data.summary) {
        rendered = rendered.replace(/{{#if SUMMARY}}[\s\S]*?{{\/if}}/g,
            `<section id="summary-section">
                <h2>Professional Summary</h2>
                <p class="summary">${data.summary}</p>
            </section>`);
    } else {
        rendered = rendered.replace(/{{#if SUMMARY}}[\s\S]*?{{\/if}}/g, '');
    }

    // Replace work experience - completely dynamic
    if (data.workExperience && data.workExperience.length > 0) {
        const experienceHtml = data.workExperience.map(exp => {
            const achievements = exp.achievements && exp.achievements.length > 0
                ? `<ul>${exp.achievements.map(a => `<li>${a}</li>`).join('')}</ul>`
                : '';

            const dateRange = `${exp.startDate || ''} – ${exp.endDate || 'Present'}`;
            const location = exp.location ? `<div class="exp-location">${exp.location}</div>` : '';

            return `
                <div class="exp-item">
                    <div class="exp-header">
                        <div>
                            <div class="exp-title">${exp.role}</div>
                            <div class="exp-company">${exp.company}</div>
                        </div>
                        <div class="exp-date">${dateRange}</div>
                    </div>
                    ${location}
                    ${achievements}
                </div>
            `;
        }).join('');

        rendered = rendered.replace(/{{#if WORK_EXPERIENCE}}[\s\S]*?{{\/if}}/g,
            `<section id="experience-section">
                <h2>Professional Experience</h2>
                ${experienceHtml}
            </section>`);
    } else {
        rendered = rendered.replace(/{{#if WORK_EXPERIENCE}}[\s\S]*?{{\/if}}/g, '');
    }

    // Replace education - completely dynamic
    if (data.education && data.education.length > 0) {
        const educationHtml = data.education.map(edu => {
            const dateRange = edu.startDate && edu.endDate
                ? `${edu.startDate} – ${edu.endDate}`
                : '';

            const gpa = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
            const location = edu.location ? `, ${edu.location}` : '';

            return `
                <div class="edu-item">
                    <div class="edu-left">
                        <div class="edu-degree">${edu.degree}</div>
                        <div class="edu-school">${edu.institution}${location}${gpa}</div>
                    </div>
                    <div class="edu-date">${dateRange}</div>
                </div>
            `;
        }).join('');

        rendered = rendered.replace(/{{#if EDUCATION}}[\s\S]*?{{\/if}}/g,
            `<section id="education-section">
                <h2>Education</h2>
                ${educationHtml}
            </section>`);
    } else {
        rendered = rendered.replace(/{{#if EDUCATION}}[\s\S]*?{{\/if}}/g, '');
    }

    // Replace skills - completely dynamic
    if (data.skills && data.skills.length > 0) {
        const skillsHtml = data.skills.map(skillCategory => {
            if (skillCategory.items && skillCategory.items.length > 0) {
                return `<div class="skill-category"><strong>${skillCategory.category}:</strong> ${skillCategory.items.join(', ')}</div>`;
            }
            return '';
        }).filter(s => s).join('');

        rendered = rendered.replace(/{{#if SKILLS}}[\s\S]*?{{\/if}}/g,
            `<section id="skills-section" class="skills-section">
                <h2>Skills</h2>
                <div class="skills-list">
                    ${skillsHtml}
                </div>
            </section>`);
    } else {
        rendered = rendered.replace(/{{#if SKILLS}}[\s\S]*?{{\/if}}/g, '');
    }

    // Replace projects - completely dynamic
    if (data.projects && data.projects.length > 0) {
        const projectsHtml = data.projects.map(proj => {
            const tech = proj.technologies && proj.technologies.length > 0
                ? ` <em>(${proj.technologies.join(', ')})</em>`
                : '';

            const link = proj.link ? ` | ${proj.link}` : '';

            return `
                <div class="project-item">
                    <span class="project-title">${proj.name}</span>${link}
                    <div class="project-desc">${proj.description}${tech}</div>
                </div>
            `;
        }).join('');

        rendered = rendered.replace(/{{#if PROJECTS}}[\s\S]*?{{\/if}}/g,
            `<section id="projects-section">
                <h2>Projects</h2>
                ${projectsHtml}
            </section>`);
    } else {
        rendered = rendered.replace(/{{#if PROJECTS}}[\s\S]*?{{\/if}}/g, '');
    }

    // Replace certifications - completely dynamic
    if (data.certifications && data.certifications.length > 0) {
        const certificationsHtml = data.certifications.map(cert => {
            const link = cert.link ? ` | ${cert.link}` : '';
            return `<div class="cert-item"><span class="cert-name">${cert.name}</span> – ${cert.issuer}, ${cert.date}${link}</div>`;
        }).join('');

        rendered = rendered.replace(/{{#if CERTIFICATIONS}}[\s\S]*?{{\/if}}/g,
            `<section id="certifications-section">
                <h2>Certifications</h2>
                ${certificationsHtml}
            </section>`);
    } else {
        rendered = rendered.replace(/{{#if CERTIFICATIONS}}[\s\S]*?{{\/if}}/g, '');
    }

    // Clean up any remaining template tags
    rendered = rendered.replace(/{{.*?}}/g, '');

    return rendered;
}
