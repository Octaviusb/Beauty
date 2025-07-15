// script.js FINAL - Catálogo de productos, carrito y redirección a Wompi con contador de ícono funcional

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

function actualizarContadorCarrito() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;

  const totalItems = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  countSpan.textContent = totalItems;
}

function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  if (!contenedor) {
    console.error('❌ No se encontró el contenedor de productos');
    return;
  }

  contenedor.innerHTML = '';

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open"></i>
        <p>No se encontraron productos</p>
      </div>
    `;
    return;
  }

  productos.forEach((producto) => {
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
          <img src="${imagen}" alt="${nombre}" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-title">${nombre}</h3>
          <p class="product-description">${descripcion}</p>
          <div class="product-price">$${Number(precio).toLocaleString()}</div>
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
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío.</p>';
  } else {
    appState.cart.items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span>${item.name} x${item.quantity}</span>
        <span>$${(item.price * item.quantity).toLocaleString()}</span>
        <button class="remove-item" data-id="${item.id}">×</button>
      `;
      
      li.querySelector('.remove-item').addEventListener('click', () => {
        appState.cart.removeItem(item.id);
        mostrarCarrito();
        actualizarContadorCarrito();
      });
      
      lista.appendChild(li);
    });
  }

  const total = modal.querySelector('.cart-total');
  total.textContent = `Total: $${appState.cart.getTotal().toLocaleString()}`;
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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const productos = await response.json();
    return productos;
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    throw error;
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
    productos: productosHTML,
    total: `$${total.toLocaleString()}`
  };

  return emailjs.send("service_owxur5f", "template_sck7rdl", templateParams)
    .then(() => {
      console.log("✅ Datos de la orden enviados al vendedor");
      return true;
    })
    .catch(err => {
      console.error("❌ Error al enviar email:", err);
      return false;
    });
}

// Filtrado de productos
function configurarFiltros() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const filtro = btn.dataset.filter;
      if (filtro === "todos") {
        renderizarProductos(appState.productos);
      } else {
        const productosFiltrados = appState.productos.filter(p => 
          p.category && p.category.toLowerCase() === filtro.toLowerCase()
        );
        renderizarProductos(productosFiltrados);
      }
    });
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Cargar carrito
    appState.cart.load();
    actualizarContadorCarrito();
    
    // Cargar productos
    const productos = await cargarProductos();
    appState.productos = productos;
    renderizarProductos(productos);
    
    // Configurar eventos
    configurarBotonCarrito();
    configurarFiltros();
    
    // Configurar formulario de compra
    const formularioCompra = document.getElementById("formularioCompra");
    if (formularioCompra) {
      formularioCompra.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Procesando...";

        try {
          const formData = new FormData(e.target);
          const cliente = {
            nombre: formData.get("nombre"),
            email: formData.get("email"),
            direccion: formData.get("direccion"),
            telefono: formData.get("telefono")
          };

          const emailSuccess = await enviarOrdenPorCorreo(
            cliente,
            appState.cart.items,
            appState.cart.getTotal()
          );

          if (!emailSuccess) throw new Error("Error al enviar correo");

          document.getElementById("checkoutForm").classList.add("hidden");
          document.getElementById("confirmationModal").classList.remove("hidden");

          setTimeout(() => {
            window.open('https://checkout.wompi.co/l/VPOS_nJo3xk', '_blank');
            appState.cart.clear();
            actualizarContadorCarrito();
            document.getElementById("confirmationModal").classList.add("hidden");
            formularioCompra.reset();
          }, 3000);
        } catch (error) {
          alert("Hubo un error al procesar tu pedido. Por favor intenta de nuevo.");
          console.error("Error en el proceso de compra:", error);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    }
  } catch (error) {
    console.error("Error en la inicialización:", error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = '<p class="error-message">Error al cargar los productos. Por favor recarga la página.</p>';
    }
  }
});
