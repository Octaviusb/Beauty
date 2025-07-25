// Script para sincronizar la base de datos con el archivo JSON
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Rutas de archivos
const PRODUCTS_JSON_PATH = path.join(__dirname, 'public', 'productos.json');

// Crear cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lsxojnbkbqhuwaydiqqb.supabase.co',
  process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG9qbmJrYnFodXdheWRpcXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYzMzAsImV4cCI6MjA2ODA4MjMzMH0.uHQJ_F3NmeM2U4EsIq_UFSPMKd35MlMZnrboKOIy45g'
);

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
    console.log(`✅ ${products.length} productos guardados en JSON`);
    return true;
  } catch (error) {
    console.error('Error saving products to JSON:', error);
    return false;
  }
}

// Función para sincronizar productos de Supabase a JSON
async function syncSupabaseToJson() {
  try {
    console.log('🔄 Sincronizando productos de Supabase a JSON...');
    
    // Obtener productos de Supabase
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
      console.error('❌ Error al obtener productos de Supabase:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No hay productos en Supabase');
      return false;
    }
    
    // Guardar productos en JSON
    return saveProductsToJson(data);
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return false;
  }
}

// Función para sincronizar productos de JSON a Supabase
async function syncJsonToSupabase() {
  try {
    console.log('🔄 Sincronizando productos de JSON a Supabase...');
    
    // Cargar productos desde JSON
    const products = loadProductsFromJson();
    
    if (!products || products.length === 0) {
      console.log('⚠️ No hay productos en el archivo JSON');
      return false;
    }
    
    // Eliminar todos los productos existentes en Supabase
    const { error: deleteError } = await supabase.from('products').delete().neq('id', 0);
    
    if (deleteError) {
      console.error('❌ Error al eliminar productos en Supabase:', deleteError);
      return false;
    }
    
    // Insertar productos desde JSON
    const { error: insertError } = await supabase.from('products').insert(products);
    
    if (insertError) {
      console.error('❌ Error al insertar productos en Supabase:', insertError);
      return false;
    }
    
    console.log(`✅ ${products.length} productos sincronizados a Supabase`);
    return true;
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return false;
  }
}

// Ejecutar sincronización según los argumentos
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--to-json') || args.includes('-j')) {
    // Sincronizar de Supabase a JSON
    await syncSupabaseToJson();
  } else if (args.includes('--to-supabase') || args.includes('-s')) {
    // Sincronizar de JSON a Supabase
    await syncJsonToSupabase();
  } else {
    console.log('Uso: node sincronizar_db.js [--to-json|-j] [--to-supabase|-s]');
    console.log('  --to-json, -j       : Sincronizar de Supabase a JSON');
    console.log('  --to-supabase, -s   : Sincronizar de JSON a Supabase');
  }
  
  process.exit(0);
}

main();