const pool = require('./config/db');

async function testConnection() {
  try {
    // Mostrar tablas
    const [tables] = await pool.query('SHOW TABLES;');
    console.log('Tablas en la BD:', tables);

    // Insertar un cliente de prueba
    const [insert] = await pool.query(
      `INSERT INTO Clientes (TipoDocumento, Documento, NombreCompleto, Telefono, Email, Licencia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['CC', '21', 'juan', '54', 'juan@example.com', 'LIC0']
    );
    console.log('Cliente insertado con ID:', insert.insertId);

    // Consultar clientes
    const [rows] = await pool.query('SELECT * FROM Clientes;');
    console.log('Clientes registrados:', rows);

  } catch (err) {
    console.error('Error de conexión o consulta:', err.message);
  } finally {
    pool.end();
  }
}

testConnection();