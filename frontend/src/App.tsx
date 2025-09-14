import { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'markdown' | 'mixed'>('text');
  const [mainArticle, setMainArticle] = useState('');
  const [otherArticles, setOtherArticles] = useState('');
  const [includeStatistics, setIncludeStatistics] = useState(false);
  const [includeSpecialSequences, setIncludeSpecialSequences] = useState(false);

  // Load sample data when switching to mixed mode
  useEffect(() => {
    if (mode === 'mixed' && !text && !mainArticle) {
      // Auto-load sample data for demonstration
      setText(`A hot dog is a grilled, steamed, or boiled sausage served in the slit of a partially sliced bun. The term hot dog can also refer to the sausage itself.`);
      setMainArticle(`Artificial Intelligence has revolutionized the way we approach problem-solving in the modern era. Machine learning algorithms can now process vast amounts of data and identify patterns that would be impossible for humans to detect manually. Deep learning networks, inspired by the structure of the human brain, have achieved remarkable breakthroughs in image recognition, natural language processing, and predictive analytics.

The applications of AI span across numerous industries, from healthcare and finance to transportation and entertainment. In healthcare, AI systems can analyze medical images to detect diseases earlier than traditional methods. Financial institutions use AI for fraud detection, risk assessment, and algorithmic trading.`);
      setOtherArticles(`The quantum computing revolution is approaching rapidly. Quantum computers leverage the principles of quantum mechanics to perform calculations that are exponentially faster than classical computers for certain types of problems.

Climate change represents one of the most pressing challenges of our time. Rising global temperatures, extreme weather events, and biodiversity loss are reshaping our planet's ecosystem.`);
      setIncludeStatistics(true);
    }
  }, [mode, text, mainArticle]);

  const exportToPDF = async () => {
    try {
      let response;

      if (mode === 'mixed') {
        console.log('Sending mixed PDF request with:', {
          originalText: text,
          mainArticle,
          otherArticles: otherArticles.split('\n\n').filter(a => a.trim()),
          includeStatistics,
          includeSpecialSequences
        });

        response = await fetch('http://localhost:3000/generate-mixed-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalText: text,
            mainArticle,
            otherArticles: otherArticles.split('\n\n').filter(a => a.trim()),
            includeStatistics,
            includeSpecialSequences,
            title: 'Mixed Text PDF Document',
            author: 'AIGuardPDF'
          }),
        });
      } else {
        console.log('Sending request with text:', text, 'mode:', mode);
        response = await fetch('http://localhost:3000/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, mode }),
        });
      }

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob size:', blob.size);
        const url = window.URL.createObjectURL(blob);

        // Clean up previous URL if it exists
        if (pdfUrl) {
          window.URL.revokeObjectURL(pdfUrl);
        }

        // Set the PDF URL for display
        setPdfUrl(url);

        // Also trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = mode === 'mixed' ? 'mixed-text.pdf' : 'text.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Note: We keep the URL for display and clean it up in useEffect
      } else {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        alert('Error generating PDF: ' + errorText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating PDF: ' + (error as Error).message);
    }
  };

  const previewPDF = async () => {
    try {
      let response;

      if (mode === 'mixed') {
        console.log('Sending mixed PDF preview request with:', {
          originalText: text,
          mainArticle,
          otherArticles: otherArticles.split('\n\n').filter(a => a.trim()),
          includeStatistics,
          includeSpecialSequences
        });

        response = await fetch('http://localhost:3000/generate-mixed-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalText: text,
            mainArticle,
            otherArticles: otherArticles.split('\n\n').filter(a => a.trim()),
            includeStatistics,
            includeSpecialSequences,
            title: 'Mixed Text PDF Preview',
            author: 'AIGuardPDF'
          }),
        });
      } else {
        console.log('Sending request with text:', text, 'mode:', mode);
        response = await fetch('http://localhost:3000/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, mode }),
        });
      }

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob size:', blob.size);
        const url = window.URL.createObjectURL(blob);

        // Clean up previous URL if it exists
        if (pdfUrl) {
          window.URL.revokeObjectURL(pdfUrl);
        }

        // Set the PDF URL for display only (no download)
        setPdfUrl(url);
        console.log('PDF URL created:', url);
      } else {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        alert('Error generating PDF: ' + errorText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating PDF: ' + (error as Error).message);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left Side - Text Editor */}
      <div style={{
        flex: 1,
        padding: '20px',
        borderRight: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>Text to PDF Generator</h1>

        {/* Mode Selection */}
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            Input Mode:
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="mode"
                value="text"
                checked={mode === 'text'}
                onChange={(e) => setMode(e.target.value as 'text' | 'markdown' | 'mixed')}
                style={{ marginRight: '8px' }}
              />
              Plain Text
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="mode"
                value="markdown"
                checked={mode === 'markdown'}
                onChange={(e) => setMode(e.target.value as 'text' | 'markdown' | 'mixed')}
                style={{ marginRight: '8px' }}
              />
              Markdown
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="mode"
                value="mixed"
                checked={mode === 'mixed'}
                onChange={(e) => setMode(e.target.value as 'text' | 'markdown' | 'mixed')}
                style={{ marginRight: '8px' }}
              />
              Mixed Text (Hidden)
            </label>
          </div>
        </div>

        {/* Mixed Text Configuration */}
        {mode === 'mixed' && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#333' }}>
              Text Mixing Configuration
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#555'
              }}>
                Main Article (where text will be hidden):
              </label>
              <textarea
                value={mainArticle}
                onChange={(e) => setMainArticle(e.target.value)}
                placeholder="Enter the main article content where your original text will be hidden..."
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#555'
              }}>
                Additional Articles (optional, separate with blank lines):
              </label>
              <textarea
                value={otherArticles}
                onChange={(e) => setOtherArticles(e.target.value)}
                placeholder="Enter additional articles (one per paragraph, separated by blank lines)..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button
                onClick={() => {
                  setText(`A hot dog is a grilled, steamed, or boiled sausage served in the slit of a partially sliced bun. The term hot dog can also refer to the sausage itself. The sausage used is a wiener or a frankfurter. Hot dog preparation and condiments vary worldwide.`);
                  setMainArticle(`Artificial Intelligence has revolutionized the way we approach problem-solving in the modern era. Machine learning algorithms can now process vast amounts of data and identify patterns that would be impossible for humans to detect manually. Deep learning networks, inspired by the structure of the human brain, have achieved remarkable breakthroughs in image recognition, natural language processing, and predictive analytics.

The applications of AI span across numerous industries, from healthcare and finance to transportation and entertainment. In healthcare, AI systems can analyze medical images to detect diseases earlier than traditional methods. Financial institutions use AI for fraud detection, risk assessment, and algorithmic trading. Autonomous vehicles rely on AI to navigate safely through complex traffic scenarios.

However, the rapid advancement of AI also brings challenges and ethical considerations. Questions about job displacement, privacy concerns, and the need for transparent and explainable AI systems are at the forefront of current debates. As we continue to develop more sophisticated AI technologies, it becomes increasingly important to ensure they are developed and deployed responsibly.`);
                  setOtherArticles(`The quantum computing revolution is approaching rapidly. Quantum computers leverage the principles of quantum mechanics to perform calculations that are exponentially faster than classical computers for certain types of problems.

Climate change represents one of the most pressing challenges of our time. Rising global temperatures, extreme weather events, and biodiversity loss are reshaping our planet's ecosystem.

The exploration of space has captured human imagination for centuries. Recent advances in rocket technology and space exploration have opened new possibilities for human settlement on other planets.`);
                  setIncludeStatistics(true);
                  setIncludeSpecialSequences(false);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
              >
                Load Sample Data
              </button>
              <button
                onClick={() => {
                  setText('');
                  setMainArticle('');
                  setOtherArticles('');
                  setIncludeStatistics(false);
                  setIncludeSpecialSequences(false);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                Clear All
              </button>
            </div>

            <div style={{
              marginTop: '10px',
              fontSize: '12px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              💡 Your original text will be broken into small chunks and hidden within the main article.
              Visible text appears normal, hidden text is nearly invisible.
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              mode === 'mixed'
                ? "Enter the text you want to hide within the articles above..."
                : mode === 'markdown'
                ? "Enter your markdown here...\n\n# Example\n**bold** *italic*\n- list item\n\nSupports Unicode: 中文 العربية 日本語 🌍"
                : "Enter your text here...\n\nSupports Unicode characters from any language: 中文 العربية 日本語 🌍"
            }
            style={{
              flex: 1,
              padding: '15px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              backgroundColor: 'white'
            }}
            lang="en"
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />

          <div style={{
            marginTop: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <button
              onClick={previewPDF}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e7e34'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
            >
              Preview PDF
            </button>

            <button
              onClick={exportToPDF}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              Download PDF
            </button>

            {pdfUrl && (
              <span style={{
                color: '#28a745',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ✓ PDF Generated!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - PDF Preview */}
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      }}>
        <h2 style={{
          marginBottom: '20px',
          color: '#333',
          borderBottom: '2px solid #007bff',
          paddingBottom: '10px'
        }}>
          PDF Preview {mode === 'mixed' && '(Text Hidden)'}
        </h2>

        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{
                border: 'none',
                borderRadius: '6px'
              }}
              title="Generated PDF Preview"
            />
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#666',
              fontSize: '18px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                {mode === 'mixed' ? '�' : '�📄'}
              </div>
              <div>
                {mode === 'mixed'
                  ? 'Hidden text PDF preview will appear here'
                  : 'PDF preview will appear here'
                }
              </div>
              <div style={{ fontSize: '14px', marginTop: '10px', color: '#999' }}>
                {mode === 'mixed'
                  ? 'Enter your text to hide, main article, and click "Preview PDF" or "Download PDF"'
                  : `Enter ${mode === 'markdown' ? 'markdown' : 'text'} on the left and click "Preview PDF" or "Download PDF"`
                }
              </div>
              {mode === 'mixed' && (
                <div style={{
                  fontSize: '12px',
                  marginTop: '10px',
                  color: '#777',
                  fontStyle: 'italic',
                  maxWidth: '400px',
                  margin: '10px auto'
                }}>
                  Your original text will be mixed with the articles, appearing as normal text
                  while the hidden portions are nearly invisible in the PDF.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
