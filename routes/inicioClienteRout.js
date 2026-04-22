const express = require('express');
const router = express.Router();
// Ruta para vista de inicio del Cliente
router.get('/inicioCliente', function(req, res) {
    res.render('inicioCliente');// Renderiza la vista EJS llamada inicioCliente.ejs
});


module.exports = router;