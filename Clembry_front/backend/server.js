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
// UTENTI & AUTHENTICATION (CORRETTO)
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
  if (!nome || !cognome || !username || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  const userRole = role || 'student';

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username o Email già utilizzati' });

    // 1. Inserimento dell'utente nella tabella globale users
    const [userResult] = await db.query(
      'INSERT INTO users (nome, cognome, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cognome, username, email, password, userRole]
    );

    const newUserId = userResult.insertId;

    // 2. SOLUZIONE DEL PROBLEMA: Se l'utente si registra come docente, creiamo SUBITO il suo profilo specchio in 'teachers'
    if (userRole === 'teacher') {
      await db.query(
        'INSERT INTO teachers (user_id, titolo, materie, bio, tariffaOraria, avatar, stelle, recensioni) VALUES (?, ?, ?, ?, ?, ?, 5, 0)',
        [newUserId, 'Nuovo Docente', JSON.stringify([]), 'Biografia non ancora inserita.', 0, '👨‍🏫']
      );
      console.log(`Profilo docente inizializzato automaticamente per l'utente ID: ${newUserId}`);
    }

    res.status(201).json({ id: newUserId, nome, cognome, username, email, role: userRole });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ error: 'Errore interno del server durante la registrazione' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

// =====================================================
// DOCENTI (TEACHERS) - SISTEMATO E INTEGRATO 404
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

// AGGIUNTO: Risolve il crash/404 quando l'area personale richiede il singolo docente tramite ID utente
app.get('/api/teachers/:id', async (req, res) => {
  const targetId = req.params.id;
  try {
    // Cerchiamo sia per id della tabella teachers sia per user_id di aggancio
    const [rows] = await db.query(`
      SELECT t.*, u.nome, u.cognome, u.email 
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ? OR t.user_id = ?
    `, [targetId, targetId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profilo docente non trovato' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero del docente specifico' });
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


// AGGIUNTO: Endpoint per aggiornare la biografia e il titolo del docente
app.put('/api/teachers/:id', async (req, res) => {
  const targetId = req.params.id;
  const { titolo, bio } = req.body;

  try {
    // Aggiorna il record cercando sia per ID tabella teachers che per user_id di accoppiamento
    const [result] = await db.query(
      'UPDATE teachers SET titolo = ?, bio = ? WHERE id = ? OR user_id = ?',
      [titolo, bio, targetId, targetId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Impossibile trovare il docente da aggiornare' });
    }

    res.json({ success: true, message: 'Profilo aggiornato con successo' });
  } catch (error) {
    console.error('Errore durante il PUT del docente:', error);
    res.status(500).json({ error: 'Errore interno durante l\'aggiornamento del profilo' });
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
    // Controllo di sicurezza incrociato: trova l'id REALE dentro la tabella teachers
    const [teacherCheck] = await db.query(
      'SELECT id FROM teachers WHERE id = ? OR user_id = ?', 
      [teacher_id, teacher_id]
    );

    if (teacherCheck.length === 0) {
      return res.status(400).json({ 
        error: 'Impossibile pubblicare il corso. Profilo docente non esistente nel database.' 
      });
    }

    const realTeacherId = teacherCheck[0].id;

    const [result] = await db.query(
      `INSERT INTO courses (titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine, stelle) VALUES (?, ?, ?, ?, ?, ?, ?, 5)`,
      [titolo, descrizione || '', realTeacherId, materia, prezzo, dataOra, immagine || '📘']
    );

    res.status(201).json({ courseId: result.insertId });
  } catch (error) {
    console.error('Errore inserimento corso:', error);
    res.status(500).json({ error: 'Errore interno durante la creazione del corso' });
  }
});

// =====================================================
// ISCRIZIONI (SUBSCRIPTIONS)
// =====================================================

app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, course_id, data_iscrizione FROM subscriptions WHERE user_id = ?',
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore recupero iscrizioni' });
  }
});

app.get('/api/subscriptions', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, course_id, data_iscrizione FROM subscriptions');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore recupero iscrizioni' });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  const { user_id, course_id } = req.body;
  try {
    const [result] = await db.query('INSERT INTO subscriptions (user_id, course_id) VALUES (?, ?)', [user_id, course_id]);
    res.status(201).json({ subscriptionId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Errore creazione iscrizione' });
  }
});

app.delete('/api/subscriptions/:userId/:courseId', async (req, res) => {
  try {
    await db.query('DELETE FROM subscriptions WHERE user_id = ? AND course_id = ?', [req.params.userId, req.params.courseId]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Errore cancellazione iscrizione' });
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
    app.listen(port, () => console.log(`Server attivo su http://localhost:${port}`));
  } catch (error) {
    console.error('Errore avvio:', error.message);
  }
}

startServer();