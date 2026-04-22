import styles from '../styles/TermToggle.module.css';

export default function TermToggle({ mode, onChange }) {
  return (
    <div className={styles.toggle} role="group" aria-label="Terminology">
      <button
        className={mode === 'us' ? styles.active : styles.btn}
        onClick={() => onChange('us')}
        aria-pressed={mode === 'us'}
      >
        US
      </button>
      <button
        className={mode === 'uk' ? styles.active : styles.btn}
        onClick={() => onChange('uk')}
        aria-pressed={mode === 'uk'}
      >
        UK
      </button>
    </div>
  );
}
