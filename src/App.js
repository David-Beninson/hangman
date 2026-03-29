import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, RotateCcw, Home, Trophy, Globe, ChevronRight, Lightbulb, Volume2, VolumeX } from "lucide-react"
import confetti from 'canvas-confetti'

import wordCategories from './wordCategories.json'
import { translations } from './translations'
import HangmanDrawing from './HangmanDrawing'
import HangmanWord from './HangmanWord'
import Keyboard from './Keyboard'

const GAME_STATES = {
  HOME: 'HOME',
  OPTIONS: 'OPTIONS',
  PLAYING: 'PLAYING',
  RESULT: 'RESULT'
}

const DIFFICULTIES = {
  EASY: { lives: 8, name: 'easy', hints: 2 },
  MEDIUM: { lives: 6, name: 'medium', hints: 1 },
  HARD: { lives: 4, name: 'hard', hints: 0 }
}

// Final letter mapping for Hebrew unification
const HEBREW_FINAL_MAP = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ'
}

function getRandomWord(category, lang) {
  const catData = wordCategories[category] || wordCategories["Animals"]
  const langKey = (category === "Hebrew Mix") ? "he" : (lang === "he" ? "he" : "en")
  const words = catData[langKey]
  return words[Math.floor(Math.random() * words.length)].toLowerCase()
}

