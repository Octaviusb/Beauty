// script.js - versión completa con Supabase, carrito y checkout

import { supabase } from './supabaseClient.js';
import {
  cargarCarrito,
  agregarProductoAlCarrito,
  eliminarProductoDelCarrito,
  limpiarCarrito
} from './carrito-supabase.js';

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
  const { data: productos, error } = await supabase.from('productos').select('*');
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
    btn.addEventListener('click', async () => {
      await agregarProductoAlCarrito({ id: producto.id, name: producto.name, price: Number(producto.price) });
      await actualizarCarrito();
      mostrarNotificacion(`✅ ${producto.name} agregado al carrito`);
    });
    contenedor.appendChild(card);
  });
}

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
  modal.classList.add('active');
}

async function actualizarCarrito() {
  appState.carrito = await cargarCarrito();
  actualizarContadorCarrito();
}

function configurarCarrito() {
  const cartButton = document.getElementById('cartButton');
  const closeCart = document.querySelector('.close-cart');
  const limpiarBtn = document.getElementById('limpiarCarrito');
  const finalizarBtn = document.getElementById('finalizarCompra');
  if (cartButton) cartButton.addEventListener('click', mostrarCarrito);
  if (closeCart) closeCart.addEventListener('click', () => document.getElementById('carrito-modal').classList.add('hidden'));
  if (limpiarBtn) limpiarBtn.addEventListener('click', async () => {
    await limpiarCarrito();
    await actualizarCarrito();
    mostrarCarrito();
  });
  if (finalizarBtn) finalizarBtn.addEventListener('click', () => {
    document.getElementById('carrito-modal').classList.add('hidden');
    mostrarFormularioCheckout();
  });
}

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
  const total = appState.carrito.reduce((s, i) => s + i.price * i.quantity, 0);
  subtotalElement.textContent = `$${total.toLocaleString()}`;
  totalElement.textContent = `$${total.toLocaleString()}`;
  checkoutForm.classList.remove('hidden');
}

function configurarCheckoutForm() {
  const form = document.getElementById('formularioCompra');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const cliente = {
      nombre: formData.get('nombre') || '',
      email: formData.get('email') || '',
      telefono: formData.get('telefono') || '',
      direccion: formData.get('direccion') || '',
      ciudad: formData.get('ciudad') || '',
      referidor: formData.get('referidor') || 'N/A'
    };
    const total = appState.carrito.reduce((s, i) => s + i.price * i.quantity, 0);
    const pedido = {
      cliente_nombre: cliente.nombre,
      cliente_email: cliente.email,
      cliente_telefono: cliente.telefono,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      referidor: cliente.referidor,
      productos: appState.carrito,
      total,
      estado: 'pendiente',
      numero_orden: `BL-${Date.now().toString().slice(-6)}`
    };
    const { error } = await supabase.from('pedidos').insert([pedido]);
    if (error) {
      alert('❌ Error al guardar el pedido');
      return;
    }
    const referencia = encodeURIComponent(`${cliente.referidor}-${pedido.numero_orden}`);
    const url = `https://checkout.wompi.co/l/VPOS_nJo3xk?amount=${Math.round(total * 100)}&currency=COP&reference=${referencia}`;
    setTimeout(() => {
      window.open(url, '_blank');
      limpiarCarrito();
      actualizarCarrito();
      form.reset();
      document.getElementById('checkoutForm')?.classList.add('hidden');
    }, 3000);
  });
}

// Inicialización
window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando aplicación...');
  await cargarProductos();
  await actualizarCarrito();
  configurarCarrito();
  configurarCheckoutForm();
});
