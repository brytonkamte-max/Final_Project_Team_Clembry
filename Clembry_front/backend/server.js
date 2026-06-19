require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const initDatabase = require('./database/init');
const seedDatabase = require('./database/seed');

const app = express();
const port = 8080;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// =====================================================
// UTENTI & AUTHENTICATION
// =====================================================

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero degli utenti' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { nome, cognome, username, email, password, role } = req.body;
  if (!nome || !cognome || !username || !email || !password) return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username o Email già utilizzati' });

    const [result] = await db.query(
      'INSERT INTO users (nome, cognome, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cognome, username, email, password, role || 'student']
    );
    res.status(201).json({ id: result.insertId, nome, cognome, username, email, role: role || 'student' });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0 || rows[0].password !== password) return res.status(401).json({ error: 'Credenziali non valide' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

// =====================================================
// DOCENTI (TEACHERS)
// =====================================================

app.get('/api/teachers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT teachers.*, users.nome, users.cognome, users.email
      FROM teachers
      JOIN users ON teachers.user_id = users.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei docenti' });
  }
});

app.post('/api/teachers', async (req, res) => {
  const { user_id, titolo, materie, bio, tariffaOraria, avatar } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO teachers (user_id, titolo, materie, bio, tariffaOraria, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, JSON.stringify(materie), bio, tariffaOraria, avatar]
    );
    res.status(201).json({ teacherId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Errore creazione docente' });
  }
});

// =====================================================
// CORSI (COURSES)
// =====================================================

app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, CONCAT(u.nome, ' ', u.cognome) AS docente
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero corsi' });
  }
});

app.post('/api/courses', async (req, res) => {
  const { titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO courses (titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine, stelle) VALUES (?, ?, ?, ?, ?, ?, ?, 5)`,
      [titolo, descrizione || '', teacher_id, materia, prezzo, dataOra, immagine || '📘']
    );
    res.status(201).json({ courseId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Errore creazione corso' });
  }
});

// =====================================================
// ISCRIZIONI (SUBSCRIPTIONS)
// =====================================================

app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT subscriptions.*, courses.titolo, courses.materia, courses.dataOra,
              t.nome AS teacher_nome, t.cognome AS teacher_cognome
       FROM subscriptions
       JOIN courses ON subscriptions.course_id = courses.id
       JOIN users AS t ON courses.teacher_id = t.id
       WHERE subscriptions.user_id = ?`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore recupero iscrizioni' });
  }
});

// =====================================================
// AVVIO SERVER
// =====================================================
async function startServer() {
  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await initDatabase();
    await seedDatabase();
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    app.listen(port, () => console.log(`Server su http://localhost:${port}`));
  } catch (error) {
    console.error('Errore avvio:', error.message);
  }
}

startServer();
