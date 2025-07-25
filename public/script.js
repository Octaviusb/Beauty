// Configuración de Supabase
const supabaseUrl = 'https://lsxojnbkbqhuwaydiqqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG9qbmJrYnFodXdheWRpcXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYzMzAsImV4cCI6MjA2ODA4MjMzMH0.uHQJ_F3NmeM2U4EsIq_UFSPMKd35MlMZnrboKOIy45g';
const client = supabase.createClient(supabaseUrl, supabaseKey);

// Obtener user_id anónimo
let userId = localStorage.getItem('user_id');
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem('user_id', userId);
}

// Estado global
const appState = {
  productos: [],
  carrito: []
};

// Cargar productos desde Supabase
async function cargarProductos() {
  console.log("🔄 Cargando productos desde Supabase...");
  
  try {
    const { data: productos, error } = await client
      .from('productos')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    if (!productos || productos.length === 0) {
      console.warn("⚠️ No hay productos en la base de datos.");
      const contenedor = document.getElementById('product-list');
      if (contenedor) {
        contenedor.innerHTML = '<div class="empty-message">No hay productos disponibles.</div>';
      }
      return;
    }

    appState.productos = productos;
    renderizarProductos(productos);
    console.log('✅ Productos cargados desde Supabase:', productos.length);
  } catch (error) {
    console.error("❌ Error al cargar productos de Supabase:", error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = '<div class="error-message">Error cargando productos. Intenta nuevamente.</div>';
    }
  }
}

// Renderizar productos
function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  if (!contenedor) return;
  
  contenedor.innerHTML = '<div class="loading">Cargando productos...</div>';
  
  if (!Array.isArray(productos) || productos.length === 0) {
    contenedor.innerHTML = '<div class="empty-message">No hay productos disponibles.</div>';
    return;
  }

  contenedor.innerHTML = '';
  
  productos.forEach((producto) => {
    if (!producto?.id || !producto?.name || !producto?.price) {
      console.warn('Producto inválido:', producto);
      return;
    }

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${producto.image || 'assets/placeholder-product.png'}" 
             alt="${producto.name}" 
             loading="lazy"
             onerror="this.src='assets/placeholder-product.png'">
      </div>
      <div class="product-info">
        <h3 class="product-title">${producto.name}</h3>
        <p class="product-description">${producto.description || ''}</p>
        <div class="product-price">$${(producto.price || 0).toLocaleString()}</div>
        <button class="add-to-cart" 
                data-id="${producto.id}" 
                data-name="${producto.name}" 
                data-price="${producto.price}">
          Agregar
        </button>
      </div>
    `;
    
    const btn = card.querySelector('.add-to-cart');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await agregarProductoAlCarrito({ 
          id: producto.id, 
          name: producto.name, 
          price: Number(producto.price) 
        });
        await actualizarCarrito();
        mostrarNotificacion(`✅ ${producto.name} agregado al carrito`);
      } catch (error) {
        mostrarNotificacion(`❌ Error al agregar producto`);
        console.error("Error agregando al carrito:", error);
      } finally {
        btn.disabled = false;
      }
    });
    
    contenedor.appendChild(card);
  });
}

// Funciones del carrito
async function agregarProductoAlCarrito(producto) {
  try {
    // Verificar si el producto ya está en el carrito
    const { data: existingItem, error: queryError } = await client
      .from('carrito')
      .select('*')
      .eq('product_id', producto.id)
      .eq('user_id', userId)
      .single();

    if (queryError && queryError.code !== 'PGRST116') throw queryError;

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const { error: updateError } = await client
        .from('carrito')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);

      if (updateError) throw updateError;
    } else {
      // Insertar nuevo item
      const { error: insertError } = await client
        .from('carrito')
        .insert([{
          product_id: producto.id,
          name: producto.name,
          price: producto.price,
          quantity: 1,
          user_id: userId
        }]);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    throw error;
  }
}

async function cargarCarrito() {
  try {
    const { data: items, error } = await client
      .from('carrito')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return items || [];
  } catch (error) {
    console.error('Error cargando carrito:', error);
    return [];
  }
}

async function eliminarProductoDelCarrito(productId) {
  try {
    const { error } = await client
      .from('carrito')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    throw error;
  }
}

async function limpiarCarrito() {
  try {
    const { error } = await client
      .from('carrito')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error limpiando carrito:', error);
    throw error;
  }
}

// Funciones de UI
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.className = 'carrito-notificacion';
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

function actualizarContadorCarrito() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;
  const totalItems = appState.carrito.reduce((sum, item) => sum + item.quantity, 0);
  countSpan.textContent = totalItems;
}

async function actualizarCarrito() {
  try {
    appState.carrito = await cargarCarrito();
    actualizarContadorCarrito();
  } catch (error) {
    console.error("Error actualizando carrito:", error);
    mostrarNotificacion("❌ Error al cargar el carrito");
  }
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (!modal) return;
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');
  lista.innerHTML = '';
  
  if (appState.carrito.length === 0) {
    lista.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
    total.textContent = '$0';
  } else {
    appState.carrito.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">Cantidad: ${item.quantity}</span>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        <button class="remove-item" data-id="${item.product_id}"><i class="fas fa-trash"></i></button>
      `;
      itemDiv.querySelector('.remove-item').addEventListener('click', async () => {
        try {
          await eliminarProductoDelCarrito(item.product_id);
          await actualizarCarrito();
          mostrarCarrito();
        } catch (error) {
          mostrarNotificacion('❌ Error al eliminar producto');
        }
      });
      lista.appendChild(itemDiv);
    });
    
    const totalValor = appState.carrito.reduce((s, i) => s + i.price * i.quantity, 0);
    total.textContent = `$${totalValor.toLocaleString()}`;
  }
  
  modal.classList.remove('hidden');
  modal.setAttribute('aria-modal', 'true');
}

