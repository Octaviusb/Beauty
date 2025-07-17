const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  try {
    // 🟩 Obtener productos
    if (req.method === 'GET' && req.url === '/api/products') {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) throw error;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }

    // 🟨 Generar enlace firmado para Wompi
    if (req.method === 'POST' && req.url === '/api/wompi-link') {
      let body = '';

      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        const { amountInCents, currency, reference, publicKey } = JSON.parse(body);

        if (!amountInCents || !currency || !reference || !publicKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Faltan datos para la firma' }));
        }

        const privateKey = process.env.WOMPI_PRIVATE_KEY;
        if (!privateKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Clave privada no configurada' }));
        }

        const stringToSign = `${amountInCents}${currency}${reference}${publicKey}`;
        const hmac = crypto.createHmac('sha256', privateKey);
        hmac.update(stringToSign);
        const signature = hmac.digest('hex');

        const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${reference}&signature=${signature}&redirect-url=https://beauty-mocha-ten.vercel.app/pedido-confirmado.html`;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ checkoutUrl }));
      });

      return;
    }

    // ❌ Ruta no encontrada
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));

  } catch (err) {
    console.error('❌ Error en server.js:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error interno del servidor' }));
  }
};
