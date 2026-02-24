# ============================================
# Service Desk - Instalador para Windows
# Windows Server 2019/2022
# ============================================

# Este script debe ejecutarse como Administrador
# PowerShell

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Service Desk - Instalador Windows" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# ============================================
# 1. Instalar Chocolatey (gestor de paquetes)
# ============================================
Write-Host "[1/7] Instalando Chocolatey..." -ForegroundColor Yellow
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# ============================================
# 2. Instalar PostgreSQL
# ============================================
Write-Host "[2/7] Instalando PostgreSQL..." -ForegroundColor Yellow
choco install postgresql15 -y

# Iniciar PostgreSQL
Start-Service postgresql*

# Crear usuario y base de datos
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE USER servicedesk WITH PASSWORD 'ChangeMe123';" 2>$null
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE servicedesk OWNER servicedesk;" 2>$null

Write-Host "  PostgreSQL instalado" -ForegroundColor Green

# ============================================
# 3. Instalar Redis
# ============================================
Write-Host "[3/7] Instalando Redis..." -ForegroundColor Yellow
choco install redis-64 -y

Start-Service redis

Write-Host "  Redis instalado" -ForegroundColor Green

# ============================================
# 4. Instalar Node.js
# ============================================
Write-Host "[4/7] Instalando Node.js..." -ForegroundColor Yellow
choco install nodejs -y

Write-Host "  Node.js $(node --version) instalado" -ForegroundColor Green

# ============================================
# 5. Instalar Nginx
# ============================================
Write-Host "[5/7] Instalando Nginx..." -ForegroundColor Yellow
choco install nginx -y

Write-Host "  Nginx instalado" -ForegroundColor Green

# ============================================
# 6. Descargar código
# ============================================
Write-Host "[6/7] Descargando código..." -ForegroundColor Yellow

$appDir = "C:\servicedesk"
New-Item -ItemType Directory -Force -Path $appDir | Out-Null

Set-Location $appDir
git clone https://github.com/luiscanel/Service-Desk.git .

# Instalar y build API
Set-Location "$appDir\src\api"
npm install --production
npm run build

# Instalar y build Web
Set-Location "$appDir\src\web"
npm install --production
npm run build

Write-Host "  Código descargado" -ForegroundColor Green

# ============================================
# 7. Configurar Nginx
# ============================================
Write-Host "[7/7] Configurando Nginx..." -ForegroundColor Yellow

$nginxConf = @"
server {
    listen 80;
    server_name _;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate C:/servicedesk/ssl/cert.pem;
    ssl_certificate_key C:/servicedesk/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    root C:/servicedesk/src/web/dist;
    index index.html;

    location / {
        try_files `$uri `$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
"@

# Generar certificados SSL
New-Item -ItemType Directory -Force -Path "C:\servicedesk\ssl" | Out-Null
Set-Location "C:\servicedesk\ssl"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/C=MX/ST=State/L=City/O=ServiceDesk"

# Guardar configuración Nginx
$nginxConf | Out-File -FilePath "C:\tools\nginx\conf\extra\servicedesk.conf" -Encoding UTF8

# ============================================
# 8. Configurar variables de entorno
# ============================================
[Environment]::SetEnvironmentVariable("DATABASE_URL", "postgresql://servicedesk:ChangeMe123@localhost:5432/servicedesk", "User")
[Environment]::SetEnvironmentVariable("REDIS_URL", "redis://localhost:6379", "User")
[Environment]::SetEnvironmentVariable("JWT_SECRET", "ChangeMeToSomethingSecureInProduction", "User")
[Environment]::SetEnvironmentVariable("NODE_ENV", "production", "User")

# ============================================
# 9. Iniciar servicios
# ============================================
Write-Host "Iniciando servicios..." -ForegroundColor Yellow

# Reiniciar Nginx
Stop-Process nginx -ErrorAction SilentlyContinue
Start-Process nginx

# Iniciar API con nssm
choco install nssm -y
nssm install ServiceDeskAPI "C:\Program Files\nodejs\node.exe" "C:\servicedesk\src\api\dist\main.js"
nssm start ServiceDeskAPI

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Instalación completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Accede a: https://localhost" -ForegroundColor Cyan
Write-Host "  Email: admin@test.com" -ForegroundColor Cyan
Write-Host "  Password: admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ⚠️  Cambia las contraseñas en producción!" -ForegroundColor Red
