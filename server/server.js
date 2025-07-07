//console.log('1. Iniciando script server.js');
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

// Handlers globales de error
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// 1. Configuración inicial
const app = express();
const PORT = process.env.PORT || 3000;
console.log('3. Configuración inicial de Express y puertos.');

// 2. Conexión a la base de datos
let db;
try {
  db = new Database(path.join(__dirname, 'db.sqlite'), { verbose: console.log });
  db.pragma('journal_mode = WAL');
} catch (err) {
  console.error('¡ERROR CRÍTICO: No se pudo conectar a la base de datos!');
  console.error(err);
  // process.exit(1);
}
console.log('5. Base de datos conectada. Iniciando Middlewares.');

// 3. Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://tudominio.com' : '*'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Headers de seguridad básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Inyectar DB en las rutas
app.use((req, res, next) => {
  req.db = db;
  next();
});
console.log('6. Middlewares configurados.');

console.log('7. Configurando rutas estáticas.');
// 4. Rutas estáticas (¡ORDEN IMPORTANTE!)
app.use(express.static(path.join(__dirname, '../public')));

// Configura el favicon si aún no lo has hecho
app.use('/favicon.ico', express.static(path.join(__dirname, '../public/assets/favicon.ico')));
console.log('8. Rutas estáticas configuradas.');

console.log('9. Configurando rutas de API.');
// 5. Rutas de API
const productsRouter = require('./routes/products');

// Middleware de autenticación para rutas de admin
const API_SECRET = 'super-secret-key'; // ¡Debe coincidir con el de admin.js!

const authMiddleware = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const secret = req.get('X-Admin-Secret');
    if (secret === API_SECRET) {
      return next();
    }
    return res.status(403).json({ error: 'No autorizado' });
  }
  // Para peticiones GET, no se requiere autenticación
  next();
};

app.use('/api/products', authMiddleware, productsRouter);

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

const cartRouter = require('./routes/cart');
app.use('/api/cart', cartRouter);

const authRouter = require('./routes/auth');
app.use('/api', authRouter);
console.log('4. Todas las rutas de API configuradas.');

console.log('11. Configurando manejo de errores.');
// 6. Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en middleware de manejo de errores:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});
console.log('12. Manejo de errores configurado.');

console.log('13. Intentando iniciar el servidor (app.listen).');
// 7. Iniciar servidor
try {
  app.listen(PORT, () => {
    console.log(`14. Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log('15. Callback de listen ejecutado. El servidor debería mantenerse vivo.');
  });
} catch (err) {
  console.error('¡ERROR AL INICIAR EL SERVIDOR (fallo en listen)!');
  console.error(err);
  // process.exit(1);
}

