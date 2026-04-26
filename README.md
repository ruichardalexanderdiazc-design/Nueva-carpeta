# YourManga

YourManga es una aplicación web estática para leer cómics, mangas y manhwas. Cuenta con autenticación Firebase, panel de administrador y un lector optimizado para móviles y escritorio.

## Características

- Inicio con secciones: AÑADIDOS RECIENTEMENTE, PRÓXIMAMENTE, ACTUALIZACIONES DIARIAS, TÍTULOS EN TENDENCIA, CÓMICS Y MANHWAS, TERMINADOS, COMICS/MANHWAS/MANGAS TERMINADOS.
- Búsqueda y filtros por tipo, estado y etiquetas.
- Detalle de obra con sinopsis, autor, estadísticas, episodios y comentarios.
- Lector de capítulos con controles ocultos hasta tocar la pantalla, navegación de capítulo anterior/siguiente y lista de capítulos.
- Biblioteca del usuario guardada en `localStorage`.
- Panel de administrador exclusivo para `richardalexanderdiaz0@gmail.com` para publicar obras.
- Publicación de obras como terminado, en emisión o próximamente, con pasos de carga de episodios y vista previa.
- Compartir directamente a aplicaciones compatibles y copiado de enlace.
- Reportes de contenido reales guardados en `localStorage`.

## Cómo usar

1. Abre `index.html` en el navegador o publica el contenido en GitHub Pages.
2. Inicia sesión con Google o correo electrónico.
3. Si eres el administrador (`richardalexanderdiaz0@gmail.com`), verás la sección `Estudio` en la barra superior.
4. Los usuarios pueden explorar, comentar, dar like/dislike y leer capítulos.

## Preparado para backend

- Autenticación con Firebase ya configurada en `app.js`.
- Almacenamiento y datos de obras se mantienen en `localStorage` para funcionabilidad offline y demostración.
- Puedes reemplazar el almacenamiento local por Supabase o Firebase Realtime Database cuando quieras.

## Publicación en GitHub Pages

1. Crea un repositorio nuevo y sube todos los archivos presentes.
2. En la configuración de GitHub Pages, selecciona la rama `main` y la carpeta `/`.
3. Accede a la URL generada por GitHub Pages.

## Archivos principales

- `index.html` - Interfaz y estructura del sitio.
- `styles.css` - Estilos visuales.
- `app.js` - Lógica de la aplicación y flujo de usuario.

## Nota

Esta versión es funcional como aplicación web estática. El siguiente paso es conectar los datos con Supabase para persistencia real compartida entre usuarios.
