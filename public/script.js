// Credenciales Supabase
const SUPABASE_URL = 'https://lsxojnbkbqhuwaydiqqb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG9qbmJrYnFodXdheWRpcXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYzMzAsImV4cCI6MjA2ODA4MjMzMH0.uHQJ_F3NmeM2U4EsIq_UFSPMKd35MlMZnrboKOIy45g';
let appState = {
  productos: [],
  cart: {
    items: [],
    clear() {
      this.items = [];
      localStorage.removeItem('cart');
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando aplicación...');
  await cargarProductos();
  configurarEventosGenerales();
});

// Cargar productos desde Supabase o fallback JSON
async function cargarProductos() {
  try {
    if (!SUPABASE_URL.includes('TU_URL')) {
      const productos = await fetchProductosDesdeSupabase();
      if (productos.length) {
        appState.productos = productos;
        console.log('✅ Productos cargados desde Supabase:', productos.length);
        renderizarProductos(productos);
        return;
      }
    }
    throw new Error('❌ Falló carga Supabase. Usando respaldo local...');
  } catch (err) {
    console.warn(err.message);
    const productos = await fetch('/productos.json').then(r => r.json());
    appState.productos = productos;
    console.log('📁 Productos cargados desde JSON:', productos.length);
    renderizarProductos(productos);
  }
}

// Fetch desde Supabase
async function fetchProductosDesdeSupabase() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!res.ok) throw new Error('Supabase API error');
  return await res.json();
}

// Renderizar productos
function renderizarProductos(productos) {
  const container = document.getElementById('product-list');
  if (!container) return;
  container.innerHTML = '';
  productos.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" />
      <h3>${prod.name}</h3>
      <p>${prod.description}</p>
      <span>$${prod.price}</span>
      <button class="add-to-cart" data-id="${prod.id}">Agregar</button>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', agregarAlCarrito);
  });
}

// Agregar al carrito
function agregarAlCarrito(e) {
  const id = e.target.dataset.id;
  const producto = appState.productos.find(p => p.id == id);
  if (producto) {
    appState.cart.items.push(producto);
    localStorage.setItem('cart', JSON.stringify(appState.cart.items));
    actualizarContadorCarrito();
  }
}

function actualizarContadorCarrito() {
  const count = document.getElementById('cart-count');
  count.textContent = appState.cart.items.length;
}

// Checkout
document.getElementById('formularioCompra')?.addEventListener('submit', e => {
  e.preventDefault();
  procesarPedido();
});

function procesarPedido() {
  const form = document.getElementById('formularioCompra');
  const total = calcularTotalPedido();
  const orderNumber = `BL-${Date.now()}`;
  const email = form.email.value;
  const nombre = form.nombre.value;
  const referidor = form.referidor?.value || '';

  // Enviar correo con EmailJS
  emailjs.send("default_service", "pedido_template", {
    nombre,
    email,
    total,
    referidor,
    pedido: JSON.stringify(appState.cart.items, null, 2)
  }).then(() => {
    console.log('📧 Pedido enviado');
    redirigirAWompi(total, orderNumber, email, nombre);
  }).catch(err => {
    alert('❌ Error al enviar pedido: ' + err.message);
  });
}

function calcularTotalPedido() {
  return appState.cart.items.reduce((total, item) => total + item.price, 0);
}

function redirigirAWompi(total, orderNumber, email, nombre) {
  const form = document.createElement('form');
  form.action = 'https://checkout.wompi.co/p/';
  form.method = 'GET';

  form.innerHTML = `
    <input type="hidden" name="public-key" value="LLAVE_PUBLICA_WOMPI">
    <input type="hidden" name="currency" value="COP">
    <input type="hidden" name="amount-in-cents" value="${total * 100}">
    <input type="hidden" name="reference" value="${orderNumber}">
    <input type="hidden" name="customer-data:email" value="${email}">
    <input type="hidden" name="customer-data:full-name" value="${nombre}">
    <input type="hidden" name="redirect-url" value="https://beauty-mocha-ten.vercel.app/confirmacion.html">
  `;
  document.body.appendChild(form);
  form.submit();
}

// Eventos
function configurarEventosGenerales() {
  document.querySelector('.btn-back-to-cart')?.addEventListener('click', () => {
    document.getElementById('checkoutForm').classList.add('hidden');
    document.getElementById('carrito-modal').classList.remove('hidden');
  });

  document.getElementById('finalizarCompra')?.addEventListener('click', () => {
    mostrarFormularioCheckout();
  });
}

function mostrarFormularioCheckout() {
  const modal = document.getElementById('checkoutForm');
  if (modal) modal.classList.remove('hidden');
}
