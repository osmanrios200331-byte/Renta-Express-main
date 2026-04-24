const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./config/db');

const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ================= SESIONES =================
app.use(session({
    secret: 'gym_secret',
    resave: false,
    saveUninitialized: true
}));

// ================= VISTAS =================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================= FUNCIONES MIDDLEWARE =================
function verificarSesion(req, res, next) {
    if (!req.session.user) return res.redirect('/');
    next();
}

function soloAdmin(req, res, next) {
    if (req.session.user?.rol !== 'Administrador') return res.redirect('/InicioCliente');
    next();
}

// ================= RUTAS EXTERNAS =================
const vehiculosRoutes = require('./routes/vehiculosRout');
app.use('/vehiculos', vehiculosRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// ================= RUTA PRINCIPAL =================
app.get('/', (req, res) => {
    res.render('index', { error: null, success: null });
});

// ================= LOGIN =================
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.query(
            'SELECT * FROM Usuarios WHERE Email = ? AND Estado = "Activo"',
            [email]
        );

        if (results.length === 0) {
            return res.render('index', { error: 'Credenciales incorrectas', success: null });
        }

        const user = results[0];
        const coincide = await bcrypt.compare(password, user.PasswordHash);

        if (!coincide) {
            return res.render('index', { error: 'Credenciales incorrectas', success: null });
        }

        req.session.user = {
            id:     user.IdUsuario,
            email:  user.Email,
            rol:    user.Rol,
            estado: user.Estado
        };

        if (user.Rol === 'Administrador') return res.redirect('/inicioAdmin');
        return res.redirect('/InicioCliente');

    } catch (error) {
        console.error('Error login:', error);
        return res.render('index', { error: 'Error del servidor', success: null });
    }
});

// ================= LOGOUT =================
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.sendStatus(200);
    });
});

// ================= RUTAS ADMIN =================
app.get('/inicioAdmin', verificarSesion, soloAdmin, (req, res) => {
    res.render('inicioAdmin', { user: req.session.user });
});

app.get('/clientes', verificarSesion, soloAdmin, (req, res) => {
    res.render('clientes', { user: req.session.user });
});

app.get('/rentas', verificarSesion, soloAdmin, (req, res) => {
    res.render('rentas', { user: req.session.user });
});

app.get('/pagos', verificarSesion, soloAdmin, (req, res) => {
    res.render('pagos', { user: req.session.user });
});

app.get('/reportes', verificarSesion, soloAdmin, (req, res) => {
    res.render('reportes', { user: req.session.user });
});

// ================= RUTAS CLIENTE =================
app.get('/InicioCliente', verificarSesion, (req, res) => {
    res.render('InicioCliente', { user: req.session.user });
});

// ================= RUTAS GENERALES =================
app.get('/perfil', verificarSesion, (req, res) => {
    res.render('perfil', { user: req.session.user });
});

app.get('/configuracion', verificarSesion, (req, res) => {
    res.render('configuracion', { user: req.session.user });
});

// ================= SERVER =================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});