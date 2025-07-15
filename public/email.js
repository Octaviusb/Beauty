// ✅ Este script usa EmailJS para enviar la orden al correo del vendedor
// Asegúrate de haber incluido EmailJS desde CDN:
// <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
emailjs.init("Cqwg1EyqFLvPg7ULx"); // Reemplaza con tu User ID de EmailJS

function enviarOrdenPorCorreo(cliente, productos, total) {
  const productosHTML = productos.map(p => `- ${p.name} (x${p.quantity}) - $${p.price * p.quantity}`).join("\n");

  const templateParams = {
    nombre: cliente.nombre,
    email: cliente.email,
    direccion: cliente.direccion,
    telefono: cliente.telefono,
    productos: productosHTML,
    total: `$${total}`
  };

  emailjs.send("service_owxur5f", "template_sck7rdl", templateParams)
    .then(() => {
      alert("✅ Datos de la orden enviados al vendedor");
    })
    .catch(err => {
      console.error("❌ Error al enviar email:", err);
      alert("Hubo un error al enviar la orden. Por favor intenta de nuevo.");
    });
}

// Llamada de ejemplo:
// enviarOrdenPorCorreo({ nombre: "Ana", email: "ana@mail.com", direccion: "Calle 123", telefono: "3001234567" }, carrito, 120000);
