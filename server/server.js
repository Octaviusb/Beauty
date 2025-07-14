const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET' && req.url.includes('/products')) {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return res.status(200).json(data);
    }

    // Ruta para Wompi (opcional)
    if (req.method === 'GET' && req.url.includes('/checkout')) {
      const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
      return res.status(200).json({ url: paymentLink });
    }

    return res.status(404).json({ error: 'Ruta no encontrada' });

  } catch (err) {
    console.error('❌ Error en server.js:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
