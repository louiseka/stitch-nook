import { api } from '../api.js';
import styles from '../styles/PatternCard.module.css';

const DIFFICULTY_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export default function PatternCard({ pattern, user, onSelect, onEdit, onDeleted }) {
  const isOwner = user && user.id === pattern.user_id;

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete "${pattern.title}"?`)) return;
    try {
      await api.deletePattern(pattern.id);
      onDeleted();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className={styles.card} onClick={() => onSelect(pattern.id)}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>{pattern.title}</h3>
        {pattern.difficulty && (
          <span className={`${styles.badge} ${styles[pattern.difficulty]}`}>
            {DIFFICULTY_LABEL[pattern.difficulty]}
          </span>
        )}
      </div>
      {pattern.author && <p className={styles.author}>by {pattern.author}</p>}
      {pattern.description && <p className={styles.desc}>{pattern.description}</p>}
      <div className={styles.cardFooter}>
        <span className={styles.addedBy}>Added by {pattern.username}</span>
        {isOwner && (
          <div className={styles.actions} onClick={e => e.stopPropagation()}>
            <button className={styles.editBtn} onClick={() => onEdit(pattern.id)}>Edit</button>
            <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
