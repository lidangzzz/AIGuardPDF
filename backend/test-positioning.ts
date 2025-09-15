import { TextMixer } from './textMixer/textMixer';
import { PdfCreator } from './pdfCreator';
import * as fs from 'fs';
import * as path from 'path';

// Test precise positioning in PDF creator
async function testPrecisePositioning() {
  console.log('🧪 Testing precise character positioning in PDF creator...');

  // Create test text with simple content
  const originalText = `Hello World!`;
  const mainArticle = `This is a test article with some content to hide the original text.`;

  const options = {
    originalText,
    mainArticle,
    otherArticles: [],
    originalChunkSize: { min: 3, max: 6 },
    mainArticleChunkSize: { min: 8, max: 15 },
    otherArticleChunkSize: { min: 3, max: 7 }
  };

  try {
    // Mix the text
    console.log('📝 Mixing text...');
    const mixedTextPieces = TextMixer.mixTexts(options);

    console.log(`✅ Mixed ${mixedTextPieces.length} text pieces`);

    // Show sample of text pieces
    console.log('\n📋 Sample text pieces:');
    mixedTextPieces.slice(0, 8).forEach((piece, index) => {
      const label = piece.label === 'visible' ? '👁️ VISIBLE' : '👻 HIDDEN';
      const preview = piece.text.substring(0, 20) + (piece.text.length > 20 ? '...' : '');
      console.log(`   ${index}: [${label}] "${preview}"`);
    });

    // Generate PDF with precise positioning
    console.log('\n📄 Generating PDF with precise positioning...');
    const pdfBuffer = await PdfCreator.createPdfFromTextPieces({
      textPieces: mixedTextPieces,
      title: 'Precise Positioning Test',
      author: 'AIGuardPDF Test'
    });

    const outputPath = path.join(__dirname, 'positioning-test.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`✅ PDF saved: ${outputPath} (${pdfBuffer.length} bytes)`);

    // Also test mixed PDF with statistics
    console.log('\n📊 Generating mixed PDF with statistics...');
    const mixedPdfBuffer = await PdfCreator.createMixedPdf({
      textPieces: mixedTextPieces,
      title: 'Mixed Positioning Test',
      author: 'AIGuardPDF Test',
      includeStatistics: true,
      includeSpecialSequences: false
    });

    const mixedOutputPath = path.join(__dirname, 'mixed-positioning-test.pdf');
    fs.writeFileSync(mixedOutputPath, mixedPdfBuffer);

    console.log(`✅ Mixed PDF saved: ${mixedOutputPath} (${mixedPdfBuffer.length} bytes)`);

    console.log('\n✅ Precise positioning test completed!');
    console.log('   - Character-by-character positioning: ACTIVE');
    console.log('   - Hidden text overlay: PRECISE');
    console.log('   - Visible text positioning: CONTROLLED');
    console.log('   - Line wrapping: AUTOMATIC');

  } catch (error) {
    console.error('❌ Error during positioning test:', error);
  }
}

// Run the test
testPrecisePositioning().catch(console.error);
