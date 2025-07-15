// script.js FINAL - Catálogo de productos, carrito y redirección a Wompi con contador de ícono funcional

const appState = {
  cart: {
    items: [],
  },
  productos: [],  // ← Aquí guardaremos todos los productos cargados

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
  }

function actualizarContadorCarrito() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;

  const totalItems = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  countSpan.textContent = totalItems;
}

function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list') || document.getElementById('productsGrid');
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

    try {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-image">
          <img src="${imagen}" alt="${nombre}">
        </div>
        <div class="product-info">
          <h3 class="product-title">${nombre}</h3>
          <p class="product-description">${descripcion}</p>
          <div class="product-price">$${precio}</div>
          <button class="add-to-cart" data-id="${id}" data-nombre="${nombre}" data-precio="${precio}">Agregar</button>
        </div>
      `;

      const btn = card.querySelector('.add-to-cart');
      if (btn) {
        btn.addEventListener('click', () => {
          appState.cart.addItem({
            id,
            name: nombre,
            price: Number(precio)
          });

          actualizarContadorCarrito();

          const mensaje = document.createElement('div');
          mensaje.textContent = `✅ ${nombre} agregado al carrito`;
          mensaje.className = 'carrito-notificacion';
          document.body.appendChild(mensaje);
          setTimeout(() => mensaje.remove(), 2000);
        });
      }

      contenedor.appendChild(card);
    } catch (err) {
      console.error('❌ Error al renderizar producto:', producto, err);
    }
  });
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito');
  if (!modal) return;
  modal.classList.add('active');
  modal.classList.remove('hidden');

  const lista = modal.querySelector('.cart-items');
  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    appState.cart.items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} x${item.quantity} - $${item.price * item.quantity}`;
      lista.appendChild(li);
    });
  }

  const total = modal.querySelector('.cart-total');
  total.textContent = `Total: $${appState.cart.getTotal()}`;
}

function configurarBotonCarrito() {
  const btn = document.getElementById('cartButton');
  const cerrar = document.querySelector('.close-cart');
  const limpiar = document.getElementById('limpiarCarrito');

  if (btn) {
    btn.addEventListener('click', mostrarCarrito);
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

async function cargarProductos() {
  try {
    const response = await fetch("/api/products");
    const productos = await response.json();

    // ✅ Guardar en appState
    appState.productos = productos;

    // ... renderizar en la interfaz
    renderizarProductos(productos); // o como se llame tu función de renderizado
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  appState.cart.load();
  actualizarContadorCarrito();

  await cargarProductos();
  configurarBotonCarrito();

  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      window.open('https://checkout.wompi.co/l/VPOS_nJo3xk', '_blank');
    });
  }
});

document.getElementById("formularioCompra").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const cliente = {
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    direccion: formData.get("direccion"),
    telefono: formData.get("telefono"),
  };

  const productos = appState.cart.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price
  }));

  const total = appState.cart.getTotal();

  // 🔹 Envía la orden al vendedor por correo
  enviarOrdenPorCorreo(cliente, productos, total);
  document.querySelector(".checkout-btn").addEventListener("click", () => {
  document.getElementById("checkoutForm").classList.remove("hidden");
});


  // 🔹 Muestra el modal de confirmación (ya debería estar en tu HTML)
  document.getElementById("checkoutForm").classList.add("hidden");
  document.getElementById("confirmationModal").classList.remove("hidden");

  // 🔹 Limpia el carrito
  appState.cart.clear();
  actualizarCarritoUI();
});

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

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    const filtro = btn.dataset.filter;
    filtrarProductosPorCategoria(filtro);
  });
});

function filtrarProductosPorCategoria(categoria) {
  const productosFiltrados = appState.productos.filter(p => p.category === categoria);
  renderizarProductos(productosFiltrados);
}

