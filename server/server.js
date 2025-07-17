const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Ruta para obtener productos desde Supabase
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

// Ruta fallback
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Solo para modo local
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Servidor local en http://localhost:${PORT}`);
  });
}

module.exports = app;
