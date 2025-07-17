// server.js restaurado solo con ruta de productos desde Supabase
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err.message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Ruta fallback para evitar errores 404 en rutas no definidas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Solo si corres local
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local en http://localhost:${PORT}`);
  });
}

module.exports = app;
