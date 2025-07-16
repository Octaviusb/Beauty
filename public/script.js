// 1. Estado global MEJORADO (sin localStorage)
console.log("📦 script.js cargado con defer");
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
      this.showFeedback(item.name);
    },

    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
    },

    clear() {
      this.items = [];
    },

    getTotal() {
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    showFeedback(productName) {
      const feedback = document.createElement('div');
      feedback.className = 'cart-feedback';
      feedback.textContent = "✓ " + productName + " agregado";
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 2000);
    }
  },
  productos: [],
  currentFilter: 'all'
};

// 2. Funciones de renderizado
function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  if (!contenedor) return;

  const productosFiltrados = appState.currentFilter === 'all' 
    ? productos 
    : productos.filter(p => p.category === appState.currentFilter);

  contenedor.innerHTML = productosFiltrados.map(producto => (
    "<div class='product-card'>" +
      "<div class='product-image-container'>" +
        "<img src='" + producto.image + "' alt='" + producto.name + "' class='product-image' loading='lazy'>" +
      "</div>" +
      "<div class='product-info'>" +
        "<h3 class='product-title'>" + producto.name + "</h3>" +
        (producto.description ? "<p class='product-description'>" + producto.description + "</p>" : "") +
        "<div class='product-price'>$" + producto.price.toFixed(2) + "</div>" +
        "<button class='add-to-cart' data-id='" + producto.id + "' data-name='" + producto.name + "' data-price='" + producto.price + "'>Agregar al carrito</button>" +
      "</div>" +
    "</div>"
  )).join('');

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const productData = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price)
      };
      appState.cart.addItem(productData);
      actualizarContadorCarrito();
    });
  });
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!modal || !lista || !total) return;

  lista.innerHTML = ''; // vacía antes de actualizar

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    total.textContent = '$0.00';
  } else {
    appState.cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      lista.appendChild(itemDiv);
    });

    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
}

function cerrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
}

function actualizarContadorCarrito() {
  const count = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = count;
    countElement.style.display = count ? 'inline-block' : 'none';
  }
}

async function cargarProductos() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Error en la respuesta');
    const productos = await response.json();
    if (!Array.isArray(productos)) throw new Error('Formato inválido');
    appState.productos = productos;
    renderizarProductos(productos);
    setupFilters();
  } catch (error) {
    console.error("Error al cargar productos:", error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = "<p class='error-message'>No se pudieron cargar los productos.</p>";
    }
  }
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      appState.currentFilter = btn.dataset.filter;
      renderizarProductos(appState.productos);
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const cartModal = document.getElementById('carrito-modal');

  console.log("🛠 Ejecutando configurarCarrito()");
  console.log("🛎 cartButton:", cartButton);
  console.log("🛎 cartModal:", cartModal);

  if (cartButton) {
    cartButton.addEventListener('click', () => {
      console.log("🟢 Click recibido en #cartButton");
      mostrarCarrito();  // <- ESTA es la clave
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌐 DOM completamente cargado");

  const btn = document.getElementById("cartButton");
  console.log("🔍 Botón encontrado:", btn);

  if (!btn) {
    console.error("❌ Botón #cartButton no disponible al cargar");
  }

  appState.cart.items = [];
  actualizarContadorCarrito();
  configurarCarrito();
  cargarProductos();

  // ✅ Mueve aquí el listener de finalizarCompra
  const finalizarBtn = document.getElementById('finalizarCompra');
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', () => {
      const modalCarrito = document.getElementById('carrito-modal');
      const formulario = document.getElementById('checkoutForm');

      modalCarrito.classList.remove('active');
      modalCarrito.classList.add('hidden');

      formulario.classList.remove('hidden');
      formulario.classList.add('active');
    });
  } else {
    console.warn("⚠️ Botón #finalizarCompra no encontrado en el DOM");
  }
});

