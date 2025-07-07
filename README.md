# BeautyGlow - E-Commerce de Cosméticos

Una aplicación de comercio electrónico completa y funcional con un backend robusto, base de datos y un panel de administración para la gestión de contenido.

## 🚀 Características Implementadas

- **Catálogo de Productos Dinámico**: Los productos se gestionan desde una base de datos SQLite, permitiendo un control total sobre el inventario.
- **Panel de Administración de Productos**: Interfaz segura en `/admin.html` para Crear, Leer, Actualizar y Eliminar (CRUD) productos fácilmente.
- **Carrito de Compras Persistente**: El estado del carrito de cada usuario se guarda en la base de datos, asegurando que no se pierda entre sesiones.
- **Sistema de Pedidos con Estados**: Flujo de pedidos profesional que incluye los estados `pendiente_pago`, `pagado`, `despachado` y `cancelado`.
- **Notificaciones por Correo**: El sistema notifica automáticamente al área de despacho por correo electrónico cuando un pedido es marcado como "pagado" por un administrador.
- **API RESTful**: Un backend sólido y bien estructurado construido con Node.js y Express, que maneja toda la lógica de negocio.
- **Diseño Totalmente Adaptable**: La interfaz de la tienda funciona perfectamente en dispositivos móviles, tabletas y ordenadores de escritorio.

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Base de Datos**: better-sqlite3
- **Manejo de Archivos**: Multer para la subida de comprobantes de pago.
- **Notificaciones**: Nodemailer para el envío de correos electrónicos.

## 📦 Instalación y Uso Local

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <CARPETA_DEL_PROYECTO>
    ```
2.  **Instalar dependencias del servidor:**
    ```bash
    cd server
    npm install
    cd ..
    ```
3.  **Instalar dependencias de la raíz:**
    ```bash
    npm install
    ```
4.  **Ejecutar las migraciones de la base de datos:**
    Este paso es crucial para asegurar que la base de datos tenga la estructura correcta.
    ```bash
    node server/db/migrate_orders_status.js
    ```
5.  **Iniciar el servidor:**
    ```bash
    npm start
    ```
    (Nota: Se añadirá el script `start` en los siguientes pasos).

La aplicación estará disponible en `http://localhost:3000`.

## 🔑 Administración

- **URL del Panel**: Accede al panel de administración en `http://localhost:3000/admin.html`.
- **Contraseña**: La contraseña por defecto es `admin`.
- **Secreto de API**: La clave por defecto es `super-secret-key`.

**Importante**: Se recomienda cambiar tanto la contraseña como el secreto de la API en los archivos `public/admin.js` y `server/server.js` para un entorno de producción.