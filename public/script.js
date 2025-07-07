console.log('--- ¡PUBLIC/SCRIPT.JS HA EMPEZADO A EJECUTARSE (VERIFICACIÓN) ---'); // ¡PRIMERA LÍNEA!
// @ts-nocheck
console.log('[script.js] Script loaded and running');

// Función para mostrar notificaciones (agrega esto si no existe)
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Puedes implementar un modal o un toast simple aquí.
  // Por ahora, solo lo mostraremos en la consola para depuración.
  console.log(`[Notificación ${tipo.toUpperCase()}] ${mensaje}`);

  // Opcional: Implementa una pequeña caja de notificación en el DOM
  // const notifDiv = document.createElement('div');
  // notifDiv.className = `notification ${tipo}`;
  // notifDiv.textContent = mensaje;
  // document.body.appendChild(notifDiv);
  // setTimeout(() => {
  //   notifDiv.remove();
  // }, 3000);
}

// === STATE ===
const appState = {
  products: [],
  filteredProducts: [],
  currentFilter: 'all',
    cart: {
      items: [],

    async addItem(product) {
  console.log('[DEBUG addItem] Antes de modificar items:', JSON.stringify(this.items));
      // Forzar IDs a string
      const prodId = String(product.id);
      const existing = this.items.find(i => String(i.id) === prodId);
      console.log('[DEBUG addItem] Buscando producto en carrito:', prodId, 'Encontrado:', existing);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({ ...product, id: prodId, quantity: 1 });
      }
      this.saveToLocalStorage();
  console.log('[DEBUG addItem] Después de modificar items:', JSON.stringify(this.items));
      await syncItemWithServer({ ...product, id: prodId });
    },

    removeItem(productId) {
      const prodId = String(productId);
      this.items = this.items.filter(i => String(i.id) !== prodId);
      this.saveToLocalStorage();
    },

    updateQuantity(productId, change) {
      const prodId = String(productId);
      const item = this.items.find(i => String(i.id) === prodId);
      if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
          this.removeItem(prodId);
        }
      }
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('cart');
      this.items = saved ? JSON.parse(saved) : [];
    }
  }
}

// === SINCRONIZAR AL AGREGAR AL CARRITO ===
async function syncItemWithServer(product) {
  const payload = {
    producto_id: String(product.id),
    nombre: product.name,
    precio: product.price,
    cantidad: 1
  };
  console.log('[syncItemWithServer] Enviando al backend:', payload);
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const responseText = await res.clone().text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = responseText;
    }
    console.log('[syncItemWithServer] Respuesta bruta:', responseText);
    if (!res.ok) {
      console.error('[syncItemWithServer] Error:', data);
      mostrarNotificacion('Error al agregar al carrito: ' + (data.error || data.message || 'Error desconocido'), 'error');
      throw new Error(data.error || data.message || 'Error al sincronizar');
    }
    // Si éxito, podrías mostrar una notificación de éxito opcional
  } catch (error) {
    console.error('[syncItemWithServer] Error general:', error);
    mostrarNotificacion('No se pudo agregar el producto al carrito: ' + error.message, 'error');
  }
}


// === CARGAR CARRITO DESDE SERVIDOR AL INICIAR ===



// === FETCH PRODUCTS ===
async function initializeProducts() {
  try {
    const response = await fetch('/api/products');
    // --- ¡AÑADE ESTOS LOGS PARA DEBUG HTTP! ---
    if (!response.ok) {
      console.error('[initializeProducts] Error HTTP:', response.status, response.statusText);
      const errorBody = await response.text(); // Intenta leer el cuerpo del error
      console.error('[initializeProducts] Cuerpo del error HTTP:', errorBody);
      throw new Error('Error de red o servidor: ' + response.status + ' ' + response.statusText);
    }
    // ------------------------------------------

    const data = await response.json();
    console.log('[initializeProducts] Data REST del backend (cruda):', data);

    appState.products = data.map(prod => {
      const categoria = (prod.category === 'uñas') ? 'esmaltes' : prod.category;
      return {
        id: String(prod.id),
        name: prod.name,
        description: prod.description || '',
        category: categoria || 'otros',
        price: prod.price,
        image: prod.image || './images/default-product.jpg',
        badge: prod.badge || ''
      };
    });
    window.appState = appState;
    console.log('[initializeProducts] appState.products (después de mapeo):', appState.products);

    applyFilter(appState.currentFilter);
  } catch (error) {
    console.error('Error (capturado) al obtener productos desde /api/products:', error);
    loadBackupProducts(); // Solo carga respaldo si fetch falló
  }
}


