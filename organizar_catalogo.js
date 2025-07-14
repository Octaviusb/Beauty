const fs = require('fs');
const path = require('path');

// Función para generar un slug amigable para URL a partir de un string
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Reemplazar espacios con -
    .replace(/[^\w\-]+/g, '')       // Remover caracteres no válidos
    .replace(/\-\-+/g, '-')         // Reemplazar múltiples - con uno solo
    .replace(/^-+/, '')             // Quitar - del inicio
    .replace(/-+$/, '');            // Quitar - del final
}

// Rutas de los archivos
const productosJsonPath = path.join(__dirname, 'productos.json');
const publicFolderPath = path.join(__dirname, 'public');

try {
  // 1. Leer el archivo productos.json
  const productosData = fs.readFileSync(productosJsonPath, 'utf8');
  const productos = JSON.parse(productosData);
  console.log(`Se encontraron ${productos.length} productos en total.`);

  // 2. Procesar y eliminar productos duplicados
  const productosUnicos = [];
  const idsVistos = new Set();
  for (const producto of productos) {
    if (!idsVistos.has(producto.id)) {
      productosUnicos.push(producto);
      idsVistos.add(producto.id);
    }
  }
  console.log(`Se encontraron ${productosUnicos.length} productos únicos. Se eliminaron ${productos.length - productosUnicos.length} duplicados.`);

  // 3. Iterar sobre cada producto para renombrar la imagen y actualizar la ruta
  productosUnicos.forEach(producto => {
    // Omitir la categoría 'esmaltes' que ya fue procesada
    if (producto.category === 'esmaltes') {
      console.log(`- Omitiendo esmalte: ${producto.name}`);
      return;
    }

    if (!producto.image || typeof producto.image !== 'string') {
        console.warn(`- Producto con ID ${producto.id} ('${producto.name}') no tiene una ruta de imagen válida. Omitiendo.`);
        return;
    }

    const oldImagePath = path.join(publicFolderPath, producto.image);
    const imageExtension = path.extname(producto.image);
    
    // Generar un nuevo nombre descriptivo
    const newImageName = `${slugify(producto.name)}${imageExtension}`;
    
    // Construir la nueva ruta
    const newImagePathInJson = path.join('images', producto.category, newImageName).replace(/\\/g, '/');
    const newImageFullPath = path.join(publicFolderPath, newImagePathInJson);

    try {
      // Verificar si el archivo de imagen antiguo existe antes de renombrar
      if (fs.existsSync(oldImagePath)) {
        // Renombrar el archivo físico
        fs.renameSync(oldImagePath, newImageFullPath);
        console.log(`✅ Renombrado: ${path.basename(oldImagePath)} -> ${newImageName}`);
        
        // Actualizar la ruta de la imagen en el objeto del producto
        producto.image = newImagePathInJson;
      } else {
        // Si el archivo no existe, puede que ya haya sido renombrado o la ruta es incorrecta
        // Verificamos si el nuevo archivo ya existe
        if (fs.existsSync(newImageFullPath)) {
            console.log(`- La imagen para '${producto.name}' ya parece estar renombrada a '${newImageName}'. Actualizando JSON.`);
            producto.image = newImagePathInJson;
        } else {
            console.warn(`- No se encontró el archivo de imagen: ${oldImagePath}. No se pudo renombrar.`);
        }
      }
    } catch (renameError) {
      console.error(`❌ Error al renombrar ${oldImagePath}:`, renameError.message);
    }
  });

  // 4. Guardar el archivo 'productos.json' actualizado
  fs.writeFileSync(productosJsonPath, JSON.stringify(productosUnicos, null, 2), 'utf8');
  console.log('\n🎉 Proceso completado. El archivo productos.json ha sido limpiado y actualizado con las nuevas rutas de imágenes.');

} catch (error) {
  console.error('❌ Ocurrió un error general durante el proceso:', error);
}