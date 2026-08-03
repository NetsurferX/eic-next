import React from 'react';

// Culorile din speciaficația EiC
const COLOR_NUCLEUS_PINK = '#FF69B4'; // Roz pentru nucleul /ɔ/ (o, aw)
const COLOR_GLIDE_RED = '#FF0000';     // Roșu pentru semi-vocalele ỉ, ỷ

export interface Token {
  id: string;
  text: string;
  color?: string;
  isDiphthong: boolean;
  phoneme?: string;
}

/**
 * Functie de parsare și segmentare a textului conform regulii /ɔɪ/
 */
export const parseOiDiphthongs = (text: string): Token[] => {
  if (!text) return [];

  // Regex pentru potrivirea secvențelor oi, oy, awi, awy (case-insensitive)
  const pattern = /(oi|oy|awi|awy)/gi;
  const tokens: Token[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const startIndex = match.index;
    const matchText = match[0];

    // 1. Adăugăm textul netratat dinaintea diftongului
    if (startIndex > lastIndex) {
      tokens.push({
        id: `text-${lastIndex}`,
        text: text.slice(lastIndex, startIndex),
        isDiphthong: false,
      });
    }

    const lowerMatch = matchText.toLowerCase();

    // 2. Cazul 'oi' sau 'oy'
    if (lowerMatch === 'oi' || lowerMatch === 'oy') {
      const nucleusChar = matchText[0]; // 'o' sau 'O'
      const isUpper = matchText[1] === matchText[1].toUpperCase();

      // Transformare i -> ỉ / y -> ỷ (păstrând majuscula dacă e cazul)
      let glideChar = lowerMatch[1] === 'i' ? 'ỉ' : 'ỷ';
      if (isUpper) glideChar = glideChar.toUpperCase();

      tokens.push({
        id: `nucleus-${startIndex}`,
        text: nucleusChar,
        color: COLOR_NUCLEUS_PINK,
        isDiphthong: true,
        phoneme: '/ɔ/',
      });

      tokens.push({
        id: `glide-${startIndex + 1}`,
        text: glideChar,
        color: COLOR_GLIDE_RED,
        isDiphthong: true,
        phoneme: '/ɪ/',
      });
    }

    // 3. Cazul 'awi' sau 'awy'
    else if (lowerMatch === 'awi' || lowerMatch === 'awy') {
      const nucleusStr = matchText.slice(0, 2); // 'aw'
      const isUpper = matchText[2] === matchText[2].toUpperCase();

      let glideChar = lowerMatch[2] === 'i' ? 'ỉ' : 'ỷ';
      if (isUpper) glideChar = glideChar.toUpperCase();

      tokens.push({
        id: `nucleus-${startIndex}`,
        text: nucleusStr,
        color: COLOR_NUCLEUS_PINK,
        isDiphthong: true,
        phoneme: '/ɔ/',
      });

      tokens.push({
        id: `glide-${startIndex + 2}`,
        text: glideChar,
        color: COLOR_GLIDE_RED,
        isDiphthong: true,
        phoneme: '/ɪ/',
      });
    }

    lastIndex = pattern.lastIndex;
  }

  // 4. Textul rămas la final
  if (lastIndex < text.length) {
    tokens.push({
      id: `text-${lastIndex}`,
      text: text.slice(lastIndex),
      isDiphthong: false,
    });
  }

  return tokens;
};

interface EiCOiRendererProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componentă React care randează textul marcat EiC
 */
export const EiCOiRenderer: React.FC<EiCOiRendererProps> = ({
  text,
  className = '',
  style = {}
}) => {
  const tokens = parseOiDiphthongs(text);

  return (
    <span className={`eic-text-container ${className}`} style={{ fontFamily: 'monospace', ...style }}>
      {tokens.map((token) => {
        if (!token.isDiphthong) {
          return <React.Fragment key={token.id}>{token.text}</React.Fragment>;
        }

        return (
          <span
            key={token.id}
            style={{
              color: token.color,
              fontWeight: 'bold',
              display: 'inline-block',
            }}
            title={token.phoneme ? `EiC Phoneme: ${token.phoneme}` : undefined}
          >
            {token.text}
          </span>
        );
      })}
    </span>
  );
};

export default EiCOiRenderer;
