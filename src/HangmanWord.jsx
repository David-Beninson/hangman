import styles from './Keyboard.module.css'
export default function HangmanWord({
  guessedLetters,
  reveal = false,
  wordToGuess,
}) {
  return (
    <div
    className={`${styles.word}`}
    style={{display: 'flex', gap: '.25em', textTransform: 'uppercase', fontFamily: 'monospace' }}
    >
      {wordToGuess.split("").map((letter, index) => (
        <span className={`${styles.letter}`} key={index}>
          <span
            style={{
              visibility:
                guessedLetters.includes(letter) || reveal
                  ? "visible"
                  : "hidden",
              color:
                !guessedLetters.includes(letter) && reveal ? "red" : "black",
            }}
          >
            {letter}
          </span>
        </span>
      ))}
    </div>
  );
}
