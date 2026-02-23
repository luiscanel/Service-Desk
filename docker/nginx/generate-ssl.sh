#!/bin/bash
# Script para generar certificados SSL auto-firmados
# Usage: ./generate-ssl.sh

echo "Generando certificados SSL auto-firmados..."

# Crear directorio para certificados
mkdir -p ssl

# Generar clave privada
openssl genrsa -out ssl/key.pem 2048

# Generar certificado
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 \
    -subj "/C=US/ST=State/L=City/O=ServiceDesk/CN=servicedesk.local"

echo "Certificados generados en ./ssl/"
echo "  - ssl/cert.pem (certificado)"
echo "  - ssl/key.pem (clave privada)"
