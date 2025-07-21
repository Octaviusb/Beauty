// Estado global de la aplicación (expuesto globalmente para el filtro)
window.appState = {
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

// Renderizar productos (expuesto globalmente para el filtro)
window.renderizarProductos = function renderizarProductos(productos) {
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
      `<div class='product-card'>
        <div class='product-image-container'>
          <img src='${producto.image}' alt='${producto.name}' class='product-image' loading='lazy'>
          ${producto.badge ? `<span class="product-badge">${producto.badge}</span>` : ''}
        </div>
        <div class='product-info'>
          <h3 class='product-title'>${producto.name}</h3>
          ${producto.description ? `<p class='product-description'>${producto.description}</p>` : ''}
          <div class='product-price'>$${producto.price.toLocaleString()}</div>
          <button class='add-to-cart' data-id='${producto.id}' data-name='${producto.name}' data-price='${producto.price}'>
            Agregar al carrito
          </button>
        </div>
      </div>`
    )).join('');

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
    contenedor.innerHTML = `<p class='error-message'>Error al mostrar los productos: ${error.message}</p>`;
  }
}

// Mostrar carrito
function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal');
  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!modal || !lista || !total) return;

  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    total.textContent = '$0';
  } else {
    appState.cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toLocaleString()}</span>
      `;
      lista.appendChild(itemDiv);
    });
    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
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

// Actualizar contador del carrito
function actualizarContadorCarrito() {
  const count = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = count;
    countElement.style.display = count ? 'inline-block' : 'none';
  }
}

// Cargar productos
function cargarProductos() {
  console.log('🔄 Cargando productos...');
  
  // Usar productos de respaldo primero para mostrar algo rápido mientras carga
  cargarProductosRespaldo();
  
  // Intentar cargar productos desde la API
  fetch('/api/products')
    .then(response => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then(productos => {
      if (Array.isArray(productos) && productos.length > 0) {
        appState.productos = productos;
        console.log('✅ Productos de API cargados:', productos.length);
        renderizarProductos(productos);
        setupFilters();
      } else {
        throw new Error('No se recibieron productos de la API');
      }
    })
    .catch(error => {
      console.error('❌ Error al cargar productos de API:', error);
      // Cargar productos completos directamente
      cargarProductosCompletos();
    });
}

// Cargar productos completos directamente (expuesto globalmente para el filtro)
window.cargarProductosCompletos = async function cargarProductosCompletos() {
  console.log('🔄 Cargando productos completos...');
  
  try {
    // Forzar recarga del JSON para evitar caché
    const timestamp = new Date().getTime();
    const response = await fetch(`/productos.json?t=${timestamp}`);
    if (response.ok) {
      const productos = await response.json();
      if (productos && productos.length > 0) {
        appState.productos = productos;
        console.log('✅ Productos cargados desde JSON:', productos.length);
        renderizarProductos(productos);
        setupFilters();
        return;
      }
    }
  } catch (error) {
    console.error('Error al cargar productos desde JSON:', error);
  }
  
  // Si no se pudo cargar desde JSON, usar la lista de respaldo
  // Nota: Esta lista debe coincidir con productos.json
  const productosCompletos = [
    {
      id: "1",
      name: "Brocha Kabuki",
      category: "accesorios",
      price: 23800,
      description: "Ideal para polvos sueltos",
      image: "images/accesorios/brocha-kabuki.jpg",
      badge: ""
    },
    {
      id: "2",
      name: "Caja de Almacenamiento",
      category: "accesorios",
      price: 44800,
      description: "Para cosméticos y accesorios",
      image: "images/accesorios/caja-de-almacenamiento.jpg",
      badge: ""
    },
    {
      id: "3",
      name: "Cepillo Facial Eléctrico",
      category: "accesorios",
      price: 64400,
      description: "Limpieza profunda",
      image: "images/accesorios/cepillo-facial-elctrico.jpg",
      badge: ""
    },
    {
      id: "4",
      name: "Cinta para Peinar",
      category: "accesorios",
      price: 12600,
      description: "Para rutina facial",
      image: "images/accesorios/cinta-para-peinar.jpg",
      badge: ""
    },
    {
      id: "5",
      name: "Cortaúñas Profesional",
      category: "accesorios",
      price: 16800,
      description: "Acero inoxidable",
      image: "images/accesorios/cortaas-profesional.jpg",
      badge: ""
    },
    {
      id: "6",
      name: "Espejo con Luz LED",
      category: "accesorios",
      price: 58800,
      description: "Ideal para maquillaje",
      image: "images/accesorios/espejo-con-luz-led.jpg",
      badge: "Popular"
    },
    {
      id: "7",
      name: "Esponjas de Maquillaje x3",
      category: "accesorios",
      price: 28000,
      description: "Aplicación uniforme",
      image: "images/accesorios/esponjas-de-maquillaje-x3.jpg",
      badge: ""
    },
    {
      id: "8",
      name: "Guantes de Spa",
      category: "accesorios",
      price: 14000,
      description: "Para manos y pies",
      image: "images/accesorios/guantes-de-spa.jpg",
      badge: ""
    },
    {
      id: "9",
      name: "Lámpara LED/UV",
      category: "accesorios",
      price: 84000,
      description: "Lámpara para secado de uñas",
      image: "images/accesorios/img226.jpg",
      badge: ""
    },
    {
      id: "11",
      name: "Organizador de Maquillaje",
      category: "accesorios",
      price: 49000,
      description: "Acrílico transparente",
      image: "images/accesorios/organizador-de-maquillaje.jpg",
      badge: ""
    },
    {
      id: "12",
      name: "Pinzas de Precisión",
      category: "accesorios",
      price: 21000,
      description: "Para cejas y pestañas",
      image: "images/accesorios/pinzas-de-precisin.jpg",
      badge: ""
    },
    {
      id: "13",
      name: "Set de Brochas 10 piezas",
      category: "accesorios",
      price: 75600,
      description: "Brochas suaves y profesionales",
      image: "images/accesorios/set-de-brochas-10-piezas.jpg",
      badge: "Nuevo"
    },
    {
      id: "14",
      name: "Toalla Desmaquillante",
      category: "accesorios",
      price: 19600,
      description: "Reutilizable y suave",
      image: "images/accesorios/toalla-desmaquillante.jpg",
      badge: ""
    },
    {
      id: "15",
      name: "Esmalte 1",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img1.jpg",
      badge: ""
    },
    {
      id: "16",
      name: "Esmalte 2",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img2.jpg",
      badge: ""
    },
    {
      id: "17",
      name: "Esmalte 3",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img3.jpg",
      badge: ""
    },
    {
      id: "18",
      name: "Esmalte 4",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img4.jpg",
      badge: ""
    },
    {
      id: "19",
      name: "Esmalte 5",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img5.jpg",
      badge: ""
    },
    {
      id: "20",
      name: "Esmalte 6",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img6.jpg",
      badge: ""
    },
    {
      id: "21",
      name: "Esmalte 7",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img7.jpg",
      badge: ""
    },
    {
      id: "22",
      name: "Esmalte 8",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img8.jpg",
      badge: ""
    },
    {
      id: "23",
      name: "Esmalte 9",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img9.jpg",
      badge: ""
    },
    {
      id: "24",
      name: "Esmalte 10",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img10.jpg",
      badge: ""
    },
    {
      id: "25",
      name: "Esmalte 11",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img11.jpg",
      badge: ""
    },
    {
      id: "26",
      name: "Esmalte 12",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img12.jpg",
      badge: ""
    },
    {
      id: "27",
      name: "Esmalte 13",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img13.jpg",
      badge: ""
    },
    {
      id: "28",
      name: "Esmalte 14",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img14.jpg",
      badge: ""
    },
    {
      id: "29",
      name: "Esmalte 15",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img15.jpg",
      badge: ""
    },
    {
      id: "30",
      name: "Esmalte 16",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img16.jpg",
      badge: ""
    },
    {
      id: "31",
      name: "Esmalte 17",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img17.jpg",
      badge: ""
    },
    {
      id: "32",
      name: "Esmalte 18",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img18.jpg",
      badge: ""
    },
    {
      id: "33",
      name: "Esmalte 19",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img19.jpg",
      badge: ""
    },
    {
      id: "34",
      name: "Esmalte 20",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img20.jpg",
      badge: ""
    },
    {
      id: "35",
      name: "Esmalte 21",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img21.jpg",
      badge: ""
    },
    {
      id: "36",
      name: "Esmalte 22",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img22.jpg",
      badge: ""
    },
    {
      id: "37",
      name: "Esmalte 23",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img23.jpg",
      badge: ""
    },
    {
      id: "38",
      name: "Esmalte 24",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img24.jpg",
      badge: ""
    },
    {
      id: "39",
      name: "Gel de Baño",
      category: "higiene",
      price: 29400,
      description: "Gel suave para piel sensible",
      image: "images/higiene/gel-de-bao.jpg",
      badge: ""
    },
    {
      id: "41",
      name: "Maquillaje 1",
      category: "maquillaje",
      price: 35000,
      description: "Producto de maquillaje",
      image: "images/maquillaje/img70.jpg",
      badge: ""
    },
    {
      id: "42",
      name: "Maquillaje 2",
      category: "maquillaje",
      price: 35000,
      description: "Producto de maquillaje",
      image: "images/maquillaje/img71.jpg",
      badge: ""
    },
    {
      id: "43",
      name: "Agua Micelar",
      category: "skincare",
      price: 39200,
      description: "Limpieza sin enjuague",
      image: "images/skincare/agua-micelar.jpg",
      badge: ""
    },
    {
      id: "44",
      name: "Ampollas Reafirmantes",
      category: "skincare",
      price: 75000,
      description: "Tratamiento intensivo para piel madura",
      image: "images/skincare/ampollas-reafirmantes.jpg",
      badge: ""
    },
    {
      id: "45",
      name: "Contorno de Ojos",
      category: "skincare",
      price: 48000,
      description: "Reduce ojeras y líneas de expresión",
      image: "images/skincare/contorno-de-ojos.jpg",
      badge: ""
    },
    {
      id: "46",
      name: "Crema Antiarrugas",
      category: "skincare",
      price: 68000,
      description: "Combate los signos de la edad",
      image: "images/skincare/crema-antiarrugas.jpg",
      badge: ""
    },
    {
      id: "47",
      name: "Crema de Día",
      category: "skincare",
      price: 45000,
      description: "Hidratación diaria para todo tipo de piel",
      image: "images/skincare/crema-de-da.jpg",
      badge: ""
    },
    {
      id: "48",
      name: "Crema de Noche",
      category: "skincare",
      price: 52000,
      description: "Regeneración nocturna intensiva",
      image: "images/skincare/crema-de-noche.jpg",
      badge: ""
    },
    {
      id: "50",
      name: "Exfoliante Facial",
      category: "skincare",
      price: 42000,
      description: "Elimina células muertas",
      image: "images/skincare/exfoliante-facial.jpg",
      badge: ""
    },
    {
      id: "51",
      name: "Mascarilla Purificante",
      category: "skincare",
      price: 38000,
      description: "Limpieza profunda de poros",
      image: "images/skincare/mascarilla-purificante.jpg",
      badge: ""
    },
    {
      id: "52",
      name: "Protector Solar",
      category: "skincare",
      price: 55000,
      description: "SPF 50+ para uso diario",
      image: "images/skincare/protector-solar.jpg",
      badge: "Popular"
    },
    {
      id: "53",
      name: "Serum Antioxidante",
      category: "skincare",
      price: 65000,
      description: "Con vitamina C para luminosidad",
      image: "images/skincare/serum-antioxidante.jpg",
      badge: ""
    },
    {
      id: "54",
      name: "Serum Hidratante",
      category: "skincare",
      price: 58000,
      description: "Con ácido hialurónico",
      image: "images/skincare/serum-hidratante.jpg",
      badge: ""
    },
    {
      id: "55",
      name: "Tónico Facial",
      category: "skincare",
      price: 32000,
      description: "Equilibra el pH de la piel",
      image: "images/skincare/tnico-facial.jpg",
      badge: ""
    },
    {
      id: "56",
      name: "Kit de Uñas 1",
      category: "uñas",
      price: 28000,
      description: "Kit completo para manicura",
      image: "images/uñas/img194.jpg",
      badge: ""
    },
    {
      id: "57",
      name: "Kit de Uñas 2",
      category: "uñas",
      price: 32000,
      description: "Kit profesional para uñas",
      image: "images/uñas/img195.jpg",
      badge: ""
    },
    {
      id: "58",
      name: "Kit de Uñas 3",
      category: "uñas",
      price: 35000,
      description: "Kit completo para uñas acrílicas",
      image: "images/uñas/img196.jpg",
      badge: ""
    },
    {
      id: "59",
      name: "Kit de Uñas 4",
      category: "uñas",
      price: 42000,
      description: "Kit profesional para uñas de gel",
      image: "images/uñas/img197.jpg",
      badge: "Nuevo"
    },
    {
      id: "60",
      name: "Kit de Uñas 5",
      category: "uñas",
      price: 38000,
      description: "Kit completo para nail art",
      image: "images/uñas/img203.jpg",
      badge: ""
    },
    {
      id: "61",
      name: "Kit de Uñas 6",
      category: "uñas",
      price: 45000,
      description: "Kit profesional para decoración de uñas",
      image: "images/uñas/img204.jpg",
      badge: ""
    }
  ];
  
  appState.productos = productosCompletos;
  console.log('✅ Productos completos cargados:', appState.productos.length);
  renderizarProductos(productosCompletos);
  setupFilters();
}

// Productos de respaldo
function cargarProductosRespaldo() {
  console.log('🚨 Cargando productos de respaldo...');
  
  // Datos de productos de respaldo
  const productosRespaldo = [
    {
      id: "1",
      name: "Brocha Kabuki",
      category: "accesorios",
      price: 23800,
      description: "Ideal para polvos sueltos",
      image: "images/accesorios/brocha-kabuki.jpg",
      badge: ""
    },
    {
      id: "2",
      name: "Caja de Almacenamiento",
      category: "accesorios",
      price: 44800,
      description: "Para cosméticos y accesorios",
      image: "images/accesorios/caja-de-almacenamiento.jpg",
      badge: ""
    },
    {
      id: "3",
      name: "Cepillo Facial Eléctrico",
      category: "accesorios",
      price: 64400,
      description: "Limpieza profunda",
      image: "images/accesorios/cepillo-facial-elctrico.jpg",
      badge: ""
    },
    {
      id: "15",
      name: "Esmalte 1",
      category: "esmaltes",
      price: 7000,
      description: "Color y brillo intenso",
      image: "images/esmaltes/img1.jpg",
      badge: ""
    },
    {
      id: "39",
      name: "Gel de Baño",
      category: "higiene",
      price: 29400,
      description: "Gel suave para piel sensible",
      image: "images/higiene/gel-de-bao.jpg",
      badge: ""
    },
    {
      id: "41",
      name: "Maquillaje 1",
      category: "maquillaje",
      price: 35000,
      description: "Producto de maquillaje",
      image: "images/maquillaje/img70.jpg",
      badge: ""
    },
    {
      id: "43",
      name: "Agua Micelar",
      category: "skincare",
      price: 39200,
      description: "Limpieza sin enjuague",
      image: "images/skincare/agua-micelar.jpg",
      badge: ""
    }
  ];
  
  appState.productos = productosRespaldo;
  console.log('✅ Productos de respaldo cargados:', appState.productos.length);
  renderizarProductos(productosRespaldo);
  setupFilters();
}

// Configurar filtros
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
      appState.cart.clear();
      actualizarContadorCarrito();
      mostrarCarrito();
    });
  }

  if (finalizarCompraBtn) {
    finalizarCompraBtn.addEventListener('click', mostrarFormularioPedido);
  }
}

// Mostrar formulario de pedido
function mostrarFormularioPedido() {
  console.log('🧾 Mostrando formulario de pedido');
  const checkoutForm = document.getElementById('checkoutForm');
  const summaryItems = checkoutForm.querySelector('.summary-items');
  const subtotalElement = checkoutForm.querySelector('.subtotal-amount');
  const shippingElement = checkoutForm.querySelector('.shipping-amount');
  const totalElement = checkoutForm.querySelector('.total-amount');
  
  // Cerrar el modal del carrito
  cerrarCarrito();
  
  // Llenar el resumen del pedido
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
  
  // Calcular totales
  const subtotal = appState.cart.getTotal();
  const shipping = subtotal > 200000 ? 0 : 12000; // Envío gratis para compras mayores a $200,000
  const total = subtotal + shipping;
  
  // Actualizar montos en el formulario
  subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
  shippingElement.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`;
  totalElement.textContent = `$${total.toLocaleString()}`;
  
  // Mostrar el formulario
  checkoutForm.classList.remove('hidden');
  checkoutForm.classList.add('active');
  checkoutForm.setAttribute('aria-modal', 'true');
  
  // Configurar eventos del formulario
  configurarFormularioPedido();
}

