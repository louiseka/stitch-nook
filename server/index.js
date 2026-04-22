const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const authRouter = require('./routes/auth');
const patternsRouter = require('./routes/patterns');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/patterns', patternsRouter);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialise database:', err);
  process.exit(1);
});
