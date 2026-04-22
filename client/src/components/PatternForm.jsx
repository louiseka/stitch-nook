import { useState, useEffect } from 'react';
import { api } from '../api.js';
import RichTextEditor from './RichTextEditor.jsx';
import styles from '../styles/PatternForm.module.css';

const HOOK_SIZES = [
  '2.0mm','2.5mm','3.0mm','3.5mm','4.0mm','4.5mm',
  '5.0mm','5.5mm','6.0mm','6.5mm','7.0mm','8.0mm',
  '9.0mm','10.0mm','12.0mm','15.0mm',
];

const YARN_WEIGHTS = [
  'Lace','Fingering / 4 ply','Sport / 5 ply','DK / 8 ply',
  'Aran / 10 ply','Worsted','Chunky','Super Chunky','Jumbo',
];

const EMPTY = {
  title: '',
  author: '',
  difficulty: '',
  description: '',
  hookSize: '',
  yarnWeight: '',
  yarnColours: '',
  instructions: '',
  instruction_terms: 'us',
};

export default function PatternForm({ editId, onSaved, onClose }) {
  const [fields, setFields] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId) { setFields(EMPTY); return; }
    api.getPattern(editId).then(p => {
      setFields({
        title: p.title || '',
        author: p.author || '',
        difficulty: p.difficulty || '',
        description: p.description || '',
        hookSize: p.hookSize || '',
        yarnWeight: p.yarnWeight || '',
        yarnColours: p.yarnColours || '',
        instructions: p.instructions || '',
        instruction_terms: p.instruction_terms || 'us',
      });
    });
  }, [editId]);

  function set(key) {
    return e => setFields(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editId) {
        await api.updatePattern(editId, fields);
      } else {
        await api.createPattern(fields);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        <h2 className={styles.heading}>{editId ? 'Edit Pattern' : 'Add Pattern'}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Pattern Name *
            <input className={styles.input} type="text" value={fields.title} onChange={set('title')} required autoFocus />
          </label>

          <label className={styles.label}>
            Author / Designer
            <input className={styles.input} type="text" value={fields.author} onChange={set('author')} />
          </label>

          <label className={styles.label}>
            Difficulty *
            <select className={styles.input} value={fields.difficulty} onChange={set('difficulty')} required>
              <option value="">— select —</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label className={styles.label}>
            Description *
            <textarea className={styles.input} rows={2} value={fields.description} onChange={set('description')} required />
          </label>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Materials *</legend>
            <label className={styles.label}>
              Hook Size
              <select className={styles.input} value={fields.hookSize} onChange={set('hookSize')} required>
                <option value="">— select —</option>
                {HOOK_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className={styles.label}>
              Yarn Weight
              <select className={styles.input} value={fields.yarnWeight} onChange={set('yarnWeight')} required>
                <option value="">— select —</option>
                {YARN_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </label>
            <label className={styles.label}>
              Yarn Colours
              <input className={styles.input} type="text" placeholder="e.g. Cream, Dusty Rose" value={fields.yarnColours} onChange={set('yarnColours')} required autoComplete="off" />
            </label>
          </fieldset>

          <div className={styles.label}>
            Instructions *
            <div className={styles.termsToggle}>
              <span className={styles.hint}>Which terms are you using?</span>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" name="instruction_terms" value="us"
                    checked={fields.instruction_terms === 'us'} onChange={set('instruction_terms')} />
                  US terms
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="instruction_terms" value="uk"
                    checked={fields.instruction_terms === 'uk'} onChange={set('instruction_terms')} />
                  UK terms
                </label>
              </div>
            </div>
            <RichTextEditor
              value={fields.instructions}
              onChange={html => setFields(f => ({ ...f, instructions: html }))}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving…' : editId ? 'Save changes' : 'Add pattern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
