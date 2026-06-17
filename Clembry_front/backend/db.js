const mysql = require('mysql2/promise')
const { queue, connect } = require('rxjs')

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'Kengne40$',
  database: 'clembry',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

const pool = mysql.createPool(dbConfig)

async function initDatabase()
{
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  })
  try{
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
    await connection.query(`USE \`${dbConfig.database}\``)
    await connection.query(`
    CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titolo VARCHAR(255) NOT NULL,
        descrizione TEXT,
        docente VARCHAR(150) NOT NULL,
        materia VARCHAR(100) NOT NULL,
        prezzo DECIMAL(10, 2) NOT NULL,
        dataOra VARCHAR(100) NOT NULL,
        stelle INT DEFAULT 5,
        immagine VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
await connection.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        titolo VARCHAR(255) NOT NULL,
        materie JSON NOT NULL,
        bio TEXT NOT NULL,
        tariffaOraria INT NOT NULL,
        stelle INT DEFAULT 5,
        recensioni INT DEFAULT 0,
        avatar VARCHAR(50) NOT NULL,
        disponibileOggi BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
        `);

      
  }catch(err){
    console.log(err)
  }
  finally{
    await connection.end()
  }
}

module.exports = {
  query: (sql, params) => pool.query(sql, params),
  execute: (sql, params) => pool.execute(sql, params),
  getConnection: () => pool.getConnection,
  end: () => pool.end(),
  initDatabase,
  config: dbConfig
}
