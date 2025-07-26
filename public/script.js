// Configuración de Supabase
if (!window.SUPABASE_CLIENT) {
  const SUPABASE_URL = 'https://lsxojnbkbqhuwaydiqqb.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG9qbmJrYnFodXdheWRpcXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYzMzAsImV4cCI6MjA2ODA4MjMzMH0.uHQJ_F3NmeM2U4EsIq_UFSPMKd35MlMZnrboKOIy45g';
  window.SUPABASE_CLIENT = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
const client = window.SUPABASE_CLIENT;

// Obtener user_id anónimo
let userId = localStorage.getItem('user_id');
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem('user_id', userId);
}

// Estado global
const appState = {
  products: [],
  carrito: [],
  pedidos: [],
};

// Cargar productos desde Supabase
async function cargarProductos() {
  try {
    const { data: products, error } = await client
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    if (!products || products.length === 0) {
      document.getElementById('product-list').innerHTML = '<div class="empty-message">No hay productos disponibles.</div>';
      return;
    }

    appState.products = products;
    renderizarProductos(products);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    document.getElementById('product-list').innerHTML = '<div class="error-message">Error cargando productos.</div>';
  }
}

// Renderizar productos
function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  contenedor.innerHTML = '';

  productos.forEach((producto) => {
    if (!producto?.id || !producto?.name || !producto?.price) return;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-container">
        <img class="product-image"
             src="${producto.image || 'assets/placeholder-product.png'}" 
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

    card.querySelector('.add-to-cart').addEventListener('click', async (e) => {
      e.target.disabled = true;
      try {
        await agregarProductoAlCarrito({
          id: producto.id,
          name: producto.name,
          price: Number(producto.price)
        });
        await actualizarCarrito();
        mostrarNotificacion(`✅ ${producto.name} agregado al carrito`);
      } catch (err) {
        mostrarNotificacion(`❌ Error al agregar producto`);
      } finally {
        e.target.disabled = false;
      }
    });

    contenedor.appendChild(card);
  });
}

