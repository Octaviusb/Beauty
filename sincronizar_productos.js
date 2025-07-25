/**
 * Script para sincronizar productos entre el archivo JSON y Supabase
 * 
 * Este script puede:
 * 1. Subir productos desde el archivo JSON a Supabase
 * 2. Descargar productos desde Supabase al archivo JSON
 * 
 * Uso:
 * - Para subir: node sincronizar_productos.js upload
 * - Para descargar: node sincronizar_productos.js download
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Rutas de archivos
const PRODUCTS_JSON_PATH = path.join(__dirname, 'public', 'productos.json');

// Crear cliente de Supabase
let supabase;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-supabase-url.supabase.co') {
    console.error('Error: Variables de entorno de Supabase no configuradas correctamente');
    console.error('Por favor, configura SUPABASE_URL y SUPABASE_KEY en el archivo .env');
    process.exit(1);
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Cliente de Supabase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar el cliente de Supabase:', error);
  process.exit(1);
}

// Función para cargar productos desde el archivo JSON
function loadProductsFromJson() {
  try {
    if (fs.existsSync(PRODUCTS_JSON_PATH)) {
      const productsData = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');
      return JSON.parse(productsData);
    }
  } catch (error) {
    console.error('Error al cargar productos desde JSON:', error);
  }
  return [];
}

// Función para guardar productos en el archivo JSON
function saveProductsToJson(products) {
  try {
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2));
    return true;
  } catch (error) {
    console.error('Error al guardar productos en JSON:', error);
    return false;
  }
}

// Función para subir productos a Supabase
async function uploadProductsToSupabase() {
  const products = loadProductsFromJson();
  
  if (!products || products.length === 0) {
    console.error('No se encontraron productos en el archivo JSON');
    return;
  }
  
  console.log(`Subiendo ${products.length} productos a Supabase...`);
  
  try {
    // Primero eliminar todos los productos existentes
    const { error: deleteError } = await supabase.from('products').delete().neq('id', 0);
    if (deleteError) {
      console.error('Error al eliminar productos existentes:', deleteError);
      return;
    }
    
    // Luego insertar los nuevos productos
    const { data, error } = await supabase.from('products').insert(products);
    
    if (error) {
      console.error('Error al subir productos a Supabase:', error);
    } else {
      console.log(`✅ ${products.length} productos subidos correctamente a Supabase`);
    }
  } catch (error) {
    console.error('Error inesperado al subir productos:', error);
  }
}

// Función para descargar productos desde Supabase
async function downloadProductsFromSupabase() {
  console.log('Descargando productos desde Supabase...');
  
  try {
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
      console.error('Error al descargar productos desde Supabase:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.error('No se encontraron productos en Supabase');
      return;
    }
    
    console.log(`Descargados ${data.length} productos desde Supabase`);
    
    // Guardar en el archivo JSON
    if (saveProductsToJson(data)) {
      console.log(`✅ ${data.length} productos guardados correctamente en ${PRODUCTS_JSON_PATH}`);
    }
  } catch (error) {
    console.error('Error inesperado al descargar productos:', error);
  }
}

// Función principal
async function main() {
  const action = process.argv[2]?.toLowerCase();
  
  if (!action || (action !== 'upload' && action !== 'download')) {
    console.log('Uso: node sincronizar_productos.js [upload|download]');
    console.log('  - upload: Sube productos desde JSON a Supabase');
    console.log('  - download: Descarga productos desde Supabase a JSON');
    process.exit(1);
  }
  
  if (action === 'upload') {
    await uploadProductsToSupabase();
  } else if (action === 'download') {
    await downloadProductsFromSupabase();
  }
}

// Ejecutar la función principal
main().catch(console.error);