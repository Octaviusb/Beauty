// script.js - Versión corregida

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

// Mover la función configurarBotonCarrito al principio
function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const cartModal = document.getElementById('carrito-modal');
  const closeCart = document.querySelector('.close-cart');
  const limpiarBtn = document.getElementById('limpiarCarrito');
  const finalizarBtn = document.getElementById('finalizarCompra');

  // Función para abrir el carrito
  const abrirCarrito = () => {
    mostrarCarrito();
    cartModal.classList.remove('hidden');
    cartModal.classList.add('active');
  };

  // Función para cerrar el carrito
  const cerrarCarrito = () => {
    cartModal.classList.remove('active');
    cartModal.classList.add('hidden');
  };

  // Configurar el botón de finalizar compra
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Cerrar el carrito
      cerrarCarrito();
      
      // Abrir el formulario de checkout
      const checkoutForm = document.getElementById('checkoutForm');
      if (checkoutForm) {
        checkoutForm.classList.remove('hidden');
        checkoutForm.classList.add('active');
        
        // Enfocar el primer campo del formulario
        const firstInput = checkoutForm.querySelector('input, select, textarea');
        if (firstInput) {
          firstInput.focus();
        }
      } else {
        console.error('❌ No se encontró el formulario de checkout');
      }
    });
  }

function actualizarContadorCarrito() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;
  const totalItems = appState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  countSpan.textContent = totalItems;
}

function mostrarCarrito() {
  const modal = document.getElementById('carrito-modal'); // Cambiado a 'carrito-modal'
  
  // Verificación de elementos existentes
  if (!modal) {
    console.error('❌ No se encontró el modal del carrito');
    return;
  }

  const lista = modal.querySelector('.cart-items');
  const total = modal.querySelector('.total-amount');

  if (!lista || !total) {
    console.error('❌ Elementos internos del carrito no encontrados');
    return;
  }

  lista.innerHTML = '';

  if (appState.cart.items.length === 0) {
    lista.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
    total.textContent = '$0.00';
  } else {
    appState.cart.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">Cantidad: ${item.quantity}</span>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        <button class="remove-item" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      itemElement.querySelector('.remove-item').addEventListener('click', (e) => {
        e.stopPropagation();
        appState.cart.removeItem(item.id);
        mostrarCarrito();
        actualizarContadorCarrito();
      });
      
      lista.appendChild(itemElement);
    });

    total.textContent = `$${appState.cart.getTotal().toLocaleString()}`;
  }

  // Mostrar el modal
  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.setAttribute('aria-modal', 'true');
  document.body.style.overflow = 'hidden';
}

function renderizarProductos(productos) {
  const contenedor = document.getElementById('product-list');
  console.log("🛠 Renderizando productos...", productos);
  if (!contenedor) {
    console.error('❌ No se encontró el contenedor de productos');
    return;
  }

  contenedor.innerHTML = '';

  productos.forEach((producto, index) => {
    if (!producto || !producto.id || (!producto.name && !producto.nombre) || (!producto.price && !producto.precio)) {
      console.warn(`⚠️ Producto inválido en índice ${index}:`, producto);
      return;
    }

    const id = producto.id;
    const nombre = producto.name || producto.nombre;
    const precio = producto.price || producto.precio;
    const imagen = producto.image || producto.imagen || 'placeholder.jpg';
    const descripcion = producto.description || producto.descripcion || '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${imagen}" alt="${nombre}" loading="lazy">
      </div>
      <div class="product-info">
        <h3 class="product-title">${nombre}</h3>
        <p class="product-description">${descripcion}</p>
        <div class="product-price">$${precio.toLocaleString()}</div>
        <button class="add-to-cart" data-id="${id}" data-nombre="${nombre}" data-precio="${precio}">Agregar</button>
      </div>
    `;

    const btn = card.querySelector('.add-to-cart');
    if (btn) {
      btn.addEventListener('click', () => {
        appState.cart.addItem({ id, name: nombre, price: Number(precio) });
        actualizarContadorCarrito();

        const mensaje = document.createElement('div');
        mensaje.textContent = `✅ ${nombre} agregado al carrito`;
        mensaje.className = 'carrito-notificacion';
        document.body.appendChild(mensaje);
        setTimeout(() => mensaje.remove(), 2000);
      });
    }

    contenedor.appendChild(card);
  });
}

async function cargarProductos() {
  try {
    const baseURL = window.location.origin;
    const response = await fetch(`${baseURL}/api/products`);
    if (!response.ok) throw new Error("Error al cargar productos");
    const productos = await response.json();
    appState.productos = productos;
    renderizarProductos(productos);
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    const contenedor = document.getElementById('product-list');
    if (contenedor) {
      contenedor.innerHTML = '<p class="error-message">No se pudieron cargar los productos.</p>';
    }
  }
}

function enviarOrdenPorCorreo(cliente, productos, total) {
  const productosHTML = productos.map(p => `
    <li>${p.name} (x${p.quantity}) - $${(p.price * p.quantity).toLocaleString()}</li>
  `).join('');

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

// Filtros de categoría
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

// Configuración del formulario de compra
const formularioCompra = document.getElementById("formularioCompra");
if (formularioCompra) {
  formularioCompra.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Procesando...";

    const formData = new FormData(e.target);
    const cliente = {
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      direccion: formData.get("direccion"),
      telefono: formData.get("telefono"),
      referidor: formData.get("referidor") || "No especificado"
    };

    try {
      const emailSuccess = await enviarOrdenPorCorreo(
        cliente,
        appState.cart.items,
        appState.cart.getTotal()
      );

      if (!emailSuccess) throw new Error("Fallo al enviar el correo");

      document.getElementById("checkoutForm").classList.add("hidden");
      document.getElementById("confirmationModal").classList.remove("hidden");

      const total = appState.cart.getTotal();
      const url = `https://checkout.wompi.co/l/VPOS_nJo3xk?amount=${total * 100}&currency=COP`;
      
      setTimeout(() => {
        window.open(url, '_blank');
        appState.cart.clear();
        actualizarContadorCarrito();
        document.getElementById("confirmationModal").classList.add("hidden");
        formularioCompra.reset();
      }, 3000);
    } catch (error) {
      alert("Hubo un error al procesar tu pedido.");
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
  appState.cart.load();
  actualizarContadorCarrito();
  configurarBotonCarrito(); // Ahora está definida antes de ser llamada
  cargarProductos();
});
