<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Usar axios para las peticiones
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


// --- Configuración de Wompi (Usa tus claves de producción en un entorno real) ---
const WOMPI_API_URL = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
// Las claves ahora se cargan desde variables de entorno.
// Asegúrate de tener un archivo .env en la raíz del proyecto con estas variables.
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

// --- Nueva ruta para obtener la configuración (llave pública) ---
router.get('/config', (req, res) => {
  if (!WOMPI_PUBLIC_KEY) {
    console.error('Error: La llave pública de Wompi (WOMPI_PUBLIC_KEY) no está configurada en las variables de entorno.');
    return res.status(500).json({ error: 'El servidor de pagos no está configurado correctamente.' });
  }
  res.json({ publicKey: WOMPI_PUBLIC_KEY });
});

router.post('/create-transaction', async (req, res) => {
  try {
    // --- DEBUGGING: Log the received body ---
    console.log('Recibido en /api/payments/create-transaction:', JSON.stringify(req.body, null, 2));

    const { amount_in_cents, customer_email, reference } = req.body;

    if (!amount_in_cents || !customer_email || !reference) {
      console.error('Validación fallida: Faltan datos.', { amount_in_cents, customer_email, reference });
      return res.status(400).json({ error: 'Faltan datos para la transacción' });
    }

    const transactionData = {
      amount_in_cents,
      currency: 'COP',
      customer_email,
      payment_method: { type: 'PSE' },
      reference,
    };

    const wompiResponse = await axios.post(
      `${WOMPI_API_URL}/transactions`,
      transactionData,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`
        }
      }
    );

    const wompiResult = wompiResponse.data; // En axios, la respuesta está en .data

    res.status(201).json({
      transactionId: wompiResult.data.id,
      reference: wompiResult.data.reference,
      publicKey: WOMPI_PUBLIC_KEY
    });

  } catch (error) {
    console.error('Error en /create-transaction:', error.response ? error.response.data : error.message);
    let errorMessage = 'Error al crear la transacción en Wompi';
    if (error.response?.data?.error?.messages) {
      // El objeto de mensajes puede ser complejo. Lo convertimos a string de forma segura.
      errorMessage = JSON.stringify(error.response.data.error.messages);
    }
    res.status(500).json({ error: errorMessage });
  }
});

// --- Nueva ruta para verificar el estado de una transacción ---
router.get('/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const wompiResponse = await axios.get(
      `${WOMPI_API_URL}/transactions/${id}`,
      {
        headers: {
          // ¡OJO! La verificación de estado NO requiere llave privada.
          // Se puede hacer con la pública si se desea, pero no es mandatorio.
          // 'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
        }
      }
    );

    const transaction = wompiResponse.data.data;

    // Si la transacción fue aprobada, actualizamos nuestro pedido
    if (transaction.status === 'APPROVED') {
      const db = new sqlite3.Database(path.join(__dirname, '../db.sqlite'));
      db.run(
        `UPDATE orders SET status = 'pagado', updated_at = CURRENT_TIMESTAMP WHERE reference = ?`,
        [transaction.reference],
        function(err) {
          if (err) {
            // Si falla, solo lo logueamos. La verificación puede reintentarse.
            console.error(`Error actualizando el pedido con referencia ${transaction.reference}:`, err);
          } else {
            console.log(`Pedido con referencia ${transaction.reference} marcado como pagado.`);
          }
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
    console.error('Error en /transaction/:id:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al verificar la transacción' });
  }
});

=======
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Usar axios para las peticiones
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


// --- Configuración de Wompi (Usa tus claves de producción en un entorno real) ---
const WOMPI_API_URL = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
// Las claves ahora se cargan desde variables de entorno.
// Asegúrate de tener un archivo .env en la raíz del proyecto con estas variables.
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

// --- Nueva ruta para obtener la configuración (llave pública) ---
router.get('/config', (req, res) => {
  if (!WOMPI_PUBLIC_KEY) {
    console.error('Error: La llave pública de Wompi (WOMPI_PUBLIC_KEY) no está configurada en las variables de entorno.');
    return res.status(500).json({ error: 'El servidor de pagos no está configurado correctamente.' });
  }
  res.json({ publicKey: WOMPI_PUBLIC_KEY });
});

router.post('/create-transaction', async (req, res) => {
  try {
    // --- DEBUGGING: Log the received body ---
    console.log('Recibido en /api/payments/create-transaction:', JSON.stringify(req.body, null, 2));

    const { amount_in_cents, customer_email, reference } = req.body;

    if (!amount_in_cents || !customer_email || !reference) {
      console.error('Validación fallida: Faltan datos.', { amount_in_cents, customer_email, reference });
      return res.status(400).json({ error: 'Faltan datos para la transacción' });
    }

    const transactionData = {
      amount_in_cents,
      currency: 'COP',
      customer_email,
      payment_method: { type: 'PSE' },
      reference,
    };

    const wompiResponse = await axios.post(
      `${WOMPI_API_URL}/transactions`,
      transactionData,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`
        }
      }
    );

    const wompiResult = wompiResponse.data; // En axios, la respuesta está en .data

    res.status(201).json({
      transactionId: wompiResult.data.id,
      reference: wompiResult.data.reference,
      publicKey: WOMPI_PUBLIC_KEY
    });

  } catch (error) {
    console.error('Error en /create-transaction:', error.response ? error.response.data : error.message);
    let errorMessage = 'Error al crear la transacción en Wompi';
    if (error.response?.data?.error?.messages) {
      // El objeto de mensajes puede ser complejo. Lo convertimos a string de forma segura.
      errorMessage = JSON.stringify(error.response.data.error.messages);
    }
    res.status(500).json({ error: errorMessage });
  }
});

// --- Nueva ruta para verificar el estado de una transacción ---
router.get('/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const wompiResponse = await axios.get(
      `${WOMPI_API_URL}/transactions/${id}`,
      {
        headers: {
          // ¡OJO! La verificación de estado NO requiere llave privada.
          // Se puede hacer con la pública si se desea, pero no es mandatorio.
          // 'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
        }
      }
    );

    const transaction = wompiResponse.data.data;

    // Si la transacción fue aprobada, actualizamos nuestro pedido
    if (transaction.status === 'APPROVED') {
      const db = new sqlite3.Database(path.join(__dirname, '../db.sqlite'));
      db.run(
        `UPDATE orders SET status = 'pagado', updated_at = CURRENT_TIMESTAMP WHERE reference = ?`,
        [transaction.reference],
        function(err) {
          if (err) {
            // Si falla, solo lo logueamos. La verificación puede reintentarse.
            console.error(`Error actualizando el pedido con referencia ${transaction.reference}:`, err);
          } else {
            console.log(`Pedido con referencia ${transaction.reference} marcado como pagado.`);
          }
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
    console.error('Error en /transaction/:id:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al verificar la transacción' });
  }
});

>>>>>>> da2e45b (Guardando cambios antes de pull)
module.exports = router;