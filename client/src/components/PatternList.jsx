import { useState, useEffect, useMemo } from 'react';
import { api } from '../api.js';
import PatternCard from './PatternCard.jsx';
import styles from '../styles/PatternList.module.css';

const HOOK_SIZES = [
  '2.0mm','2.5mm','3.0mm','3.5mm','4.0mm','4.5mm',
  '5.0mm','5.5mm','6.0mm','6.5mm','7.0mm','8.0mm',
  '9.0mm','10.0mm','12.0mm','15.0mm',
];

const YARN_WEIGHTS = [
  'Lace','Fingering / 4 ply','Sport / 5 ply','DK / 8 ply',
  'Aran / 10 ply','Worsted','Chunky','Super Chunky','Jumbo',
];

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

export default function PatternList({ refresh, user, onSelect, onEdit, onDeleted }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterYarnWeight, setFilterYarnWeight] = useState('');
  const [filterHookSize, setFilterHookSize] = useState('');
  const [filterTerms, setFilterTerms] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setLoading(true);
    api.getPatterns()
      .then(setPatterns)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = patterns.filter(p => {
      if (q && !p.title.toLowerCase().includes(q) &&
              !p.description?.toLowerCase().includes(q) &&
              !p.author?.toLowerCase().includes(q)) return false;
      if (filterDifficulty && p.difficulty !== filterDifficulty) return false;
      if (filterYarnWeight && p.yarnWeight !== filterYarnWeight) return false;
      if (filterHookSize && p.hookSize !== filterHookSize) return false;
      if (filterTerms && p.instruction_terms !== filterTerms) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'za') return b.title.localeCompare(a.title);
      if (sortBy === 'difficulty') {
        const da = DIFFICULTY_ORDER[a.difficulty] ?? 99;
        const db = DIFFICULTY_ORDER[b.difficulty] ?? 99;
        return da - db;
      }
      // newest (default)
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return list;
  }, [patterns, search, filterDifficulty, filterYarnWeight, filterHookSize, filterTerms, sortBy]);

  const hasFilters = search || filterDifficulty || filterYarnWeight || filterHookSize || filterTerms;

  function clearFilters() {
    setSearch('');
    setFilterDifficulty('');
    setFilterYarnWeight('');
    setFilterHookSize('');
    setFilterTerms('');
    setSortBy('newest');
  }

  if (loading) return <p className={styles.status}>Loading patterns…</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  return (
    <div>
      <div className={styles.searchWrap}>
        <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} />
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search patterns…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-difficulty">Difficulty</label>
          <select id="filter-difficulty" className={styles.filterSelect} value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
            <option value="">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-yarn-weight">Yarn Weight</label>
          <select id="filter-yarn-weight" className={styles.filterSelect} value={filterYarnWeight} onChange={e => setFilterYarnWeight(e.target.value)}>
            <option value="">All</option>
            {YARN_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-hook-size">Hook Size</label>
          <select id="filter-hook-size" className={styles.filterSelect} value={filterHookSize} onChange={e => setFilterHookSize(e.target.value)}>
            <option value="">All</option>
            {HOOK_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-terms">Terms</label>
          <select id="filter-terms" className={styles.filterSelect} value={filterTerms} onChange={e => setFilterTerms(e.target.value)}>
            <option value="">US &amp; UK</option>
            <option value="us">US terms</option>
            <option value="uk">UK terms</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-sort">Sort By</label>
          <select id="filter-sort" className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="difficulty">By difficulty</option>
          </select>
        </div>

        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {patterns.length === 0 ? (
        <p className={styles.status}>No patterns yet. Add one to get started!</p>
      ) : filtered.length === 0 ? (
        <p className={styles.status}>No patterns match your search.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(p => (
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
      )}
    </div>
  );
}
