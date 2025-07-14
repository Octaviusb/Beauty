const fs = require('fs');
const path = require('path');

const productosJsonPath = path.join(__dirname, 'productos.json');

try {
    // Leer el archivo productos.json
    const productosData = fs.readFileSync(productosJsonPath, 'utf8');
    let productos = JSON.parse(productosData);
    console.log(`Se encontraron ${productos.length} productos en total antes de la limpieza.`);

    // Filtrar para excluir la categoría 'uñas'
    const productosLimpios = productos.filter(p => p.category !== 'uñas');
    
    const eliminados = productos.length - productosLimpios.length;
    console.log(`Se eliminaron ${eliminados} productos de la categoría 'uñas'.`);
    console.log(`Quedan ${productosLimpios.length} productos en el catálogo.`);

    // Guardar el archivo 'productos.json' actualizado
    fs.writeFileSync(productosJsonPath, JSON.stringify(productosLimpios, null, 2), 'utf8');
    console.log('\n🎉 Proceso completado. El archivo productos.json ha sido actualizado y los productos de la categoría "uñas" han sido eliminados.');

} catch (error) {
    console.error('❌ Ocurrió un error durante el proceso de limpieza:', error);
}