require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const initDatabase = require('./database/init');
const seedDatabase = require('./database/seed');

const app = express();
const port = 8080;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());

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

app.get('/api/teachers', async (req, res) => {
  try {
    console.log('Tentativo di recupero docenti...');

    // Eseguiamo la query sulla tabella teachers
    const [rows] = await db.query('SELECT * FROM teachers ORDER BY id ASC');

    console.log(`Docenti recuperati: ${rows.length}`);

    /* Nota: MySQL restituisce il campo JSON 'materie' già come oggetto/array
      se usi mysql2, quindi non c'è bisogno di fare JSON.parse qui sul backend.
    */
    res.json(rows);
  } catch (error) {
    console.error('Errore GET docenti:', error);
    res.status(500).json({
      error: 'Errore nel recupero dei docenti dal database',
      dettaglio: error.message,
    });
  }
});

// //POST
// app.post('/api/tasks', async (req, res) => {
//   const {title, description} = req.body
//   try{
//     const [result] = await db.query(
//       'INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?))',
//       [title, description, false]
//     )

//     const newTask = {id = result.insertId, title, description, completed: false};
//     res.json(newTask)
//   }catch(err){
//     console.error('Errore POST task', error)
//     res.status(500).json({error: 'Errore creazione task'})
//   }
// });

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
