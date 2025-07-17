const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Ruta para obtener productos
app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err.message);
    return res.status(500).json({ error: "Error interno" });
  }
});

// Ruta para generar firma de integridad de Wompi
app.post("/api/wompi-link", (req, res) => {
  const { amountInCents, currency, reference, publicKey } = req.body;

  if (!amountInCents || !currency || !reference || !publicKey) {
    return res.status(400).json({ error: "Faltan datos para la firma" });
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) {
    return res.status(500).json({ error: "Clave privada no configurada" });
  }

  // Generar firma
  const stringToSign = `${amountInCents}${currency}${reference}${publicKey}`;
  const hmac = crypto.createHmac("sha256", privateKey);
  hmac.update(stringToSign);
  const signature = hmac.digest("hex");

  // Construir enlace de redirección
  const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${reference}&signature=${signature}&redirect-url=https://beauty-mocha-ten.vercel.app/pedido-confirmado.html`;

  return res.status(200).json({ checkoutUrl });
});

// Fallback
app.use((req, res) => {
  return res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor en local si aplica
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
  });
}

module.exports = app;
