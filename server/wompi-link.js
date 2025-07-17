const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { amountInCents, currency, reference, publicKey } = req.body;

  if (!amountInCents || !currency || !reference || !publicKey) {
    return res.status(400).json({ error: "Faltan datos para la firma" });
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;

  const stringToSign = `${amountInCents}${currency}${reference}${publicKey}`;
  const hmac = crypto.createHmac("sha256", privateKey);
  hmac.update(stringToSign);
  const signature = hmac.digest("hex");

  const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${reference}&signature=${signature}&redirect-url=https://beauty-mocha-ten.vercel.app/pedido-confirmado.html`;

  return res.status(200).json({ checkoutUrl });
};
