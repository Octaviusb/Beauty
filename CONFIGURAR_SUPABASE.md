# Configuración de Supabase para BeautyLine

Este documento explica cómo configurar correctamente la conexión a Supabase para que la aplicación BeautyLine pueda cargar los productos desde la base de datos.

## Paso 1: Obtener las credenciales de Supabase

1. Inicia sesión en tu cuenta de Supabase: https://app.supabase.io/
2. Selecciona tu proyecto
3. Ve a "Settings" (Configuración) en el menú lateral
4. Selecciona "API"
5. Busca y copia los siguientes valores:
   - **URL**: Es la URL de tu proyecto (algo como `https://abcdefghijklm.supabase.co`)
   - **anon/public key**: Es la clave pública que se usa para operaciones anónimas

## Paso 2: Configurar las variables de entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores de ejemplo con tus credenciales reales:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-publica
```

3. Guarda el archivo

## Paso 3: Verificar la estructura de la tabla

Asegúrate de que en Supabase tienes una tabla llamada `products` con la siguiente estructura:

- `id`: número (primary key)
- `name`: texto
- `category`: texto
- `price`: número
- `description`: texto
- `image`: texto (URL de la imagen)
- `badge`: texto (opcional)

## Paso 4: Reiniciar el servidor

1. Detén el servidor si está en ejecución (presiona Ctrl+C en la terminal)
2. Inicia el servidor nuevamente:

```bash
npm start
```

## Solución de problemas

Si sigues teniendo problemas para cargar los productos desde Supabase:

1. Verifica en la consola del servidor si hay mensajes de error relacionados con Supabase
2. Asegúrate de que la tabla `products` en Supabase tiene datos
3. Verifica que las políticas de seguridad de Supabase permiten operaciones de lectura anónimas
4. Prueba a hacer una consulta directa a la API de Supabase usando una herramienta como Postman o cURL

## Configuración de políticas de seguridad en Supabase

Para permitir que la aplicación lea los productos sin autenticación, configura las siguientes políticas en la tabla `products`:

1. Ve a la sección "Authentication" > "Policies" en Supabase
2. Selecciona la tabla `products`
3. Crea una nueva política para permitir SELECT:
   - Name: `Allow anonymous read`
   - Operation: `SELECT`
   - Target roles: `anon`
   - Using expression: `true`

Esto permitirá que cualquier usuario pueda leer los productos sin necesidad de autenticación.