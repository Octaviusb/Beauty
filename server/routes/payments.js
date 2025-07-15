const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const WOMPI_API_URL = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

router.get('/config', (req, res) => {
  if (!WOMPI_PUBLIC_KEY) {
    return res.status(500).json({ error: 'Falta la llave pública de Wompi.' });
  }
  res.json({ publicKey: WOMPI_PUBLIC_KEY });
});

router.post('/create-transaction', async (req, res) => {
  try {
    const { amount_in_cents, customer_email, reference } = req.body;
    if (!amount_in_cents || !customer_email || !reference) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const response = await axios.post(
      `${WOMPI_API_URL}/transactions`,
      {
        amount_in_cents,
        currency: 'COP',
        customer_email,
        payment_method: { type: 'PSE' },
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`
        }
      }
    );

    const data = response.data;
    res.status(201).json({
      transactionId: data.data.id,
      reference: data.data.reference,
      publicKey: WOMPI_PUBLIC_KEY
    });
  } catch (error) {
    console.error('❌ Error creando transacción:', error.message);
    res.status(500).json({ error: 'Error creando transacción en Wompi' });
  }
});

router.get('/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${WOMPI_API_URL}/transactions/${id}`);
    const transaction = response.data.data;

    if (transaction.status === 'APPROVED') {
      const db = new sqlite3.Database(path.join(__dirname, '../db.sqlite'));
      db.run(
        `UPDATE orders SET status = 'pagado', updated_at = CURRENT_TIMESTAMP WHERE reference = ?`,
        [transaction.reference],
        (err) => {
          if (err) console.error('❌ Error actualizando estado:', err);
          db.close();
        }
      );
    }

    res.status(200).json({
      id: transaction.id,
      status: transaction.status,
      reference: transaction.reference,
      payment_method_type: transaction.payment_method_type
    });
  } catch (error) {
    console.error('❌ Error verificando transacción:', error.message);
    res.status(500).json({ error: 'Error al verificar transacción' });
  }
});

module.exports = router;
