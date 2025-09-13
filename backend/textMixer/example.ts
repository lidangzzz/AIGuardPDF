import { TextMixer, TextMixerOptions, TextPiece } from './textMixer';
import { sampleMainArticle, sampleOtherArticles } from './sampleArticles';

// Example usage and test cases
function testTextMixer() {
  const originalText2 = `Hello world! This is a test message. 
  It contains multiple sentences with punctuation, spaces, and line breaks.
  We want to see how the text mixer handles this content.`;

  const originalText = `A hot dog[1][2] is a grilled, steamed, or boiled sausage served in the slit of a partially sliced bun.[3][4][5] The term hot dog can also refer to the sausage itself. The sausage used is a wiener (Vienna sausage) or a frankfurter (Frankfurter Würstchen, also just called frank). The names of these sausages commonly refer to their assembled dish.[6] Hot dog preparation and condiments vary worldwide. Common condiments include mustard, ketchup, relish, onions in tomato sauce, and cheese sauce. Other toppings include sauerkraut, diced onions, jalapeños, chili, grated cheese, coleslaw, bacon and olives. Hot dog variants include the corn dog and pigs in a blanket. The hot dog's cultural traditions include the Nathan's Hot Dog Eating Contest and the Oscar Mayer Wienermobile.`

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

  console.log('\n--- All Text Snippets Sequential ---');
  mixedText.forEach((piece) => {
    process.stdout.write(piece.text);
  });
  console.log('\n'); // Add a newline at the end

  return mixedText;
}

// Export the test function for use in other files
export { testTextMixer };

// Run the test if this file is executed directly
if (require.main === module) {
  testTextMixer();
}
