# Service Desk - Documentación Completa

## 1. ARQUITECTURA

### 1.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICE DESK ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐                │
│   │  CLIENTE │      │  NGINX   │      │   API    │                │
│   │ (Browser)│─────▶│ (Proxy)  │─────▶│ (NestJS) │                │
│   └──────────┘      └──────────┘      └─────┬────┘                │
│        │                                    │                       │
│        │         ┌──────────────┐           │                       │
│        │         │  WEBSOCKET   │           │                       │
│        │◀────────│ (Socket.IO)  │◀──────────┘                       │
│        │         └──────────────┘                                    │
│        │                                                              │
│   ┌────┴────┐      ┌──────────┐      ┌──────────┐                │
│   │ Frontend │      │   DB     │      │  CACHE   │                │
│   │ (React)  │      │PostgreSQL│      │  Redis   │                │
│   └──────────┘      └──────────┘      └──────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | NestJS | 10.x |
| Frontend | React + Vite | 7.x |
| Base de Datos | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Proxy/SSL | Nginx | Alpine |
| ORM | TypeORM | 0.3.x |
| Autenticación | JWT + bcryptjs | - |
| WebSocket | Socket.IO | 4.x |

### 1.3 Contenedores Docker

| Contenedor | Imagen | Puerto | Descripción |
|------------|--------|--------|-------------|
| servicedesk-nginx | nginx:alpine | 80, 443 | Proxy reverso con SSL |
| servicedesk-api | docker-api | 3000 | API REST NestJS |
| servicedesk-web | docker-web | 5173 | Frontend React |
| servicedesk-db | postgres:15-alpine | 5432 | Base de datos |
| servicedesk-redis | redis:7-alpine | 6379 | Cache y sesiones |

---

## 2. MÓDULOS Y FUNCIONALIDADES

### 2.1 Módulos del Sistema

#### 🔐 Autenticación (Auth Module)
- **JWT Authentication**: Tokens de acceso seguros
- **bcryptjs**: Hash de contraseñas
- **Roles**: admin, manager, agent, user
- **Endpoints**:
  - `POST /api/auth/login` - Iniciar sesión
  - `POST /api/auth/register` - Registrarse
  - `GET /api/auth/profile` - Perfil usuario

#### 👥 Gestión de Usuarios (Users Module)
- CRUD de usuarios
- Asignación de roles
- Estados (activo/inactivo)
- Perfiles

#### 🎫 Tickets (Tickets Module)
- Crear tickets
- Asignación automática
- Estados: new, in_progress, resolved, closed
- Prioridades: low, medium, high, critical
- Categorías personalizables

#### 👨‍💼 Agentes (Agents Module)
- Perfiles de agentes
- Habilidades (skills)
- Capacidad de tickets
- Disponibilidad
- Niveles (1-5)

#### ⚡ Auto-Asignación (Auto-Assignment)
- Algoritmo de scoring
- Considera:
  - Carga de trabajo actual
  - Habilidades del agente
  - Prioridad del ticket
  - SLA urgency
  - Historial de rendimiento

#### 📊 Dashboard
- Widgets personalizables
- Métricas en tiempo real
- Gráficos de tickets
- KPIs de rendimiento

#### ⏰ SLA (Service Level Agreement)
- Políticas de SLA
- Monitor de cumplimiento
- Notificaciones de incumplimiento
- Tiempos de respuesta garantizados

#### 🔔 Notificaciones (WebSocket)
- Notificaciones en tiempo real
- Alertas de nuevos tickets
- Actualizaciones de estado
- Notificaciones SLA

#### 📝 Auditoría (Audit Logs)
- Log de todas las acciones
- Control de cambios
- Cumplimiento regulatorio

#### 📚 Knowledge Base
- Artículos de ayuda
- Categorización
- Búsqueda
- Vistas/contador

#### 🤖 Macros
- Respuestas predefinidas
- Plantillas
- Automatización

