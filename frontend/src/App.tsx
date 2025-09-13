import { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'markdown'>('text');

  // Cleanup effect to revoke object URLs
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const exportToPDF = async () => {
    try {
      console.log('Sending request with text:', text, 'mode:', mode);
      const response = await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, mode }),
      });

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
        a.download = 'text.pdf';
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
      console.log('Sending request with text:', text, 'mode:', mode);
      const response = await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, mode }),
      });

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
                onChange={(e) => setMode(e.target.value as 'text' | 'markdown')}
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
                onChange={(e) => setMode(e.target.value as 'text' | 'markdown')}
                style={{ marginRight: '8px' }}
              />
              Markdown
            </label>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === 'markdown' ? "Enter your markdown here...\n\n# Example\n**bold** *italic*\n- list item\n\nSupports Unicode: 中文 العربية 日本語 🌍" : "Enter your text here...\n\nSupports Unicode characters from any language: 中文 العربية 日本語 🌍"}
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
          PDF Preview
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
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
              <div>PDF preview will appear here</div>
              <div style={{ fontSize: '14px', marginTop: '10px', color: '#999' }}>
                Enter {mode === 'markdown' ? 'markdown' : 'text'} on the left and click "Preview PDF" or "Download PDF"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
