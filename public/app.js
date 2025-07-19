// Aplicación completa de BeautyLine - Versión simplificada

// Productos
const productos = [
  {
    id: "1",
    name: "Crema Hidratante",
    price: 45000,
    description: "Crema hidratante para todo tipo de piel",
    category: "skincare",
    image: "/images/skincare/crema-de-da.jpg"
  },
  {
    id: "2",
    name: "Serum Facial",
    price: 65000,
    description: "Serum antioxidante con vitamina C",
    category: "skincare",
    image: "/images/skincare/serum-antioxidante.jpg"
  },
  {
    id: "3",
    name: "Esmalte de Uñas",
    price: 18000,
    description: "Esmalte de larga duración",
    category: "esmaltes",
    image: "/images/esmaltes/img1.jpg"
  },
  {
    id: "4",
    name: "Set de Brochas",
    price: 85000,
    description: "Set de 10 brochas profesionales",
    category: "accesorios",
    image: "/images/accesorios/set-de-brochas-10-piezas.jpg"
  },
  {
    id: "5",
    name: "Gel de Baño",
    price: 28000,
    description: "Gel de baño con aroma a lavanda",
    category: "higiene",
    image: "/images/higiene/gel-de-bao.jpg"
  },
  {
    id: "6",
    name: "Base de Maquillaje",
    price: 55000,
    description: "Base de maquillaje de larga duración",
    category: "maquillaje",
    image: "/images/maquillaje/img70.jpg"
  }
];

// Estado de la aplicación
const carrito = {
  items: [],
  
  addItem(item) {
    const index = this.items.findIndex(p => p.id === item.id);
    if (index >= 0) {
      this.items[index].quantity += 1;
    } else {
      this.items.push({ ...item, quantity: 1 });
    }
    this.showFeedback(item.name);
    this.updateCount();
  },
  
  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.updateCount();
  },
  
  clear() {
    this.items = [];
    this.updateCount();
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
  },
  
  updateCount() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cart-count');
    if (countElement) {
      countElement.textContent = count;
      countElement.style.display = count ? 'inline-block' : 'none';
    }
  }
};

// Filtro actual
let currentFilter = 'all';

// Renderizar productos
function renderizarProductos() {
  console.log('📊 Renderizando productos:', productos.length);
  const contenedor = document.getElementById('product-list');
  if (!contenedor) {
    console.error('❌ Contenedor de productos no encontrado');
    return;
  }

  const productosFiltrados = currentFilter === 'all' 
    ? productos 
    : productos.filter(p => p.category === currentFilter);
  
  console.log('🔍 Productos filtrados:', productosFiltrados.length, 'Filtro actual:', currentFilter);

  try {
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

    console.log('✅ HTML de productos generado correctamente');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const productData = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: Number(btn.dataset.price)
        };
        carrito.addItem(productData);
      });
    });
    
    console.log('✅ Eventos de botones configurados');
  } catch (error) {
    console.error('❌ Error al renderizar productos:', error);
    contenedor.innerHTML = "<p class='error-message'>Error al mostrar los productos: " + error.message + "</p>";
  }
}

// Mostrar carrito
function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!modal || !lista || !total) return;

  lista.innerHTML = '';

  if (carrito.items.length === 0) {
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    total.textContent = '$0.00';
  } else {
    carrito.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      lista.appendChild(itemDiv);
    });
    total.textContent = `$${carrito.getTotal().toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.setAttribute('aria-modal', 'true');
}

// Cerrar carrito
function cerrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
    modal.setAttribute('aria-modal', 'false');
  }
}

// Configurar filtros
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      renderizarProductos();
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Configurar carrito
function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const finalizarCompraBtn = document.getElementById('finalizarCompra');
  const limpiarCarritoBtn = document.getElementById('limpiarCarrito');
  const closeCartBtn = document.querySelector('.close-cart');

  if (cartButton) {
    cartButton.addEventListener('click', () => {
      mostrarCarrito();
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', cerrarCarrito);
  }

  if (limpiarCarritoBtn) {
    limpiarCarritoBtn.addEventListener('click', () => {
      carrito.clear();
      mostrarCarrito();
    });
  }

  if (finalizarCompraBtn) {
    finalizarCompraBtn.addEventListener('click', () => {
      cerrarCarrito();
      window.location.href = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
    });
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando aplicación...');
  renderizarProductos();
  setupFilters();
  configurarCarrito();
  carrito.updateCount();
});
