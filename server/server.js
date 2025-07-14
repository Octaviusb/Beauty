const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET' && req.url.includes('/products')) {
      const { data, error } = await supabase.from('products').select('*');
<<<<<<< HEAD
      if (error) {
        return res.status(500).json({ error: 'Error al obtener productos' });
      }
      return res.status(200).json(data);
    }

=======
      if (error) throw error;
      return res.status(200).json(data);
    }

    // Ruta para Wompi (opcional)
>>>>>>> da2e45b (Guardando cambios antes de pull)
    if (req.method === 'GET' && req.url.includes('/checkout')) {
      const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
      return res.status(200).json({ url: paymentLink });
    }

    return res.status(404).json({ error: 'Ruta no encontrada' });
<<<<<<< HEAD
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
=======

  } catch (err) {
    console.error('❌ Error en server.js:', err.message);
>>>>>>> da2e45b (Guardando cambios antes de pull)
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
