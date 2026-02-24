from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", "B", 16)
pdf.cell(200, 10, "Service Desk - Documentacion Completa", ln=True, align="C")
pdf.ln(10)

pdf.set_font("Arial", "B", 12)
pdf.cell(200, 10, "1. ARQUITECTURA", ln=True)
pdf.set_font("Arial", "", 10)

arch = """
Stack Tecnologico:
- Backend: NestJS 10.x
- Frontend: React + Vite 7.x
- Base de Datos: PostgreSQL 15
- Cache: Redis 7
- Proxy: Nginx Alpine

Contenedores Docker:
- servicedesk-nginx: Puerto 80, 443 (Proxy + SSL)
- servicedesk-api: Puerto 3000 (API REST)
- servicedesk-web: Puerto 5173 (Frontend)
- servicedesk-db: Puerto 5432 (PostgreSQL)
- servicedesk-redis: Puerto 6379 (Redis)
"""
pdf.multi_cell(0, 5, arch)
pdf.ln(5)

pdf.set_font("Arial", "B", 12)
pdf.cell(200, 10, "2. MODULOS Y FUNCIONALIDADES", ln=True)
pdf.set_font("Arial", "", 10)

mods = """
- Autenticacion (JWT + bcryptjs)
- Gestion de Usuarios (CRUD + Roles)
- Tickets (CRUD + Estados + Prioridades)
- Agentes (Perfiles + Habilidades + Capacidad)
- Auto-Asignacion (Algoritmo de scoring)
- Dashboard (Widgets + Metricas)
- SLA (Politicas + Monitor + Notificaciones)
- Notificaciones WebSocket (Tiempo real)
- Auditoria (Logs de acciones)
- Knowledge Base (Articulos + Categorias)
- Macros (Plantillas + Automatizacion)
- Gamificacion (Logros + Rankings)
- Email (SMTP + Notificaciones)
- Reportes (Programados + Exportacion)
- Settings (Configuracion global)
"""
pdf.multi_cell(0, 5, mods)
pdf.ln(5)

pdf.set_font("Arial", "B", 12)
pdf.cell(200, 10, "3. SEGURIDAD", ln=True)
pdf.set_font("Arial", "", 10)

seg = """
- SSL/TLS con certificados
- Helmet.js headers de seguridad
- Rate Limiting (100 req/min)
- CORS configurado
- JWT tokens
- bcryptjs hash de contrasenas

Variables de Entorno Requeridas:
- NODE_ENV
- DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
- JWT_SECRET
- CORS_ORIGIN
- REDIS_URL
"""
pdf.multi_cell(0, 5, seg)
pdf.ln(5)

pdf.set_font("Arial", "B", 12)
pdf.cell(200, 10, "4. INSTALACION", ln=True)
pdf.set_font("Arial", "", 10)

inst = """
Pasos:
1. git clone <repo>
2. cp .env.example .env
3. cd docker/nginx && ./generate-ssl.sh
4. cd docker && docker-compose up -d
5. docker ps (verificar estado)

Puertos de Acceso:
- https://localhost (Frontend + API)
- http://localhost (Redirect a HTTPS)
- http://localhost:3000 (API directa)
- http://localhost:5173 (Frontend directo)

Credenciales por Defecto:
- Email: admin@test.com
- Password: admin123
"""
pdf.multi_cell(0, 5, inst)
pdf.ln(5)

pdf.set_font("Arial", "B", 12)
pdf.cell(200, 10, "5. ENDPOINTS API", ln=True)
pdf.set_font("Arial", "", 10)

eps = """
POST /api/auth/login - Login
POST /api/auth/register - Registro
GET /api/auth/profile - Perfil

GET/POST /api/tickets - Listar/Crear tickets
GET/PUT/DELETE /api/tickets/:id - CRUD tickets

GET/POST /api/users - Listar/Crear usuarios
GET/PUT/DELETE /api/users/:id - CRUD usuarios

GET/POST /api/agents - Listar/Crear agentes

GET /api/dashboard/stats - Estadisticas
GET /api/dashboard/kpis - KPIs
"""
pdf.multi_cell(0, 5, eps)
pdf.ln(5)

pdf.set_font("Arial", "B", 12)
pdf.cell(200, 10, "6. TROUBLESHOOTING", ln=True)
pdf.set_font("Arial", "", 10)

trb = """
Problemas Comunes:
- Error 502: Verificar IPs de contenedores
- Login no funciona: Verificar credenciales en DB
- SSL no funciona: Verificar certificados
- Websocket no conecta: Verificar proxy nginx

Ver Logs:
- docker logs servicedesk-api
- docker logs servicedesk-nginx
- docker logs servicedesk-db
"""
pdf.multi_cell(0, 5, trb)

pdf.output("C:/Proyectos_Doker/Service_Desk/docs/Service_Desk_Documentacion.pdf")
print("PDF creado: docs/Service_Desk_Documentacion.pdf")
