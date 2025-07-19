// 💳 Redirección directa a Wompi
function redirigirAWompi(monto, nombreCliente) {
  console.log('💳 Iniciando proceso de pago');
  console.log('💰 Monto:', monto);

  if (!monto) {
    console.error('❌ Falta el monto para el pago');
    alert("No se pudo iniciar el pago: datos incompletos.");
    return;
  }

  try {
    // Crear URL directa al checkout de Wompi
    const publicKey = "pub_prod_XApVcADEVCLGJnnghUT1V8G3oEwrF7ZW";
    const montoEnCentavos = Math.round(monto * 100);
    const referencia = `pedido_${Date.now()}`;
    
    // URL directa al checkout de Wompi
    const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=COP&amount-in-cents=${montoEnCentavos}&reference=${referencia}&redirect-url=${window.location.origin}/confirmation.html`;
    
    console.log('✅ Redirigiendo a Wompi:', checkoutUrl);
    window.location.href = checkoutUrl;
    
  } catch (error) {
    console.error('🚫 Error de redirección:', error);
    alert("Ocurrió un error inesperado al procesar el pago. Por favor, intenta nuevamente.");
  }
}
