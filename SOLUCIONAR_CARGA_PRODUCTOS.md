# Solución al Problema de Carga de Productos

Este documento explica cómo resolver el problema específico donde los productos no se cargan correctamente desde la base de datos Supabase y se está utilizando una lista local con errores.

## Diagnóstico del Problema

El problema ocurre porque:

1. La aplicación no está conectándose correctamente a Supabase para obtener los productos
2. Al fallar la conexión, está utilizando una lista de productos de respaldo que está desactualizada o contiene errores
3. La función `cargarProductosCompletos()` estaba intentando usar una variable `productosCompletos` que no estaba definida en el ámbito actual

## Soluciones Implementadas

Hemos realizado las siguientes mejoras para solucionar el problema:

1. **Mejora en la carga de productos**:
   - Ahora la aplicación intenta cargar los productos desde la API primero
   - Si falla, intenta cargar desde localStorage (caché)
   - Si no hay caché o está desactualizado, usa la lista de productos definida en el código

2. **Manejo de errores mejorado**:
   - Se agregó un timeout para evitar esperas largas cuando la API no responde
   - Se implementó un sistema de caché en localStorage para tener un respaldo rápido

3. **Configuración de Supabase**:
   - Se agregó soporte para cargar variables de entorno desde un archivo `.env`
   - Se creó un script para sincronizar productos entre el archivo JSON y Supabase

## Pasos para Solucionar el Problema

Sigue estos pasos para asegurarte de que los productos se carguen correctamente:

### 1. Configurar Supabase

1. Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:
   ```
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_KEY=tu-clave-publica
   ```

2. Asegúrate de que tienes una tabla `products` en Supabase con la estructura correcta:
   - `id`: número (primary key)
   - `name`: texto
   - `category`: texto
   - `price`: número
   - `description`: texto
   - `image`: texto (URL de la imagen)
   - `badge`: texto (opcional)

3. Configura las políticas de seguridad en Supabase para permitir operaciones de lectura anónimas.

### 2. Sincronizar los Productos

Puedes elegir una de estas opciones:

**Opción A: Subir productos desde JSON a Supabase**
```bash
npm install
node sincronizar_productos.js upload
```

**Opción B: Descargar productos desde Supabase a JSON**
```bash
npm install
node sincronizar_productos.js download
```

### 3. Reiniciar el Servidor

```bash
npm start
```

### 4. Limpiar la Caché del Navegador

1. Abre la aplicación en el navegador
2. Si estás en modo desarrollo, usa el botón "Limpiar Caché" en la esquina inferior derecha
3. O limpia manualmente la caché del navegador:
   - Chrome: Ctrl+Shift+Del → Selecciona "Imágenes y archivos en caché" → Borrar datos
   - Firefox: Ctrl+Shift+Del → Selecciona "Caché" → Limpiar ahora

## Verificación

Para verificar que los productos se están cargando correctamente:

1. Abre la consola del navegador (F12)
2. Recarga la página
3. Deberías ver un mensaje como: "✅ Productos de API cargados: XX"
4. Si ves "❌ Error al cargar productos de API", revisa la configuración de Supabase

## Solución Alternativa

Si continúas teniendo problemas con Supabase, puedes editar directamente el archivo `public/productos.json` para corregir los productos que se muestran en la tienda.