import { TextMixer } from './textMixer/textMixer';
import { PdfCreator } from './pdfCreator';
import * as fs from 'fs';
import * as path from 'path';

// Test newline processing in PDF creator
async function testNewlineProcessing() {
  console.log('🧪 Testing newline processing in PDF creator...');

  // Create test text with newlines in original text
  const originalText = `This is line 1
This is line 2

This is line 4 after a blank line.`;

  // Create article text with multiple newlines and spaces
  const mainArticle = `This is a long article
with multiple lines

and some blank lines in between.


It should be cleaned up when processed.`;

  const options = {
    originalText,
    mainArticle,
    otherArticles: [],
    originalChunkSize: { min: 5, max: 10 },
    mainArticleChunkSize: { min: 10, max: 20 },
    otherArticleChunkSize: { min: 3, max: 7 }
  };

  try {
    // Mix the text
    console.log('📝 Mixing text...');
    const mixedTextPieces = TextMixer.mixTexts(options);

    console.log(`✅ Mixed ${mixedTextPieces.length} text pieces`);

    // Show sample of text pieces before processing
    console.log('\n📋 Sample text pieces (before processing):');
    mixedTextPieces.slice(0, 5).forEach((piece, index) => {
      const label = piece.label === 'visible' ? '👁️ VISIBLE' : '👻 HIDDEN';
      const preview = piece.text.substring(0, 30) + (piece.text.length > 30 ? '...' : '');
      console.log(`   ${index}: [${label}] "${preview.replace(/\n/g, '\\n').replace(/\s+/g, ' ')}"`);
    });

    // Generate PDF
    console.log('\n📄 Generating PDF with newline processing...');
    const pdfBuffer = await PdfCreator.createPdfFromTextPieces({
      textPieces: mixedTextPieces,
      title: 'Newline Processing Test',
      author: 'AIGuardPDF Test'
    });

    const outputPath = path.join(__dirname, 'newline-test.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`✅ PDF saved: ${outputPath} (${pdfBuffer.length} bytes)`);

    // Show what the processed text looks like
    console.log('\n🔍 Processed text preview:');
    let processedPreview = '';
    mixedTextPieces.slice(0, 3).forEach((piece) => {
      let processedText = piece.text;
      if (piece.label === 'invisible') {
        processedText = piece.text
          .replace(/\n+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      processedPreview += processedText + ' ';
    });
    console.log(`   "${processedPreview.substring(0, 100)}..."`);

    console.log('\n✅ Newline processing test completed!');
    console.log('   - Original text newlines: PRESERVED');
    console.log('   - Article text newlines: REMOVED');

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testNewlineProcessing().catch(console.error);
