// Configuración de Supabase
const SUPABASE_URL = 'https://ixnfhwvbwcxnwfhqpnzs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bmZod3Zid2N4bndmaHFwbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0NTM3NzcsImV4cCI6MjAzMzAyOTc3N30.Yd9hQiK_-eFxJJKO9PgMUVvGdL1JYnQnIGmA3QPcwQE';

// Inicializar Supabase
let supabase;
if (typeof window.supabase !== 'undefined') {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Estado global de la aplicación
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

//cargar productos
import { supabase } from './supabaseClient.js';

async function cargarProductos() {
  console.log("🔄 Cargando productos desde Supabase...");

  const { data: productos, error } = await supabase
    .from('productos')  // el nombre de tu tabla en Supabase
    .select('*');

  if (error) {
    console.error("❌ Error al cargar productos de Supabase:", error);
    return;
  }

  if (!productos || productos.length === 0) {
    console.warn("⚠️ No hay productos en la base de datos.");
    return;
  }

  appState.productos = productos;
  renderizarProductos(productos);
  console.log('✅ Productos cargados desde Supabase:', productos.length);
}


// Renderizar productos
function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  productos.forEach((producto) => {
    if (!producto || !producto.id) return;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${producto.image}" alt="${producto.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3 class="product-title">${producto.name}</h3>
        <p class="product-description">${producto.description || ''}</p>
        <div class="product-price">$${producto.price.toLocaleString()}</div>
        <button class="add-to-cart" data-id="${producto.id}" data-name="${producto.name}" data-price="${producto.price}">Agregar</button>
      </div>
    `;

    const btn = card.querySelector('.add-to-cart');
    btn.addEventListener('click', () => {
      appState.cart.addItem({ 
        id: producto.id, 
        name: producto.name, 
        price: Number(producto.price) 
      });
      actualizarContadorCarrito();
      mostrarNotificacion(`✅ ${producto.name} agregado al carrito`);
    });

    contenedor.appendChild(card);
  });
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.className = 'carrito-notificacion';
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;
  const totalItems = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  countSpan.textContent = totalItems;
}

// Mostrar carrito
function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (!modal) return;

  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
    total.textContent = '$0';
  } else {
    appState.cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">Cantidad: ${item.quantity}</span>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        <button class="remove-item" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      itemDiv.querySelector('.remove-item').addEventListener('click', () => {
        appState.cart.removeItem(item.id);
        mostrarCarrito();
        actualizarContadorCarrito();
      });
      
      lista.appendChild(itemDiv);
    });
    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
}

// Configurar carrito
function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const closeCart = document.querySelector('.close-cart');
  const limpiarBtn = document.getElementById('limpiarCarrito');
  const finalizarBtn = document.getElementById('finalizarCompra');

  if (cartButton) {
    cartButton.addEventListener('click', mostrarCarrito);
  }

  if (closeCart) {
    closeCart.addEventListener('click', () => {
      document.getElementById('carrito-modal').classList.add('hidden');
    });
  }

  if (limpiarBtn) {
    limpiarBtn.addEventListener('click', () => {
      appState.cart.clear();
      actualizarContadorCarrito();
      mostrarCarrito();
    });
  }

  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', () => {
      document.getElementById('carrito-modal').classList.add('hidden');
      mostrarFormularioCheckout();
    });
  }
}

// Mostrar formulario de checkout
function mostrarFormularioCheckout() {
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return;

  // Llenar resumen del pedido
  const summaryItems = checkoutForm.querySelector('.summary-items');
  const subtotalElement = checkoutForm.querySelector('.subtotal-amount');
  const shippingElement = checkoutForm.querySelector('.shipping-amount');
  const totalElement = checkoutForm.querySelector('.total-amount');
  
  if (summaryItems) {
    summaryItems.innerHTML = '';
    appState.cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'summary-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name} x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
      `;
      summaryItems.appendChild(itemDiv);
    });
  }
  
  // Calcular totales
  const subtotal = appState.cart.getTotal();
  const shipping = subtotal > 200000 ? 0 : 12000;
  const total = subtotal + shipping;
  
  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
  if (shippingElement) shippingElement.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`;
  if (totalElement) totalElement.textContent = `$${total.toLocaleString()}`;
  
  checkoutForm.classList.remove('hidden');
  checkoutForm.classList.add('active');
}

// Configurar formulario de checkout
function configurarCheckoutForm() {
  const checkoutForm = document.getElementById('checkoutForm');
  const closeForm = checkoutForm?.querySelector('.close-form');
  const backToCart = checkoutForm?.querySelector('.btn-back-to-cart');
  
  if (closeForm) {
    closeForm.addEventListener('click', () => {
      checkoutForm.classList.add('hidden');
    });
  }
  
  if (backToCart) {
    backToCart.addEventListener('click', () => {
      checkoutForm.classList.add('hidden');
      mostrarCarrito();
    });
  }
}

// Enviar orden por correo
function enviarOrdenPorCorreo(cliente, productos, total) {
  const productosHTML = productos.map(p => 
    `<li>${p.name} (x${p.quantity}) - $${(p.price * p.quantity).toLocaleString()}</li>`
  ).join('');

  const templateParams = {
    nombre: cliente.nombre,
    email: cliente.email,
    direccion: cliente.direccion,
    telefono: cliente.telefono,
    referidor: cliente.referidor,
    productos: productosHTML,
    total: `$${total.toLocaleString()}`,
    nota: `El pedido será despachado a más tardar 3 días después de haberse confirmado el pago del pedido.
En todo pedido que sobrepase los $200.000, el transporte será gratuito.`
  };

  return emailjs.send("service_owxur5f", "template_sck7rdl", templateParams)
    .then(() => true)
    .catch(err => {
      console.error("❌ Error al enviar el correo:", err);
      return false;
    });
}

// Guardar pedido en Supabase
async function guardarPedidoEnSupabase(pedido) {
  if (!supabase) {
    console.warn('⚠️ Supabase no está inicializado');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedido]);

    if (error) {
      console.error('❌ Error guardando pedido en Supabase:', error);
      return false;
    }

    console.log('✅ Pedido guardado en Supabase:', data);
    return true;
  } catch (error) {
    console.error('❌ Error en Supabase:', error);
    return false;
  }
}

// PROCESAR PEDIDO - VERSIÓN SIMPLIFICADA
function procesarPedido() {
  console.log('🛒 Procesando pedido...');
  
  // Obtener datos del formulario DIRECTAMENTE por ID
  const nombre = document.getElementById('nombre')?.value || '';
  const email = document.getElementById('email')?.value || '';
  const telefono = document.getElementById('telefono')?.value || '';
  const direccion = document.getElementById('direccion')?.value || '';
  const ciudad = document.getElementById('ciudad')?.value || '';
  const referidor = document.getElementById('referidor')?.value || 'No especificado';

  console.log('📋 Datos capturados:');
  console.log('- Nombre:', nombre);
  console.log('- Email:', email);
  console.log('- Teléfono:', telefono);
  console.log('- Dirección:', direccion);
  console.log('- Ciudad:', ciudad);
  console.log('🏷️ Referidor:', referidor);

  // Validación básica
  if (!nombre || !email || !telefono || !direccion || !ciudad) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  const cliente = {
    nombre: nombre,
    email: email,
    direccion: direccion,
    telefono: telefono,
    ciudad: ciudad,
    referidor: referidor
  };

  // Preparar datos para Supabase
  const orderNumber = `BL-${Date.now().toString().slice(-6)}`;
  const pedido = {
    cliente_nombre: cliente.nombre,
    cliente_email: cliente.email,
    cliente_telefono: cliente.telefono,
    direccion: cliente.direccion,
    ciudad: cliente.ciudad,
    referidor: cliente.referidor,
    productos: appState.cart.items,
    total: appState.cart.getTotal(),
    estado: 'pendiente',
    numero_orden: orderNumber
  };

  // Guardar en Supabase (opcional)
  guardarPedidoEnSupabase(pedido).then(guardado => {
    if (guardado) {
      console.log('✅ Pedido guardado en Supabase');
    } else {
      console.warn('⚠️ No se pudo guardar en Supabase, continuando...');
    }
  });

  // Enviar correo
  enviarOrdenPorCorreo(cliente, appState.cart.items, appState.cart.getTotal())
    .then(emailSuccess => {
      if (!emailSuccess) {
        alert("Error al enviar el correo");
        return;
      }

      console.log("📧 Pedido enviado correctamente");

      // Cerrar formulario y mostrar confirmación
      document.getElementById("checkoutForm").classList.add("hidden");
      document.getElementById("confirmationModal")?.classList.remove("hidden");

      // Generar URL de Wompi
      const total = appState.cart.getTotal();
      const referidorUrl = cliente.referidor || 'Cliente';
      const montoCentavos = Math.round(total * 100);
      const referenciaCompleta = `${referidorUrl}-${orderNumber}`;
      const referenciaEncoded = encodeURIComponent(referenciaCompleta);
      const url = `https://checkout.wompi.co/l/VPOS_nJo3xk?amount=${montoCentavos}&currency=COP&reference=${referenciaEncoded}`;
      
      console.log('💳 URL de Wompi generada:', url);
      console.log('🏷️ Referidor en URL:', referidorUrl);
      console.log('💰 Total:', total);
      console.log('🔢 Monto en centavos:', montoCentavos);
      console.log('📝 Referencia completa:', referenciaCompleta);
      
      setTimeout(() => {
        window.open(url, '_blank');
        appState.cart.clear();
        actualizarContadorCarrito();
        document.getElementById("confirmationModal")?.classList.add("hidden");
        document.getElementById('formularioCompra')?.reset();
      }, 3000);
    })
    .catch(error => {
      alert("Hubo un error al procesar tu pedido.");
      console.error(error);
    });
}

// Configurar filtros
function configurarFiltros() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const filtro = btn.dataset.filter;
      if (filtro === "todos") {
        renderizarProductos(appState.productos);
      } else {
        const filtrados = appState.productos.filter(p => p.category === filtro);
        renderizarProductos(filtrados);
      }
    });
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando aplicación...');
  
  // Cargar carrito desde localStorage
  appState.cart.load();
  actualizarContadorCarrito();
  
  // Configurar componentes
  configurarCarrito();
  configurarCheckoutForm();
  configurarFiltros();
  
  // Cargar productos
  cargarProductos();
  
  // Configurar formulario de compra - DIRECTO
  const formularioCompra = document.getElementById("formularioCompra");
  if (formularioCompra) {
    formularioCompra.addEventListener("submit", (e) => {
      e.preventDefault();
      procesarPedido();
    });
  }
  
  // Actualizar año
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
