import { useState, useEffect } from 'react';
import { api } from '../api.js';
import styles from '../styles/PatternDetail.module.css';

const DIFFICULTY_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export default function PatternDetail({ id, user, onClose, onEdit, onDeleted }) {
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getPattern(id)
      .then(setPattern)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Delete "${pattern.title}"?`)) return;
    try {
      await api.deletePattern(pattern.id);
      onDeleted();
    } catch (err) {
      alert(err.message);
    }
  }

  const isOwner = user && pattern && user.id === pattern.user_id;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>

        {loading && <p className={styles.status}>Loading…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {pattern && (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.title}>{pattern.title}</h2>
              {pattern.difficulty && (
                <span className={`${styles.badge} ${styles[pattern.difficulty]}`}>
                  {DIFFICULTY_LABEL[pattern.difficulty]}
                </span>
              )}
            </div>

            {pattern.image_url && (
              <img src={pattern.image_url} alt={pattern.title} className={styles.patternImage} />
            )}

            {pattern.author && <p className={styles.author}>by {pattern.author}</p>}

            <p className={styles.meta}>
              Added by <strong>{pattern.username}</strong> ·{' '}
              {new Date(pattern.created_at).toLocaleDateString()}
            </p>

            {pattern.description && (
              <p className={styles.description}>{pattern.description}</p>
            )}

            {(pattern.hookSize || pattern.yarnWeight || pattern.yarnColours) && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Materials</h3>
                <dl className={styles.materialsList}>
                  {pattern.hookSize && (
                    <><dt className={styles.materialsTerm}>Hook Size</dt><dd className={styles.materialsDetail}>{pattern.hookSize}</dd></>
                  )}
                  {pattern.yarnWeight && (
                    <><dt className={styles.materialsTerm}>Yarn Weight</dt><dd className={styles.materialsDetail}>{pattern.yarnWeight}</dd></>
                  )}
                  {pattern.yarnColours && (
                    <><dt className={styles.materialsTerm}>Yarn Colours</dt><dd className={styles.materialsDetail}>{pattern.yarnColours}</dd></>
                  )}
                </dl>
              </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Instructions
                {pattern.instruction_terms && (
                  <span className={`${styles.termBadge} ${styles[pattern.instruction_terms]}`}>
                    {pattern.instruction_terms.toUpperCase()} terms
                  </span>
                )}
              </h3>
              <div
                className={styles.instructions}
                dangerouslySetInnerHTML={{ __html: pattern.instructions }}
              />
            </div>

            {isOwner && (
              <div className={styles.ownerActions}>
                <button className={styles.editBtn} onClick={() => onEdit(pattern.id)}>Edit</button>
                <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
