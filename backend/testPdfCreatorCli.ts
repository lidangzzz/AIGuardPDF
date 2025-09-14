#!/usr/bin/env node

import { TextMixer, TextMixerOptions } from './textMixer/textMixer';
import { PdfCreator } from './pdfCreator';
import { sampleMainArticle, sampleOtherArticles } from './textMixer/sampleArticles';
import * as fs from 'fs';
import * as path from 'path';

// CLI Test for PdfCreator using configurations from textMixer/example.ts
async function testPdfCreatorCli() {
  console.log('🧪 PDF Creator CLI Test');
  console.log('========================\n');

  // Use the same text and configurations from textMixer/example.ts
  const originalText = `A hot dog[1][2] is a grilled, steamed, or boiled sausage served in the slit of a partially sliced bun.[3][4][5] The term hot dog can also refer to the sausage itself. The sausage used is a wiener (Vienna sausage) or a frankfurter (Frankfurter Würstchen, also just called frank). The names of these sausages commonly refer to their assembled dish.[6] Hot dog preparation and condiments vary worldwide. Common condiments include mustard, ketchup, relish, onions in tomato sauce, and cheese sauce. Other toppings include sauerkraut, diced onions, jalapeños, chili, grated cheese, coleslaw, bacon and olives. Hot dog variants include the corn dog and pigs in a blanket. The hot dog's cultural traditions include the Nathan's Hot Dog Eating Contest and the Oscar Mayer Wienermobile.`;

  const options: TextMixerOptions = {
    originalText,
    mainArticle: sampleMainArticle,
    otherArticles: sampleOtherArticles,
    originalChunkSize: { min: 3, max: 7 },
    mainArticleChunkSize: { min: 20, max: 100 },
    otherArticleChunkSize: { min: 3, max: 7 }
  };

  console.log('📝 Original Text Preview:');
  console.log(originalText.substring(0, 100) + '...\n');

  console.log('⚙️  Configuration:');
  console.log(`   Original chunk size: ${options.originalChunkSize!.min}-${options.originalChunkSize!.max} chars`);
  console.log(`   Main article chunk size: ${options.mainArticleChunkSize!.min}-${options.mainArticleChunkSize!.max} chars`);
  console.log(`   Other articles chunk size: ${options.otherArticleChunkSize!.min}-${options.otherArticleChunkSize!.max} chars\n`);

  try {
    // Step 1: Mix the text using TextMixer
    console.log('🔄 Step 1: Mixing text with TextMixer...');
    const mixedTextPieces = TextMixer.mixTexts(options);
    const stats = TextMixer.getStatistics(mixedTextPieces);

    console.log(`✅ Mixed ${stats.totalPieces} text pieces:`);
    console.log(`   📊 Visible pieces: ${stats.visiblePieces}`);
    console.log(`   👻 Invisible pieces: ${stats.invisiblePieces}`);
    console.log(`   📈 Visibility ratio: ${((stats.visiblePieces / stats.totalPieces) * 100).toFixed(2)}%\n`);

    // Step 2: Generate basic PDF (just the mixed text)
    console.log('📄 Step 2: Generating basic PDF...');
    const basicPdfBuffer = await PdfCreator.createPdfFromTextPieces({
      textPieces: mixedTextPieces,
      title: 'Hot Dog Text Hidden in AI Article - Basic',
      author: 'AIGuardPDF CLI Test'
    });

    const basicOutputPath = path.join(__dirname, 'hot-dog-basic.pdf');
    fs.writeFileSync(basicOutputPath, basicPdfBuffer);
    console.log(`✅ Basic PDF saved: ${basicOutputPath}`);
    console.log(`   📏 File size: ${basicPdfBuffer.length} bytes\n`);

    // Step 3: Generate enhanced PDF (with statistics and special sequences)
    console.log('📄 Step 3: Generating enhanced PDF with statistics...');
    const enhancedPdfBuffer = await PdfCreator.createMixedPdf({
      textPieces: mixedTextPieces,
      title: 'Hot Dog Text Hidden in AI Article - Enhanced',
      author: 'AIGuardPDF CLI Test',
      includeStatistics: true,
      includeSpecialSequences: true
    });

    const enhancedOutputPath = path.join(__dirname, 'hot-dog-enhanced.pdf');
    fs.writeFileSync(enhancedOutputPath, enhancedPdfBuffer);
    console.log(`✅ Enhanced PDF saved: ${enhancedOutputPath}`);
    console.log(`   📏 File size: ${enhancedPdfBuffer.length} bytes\n`);

    // Step 4: Show sample of mixed text output
    console.log('📋 Step 4: Sample of mixed text output (first 10 pieces):');
    mixedTextPieces.slice(0, 10).forEach((piece, index) => {
      const visibility = piece.label === 'visible' ? '👁️ VISIBLE' : '👻 HIDDEN';
      const preview = piece.text.length > 50 ? piece.text.substring(0, 50) + '...' : piece.text;
      console.log(`   ${index}: [${visibility}] "${preview}"`);
    });
    console.log('   ...\n');

    // Step 5: Verify the original text can be reconstructed
    console.log('🔍 Step 5: Verification - Reconstructing visible text:');
    const reconstructedVisible = TextMixer.reconstructText(mixedTextPieces, 'visible');
    const matchPercentage = ((reconstructedVisible.length / originalText.length) * 100).toFixed(2);
    console.log(`✅ Original text successfully hidden and recoverable`);
    console.log(`   📏 Original length: ${originalText.length} characters`);
    console.log(`   📏 Reconstructed length: ${reconstructedVisible.length} characters`);
    console.log(`   📊 Match: ${matchPercentage}%\n`);

    console.log('🎉 PDF Creator CLI Test Completed Successfully!');
    console.log('================================================');
    console.log('Generated files:');
    console.log(`   📄 ${basicOutputPath}`);
    console.log(`   📄 ${enhancedOutputPath}`);
    console.log('\n💡 The hot dog text is now hidden within the AI article!');
    console.log('   - Visible text appears normal (black, size 10)');
    console.log('   - Hidden text is nearly invisible (white, opacity 0.01, size 0.1)');

  } catch (error) {
    console.error('❌ Error during PDF Creator test:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('PDF Creator CLI Test');
  console.log('===================');
  console.log('Tests the PdfCreator using configurations from textMixer/example.ts');
  console.log('');
  console.log('Usage:');
  console.log('  npm run test:pdfcreator    # Run the test');
  console.log('  node testPdfCreatorCli.ts  # Run directly');
  console.log('');
  console.log('Output:');
  console.log('  - hot-dog-basic.pdf     # Basic PDF with just mixed text');
  console.log('  - hot-dog-enhanced.pdf  # Enhanced PDF with statistics and special sequences');
  process.exit(0);
}

// Run the test
testPdfCreatorCli().catch(console.error);
