# Instrucciones para ejecutar BeautyLine

## Instalación

1. Asegúrate de tener Node.js instalado en tu sistema.
2. Abre una terminal en la carpeta raíz del proyecto.
3. Ejecuta el siguiente comando para instalar las dependencias:

```bash
npm install
```

## Ejecución del servidor

1. Una vez instaladas las dependencias, ejecuta el siguiente comando para iniciar el servidor:

```bash
npm start
```

2. El servidor se iniciará en http://localhost:3000
3. Abre tu navegador y accede a esa dirección para ver la tienda.

## Acceso al panel de administración

- El panel de administración está disponible en: http://localhost:3000/admin.html
- La contraseña por defecto es: `admin`

## Solución de problemas

Si encuentras algún problema con la carga de productos:

1. Asegúrate de que el servidor esté en ejecución.
2. Verifica que no haya errores en la consola del navegador.
3. Si los productos no se cargan correctamente, intenta limpiar la caché del navegador.
4. Si estás en modo desarrollo, usa el botón "Limpiar Caché" que aparece en la esquina inferior derecha de la página.

## Estructura del proyecto

- `public/`: Contiene todos los archivos estáticos (HTML, CSS, JS, imágenes).
- `server/`: Contiene el código del servidor.
  - `index.js`: Punto de entrada del servidor Express.
  - `db.sqlite`: Base de datos SQLite con los productos.
- `api/`: Contiene archivos para despliegue en Vercel.