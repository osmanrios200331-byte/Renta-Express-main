const bcrypt = require('bcrypt');
const db = require('./config/db');

async function crearAdmin() {
    const hash = await bcrypt.hash('Admin2026*', 10);

    db.query(
        `INSERT INTO Usuarios (Email, PasswordHash, Rol, Estado) VALUES (?, ?, ?, ?)`,
        ['admin@gmail.com', hash, 'Administrador', 'Activo'],
        (err) => {
            if (err) console.error('Error:', err);
            else console.log('Admin creado correctamente');
            process.exit();
        }
    );
}

crearAdmin();