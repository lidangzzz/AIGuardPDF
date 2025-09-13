import { TextMixer, TextMixerOptions, TextPiece } from './textMixer';
import { sampleMainArticle, sampleOtherArticles } from './sampleArticles';

// Example usage and test cases
function testTextMixer() {
  const originalText = `Hello world! This is a test message. 
  It contains multiple sentences with punctuation, spaces, and line breaks.
  We want to see how the text mixer handles this content.`;

  const options: TextMixerOptions = {
    originalText,
    mainArticle: sampleMainArticle,
    otherArticles: sampleOtherArticles,
    originalChunkSize: { min: 3, max: 7 },
    mainArticleChunkSize: { min: 20, max: 100 },
    otherArticleChunkSize: { min: 3, max: 7 }
  };

  console.log('=== TEXT MIXER TEST ===\n');
  console.log('Original text:', originalText);
  console.log('Original text length:', originalText.length);
  console.log('\n--- Mixing Text ---\n');

  const mixedText = TextMixer.mixTexts(options);
  
  console.log('Mixed text pieces:');
  mixedText.forEach((piece, index) => {
    console.log(`${index}: [${piece.label}] [${piece.source}] [${piece.index}] "${piece.text}"`);
  });

  console.log('\n--- Statistics ---');
  const stats = TextMixer.getStatistics(mixedText);
  console.log(stats);

  console.log('\n--- Reconstructed Visible Text ---');
  const visibleText = TextMixer.reconstructText(mixedText, 'visible');
  console.log(visibleText);

  console.log('\n--- Reconstructed Invisible Text ---');
  const invisibleText = TextMixer.reconstructText(mixedText, 'invisible');
  console.log(invisibleText.substring(0, 200) + '...');

  return mixedText;
}

// Export the test function for use in other files
export { testTextMixer };

// Run the test if this file is executed directly
if (require.main === module) {
  testTextMixer();
}
