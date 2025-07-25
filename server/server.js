const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env si existe
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv no está instalado, ignorando archivo .env');
}

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
const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'public', 'productos.json');

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

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extraer ID del producto de la URL si existe
    const urlParts = req.url.split('/');
    const productIdIndex = urlParts.indexOf('products') + 1;
    const productId = productIdIndex < urlParts.length ? urlParts[productIdIndex] : null;

    // Rutas para productos
    if (req.url.includes('/api/products')) {
      // GET - Obtener productos
      if (req.method === 'GET') {
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
        
        // Si se solicita un producto específico por ID
        if (productId) {
          const product = getProductById(products, productId);
          if (product) {
            return res.status(200).json(product);
          }
          return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Devolver todos los productos
        if (products.length > 0) {
          return res.status(200).json(products);
        }
        
        return res.status(500).json({ error: 'No se pudieron obtener los productos' });
      }
      
      // POST - Agregar producto
      if (req.method === 'POST') {
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
      }
      
      // PUT - Actualizar producto
      if (req.method === 'PUT' && productId) {
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
      }
      
      // DELETE - Eliminar producto
      if (req.method === 'DELETE' && productId) {
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
      }
    }

    // Ruta para checkout
    if (req.url.includes('/api/checkout')) {
      const paymentLink = 'https://checkout.wompi.co/l/VPOS_nJo3xk';
      return res.status(200).json({ url: paymentLink });
    }

    return res.status(404).json({ error: 'Ruta no encontrada' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
