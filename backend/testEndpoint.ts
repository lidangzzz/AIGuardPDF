import fetch from 'node-fetch';

async function testMixedPdfEndpoint() {
  console.log('🧪 Testing /generate-mixed-pdf endpoint...');

  const requestBody = {
    originalText: "This is a secret message that needs to be hidden within other text.",
    mainArticle: `Artificial Intelligence (AI) is revolutionizing industries across the globe. From healthcare to finance, autonomous systems are transforming how we work and live. Machine learning algorithms can now process vast amounts of data, identify patterns, and make predictions with unprecedented accuracy. The future of AI holds immense potential, but also raises important ethical questions about privacy, bias, and the role of human oversight in automated decision-making processes.`,
    otherArticles: [
      "Climate change represents one of the greatest challenges facing humanity. Rising global temperatures, extreme weather events, and biodiversity loss are symptoms of a planet in crisis.",
      "Quantum computing promises to solve complex problems that are currently intractable for classical computers. By harnessing the principles of quantum mechanics, these systems could revolutionize cryptography, drug discovery, and materials science."
    ],
    includeStatistics: true,
    includeSpecialSequences: false,
    title: "Test Mixed PDF Document",
    author: "AIGuardPDF Test"
  };

  try {
    console.log('📤 Sending request to /generate-mixed-pdf...');
    const response = await fetch('http://localhost:3000/generate-mixed-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', response.status, errorText);
      return;
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log(`✅ PDF generated successfully! Size: ${pdfBuffer.byteLength} bytes`);

    // Save the PDF for inspection
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'endpoint-test-output.pdf');
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));
    console.log(`💾 PDF saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
  }
}

// Run the test
testMixedPdfEndpoint().then(() => {
  console.log('🎉 Endpoint test completed!');
}).catch(console.error);
