const express = require('express');
const router = express.Router();

// Middleware de protección (opcional pero PRO 🔥)
function verificarSesion(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}


// Ruta inicio admin
router.get('/inicioAdmin', verificarSesion, function(req, res) {
    res.render('inicioAdmin', {
        user: req.session.user
    });
});

module.exports = router;