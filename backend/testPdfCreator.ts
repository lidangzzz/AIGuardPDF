import { TextMixer } from './textMixer/textMixer';
import { PdfCreator } from './pdfCreator';
import * as fs from 'fs';
import * as path from 'path';

// Test the PDF creator with text mixer output
async function testPdfCreator() {
  console.log('🧪 Testing PDF Creator with Text Mixer...');

  // Sample texts for mixing
  const originalText = "This is a secret message that needs to be hidden.";
  const mainArticle = `Artificial Intelligence (AI) is revolutionizing industries across the globe. From healthcare to finance, autonomous systems are transforming how we work and live. Machine learning algorithms can now process vast amounts of data, identify patterns, and make predictions with unprecedented accuracy. The future of AI holds immense potential, but also raises important ethical questions about privacy, bias, and the role of human oversight in automated decision-making processes.`;

  const otherArticles = [
    "Climate change represents one of the greatest challenges facing humanity. Rising global temperatures, extreme weather events, and biodiversity loss are symptoms of a planet in crisis.",
    "Quantum computing promises to solve complex problems that are currently intractable for classical computers. By harnessing the principles of quantum mechanics, these systems could revolutionize cryptography, drug discovery, and materials science."
  ];

  try {
    // Mix the texts
    console.log('📝 Mixing texts...');
    const mixedTextPieces = TextMixer.mixTexts({
      originalText,
      mainArticle,
      otherArticles
    });

    console.log(`✅ Mixed ${mixedTextPieces.length} text pieces`);
    console.log(`📊 Statistics: ${mixedTextPieces.filter(p => p.label === 'visible').length} visible, ${mixedTextPieces.filter(p => p.label === 'invisible').length} invisible`);

    // Generate PDF
    console.log('📄 Generating PDF...');
    const pdfBuffer = await PdfCreator.createMixedPdf({
      textPieces: mixedTextPieces,
      title: 'Test Mixed Text Document',
      author: 'AIGuardPDF Test',
      includeStatistics: true,
      includeSpecialSequences: true
    });

    // Save PDF to file for testing
    const outputPath = path.join(__dirname, 'test-mixed-output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`✅ PDF generated successfully! Saved to: ${outputPath}`);
    console.log(`📏 PDF size: ${pdfBuffer.length} bytes`);

    // Also test the basic PDF creator
    console.log('📄 Testing basic PDF creator...');
    const basicPdfBuffer = await PdfCreator.createPdfFromTextPieces({
      textPieces: mixedTextPieces,
      title: 'Basic Mixed Text PDF',
      author: 'AIGuardPDF'
    });

    const basicOutputPath = path.join(__dirname, 'test-basic-output.pdf');
    fs.writeFileSync(basicOutputPath, basicPdfBuffer);

    console.log(`✅ Basic PDF generated successfully! Saved to: ${basicOutputPath}`);
    console.log(`📏 Basic PDF size: ${basicPdfBuffer.length} bytes`);

  } catch (error) {
    console.error('❌ Error during PDF creation test:', error);
  }
}

// Run the test
testPdfCreator().then(() => {
  console.log('🎉 PDF Creator test completed!');
}).catch(console.error);
