// Configuración de Supabase
const supabaseUrl = 'https://lsxojnbkbqhuwaydiqqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // truncado por seguridad
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
  try {
    const { data: productos, error } = await client
      .from('productos')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    if (!productos || productos.length === 0) {
      document.getElementById('product-list').innerHTML = '<div class="empty-message">No hay productos disponibles.</div>';
      return;
    }

    appState.productos = productos;
    renderizarProductos(productos);
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
  const { data: existingItem, error: queryError } = await client
    .from('carrito')
    .select('*')
    .eq('product_id', producto.id)
    .eq('user_id', userId)
    .single();

  if (queryError && queryError.code !== 'PGRST116') throw queryError;

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
  const { data, error } = await client
    .from('carrito')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error("Error cargando carrito:", error);
    return [];
  }
  return data || [];
}

// Eliminar producto del carrito
async function eliminarProductoDelCarrito(productId) {
  const { error } = await client
    .from('carrito')
    .delete()
    .eq('product_id', productId)
    .eq('user_id', userId);
  if (error) throw error;
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
  appState.carrito = await cargarCarrito();
  actualizarContadorCarrito();
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
        await eliminarProductoDelCarrito(item.product_id);
        await actualizarCarrito();
        mostrarCarrito();
      });
      lista.appendChild(itemDiv);
    });

    const totalValor = appState.carrito.reduce((s, i) => s + i.price * i.quantity, 0);
    total.textContent = `$${totalValor.toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-modal', 'true');
}

// Configurar botones del carrito
function configurarCarrito() {
  document.getElementById('cartButton')?.addEventListener('click', mostrarCarrito);
  document.querySelector('.close-cart')?.addEventListener('click', () => {
    document.getElementById('carrito-modal')?.classList.add('hidden');
  });
  document.getElementById('limpiarCarrito')?.addEventListener('click', async () => {
    await limpiarCarrito();
    await actualizarCarrito();
    mostrarCarrito();
    mostrarNotificacion("🧹 Carrito vaciado");
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
        ? appState.productos.filter(p => p.categoria === filtro)
        : appState.productos;
      renderizarProductos(filtrados);
    });
  });
});
