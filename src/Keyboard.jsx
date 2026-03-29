import React from 'react'
import { motion } from 'framer-motion'

const KEYS_EN = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"]
]

const KEYS_HE = [
  ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"],
  ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"],
  ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ"]
]

export default function Keyboard({
  disabled = false,
  activeLetters,
  inactiveLetters,
  addGuessedLetter,
  language = 'en'
}) {
  const isHebrew = language === 'he'
  const rows = isHebrew ? KEYS_HE : KEYS_EN

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.01 }
    }
  }

  const item = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        alignItems: 'center',
        width: '100%'
      }}
    >
      {rows.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          style={{ 
            display: 'flex', 
            gap: '0.6rem', 
            justifyContent: 'center',
            width: '100%',
            flexWrap: 'wrap'
          }}
        >
          {row.map(key => {
            const isActive = activeLetters.includes(key)
            const isInactive = inactiveLetters.includes(key)
            const isPressed = isActive || isInactive || disabled

            return (
              <motion.button
                key={key}
                variants={item}
                whileHover={!isPressed ? { scale: 1.05, backgroundColor: 'var(--accent-primary)' } : {}}
                whileTap={!isPressed ? { scale: 0.95 } : {}}
                onClick={() => addGuessedLetter(key)}
                disabled={isPressed}
                style={{
                  cursor: isPressed ? 'default' : 'pointer',
                  minWidth: 'clamp(40px, 8vw, 55px)',
                  height: 'clamp(50px, 10vw, 65px)',
                  background: isActive 
                    ? 'var(--accent-primary)' 
                    : (isInactive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'),
                  color: isInactive ? 'var(--text-muted)' : 'white',
                  border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  opacity: isInactive ? 0.4 : 1,
                  boxShadow: isActive ? '0 0 15px var(--accent-primary)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s, opacity 0.2s'
                }}
              >
                {key}
              </motion.button>
            )
          })}
        </div>
      ))}
    </motion.div>
  )
}
