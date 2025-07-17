const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  try {
    // Ruta para obtener productos
    if (req.method === 'GET' && req.url.includes('/products')) {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        return res.status(500).json({ error: 'Error al obtener productos' });
      }
      return res.status(200).json(data);
    }

    // Ruta de prueba (opcional)
    if (req.method === 'GET' && req.url.includes('/checkout')) {
      const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
      return res.status(200).json({ url: paymentLink });
    }

    // ✅ Ruta Wompi con firma dinámica
    if (req.method === 'POST' && req.url === '/api/wompi-link') {
      const { amountInCents, currency, reference, publicKey } = req.body;

      if (!amountInCents || !currency || !reference || !publicKey) {
        return res.status(400).json({ error: 'Faltan datos para la firma' });
      }

      const privateKey = process.env.WOMPI_PRIVATE_KEY;
      if (!privateKey) {
        return res.status(500).json({ error: 'Clave privada no configurada' });
      }

      const stringToSign = `${amountInCents}${currency}${reference}${publicKey}`;
      const hmac = crypto.createHmac('sha256', privateKey);
      hmac.update(stringToSign);
      const signature = hmac.digest('hex');

      const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${reference}&signature=${signature}&redirect-url=https://beauty-mocha-ten.vercel.app/pedido-confirmado.html`;

      return res.status(200).json({ checkoutUrl });
    }

    return res.status(404).json({ error: 'Ruta no encontrada' });

  } catch (err) {
    console.error('❌ Error en server.js:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
