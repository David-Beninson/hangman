// type HangmanWordProp = {
//   guessedLetters: string[]
//   wordToGuess: string
//   reveal?: boolean
// }

export default function HangmanWord({ guessedLetters, reveal = false, wordToGuess }) {

  return (
    <div style={{ display: 'flex', gap: '.25em', fontSize: '6rem', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'monospace' }}>
      {wordToGuess.split('').map((letter, index) => (
        <span key={index} style={{ borderBottom: '.1em solid black' }}>
          <span style={{ visibility: guessedLetters.includes(letter) || reveal ? 'visible' : 'hidden', color: !guessedLetters.includes(letter) && reveal ? "red" : "black" }}>{letter}</span>
        </span>
      ))}
    </div>
  )
}
