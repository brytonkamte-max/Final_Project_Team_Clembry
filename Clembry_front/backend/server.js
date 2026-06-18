require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const initDatabase = require('./database/init');
const seedDatabase = require('./database/seed');
const { todo } = require('node:test');

const app = express();
const port = 8080;

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

// GET - Endpoint per recuperare tutti i corsi dal database
app.get('/api/courses', async (req, res) => {
  try {
    console.log('Tentativo di recupero corsi...');

    // Eseguiamo la query sulla tabella dei corsi ordinandoli (opzionale) per data di creazione o id
    const [rows] = await db.query('SELECT * FROM courses ORDER BY id ASC');

    console.log(`Corsi recuperati con successo! Totale: ${rows.length}`);

    // Restituiamo l'array di corsi al frontend con stato 200 (OK)
    res.json(rows);
  } catch (error) {
    console.error('Errore GET corsi:', error);

    // In caso di errore lato server, rispondiamo con uno stato 500
    res.status(500).json({
      error: 'Errore nel recupero dei corsi dal database',
      dettaglio: error.message,
    });
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
    res.status(500).json({
      error: 'Errore nel recupero dei docenti dal database',
      dettaglio: error.message,
    });
  }
});

// GET - Endpoint per recuperare il profilo di un utente dal database
app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {

    const [rows] = await db.query(
      `SELECT nome,cognome,username,email
       FROM users
       WHERE id = ?`,
      [userId]
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
      [courseId]
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

// POST - Endpoint per la registrazione di un nuovo utente
app.post('/api/auth/register', async (req, res) => {
  const { nome, cognome, username, email, password, role } = req.body;

  // Validazione minima dei campi obbligatori
  if (!nome || !cognome || !username || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    // Controlliamo se l'username o l'email esistono già
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

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
      [nome, cognome, username, email, password, userRole]
    );

    // Rispondiamo con i dati dell'utente creato (escludendo la password)
    const newUser = {
      id: result.insertId,
      nome,
      cognome,
      username,
      email,
      role: userRole
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
      [user_id, JSON.stringify(materie), bio, tariffaOraria, avatar] // Convertiamo esplicitamente in stringa per sicurezza
    );

    res.status(201).json({
      message: 'Profilo docente creato con successo',
      teacherId: result.insertId
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
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    // Se stiamo aggiornando le 'materie', dobbiamo convertirle in JSON string
    if (fields.materie) {
      const index = keys.indexOf('materie');
      values[index] = JSON.stringify(fields.materie);
    }

    // 3. Eseguiamo l'aggiornamento
    const [result] = await db.query(
      `UPDATE teachers SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

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
      [titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine]
    );

    res.status(201).json({
      message: 'Corso creato con successo',
      courseId: result.insertId
    });
  } catch (error) {
    console.error('Errore inserimento corso:', error);
    res.status(500).json({ error: 'Errore durante la creazione del corso' });
  }
});

// Funzione per avviare il server
async function startServer() {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('Database MySQL pronto (phpMyAdmin compatibile).');
    console.log(
      `Connessione DB: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    );

    app.listen(port, () => {
      console.log(`Server Express + MySQL su http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Errore inizializzazione database:', error.message);
    process.exit(1);
  }
}

startServer();