// === APLICAR FILTRO ===
function applyFilter(filter) {
  const cleanFilter = filter?.toLowerCase();
  const normalizedFilter = cleanFilter === 'uñas' ? 'esmaltes' : cleanFilter;
  appState.currentFilter = normalizedFilter;

  if (normalizedFilter === 'all') {
    const esmaltes = appState.products.filter(p => p.category === 'esmaltes');
    const otros = appState.products.filter(p => p.category !== 'esmaltes');
    appState.filteredProducts = [...esmaltes, ...otros];
  } else {
    appState.filteredProducts = appState.products.filter(p => {
      const cat = (p.category === 'uñas') ? 'esmaltes' : p.category;
      return cat === normalizedFilter;
    });
  }
  console.log('[applyFilter] appState.filteredProducts (después de filtro):', appState.filteredProducts);

  renderProducts();
}


// === RENDER PRODUCTS ===
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (appState.filteredProducts.length === 0) {
    grid.innerHTML = '<p class="no-products">No hay productos disponibles en esta categoría.</p>';
    return;
  }

  appState.filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Log de depuración detallado para skincare y otros
    if (product.category === 'skincare') {
      console.log('[SKINCARE]', {
        id: product.id,
        name: product.name,
        image: product.image,
        description: product.description
      });
    } else {
      console.log(`Renderizando producto: ${product.name}, imagen: ${product.image}`);
    }
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="if(!this.dataset.fallback){this.dataset.fallback=true;console.warn('Imagen no encontrada:', this.src);this.src='/images/default-product.jpg';}">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">$${product.price.toLocaleString('es-CO')}</div>
        <button class="add-to-cart" data-id="${product.id}">Agregar al carrito</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

// === CART ===

async function cargarCarritoDesdeServidor() {
  try {
    const res = await fetch('/api/cart');
    const data = await res.json();
    appState.cart.items = data.map(item => ({
      id: item.producto_id,
      name: item.nombre,
      price: item.precio,
      quantity: item.cantidad
    }));
  } catch (error) {
    console.error("Error cargando el carrito desde servidor:", error);
  }
}

