# AIGuardPDF - Text Hiding in PDF Documents

A React TypeScript application that can hide text within PDF documents using advanced text mixing techniques.

## Features

### 📝 **Input Modes**
- **Plain Text**: Standard text to PDF conversion
- **Markdown**: Markdown formatting with Unicode support
- **Mixed Text (Hidden)**: Hide original text within larger articles

### 🔒 **Text Hiding Technology**
- **Text Mixer**: Breaks original text into chunks and interleaves them with article content
- **Invisible Text**: Hidden portions use white color, 0.01 opacity, and tiny font size
- **Sequential Processing**: Maintains text order while distributing chunks throughout articles
- **Unicode Support**: Works with any language and character set

### 🎨 **PDF Features**
- **Unicode Font Selection**: Automatic font detection for international characters
- **Special Sequences**: Optional red words, hidden characters, and indexed content
- **Statistics**: Document analysis showing visible/invisible text ratios
- **Real-time Preview**: Live PDF preview in the browser

## How Text Hiding Works

1. **Original Text**: Your secret message gets broken into small chunks (3-7 characters)
2. **Main Article**: Large article content where text will be hidden
3. **Mixing Process**: Chunks are interleaved with article content sequentially
4. **PDF Rendering**:
   - **Visible text**: Normal appearance (black, opacity 1.0, font size 10)
   - **Hidden text**: Nearly invisible (white, opacity 0.01, font size 0.1)

## Usage

### Frontend (http://localhost:5173)
1. Select "Mixed Text (Hidden)" mode
2. Enter your text to hide in the main textarea
3. Provide a main article where the text will be hidden
4. Optionally add additional articles (separate with blank lines)
5. Configure options (statistics, special sequences)
6. Click "Preview PDF" or "Download PDF"

### Backend API

#### Generate Mixed PDF
```bash
POST http://localhost:3000/generate-mixed-pdf
Content-Type: application/json

{
  "originalText": "Text to hide",
  "mainArticle": "Large article content...",
  "otherArticles": ["Additional", "articles"],
  "includeStatistics": true,
  "includeSpecialSequences": false,
  "title": "Document Title",
  "author": "Author Name"
}
```

## Technical Architecture

### Frontend (React + TypeScript + Vite)
- Split-screen layout with text editor and PDF preview
- Real-time mode switching
- Form validation and error handling
- Responsive design

### Backend (Node.js + Express + TypeScript)
- **TextMixer**: Core text mixing algorithm
- **PdfCreator**: PDF generation with styling control
- **Unicode Support**: Font selection and encoding
- **REST API**: Clean endpoints for PDF generation

### Key Components
- `textMixer.ts`: Text chunking and mixing logic
- `pdfCreator.ts`: PDF generation with visibility control
- `server.ts`: Express server with endpoints
- `App.tsx`: React frontend with UI

## Development

### Running the Application
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Testing
```bash
# Run PDF creator CLI test
cd backend && npm run test:pdfcreator
```

## Security Note

This tool demonstrates text hiding techniques for educational purposes. The hidden text, while nearly invisible, may still be detectable with appropriate tools or settings. Always consider the ethical implications of hiding information in documents.
