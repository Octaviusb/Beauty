// Utilidad para enviar emails de pedidos
const nodemailer = require('nodemailer');

// Configura aquí tu servicio SMTP (puedes usar Gmail, Outlook, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia si usas otro
  auth: {
    user: process.env.SMTP_USER, // Tu correo
    pass: process.env.SMTP_PASS  // Tu contraseña o app password
  }
});

async function enviarPedidoPorCorreo(pedido, destinatario) {
  const html = `
    <h2>Nuevo pedido recibido</h2>
    <p><b>Cliente:</b> ${pedido.customer_name} (${pedido.customer_email}, ${pedido.customer_phone})</p>
    <p><b>Dirección:</b> ${pedido.address}</p>
    <p><b>Total:</b> $${pedido.total}</p>
    <h3>Productos:</h3>
    <ul>
      ${(pedido.items||[]).map(item => `<li>${item.quantity} x ${item.name} ($${item.price})</li>`).join('')}
    </ul>
    <p><b>Estado:</b> ${pedido.status || 'pendiente'}</p>
    <p>Verifica el pago y procesa el despacho.</p>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: destinatario,
    subject: 'Nuevo pedido BeautyGlow',
    html
  });
}

module.exports = { enviarPedidoPorCorreo };