// Configurar eventos del formulario de pedido
function configurarFormularioPedido() {
  const checkoutForm = document.getElementById('checkoutForm');
  const closeFormBtn = checkoutForm.querySelector('.close-form');
  const backToCartBtn = checkoutForm.querySelector('.btn-back-to-cart');
  const formulario = document.getElementById('formularioCompra');
  
  // Cerrar formulario
  if (closeFormBtn) {
    closeFormBtn.addEventListener('click', () => {
      checkoutForm.classList.remove('active');
      checkoutForm.classList.add('hidden');
      checkoutForm.setAttribute('aria-modal', 'false');
    });
  }
  
  // Volver al carrito
  if (backToCartBtn) {
    backToCartBtn.addEventListener('click', () => {
      checkoutForm.classList.remove('active');
      checkoutForm.classList.add('hidden');
      mostrarCarrito();
    });
  }
  
  // Enviar formulario
  if (formulario) {
    formulario.addEventListener('submit', procesarPedido);
  }
}

// Procesar pedido
function procesarPedido(event) {
  event.preventDefault();
  console.log('🛒 Procesando pedido...');
  
  try {
    // Obtener datos del formulario
    const formulario = document.getElementById('formularioCompra');
    const nombre = formulario.querySelector('#nombre').value;
    const email = formulario.querySelector('#email').value;
    const telefono = formulario.querySelector('#telefono').value;
    const direccion = formulario.querySelector('#direccion').value;
    const ciudad = formulario.querySelector('#ciudad').value;
    const referidor = formulario.querySelector('#referidor')?.value || '';
    
    // Validar datos básicos
    if (!nombre || !email || !telefono || !direccion || !ciudad) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    
    // Calcular totales
    const subtotal = appState.cart.getTotal();
    const shipping = subtotal > 200000 ? 0 : 12000;
    const total = subtotal + shipping;
    
    // Generar número de pedido
    const orderNumber = `BL-${Date.now().toString().slice(-6)}`;
    
    // Preparar datos del carrito para el correo
    const carrito = appState.cart.items.map(item => `${item.quantity}x ${item.name} ($${item.price.toLocaleString()})`).join(", ");
    
    // Enviar correo con los datos del pedido usando EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.send("service_owxur5f", "template_sck7rdl", {
        nombre,
        email,
        telefono,
        direccion: `${direccion}, ${ciudad}`,
        referidor,
        metodo_pago: 'Wompi',
        total: total.toLocaleString(),
        carrito,
        referencia: orderNumber
      }, "Cqwg1EyqFLvPg7ULx")
      .then(function(response) {
        console.log("📧 Pedido enviado correctamente");
        
        // Cerrar formulario de checkout
        const checkoutForm = document.getElementById('checkoutForm');
        checkoutForm.classList.remove('active');
        checkoutForm.classList.add('hidden');
        
        // Mostrar modal de Wompi
        mostrarModalWompi(total, orderNumber);
      })
      .catch(function(error) {
        console.error("❌ Error al enviar correo:", error);
        alert("Hubo un error al procesar el pedido. Por favor, intenta nuevamente.");
      });
    } else {
      console.error('❌ EmailJS no está disponible');
      alert("Error al procesar el pedido: El servicio de correo no está disponible. Por favor, intenta nuevamente.");
    }
  } catch (error) {
    console.error('❌ Error en procesarPedido:', error);
    alert("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
  }
}

