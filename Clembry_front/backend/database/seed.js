const pool = require('../db');

async function seedDatabase() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM courses');

  if (rows[0].count > 0) {
    console.log('Database già popolato');
    return;
  }

  // 1. INSERIMENTO USERS
await pool.query(`
    INSERT INTO users (nome, cognome, username, password, email, role)
    VALUES
    -- Docenti
    ('Mario', 'Rossi', 'mrossi', 'hashed_pw', 'mario@email.com', 'teacher'),
    ('Elena', 'Bianchi', 'ebianchi', 'hashed_pw', 'elena@email.com', 'teacher'),
    ('Sarah', 'Jenkins', 'sjenkins', 'hashed_pw', 'sarah@email.com', 'teacher'),
    ('Luca', 'Verdi', 'lverdi', 'hashed_pw', 'luca@email.com', 'teacher'),
    ('Giulia', 'Neri', 'gneri', 'hashed_pw', 'giulia@email.com', 'teacher'),
    ('Marco', 'Russo', 'mrusso', 'hashed_pw', 'marco@email.com', 'teacher'),
    ('Simone', 'Esposito', 'sesposito', 'hashed_pw', 'simone@email.com', 'teacher'),
    ('Chiara', 'Monti', 'cmonti', 'hashed_pw', 'chiara@email.com', 'teacher'),

    -- Studenti
    ('Alessandro', 'Gialli', 'agialli', 'hashed_pw', 'alessandro@email.com', 'student'),
    ('Sofia', 'Ferrari', 'sferrari', 'hashed_pw', 'sofia@email.com', 'student'),
    ('Matteo', 'Romano', 'mromano', 'hashed_pw', 'matteo@email.com', 'student'),
    ('Anna', 'Costa', 'acosta', 'hashed_pw', 'anna@email.com', 'student'),
    ('Davide', 'Greco', 'dgreco', 'hashed_pw', 'davide@email.com', 'student');
  `);

  // 2. RECUPERO ID PER MAPPARE LE RELAZIONI
  const [teachers] = await pool.query("SELECT id, nome, cognome FROM users WHERE role = 'teacher'");
  const [students] = await pool.query("SELECT id FROM users WHERE role = 'student'");

  const teacherMap = {};
  teachers.forEach(t => teacherMap[`${t.nome} ${t.cognome}`] = t.id);

  // 3. SEED TEACHERS
  const teacherProfiles = teachers.map((t, index) => {
  const data = [
    ['Ingegnere del Software', JSON.stringify(['Programmazione', 'Database']), 'Esperto in Angular.', 30, 5, 28, 'https://api.dicebear.com/10.x/lorelei/svg?seed=software-engineer', true],
    ['Docente Matematica', JSON.stringify(['Matematica']), 'Oltre 10 anni di esperienza.', 25, 5, 42, 'https://api.dicebear.com/10.x/lorelei/svg?seed=math-teacher', true],
    ['Madrelingua CELTA', JSON.stringify(['Lingue']), 'Lezioni interattive.', 28, 4, 19, 'https://api.dicebear.com/10.x/lorelei/svg?seed=english-native', false],
    ['Data Scientist', JSON.stringify(['Data Science']), 'Analisi e ML.', 40, 5, 15, 'https://api.dicebear.com/10.x/lorelei/svg?seed=data-scientist', true],
    ['Graphic Designer', JSON.stringify(['Design']), 'UI/UX specialist.', 35, 4, 10, 'https://api.dicebear.com/10.x/lorelei/svg?seed=graphic-designer', true],
    ['Digital Strategist', JSON.stringify(['Marketing']), 'Growth hacker.', 45, 5, 20, 'https://api.dicebear.com/10.x/lorelei/svg?seed=digital-strategist', true],
    ['Cyber Expert', JSON.stringify(['Informatica']), 'Security Consultant.', 50, 5, 30, 'https://api.dicebear.com/10.x/lorelei/svg?seed=cyber-expert', true],
    ['Insegnante Lingue', JSON.stringify(['Lingue']), 'Metodo comunicativo.', 25, 4, 12, 'https://api.dicebear.com/10.x/lorelei/svg?seed=language-teacher', true]
  ][index];

  return [t.id, ...data];
});

  await pool.query(
    `INSERT INTO teachers (user_id, titolo, materie, bio, tariffaOraria, stelle, recensioni, avatar, disponibileOggi) VALUES ?`,
    [teacherProfiles]
  );

  // 4. SEED COURSES
  const coursesData = [
    ['Sviluppo Web con Angular', 'Impara a costruire applicazioni web moderne, scalabili e performanti utilizzando il framework Angular.', teacherMap['Mario Rossi'], 'Programmazione', 49.0, '22 Giugno 2026', 5, '👨‍💻'],
    ['Matematica Finanziaria', 'Comprendi i meccanismi degli investimenti, dei tassi di interesse e della gestione del capitale nel tempo.', teacherMap['Elena Bianchi'], 'Matematica', 25.0, '24 Giugno 2026', 4, '📐'],
    ['Inglese B2', 'Potenzia la tua padronanza della lingua inglese per contesti lavorativi e accademici avanzati.', teacherMap['Sarah Jenkins'], 'Lingue', 35.0, '29 Giugno 2026', 5, '🇬🇧'],
    ['Data Science con Python', 'Introduzione all\'analisi dati e machine learning.', teacherMap['Luca Verdi'], 'Data Science', 60.0, '01 Luglio 2026', 5, '📊'],
    ['Design Grafico Base', 'Impara le basi di Photoshop e Illustrator.', teacherMap['Giulia Neri'], 'Design', 40.0, '05 Luglio 2026', 4, '🎨'],
    ['Marketing Digitale', 'Strategie per posizionare il tuo brand online.', teacherMap['Marco Russo'], 'Marketing', 55.0, '10 Luglio 2026', 5, '📈'],
    ['Introduzione alla Cyber Security', 'Proteggi i tuoi dati e comprendi le minacce online.', teacherMap['Simone Esposito'], 'Informatica', 70.0, '25 Luglio 2026', 5, '🔐'],
    ['Tedesco Base', 'Impara le basi della lingua tedesca per viaggi e lavoro.', teacherMap['Chiara Monti'], 'Lingue', 30.0, '30 Luglio 2026', 4, '🇩🇪'],
    ['Java Fondamentale', 'Approfondisci la sintassi Java, la programmazione orientata agli oggetti e le strutture dati.', teacherMap['Mario Rossi'], 'Programmazione', 50.0, '02 Agosto 2026', 5, '☕'],
    ['Spring Boot Avanzato', 'Costruisci microservizi robusti e sicuri con Spring Boot e Spring Cloud.', teacherMap['Mario Rossi'], 'Programmazione', 80.0, '05 Agosto 2026', 5, '🚀'],
    ['Cloud Computing Essentials', 'Introduzione alle architetture cloud, AWS e concetti di scalabilità.', teacherMap['Simone Esposito'], 'Informatica', 75.0, '10 Agosto 2026', 5, '☁️']
];

  const [courseResult] = await pool.query(
    `INSERT INTO courses (titolo, descrizione, teacher_id, materia, prezzo, dataOra, stelle, immagine) VALUES ?`,
    [coursesData]
  );

 // 5. SEED ISCRIZIONI
  const firstCourseId = courseResult.insertId;
  const iscrizioni = [
    [students[0].id, firstCourseId],
    [students[1].id, firstCourseId + 1],
    [students[2].id, firstCourseId + 2],
    [students[2].id, firstCourseId + 1]
  ];

  for (const iscrizione of iscrizioni) {
    await pool.query('INSERT INTO subscriptions (user_id, course_id) VALUES (?, ?)', iscrizione);
  }
}

module.exports = seedDatabase;
