import express, { Request, Response, Application } from 'express';
import PDFKit from 'pdfkit';
import cors from 'cors';
import { randomArticleExample } from './randomArticle/example';
import { MarkdownRenderer } from './markdownRenderer';
import { TextMixer, TextMixerOptions, TextPiece } from './textMixer/textMixer';
import { sampleMainArticle, sampleOtherArticles } from './textMixer/sampleArticles';

// Types
interface GeneratePdfRequest {
  text: string;
  mode: 'text' | 'markdown';
}

interface PdfGenerationOptions {
  text: string;
  mode: 'text' | 'markdown';
}

interface ServerConfig {
  port: number;
}

// Configuration
const CONFIG: ServerConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
};

// Initialize Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for large Unicode content

// PDF Generation Service
class PdfService {
  private static readonly AVAILABLE_FONTS: string[] = [
    'Helvetica',
    'Helvetica-Bold',
    'Helvetica-Oblique',
    'Helvetica-BoldOblique',
    'Times-Roman',
    'Times-Bold',
    'Times-Italic',
    'Times-BoldItalic',
    'Courier',
    'Courier-Bold',
    'Courier-Oblique',
    'Courier-BoldOblique'
  ];

  private static hasUnicode(text: string): boolean {
    // Check if text contains Unicode characters beyond basic ASCII
    return /[^\x00-\x7F]/.test(text);
  }

  private static getBestFontForText(text: string): string {
    if (this.hasUnicode(text)) {
      // For Unicode text, prefer fonts that support more characters
      return 'Times-Roman'; // Times has better Unicode support than Helvetica
    }
    return 'Helvetica'; // Default for ASCII
  }

  private static sentences: string[] = [];

  private static initializeSentences(): void {
    if (this.sentences.length === 0) {
      // Split the article into sentences using regex
      this.sentences = randomArticleExample
        .split(/[.!?]+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 10) // Filter out very short sentences
        .filter(sentence => sentence.length < 200); // Filter out very long sentences
    }
  }

  private static getRandomSentence(): string {
    this.initializeSentences();
    if (this.sentences.length === 0) {
      return 'Sample sentence from the article.';
    }
    const randomIndex = Math.floor(Math.random() * this.sentences.length);
    return this.sentences[randomIndex];
  }

  private static getRandomFont(): string {
    // For random background strings, prefer Unicode-compatible fonts
    const unicodeFonts = ['Times-Roman', 'Times-Bold', 'Times-Italic', 'Times-BoldItalic'];
    const asciiFonts = ['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique'];
    
    // 70% chance to use Unicode-compatible fonts for better international support
    if (Math.random() < 0.7) {
      return unicodeFonts[Math.floor(Math.random() * unicodeFonts.length)];
    } else {
      return asciiFonts[Math.floor(Math.random() * asciiFonts.length)];
    }
  }

  private static getRandomWord(length: number = 7): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static getRandomPosition(pageWidth: number, pageHeight: number, textWidth: number, textHeight: number): { x: number; y: number } {
    const margin: number = 20;
    const x: number = margin + Math.random() * (pageWidth - textWidth - 2 * margin);
    const y: number = margin + Math.random() * (pageHeight - textHeight - 2 * margin);
    return { x, y };
  }

  static generatePdf(options: PdfGenerationOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc: InstanceType<typeof PDFKit> = new PDFKit();
        const buffers: Buffer[] = [];

        // Collect PDF data chunks
        doc.on('data', (chunk: Buffer): void => {
          buffers.push(chunk);
        });

        // Handle PDF generation completion
        doc.on('end', (): void => {
          const pdfData: Buffer = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Handle PDF generation errors
        doc.on('error', (error: Error): void => {
          reject(error);
        });

        // Set up document with Unicode support
        doc.info.Title = 'Unicode PDF Document';
        doc.info.Author = 'AIGuardPDF';
        
        // Render content based on mode
        if (options.mode === 'markdown') {
          const bestFont = this.getBestFontForText(options.text);
          MarkdownRenderer.renderMarkdown(doc, options.text, bestFont);
        } else {
          // Render plain text with Unicode support
          const bestFont = this.getBestFontForText(options.text);
          doc.font(bestFont);
          doc.text(options.text);
        }

        // Ensure we're on a new line and reset cursor position
        doc.moveDown(2);
        doc.x = 0; // Reset x position to start of line

        // Add special character sequences - FOREGROUND
        doc.moveDown(1); // Add some space

        // Add 500 red random words
        doc.fillColor('red');
        doc.fontSize(10); // Smaller font for words
        for (let i = 0; i < 500; i++) {
          const randomWord = this.getRandomWord(5); // 5-character words for better fit
          doc.text(randomWord + ' ', { continued: true });
        }
        doc.text(''); // End continued text

        // Add 2000 hidden "b" characters (invisible but present in PDF)
        doc.fillColor('white').opacity(0.01).fontSize(0.1);
        for (let i = 0; i < 2000; i++) {
          doc.text('b', { continued: true });
        }
        doc.text(''); // End continued text

        // Reset opacity and font size
        doc.opacity(1.0).fontSize(12);

        // Add 500 orange random words
        doc.fillColor('orange');
        doc.fontSize(10); // Smaller font for words
        for (let i = 0; i < 500; i++) {
          const randomWord = this.getRandomWord(5); // 5-character words for better fit
          doc.text(randomWord + ' ', { continued: true });
        }
        doc.text(''); // End continued text

        // Reset to default color
        doc.fillColor('black');

        // Add 1000 random 7-character words with 100 invisible "z" characters between each
        doc.moveDown(1); // Move to new line
        doc.x = 20; // Reset to left margin
        for (let i = 0; i < 1000; i++) {
          const index = i + 1;
          const randomWord = this.getRandomWord(7);
          doc.text(`${index}. ${randomWord} `, { continued: true });

          // Add 100 invisible "z" characters between words
          doc.fillColor('white').opacity(0.01).fontSize(0.1);
          for (let j = 0; j < 100; j++) {
            doc.text('z', { continued: true });
          }
          doc.fillColor('black').opacity(1.0).fontSize(12); // Reset color and opacity
        }
        doc.text(''); // End the continued text

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Routes
app.post('/generate-pdf', async (req: Request<{}, {}, GeneratePdfRequest>, res: Response): Promise<void> => {
  try {
    const { text, mode }: { text: string; mode: 'text' | 'markdown' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Invalid text provided' });
      return;
    }

    if (!mode || (mode !== 'text' && mode !== 'markdown')) {
      res.status(400).json({ error: 'Invalid mode provided. Must be "text" or "markdown"' });
      return;
    }

    // Generate PDF
    const pdfData: Buffer = await PdfService.generatePdf({ text, mode });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="text.pdf"');

    // Send PDF data
    res.send(pdfData);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(CONFIG.port, (): void => {
  console.log(`🚀 Server running on port ${CONFIG.port}`);
  console.log(`📊 Health check available at http://localhost:${CONFIG.port}/health`);
});
