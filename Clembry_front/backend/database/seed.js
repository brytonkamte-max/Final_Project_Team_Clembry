const pool = require('../db');

async function seedDatabase() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM courses');

  if (rows[0].count > 0) {
    console.log('Database già popolato');
    return;
  }

  // =========================
  // USERS (SEED)
  // =========================
  await pool.query(`
    INSERT INTO users (nome, cognome, username, password, email, role)
    VALUES
    ('Mario', 'Rossi', 'mrossi', 'hashed_pw', 'mario@email.com', 'teacher'),
    ('Elena', 'Bianchi', 'ebianchi', 'hashed_pw', 'elena@email.com', 'teacher'),
    ('Sarah', 'Jenkins', 'sjenkins', 'hashed_pw', 'sarah@email.com', 'teacher'),
    ('Luca', 'Verdi', 'lverdi', 'hashed_pw', 'luca@email.com', 'student')
  `);

  // =========================
  // GET TEACHERS
  // =========================
  const [teacherUsers] = await pool.query(`
    SELECT id, nome, cognome
    FROM users
    WHERE role = 'teacher'
  `);

  // =========================
  // MAP NOME COMPLETO → ID
  // =========================
  const teacherMap = {};
  teacherUsers.forEach(t => {
    teacherMap[`${t.nome} ${t.cognome}`] = t.id;
  });

  // =========================
  // TEACHER PROFILES
  // =========================
  const teacherProfiles = teacherUsers.map((t, index) => {
    const data = [
      [
        'Ingegnere del Software & Full-Stack Developer',
        ['Programmazione', 'Database'],
        'Specializzato in Angular, TypeScript e cloud.',
        30,
        5,
        28,
        '👨‍💻',
        true,
      ],
      [
        'Docente di Matematica e Fisica',
        ['Matematica', 'Scienze'],
        "Oltre 10 anni di esperienza nell'insegnamento.",
        25,
        5,
        42,
        '👩‍🏫',
        true,
      ],
      [
        'Insegnante madrelingua certificata CELTA',
        ['Lingue straniere'],
        'Lezioni interattive e conversazione.',
        28,
        4,
        19,
        '🇬🇧',
        false,
      ],
      [
        'Docente junior',
        ['Generale'],
        'Supporto didattico.',
        20,
        4,
        10,
        '👨‍🏫',
        true,
      ],
    ][index];

    return [
      t.id,
      data[0],
      JSON.stringify(data[1]),
      data[2],
      data[3],
      data[4],
      data[5],
      data[6],
      data[7],
    ];
  });

  await pool.query(
    `INSERT INTO teachers
      (user_id, titolo, materie, bio, tariffaOraria, stelle, recensioni, avatar, disponibileOggi)
     VALUES ?`,
    [teacherProfiles]
  );

  // =========================
  // COURSES (CON teacher_id)
  // =========================
  const courses = [
    [
      'Sviluppo Web Moderno con Angular',
      'Impara a creare applicazioni web scalabili usando Signals e Standalone Component.',
      teacherMap['Mario Rossi'],
      'Programmazione',
      49.0,
      '22 Giugno 2026 - 18:30',
      5,
      '👨‍💻',
    ],
    [
      'Matematica Finanziaria e Algebra Lineare',
      "Ripasso intensivo pre-esame su matrici e modelli economici.",
      teacherMap['Elena Bianchi'],
      'Matematica',
      25.0,
      '24 Giugno 2026 - 15:00',
      4,
      '📐',
    ],
    [
      'Inglese B2 per Sviluppatori Software',
      'Migliora la comunicazione tecnica e colloqui internazionali.',
      teacherMap['Sarah Jenkins'],
      'Lingue',
      35.0,
      '29 Giugno 2026 - 19:00',
      5,
      '🇬🇧',
    ],
    [
      'Database Relazionali e Ottimizzazione SQL',
      'Progettazione database e ottimizzazione query avanzate.',
      teacherMap['Mario Rossi'],
      'Programmazione',
      40.0,
      '02 Luglio 2026 - 17:00',
      4,
      '🗄️',
    ],
  ];

  await pool.query(
    `INSERT INTO courses
      (titolo, descrizione, teacher_id, materia, prezzo, dataOra, stelle, immagine)
     VALUES ?`,
    [courses]
  );

  console.log('Database popolato con dati iniziali');
}

module.exports = seedDatabase;
