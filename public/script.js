// 📦 script.js cargado con defer
console.log("📦 script.js cargado con defer");

// 1. Estado global
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
      this.showFeedback(item.name);
    },

    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
    },

    clear() {
      this.items = [];
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
    }
  },
  productos: [],
  currentFilter: 'all'
};

// 2. Renderizar productos
function renderizarProductos(productos) {
  console.log('📊 Renderizando productos:', productos?.length || 0);
  const contenedor = document.getElementById('product-list');
  if (!contenedor) {
    console.error('❌ Contenedor de productos no encontrado');
    return;
  }

  if (!productos || productos.length === 0) {
    console.warn('⚠️ No hay productos para mostrar');
    contenedor.innerHTML = "<p class='info-message'>No hay productos disponibles en este momento.</p>";
    return;
  }

  const productosFiltrados = appState.currentFilter === 'all' 
    ? productos 
    : productos.filter(p => p.category === appState.currentFilter);
  
  console.log('🔍 Productos filtrados:', productosFiltrados.length, 'Filtro actual:', appState.currentFilter);

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
        appState.cart.addItem(productData);
        actualizarContadorCarrito();
      });
    });
    
    console.log('✅ Eventos de botones configurados');
  } catch (error) {
    console.error('❌ Error al renderizar productos:', error);
    contenedor.innerHTML = "<p class='error-message'>Error al mostrar los productos: " + error.message + "</p>";
  }
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!modal || !lista || !total) return;

  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    total.textContent = '$0.00';
  } else {
    appState.cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      lista.appendChild(itemDiv);
    });
    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
}

function cerrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
}

function actualizarContadorCarrito() {
  const count = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = count;
    countElement.style.display = count ? 'inline-block' : 'none';
  }
}

// Cargar productos desde Supabase con respaldo estático
async function cargarProductos() {
  console.log('🔄 Intentando cargar productos desde Supabase...');
  
  try {
    // Mostrar productos estáticos inmediatamente mientras se cargan los de Supabase
    if (typeof productosEstaticos !== 'undefined' && Array.isArray(productosEstaticos)) {
      appState.productos = productosEstaticos;
      console.log('📡 Mostrando productos estáticos mientras se cargan los reales');
      renderizarProductos(productosEstaticos);
      setupFilters();
    }
    
    // Intentar cargar productos desde la API
    const response = await fetch('/api/products');
    console.log('📊 Estado de respuesta:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    const productos = await response.json();
    
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new Error('No se recibieron productos válidos');
    }
    
    // Actualizar con los productos reales de Supabase
    appState.productos = productos;
    console.log('✅ Productos de Supabase cargados:', productos.length);
    renderizarProductos(productos);
    setupFilters();
    
  } catch (error) {
    console.error('❌ Error al cargar productos de Supabase:', error);
    
    // Si ya se mostraron los productos estáticos, no hacer nada más
    if (appState.productos.length > 0) {
      console.log('🚨 Manteniendo productos estáticos ya mostrados');
      return;
    }
    
    // Si no hay productos estáticos, usar respaldo
    console.warn('⚠️ Usando productos de respaldo');
    cargarProductosRespaldo();
  }
}

// Función de respaldo para cargar productos
function cargarProductosRespaldo() {
  console.log('🚨 Cargando productos de respaldo...');
  
  // Datos de productos de respaldo
  const productosRespaldo = [
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
  
  appState.productos = productosRespaldo;
  console.log('✅ Productos de respaldo cargados:', appState.productos.length);
  renderizarProductos(productosRespaldo);
  setupFilters();
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      appState.currentFilter = btn.dataset.filter;
      renderizarProductos(appState.productos);
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const cartModal = document.getElementById('carrito-modal');

  if (cartButton) {
    cartButton.addEventListener('click', () => {
      mostrarCarrito();
    });
  }
}

// 💳 Redirección a página de pago
function redirigirAWompi(monto, nombreCliente) {
  console.log('💳 Iniciando proceso de pago');
  console.log('💰 Monto:', monto);

  if (!monto) {
    console.error('❌ Falta el monto para el pago');
    alert("No se pudo iniciar el pago: datos incompletos.");
    return;
  }

  try {
    // Redireccionar a la página de pago intermedia
    const pagoUrl = `/pago.html?monto=${monto}&nombre=${encodeURIComponent(nombreCliente || '')}`;
    
    console.log('✅ Redirigiendo a página de pago:', pagoUrl);
    window.location.href = pagoUrl;
    
  } catch (error) {
    console.error('🚫 Error de redirección:', error);
    alert("Ocurrió un error inesperado al procesar el pago. Por favor, intenta nuevamente.");
  }
}


// DOMContentLoaded


// 📧 Envío del formulario y redirección

document.addEventListener("DOMContentLoaded", () => {
  appState.cart.items = [];
  actualizarContadorCarrito();
  configurarCarrito();
  cargarProductos();

  const columna = document.querySelector(".form-column");
  if (columna) {
    columna.insertAdjacentHTML("beforeend", `
      <div class="form-group">
        <label for="referidor">Nombre del Referidor*</label>
        <input type="text" id="referidor" name="referidor" required autocomplete="off">
      </div>
    `);
  }

  const finalizarBtn = document.getElementById('finalizarCompra');
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', () => {
      const modalCarrito = document.getElementById('carrito-modal');
      const formulario = document.getElementById('checkoutForm');

      modalCarrito.classList.remove('active');
      modalCarrito.classList.add('hidden');

      formulario.classList.remove('hidden');
      formulario.classList.add('active');
    });
  }

  const formulario = document.getElementById('formularioCompra');
  if (formulario) {
    formulario.addEventListener('submit', function(e) {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const telefono = document.getElementById('telefono').value;
      const direccion = document.getElementById('direccion').value;
      const ciudad = document.getElementById('ciudad').value;
      const referidor = document.getElementById('referidor').value;
      const metodo_pago = document.querySelector('input[name="payment-method"]:checked').value;
      const carrito = appState.cart.items.map(item => `${item.quantity}x ${item.name} ($${item.price})`).join(", ");
      const total = appState.cart.getTotal();

      emailjs.send("service_owxur5f", "template_sck7rdl", {
        nombre,
        email,
        telefono,
        direccion,
        ciudad,
        referidor,
        metodo_pago,
        total: total.toFixed(2),
        carrito
      }, "Cqwg1EyqFLvPg7ULx")
      .then(function(response) {
        console.log("📧 Pedido enviado:", response.status, response.text);
        redirigirAWompi(total, nombre);
      }, function(error) {
        console.error("❌ Error al enviar correo:", error);
        alert("Hubo un error al enviar tu pedido. Por favor, intenta nuevamente.");
      });
    });
  }
});
