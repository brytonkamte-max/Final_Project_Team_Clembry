require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const initDatabase = require('./database/init');
const seedDatabase = require('./database/seed');
const { todo } = require('node:test');

const app = express();
const port = 8080;

// Middleware
app.use(cors({ origin: 'http://localhost:4200' }));

app.use(express.json());

// GET - Endpoint per recuperare tutti gli utenti dal database
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Errore recupero utenti:', error);
    res.status(500).json({ error: 'Errore nel recupero degli utenti' });
  }
});

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

// GET - Endpoint per recuperare tutti i docenti dal database
app.get('/api/teachers', async (req, res) => {
  try {
    console.log('Tentativo di recupero docenti...');

    // Specifichiamo 'teachers.id' per l'ordinamento e usiamo un alias per gli ID
    const [rows] = await db.query(`
      SELECT
        teachers.*,
        users.id AS user_id_ref,
        users.nome,
        users.cognome,
        users.email
      FROM teachers
      JOIN users ON teachers.user_id = users.id
      ORDER BY teachers.id ASC
    `);

    console.log(`Docenti recuperati: ${rows.length}`);
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
    const [existingUser] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [
      username,
      email,
    ]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username o Email già utilizzati' });
    }

    const userRole = role || 'student';

    const [result] = await db.query(
      'INSERT INTO users (nome, cognome, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cognome, username, email, password, userRole],
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      cognome,
      username,
      email,
      role: userRole,
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
      role: user.role,
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// =====================================================
// AVVIO DEL SERVER CON SICUREZZA CHIAVI ESTERNE
// =====================================================
// GET - Endpoint per recuperare il profilo di un utente dal database
app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT nome,cognome,username,email
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profilo docente non trovato per questo utente' });
    }

    // Restituiamo il primo risultato (essendo una relazione 1:1)
    res.json(rows[0]);
  } catch (error) {
    console.error('Errore GET docente by userId:', error);
    res.status(500).json({ error: 'Errore nel recupero del profilo docente' });
  }
});

// GET - Endpoint per recuperare un corso dal database
app.get('/api/course/:courseId', async (req, res) => {
  const { courseId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
         courses.*,
         teachers.titolo AS teacher_title,
         users.nome AS teacher_nome,
         users.cognome AS teacher_cognome
       FROM courses
       JOIN teachers ON courses.teacher_id = teachers.id
       JOIN users ON teachers.user_id = users.id
       WHERE courses.id = ?`,
      [courseId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Corso non trovato' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Errore GET corso:', error);
    res.status(500).json({ error: 'Errore nel recupero del corso' });
  }
});

// GET - Endpoint per recuperare le iscrizioni di un utente
app.get('/api/subscriptions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
         subscriptions.*,
         courses.titolo AS titolo,
         courses.materia AS materia,
         courses.dataOra AS dataOra,
         courses.immagine AS immagine,
         t.nome AS teacher_nome,
         t.cognome AS teacher_cognome,
         s.nome AS student_nome,
         s.cognome AS student_cognome
       FROM subscriptions
       JOIN courses ON subscriptions.course_id = courses.id
       JOIN users AS t ON courses.teacher_id = t.id    -- t = tabella insegnanti
       JOIN users AS s ON subscriptions.user_id = s.id -- s = tabella studenti
       WHERE subscriptions.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Errore GET subscriptions:', error);
    res.status(500).json({ error: 'Errore nel recupero delle iscrizioni' });
  }
});

// POST - Endpoint per la registrazione di un nuovo utente
app.post('/api/auth/register', async (req, res) => {
  const { nome, cognome, username, email, password, role } = req.body;

  // Validazione minima dei campi obbligatori
  if (!nome || !cognome || !username || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    // Controlliamo se l'username o l'email esistono già
    const [existingUser] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [
      username,
      email,
    ]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username o Email già utilizzati' });
    }

    // Impostiamo un ruolo di default se non specificato
    const userRole = role || 'student';

    /* NOTA DI SICUREZZA: In produzione, sostituisci la password in chiaro
      usando una libreria di hashing come bcrypt (es: await bcrypt.hash(password, 10))
    */
    const [result] = await db.query(
      'INSERT INTO users (nome, cognome, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cognome, username, email, password, userRole],
    );

    // Rispondiamo con i dati dell'utente creato (escludendo la password)
    const newUser = {
      id: result.insertId,
      nome,
      cognome,
      username,
      email,
      role: userRole,
    };

    console.log(`Nuovo utente registrato con successo: ${username}`);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ error: 'Errore interno del server durante la registrazione' });
  }
});

// POST - Endpoint per la registrazione di un nuovo docente
// TODO: Occorre un controllo delle foreign key user_id
app.post('/api/teachers', async (req, res) => {
  const { user_id, titolo, materie, bio, tariffaOraria, avatar } = req.body;

  // Validazione base
  if (!user_id || !titolo || !materie || !bio || !tariffaOraria || !avatar) {
    return res.status(400).json({ error: 'Tutti i campi obbligatori devono essere compilati' });
  }

  try {
    // Nota: 'materie' viene inviato come array JSON, mysql2 lo gestisce automaticamente
    const [result] = await db.query(
      'INSERT INTO teachers (user_id, titolo, materie, bio, tariffaOraria, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, JSON.stringify(materie), bio, tariffaOraria, avatar], // Convertiamo esplicitamente in stringa per sicurezza
    );

    res.status(201).json({
      message: 'Profilo docente creato con successo',
      teacherId: result.insertId,
    });
  } catch (error) {
    console.error('Errore inserimento docente:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// PATCH - Endpoint per l'aggiornamento di un docente
app.patch('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body; // I campi da aggiornare

  // 1. Verifichiamo che ci sia qualcosa da aggiornare
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return res.status(400).json({ error: 'Nessun campo da aggiornare fornito' });
  }

  try {
    // 2. Costruiamo la query dinamicamente
    // Es: "SET titolo = ?, bio = ?, tariffaOraria = ?"
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    // Se stiamo aggiornando le 'materie', dobbiamo convertirle in JSON string
    if (fields.materie) {
      const index = keys.indexOf('materie');
      values[index] = JSON.stringify(fields.materie);
    }

    // 3. Eseguiamo l'aggiornamento
    const [result] = await db.query(`UPDATE teachers SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Insegnante non trovato' });
    }

    res.json({ message: 'Profilo aggiornato con successo' });
  } catch (error) {
    console.error('Errore durante PATCH teachers:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST - Endpoint per la registrazione di un nuovo corso
// TODO: Occorre un controllo delle foreign key teacher_id
app.post('/api/courses', async (req, res) => {
  const { titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine } = req.body;

  // Validazione campi obbligatori
  if (!titolo || !teacher_id || !materia || !prezzo || !dataOra || !immagine) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO courses (titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine],
    );

    res.status(201).json({
      message: 'Corso creato con successo',
      courseId: result.insertId,
    });
  } catch (error) {
    console.error('Errore inserimento corso:', error);
    res.status(500).json({ error: 'Errore durante la creazione del corso' });
  }
});

// Funzione per avviare il server
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
