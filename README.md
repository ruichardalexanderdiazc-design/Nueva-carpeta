# YourManga

YourManga es una aplicación web estática para leer cómics, mangas y manhwas. Cuenta con autenticación Firebase, panel de administrador, lector optimizado y funciona como PWA instalable.- Versión `v1.0.1`
## Versión

- `v1.0.0`

## Características

- PWA instalable con manifest y service worker.
- Home con secciones: AÑADIDOS RECIENTEMENTE, PRÓXIMAMENTE, ACTUALIZACIONES DIARIAS, TÍTULOS EN TENDENCIA, CÓMICS Y MANHWAS, TERMINADOS y COMICS/MANHWAS/MANGAS TERMINADOS.
- Búsqueda y filtros por tipo, estado y etiquetas.
- Detalle de obra con sinopsis, autor, estadísticas, episodios y comentarios.
- Lector de capítulos con controles ocultos hasta tocar la pantalla, navegación anterior/siguiente y lista de capítulos.
- Biblioteca del usuario guardada en `localStorage`.
- Panel de administrador exclusivo para `richardalexanderdiaz0@gmail.com` para publicar obras.
- Publicación de obras terminadas, en emisión o próximamente, con carga de capítulos y vista previa.
- Compartir a aplicaciones externas y reporte de contenido.
- No hay datos simulados prepublicados; los contenidos se crean desde el panel administrativo.
- La app ya está conectada a Xano para obtener obras, capítulos, biblioteca e interacciones.

## Cómo usar

1. Abre `index.html` en el navegador.
2. Inicia sesión con Google o correo electrónico.
3. Si eres el administrador (`richardalexanderdiaz0@gmail.com`), verás el botón `Estudio`.
4. Los usuarios pueden explorar el catálogo, leer capítulos, comentar y compartir.

## PWA y GitHub Pages

- El sitio usa `manifest.webmanifest`, `logo.svg` y `sw.js` para ser instalable.
- GitHub Pages acepta este sitio estático sin backend adicional.
- Para desplegar en GitHub Pages, sube todos los archivos al repositorio y activa Pages en la rama `main`.
- Usa rutas relativas, por lo que los HTML se sirven bien desde `https://<usuario>.github.io/<repositorio>/`.

## Preparado para backend real

Esta versión ya está preparada para usar un backend real en Xano, con llamadas directas a las APIs de obras, capítulos y biblioteca.

### Qué debes configurar en Xano

1. Entra a tu proyecto en Xano.
2. Crea las tablas y endpoints necesarios para `manga_work`, `manga_chapter`, `manga_library` y `manga_interaction`.
3. Ajusta los nombres de campos para que `work_type`, `published_at`, `status`, `categories`, `tags` y `user_id` funcionen con el frontend.

- `works`
  - `id` (uuid, primary key)
  - `title` (text)
  - `author` (text)
  - `type` (text)
  - `status` (text)
  - `synopsis` (text)
  - `cover` (text)
  - `coverLarge` (text)
  - `categories` (text[])
  - `tags` (text[])
  - `reads` (int)
  - `likes` (int)
  - `dislikes` (int)
  - `visibility` (text)
  - `published_at` (timestamp)
  - `schedule_at` (timestamp)

- `episodes`
  - `id` (uuid, primary key)
  - `work_id` (uuid, foreign key -> works.id)
  - `title` (text)
  - `cover` (text)
  - `content` (jsonb)
  - `episode_number` (int)

- `comments`
  - `id` (uuid, primary key)
  - `work_id` (uuid, foreign key -> works.id)
  - `author` (text)
  - `text` (text)
  - `created_at` (timestamp)

- `users`
  - `id` (uuid, primary key)
  - `email` (text)
  - `display_name` (text)
  - `role` (text)

### SQL Editor

Puedes usar el SQL Editor si prefieres escribir los esquemas manualmente. Ejemplo:

```sql
create table works (
  id uuid primary key default uuid_generate_v4(),
  title text,
  author text,
  type text,
  status text,
  synopsis text,
  cover text,
  coverLarge text,
  categories text[],
  tags text[],
  reads int default 0,
  likes int default 0,
  dislikes int default 0,
  visibility text default 'public',
  published_at timestamp,
  schedule_at timestamp
);

create table episodes (
  id uuid primary key default uuid_generate_v4(),
  work_id uuid references works(id),
  title text,
  cover text,
  content jsonb,
  episode_number int
);

create table comments (
  id uuid primary key default uuid_generate_v4(),
  work_id uuid references works(id),
  author text,
  text text,
  created_at timestamp default now()
);
```

### Buckets

- Abre `Storage > Buckets` y crea un bucket público para portadas e imágenes.
- Usa URLs de Supabase Storage en los campos `cover` y `coverLarge`.

### Conexión desde la app

- Usa `supabaseUrl` y `supabaseKey` en `app.js`.
- Reemplaza `localStorage` con consultas reales a Supabase.

## Archivos principales

- `index.html` - Interfaz, manifest y PWA.
- `styles.css` - Estilos.
- `app.js` - Lógica, administrador, lector, Firebase y PWA.
- Versión 1.0.1
- `manifest.webmanifest` - Configuración PWA.
- `sw.js` - Service worker para cache.
- `logo.svg` - Icono de la app.
