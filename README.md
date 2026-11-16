# MuvU · Web

Frontend web de **MuvU**, la plataforma de alquiler de habitaciones para estudiantes universitarios cerca de su campus.

**Curso:** CS 2031 Desarrollo Basado en Plataforma · UTEC

| | Enlace |
|---|---|
| Web en producción | https://muvu-rouge.vercel.app |
| API (backend) | `https://muvu-api.duckdns.org/api/v1` · repo [Backend_MUVU](https://github.com/cristhianjinchuna-dev/Backend_MUVU) |
| App móvil | repo [MuvU---Mobile](https://github.com/Eduardo-Vila-coder/MuvU---Mobile) |

> **Disponibilidad del backend:** la API corre en una instancia EC2 de **AWS Academy (Learner Lab)**, que AWS apaga automáticamente al terminar cada sesión del laboratorio (máximo 4 horas). Mientras el laboratorio está encendido, todo el stack funciona por HTTPS. Para revisar el proyecto, coordinar con el equipo para encender el laboratorio; al encenderse, el backend y el HTTPS arrancan solos (servicios `systemd`), sin pasos manuales, y la IP elástica y el dominio no cambian. Comprobación rápida: [`/api/v1/universidades`](https://muvu-api.duckdns.org/api/v1/universidades) debe responder con un JSON.

## Funcionalidades

| Rol | Qué puede hacer |
|---|---|
| Visitante | Ver habitaciones (las destacadas primero), buscar por dirección o distrito, filtrar por precio y ordenar; buscar **habitaciones cercanas** a una universidad en un mapa; ver fotos, descripción, ubicación, rutas y reseñas |
| Estudiante | Registrarse con correo `.edu.pe`, reservar con un **mensaje** para el arrendador, cancelar, calificar reservas confirmadas, ver sus reseñas y editar su perfil (foto, celular y "Sobre mí") |
| Arrendador | Publicar y editar habitaciones con descripción y ubicación en el mapa, subir fotos arrastrándolas, confirmar solicitudes, ver el perfil del estudiante y **destacar** habitaciones pagando con Stripe |
| Ambos | Cuando se confirma una reserva aparece una tarjeta de **contacto** con botones de WhatsApp, correo y llamada |
| Administrador | Verificar arrendadores revisando su DNI, gestionar universidades y **moderar**: suspender cuentas, ocultar habitaciones y eliminar reseñas, con un motivo que se envía por correo |
| Todos | Inicio de sesión con JWT y refresh token automático, recuperación de contraseña, **modo oscuro** y diseño adaptable a celular |

## Tecnologías

| Área | Tecnología |
|---|---|
| Base | React 19 + TypeScript, Vite |
| Estilos | Tailwind CSS v4 (con modo oscuro), íconos `lucide-react` |
| Rutas | React Router 7 (rutas protegidas por rol y carga diferida) |
| HTTP | Axios con interceptores (token y refresh automático) |
| Servicios | Stripe Elements (pagos), Google Maps JavaScript (mapas, Places y rutas), Cloudinary (subida de fotos) |
| Calidad | `tsc` estricto y Oxlint |

## Estructura

```
src/
├── api/         # una función por endpoint (axios), cliente con interceptores
├── components/  # UI reutilizable (ui/, rooms/, reservations/, admin/, landlord/...)
├── context/     # Auth, perfil actual, tema (claro/oscuro) y toasts
├── hooks/       # useFetch, useForm, usePagination, useAuth...
├── pages/       # una página por ruta (student/, landlord/, admin/)
├── routes/      # AppRouter, PrivateRoute y PATHS
├── types/       # tipos que reflejan los DTOs del backend
└── utils/       # validaciones, formatos, fechas, contacto
```

## Ejecución local

Requisitos: Node 20+ y el backend corriendo (ver su README).

```bash
npm install
cp .env.example .env.local   # completar los valores
npm run dev                  # http://localhost:5173
```

Variables (`.env.local`, nunca se suben al repo):

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL de la API, por ejemplo `http://localhost:8080/api/v1` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave **pública** de Stripe (`pk_test_...`) |
| `VITE_GOOGLE_MAPS_API_KEY` | Clave de Google Maps JavaScript |
| `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET` | Subida de fotos (preset *unsigned*) |

Otros comandos: `npm run build` (compila y valida tipos) y `npm run lint`.

**Cuentas de prueba** (datos de demo del backend): estudiante `ana.ramos@utec.edu.pe`, arrendador `rosa.quispe@muvu.com` (ambos `Clave123!`) y admin `admin@muvu.com` / `admin123`.

## Deploy

Desplegado en **Vercel** desde la rama `main`: cada merge a `main` publica una nueva versión.

- Framework: Vite (`npm run build`, salida `dist`).
- Las variables `VITE_*` se configuran en *Vercel → Settings → Environment Variables*, con `VITE_API_URL=https://muvu-api.duckdns.org/api/v1`.
- [`vercel.json`](vercel.json) redirige todas las rutas a `index.html` para que recargar una página interna (por ejemplo `/reservations`) no dé 404.
- El backend solo acepta esta web por CORS (`CORS_ALLOWED_ORIGINS`).

## GitHub & Management

Cada funcionalidad se trabajó en su propia rama y se integró a `main` con pull requests revisados por otro integrante (la rama `main` está protegida).

### Participación

| Integrante | GitHub | Aportes en la web | Participación |
|---|---|---|---|
| Cristhian Gabriel Jinchuña Cama | `cristhianjinchuna-dev` | Base del proyecto (axios, rutas, estructura), autenticación, habitaciones, reservas, calificaciones, perfiles, panel del arrendador, búsqueda y filtros, modo oscuro, fotos con Cloudinary, contacto, descripciones, moderación y deploy en Vercel | 100 % |
| Yerik Dylan Vega Santillan | `Yerik-Vega` | Pagos de publicidad con Stripe, mapas y ubicación de habitaciones con Google Maps | 100 % |
| Mathias Alonso Cavalcanti Estacio | `MatCavUTEC` | Pagos de publicidad, panel de administración y eliminación de cuenta del arrendador (EP 034–040) | 100 % |
| Eduardo Raúl Vila Castellares | `Eduardo-Vila-coder` | Backend y app móvil (ver sus repositorios) | 100 % |
| Mathius Edgar Quispe Sicha | `MQS144` | Backend y app móvil (ver sus repositorios) | 100 % |