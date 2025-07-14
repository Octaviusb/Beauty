const fs = require('fs');

let productos = require('./productos.json');

productos = productos.map(p => ({
  ...p,
  price: Math.round(p.price * 1.4) // Aumenta 40% y redondea
}));

fs.writeFileSync('./productos.json', JSON.stringify(productos, null, 2));

console.log('✅ Precios actualizados en un 40%');
