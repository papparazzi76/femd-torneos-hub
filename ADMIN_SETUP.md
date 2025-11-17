# Configuración del Sistema de Roles

## Sistema de Roles Implementado

El proyecto ahora cuenta con un sistema de roles seguro basado en verificación del lado del servidor usando Supabase.

### Roles Disponibles

- **admin**: Acceso completo al panel de administración
- **moderator**: (Para implementación futura)
- **user**: Usuario estándar (asignado automáticamente al registrarse)

## Asignar Rol de Administrador

### Opción 1: Vía Lovable Cloud Dashboard

1. Accede a tu backend de Lovable Cloud
2. Ve a la sección **Database** → **Tables** → **user_roles**
3. Haz clic en **Insert row**
4. Completa los campos:
   - `user_id`: El UUID del usuario (obtenible de la tabla auth.users o del perfil del usuario)
   - `role`: Selecciona `admin`
5. Guarda los cambios

### Opción 2: Vía SQL Query

Ejecuta esta consulta en tu backend (reemplaza el email con el email del usuario administrador):

```sql
-- Primero, obtén el user_id del usuario por su email
SELECT id FROM auth.users WHERE email = 'mariscalimagen@gmail.com';

-- Luego, inserta el rol de admin (reemplaza 'USER_ID_AQUI' con el ID obtenido)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'admin');
```

O en una sola consulta:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'mariscalimagen@gmail.com';
```

## Autenticación

### Iniciar Sesión

1. Ve a `/auth` en tu aplicación
2. Completa el formulario de inicio de sesión
3. Si eres administrador, verás el enlace "Admin" en el menú

### Registro

1. Ve a `/auth` en tu aplicación
2. Cambia a la pestaña "Registrarse"
3. Completa el formulario con tu información
4. La cuenta se crea automáticamente con rol `user`
5. Para obtener permisos de admin, sigue las instrucciones anteriores

## Seguridad

### Características de Seguridad Implementadas

1. **Verificación del Servidor**: El estado de admin se verifica en un Edge Function, no en el cliente
2. **RLS Policies**: Políticas de seguridad a nivel de base de datos
3. **Función SECURITY DEFINER**: Evita recursión infinita en las políticas RLS
4. **Tabla Separada**: Los roles están en una tabla dedicada, no en el perfil de usuario
5. **Auto-confirmación de Email**: Habilitado para facilitar el testing (considera deshabilitarlo en producción)

### Consideraciones de Producción

Para un entorno de producción, considera:

1. Deshabilitar la auto-confirmación de emails
2. Implementar verificación de email
3. Añadir autenticación de dos factores
4. Implementar rate limiting en el edge function
5. Registrar intentos de acceso no autorizado

## Solución de Problemas

### No puedo acceder al Admin Dashboard

1. Verifica que estés autenticado
2. Confirma que tu usuario tiene el rol `admin` en la tabla `user_roles`
3. Revisa la consola del navegador para errores
4. Verifica que el Edge Function `check-admin` esté desplegado correctamente

### Error "Invalid token"

1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que la sesión no haya expirado
3. Revisa la configuración de Supabase Auth

### El enlace "Admin" no aparece

1. Verifica que tengas el rol de admin asignado
2. Refresca la página después de asignar el rol
3. Revisa la consola del navegador para errores de la llamada al Edge Function

## Estructura de la Base de Datos

### Tabla: user_roles

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);
```

### Enum: app_role

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

### Función: has_role

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```
