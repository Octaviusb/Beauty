// server/server.js
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Obtener productos
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Wompi: generar link firmado
app.post('/api/wompi-link', (req, res) => {
  const { amountInCents, currency, reference, publicKey } = req.body;

  if (!amountInCents || !currency || !reference || !publicKey) {
    return res.status(400).json({ error: "Faltan datos para la firma" });
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) {
    return res.status(500).json({ error: "Clave privada no configurada" });
  }

  const stringToSign = `${amountInCents}${currency}${reference}${publicKey}`;
  const hmac = crypto.createHmac("sha256", privateKey);
  hmac.update(stringToSign);
  const signature = hmac.digest("hex");

  const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${reference}&signature=${signature}&redirect-url=https://beauty-mocha-ten.vercel.app/pedido-confirmado.html`;

  return res.status(200).json({ checkoutUrl });
});

// Iniciar servidor local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
