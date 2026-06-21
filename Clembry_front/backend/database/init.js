const mysql = require('mysql2/promise');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await connection.query(`USE \`${process.env.DB_NAME}\``);

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  // DROP nell'ordine inverso rispetto alla creazione per evitare vincoli
  await connection.query(`DROP TABLE IF EXISTS subscriptions`);
  await connection.query(`DROP TABLE IF EXISTS courses`);
  await connection.query(`DROP TABLE IF EXISTS teachers`);
  await connection.query(`DROP TABLE IF EXISTS users`);

  // 1. Tabella USERS
  await connection.query(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      cognome VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      role ENUM('student', 'teacher') DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Tabella TEACHERS
  await connection.query(`
    CREATE TABLE teachers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      titolo VARCHAR(255) NOT NULL,
      materie JSON NOT NULL,
      bio TEXT NOT NULL,
      tariffaOraria INT NOT NULL,
      stelle INT DEFAULT 5,
      recensioni INT DEFAULT 0,
      avatar VARCHAR(100) NOT NULL,
      disponibileOggi BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

  // 3. Tabella COURSES
  await connection.query(`
    CREATE TABLE courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titolo VARCHAR(255) NOT NULL,
      descrizione TEXT,
      teacher_id INT NOT NULL,
      materia VARCHAR(100) NOT NULL,
      prezzo DECIMAL(10,2) NOT NULL,
      dataOra VARCHAR(100) NOT NULL,
      stelle INT DEFAULT 5,
      immagine VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE ON UPDATE CASCADE
    )`);

  // 4. Tabella subscriptions
  await connection.query(`
    CREATE TABLE subscriptions (
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      data_iscrizione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  await connection.end();
}

module.exports = initDatabase;
