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

async function cargarProductos() {
  try {
    console.log('🔄 Cargando productos...');
    
    // Intentar cargar productos desde la API
    const response = await fetch('/api/products');
    console.log('📊 Estado de respuesta:', response.status);
    
    if (!response.ok) {
      console.error('❌ Error en la respuesta:', response.status, response.statusText);
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    const productos = await response.json();
    console.log('📦 Productos recibidos:', productos ? (productos.length || 'No es un array') : 'null');
    
    if (!productos || !Array.isArray(productos)) {
      console.error('❌ Formato inválido, no es un array:', productos);
      throw new Error('Formato inválido');
    }
    
    if (productos.length === 0) {
      console.warn('⚠️ No hay productos en la respuesta');
    }
    
    appState.productos = productos;
    console.log('✅ Productos guardados en estado:', appState.productos.length);
    renderizarProductos(productos);
    setupFilters();
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = "<p class='error-message'>No se pudieron cargar los productos. Error: " + error.message + "</p>";
    }
    
    // Cargar productos de respaldo si la API falla
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

// 💳 Redirección a Wompi (versión simplificada)
function redirigirAWompi(monto, nombreCliente) {
  console.log('💳 Iniciando proceso de pago con Wompi');
  console.log('💰 Monto:', monto);

  if (!monto) {
    console.error('❌ Falta el monto para el pago');
    alert("No se pudo iniciar el pago: datos incompletos.");
    return;
  }

  try {
    // Crear URL directa al checkout de Wompi sin usar API ni widget
    const publicKey = "pub_prod_XApVcADEVCLGJnnghUT1V8G3oEwrF7ZW";
    const montoEnCentavos = Math.round(monto * 100);
    const referencia = `pedido_${Date.now()}`;
    
    // URL directa al checkout de Wompi
    const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=COP&amount-in-cents=${montoEnCentavos}&reference=${referencia}&redirect-url=https://beauty-mocha-ten.vercel.app/pedido-confirmado.html`;
    
    console.log('✅ Redirigiendo a Wompi:', checkoutUrl);
    window.location.href = checkoutUrl;
    
  } catch (error) {
    console.error('🚫 Error de redirección a Wompi:', error);
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
