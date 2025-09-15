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
        // doc.fontSize(16).fillColor('black').opacity(1.0);
        // doc.text('Mixed Text Document', { align: 'center' });
        // doc.moveDown(2);

        // Process each text piece sequentially with precise positioning
        let xPosition: number = doc.x;
        let yPosition: number = doc.y;

        options.textPieces.forEach((piece) => {
          // Clean up text based on visibility
          let processedText = piece.text;

          if (piece.label === 'invisible') {
            // For invisible text (articles), remove unnecessary newlines and normalize whitespace
            processedText = piece.text
              .replace(/\n+/g, ' ')  // Replace multiple newlines with single space
              .replace(/\s+/g, ' ')  // Normalize multiple spaces to single space
              //.trim();  // Remove leading/trailing whitespace
          }
          // For visible text (original), keep newlines as they are

          if (piece.label === 'invisible') {
            // Hidden text: white color, very low opacity, tiny font
            doc.fillColor('white').opacity(0.01).fontSize(0.1);
            
            // Add hidden text character by character at precise positions
            for (let i = 0; i < processedText.length; i++) {
              const char = processedText[i];
              if (char === '\n') {
                // Handle newlines for visible text
                yPosition += doc.currentLineHeight();
                xPosition = doc.page.margins.left;
              } else {
                doc.text(char, xPosition, yPosition, { lineBreak: false });
                //xPosition += doc.widthOfString(char);
                
                // Check if we need to wrap to next line
                if (xPosition > doc.page.width - doc.page.margins.right) {
                  yPosition += doc.currentLineHeight();
                  xPosition = doc.page.margins.left;
                }
              }
            }
          } else {
            // Visible text: black color, full opacity, normal font size
            doc.fillColor('black').opacity(1.0).fontSize(10);
            
            // Add visible text character by character at precise positions
            for (let i = 0; i < processedText.length; i++) {
              const char = processedText[i];
              if (char === '\n') {
                // Handle newlines for visible text
                yPosition += doc.currentLineHeight();
                xPosition = doc.page.margins.left;
              } else {
                doc.text(char, xPosition, yPosition, { lineBreak: false });
                xPosition += doc.widthOfString(char);
                
                // Check if we need to wrap to next line
                if (xPosition > doc.page.width - doc.page.margins.right) {
                  yPosition += doc.currentLineHeight();
                  xPosition = doc.page.margins.left;
                }
              }
            }
          }
        });

        // Update document cursor position
        doc.x = xPosition;
        doc.y = yPosition;

        // Reset formatting
        doc.fillColor('black').opacity(1.0).fontSize(12);
        doc.text(''); // End the continued text

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
