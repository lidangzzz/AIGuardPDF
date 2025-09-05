import express, { Request, Response, Application } from 'express';
import PDFKit from 'pdfkit';
import cors from 'cors';
import { randomArticleExample } from './randomArticle/example';

// Types
interface GeneratePdfRequest {
  text: string;
}

interface PdfGenerationOptions {
  text: string;
}

interface ServerConfig {
  port: number;
}

// Configuration
const CONFIG: ServerConfig = {
  port: 3000,
};

// Initialize Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

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
    return this.AVAILABLE_FONTS[Math.floor(Math.random() * this.AVAILABLE_FONTS.length)];
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

        // Add user text - FOREGROUND
        doc.text(options.text);

        // Add all characters on the same line with different colors - FOREGROUND
        let xPosition: number = doc.x;
        const yPosition: number = doc.y;

        // Add 10 red "a" characters
        doc.fillColor('red');
        for (let i: number = 0; i < 10; i++) {
          doc.text('a', xPosition, yPosition, { lineBreak: false });
          xPosition += doc.widthOfString('a');
        }

        // keep the end position for next characters
        const endXPosition: number = xPosition;

        // Add 10 hidden "b" characters (invisible but present in PDF)
        doc.fillColor('white').opacity(0.01).fontSize(0.1);
        for (let i: number = 0; i < 100; i++) {
          doc.text('b', xPosition, yPosition, { lineBreak: false });
          xPosition += doc.widthOfString('b');
        }

        xPosition = endXPosition;

        // Reset opacity and font size
        doc.opacity(1.0).fontSize(12);

        // Add 10 orange "c" characters
        doc.fillColor('orange').fontSize(12);
        for (let i: number = 0; i < 10; i++) {
          doc.text('c', xPosition, yPosition, { lineBreak: false });
          xPosition += doc.widthOfString('c');
        }

        // Move to next line after all characters are added
        doc.moveDown();

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static addRandomStrings(doc: InstanceType<typeof PDFKit>, totalChars: number): void {
    let remainingChars: number = totalChars;
    const pageWidth: number = doc.page.width;
    const pageHeight: number = doc.page.height;

    while (remainingChars > 0) {
      // Get a random sentence from the article
      const randomSentence: string = this.getRandomSentence();

      // Select random font
      const randomFont: string = this.getRandomFont();

      // Set lighter yellow color and random font
      doc.fillColor('#FFFF99').font(randomFont); // Light yellow color

      // Generate random font size (8-24pt)
      const fontSize: number = Math.floor(Math.random() * 17) + 8;
      doc.fontSize(fontSize);

      // Calculate text dimensions
      const textWidth: number = doc.widthOfString(randomSentence);
      const textHeight: number = doc.heightOfString(randomSentence);

      // Get random position
      const position = this.getRandomPosition(pageWidth, pageHeight, textWidth, textHeight);

      // Add the random sentence at random position
      doc.text(randomSentence, position.x, position.y);

      // Update remaining characters
      remainingChars -= randomSentence.length;
    }

    // Reset to default font and color
    doc.fillColor('black').font('Helvetica').fontSize(12);
  }
}

// Routes
app.post('/generate-pdf', async (req: Request<{}, {}, GeneratePdfRequest>, res: Response): Promise<void> => {
  try {
    const { text }: { text: string } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Invalid text provided' });
      return;
    }

    // Generate PDF
    const pdfData: Buffer = await PdfService.generatePdf({ text });

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
