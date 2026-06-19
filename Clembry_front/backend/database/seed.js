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
    ('Mario', 'Rossi', 'mrossi', 'hashed_pw', 'mario@email.com', 'teacher'),
    ('Elena', 'Bianchi', 'ebianchi', 'hashed_pw', 'elena@email.com', 'teacher'),
    ('Sarah', 'Jenkins', 'sjenkins', 'hashed_pw', 'sarah@email.com', 'teacher'),
    ('Luca', 'Verdi', 'lverdi', 'hashed_pw', 'luca@email.com', 'student'),
    ('Giulia', 'Neri', 'gneri', 'hashed_pw', 'giulia@email.com', 'student'),
    ('Alessandro', 'Gialli', 'agialli', 'hashed_pw', 'alessandro@email.com', 'student');
  `);

  // 2. RECUPERO ID PER MAPPARE LE RELAZIONI
  const [teachers] = await pool.query("SELECT id, nome, cognome FROM users WHERE role = 'teacher'");
  const [students] = await pool.query("SELECT id FROM users WHERE role = 'student'");

  const teacherMap = {};
  teachers.forEach(t => teacherMap[`${t.nome} ${t.cognome}`] = t.id);

  // 3. SEED TEACHERS
  const teacherProfiles = teachers.map((t, index) => {
  const data = [
    ['Ingegnere del Software', JSON.stringify(['Programmazione', 'Database']), 'Esperto in Angular.', 30, 5, 28, '👨‍💻', true],
    ['Docente Matematica', JSON.stringify(['Matematica']), 'Oltre 10 anni di esperienza.', 25, 5, 42, '👩‍🏫', true],
    ['Madrelingua CELTA', JSON.stringify(['Lingue']), 'Lezioni interattive.', 28, 4, 19, '🇬🇧', false]
  ][index];

  return [t.id, ...data];
});

  await pool.query(
    `INSERT INTO teachers (user_id, titolo, materie, bio, tariffaOraria, stelle, recensioni, avatar, disponibileOggi) VALUES ?`,
    [teacherProfiles]
  );

  // 4. SEED COURSES
  const coursesData = [
    ['Sviluppo Web con Angular', '...', teacherMap['Mario Rossi'], 'Programmazione', 49.0, '22 Giugno 2026', 5, '👨‍💻'],
    ['Matematica Finanziaria', '...', teacherMap['Elena Bianchi'], 'Matematica', 25.0, '24 Giugno 2026', 4, '📐'],
    ['Inglese B2', '...', teacherMap['Sarah Jenkins'], 'Lingue', 35.0, '29 Giugno 2026', 5, '🇬🇧']
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
