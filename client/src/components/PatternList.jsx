import { useState, useEffect } from 'react';
import { api } from '../api.js';
import PatternCard from './PatternCard.jsx';
import styles from '../styles/PatternList.module.css';

export default function PatternList({ refresh, user, onSelect, onEdit, onDeleted }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getPatterns()
      .then(setPatterns)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [refresh]);

  if (loading) return <p className={styles.status}>Loading patterns…</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (patterns.length === 0) {
    return <p className={styles.status}>No patterns yet. Add one to get started!</p>;
  }

  return (
    <div className={styles.grid}>
      {patterns.map(p => (
        <PatternCard
          key={p.id}
          pattern={p}
          user={user}
          onSelect={onSelect}
          onEdit={onEdit}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
