// script.js - Versión corregida

const appState = {
  cart: {
    items: [],

    addItem(item) {
      const index = this.items.findIndex(p => p.id === item.id);
      if (index >= 0) {
        this.items[index].quantity += 1;
      } else {
        this.items.push({ ...item, quantity: 1 });
      }
      this.save();
    },

    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.save();
    },

    clear() {
      this.items = [];
      this.save();
    },

    save() {
      localStorage.setItem('carrito', JSON.stringify(this.items));
    },

    load() {
      const data = localStorage.getItem('carrito');
      this.items = data ? JSON.parse(data) : [];
    },

    getTotal() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  },
  productos: []
};

// Mover la función configurarBotonCarrito al principio
function configurarBotonCarrito() {
  const btn = document.getElementById('cartButton');
  const cerrar = document.querySelector('.close-cart');
  const limpiar = document.getElementById('limpiarCarrito');

  if (btn) {
    btn.addEventListener('click', mostrarCarrito);
    console.log("✅ Evento click agregado a #cartButton");
  } else {
    console.warn("❌ No se encontró #cartButton en el DOM");
  }

  if (cerrar) {
    cerrar.addEventListener('click', () => {
      const modal = document.getElementById('carrito');
      modal.classList.remove('active');
      modal.classList.add('hidden');
    });
  }

  if (limpiar) {
    limpiar.addEventListener('click', () => {
      appState.cart.clear();
      mostrarCarrito();
      actualizarContadorCarrito();
    });
  }
}

function actualizarContadorCarrito() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;
  const totalItems = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  countSpan.textContent = totalItems;
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  lista.innerHTML = '';

  appState.cart.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.name} x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toLocaleString()}</span>
    `;
    lista.appendChild(div);
  });

  total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
  modal.classList.remove('hidden');
  modal.classList.add('active');
}

function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  console.log("🛠 Renderizando productos...", productos);
  if (!contenedor) {
    console.error('❌ No se encontró el contenedor de productos');
    return;
  }

  contenedor.innerHTML = '';

  productos.forEach((producto, index) => {
    if (!producto || !producto.id || (!producto.name && !producto.nombre) || (!producto.price && !producto.precio)) {
      console.warn(`⚠️ Producto inválido en índice ${index}:`, producto);
      return;
    }

    const id = producto.id;
    const nombre = producto.name || producto.nombre;
    const precio = producto.price || producto.precio;
    const imagen = producto.image || producto.imagen || 'placeholder.jpg';
    const descripcion = producto.description || producto.descripcion || '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${imagen}" alt="${nombre}" loading="lazy">
      </div>
      <div class="product-info">
        <h3 class="product-title">${nombre}</h3>
        <p class="product-description">${descripcion}</p>
        <div class="product-price">$${precio.toLocaleString()}</div>
        <button class="add-to-cart" data-id="${id}" data-nombre="${nombre}" data-precio="${precio}">Agregar</button>
      </div>
    `;

    const btn = card.querySelector('.add-to-cart');
    if (btn) {
      btn.addEventListener('click', () => {
        appState.cart.addItem({ id, name: nombre, price: Number(precio) });
        actualizarContadorCarrito();

        const mensaje = document.createElement('div');
        mensaje.textContent = `✅ ${nombre} agregado al carrito`;
        mensaje.className = 'carrito-notificacion';
        document.body.appendChild(mensaje);
        setTimeout(() => mensaje.remove(), 2000);
      });
    }

    contenedor.appendChild(card);
  });
}

async function cargarProductos() {
  try {
    const baseURL = window.location.origin;
    const response = await fetch(`${baseURL}/api/products`);
    if (!response.ok) throw new Error("Error al cargar productos");
    const productos = await response.json();
    appState.productos = productos;
    renderizarProductos(productos);
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = '<p class="error-message">No se pudieron cargar los productos.</p>';
    }
  }
}

function enviarOrdenPorCorreo(cliente, productos, total) {
  const productosHTML = productos.map(p => `
    <li>${p.name} (x${p.quantity}) - $${(p.price * p.quantity).toLocaleString()}</li>
  `).join('');

  const templateParams = {
    nombre: cliente.nombre,
    email: cliente.email,
    direccion: cliente.direccion,
    telefono: cliente.telefono,
    referidor: cliente.referidor,
    productos: productosHTML,
    total: `$${total.toLocaleString()}`,
    nota: `El pedido será despachado a más tardar 3 días después de haberse confirmado el pago del pedido.
En todo pedido que sobrepase los $200.000, el transporte será gratuito.`
  };

  return emailjs.send("service_owxur5f", "template_sck7rdl", templateParams)
    .then(() => true)
    .catch(err => {
      console.error("❌ Error al enviar el correo:", err);
      return false;
    });
}

// Filtros de categoría
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    const filtro = btn.dataset.filter;
    if (filtro === "todos") {
      renderizarProductos(appState.productos);
    } else {
      const filtrados = appState.productos.filter(p => p.category === filtro);
      renderizarProductos(filtrados);
    }
  });
});

// Configuración del formulario de compra
const formularioCompra = document.getElementById("formularioCompra");
if (formularioCompra) {
  formularioCompra.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Procesando...";

    const formData = new FormData(e.target);
    const cliente = {
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      direccion: formData.get("direccion"),
      telefono: formData.get("telefono"),
      referidor: formData.get("referidor") || "No especificado"
    };

    try {
      const emailSuccess = await enviarOrdenPorCorreo(
        cliente,
        appState.cart.items,
        appState.cart.getTotal()
      );

      if (!emailSuccess) throw new Error("Fallo al enviar el correo");

      document.getElementById("checkoutForm").classList.add("hidden");
      document.getElementById("confirmationModal").classList.remove("hidden");

      const total = appState.cart.getTotal();
      const url = `https://checkout.wompi.co/l/VPOS_nJo3xk?amount=${total * 100}&currency=COP`;
      
      setTimeout(() => {
        window.open(url, '_blank');
        appState.cart.clear();
        actualizarContadorCarrito();
        document.getElementById("confirmationModal").classList.add("hidden");
        formularioCompra.reset();
      }, 3000);
    } catch (error) {
      alert("Hubo un error al procesar tu pedido.");
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
  appState.cart.load();
  actualizarContadorCarrito();
  configurarBotonCarrito(); // Ahora está definida antes de ser llamada
  cargarProductos();
});
