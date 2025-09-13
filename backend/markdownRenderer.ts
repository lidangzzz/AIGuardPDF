import PDFKit from 'pdfkit';
import MarkdownIt from 'markdown-it';

export class MarkdownRenderer {
  static renderMarkdown(doc: InstanceType<typeof PDFKit>, markdownText: string, font: string = 'Helvetica'): void {
    const md = new MarkdownIt();
    const tokens = md.parse(markdownText, {});

    for (const token of tokens) {
      this.renderToken(doc, token, font);
    }
  }

  private static hasUnicode(text: string): boolean {
    // Check for characters outside the basic Latin range
    return /[^\u0000-\u007F]/.test(text);
  }

  private static getBestFontForText(text: string): string {
    if (this.hasUnicode(text)) {
      // Use Times-Roman for Unicode characters as it has better Unicode support
      return 'Times-Roman';
    }
    return 'Helvetica';
  }

  private static renderToken(doc: InstanceType<typeof PDFKit>, token: any, font: string = 'Helvetica'): void {
    switch (token.type) {
      case 'heading_open':
        this.renderHeading(doc, token, font);
        break;
      case 'heading_close':
        // Reset font size and style after heading
        doc.fontSize(12).font(this.getBestFontForText(''));
        break;
      case 'paragraph_open':
        // Handle paragraph spacing
        doc.moveDown(0.5);
        break;
      case 'paragraph_close':
        // Add space after paragraph
        doc.moveDown(0.5);
        break;
      case 'text':
        this.renderText(doc, token, font);
        break;
      case 'strong_open':
        doc.font(this.getBestFontForText('') + '-Bold');
        break;
      case 'strong_close':
        doc.font(this.getBestFontForText(''));
        break;
      case 'em_open':
        doc.font(this.getBestFontForText('') + '-Oblique');
        break;
      case 'em_close':
        doc.font(this.getBestFontForText(''));
        break;
      case 'bullet_list_open':
      case 'ordered_list_open':
        doc.moveDown(0.5);
        break;
      case 'bullet_list_close':
      case 'ordered_list_close':
        doc.moveDown(0.5);
        break;
      case 'list_item_open':
        doc.text('• ', { continued: true });
        break;
      case 'list_item_close':
        doc.moveDown();
        break;
      case 'blockquote_open':
        doc.moveDown(0.5);
        doc.font(this.getBestFontForText('') + '-Italic');
        break;
      case 'blockquote_close':
        doc.font(this.getBestFontForText(''));
        doc.moveDown(0.5);
        break;
      case 'code_inline':
        doc.font('Courier');
        doc.text(token.content, { continued: true });
        doc.font(this.getBestFontForText(''));
        break;
      case 'fence':
        this.renderCodeBlock(doc, token, font);
        break;
      case 'link_open':
        // For now, just render the text without link styling
        break;
      case 'link_close':
        // Reset any link-specific styling
        break;
      default:
        // Handle other token types or ignore
        break;
    }

    // Recursively render child tokens
    if (token.children) {
      for (const child of token.children) {
        this.renderToken(doc, child, font);
      }
    }
  }

  private static renderHeading(doc: InstanceType<typeof PDFKit>, token: any, font: string = 'Helvetica'): void {
    if (!token.tag || !token.tag.startsWith('h')) {
      console.error('Invalid heading token:', token);
      return;
    }

    const level = parseInt(token.tag.substring(1)); // h1, h2, etc.
    doc.moveDown(1);

    const baseFont = this.getBestFontForText('');
    switch (level) {
      case 1:
        doc.fontSize(24).font(baseFont + '-Bold');
        break;
      case 2:
        doc.fontSize(20).font(baseFont + '-Bold');
        break;
      case 3:
        doc.fontSize(16).font(baseFont + '-Bold');
        break;
      case 4:
        doc.fontSize(14).font(baseFont + '-Bold');
        break;
      case 5:
        doc.fontSize(12).font(baseFont + '-Bold');
        break;
      case 6:
        doc.fontSize(11).font(baseFont + '-Bold');
        break;
      default:
        doc.fontSize(12).font(baseFont + '-Bold');
        break;
    }
  }

  private static renderText(doc: InstanceType<typeof PDFKit>, token: any, font: string = 'Helvetica'): void {
    const bestFont = this.getBestFontForText(token.content);
    doc.font(bestFont);
    doc.text(token.content, { continued: true });
  }

  private static renderCodeBlock(doc: InstanceType<typeof PDFKit>, token: any, font: string = 'Helvetica'): void {
    doc.moveDown(0.5);
    doc.font('Courier').fontSize(10);
    doc.text(token.content);
    const baseFont = this.getBestFontForText('');
    doc.font(baseFont).fontSize(12);
    doc.moveDown(0.5);
  }
}
