const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  const { method, url } = req;

  // 🔹 Ruta para obtener productos
  if (method === "GET" && url === "/api/products") {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error("❌ Error al obtener productos:", err.message);
      return res.status(500).json({ error: "Error interno" });
    }
  }

  // 🔹 Ruta para generar firma de pago con Wompi
  if (method === "POST" && url === "/api/wompi-link") {
    try {
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
    } catch (error) {
      console.error("❌ Error al generar firma:", error.message);
      return res.status(500).json({ error: "Error interno en Wompi-link" });
    }
  }

  // 🔹 Ruta no encontrada
  return res.status(404).json({ error: "Ruta no encontrada" });
};
