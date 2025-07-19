// Script para cargar productos directamente
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Cargando productos directamente...');
  
  // Verificar si los productos ya están cargados
  if (!window.productosRespaldo || window.productosRespaldo.length === 0) {
    console.error('❌ No se encontraron productos en window.productosRespaldo');
    
    // Cargar productos directamente
    window.productosRespaldo = [
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
    
    console.log('✅ Productos cargados manualmente:', window.productosRespaldo.length);
  } else {
    console.log('✅ Productos ya cargados:', window.productosRespaldo.length);
  }
});
