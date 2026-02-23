# Generate SSL certificates inside container
# This runs when container starts

if [ ! -f /etc/nginx/ssl/cert.pem ]; then
    echo "Generating self-signed SSL certificates..."
    mkdir -p /etc/nginx/ssl
    
    # Generate private key and certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=ServiceDesk/CN=servicedesk.local"
    
    echo "SSL certificates generated!"
else
    echo "SSL certificates already exist"
fi
