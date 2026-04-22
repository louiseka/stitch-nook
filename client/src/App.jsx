import { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm.jsx';
import PatternList from './components/PatternList.jsx';
import PatternDetail from './components/PatternDetail.jsx';
import PatternForm from './components/PatternForm.jsx';
import styles from './styles/App.module.css';

function loadUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(loadUser);
const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  function handleLogin(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedId(null);
  }

  function handleSaved() {
    setShowForm(false);
    setEditId(null);
    setRefresh(r => r + 1);
  }

  function handleEdit(id) {
    setEditId(id);
    setShowForm(true);
    setSelectedId(null);
  }

  function handleDeleted() {
    setSelectedId(null);
    setRefresh(r => r + 1);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>🧶</span>
          <h1 className={styles.title}>The Stitch Nook</h1>
        </div>
        <div className={styles.headerRight}>
          {user ? (
            <div className={styles.userBar}>
              <span className={styles.username}>{user.username}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>Log out</button>
            </div>
          ) : null}
        </div>
      </header>

      <main className={styles.main}>
        {!user ? (
          <AuthForm onLogin={handleLogin} />
        ) : (
          <>
            <div className={styles.toolbar}>
              <button className={styles.addBtn} onClick={() => { setEditId(null); setShowForm(true); }}>
                + Add Pattern
              </button>
            </div>
            <PatternList
              refresh={refresh}
              user={user}
              onSelect={setSelectedId}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
            />
          </>
        )}
      </main>

      {selectedId && (
        <PatternDetail
          id={selectedId}
user={user}
          onClose={() => setSelectedId(null)}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      )}

      {showForm && (
        <PatternForm
          editId={editId}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditId(null); }}
        />
      )}
    </div>
  );
}
