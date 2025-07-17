// /api/products.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error en /api/products:", err.message);
    return res.status(500).json({ error: 'Error interno al obtener productos' });
  }
};
