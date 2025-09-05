import { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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
      const response = await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const blob = await response.blob();
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
        alert('Error generating PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating PDF');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Text to PDF Generator</h1>
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here"
          rows={10}
          cols={50}
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={exportToPDF}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Generate & Download PDF
        </button>
      </div>
      
      {pdfUrl && (
        <div style={{ marginTop: '30px' }}>
          <h2>Generated PDF Preview:</h2>
          <div style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              style={{
                border: 'none',
                borderRadius: '4px'
              }}
              title="Generated PDF Preview"
            />
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            PDF has been generated and downloaded. You can also view it above.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
