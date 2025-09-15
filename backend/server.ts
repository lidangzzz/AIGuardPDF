import express, { Request, Response, Application } from 'express';
import PDFKit from 'pdfkit';
import cors from 'cors';
import { TextMixer, TextPiece } from './textMixer/textMixer';
import { PdfCreator } from './pdfCreator';

// Types
interface GenerateMixedPdfRequest {
  originalText: string;
  mainArticle: string;
  otherArticles?: string[];
  includeStatistics?: boolean;
  includeSpecialSequences?: boolean;
  title?: string;
  author?: string;
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
}

// Routes
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
