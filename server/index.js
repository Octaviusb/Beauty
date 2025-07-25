const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno desde .env si existe
try {
  require('dotenv').config();
  console.log('Variables de entorno cargadas desde .env');
} catch (e) {
  console.log('dotenv no está instalado o no se encontró el archivo .env');
}

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Crear cliente de Supabase si las variables de entorno están disponibles
let supabase;
try {
  // Usar variables de entorno o valores predeterminados para desarrollo local
  const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';
  
  if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-supabase-url.supabase.co') {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized with URL:', supabaseUrl);
  } else {
    console.log('Supabase environment variables not found or using placeholder values');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

// Rutas de archivos
const PRODUCTS_JSON_PATH = path.join(__dirname, '..', 'public', 'productos.json');

// Función para cargar productos desde el archivo JSON
function loadProductsFromJson() {
  try {
    if (fs.existsSync(PRODUCTS_JSON_PATH)) {
      const productsData = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');
      return JSON.parse(productsData);
    }
  } catch (error) {
    console.error('Error loading products from JSON:', error);
  }
  return [];
}

// Función para guardar productos en el archivo JSON
function saveProductsToJson(products) {
  try {
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving products to JSON:', error);
    return false;
  }
}

// Función para obtener un producto por ID
function getProductById(products, id) {
  return products.find(p => p.id === Number(id) || p.id === id);
}

// Función para actualizar un producto
function updateProduct(products, id, data) {
  const index = products.findIndex(p => p.id === Number(id) || p.id === id);
  if (index === -1) return false;
  
  products[index] = { ...products[index], ...data };
  return saveProductsToJson(products);
}

// Función para eliminar un producto
function deleteProduct(products, id) {
  const filteredProducts = products.filter(p => p.id !== Number(id) && p.id !== id);
  if (filteredProducts.length === products.length) return false;
  
  return saveProductsToJson(filteredProducts);
}

// Función para agregar un producto
function addProduct(products, data) {
  // Generar un nuevo ID
  const maxId = products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  const newProduct = { ...data, id: maxId + 1 };
  
  products.push(newProduct);
  return saveProductsToJson(products) ? newProduct : null;
}

// Middleware de autenticación para rutas de administración
const API_SECRET = 'super-secret-key';
const authMiddleware = (req, res, next) => {
  // Se aplica solo a POST, PUT, DELETE
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const secret = req.get('X-Admin-Secret');
    if (secret === API_SECRET) {
      return next();
    }
    return res.status(403).json({ error: 'No autorizado' });
  }
  // Para otros métodos (GET), no se requiere autenticación
  next();
};

// Rutas para productos
app.get('/api/products', async (req, res) => {
  try {
    // Intentar obtener productos de Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          return res.status(200).json(data);
        }
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }
    
    // Si no hay Supabase o hay error, usar el archivo JSON
    const products = loadProductsFromJson();
    
    // Devolver todos los productos
    if (products.length > 0) {
      return res.status(200).json(products);
    }
    
    return res.status(500).json({ error: 'No se pudieron obtener los productos' });
  } catch (err) {
    console.error('Error al obtener productos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Intentar obtener producto de Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
        if (!error && data) {
          return res.status(200).json(data);
        }
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }
    
    // Si no hay Supabase o hay error, usar el archivo JSON
    const products = loadProductsFromJson();
    const product = getProductById(products, productId);
    
    if (product) {
      return res.status(200).json(product);
    }
    
    return res.status(404).json({ error: 'Producto no encontrado' });
  } catch (err) {
    console.error('Error al obtener producto:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    
    // Intentar agregar a Supabase primero
    if (supabase) {
      try {
        const { data: newProduct, error } = await supabase.from('products').insert(data).select();
        if (!error && newProduct) {
          return res.status(201).json(newProduct[0]);
        }
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }
    
    // Si no hay Supabase o hay error, usar el archivo JSON
    const products = loadProductsFromJson();
    const newProduct = addProduct(products, data);
    
    if (newProduct) {
      return res.status(201).json(newProduct);
    }
    
    return res.status(500).json({ error: 'Error al agregar producto' });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    
    // Intentar actualizar en Supabase primero
    if (supabase) {
      try {
        const { error } = await supabase.from('products').update(data).eq('id', productId);
        if (!error) {
          return res.status(200).json({ message: 'Producto actualizado' });
        }
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }
    
    // Si no hay Supabase o hay error, usar el archivo JSON
    const products = loadProductsFromJson();
    const success = updateProduct(products, productId, data);
    
    if (success) {
      return res.status(200).json({ message: 'Producto actualizado' });
    }
    
    return res.status(500).json({ error: 'Error al actualizar producto' });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Intentar eliminar en Supabase primero
    if (supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (!error) {
          return res.status(200).json({ message: 'Producto eliminado' });
        }
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }
    
    // Si no hay Supabase o hay error, usar el archivo JSON
    const products = loadProductsFromJson();
    const success = deleteProduct(products, productId);
    
    if (success) {
      return res.status(200).json({ message: 'Producto eliminado' });
    }
    
    return res.status(404).json({ error: 'Producto no encontrado' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Importar ruta de sincronización
const syncRoutes = require('./routes/sync');

// Usar rutas de sincronización
app.use('/api', syncRoutes);

// Ruta para checkout
app.get('/api/checkout', (req, res) => {
  const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
  return res.status(200).json({ url: paymentLink });
});

// Ruta para cualquier otra solicitud (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});