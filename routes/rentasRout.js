const express = require('express');
const router = express.Router();

//  Verificar sesión
function verificarSesion(req, res, next) {
    if (!req.session.user) return res.redirect('/');
    next();
}


// ================= GET - Ver todas las rentas =================
router.get('/', verificarSesion, (req, res) => {
    res.render('rentas', {
        user: req.session.user,
        rentas: [],
        total: 0
    });
});

module.exports = router;
