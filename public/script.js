// Reemplaza las líneas 600–750 en tu script.js por este bloque completo:

// Procesar pedido
function procesarPedido(event) {
  event.preventDefault();
  console.log('🛒 Procesando pedido...');

  try {
    const formulario = document.getElementById('formularioCompra');
    const nombre = formulario.querySelector('#nombre').value.trim();
    const email = formulario.querySelector('#email').value.trim();
    const telefono = formulario.querySelector('#telefono').value.trim();
    const direccion = formulario.querySelector('#direccion').value.trim();
    const ciudad = formulario.querySelector('#ciudad').value.trim();
    const referidor = formulario.querySelector('#referidor').value.trim();

    if (!nombre || !email || !telefono || !direccion || !ciudad || !referidor) {
      alert('Por favor completa todos los campos, incluyendo quién te refirió.');
      formulario.querySelector('#referidor').focus();
      return;
    }

    const subtotal = appState.cart.getTotal();
    const shipping = subtotal > 200000 ? 0 : 12000;
    const total = subtotal + shipping;
    const orderNumber = `BL-${Date.now().toString().slice(-6)}`;

    let carritoTexto = appState.cart.items
      .map(item => `${item.quantity}x ${item.name} ($${item.price.toLocaleString()})`)
      .join(", ");

    if (typeof emailjs !== 'undefined') {
      emailjs.send("service_owxur5f", "template_sck7rdl", {
        nombre,
        email,
        telefono,
        direccion: `${direccion}, ${ciudad}`,
        referidor,
        metodo_pago: 'Wompi',
        total: total.toLocaleString(),
        carrito: carritoTexto,
        referencia: orderNumber
      }).then(() => {
        console.log("📧 Pedido registrado, redirigiendo a Wompi...");

        mostrarModalWompi(total, orderNumber);
      }).catch(error => {
        console.error("❌ Error al enviar correo:", error);
        alert("Error al procesar el pedido. Por favor intenta nuevamente.");
      });
    } else {
      alert("El servicio de correo no está disponible. Intenta nuevamente más tarde.");
    }
  } catch (error) {
    console.error('❌ Error en procesarPedido:', error);
    alert("Ocurrió un error inesperado. Por favor intenta nuevamente.");
  }
}

// Mostrar modal de Wompi
function mostrarModalWompi(total, orderNumber) {
  console.log('💳 Preparando pago con Wompi...');

  const urlWompi = "https://checkout.wompi.co/l/VPOS_nJo3xk";
  const wompiModal = document.createElement('div');
  wompiModal.className = 'modal active';
  wompiModal.id = 'wompiModal';
  wompiModal.innerHTML = `
    <div class="modal-content payment-modal">
      <button class="close-modal" aria-label="Cerrar">&times;</button>
      <h2>Pagar con Wompi</h2>
      <p><strong>Monto:</strong> $${total.toLocaleString()}</p>
      <p><strong>Pedido:</strong> ${orderNumber}</p>
      <a href="${urlWompi}" target="_blank" id="btnIrAWompi" class="btn-submit-order">Ir a Wompi</a>
    </div>
  `;
  document.body.appendChild(wompiModal);

  document.getElementById('btnIrAWompi').addEventListener('click', () => {
    window.open(urlWompi, '_blank');
    document.getElementById('wompiModal').remove();
    mostrarConfirmacionPedido(orderNumber);
    appState.cart.clear();
    actualizarContadorCarrito();
  });

  wompiModal.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('wompiModal').remove();
    mostrarConfirmacionPedido(orderNumber);
    appState.cart.clear();
    actualizarContadorCarrito();
  });
}