export default function App() {
  // Game States
  const [gameState, setGameState] = useState(GAME_STATES.HOME)
  const [language, setLanguage] = useState('he')
  const [category, setCategory] = useState('Animals')
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.MEDIUM)

  // Gameplay States
  const [wordToGuess, setWordToGuess] = useState("")
  const [guessedLetters, setGuessedLetters] = useState([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [isAnimatingError, setIsAnimatingError] = useState(false)

  // Persistence States
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('hangman-streak')) || 0)
  const [bestStreak, setBestStreak] = useState(() => Number(localStorage.getItem('hangman-best')) || 0)
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('hangman-muted') === 'true')

  const t = translations[language]
  const isRTL = language === 'he'

  const incorrectLetters = guessedLetters.filter(letter => {
    // Check standard and final mapping
    const isDirectMatch = wordToGuess.includes(letter)
    if (isDirectMatch) return false

    // Check if letter is a standard version of a final letter in the word
    const hasFinalEquivalent = Object.entries(HEBREW_FINAL_MAP).some(([final, std]) =>
      std === letter && wordToGuess.includes(final)
    )

    return !hasFinalEquivalent
  })

  const isLoser = incorrectLetters.length >= difficulty.lives
  const isWinner = wordToGuess.length > 0 && wordToGuess.split('').every(letter => {
    if (letter === ' ' || letter === '-') return true
    if (guessedLetters.includes(letter)) return true

    // Support final letter unification in win condition
    const stdLetter = HEBREW_FINAL_MAP[letter]
    if (stdLetter && guessedLetters.includes(stdLetter)) return true

    return false
  })

  // Sound Effects (Using placeholders for real assets)
  const playSound = useCallback((type) => {
    if (isMuted) return
    const sounds = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      lose: 'https://assets.mixkit.co/active_storage/sfx/256/256-preview.mp3',
      error: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'
    }
    const audio = new Audio(sounds[type])
    audio.volume = 0.5
    audio.play().catch(() => { }) // Ignore autoplay blocks
  }, [isMuted])

  // Handle Win/Loss
  useEffect(() => {
    if (isWinner && gameState === GAME_STATES.PLAYING) {
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
        localStorage.setItem('hangman-best', newStreak)
      }
      localStorage.setItem('hangman-streak', newStreak)
      setGameState(GAME_STATES.RESULT)
      playSound('win')
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#ffffff']
      })
    } else if (isLoser && gameState === GAME_STATES.PLAYING) {
      setStreak(0)
      localStorage.setItem('hangman-streak', 0)
      setGameState(GAME_STATES.RESULT)
      playSound('lose')
    }
  }, [isWinner, isLoser, gameState, bestStreak, playSound, streak])

  const startGame = () => {
    const word = getRandomWord(category, language)
    setWordToGuess(word)
    setGuessedLetters([])
    setHintsUsed(0)
    setGameState(GAME_STATES.PLAYING)
    playSound('click')
  }

  const addGuessedLetter = useCallback((letter) => {
    if (guessedLetters.includes(letter) || isLoser || isWinner || gameState !== GAME_STATES.PLAYING) return

    setGuessedLetters(currentLetters => [...currentLetters, letter])

    // Trigger shake on error
    const isCorrect = wordToGuess.includes(letter) ||
      Object.entries(HEBREW_FINAL_MAP).some(([final, std]) => std === letter && wordToGuess.includes(final))

    if (!isCorrect) {
      setIsAnimatingError(true)
      playSound('error')
      setTimeout(() => setIsAnimatingError(false), 400)
    } else {
      playSound('click')
    }
  }, [guessedLetters, isWinner, isLoser, gameState, wordToGuess, playSound])

  const useHint = () => {
    if (hintsUsed >= difficulty.hints || gameState !== GAME_STATES.PLAYING) return

    // Find missing letters
    const missingLetters = wordToGuess.split('').filter(l =>
      l !== ' ' && l !== '-' && !guessedLetters.includes(l) &&
      !(HEBREW_FINAL_MAP[l] && guessedLetters.includes(HEBREW_FINAL_MAP[l]))
    )

    if (missingLetters.length > 0) {
      const randomLetter = missingLetters[Math.floor(Math.random() * missingLetters.length)]
      // If it's a final letter, suggest the standard one
      const hintToApply = HEBREW_FINAL_MAP[randomLetter] || randomLetter
      addGuessedLetter(hintToApply)
      setHintsUsed(h => h + 1)
      playSound('click')
    }
  }

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (gameState !== GAME_STATES.PLAYING) return
      const key = e.key.toLowerCase()

      // Standardize Hebrew input if it's a final letter
      const stdKey = Object.values(HEBREW_FINAL_MAP).includes(key) ? key :
        (HEBREW_FINAL_MAP[key] || key)

      const isEnglish = /^[a-z]$/.test(stdKey)
      const isHebrew = /^[\u0590-\u05FF]$/.test(stdKey)

      if (!isEnglish && !isHebrew) return

      e.preventDefault()
      addGuessedLetter(stdKey)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [addGuessedLetter, gameState])

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    localStorage.setItem('hangman-muted', newMuted)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  }

  return (
    <div className="App" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header / Stats */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              const nextLang = language === 'en' ? 'he' : 'en'
              setLanguage(nextLang)
              playSound('click')
            }}
            className="glass-panel"
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', border: 'none', color: 'white' }}
          >
            <Globe size={16} />
            {language.toUpperCase()}
          </button>
          <button
            onClick={toggleMute}
            className="glass-panel"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', cursor: 'pointer', border: 'none', color: isMuted ? 'var(--text-muted)' : 'var(--accent-primary)' }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.streak}</div>
            <div style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{streak}</div>
          </div>
          <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.best}</div>
            <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>{bestStreak}</div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* HOME */}
        {gameState === GAME_STATES.HOME && (
          <motion.div key="home" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-panel" style={{ textAlign: 'center', width: '100%', maxWidth: '500px', marginTop: '4rem' }}>
            <h1 className="heading-xl">{t.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>{t.subtitle}</p>
            <button className="start-btn" onClick={() => { setGameState(GAME_STATES.OPTIONS); playSound('click'); }} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', border: 'none', borderRadius: '50px', padding: '1.2rem 3rem', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 auto', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.5)' }}>
              <Play size={24} fill="currentColor" /> {t.start}
            </button>
          </motion.div>
        )}

        {/* OPTIONS */}
        {gameState === GAME_STATES.OPTIONS && (
          <motion.div key="options" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-panel" style={{ width: '100%', maxWidth: '550px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>{t.selectCategory}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {Object.keys(wordCategories).map(cat => (
                <button key={cat} onClick={() => { setCategory(cat); playSound('click'); }} style={{ background: category === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1rem', color: 'white', cursor: 'pointer', fontWeight: category === cat ? 'bold' : 'normal' }}>
                  {t[cat.toLowerCase().replace(" ", "")]}
                </button>
              ))}
            </div>

            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>{t.selectDifficulty}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {Object.entries(DIFFICULTIES).map(([key, value]) => (
                <button key={key} onClick={() => { setDifficulty(value); playSound('click'); }} style={{ background: difficulty.name === value.name ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)', border: `1px solid ${difficulty.name === value.name ? 'var(--accent-secondary)' : 'var(--glass-border)'}`, borderRadius: '16px', padding: '1rem 1.5rem', color: 'white', cursor: 'pointer', textAlign: isRTL ? 'right' : 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t[value.name]}</span>
                  {difficulty.name === value.name && <ChevronRight size={20} />}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setGameState(GAME_STATES.HOME); playSound('click'); }} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}>{t.back}</button>
              <button onClick={startGame} style={{ flex: 2, padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--success)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{t.next}</button>
            </div>
          </motion.div>
        )}

        {/* PLAYING */}
        {gameState === GAME_STATES.PLAYING && (
          <motion.div key="playing" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <div className={isAnimatingError ? 'shake' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-primary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>
                {t.category}: {t[category.toLowerCase().replace(" ", "")]}
              </div>
              <HangmanDrawing numberOfGuesses={incorrectLetters.length} maxGuesses={difficulty.lives} />
            </div>

            <HangmanWord guessedLetters={guessedLetters} wordToGuess={wordToGuess} language={language} HebrewMap={HEBREW_FINAL_MAP} />

            <div className="keyboard-wrapper">
              <Keyboard
                disabled={false}
                activeLetters={guessedLetters.filter(letter => wordToGuess.includes(letter) || Object.entries(HEBREW_FINAL_MAP).some(([f, s]) => s === letter && wordToGuess.includes(f)))}
                inactiveLetters={incorrectLetters}
                addGuessedLetter={addGuessedLetter}
                language={category === 'Hebrew Mix' || language === 'he' ? 'he' : 'en'}
              />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <button onClick={() => { setGameState(GAME_STATES.HOME); playSound('click'); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Home size={18} /> {t.mainMenu}
              </button>

              {difficulty.hints > 0 && (
                <button
                  onClick={useHint}
                  disabled={hintsUsed >= difficulty.hints}
                  style={{ background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', color: hintsUsed >= difficulty.hints ? 'var(--text-muted)' : 'var(--accent-primary)', padding: '0.8rem 1.2rem', cursor: hintsUsed >= difficulty.hints ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', opacity: hintsUsed >= difficulty.hints ? 0.5 : 1 }}
                >
                  <Lightbulb size={18} /> {t.hint} ({difficulty.hints - hintsUsed})
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {gameState === GAME_STATES.RESULT && (
          <motion.div key="result" variants={containerVariants} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ textAlign: 'center', width: '100%', maxWidth: '500px', borderTop: `8px solid ${isWinner ? 'var(--success)' : 'var(--error)'}` }}>
            <div style={{ marginBottom: '1.5rem' }}>{isWinner ? <Trophy size={64} color="var(--success)" style={{ margin: '0 auto' }} /> : <RotateCcw size={64} color="var(--error)" style={{ margin: '0 auto' }} />}</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{isWinner ? t.win : t.lose}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t.refreshToTry}</p>
            <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.2)', marginBottom: '2.5rem', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t.reveal}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase', color: 'white' }}>{wordToGuess}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setGameState(GAME_STATES.HOME); playSound('click'); }} style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Home size={20} /> {t.mainMenu}</button>
              <button onClick={startGame} style={{ flex: 2, padding: '1.2rem', borderRadius: '16px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><RotateCcw size={20} /> {t.playAgain}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
