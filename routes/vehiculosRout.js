const express = require('express');
const router = express.Router();

function verificarSesion(req, res, next) {
    if (!req.session.user) return res.redirect('/');
    next();
}


router.get('/', verificarSesion, (req, res) => {
    res.render('vehiculos', {
        user: req.session.user,
        vehiculos: [],
        total: 0,
        disponibles: 0,
        rentados: 0,
        mantenimiento: 0,
        inactivos: 0
    });
});

module.exports = router;