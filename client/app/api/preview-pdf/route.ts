import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { renderTemplate } from '@/lib/template-renderer';
import { sampleResumeData } from '@/lib/sample-data';
import { Buffer } from 'node:buffer';

// In-memory cache for PDF previews
const pdfCache = new Map<string, { buffer: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Persistent browser instance
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    });
  }
  return browserInstance;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId } = body;

    if (!templateId) {
      return new NextResponse(JSON.stringify({ error: 'templateId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    const cached = pdfCache.get(templateId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Serving cached PDF for ${templateId}`);
      const buffer = Buffer.from(cached.buffer, 'base64');
      return new NextResponse(new Blob([new Uint8Array(buffer)], { type: 'application/pdf' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${templateId}-preview.pdf"`,
          'Cache-Control': 'public, max-age=1800', // 30 minutes
        },
      });
    }

    // Generate PDF
    const templatePath = path.join(process.cwd(), 'public', 'templates', `${templateId}.html`);
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
    const renderedHtml = renderTemplate(htmlTemplate, sampleResumeData);

    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 816, height: 1056 });

    // Load content with faster waitUntil option
    await page.setContent(renderedHtml, { waitUntil: 'domcontentloaded' });

    // Inject styles
    await page.addStyleTag({
      content: `
        body {
          -webkit-print-color-adjust: exact;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          background-color: #ffffff;
        }
        @media print {
          body { margin: 0; padding: 20px; }
        }
      `,
    });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    // Close the page (but keep browser alive)
    await page.close();

    // Cache the result
    pdfCache.set(templateId, {
      buffer: Buffer.from(pdfBuffer).toString('base64'),
      timestamp: Date.now(),
    });

    console.log(`Generated and cached PDF for ${templateId}`);

    return new NextResponse(new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${templateId}-preview.pdf"`,
        'Cache-Control': 'public, max-age=1800',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
