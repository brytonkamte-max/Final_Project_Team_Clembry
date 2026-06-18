require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const initDatabase = require('./database/init');
const seedDatabase = require('./database/seed');

const app = express();
const port = 8080;

// Middleware
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json()); // Sostituito body-parser nativamente

// =====================================================
// 1. GET COURSES (CON JOIN SU TEACHERS E USERS)
// =====================================================
app.get('/api/courses', async (req, res) => {
  try {
    console.log('Tentativo di recupero corsi relazionali...');
    
    // Recuperiamo i dati del corso uniti al Nome e Cognome del docente reale
    const querySQL = `
      SELECT 
        c.id, c.titolo, c.descrizione, c.materia, c.prezzo, c.dataOra, c.stelle, c.immagine,
        CONCAT(u.nome, ' ', u.cognome) AS docente
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      ORDER BY c.id ASC
    `;
    
    const [rows] = await db.query(querySQL);
    res.json(rows);
  } catch (error) {
    console.error('Errore GET corsi:', error);
    res.status(500).json({ error: 'Errore nel recupero dei corsi', dettaglio: error.message });
  }
});

// =====================================================
// 2. GET TEACHERS (CON JOIN SU USERS)
// =====================================================
app.get('/api/teachers', async (req, res) => {
  try {
    console.log('Tentativo di recupero docenti relazionali...');
    
    // Uniamo i dettagli del docente con i dati anagrafici memorizzati in users
    const querySQL = `
      SELECT 
        t.id, t.titolo, t.bio, t.tariffaOraria, t.stelle, t.recensioni, t.avatar, t.disponibileOggi, t.materie,
        CONCAT(u.nome, ' ', u.cognome) AS nome,
        u.email
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.id ASC
    `;
    
    const [rows] = await db.query(querySQL);
    res.json(rows);
  } catch (error) {
    console.error('Errore GET docenti:', error);
    res.status(500).json({ error: 'Errore nel recupero dei docenti', dettaglio: error.message });
  }
});

// =====================================================
// 3. REGISTRAZIONE UTENTE
// =====================================================
app.post('/api/auth/register', async (req, res) => {
  const { nome, cognome, username, email, password, role } = req.body;

  if (!nome || !cognome || !username || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username o Email già utilizzati' });
    }

    const userRole = role || 'student';

    const [result] = await db.query(
      'INSERT INTO users (nome, cognome, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cognome, username, email, password, userRole]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      cognome,
      username,
      email,
      role: userRole
    });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// =====================================================
// 4. LOGIN UTENTE (URL aggiornato a /api/auth/login)
// =====================================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password sono richiesti' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = rows[0];
    console.log(`Utente loggato: ${user.username} (${user.role})`);
    
    res.json({
      id: user.id,
      nome: user.nome,
      cognome: user.cognome,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// =====================================================
// AVVIO DEL SERVER CON SICUREZZA CHIAVI ESTERNE
// =====================================================
async function startServer() {
  try {
    // Gestione dei vincoli FK isolata anche qui prima del seed distruttivo
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await initDatabase();
    await seedDatabase();
    
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Database MySQL pronto e popolato.');
    
    app.listen(port, () => {
      console.log(`Server Express in ascolto su http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Impossibile avviare il server:', error.message);
    process.exit(1);
  }
}

startServer();