// Agregar producto al carrito
async function agregarProductoAlCarrito(producto) {
  const { data: existingItems, error: queryError } = await client
    .from('carrito')
    .select('*')
    .eq('product_id', producto.id)
    .eq('user_id', userId);

  if (queryError) throw queryError;

  const existingItem = existingItems?.[0];

  if (existingItem) {
    const { error: updateError } = await client
      .from('carrito')
      .update({ quantity: existingItem.quantity + 1 })
      .eq('id', existingItem.id);

    if (updateError) throw updateError;
  } else {
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
}

// Cargar carrito
async function cargarCarrito() {
  try {
    const { data, error } = await client
      .from('carrito')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error cargando carrito:", error);
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
    console.error("Error eliminando producto:", error);
    throw error;
  }
}

// Limpiar carrito
async function limpiarCarrito() {
  const { error } = await client
    .from('carrito')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.className = 'carrito-notificacion';
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// Actualizar contador y vista de carrito
async function actualizarCarrito() {
  try {
    const carritoActual = await cargarCarrito();
    appState.carrito = carritoActual;
    actualizarContadorCarrito();
  } catch (error) {
    console.error("Error al actualizar carrito:", error);
  }
}

// Actualizar contador numérico
function actualizarContadorCarrito() {
  const total = appState.carrito.reduce((sum, item) => sum + item.quantity, 0);
  const span = document.getElementById('cart-count');
  if (span) span.textContent = total;
}

// Mostrar modal del carrito
function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  
  if (!modal) {
    console.error('Error: No se encontró el elemento #carrito-modal');
    return;
  }

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
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
        <button class="remove-item" data-id="${item.product_id}">×</button>
      `;
      
      itemDiv.querySelector('.remove-item').addEventListener('click', async () => {
        try {
          await eliminarProductoDelCarrito(item.product_id);
          await actualizarCarrito();
          mostrarCarrito();
        } catch (error) {
          console.error('Error eliminando producto:', error);
        }
      });
      
      lista.appendChild(itemDiv);
    });

    const totalValor = appState.carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    total.textContent = `$${totalValor.toLocaleString()}`;
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

// Mostrar formulario de pedido
function mostrarFormularioPedido() {
  const checkoutForm = document.getElementById('checkoutForm');
  const summaryItems = checkoutForm.querySelector('.summary-items');
  const subtotalElement = checkoutForm.querySelector('.subtotal-amount');
  const shippingElement = checkoutForm.querySelector('.shipping-amount');
  const totalElement = checkoutForm.querySelector('.total-amount');
  
  cerrarCarrito();
  
  summaryItems.innerHTML = '';
  appState.carrito.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'summary-item';
    itemDiv.innerHTML = `
      <span class="item-name">${item.name} x${item.quantity}</span>
      <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
    `;
    summaryItems.appendChild(itemDiv);
  });
  
  const subtotal = appState.carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 200000 ? 0 : 12000;
  const total = subtotal + shipping;
  
  subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
  shippingElement.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`;
  totalElement.textContent = `$${total.toLocaleString()}`;
  
  checkoutForm.classList.remove('hidden');
  checkoutForm.classList.add('active');
  checkoutForm.setAttribute('aria-modal', 'true');
}

// Guardar pedido en Supabase
async function guardarPedidoEnSupabase(pedidoData) {
  try {
    const { data, error } = await client
      .from('pedidos')
      .insert([pedidoData])
      .select();
    
    if (error) throw error;
    console.log('✅ Pedido guardado en Supabase:', data);
    return data[0];
  } catch (error) {
    console.error('❌ Error al guardar pedido:', error);
    throw error;
  }
}

// Procesar pedido
async function procesarPedido(event) {
  event.preventDefault();
  
  const formulario = document.getElementById('formularioCompra');
  const nombre = formulario.querySelector('#nombre').value;
  const email = formulario.querySelector('#email').value;
  const telefono = formulario.querySelector('#telefono').value;
  const direccion = formulario.querySelector('#direccion').value;
  const ciudad = formulario.querySelector('#ciudad').value;
  const referidor = formulario.querySelector('#referidor').value;
  
  if (!nombre || !email || !telefono || !direccion || !ciudad || !referidor) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }
  
  const subtotal = appState.carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 200000 ? 0 : 12000;
  const total = subtotal + shipping;
  const orderNumber = `BL-${Date.now().toString().slice(-6)}`;
  
  const pedidoData = {
    numero_pedido: orderNumber,
    nombre_cliente: nombre,
    email_cliente: email,
    telefono_cliente: telefono,
    direccion_cliente: `${direccion}, ${ciudad}`,
    referidor: referidor,
    productos: appState.carrito,
    subtotal: subtotal,
    envio: shipping,
    total: total,
    estado: 'pendiente_pago',
    metodo_pago: 'wompi',
    user_id: userId
  };
  
  try {
    await guardarPedidoEnSupabase(pedidoData);
    
    const carrito = appState.carrito.map(item => `${item.quantity}x ${item.name} ($${item.price.toLocaleString()})`).join(", ");
    
    if (typeof emailjs !== 'undefined') {
      await emailjs.send("service_owxur5f", "template_sck7rdl", {
        nombre,
        email,
        telefono,
        direccion: `${direccion}, ${ciudad}`,
        referidor,
        metodo_pago: 'Wompi',
        total: total.toLocaleString(),
        carrito,
        referencia: orderNumber
      }, "Cqwg1EyqFLvPg7ULx");
    }
    
    document.getElementById('checkoutForm').classList.add('hidden');
    await limpiarCarrito();
    await actualizarCarrito();
    
    const totalCents = Math.round(total * 100);
    window.location.href = `/wompi-redirect.html?total=${totalCents}&reference=${orderNumber}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(nombre)}`;
    
  } catch (error) {
    console.error('Error procesando pedido:', error);
    alert('Error al procesar el pedido. Intenta nuevamente.');
  }
}

// Configurar botones del carrito
function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const closeButton = document.querySelector('.close-cart');
  const clearButton = document.getElementById('limpiarCarrito');
  const checkoutButton = document.getElementById('finalizarCompra');
  const formulario = document.getElementById('formularioCompra');

  if (cartButton) {
    cartButton.addEventListener('click', async () => {
      await actualizarCarrito();
      mostrarCarrito();
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', cerrarCarrito);
  }

  if (clearButton) {
    clearButton.addEventListener('click', async () => {
      try {
        await limpiarCarrito();
        await actualizarCarrito();
        mostrarCarrito();
      } catch (error) {
        console.error('Error vaciando carrito:', error);
      }
    });
  }
  
  if (checkoutButton) {
    checkoutButton.addEventListener('click', mostrarFormularioPedido);
  }
  
  if (formulario) {
    formulario.addEventListener('submit', procesarPedido);
  }
  
  // Cerrar formulario
  document.querySelector('.close-form')?.addEventListener('click', () => {
    document.getElementById('checkoutForm').classList.add('hidden');
  });
  
  // Volver al carrito
  document.querySelector('.btn-back-to-cart')?.addEventListener('click', () => {
    document.getElementById('checkoutForm').classList.add('hidden');
    mostrarCarrito();
  });
}

// Inicializar
window.addEventListener('DOMContentLoaded', async () => {
  await cargarProductos();
  await actualizarCarrito();
  configurarCarrito();

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const filtro = button.dataset.filter;
      const filtrados = filtro
        ? appState.products.filter(p => p.categoria === filtro)
        : appState.products;
      renderizarProductos(filtrados);
    });
  });
});
