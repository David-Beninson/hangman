import React from 'react'
import { motion } from 'framer-motion'

const GALLOWS_COLOR = "var(--text-muted)"
const DRAW_COLOR = "var(--accent-secondary)"


export default function HangmanDrawing({ numberOfGuesses, maxGuesses }) {
  // SVG approach is cleaner for drawing effects
  return (
    <div style={{ position: "relative", height: '250px', width: '200px', marginBottom: '2rem' }}>
      {/* Structure - Static or simple fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '6px', width: '150px', background: GALLOWS_COLOR, borderRadius: '10px' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '30px', height: '100%', width: '6px', background: GALLOWS_COLOR, borderRadius: '10px' }} />
      <div style={{ position: 'absolute', top: 0, left: '30px', height: '6px', width: '100px', background: GALLOWS_COLOR, borderRadius: '10px' }} />
      <div style={{ position: 'absolute', top: 0, right: '70px', height: '30px', width: '4px', background: GALLOWS_COLOR }} />

      {/* Head */}
      {numberOfGuesses >= 1 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            position: 'absolute', top: '30px', right: '47px', width: '50px', height: '50px',
            borderRadius: '50%', border: `4px solid ${DRAW_COLOR}`,
            boxShadow: '0 0 10px var(--accent-secondary)'
          }}
        />
      )}

      {/* Body */}
      {numberOfGuesses >= 2 && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '80px' }}
          style={{
            position: 'absolute', top: '80px', right: '70px', width: '4px',
            background: DRAW_COLOR, boxShadow: '0 0 10px var(--accent-secondary)'
          }}
        />
      )}

      {/* Right Arm */}
      {numberOfGuesses >= 3 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          style={{
            position: 'absolute', top: '100px', right: '14px', height: '4px',
            background: DRAW_COLOR, rotate: '-30deg', transformOrigin: 'left center',
            boxShadow: '0 0 10px var(--accent-secondary)'
          }}
        />
      )}

      {/* Left Arm */}
      {numberOfGuesses >= 4 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          style={{
            position: 'absolute', top: '100px', right: '70px', height: '4px',
            background: DRAW_COLOR, rotate: '30deg', transformOrigin: 'right center',
            boxShadow: '0 0 10px var(--accent-secondary)'
          }}
        />
      )}

      {/* Right Leg */}
      {numberOfGuesses >= 5 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          style={{
            position: 'absolute', top: '158px', right: '14px', height: '4px',
            background: DRAW_COLOR, rotate: '60deg', transformOrigin: 'left center',
            boxShadow: '0 0 10px var(--accent-secondary)'
          }}
        />
      )}

      {/* Left Leg */}
      {numberOfGuesses >= 6 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          style={{
            position: 'absolute', top: '158px', right: '70px', height: '4px',
            background: DRAW_COLOR, rotate: '-60deg', transformOrigin: 'right center',
            boxShadow: '0 0 10px var(--accent-secondary)'
          }}
        />
      )}

      {/* Extreme difficulty extras (for 8 lives) */}
      {numberOfGuesses >= 7 && maxGuesses > 6 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: 'absolute', top: '45px', right: '55px', fontSize: '10px', color: DRAW_COLOR }}>X X</motion.div>
      )}
      {numberOfGuesses >= 8 && maxGuesses > 7 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: 'absolute', top: '60px', right: '62px', width: '15px', height: '2px', background: DRAW_COLOR }} />
      )}
    </div>
  )
}
