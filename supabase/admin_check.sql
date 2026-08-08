-- Ejecutar manualmente en el SQL Editor del mismo proyecto Supabase que usa la tienda.
-- No se ejecuta automáticamente ni requiere una Secret/Service Role Key en el frontend.

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke execute on function public.es_admin() from public;
revoke execute on function public.es_admin() from anon;
grant execute on function public.es_admin() to authenticated;

comment on function public.es_admin() is
  'Indica si auth.uid() pertenece a la lista privada de administradores.';
