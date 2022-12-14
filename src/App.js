import { useCallback, useEffect, useState } from "react"
import words from './wordList.json'
import HangmanDrawing from './HangmanDrawing'
import HangmanWord from './HangmanWord'
import Keyboard from './Keyboard'

function getWord(){
  return words[Math.floor(Math.random() * words.length)]
}

function App() {
  const [wordToGuess, setWordToGuess] = useState(getWord)
  const [guessedLetters, setGuessedLetters] = useState([])

  const incorectLetters = guessedLetters.filter(letter => !wordToGuess.includes(letter))

  const isLoser = incorectLetters.length >= 6
  const isWinner = wordToGuess.split('').every(letter =>guessedLetters.includes(letter))

  const addGuessedLetter = useCallback((letter) => {
    if (guessedLetters.includes(letter) || isLoser || isWinner) return

    setGuessedLetters(currentLetters => [...currentLetters, letter])
  }, [guessedLetters, isWinner, isLoser])

  useEffect(() => {
    const handler = (e,KeyboardEvent ) => {
      const key = e.key

      if (!key.match(/^[a-z]$/)) return

      e.preventDefault()
      addGuessedLetter(key)
    }
    document.addEventListener("touchend", handler)

    return () => {
      document.removeEventListener("touchend", handler)
    }
  }, [guessedLetters])

  useEffect(()=>{

    const handler = (e, KeyboardEvent) => {
      const key = e.key

      if (key !== "Enter") return
      
      e.preventDefault()
      setGuessedLetters([])
      setWordToGuess(getWord())
    }
    document.addEventListener("touchend", handler)

    return () => {
      document.removeEventListener("touchend", handler)
    }
  },[])

  return (
    <div className="App" style={{
      maxWidth: '800px',
      display: "flex",
      flexDirection: 'column',
      gap: '2erm',
      margin: '0 auto',
      alignItems: 'center'
    }}>
      <div style={{
        fontSize: "2rem",
        textAlign: 'center'
      }}>
      {isWinner &&  "Winner!! - Refresh to try again"}
      {isLoser &&  "Nice Try - Refresh to try again"}
      </div>
      <HangmanDrawing numberOfGuesses={incorectLetters.length} />
      <HangmanWord reveal={isLoser} guessedLetters={guessedLetters} wordToGuess={wordToGuess} /><br /><br />
      <div style={{ alignSelf: 'stretch' }}>
        <Keyboard
        disabled={isWinner || isLoser} 
        activeLetters={guessedLetters.filter(letter => wordToGuess.includes(letter))}
          inactiveLetters={incorectLetters}
          addGuessedLetter={addGuessedLetter} />
      </div>
    </div>
  )
}

export default App
