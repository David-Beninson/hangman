import React from 'react'
import { motion } from 'framer-motion'

export default function HangmanWord({
  guessedLetters,
  reveal = false,
  wordToGuess,
  language = 'en',
  HebrewMap = {}
}) {
  const isHebrew = language === 'he'

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.4em',
        textTransform: 'uppercase',
        fontFamily: isHebrew ? 'Assistant, sans-serif' : 'JetBrains Mono, monospace',
        fontSize: 'clamp(1.5rem, 6vw, 3.5rem)',
        fontWeight: 'bold',
        marginTop: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      {wordToGuess.split("").map((letter, index) => {
        const isStandardGuessed = guessedLetters.includes(letter)
        // If it's a final letter, check if its standard counterpart was guessed
        const isFinalAndMatched = HebrewMap[letter] && guessedLetters.includes(HebrewMap[letter])
        const isVisible = isStandardGuessed || isFinalAndMatched || reveal

        return (
          <span 
            key={index} 
            style={{ 
              borderBottom: '4px solid var(--panel-bg)',
              minWidth: '0.9em',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '1.4em'
            }}
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: isVisible ? 1 : 0.5,
                opacity: isVisible ? 1 : 0,
              }}
              style={{
                color: !isVisible && reveal ? "var(--error)" : "white",
                textShadow: isVisible ? '0 0 15px var(--accent-primary)' : 'none'
              }}
            >
              {letter}
            </motion.span>
          </span>
        )
      })}
    </div>
  );
}
