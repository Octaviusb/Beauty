// Redirección directa a Wompi sin usar el widget

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { monto, nombreCliente } = req.body;
    
    if (!monto) {
      return res.status(400).json({ error: "Falta el monto del pedido" });
    }
    
    const publicKey = "pub_prod_XApVcADEVCLGJnnghUT1V8G3oEwrF7ZW";
    const montoEnCentavos = Math.round(monto * 100);
    const referencia = `pedido_${Date.now()}`;
    
    // URL directa al checkout de Wompi
    const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=COP&amount-in-cents=${montoEnCentavos}&reference=${referencia}&redirect-url=https://beauty-mocha-ten.vercel.app/pedido-confirmado.html`;
    
    return res.status(200).json({ checkoutUrl });
  } catch (error) {
    console.error("Error al generar URL de Wompi:", error);
    return res.status(500).json({ error: "Error al generar URL de pago" });
  }
};
