# 🎯 INSTRUCCIONES PASO A PASO - Tienda de Cosméticos

## 📋 PASO 1: Verificar que todo esté listo

Asegúrate de tener estos archivos en tu carpeta:
- ✅ `index.html` - Página principal
- ✅ `styles.css` - Estilos de la tienda
- ✅ `script.js` - Funcionalidad
- ✅ `README.md` - Documentación completa
- ✅ `ejemplo-productos.js` - Ejemplos de productos
- ✅ `configuracion-rapida.js` - Configuración fácil

## 🚀 PASO 2: Probar la tienda

1. **Abre la tienda**: Haz doble clic en `index.html`
2. **Verifica que funcione**: Deberías ver una tienda rosa con productos de cosméticos
3. **Prueba las funciones**:
   - Haz clic en "Agregar al Carrito"
   - Abre el carrito (ícono del carrito)
   - Cambia cantidades
   - Usa los filtros de categorías

## 🎨 PASO 3: Personalizar la marca

### Cambiar el nombre de la marca:
1. Abre `index.html` con el Bloc de notas
2. Busca `<h2>BeautyGlow</h2>` (línea ~25)
3. Cambia "BeautyGlow" por el nombre de tu marca
4. Guarda el archivo

### Cambiar el slogan:
1. En `index.html`, busca `<h1>Descubre tu Belleza Natural</h1>` (línea ~45)
2. Cambia el texto por tu slogan
3. Guarda el archivo

## 📸 PASO 4: Agregar productos desde tu PDF

### Opción A: Usar el archivo de ejemplo
1. Abre `ejemplo-productos.js`
2. Reemplaza los productos de ejemplo con los de tu PDF
3. Copia el contenido al final de `script.js`
4. Descomenta la línea `agregarProductosDelPDF();`

### Opción B: Agregar productos manualmente
1. Abre `script.js`
2. Busca el array `products` (línea ~2)
3. Agrega tus productos siguiendo este formato:

```javascript
{
    id: 9, // Número único
    name: "Nombre del Producto",
    category: "maquillaje", // o "skincare", "higiene", "accesorios"
    price: 29.99, // Precio en números
    description: "Descripción del producto",
    image: "URL_de_la_imagen",
    badge: "Nuevo" // opcional
}
```

## 🖼️ PASO 5: Subir imágenes de productos

### Método 1: Imgur (Recomendado)
1. Ve a [imgur.com](https://imgur.com)
2. Haz clic en "New Post"
3. Arrastra tus imágenes
4. Haz clic derecho en cada imagen → "Copy image address"
5. Pega la URL en el campo `image` del producto

### Método 2: Google Drive
1. Sube la imagen a Google Drive
2. Haz clic derecho → "Obtener enlace"
3. Cambia el final de la URL de "view" a "uc"
4. Usa esa URL

### Método 3: Cloudinary
1. Regístrate en [cloudinary.com](https://cloudinary.com)
2. Sube tus imágenes
3. Copia la URL generada

## 📞 PASO 6: Actualizar información de contacto

En `index.html`, busca la sección footer y cambia:
- Teléfono: `<i class="fas fa-phone"></i> +1 234 567 890`
- Email: `<i class="fas fa-envelope"></i> info@beautyglow.com`
- Dirección: `<i class="fas fa-map-marker-alt"></i> Calle Principal 123`

## 🔗 PASO 7: Agregar redes sociales

En `index.html`, busca la sección de redes sociales y cambia:
```html
<a href="https://facebook.com/tupagina"><i class="fab fa-facebook"></i></a>
<a href="https://instagram.com/tucuenta"><i class="fab fa-instagram"></i></a>
<a href="https://twitter.com/tucuenta"><i class="fab fa-twitter"></i></a>
<a href="https://youtube.com/tucanal"><i class="fab fa-youtube"></i></a>
```

## 🎨 PASO 8: Cambiar colores (opcional)

Si quieres cambiar los colores:
1. Abre `styles.css`
2. Busca `#ff6b9d` (color rosa principal)
3. Reemplázalo con tu color preferido
4. También puedes cambiar `#ff8fab` y `#fecfef`

## 📱 PASO 9: Probar en diferentes dispositivos

1. **En tu computadora**: Abre la tienda y cambia el tamaño de la ventana
2. **En tu teléfono**: Sube los archivos a un servidor web
3. **En tablet**: Prueba diferentes orientaciones

## 🌐 PASO 10: Subir a internet (opcional)

### Opción A: GitHub Pages (Gratis)
1. Crea una cuenta en GitHub
2. Crea un nuevo repositorio
3. Sube todos los archivos
4. Ve a Settings → Pages → Source → Deploy from a branch
5. Tu tienda estará en: `https://tuusuario.github.io/turepositorio`

### Opción B: Netlify (Gratis)
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra tu carpeta con los archivos
3. Tu tienda estará lista en segundos

### Opción C: Hostinger/GoDaddy (Pago)
1. Compra un dominio y hosting
2. Sube los archivos por FTP
3. Tu tienda estará en tu dominio personalizado

## 🔧 PASO 11: Configuración avanzada

### Usar configuración rápida:
1. Abre `configuracion-rapida.js`
2. Modifica los valores en `CONFIGURACION_TIENDA`
3. Copia el contenido al final de `script.js`
4. Descomenta `aplicarConfiguracion();`

### Configuraciones predeterminadas:
```javascript
// Para maquillaje profesional
aplicarConfiguracionPredeterminada('maquillajeProfesional');

// Para skincare natural
aplicarConfiguracionPredeterminada('skincareNatural');

// Para cosméticos de lujo
aplicarConfiguracionPredeterminada('cosmeticosLujo');
```

## 📋 CHECKLIST FINAL

Antes de lanzar tu tienda, verifica:

- [ ] Nombre de la marca actualizado
- [ ] Slogan personalizado
- [ ] Productos del PDF agregados
- [ ] Imágenes de productos subidas
- [ ] Información de contacto actualizada
- [ ] Redes sociales configuradas
- [ ] Colores personalizados (si aplica)
- [ ] Funciona en móvil y desktop
- [ ] Carrito funciona correctamente
- [ ] Filtros funcionan

## 🆘 SOLUCIÓN DE PROBLEMAS

### La tienda no se abre:
- Verifica que todos los archivos estén en la misma carpeta
- Asegúrate de que los nombres de archivo sean exactos
- Prueba abrir `index.html` con diferentes navegadores

### Las imágenes no se ven:
- Verifica que las URLs de las imágenes sean correctas
- Asegúrate de que las imágenes estén públicas
- Prueba las URLs en una nueva pestaña

### El carrito no funciona:
- Verifica que `script.js` esté incluido en `index.html`
- Abre la consola del navegador (F12) para ver errores
- Asegúrate de que no haya errores de sintaxis en el JavaScript

### Los estilos no se aplican:
- Verifica que `styles.css` esté incluido en `index.html`
- Asegúrate de que el archivo CSS esté completo
- Limpia la caché del navegador (Ctrl+F5)

## 📞 SOPORTE

Si necesitas ayuda:
1. Revisa el archivo `README.md` para documentación completa
2. Verifica que todos los archivos estén presentes
3. Prueba en diferentes navegadores
4. Para problemas complejos, considera contratar un desarrollador

---

## 🎉 ¡FELICITACIONES!

Tu tienda de cosméticos está lista para funcionar. Recuerda:
- Mantén las imágenes actualizadas
- Agrega nuevos productos regularmente
- Responde a los clientes rápidamente
- Promociona tu tienda en redes sociales

**¡Que tengas mucho éxito con tu tienda de cosméticos!** 💄✨ 