#!/bin/bash

# ============================================
# Service Desk - Instalador Automatizado
# Ubuntu 22.04 LTS
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Service Desk - Instalador${NC}"
echo -e "${GREEN}========================================${NC}"

# ============================================
# 1. Actualizar sistema
# ============================================
echo -e "${YELLOW}[1/8] Actualizando sistema...${NC}"
apt update && apt upgrade -y

# ============================================
# 2. Instalar PostgreSQL
# ============================================
echo -e "${YELLOW}[2/8] Instalando PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Configurar PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER servicedesk WITH PASSWORD 'ChangeMe123';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE servicedesk OWNER servicedesk;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER servicedesk CREATEDB;" 2>/dev/null || true

echo -e "${GREEN}  ✓ PostgreSQL instalado${NC}"

# ============================================
# 3. Instalar Redis
# ============================================
echo -e "${YELLOW}[3/8] Instalando Redis...${NC}"
apt install -y redis

systemctl enable redis-server
systemctl start redis-server

echo -e "${GREEN}  ✓ Redis instalado${NC}"

# ============================================
# 4. Instalar Node.js
# ============================================
echo -e "${YELLOW}[4/8] Instalando Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${GREEN}  ✓ Node.js $(node -v) instalado${NC}"

# ============================================
# 5. Instalar Nginx
# ============================================
echo -e "${YELLOW}[5/8] Instalando Nginx...${NC}"
apt install -y nginx

# ============================================
# 6. Generar certificados SSL
# ============================================
echo -e "${YELLOW}[6/8] Generando certificados SSL...${NC}"

# Crear directorio SSL
mkdir -p /etc/nginx/ssl

# Generar certificado autofirmado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=MX/ST=State/L=City/O=ServiceDesk/CN=$DOMAIN"

echo -e "${GREEN}  ✓ Certificados SSL generados${NC}"

# ============================================
# 7. Descargar código
# ============================================
echo -e "${YELLOW}[7/8] Descargando código...${NC}"

# Directorio de la aplicación
mkdir -p /var/www/servicedesk
cd /var/www/servicedesk

# Clonar repositorio
echo "Ingresa tu usuario de GitHub cuando se solicite:"
git clone https://github.com/luiscanel/Service-Desk.git .

# Instalar dependencias API
cd /var/www/servicedesk/src/api
npm install --production

# Build API
npm run build

# Instalar dependencias Web
cd /var/www/servicedesk/src/web
npm install --production
npm run build

echo -e "${GREEN}  ✓ Código descargado y compilado${NC}"

# ============================================
# 8. Configurar Nginx
# ============================================
echo -e "${YELLOW}[8/8] Configurando Nginx...${NC}"

cat > /etc/nginx/sites-available/servicedesk << 'EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name _;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl;
    server_name _;

    # SSL Certificates
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Archivos estáticos
    root /var/www/servicedesk/src/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Proxy
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/servicedesk /etc/nginx/sites-enabled/
nginx -t

# Reiniciar Nginx
systemctl enable nginx
systemctl restart nginx

echo -e "${GREEN}  ✓ Nginx configurado${NC}"

# ============================================
# 9. Configurar Variables de Entorno
# ============================================
echo -e "${YELLOW}Configurando variables de entorno...${NC}"

cat > /var/www/servicedesk/src/api/.env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://servicedesk:ChangeMe123@localhost:5432/servicedesk
REDIS_URL=redis://localhost:6379
JWT_SECRET=ChangeMeToSomethingSecureInProduction
CORS_ORIGIN=https://tu-dominio.com
PORT=3000
EOF

# ============================================
# 10. Iniciar API con PM2
# ============================================
echo -e "${YELLOW}Instalando PM2...${NC}"
npm install -g pm2

cd /var/www/servicedesk/src/api

# Iniciar API
pm2 start dist/main.js --name servicedesk-api

# Configurar inicio automático
pm2 startup
pm2 save

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ¡Instalación completada!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  📱 Accede a: ${GREEN}https://tu-servidor${NC}"
echo -e "  🔧 API:       ${GREEN}https://tu-servidor/api${NC}"
echo -e ""
echo -e "  📝 Credenciales por defecto:"
echo -e "     Email:    ${YELLOW}admin@test.com${NC}"
echo -e "     Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "  ⚠️  Cambia las contraseñas en producción!"
echo ""
