const express = require('express');
const path = require('path');
const session = require('express-session');


const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 SESIONES
app.use(session({
    secret: 'gym_secret',
    resave: false,
    saveUninitialized: true
}));

// ================= VISTAS =================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================= USUARIOS =================
const users = [
    { email: 'admin@gmail.com', password: '123', role: 'admin' },
    { email: 'cliente1@gmail.com', password: '123', role: 'cliente' },
    { email: 'osman@gmail.com', password: '123', role: 'cliente' },
];

// ================= FUNCIONES MIDDLEWARE =================

function verificarSesion(req, res, next) {
    if (!req.session.user) return res.redirect('/');
    next();
}

function soloAdmin(req, res, next) {
    if (req.session.user?.role !== 'admin') return res.redirect('/InicioCliente');
    next();
}

// ================= RUTAS EXTERNAS =================
const vehiculosRoutes = require('./routes/vehiculosRout');
app.use('/vehiculos', vehiculosRoutes);

// ================= RUTA PRINCIPAL =================
app.get('/', (req, res) => {
    res.render('index', { error: null, success: null });
});

// ================= LOGIN =================
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.render('index', { error: 'Credenciales incorrectas', success: null });
    }

    req.session.user = user;

    if (user.role === 'admin') return res.redirect('/inicioAdmin');
    if (user.role === 'cliente') return res.redirect('/InicioCliente');
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
// 📄 Rentas
app.get('/rentas', verificarSesion, soloAdmin, (req, res) => {
    res.render('rentas', { user: req.session.user });
});
//pagos
app.get('/pagos', verificarSesion, soloAdmin, (req, res) => {
    res.render('pagos', { user: req.session.user });
});
//reportes
app.get('/reportes', verificarSesion, soloAdmin, (req, res) => {
    res.render('reportes', { user: req.session.user });
});

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);


// ================= RUTAS CLIENTE =================
app.get('/InicioCliente', verificarSesion, (req, res) => {
    res.render('InicioCliente', { user: req.session.user });
}
);


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