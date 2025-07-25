# Beauty Line - E-Commerce de Cosméticos

Una aplicación de comercio electrónico completa y funcional con un backend robusto, base de datos y un panel de administración para la gestión de contenido.

## 🚀 Características Implementadas

- **Catálogo de Productos Dinámico**: Los productos se gestionan desde una base de datos Supabase o SQLite, permitiendo un control total sobre el inventario.
- **Panel de Administración de Productos**: Interfaz segura en `/admin.html` para Crear, Leer, Actualizar y Eliminar (CRUD) productos fácilmente.
- **Carrito de Compras Persistente**: El estado del carrito de cada usuario se guarda en la base de datos, asegurando que no se pierda entre sesiones.
- **Sistema de Pedidos con Estados**: Flujo de pedidos profesional que incluye los estados `pendiente_pago`, `pagado`, `despachado` y `cancelado`.
- **Notificaciones por Correo**: El sistema notifica automáticamente al área de despacho por correo electrónico cuando un pedido es marcado como "pagado" por un administrador.
- **API RESTful**: Un backend sólido y bien estructurado construido con Node.js y Express, que maneja toda la lógica de negocio.
- **Diseño Totalmente Adaptable**: La interfaz de la tienda funciona perfectamente en dispositivos móviles, tabletas y ordenadores de escritorio.
- **Integración con Wompi**: Sistema de pagos integrado para procesar transacciones de forma segura.

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Base de Datos**: Supabase (PostgreSQL) y respaldo en JSON local
- **Manejo de Archivos**: Multer para la subida de comprobantes de pago
- **Notificaciones**: Nodemailer para el envío de correos electrónicos
- **Pagos**: Integración con Wompi

## 📦 Instalación y Uso Local

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <CARPETA_DEL_PROYECTO>
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Supabase (opcional pero recomendado):**
   - Crea un archivo `.env` en la raíz del proyecto
   - Añade tus credenciales de Supabase:
   ```
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_KEY=tu-clave-publica
   ```
   - Para más detalles, consulta el archivo `CONFIGURAR_SUPABASE.md`

4. **Sincronizar productos con Supabase (opcional):**
   Si has configurado Supabase y quieres subir los productos del archivo JSON a la base de datos:
   ```bash
   node sincronizar_productos.js upload
   ```
   O si quieres descargar los productos de Supabase al archivo JSON:
   ```bash
   node sincronizar_productos.js download
   ```

5. **Iniciar el servidor:**
   ```bash
   npm start
   ```

La aplicación estará disponible en `http://localhost:3000`.

## 🔑 Administración

- **URL del Panel**: Accede al panel de administración en `http://localhost:3000/admin.html`.
- **Contraseña**: La contraseña por defecto es `admin`.
- **Secreto de API**: La clave por defecto es `super-secret-key`.

**Importante**: Se recomienda cambiar tanto la contraseña como el secreto de la API en los archivos `public/admin.js` y `server/server.js` para un entorno de producción.

## 🔍 Solución de Problemas

Si encuentras problemas con la carga de productos:

1. **Verifica la conexión a Supabase**:
   - Asegúrate de que las credenciales en el archivo `.env` son correctas
   - Revisa los logs del servidor para ver si hay errores de conexión

2. **Usa el respaldo local**:
   - La aplicación intentará cargar productos desde el archivo JSON local si no puede conectarse a Supabase
   - Puedes forzar la carga desde el archivo JSON ejecutando:
   ```bash
   node sincronizar_productos.js download
   ```

3. **Limpia la caché del navegador**:
   - A veces el navegador puede estar mostrando una versión en caché de los productos
   - En modo desarrollo, usa el botón "Limpiar Caché" que aparece en la esquina inferior derecha

4. **Reinicia el servidor**:
   - Detén el servidor (Ctrl+C) y vuelve a iniciarlo con `npm start`

Para más información, consulta los archivos `INSTRUCCIONES.md` y `CONFIGURAR_SUPABASE.md`.