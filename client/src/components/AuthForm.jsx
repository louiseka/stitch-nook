import { useState, useEffect } from 'react';
import { api } from '../api.js';
import styles from '../styles/AuthForm.module.css';

const PASSWORD_REQS = [
  { regex: /.{8,}/, label: '8+ characters' },
  { regex: /[A-Z]/, label: '1 uppercase letter' },
  { regex: /[0-9]/, label: '1 number' },
  { regex: /[!@#$%^&*]/, label: '1 special character (!@#$%^&*)' },
];

function PasswordStrength({ password }) {
  const met = PASSWORD_REQS.filter(r => r.regex.test(password)).length;
  return (
    <div className={styles.passwordReqs}>
      {PASSWORD_REQS.map(req => (
        <span key={req.label} className={req.regex.test(password) ? styles.metReq : styles.unmetReq}>
          {req.regex.test(password) ? '✓' : '○'} {req.label}
        </span>
      ))}
    </div>
  );
}

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (mode !== 'register' || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { available } = await api.checkUsername(username);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch (err) {
        setUsernameStatus(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const allReqsMet = PASSWORD_REQS.every(r => r.regex.test(password));
    const passwordsMatch = password === passwordConfirm;

    if (mode === 'register') {
      if (!allReqsMet) {
        setError('Password does not meet all requirements');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match');
        return;
      }
      if (usernameStatus !== 'available') {
        setError('Username is not available');
        return;
      }
    }

    setLoading(true);
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const data = mode === 'login'
        ? { username, password }
        : { username, password, passwordConfirm };
      const { token, user } = await fn(data);
      onLogin(token, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const passwordsMatch = !password || !passwordConfirm || password === passwordConfirm;
  const allReqsMet = PASSWORD_REQS.every(r => r.regex.test(password));
  const canSubmit = mode === 'login' || (allReqsMet && passwordsMatch && usernameStatus === 'available');

  const showPasswordError = mode === 'register' && password && !allReqsMet;
  const showPasswordMismatch = mode === 'register' && password && passwordConfirm && !passwordsMatch;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.heading}>
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h2>
        <div className={styles.tabs}>
          <button
            className={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log in
          </button>
          <button
            className={mode === 'register' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </label>
          {mode === 'register' && username.length >= 3 && (
            <div className={usernameStatus === 'available' ? styles.usernameAvailable : styles.usernameTaken}>
              {checkingUsername ? 'Checking...' : usernameStatus === 'available' ? '✓ Username is available' : '✗ Username is taken'}
            </div>
          )}
          <label className={styles.label}>
            Password
            <div className={styles.passwordWrapper}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className={styles.showPasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide' : 'Show'}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </label>
          {mode === 'register' && <PasswordStrength password={password} />}
          {showPasswordError && (
            <p className={styles.error}>Password does not meet all requirements</p>
          )}
          {mode === 'register' && (
            <label className={styles.label}>
              Confirm Password
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.showPasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide' : 'Show'}
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </label>
          )}
          {mode === 'register' && !passwordsMatch && (
            <p className={styles.error}>Passwords do not match</p>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submit} type="submit" disabled={loading || !canSubmit}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