// Mostrar modal de Wompi
function mostrarModalWompi(total, orderNumber) {
  console.log('💳 Preparando pago con Wompi...');
  
  // Crear un modal con instrucciones para Wompi
  const wompiModal = document.createElement('div');
  wompiModal.className = 'modal active';
  wompiModal.id = 'wompiModal';
  wompiModal.innerHTML = `
    <div class="modal-content payment-modal">
      <button class="close-modal" aria-label="Cerrar">&times;</button>
      <h2>Pago con Wompi</h2>
      <div class="payment-info">
        <p>A continuación serás redirigido a Wompi para completar tu pago.</p>
        <div class="payment-details">
          <p><strong>Monto a pagar:</strong> $${total.toLocaleString()}</p>
          <p><strong>Número de pedido:</strong> ${orderNumber}</p>
          <p class="important-note">IMPORTANTE: Por favor ingresa exactamente el monto indicado arriba. Cualquier inconsistencia impedirá que el pedido sea despachado.</p>
        </div>
        <div class="form-actions">
          <button id="btnIrAWompi" class="btn-submit-order">Ir a Wompi</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(wompiModal);
  
  // Configurar el botón para ir a Wompi
  document.getElementById('btnIrAWompi').addEventListener('click', () => {
    // Enlace de Wompi proporcionado
    window.location.href = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
  });
  
  // Configurar el botón de cerrar
  wompiModal.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('wompiModal').remove();
    mostrarConfirmacionPedido(orderNumber);
    
    // Limpiar carrito
    appState.cart.clear();
    actualizarContadorCarrito();
  });
}

// Mostrar confirmación de pedido
function mostrarConfirmacionPedido(orderNumber) {
  const confirmationModal = document.getElementById('confirmationModal');
  const orderNumberElement = document.getElementById('order-number');
  const continuarComprandoBtn = document.getElementById('btn-continue-shopping');
  
  // Actualizar número de pedido
  if (orderNumberElement) {
    orderNumberElement.textContent = orderNumber;
  }
  
  // Mostrar modal
  confirmationModal.classList.remove('hidden');
  confirmationModal.classList.add('active');
  
  // Configurar botón para continuar comprando
  if (continuarComprandoBtn) {
    continuarComprandoBtn.addEventListener('click', () => {
      confirmationModal.classList.remove('active');
      confirmationModal.classList.add('hidden');
    });
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando aplicación...');
  
  // Agregar botón para limpiar caché (solo visible en desarrollo)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const limpiarBtn = document.createElement('button');
    limpiarBtn.textContent = 'Limpiar Caché';
    limpiarBtn.style.position = 'fixed';
    limpiarBtn.style.bottom = '10px';
    limpiarBtn.style.right = '10px';
    limpiarBtn.style.zIndex = '9999';
    limpiarBtn.style.padding = '5px 10px';
    limpiarBtn.style.backgroundColor = '#d63384';
    limpiarBtn.style.color = 'white';
    limpiarBtn.style.border = 'none';
    limpiarBtn.style.borderRadius = '4px';
    limpiarBtn.style.cursor = 'pointer';
    limpiarBtn.style.fontSize = '12px';
    
    limpiarBtn.addEventListener('click', () => {
      localStorage.removeItem('productos');
      localStorage.removeItem('productosCache');
      localStorage.removeItem('lastUpdate');
      window.location.reload(true);
    });
    
    document.body.appendChild(limpiarBtn);
  }
  
  // Cargar productos desde la API primero
  cargarProductos();
  configurarCarrito();
  actualizarContadorCarrito();
  
  // Actualizar año en el footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
});
