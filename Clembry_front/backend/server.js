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
app.use(express.json());

// =====================================================
// UTENTI & AUTHENTICATION
// =====================================================

// GET - Recupera tutti gli utenti
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Errore recupero utenti:', error);
    res.status(500).json({ error: 'Errore nel recupero degli utenti' });
  }
});

// GET - Recupera profilo utente specifico
app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT nome, cognome, username, email, role FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Errore GET user:', error);
    res.status(500).json({ error: 'Errore nel recupero del profilo utente' });
  }
});

// POST - Registrazione Utente
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

// POST - Login Utente
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
// DOCENTI (TEACHERS)
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

// GET - Recupera tutti i docenti relazionati
app.get('/api/teachers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT teachers.*, users.nome, users.cognome, users.email
      FROM teachers
      JOIN users ON teachers.user_id = users.id
      ORDER BY teachers.id ASC
    `);
    res.json(rows);
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
    console.error('Errore GET docenti:', error);
    res.status(500).json({ error: 'Errore nel recupero dei docenti', dettaglio: error.message });
  }
});

// POST - Crea profilo docente
app.post('/api/teachers', async (req, res) => {
  const { user_id, titolo, materie, bio, tariffaOraria, avatar } = req.body;
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

  if (!user_id || !titolo || !materie || !bio || !tariffaOraria || !avatar) {
    return res.status(400).json({ error: 'Tutti i campi obbligatori devono essere compilati' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO teachers (user_id, titolo, materie, bio, tariffaOraria, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, JSON.stringify(materie), bio, tariffaOraria, avatar]
    );
    res.status(201).json({ message: 'Profilo docente creato con successo', teacherId: result.insertId });
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
    console.error('Errore inserimento docente:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// PUT/PATCH - Aggiornamento completo/parziale profilo docente
app.put('/api/teachers/:id', async (req, res) => {
  const teacherId = req.params.id;
  const { bio, titolo } = req.body;

  if (!titolo) {
    return res.status(400).json({ error: 'Il titolo/qualifica è obbligatorio' });
  }

  try {
    const [result] = await db.query(
      'UPDATE teachers SET bio = ?, titolo = ? WHERE id = ?',
      [bio || '', titolo, teacherId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente non trovato' });
    }
    res.json({ message: 'Profilo docente aggiornato con successo!' });
      'INSERT INTO teachers (user_id, titolo, materie, bio, tariffaOraria, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, JSON.stringify(materie), bio, tariffaOraria, avatar], // Convertiamo esplicitamente in stringa per sicurezza
    );

    res.status(201).json({
      message: 'Profilo docente creato con successo',
      teacherId: result.insertId,
    });
  } catch (error) {
    console.error('Errore update docente:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.patch('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);

  if (keys.length === 0) return res.status(400).json({ error: 'Nessun campo fornito' });

  try {
    // 2. Costruiamo la query dinamicamente
    // Es: "SET titolo = ?, bio = ?, tariffaOraria = ?"
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = Object.values(fields);

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
    console.error('Errore PATCH teachers:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// =====================================================
// CORSI (COURSES)
// =====================================================

// GET - Recupera tutti i corsi relazionali
app.get('/api/courses', async (req, res) => {
  try {
    const querySQL = `
      SELECT c.*, CONCAT(u.nome, ' ', u.cognome) AS docente
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      ORDER BY c.id ASC
    `;
    const [rows] = await db.query(querySQL);
    res.json(rows);
  } catch (error) {
    console.error('Errore GET corsi:', error);
    res.status(500).json({ error: 'Errore nel recupero dei corsi' });
  }
});

// GET - Recupera un singolo corso per ID
app.get('/api/course/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT courses.*, teachers.titolo AS teacher_title, users.nome AS teacher_nome, users.cognome AS teacher_cognome
      FROM courses
      JOIN teachers ON courses.teacher_id = teachers.id
      JOIN users ON teachers.user_id = users.id
      WHERE courses.id = ?`,
      [courseId]
    const [result] = await db.query(
      `INSERT INTO courses (titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Corso non trovato' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Errore GET corso:', error);
    res.status(500).json({ error: 'Errore nel recupero del corso' });
  }
});

// POST - Creazione di un nuovo corso relazionato
app.post('/api/courses', async (req, res) => {
  const { titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine } = req.body;

  if (!titolo || !teacher_id || !materia || prezzo === undefined || !dataOra) {
    return res.status(400).json({ error: 'I campi titolo, teacher_id, materia, prezzo e dataOra sono obbligatori' });
  }

  try {
    const querySQL = `
      INSERT INTO courses (titolo, descrizione, teacher_id, materia, prezzo, dataOra, immagine, stelle)
      VALUES (?, ?, ?, ?, ?, ?, ?, 5)
    `;
    const [result] = await db.query(querySQL, [titolo, descrizione || '', teacher_id, materia, prezzo, dataOra, immagine || '📘']);
    res.status(201).json({ message: 'Corso creato con successo!', courseId: result.insertId, titolo });
    res.status(201).json({
      message: 'Corso creato con successo',
      courseId: result.insertId,
    });
  } catch (error) {
    console.error('Errore inserimento corso:', error);
    res.status(500).json({ error: 'Errore durante la creazione del corso' });
  }
});

// =====================================================
// AVVIO DEL SERVER
// =====================================================
async function startServer() {
  try {
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