#### 🏆 Gamificación
- Logros (Achievements)
- Stats de agentes
- Rankings
- Puntos/experiencia

#### 📧 Email
- Configuración SMTP
- Notificaciones automáticas
- Templates de email

#### 📑 Reportes
- Reportes programados (cron)
- Exportación
- Programación de envíos

#### ⚙️ Settings
- Configuración global
- Email SMTP
- Parámetros del sistema

---

## 3. SEGURIDAD

### 3.1 Medidas Implementadas

| Medida | Estado | Descripción |
|--------|--------|-------------|
| SSL/TLS | ✅ | HTTPS con certificados |
| Helmet.js | ✅ | Headers de seguridad |
| Rate Limiting | ✅ | 100 req/min |
| CORS | ✅ | Orígenes configurables |
| JWT | ✅ | Tokens de autenticación |
| bcryptjs | ✅ | Hash de contraseñas |
| Swagger prod | ❌ | Deshabilitado en producción |

### 3.2 Variables de Entorno

```env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=servicedesk
DB_PASSWORD=ChangeMe123
JWT_SECRET=CHANGE_ME_IN_PRODUCTION
CORS_ORIGIN=https://tu-dominio.com
REDIS_URL=redis://redis:6379
```

---

## 4. INSTALACIÓN Y CONFIGURACIÓN

### 4.1 Requisitos

- Docker
- Docker Compose
- 4GB RAM mínimo
- 20GB disco

### 4.2 Pasos de Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd Service_Desk

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Generar certificados SSL
cd docker/nginx
./generate-ssl.sh

# 4. Iniciar servicios
cd docker
docker-compose up -d

# 5. Verificar estado
docker ps
```

### 4.3 Puertos de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| HTTPS | https://localhost | Frontend + API |
| HTTP | http://localhost | Redirect a HTTPS |
| API | http://localhost:3000 | API directa |
| Web | http://localhost:5173 | Frontend directo |

### 4.4 Credenciales por Defecto

| Campo | Valor |
|-------|-------|
| Email | admin@test.com |
| Password | admin123 |

---

## 5. ENDPOINTS API

### 5.1 Autenticación

```
POST /api/auth/login          - Login
POST /api/auth/register      - Registro
GET  /api/auth/profile       - Perfil (requiere token)
```

### 5.2 Tickets

```
GET    /api/tickets           - Listar tickets
POST   /api/tickets           - Crear ticket
GET    /api/tickets/:id      - Ver ticket
PUT    /api/tickets/:id      - Actualizar ticket
DELETE /api/tickets/:id      - Eliminar ticket
```

### 5.3 Usuarios

```
GET    /api/users            - Listar usuarios
POST   /api/users            - Crear usuario
GET    /api/users/:id        - Ver usuario
PUT    /api/users/:id        - Actualizar usuario
DELETE /api/users/:id        - Eliminar usuario
```

### 5.4 Agentes

```
GET    /api/agents           - Listar agentes
POST   /api/agents           - Crear agente
GET    /api/agents/:id       - Ver agente
PUT    /api/agents/:id       - Actualizar agente
```

### 5.5 Dashboard

```
GET /api/dashboard/stats         - Estadísticas
GET /api/dashboard/kpis         - KPIs
GET /api/dashboard/charts        - Gráficos
```

### 5.6 SLA

```
GET    /api/sla/policies         - Listar políticas
POST   /api/sla/policies         - Crear política
GET    /api/sla/monitor          - Monitor SLA
```

### 5.7 Knowledge Base

```
GET    /api/knowledge            - Artículos
POST   /api/knowledge            - Crear artículo
GET    /api/knowledge/categories - Categorías
```

---

## 6. BASE DE DATOS

### 6.1 Esquema de Tablas

```
users
├── id (UUID)
├── email (VARCHAR)
├── firstName (VARCHAR)
├── lastName (VARCHAR)
├── password (VARCHAR)
├── role (ENUM: admin, manager, agent, user)
├── department (VARCHAR)
├── phone (VARCHAR)
├── isActive (BOOLEAN)
├── plan (ENUM: bronze, silver, gold)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

