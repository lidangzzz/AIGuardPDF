import PDFKit from 'pdfkit';
import { TextPiece } from './textMixer/textMixer';

export interface PdfCreatorOptions {
  textPieces: TextPiece[];
  title?: string;
  author?: string;
}

export class PdfCreator {
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

  static createPdfFromTextPieces(options: PdfCreatorOptions): Promise<Buffer> {
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
        doc.info.Title = options.title || 'Text Mixer PDF Document';
        doc.info.Author = options.author || 'AIGuardPDF';

        // Determine the best font for the entire document based on all text
        const allText = options.textPieces.map(piece => piece.text).join('');
        const bestFont = this.getBestFontForText(allText);
        doc.font(bestFont);

        // Process each text piece sequentially
        options.textPieces.forEach((piece, index) => {
          if (piece.label === 'invisible') {
            // Hidden text: white color, very low opacity, tiny font
            doc.fillColor('white').opacity(0.01).fontSize(0.1);
          } else {
            // Visible text: black color, full opacity, normal font size
            doc.fillColor('black').opacity(1.0).fontSize(10);
          }

          // Add the text piece
          doc.text(piece.text, { continued: true });
        });

        // Reset formatting at the end
        doc.fillColor('black').opacity(1.0).fontSize(12);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper method to create PDF from mixed text with additional content
  static createMixedPdf(options: PdfCreatorOptions & {
    includeStatistics?: boolean;
    includeSpecialSequences?: boolean;
  }): Promise<Buffer> {
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

        // Set up document
        doc.info.Title = options.title || 'Mixed Text PDF Document';
        doc.info.Author = options.author || 'AIGuardPDF';

        // Determine the best font for the entire document
        const allText = options.textPieces.map(piece => piece.text).join('');
        const bestFont = this.getBestFontForText(allText);
        doc.font(bestFont);

        // Add title
        doc.fontSize(16).fillColor('black').opacity(1.0);
        doc.text('Mixed Text Document', { align: 'center' });
        doc.moveDown(2);

        // Process each text piece sequentially
        options.textPieces.forEach((piece) => {
          if (piece.label === 'invisible') {
            // Hidden text: white color, very low opacity, tiny font
            doc.fillColor('white').opacity(0.01).fontSize(0.1);
          } else {
            // Visible text: black color, full opacity, normal font size
            doc.fillColor('black').opacity(1.0).fontSize(10);
          }

          // Add the text piece
          doc.text(piece.text, { continued: true });
        });

        // Reset formatting
        doc.fillColor('black').opacity(1.0).fontSize(12);
        doc.text(''); // End the continued text

        // Add statistics if requested
        if (options.includeStatistics) {
          doc.moveDown(2);
          doc.fontSize(14);
          doc.text('Document Statistics:', { underline: true });
          doc.moveDown(1);

          const visibleCount = options.textPieces.filter(p => p.label === 'visible').length;
          const invisibleCount = options.textPieces.filter(p => p.label === 'invisible').length;
          const totalCount = options.textPieces.length;

          doc.fontSize(10);
          doc.text(`Total text pieces: ${totalCount}`);
          doc.text(`Visible pieces: ${visibleCount}`);
          doc.text(`Invisible pieces: ${invisibleCount}`);
          doc.text(`Visibility ratio: ${((visibleCount / totalCount) * 100).toFixed(2)}%`);
        }

        // Add special character sequences if requested
        if (options.includeSpecialSequences) {
          doc.moveDown(2);

          // Add 500 red random words
          doc.fillColor('red').fontSize(10);
          doc.text('Special Sequences - Red Words:', { underline: true });
          doc.moveDown(1);
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
          doc.text('Special Sequences - Orange Words:', { underline: true });
          doc.moveDown(1);
          for (let i = 0; i < 500; i++) {
            const randomWord = this.getRandomWord(5);
            doc.text(randomWord + ' ', { continued: true });
          }
          doc.text('');

          // Add 1000 indexed random words with invisible "z" characters
          doc.fillColor('black').fontSize(12);
          doc.moveDown(1);
          doc.text('Special Sequences - Indexed Words:', { underline: true });
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
        }

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
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
