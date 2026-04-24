const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ==========================================
// 1. CLIENTES
// ==========================================

router.get('/clientes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Clientes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});

router.get('/clientes/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM Clientes WHERE IdCliente = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});

router.post('/clientes', async (req, res) => {
    try {
        const {
            TipoDocumento,
            Documento,
            NombreCompleto,
            Telefono,
            Email,
            Licencia
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO Clientes 
            (TipoDocumento, Documento, NombreCompleto, Telefono, Email, Licencia) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [TipoDocumento, Documento, NombreCompleto, Telefono, Email, Licencia]
        );

        res.status(201).json({ id: result.insertId });

    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});

router.put('/clientes/:id', async (req, res) => {
    try {
        const {
            TipoDocumento,
            Documento,
            NombreCompleto,
            Telefono,
            Email,
            Licencia
        } = req.body;

        await db.query(
            `UPDATE Clientes SET 
            TipoDocumento=?,
            Documento=?,
            NombreCompleto=?,
            Telefono=?,
            Email=?,
            Licencia=?
            WHERE IdCliente=?`,
            [
                TipoDocumento,
                Documento,
                NombreCompleto,
                Telefono,
                Email,
                Licencia,
                req.params.id
            ]
        );

        res.json({ mensaje: "Cliente actualizado" });

    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});

router.delete('/clientes/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM Clientes WHERE IdCliente=?',
            [req.params.id]
        );

        res.json({ mensaje: "Cliente eliminado" });

    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});


// ==========================================
// 2. VEHICULOS
// ==========================================

router.get('/vehiculos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Vehiculos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.get('/vehiculos/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM Vehiculos WHERE IdVehiculos=?',
            [req.params.id]
        );
 
        if (rows.length === 0) {
            return res.status(404).json({ error: "Vehículo no encontrado" });
        }
 
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.post('/vehiculos', async (req, res) => {
    try {
        const {
            Placa,
            Marca,
            Modelo,
            Anio,
            Color,
            TipoVehiculo,
            Transmision,
            Combustible,
            TarifaDiaria,
            Estado
            // FechaRegistro es automática (DEFAULT CURRENT_TIMESTAMP)
        } = req.body;
 
        const [result] = await db.query(
            `INSERT INTO Vehiculos 
            (Placa, Marca, Modelo, Anio, Color, TipoVehiculo, Transmision, Combustible, TarifaDiaria, Estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [Placa, Marca, Modelo, Anio, Color, TipoVehiculo, Transmision, Combustible, TarifaDiaria, Estado]
        );
 
        res.json({ IdVehiculos: result.insertId, ...req.body });
 
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.put('/vehiculos/:id', async (req, res) => {
    try {
        const {
            Placa,
            Marca,
            Modelo,
            Anio,
            Color,
            TipoVehiculo,
            Transmision,
            Combustible,
            TarifaDiaria,
            Estado
        } = req.body;
 
        await db.query(
            `UPDATE Vehiculos SET 
            Placa=?, Marca=?, Modelo=?, Anio=?, Color=?, 
            TipoVehiculo=?, Transmision=?, Combustible=?, TarifaDiaria=?, Estado=?
            WHERE IdVehiculos=?`,
            [Placa, Marca, Modelo, Anio, Color, TipoVehiculo, Transmision, Combustible, TarifaDiaria, Estado, req.params.id]
        );
 
        res.json({ mensaje: "Vehículo actualizado" });
 
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.delete('/vehiculos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Vehiculos WHERE IdVehiculos=?', [req.params.id]);
        res.json({ mensaje: "Vehículo eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});

// ==========================================
// 3. RENTAS
// ==========================================

router.get('/rentas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Rentas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.post('/rentas', async (req, res) => {
    try {
        const { IdCliente, IdVehiculos, FechaInicio, FechaFin, TarifaAplicada, ValorTotal } = req.body;
 
        // Verificar que el vehículo existe
        const [vehiculo] = await db.query(
            'SELECT * FROM Vehiculos WHERE IdVehiculos=?',
            [IdVehiculos]
        );
 
        if (vehiculo.length === 0) {
            return res.status(404).json({ error: "Vehículo no existe" });
        }
 
        const [result] = await db.query(
            `INSERT INTO Rentas (IdCliente, IdVehiculos, FechaInicio, FechaFin, TarifaAplicada, ValorTotal) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [IdCliente, IdVehiculos, FechaInicio, FechaFin, TarifaAplicada, ValorTotal]
        );
 
        // Marcar vehículo como Rentado
        await db.query(
            'UPDATE Vehiculos SET Estado="Rentado" WHERE IdVehiculos=?',
            [IdVehiculos]
        );
 
        res.json({ IdRenta: result.insertId, ...req.body });
 
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.put('/rentas/:id', async (req, res) => {
    try {
        const { IdCliente, IdVehiculos, FechaInicio, FechaFin, TarifaAplicada, ValorTotal } = req.body;
 
        await db.query(
            `UPDATE Rentas SET 
             IdCliente=?, IdVehiculos=?, FechaInicio=?, FechaFin=?, TarifaAplicada=?, ValorTotal=?
             WHERE IdRenta=?`,
            [IdCliente, IdVehiculos, FechaInicio, FechaFin, TarifaAplicada, ValorTotal, req.params.id]
        );
 
        res.json({ mensaje: "Renta actualizada" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.delete('/rentas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Rentas WHERE IdRenta=?', [req.params.id]);
        res.json({ mensaje: "Renta eliminada" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});

// ==========================================
// 4. PAGOS
// ==========================================

router.get('/pagos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Pagos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.post('/pagos', async (req, res) => {
    try {
        const { IdRenta, Monto, MetodoPago, ReferenciaTransaccion } = req.body;
        // FechaPago es automática (DEFAULT CURRENT_TIMESTAMP)
 
        const [result] = await db.query(
            `INSERT INTO Pagos (IdRenta, Monto, MetodoPago, ReferenciaTransaccion) 
             VALUES (?, ?, ?, ?)`,
            [IdRenta, Monto, MetodoPago, ReferenciaTransaccion]
        );
 
        res.json({ IdPagos: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.put('/pagos/:id', async (req, res) => {
    try {
        const { IdRenta, Monto, MetodoPago, ReferenciaTransaccion } = req.body;
 
        await db.query(
            `UPDATE Pagos SET 
             IdRenta=?, Monto=?, MetodoPago=?, ReferenciaTransaccion=?
             WHERE IdPagos=?`,
            [IdRenta, Monto, MetodoPago, ReferenciaTransaccion, req.params.id]
        );
 
        res.json({ mensaje: "Pago actualizado" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
 
router.delete('/pagos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Pagos WHERE IdPagos=?', [req.params.id]);
        res.json({ mensaje: "Pago eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message, detalle: error });
    }
});
// ==========================================
// 5. REPORTES
// ==========================================

// Total de rentas por mes
router.get('/reportes/rentas-por-mes', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(FechaInicio, '%Y-%m') AS Mes,
                DATE_FORMAT(FechaInicio, '%M %Y') AS MesNombre,
                COUNT(*) AS TotalRentas
            FROM Rentas
            GROUP BY Mes, MesNombre
            ORDER BY Mes ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Ingresos totales por mes
router.get('/reportes/ingresos-por-mes', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(FechaPago, '%Y-%m') AS Mes,
                DATE_FORMAT(FechaPago, '%M %Y') AS MesNombre,
                SUM(Monto) AS TotalIngresos,
                COUNT(*) AS TotalPagos
            FROM Pagos
            GROUP BY Mes, MesNombre
            ORDER BY Mes ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;