tickets
├── id (UUID)
├── ticket_number (VARCHAR)
├── title (VARCHAR)
├── description (TEXT)
├── status (ENUM)
├── priority (ENUM)
├── category (VARCHAR)
├── requester_id (UUID)
├── assigned_to_id (UUID)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

agents
├── id (UUID)
├── user_id (UUID)
├── level (INTEGER)
├── is_available (BOOLEAN)
├── skills (VARCHAR)
├── ticket_capacity (INTEGER)
├── current_tickets (INTEGER)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

sla_policies
├── id (UUID)
├── name (VARCHAR)
├── description (TEXT)
├── response_time_hours (INTEGER)
├── resolution_time_hours (INTEGER)
├── priority (ENUM)
├── is_active (BOOLEAN)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

audit_logs
├── id (UUID)
├── user_id (UUID)
├── action (VARCHAR)
├── entity_type (VARCHAR)
├── entity_id (UUID)
├── changes (JSONB)
├── ip_address (VARCHAR)
└── createdAt (TIMESTAMP)

knowledge_articles
├── id (UUID)
├── title (VARCHAR)
├── content (TEXT)
├── category (VARCHAR)
├── tags (VARCHAR)
├── is_published (BOOLEAN)
├── views (INTEGER)
├── author_id (UUID)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

macros
├── id (UUID)
├── name (VARCHAR)
├── description (TEXT)
├── category (VARCHAR)
├── content (TEXT)
├── is_active (BOOLEAN)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

scheduled_reports
├── id (UUID)
├── name (VARCHAR)
├── type (VARCHAR)
├── frequency (VARCHAR)
├── recipients (VARCHAR)
├── is_active (BOOLEAN)
├── last_run (TIMESTAMP)
├── next_run (TIMESTAMP)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

---

## 7. WEBSOCKETS

### 7.1 Eventos

| Evento | Descripción |
|--------|-------------|
| `ticket:created` | Nuevo ticket creado |
| `ticket:updated` | Ticket actualizado |
| `ticket:assigned` | Ticket asignado a agente |
| `sla:breached` | SLA incumplido |
| `notification:new` | Nueva notificación |

---

## 8. DOCKER

### 8.1 docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: servicedesk
      POSTGRES_PASSWORD: ChangeMe123
      POSTGRES_DB: servicedesk
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ../src/api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  web:
    build: ../src/web
    ports:
      - "5173:5173"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./nginx/ssl:/etc/nginx/ssl
```

### 8.2 Comandos Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Ver estado
docker ps
```

---

## 9. TROUBLESHOOTING

### 9.1 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Error 502 en nginx | Verificar IPs de contenedores |
| Login no funciona | Verificar credenciales en DB |
| SSL no funciona | Verificar certificados en docker/nginx/ssl |
| Websocket no conecta | Verificar proxy en nginx |
| DB no conecta | Verificar credenciales en .env |

### 9.2 Logs

```bash
# Ver logs API
docker logs servicedesk-api

# Ver logs Nginx
docker logs servicedesk-nginx

# Ver logs DB
docker logs servicedesk-db
```

---

## 10. ROADMAP

### Funcionalidades Futuras
- [ ] Chat en vivo
- [ ] App móvil
- [ ] Integración con Slack/Teams
- [ ] AI para clasificación de tickets
- [ ] Reportes avanzados
- [ ] Multi-tenancy

---

## 11. CONTRIBUCIÓN

1. Fork del repositorio
2. Crear branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 12. LICENCIA

MIT License - Copyright (c) 2026

---

*Documento generado automáticamente para Service Desk*
*Fecha: 23/02/2026*
