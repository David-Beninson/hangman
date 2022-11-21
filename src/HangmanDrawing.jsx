import styles from "./Keyboard.module.css";

const HEAD = <div className={`${styles.head}`} />;
const BODY = <div className={`${styles.body}`} />;
const RIGHT_ARM = <div className={`${styles.rarm}`} />;
const LEFT_ARM = <div className={`${styles.larm}`} />;
const RIGHT_LEG = <div className={`${styles.rleg}`} />;
const LEFT_LEG = <div className={`${styles.lleg}`} />;
const BODY_PARTS = [HEAD, BODY, RIGHT_ARM, LEFT_ARM, RIGHT_LEG, LEFT_LEG];
// const HangmanDrawingProps = {
//   numberOfGuesses: number
// }
export default function HangmanDrawing({ numberOfGuesses }) {
  return (
    <div style={{ position: "relative" }}>
      {BODY_PARTS.slice(0, numberOfGuesses)}
      <div className={`${styles.str}`} />
      <div className={`${styles.tp}`} />
      <div className={`${styles.stc}`} />
      <div className={`${styles.btm}`} />
    </div>
  );
}
