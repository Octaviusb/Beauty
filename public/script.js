// 1. Estado global MEJORADO
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
      this.showFeedback(item.name);
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
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    showFeedback(productName) {
      const feedback = document.createElement('div');
      feedback.className = 'cart-feedback';
      feedback.textContent = `✓ ${productName} agregado`;
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 2000);
    }
  },
  productos: [],
  currentFilter: 'all'
};

// 2. Funciones de renderizado MEJORADAS
function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  if (!contenedor) return;

  // Aplicar filtro si existe
  const productosFiltrados = appState.currentFilter === 'all' 
    ? productos 
    : productos.filter(p => p.category === appState.currentFilter);

 contenedor.innerHTML = productosFiltrados.map(producto => `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${producto.image}" alt="${producto.name}" class="product-image" loading="lazy">
      </div>
      <div class="product-info">
        <h3 class="product-title">${producto.name}</h3>
        ${producto.description ? `<p class="product-description">${producto.description}</p>` : ''}
        <div class="product-price">$${producto.price.toFixed(2)}</div>
        <button class="add-to-cart">Agregar al carrito</button>
      </div>
    </div>
  `).join('');

  // Event listeners mejorados
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const productData = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price)
      };
      appState.cart.addItem(productData);
      
      // Feedback visual mejorado
      btn.innerHTML = '✓ Agregado';
      setTimeout(() => {
        btn.innerHTML = 'Agregar al carrito';
      }, 2000);
    });
  });
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="cart-content">
      <span class="close-cart">&times;</span>
      <h2>Tu Carrito</h2>
      <div class="cart-items">
        ${appState.cart.items.length ? 
          appState.cart.items.map(item => `
            <div class="cart-item">
              <span class="item-name">${item.name}</span>
              <div class="item-controls">
                <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
              </div>
              <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
              <button class="remove-item" data-id="${item.id}">🗑️</button>
            </div>
          `).join('') : 
          '<p class="empty-cart">Tu carrito está vacío</p>'
        }
      </div>
      <div class="cart-footer">
        <div class="cart-total">Total: $${appState.cart.getTotal().toFixed(2)}</div>
        <button id="limpiarCarrito">Vaciar Carrito</button>
        <button id="finalizarCompra">Finalizar Compra</button>
      </div>
    </div>
  `;

  // Event listeners dinámicos MEJORADOS
  modal.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      appState.cart.removeItem(btn.dataset.id);
      mostrarCarrito();
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
      appState.cart.save();
      mostrarCarrito();
    });
  });

  modal.querySelector('.close-cart').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.querySelector('#limpiarCarrito').addEventListener('click', () => {
    appState.cart.clear();
    mostrarCarrito();
  });

  modal.querySelector('#finalizarCompra').addEventListener('click', () => {
    // Lógica de checkout...
    console.log('Procesando compra:', appState.cart.items);
  });
}

// 3. Funciones de lógica COMPLETAS
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
    
    // Validación básica
    if (!Array.isArray(productos)) {
      throw new Error('Formato de productos inválido');
    }

    appState.productos = productos;
    renderizarProductos(productos);
    setupFilters(); // Configurar filtros después de cargar
  } catch (error) {
    console.error("Error al cargar productos:", error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="error-loading">
          <p>No se pudieron cargar los productos</p>
          <button id="retry-load">Reintentar</button>
        </div>
      `;
      document.getElementById('retry-load').addEventListener('click', cargarProductos);
    }
  }
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!filterButtons.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      appState.currentFilter = btn.dataset.filter;
      renderizarProductos(appState.productos);
      
      // Actualizar estado activo de los botones
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// 4. Configuración de eventos COMPLETA
function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const cartModal = document.getElementById('carrito-modal');

  if (!cartButton || !cartModal) return;

  // Abrir carrito
  cartButton.addEventListener('click', () => {
    cartModal.classList.add('active');
    mostrarCarrito();
  });

  // Cerrar al hacer clic fuera
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove('active');
    }
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartModal.classList.contains('active')) {
      cartModal.classList.remove('active');
    }
  });
}

// 5. Inicialización COMPLETA
document.addEventListener("DOMContentLoaded", () => {
  // Cargar estado inicial
  appState.cart.load();
  actualizarContadorCarrito();
  
  // Configurar eventos
  configurarCarrito();
  
  // Cargar productos
  cargarProductos();
  
  // Configuración adicional
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      actualizarContadorCarrito();
    }
  });
});

// Estilos dinámicos
const style = document.createElement('style');
style.textContent = `
  .cart-feedback {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 1000;
    animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);
