export interface TextPiece {
  text: string;
  label: 'visible' | 'invisible';
  source: string;
  index: number;
}

export interface TextMixerOptions {
  originalText: string;
  mainArticle: string;
  otherArticles?: string[];
  originalChunkSize?: { min: number; max: number };
  mainArticleChunkSize?: { min: number; max: number };
  otherArticleChunkSize?: { min: number; max: number };
}

export class TextMixer {
  private static getRandomChunkSize(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static splitTextIntoChunks(
    text: string,
    chunkSize: { min: number; max: number },
    source: string,
    label: 'visible' | 'invisible'
  ): TextPiece[] {
    const chunks: TextPiece[] = [];
    let currentIndex = 0;
    let sourceIndex = 0;

    while (currentIndex < text.length) {
      const size = this.getRandomChunkSize(chunkSize.min, chunkSize.max);
      const chunk = text.substring(currentIndex, Math.min(currentIndex + size, text.length));
      
      chunks.push({
        text: chunk,
        label,
        source,
        index: sourceIndex
      });

      currentIndex += size;
      sourceIndex++;
    }

    return chunks;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static mixTexts(options: TextMixerOptions): TextPiece[] {
    const {
      originalText,
      mainArticle,
      otherArticles = [],
      originalChunkSize = { min: 3, max: 7 },
      mainArticleChunkSize = { min: 20, max: 100 },
      otherArticleChunkSize = { min: 3, max: 7 }
    } = options;

    // Split original text into small visible chunks
    const originalChunks = this.splitTextIntoChunks(
      originalText,
      originalChunkSize,
      'original text',
      'visible'
    );

    // Split main article into large invisible chunks
    const mainArticleChunks = this.splitTextIntoChunks(
      mainArticle,
      mainArticleChunkSize,
      'main article',
      'invisible'
    );

    // Split other articles into small invisible chunks
    const otherArticleChunks: TextPiece[] = [];
    otherArticles.forEach((article, index) => {
      const chunks = this.splitTextIntoChunks(
        article,
        otherArticleChunkSize,
        `other article ${index + 1}`,
        'invisible'
      );
      otherArticleChunks.push(...chunks);
    });

    // Create the mixed array - sequential order, no shuffling
    const mixedText: TextPiece[] = [];
    let originalIndex = 0;
    let mainArticleIndex = 0;
    let otherArticleIndex = 0;

    // Continue until all original text is processed
    while (originalIndex < originalChunks.length) {
      // Decide what to add next (weighted towards hidden content to hide original)
      const rand = Math.random();
      
      if (rand < 0.3) {
        // Add original text piece (30% chance)
        mixedText.push(originalChunks[originalIndex]);
        originalIndex++;
      } else if (rand < 0.8) {
        // Add main article piece (50% chance) - maintain sequential order
        if (mainArticleIndex < mainArticleChunks.length) {
          mixedText.push(mainArticleChunks[mainArticleIndex]);
          mainArticleIndex++;
        } else {
          // Restart main article from beginning if we've used it all
          mainArticleIndex = 0;
          mixedText.push(mainArticleChunks[mainArticleIndex]);
          mainArticleIndex++;
        }
      } else {
        // Add other article piece (20% chance) - maintain sequential order
        if (otherArticleChunks.length > 0) {
          if (otherArticleIndex >= otherArticleChunks.length) {
            otherArticleIndex = 0; // Restart from beginning
          }
          mixedText.push(otherArticleChunks[otherArticleIndex]);
          otherArticleIndex++;
        } else {
          // If no other articles, add main article instead
          if (mainArticleIndex < mainArticleChunks.length) {
            mixedText.push(mainArticleChunks[mainArticleIndex]);
            mainArticleIndex++;
          } else {
            mainArticleIndex = 0;
            mixedText.push(mainArticleChunks[mainArticleIndex]);
            mainArticleIndex++;
          }
        }
      }
    }

    // Return without shuffling to maintain sequential order
    return mixedText;
  }

  // Helper method to get statistics about the mixed text
  static getStatistics(mixedText: TextPiece[]): {
    totalPieces: number;
    visiblePieces: number;
    invisiblePieces: number;
    sourceBreakdown: Record<string, number>;
  } {
    const stats = {
      totalPieces: mixedText.length,
      visiblePieces: 0,
      invisiblePieces: 0,
      sourceBreakdown: {} as Record<string, number>
    };

    mixedText.forEach(piece => {
      if (piece.label === 'visible') {
        stats.visiblePieces++;
      } else {
        stats.invisiblePieces++;
      }

      if (!stats.sourceBreakdown[piece.source]) {
        stats.sourceBreakdown[piece.source] = 0;
      }
      stats.sourceBreakdown[piece.source]++;
    });

    return stats;
  }

  // Helper method to reconstruct text from pieces (useful for debugging)
  static reconstructText(mixedText: TextPiece[], labelFilter?: 'visible' | 'invisible'): string {
    return mixedText
      .filter(piece => !labelFilter || piece.label === labelFilter)
      .map(piece => piece.text)
      .join('');
  }
}
