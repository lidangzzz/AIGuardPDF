import express, { Request, Response, Application } from 'express';
import PDFKit from 'pdfkit';
import cors from 'cors';
import { MarkdownRenderer } from './markdownRenderer';
import { TextMixer, TextPiece } from './textMixer/textMixer';
import { PdfCreator } from './pdfCreator';

// Types
interface GeneratePdfRequest {
  text: string;
  mode: 'text' | 'markdown';
}

interface GenerateMixedPdfRequest {
  originalText: string;
  mainArticle: string;
  otherArticles?: string[];
  includeStatistics?: boolean;
  includeSpecialSequences?: boolean;
  title?: string;
  author?: string;
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

  private static getRandomWord(length: number = 7): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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

        // Add special character sequences
        doc.moveDown(2);

        // Add 500 red random words
        doc.fillColor('red').fontSize(10);
        for (let i = 0; i < 500; i++) {
          const randomWord = this.getRandomWord(5);
          doc.text(randomWord + ' ', { continued: true });
        }
        doc.text('');

        // Add 2000 hidden "b" characters
        doc.fillColor('white').opacity(0.01).fontSize(0.1);
        for (let i = 0; i < 2000; i++) {
          doc.text('b', { continued: true });
        }
        doc.text('');

        // Add 500 orange random words
        doc.fillColor('orange').opacity(1.0).fontSize(10);
        for (let i = 0; i < 500; i++) {
          const randomWord = this.getRandomWord(5);
          doc.text(randomWord + ' ', { continued: true });
        }
        doc.text('');

        // Add 1000 indexed random words with invisible "z" characters
        doc.fillColor('black').fontSize(12);
        doc.moveDown(1);
        for (let i = 0; i < 1000; i++) {
          const index = i + 1;
          const randomWord = this.getRandomWord(7);
          doc.text(`${index}. ${randomWord} `, { continued: true });

          // Add 100 invisible "z" characters
          doc.fillColor('white').opacity(0.01).fontSize(0.1);
          for (let j = 0; j < 100; j++) {
            doc.text('z', { continued: true });
          }
          doc.fillColor('black').opacity(1.0).fontSize(12);
        }
        doc.text('');

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

app.post('/generate-mixed-pdf', async (req: Request<{}, {}, GenerateMixedPdfRequest>, res: Response): Promise<void> => {
  try {
    const {
      originalText,
      mainArticle,
      otherArticles = [],
      includeStatistics = false,
      includeSpecialSequences = false,
      title,
      author
    }: GenerateMixedPdfRequest = req.body;

    // Validate input
    if (!originalText || typeof originalText !== 'string') {
      res.status(400).json({ error: 'Invalid originalText provided' });
      return;
    }

    if (!mainArticle || typeof mainArticle !== 'string') {
      res.status(400).json({ error: 'Invalid mainArticle provided' });
      return;
    }

    if (!Array.isArray(otherArticles)) {
      res.status(400).json({ error: 'otherArticles must be an array' });
      return;
    }

    // Mix the texts using TextMixer
    const mixedTextPieces: TextPiece[] = TextMixer.mixTexts({
      originalText,
      mainArticle,
      otherArticles
    });

    // Generate PDF using PdfCreator
    const pdfData: Buffer = await PdfCreator.createMixedPdf({
      textPieces: mixedTextPieces,
      title,
      author,
      includeStatistics,
      includeSpecialSequences
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="mixed-text.pdf"');

    // Send PDF data
    res.send(pdfData);
  } catch (error) {
    console.error('Mixed PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate mixed PDF' });
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
