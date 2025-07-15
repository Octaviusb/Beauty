emailjs.init("Cqwg1EyqFLvPg7ULx"); 

function enviarOrdenPorCorreo(cliente, productos, total) {
  const productosHTML = productos.map(p =>
    `- ${p.name} (x${p.quantity}) - $${p.price * p.quantity}`
  ).join("\n");

  const templateParams = {
    nombre: cliente.nombre,
    email: cliente.email,
    direccion: cliente.direccion,
    telefono: cliente.telefono,
    productos: productosHTML,
    total: `$${total}`
  };

  emailjs.send("service_xxx", "template_xxx", templateParams)
    .then(() => {
      alert("✅ Datos enviados por correo");
    })
    .catch(err => {
      console.error("❌ Error al enviar email:", err);
      alert("Hubo un error al enviar el email");
    });
}
