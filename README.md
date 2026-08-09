# Pasta Casa Admin

Panel administrativo independiente de la tienda pública de Pasta Casa. Permite a administradores ver métricas, consultar pedidos y sus productos, coordinar transferencias o entregas, contactar al cliente por WhatsApp, avanzar estados y editar únicamente precio, stock y disponibilidad del catálogo.

## Arquitectura y seguridad

- React + Vite + TypeScript y React Router.
- `@supabase/supabase-js` para Auth, RPC y consultas a PostgREST.
- `AuthContext` recupera la sesión con `getSession()`, escucha cambios con `onAuthStateChange()` y valida cada sesión con `rpc('es_admin')`.
- `ProtectedRoute` no monta el layout ni sus páginas hasta tener sesión y confirmación de administrador.
- Los servicios consultan `productos`, `pedidos` y `detalle_pedido` con la sesión del usuario. La autorización real depende de las políticas RLS existentes en Supabase; React solo aporta control de navegación y experiencia de usuario.
- No se guarda información administrativa, pedidos, teléfonos ni contraseñas en almacenamiento propio. Solo se utiliza la persistencia de sesión administrada por Supabase Auth.

La Publishable Key (aquí conservada bajo el nombre compatible `VITE_SUPABASE_ANON_KEY`) puede incluirse en el frontend: identifica al proyecto, pero no reemplaza Auth ni RLS. Una Secret Key, `service_role` o cualquier clave `sb_secret_…` jamás debe usarse en este panel.

## Instalación

Requisitos: Node.js 20.19+ o 22.12+ y npm.

```bash
npm install
```

Copiar `.env.example` como `.env.local` y completar únicamente:

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_publishable_key
```

`.env.local`, `.env` y variantes están ignorados por Git; `.env.example` es la única excepción y no contiene credenciales reales.

## Función de verificación de administrador

El archivo [`supabase/admin_check.sql`](supabase/admin_check.sql) debe ejecutarse **manualmente** una sola vez en el SQL Editor del mismo proyecto Supabase de la tienda, usando una cuenta con permisos para crear funciones. La aplicación no ejecuta migraciones ni modifica Supabase automáticamente.

La función pública `public.es_admin()` no recibe parámetros, es `SECURITY DEFINER`, fija un `search_path` vacío y consulta internamente `private.is_admin()`. Se revoca su ejecución a `public` y `anon`, y se concede solo a `authenticated`. El frontend nunca consulta `private.admin_users` ni el schema `private`.

Antes de aplicarla, conviene revisar el SQL con la persona responsable del proyecto y confirmar que `private.is_admin()` ya existe y usa `auth.uid()` de manera segura.

## Ejecución y validación

```bash
npm run dev
npm test
npm run build
npm run preview
```

El servidor de desarrollo imprime la URL local. El build de producción se genera en `dist/`.

## Despliegue posterior en Netlify

1. Crear un sitio en Netlify enlazado exclusivamente al repositorio/carpeta de este panel.
2. Configurar `npm run build` como comando y `dist` como directorio publicado (también están definidos en `netlify.toml`).
3. Agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en **Site configuration → Environment variables**.
4. Desplegar. La regla SPA de `netlify.toml` redirige rutas como `/pedidos` a `index.html` sin alterar la URL.
5. Añadir la URL final del panel a las URLs de redirección permitidas en la configuración de Supabase Auth si el flujo de autenticación del proyecto lo requiere.

No publicar el contenido de `.env.local` ni configurar una Secret/Service Role Key en Netlify.

## Estructura principal

```text
src/
  components/   rutas protegidas, estados visuales y detalle de pedido
  context/      sesión y verificación administrativa
  hooks/        carga asíncrona reutilizable
  layouts/      layout responsive del panel
  lib/          cliente Supabase
  pages/        login, dashboard, pedidos y productos
  services/     operaciones permitidas contra Supabase
  types/        modelos y estados válidos
  utils/        formato argentino y métricas
supabase/
  admin_check.sql
```

## Alcance de esta versión

No crea ni elimina productos, no edita datos del cliente ni datos históricos del pedido y no modifica código, nombre o descripción de productos. Los estados intermedios actualizan únicamente `estado` y `updated_at`. Cancelar y completar utilizan respectivamente las RPC `cancelar_pedido_admin` y `completar_pedido_admin`, por lo que React nunca devuelve ni descuenta stock manualmente ni modifica `stock_reservado`. En productos, los únicos campos editables son `precio`, `stock_docenas`, `activo` y `updated_at`. Supabase sigue siendo la autoridad final mediante sus funciones, permisos y RLS.
