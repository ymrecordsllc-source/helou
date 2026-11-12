# Guía de Configuración e Integración de Supabase en YM-ki

Este documento detalla la infraestructura, persistencia, seguridad y configuración de Supabase para la plataforma YM-ki.

## 1. Variables de Entorno

Agrega las siguientes variables en tu entorno de desarrollo o panel de Cloudflare Pages:

```env
# Claves públicas para frontend (React / Vite)
VITE_SUPABASE_URL=https://<tu-proyecto-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Clave de servicio para el backend (opcional para operaciones administrativas protegidas)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

## 2. Ejecución de Migraciones en Supabase

1. Accede a tu proyecto en el panel de [Supabase](https://supabase.com/).
2. Dirígete a la pestaña **SQL Editor**.
3. Abre y copia el contenido completo del archivo:
   `supabase/migrations/20261108_initial_schema.sql`
4. Presiona **Run** para aplicar:
   - Extensiones (`uuid-ossp`, `pgcrypto`).
   - Tablas principales e índices optimizados.
   - Restricciones de integridad y claves foráneas en cascada.
   - Políticas de seguridad Row Level Security (RLS).
   - Funciones SQL atómicas (`fn_transfer_virtual_currency`, `fn_purchase_product_atomic`).

## 3. Seguridad y Políticas RLS

- **Perfiles (`public.profiles`)**: Cualquier usuario puede ver los perfiles públicos. La edición de perfiles está restringida al propio titular.
- **Seguidores (`public.followers`)**: Lectura global de listas de seguidores y seguidos. Solo el titular puede crear o eliminar su relación de seguimiento. Restricción `chk_no_self_follow` previene seguirse a sí mismo.
- **Estados (`public.user_statuses`)**: Lectura pública o para seguidores según la configuración `visibility`. Solo el usuario puede actualizar o eliminar su estado.
- **Foros y Publicaciones (`public.posts`)**: Lectura pública con paginación optimizada. Solo usuarios autorizados pueden editar o eliminar sus publicaciones.
- **Reacciones Personalizadas (`public.post_reactions` y `public.comment_reactions`)**: 1 única reacción activa por usuario por publicación/comentario mediante la restricción única `(post_id, username)`.
- **Encuestas Comunitarias (`public.community_polls` y `public.poll_votes`)**: Restricción estricta de 1 voto por usuario por encuesta en el servidor.
- **Colecciones y Publicaciones Guardadas (`public.saved_collections` y `public.saved_posts`)**: Privacidad estricta: solo el creador puede consultar y gestionar sus colecciones privadas.
- **Proveedores Autorizados (`public.vendors`)**: Los usuarios solicitan aprobación mediante formulario. Solo los administradores pueden cambiar el estado a `aprobado`, `rechazado`, `suspendido` o `revocado`. La publicación de productos en secciones oficiales requiere ser proveedor verificado o administrador.
- **Inventario y Variantes (`public.product_variants`, `public.inventory_movements`)**: Control de stock con auditoría de movimientos. La función atómica `fn_purchase_product_atomic` previene compras con stock agotado o saldo insuficiente en condiciones de concurrencia.
- **Economía Virtual (`public.economy_ledger`)**: Registro inmutable de cada transacción con saldos anterior y posterior. Función atómica `fn_transfer_virtual_currency` impide saldos negativos.

## 4. Arquitectura de Resiliencia Dual

La plataforma cuenta con un conector inteligente (`src/lib/supabase.ts`):
- **Modo Supabase**: Si `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configurados, el frontend y backend se comunican directamente con la base de datos PostgreSQL de Supabase.
- **Modo Servidor Local / Respaldo**: Si las credenciales aún no se han configurado o en entornos locales sin conexión externa, la API Express (`server.ts`) persiste automáticamente todas las estructuras en `data/db.json` con idénticos contratos REST y validaciones seguras, garantizando que ninguna pantalla falle ni muestre datos rotos.

## 5. Optimización para Plan Gratuito ($0)

- **Límites de Supabase Free Tier**:
  - 500 MB de base de datos PostgreSQL.
  - 1 GB de almacenamiento de archivos en Supabase Storage.
  - 50,000 usuarios activos mensuales.
  - 2 proyectos gratuitos activos.
- **Técnicas implementadas**:
  - Paginación en feeds y comentarios para reducir lecturas de base de datos.
  - Índices B-Tree en campos de consulta frecuente (`username`, `author`, `post_id`, `created_at`).
  - Límites de subida en cliente y servidor (máximo 30MB con compresión recomendada).
  - Degradación controlada: si la cuota de conexión se alcanza, el servidor mantiene caché en memoria y reintenta las solicitudes.
