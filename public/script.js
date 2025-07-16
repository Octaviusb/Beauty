// script.js - Versión corregida y ordenada

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

// ===== [1] PRIMERO DEFINIR FUNCIONES UTILITARIAS =====
function actualizarContadorCarrito() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;
  const totalItems = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  countSpan.textContent = totalItems;
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (!modal) {
    console.error('❌ No se encontró el modal del carrito');
    return;
  }

  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!lista || !total) {
    console.error('❌ Elementos internos del carrito no encontrados');
    return;
  }

  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
    total.textContent = '$0.00';
  } else {
    appState.cart.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">Cantidad: ${item.quantity}</span>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        <button class="remove-item" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;
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
      
      itemElement.querySelector('.remove-item').addEventListener('click', (e) => {
        e.stopPropagation();
        appState.cart.removeItem(item.id);
        mostrarCarrito();
        actualizarContadorCarrito();
      });
      
      lista.appendChild(itemElement);
    });

    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.setAttribute('aria-modal', 'true');
  document.body.style.overflow = 'hidden';
}

// ===== [2] LUEGO CONFIGURAR EVENTOS DEL CARRITO =====
function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const cartModal = document.getElementById('carrito-modal');
  const closeCart = document.querySelector('.close-cart');
  const limpiarBtn = document.getElementById('limpiarCarrito');
  const finalizarBtn = document.getElementById('finalizarCompra');

  const abrirCarrito = () => {
    mostrarCarrito();
    cartModal.classList.remove('hidden');
    cartModal.classList.add('active');
  };

  const cerrarCarrito = () => {
    cartModal.classList.remove('active');
    cartModal.classList.add('hidden');
  };

  if (cartButton) cartButton.addEventListener('click', abrirCarrito);
  if (closeCart) closeCart.addEventListener('click', cerrarCarrito);

  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cerrarCarrito();
      
      const checkoutForm = document.getElementById('checkoutForm');
      if (checkoutForm) {
        checkoutForm.classList.remove('hidden');
        checkoutForm.classList.add('active');
        
        const firstInput = checkoutForm.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
      } else {
        console.error('❌ No se encontró el formulario de checkout');
      }
    });
  }
} // <-- ¡IMPORTANTE! Esta llave CIERRA configurarCarrito()

// ===== [3] FINALMENTE INICIALIZAR =====
window.addEventListener("DOMContentLoaded", () => {
  appState.cart.load();
  actualizarContadorCarrito(); // Ahora la función YA está definida
  configurarCarrito();
  cargarProductos();
});