function updateCartUI() {
  const cart = appState.cart;
  const countEl = document.querySelector('.cart-count');
  const container = document.querySelector('.cart-items');
  const totalEl = document.querySelector('.total-amount');
  const emptyMessage = document.querySelector('.cart-empty-message');

  // Actualiza contador
  if (countEl) {
    countEl.textContent = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  if (!container || !totalEl) return;

  // Limpia el contenido anterior
  container.innerHTML = '';

  // Mostrar mensaje si el carrito está vacío
  if (cart.items.length === 0) {
    if (emptyMessage) emptyMessage.classList.remove('hidden');
    totalEl.textContent = '$0';
    return;
  } else {
    if (emptyMessage) emptyMessage.classList.add('hidden');
  }

  // Renderiza los productos del carrito
  cart.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${item.price.toLocaleString('es-CO')} x ${item.quantity}</span>
      </div>
      <button class="remove-item" data-id="${item.id}">Eliminar</button>
    `;
    container.appendChild(div);
  });

  // Actualiza el total
  const total = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  totalEl.textContent = `$${total.toLocaleString('es-CO')}`;

// Asignar eventos a botones de eliminar
container.querySelectorAll('.remove-item').forEach(button => {
  button.addEventListener('click', async (e) => {
    const id = parseInt(button.dataset.id);

    appState.cart.removeItem(id);       // Elimina del frontend
    updateCartUI();                     // Actualiza la vista

    // Elimina también en el backend
    await fetch('/api/cart/' + id, {
      method: 'DELETE'
    });
  });
});
}

// === EVENTOS ===
function setupEventListeners() {
  document.addEventListener('click', async (e) => {
    // Listener para agregar al carrito
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
      console.log('[DEBUG CLICK] Se hizo click en un botón add-to-cart');
      const id = String(btn.dataset.id);
      const product = appState.products.find(p => String(p.id) === id);
      if (product) {
        await appState.cart.addItem(product);
        updateCartUI();
      }
      return;
    }
    
    // Listener para enlaces de categoría
    const categoryLink = e.target.closest('.category-link, .filter-btn');
    if (categoryLink) {
      e.preventDefault();
      const filter = categoryLink.dataset.filter || categoryLink.getAttribute('data-filter');
      if (filter) {
        applyFilter(filter);
        // Navega a la sección de productos
        const productosSection = document.getElementById('productos');
        if (productosSection) {
          productosSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }
    // Abrir modal del carrito
    if (e.target.closest('#cartButton')) {
      document.getElementById('carrito').classList.remove('hidden');
      document.getElementById('carrito').classList.add('active');
    }

    // Cerrar modal del carrito
    if (e.target.classList.contains('close-cart')) {
      document.getElementById('carrito').classList.remove('active');
      document.getElementById('carrito').classList.add('hidden');
    }

    // Abrir formulario de compra
    if (e.target.classList.contains('checkout-btn')) {
      document.getElementById('checkoutForm').classList.remove('hidden');
      document.getElementById('checkoutForm').classList.add('active');
      document.getElementById('carrito').classList.add('hidden');
      document.getElementById('formularioCompra')?.addEventListener('submit', (e) => {
      e.preventDefault();

        // Validar y recoger datos (si aplica)
        // const nombre = ...
        // const direccion = ...

        // Mostrar modal para subir comprobante de pago (NO vaciar carrito aún)
        document.getElementById('checkoutForm').classList.add('hidden');
        document.getElementById('paymentModal').classList.remove('hidden');
      });
    }

    // Cerrar formulario de compra
    if (e.target.classList.contains('close-form')) {
      document.getElementById('checkoutForm').classList.add('hidden');
      document.getElementById('checkoutForm').classList.remove('active');
    }

    // Confirmación - cerrar modal
    if (e.target.classList.contains('btn-close-confirmation')) {
      document.getElementById('confirmationModal').classList.add('hidden');
      document.getElementById('confirmationModal').classList.remove('active');
      document.getElementById('btn-finalizar')?.addEventListener('click', () => {
      // Aquí sí vaciamos el carrito, porque ya se pagó
      appState.cart.items = [];
      appState.cart.saveToLocalStorage();
      updateCartUI();

      // Mostrar modal de agradecimiento / confirmación final
      document.getElementById('paymentModal').classList.add('hidden');
      document.getElementById('confirmationModal').classList.remove('hidden');
    });
    }

    // Volver a tienda desde confirmación
    if (e.target.classList.contains('btn-back-to-shop')) {
      document.getElementById('confirmationModal').classList.add('hidden');
      document.getElementById('confirmationModal').classList.remove('active');
    }

    // Volver desde formulario al carrito
    if (e.target.classList.contains('btn-back-to-cart')) {
      document.getElementById('checkoutForm').classList.add('hidden');
      document.getElementById('checkoutForm').classList.remove('active');
      document.getElementById('carrito').classList.remove('hidden');
      document.getElementById('carrito').classList.add('active');
    }
  });

  // Confirmar pedido
  const checkoutForm = document.getElementById('formularioCompra');
  checkoutForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(checkoutForm);
      const comprobante = formData.get('comprobante');
      let res, data;
      if (comprobante && comprobante.size > 0) {
        // Enviar como multipart/form-data
        const fd = new FormData();
        fd.append('customer_name', formData.get('nombre'));
        fd.append('customer_email', formData.get('email'));
        fd.append('address', formData.get('direccion'));
        fd.append('customer_phone', formData.get('telefono'));
        fd.append('items', JSON.stringify(appState.cart.items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }))));
        fd.append('total', appState.cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0));
        fd.append('comprobante', comprobante);
        res = await fetch('/api/orders', {
          method: 'POST',
          body: fd
        });
      } else {
        // Enviar como JSON normal
        const pedido = {
          customer_name: formData.get('nombre'),
          customer_email: formData.get('email'),
          address: formData.get('direccion'),
          customer_phone: formData.get('telefono'),
          items: appState.cart.items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          total: appState.cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0)
        };
        res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedido)
        });
      }
      data = await res.json();
      if (res.ok && data.success) {
        appState.cart.items = [];
        appState.cart.saveToLocalStorage();
        updateCartUI();
        document.getElementById('checkoutForm').classList.add('hidden');
        document.getElementById('checkoutForm').classList.remove('active');
        document.getElementById('confirmationModal').classList.remove('hidden');
        document.getElementById('confirmationModal').classList.add('active');
      } else {
        mostrarNotificacion('Error al registrar el pedido: ' + (data.error || 'Intenta de nuevo'), 'error');
      }
    } catch (err) {
      mostrarNotificacion('Error de red al registrar el pedido', 'error');
    }
  });
}


// === CARGA DE RESPALDO ===
async function loadBackupProducts() {
  try {
    const response = await fetch('productos_backup.json');
    if (!response.ok) throw new Error('No se pudo cargar el respaldo');
    const data = await response.json();
    appState.products = data.map(prod => {
      const categoria = (prod.category === 'uñas') ? 'esmaltes' : prod.category;
      return {
        id: String(prod.id),
        name: prod.name,
        description: prod.description || '',
        category: categoria || 'otros',
        price: prod.price,
        image: prod.image || './images/default-product.jpg',
        badge: prod.badge || ''
      };
    });
    window.appState = appState; // Exponer appState global tras cargar productos de respaldo
    console.log('[loadBackupProducts] Productos cargados:', appState.products);
    applyFilter(appState.currentFilter);
    setTimeout(() => {
      console.log('[loadBackupProducts] filteredProducts:', appState.filteredProducts);
      // Si no hay productos filtrados y sí hay productos, forzar filtro 'all'
      if (appState.filteredProducts.length === 0 && appState.products.length > 0) {
        console.warn('[loadBackupProducts] No se filtró ningún producto, forzando filtro "all"');
        applyFilter('all');
      }
      renderProducts();
      // Mostrar estado del DOM
      const grid = document.getElementById('productsGrid');
      if (grid) {
        console.log('[DOM] productsGrid child count:', grid.children.length);
      }
      // Forzar notificación visual
      mostrarNotificacion('Catálogo cargado desde respaldo local (depuración)', 'info');
    }, 100);
  } catch (error) {
    console.error('Error al cargar productos de respaldo:', error);
    mostrarNotificacion('No se pudieron cargar productos. Intenta más tarde.', 'error');
  }
}


// === INICIAR APP ===
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[DOMContentLoaded] Handler started - INICIO');
  try {
    // renderCategoryFilters();
    console.log('[DOMContentLoaded] Before initializeProducts');
    await initializeProducts();
    console.log('[DOMContentLoaded] After initializeProducts');
    console.log('[DOMContentLoaded] Before cargarCarritoDesdeServidor');
    await cargarCarritoDesdeServidor();
    console.log('[DOMContentLoaded] After cargarCarritoDesdeServidor');
    console.log('[DOMContentLoaded] Before updateCartUI');
    updateCartUI();
    console.log('[DOMContentLoaded] After updateCartUI');
    console.log('[DOMContentLoaded] Before setupEventListeners');
    setupEventListeners();
    console.log('[DOMContentLoaded] After setupEventListeners');
  } catch (err) {
    console.error('[DOMContentLoaded] Error during initialization:', err);
  }
  console.log('[DOMContentLoaded] Handler finished - FIN');
});


