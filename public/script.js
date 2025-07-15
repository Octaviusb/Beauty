// Configuración inicial
const appState = {
  cart: {
    items: [],
    addItem(item) {
      const existingItem = this.items.find(p => p.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({ ...item, quantity: 1 });
      }
      this.save();
      actualizarContadorCarrito();
    },
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.save();
      actualizarContadorCarrito();
    },
    clear() {
      this.items = [];
      this.save();
      actualizarContadorCarrito();
    },
    save() {
      localStorage.setItem('beautystore_cart', JSON.stringify(this.items));
    },
    load() {
      const savedCart = localStorage.getItem('beautystore_cart');
      this.items = savedCart ? JSON.parse(savedCart) : [];
      actualizarContadorCarrito();
    },
    getTotal() {
      return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
  },
  productos: [],
  categorias: ['maquillaje', 'skincare', 'higiene', 'accesorios', 'uñas']
};

// Funciones principales
function actualizarContadorCarrito() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

async function cargarProductos() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Error al cargar productos');
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Formato de datos inválido');
    }
    
    appState.productos = data.map(item => ({
      id: item.id,
      name: item.name || item.nombre || 'Producto sin nombre',
      price: Number(item.price || item.precio || 0),
      category: item.category || item.categoria || 'sin-categoria',
      image: item.image || item.imagen || 'placeholder.jpg',
      description: item.description || item.descripcion || ''
    }));
    
    return appState.productos;
  } catch (error) {
    console.error('Error cargando productos:', error);
    mostrarError('Error al cargar productos. Intenta recargar la página.');
    return [];
  }
}

function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open"></i>
        <p>No hay productos disponibles</p>
      </div>
    `;
    return;
  }

  productos.forEach(producto => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${producto.image}" alt="${producto.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${producto.name}</h3>
        ${producto.description ? `<p class="description">${producto.description}</p>` : ''}
        <div class="price">$${producto.price.toLocaleString()}</div>
        <button class="add-to-cart" 
                data-id="${producto.id}"
                data-name="${producto.name}"
                data-price="${producto.price}">
          Agregar al carrito
        </button>
      </div>
    `;
    
    productCard.querySelector('.add-to-cart').addEventListener('click', () => {
      appState.cart.addItem({
        id: producto.id,
        name: producto.name,
        price: producto.price
      });
      mostrarNotificacion(`${producto.name} agregado al carrito`);
    });
    
    contenedor.appendChild(productCard);
  });
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (!modal) return;

  const itemsContainer = modal.querySelector('.cart-items');
  const totalElement = modal.querySelector('.cart-total');
  
  itemsContainer.innerHTML = '';

  if (appState.cart.items.length === 0) {
    itemsContainer.innerHTML = '<p class="empty">Tu carrito está vacío</p>';
    totalElement.textContent = 'Total: $0';
  } else {
    appState.cart.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <div class="item-info">
          <span class="name">${item.name}</span>
          <span class="quantity">Cantidad: ${item.quantity}</span>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        <button class="remove-item" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      itemElement.querySelector('.remove-item').addEventListener('click', () => {
        appState.cart.removeItem(item.id);
        mostrarCarrito();
      });
      
      itemsContainer.appendChild(itemElement);
    });
    
    totalElement.textContent = `Total: $${appState.cart.getTotal().toLocaleString()}`;
  }
  
  modal.classList.remove('hidden');
}

function configurarEventos() {
  // Carrito
  document.getElementById('cart-button')?.addEventListener('click', mostrarCarrito);
  document.querySelector('.close-cart')?.addEventListener('click', () => {
    document.getElementById('carrito-modal').classList.add('hidden');
  });
  
  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = btn.dataset.filter;
      
      if (filter === 'todos') {
        renderizarProductos(appState.productos);
      } else {
        const filtered = appState.productos.filter(p => 
          p.category.toLowerCase() === filter.toLowerCase()
        );
        renderizarProductos(filtered);
      }
    });
  });
  
  // Checkout
  document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      
      const formData = new FormData(form);
      const customerData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        direccion: formData.get('direccion'),
        telefono: formData.get('telefono')
      };
      
      // Enviar email
      const emailSent = await enviarOrdenPorCorreo(customerData, appState.cart.items, appState.cart.getTotal());
      if (!emailSent) throw new Error('Error al enviar el correo');
      
      // Mostrar confirmación
      form.reset();
      document.getElementById('checkout-modal').classList.add('hidden');
      document.getElementById('confirmation-modal').classList.remove('hidden');
      
      // Redirigir a Wompi después de 3 segundos
      setTimeout(() => {
        window.open('https://checkout.wompi.co/l/VPOS_nJo3xk', '_blank');
        appState.cart.clear();
        mostrarCarrito();
        document.getElementById('confirmation-modal').classList.add('hidden');
      }, 3000);
      
    } catch (error) {
      console.error('Error en checkout:', error);
      mostrarError('Error al procesar tu pedido. Intenta nuevamente.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Funciones auxiliares
function mostrarNotificacion(mensaje) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = mensaje;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 2000);
}

function mostrarError(mensaje) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${mensaje}</span>
  `;
  
  const container = document.getElementById('product-list') || document.body;
  container.prepend(errorDiv);
  
  setTimeout(() => errorDiv.remove(), 5000);
}

async function enviarOrdenPorCorreo(cliente, productos, total) {
  const productosHTML = productos.map(p => `
    <li>${p.name} (${p.quantity} x $${p.price.toLocaleString()})</li>
  `).join('');
  
  try {
    await emailjs.send("service_owxur5f", "template_sck7rdl", {
      nombre: cliente.nombre,
      email: cliente.email,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      productos: productosHTML,
      total: `$${total.toLocaleString()}`
    });
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    appState.cart.load();
    
    // Cargar productos
    const productos = await cargarProductos();
    if (productos.length > 0) {
      renderizarProductos(productos);
    }
    
    // Configurar eventos
    configurarEventos();
    
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    mostrarError('Error al cargar la tienda. Recarga la página.');
  }
});
