const express = require('express');
const router = express.Router();


// 🔥 Ruta clientes
router.get('/clientes', (req, res) => {
    res.render('clientes', {
        user: req.session.user
    });
});


module.exports = router;