function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const closeCart = document.querySelector('.close-cart');
  const limpiarBtn = document.getElementById('limpiarCarrito');
  const finalizarBtn = document.getElementById('finalizarCompra');
  
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      mostrarCarrito();
    });
  }
  
  if (closeCart) {
    closeCart.addEventListener('click', () => {
      document.getElementById('carrito-modal').classList.add('hidden');
      document.getElementById('carrito-modal').setAttribute('aria-modal', 'false');
    });
  }
  
  if (limpiarBtn) {
    limpiarBtn.addEventListener('click', async () => {
      try {
        await limpiarCarrito();
        await actualizarCarrito();
        mostrarCarrito();
        mostrarNotificacion("🛒 Carrito vaciado");
      } catch (error) {
        mostrarNotificacion("❌ Error al vaciar carrito");
      }
    });
  }
  
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', () => {
      if (appState.carrito.length === 0) {
        mostrarNotificacion("🛒 Tu carrito está vacío");
        return;
      }
      document.getElementById('carrito-modal').classList.add('hidden');
      mostrarFormularioCheckout();
    });
  }
}

// Funciones de Checkout
function mostrarFormularioCheckout() {
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return;
  
  const summaryItems = checkoutForm.querySelector('.summary-items');
  const subtotalElement = checkoutForm.querySelector('.subtotal-amount');
  const totalElement = checkoutForm.querySelector('.total-amount');
  
  summaryItems.innerHTML = '';
  
  appState.carrito.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'summary-item';
    itemDiv.innerHTML = `
      <span>${item.name} x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toLocaleString()}</span>
    `;
    summaryItems.appendChild(itemDiv);
  });
  
  const subtotal = appState.carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const envio = subtotal > 200000 ? 0 : 10000;
  const total = subtotal + envio;
  
  subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
  checkoutForm.querySelector('.shipping-amount').textContent = `$${envio.toLocaleString()}`;
  totalElement.textContent = `$${total.toLocaleString()}`;
  
  checkoutForm.classList.remove('hidden');
  checkoutForm.setAttribute('aria-modal', 'true');
  document.querySelector('#checkoutForm [name="nombre"]')?.focus();
}

function configurarCheckoutForm() {
  const form = document.getElementById('formularioCompra');
  if (!form) return;
  
  form.querySelector('.btn-back-to-cart')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('checkoutForm').classList.add('hidden');
    document.getElementById('checkoutForm').setAttribute('aria-modal', 'false');
    mostrarCarrito();
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.btn-submit-order');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';
    
    try {
      const formData = new FormData(form);
      const cliente = {
        nombre: formData.get('nombre')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        telefono: formData.get('telefono')?.trim() || '',
        direccion: formData.get('direccion')?.trim() || '',
        ciudad: formData.get('ciudad')?.trim() || '',
        referidor: formData.get('referidor')?.trim() || 'N/A'
      };
      
      if (!cliente.nombre || !cliente.email || !cliente.telefono || !cliente.direccion) {
        throw new Error('Por favor completa todos los campos requeridos');
      }
      
      const subtotal = appState.carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const envio = subtotal > 200000 ? 0 : 10000;
      const total = subtotal + envio;
      
      const pedido = {
        cliente_nombre: cliente.nombre,
        cliente_email: cliente.email,
        cliente_telefono: cliente.telefono,
        direccion: cliente.direccion,
        ciudad: cliente.ciudad,
        referidor: cliente.referidor,
        productos: appState.carrito,
        subtotal,
        envio,
        total,
        estado: 'pendiente',
        numero_orden: `BL-${Date.now().toString().slice(-6)}`,
        fecha: new Date().toISOString(),
        user_id: userId
      };
      
      const { error } = await client.from('pedidos').insert([pedido]);
      if (error) throw error;
      
      const referencia = encodeURIComponent(`${cliente.referidor}-${pedido.numero_orden}`);
      const url = `https://checkout.wompi.co/l/VPOS_nJo3xk?amount=${Math.round(total * 100)}&currency=COP&reference=${referencia}`;
      
      setTimeout(async () => {
        await limpiarCarrito();
        await actualizarCarrito();
        mostrarConfirmacion(pedido.numero_orden);
      }, 3000);
      
      window.open(url, '_blank');
      
    } catch (error) {
      console.error("Error en checkout:", error);
      mostrarNotificacion(`❌ ${error.message || 'Error al procesar el pedido'}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Realizar Pedido';
    }
  });
}

function mostrarConfirmacion(numeroOrden) {
  const modal = document.getElementById('confirmationModal');
  if (!modal) return;
  
  modal.querySelector('#order-number').textContent = numeroOrden;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-modal', 'true');
  
  modal.querySelector('#btn-continue-shopping')?.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-modal', 'false');
    document.getElementById('checkoutForm')?.classList.add('hidden');
    document.getElementById('checkoutForm')?.setAttribute('aria-modal', 'false');
  });
}

// Inicialización
window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando aplicación...');
  
  // Configurar modales
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-modal', 'false');
      }
    });
  });
  
  await cargarProductos();
  await actualizarCarrito();
  configurarCarrito();
  configurarCheckoutForm();
  
  // Configurar filtros
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = button.dataset.filter;
      const productosFiltrados = filter ? 
        appState.productos.filter(p => p.categoria === filter) : 
        appState.productos;
      renderizarProductos(productosFiltrados);
    });
  });
});
