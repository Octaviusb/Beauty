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
  if (!modal) return;

  modal.classList.remove('hidden');
  modal.classList.add('active');

  let contenido = "<div class='cart-content'>" +
    "<span class='close-cart'>&times;</span>" +
    "<h2>Tu Carrito</h2><div class='cart-items'>";

  if (appState.cart.items.length) {
    contenido += appState.cart.items.map(item => `
      <div class='cart-item'>
        <span class='item-name'>${item.name}</span>
        <div class='item-controls'>
          <button class='quantity-btn' data-action='decrease' data-id='${item.id}'>-</button>
          <span class='item-quantity'>${item.quantity}</span>
          <button class='quantity-btn' data-action='increase' data-id='${item.id}'>+</button>
        </div>
        <span class='item-price'>$${(item.price * item.quantity).toFixed(2)}</span>
        <button class='remove-item' data-id='${item.id}'>🗑️</button>
      </div>
    `).join('');
  } else {
    contenido += "<p class='empty-cart'>Tu carrito está vacío</p>";
  }

  contenido += "</div><div class='cart-footer'>" +
    "<div class='cart-total'>Total: $" + appState.cart.getTotal().toFixed(2) + "</div>" +
    "<button id='limpiarCarrito'>Vaciar Carrito</button>" +
    "<button id='finalizarCompra'>Finalizar Compra</button>" +
    "</div></div>";

  modal.innerHTML = contenido;

  modal.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      appState.cart.removeItem(btn.dataset.id);
      mostrarCarrito();
      actualizarContadorCarrito();
    });
  });

  modal.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = appState.cart.items.find(i => i.id === btn.dataset.id);
      if (btn.dataset.action === 'increase') {
        item.quantity++;
      } else if (item.quantity > 1) {
        item.quantity--;
      }
      mostrarCarrito();
      actualizarContadorCarrito();
    });
  });

  modal.querySelector('.close-cart').addEventListener('click', cerrarCarrito);
  modal.querySelector('#limpiarCarrito').addEventListener('click', () => {
    appState.cart.clear();
    mostrarCarrito();
    actualizarContadorCarrito();
  });

  modal.querySelector('#finalizarCompra').addEventListener('click', () => {
    console.log('Procesando compra:', appState.cart.items);
    cerrarCarrito();
  });

  // También puedes cerrar haciendo clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarCarrito();
  });
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

  // 🛒 Inicialización real
  appState.cart.items = [];
  actualizarContadorCarrito();
  configurarCarrito();
  cargarProductos();
});
