// Orders API routes for BeautyGlow
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db.sqlite');
const { enviarPedidoPorCorreo } = require('../email');
const DESTINO_DESPACHO = process.env.CORREO_DESPACHO || 'despacho@tudominio.com'; // Cambia por el correo real
const upload = require('../multerConfig');

// POST /api/orders - crear pedido
router.post('/', upload.single('comprobante'), async (req, res) => {
  let data = req.body;
  let items = data.items;
  let payment_proof = null;
  if (req.file) {
    payment_proof = '/uploads/' + req.file.filename;
  }
  // Si viene como multipart, items es string
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { items = []; }
  }
  const { customer_name, customer_email, customer_phone, address, total } = data;
  if (!items || !total) {
    return res.status(400).json({ error: 'Faltan datos del pedido.' });
  }
  const db = new sqlite3.Database(dbPath);
  db.run(
    `INSERT INTO orders (customer_name, customer_email, customer_phone, address, items, total, status, payment_proof, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pendiente_pago', ?, CURRENT_TIMESTAMP)`,
    [customer_name, customer_email, customer_phone, address, JSON.stringify(items), total, payment_proof],
    function (err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Error al registrar el pedido.' });
      }
      // El correo se enviará cuando un admin confirme el pago.
      res.json({ success: true, order_id: this.lastID });
    }
  );
});

// PATCH /api/orders/:id - actualizar estado (ej: marcar como pagado)
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!status) {
    return res.status(400).json({ error: 'El estado es requerido.' });
  }

  const db = new sqlite3.Database(dbPath);

  // Usamos una transacción para asegurar la consistencia
  db.serialize(async () => {
    db.run('BEGIN TRANSACTION');

    try {
      // Actualizar el estado y la fecha de modificación
      const stmt = db.prepare(`UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
      const result = stmt.run(status, orderId);

      if (result.changes === 0) {
        db.run('ROLLBACK');
        db.close();
        return res.status(404).json({ error: 'Pedido no encontrado.' });
      }

      // Si el estado es 'pagado', obtener los datos del pedido y enviar el correo
      if (status === 'pagado') {
        const order = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
            if (err) reject(err);
            resolve(row);
          });
        });

        if (order) {
          await enviarPedidoPorCorreo({
            ...order,
            items: JSON.parse(order.items)
          }, DESTINO_DESPACHO);
        }
      }

      db.run('COMMIT');
      res.json({ success: true });

    } catch (err) {
      db.run('ROLLBACK');
      console.error('Error al actualizar el pedido:', err);
      res.status(500).json({ error: 'Error interno al actualizar el pedido.' });
    } finally {
      db.close();
    }
  });
});

// GET /api/orders - listar pedidos (admin)
router.get('/', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Error al listar pedidos.' });
    }
    res.json(rows);
  });
});

module.exports = router;
