// Productos directos - Solución inmediata
const productosDirectos = [
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

// Función para renderizar productos directamente
function renderizarProductosDirectos() {
  console.log('📊 Renderizando productos directamente');
  const contenedor = document.getElementById('product-list');
  if (!contenedor) {
    console.error('❌ Contenedor de productos no encontrado');
    return;
  }

  try {
    contenedor.innerHTML = productosDirectos.map(producto => (
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

    console.log('✅ Productos renderizados directamente');

    // Configurar eventos de botones
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const productData = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: Number(btn.dataset.price)
        };
        // Añadir al carrito si existe la función
        if (window.appState && window.appState.cart && window.appState.cart.addItem) {
          window.appState.cart.addItem(productData);
          if (window.actualizarContadorCarrito) {
            window.actualizarContadorCarrito();
          }
        } else {
          console.log('Producto agregado:', productData);
        }
      });
    });
  } catch (error) {
    console.error('❌ Error al renderizar productos:', error);
    if (contenedor) {
      contenedor.innerHTML = "<p class='error-message'>Error al mostrar los productos: " + error.message + "</p>";
    }
  }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Cargando productos directamente');
  setTimeout(renderizarProductosDirectos, 500); // Pequeño retraso para asegurar que el DOM esté listo
});