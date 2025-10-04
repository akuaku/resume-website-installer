#!/bin/bash

# Resume Website - One-Click Installer
# For Unraid/Docker environments

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Resume Website Installer${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Configuration, change to preferred installation path 
read -p "Enter installation path (default: /mnt/user/appdata/my-resume): " INSTALL_PATH
INSTALL_PATH=${INSTALL_PATH:-/mnt/user/appdata/my-resume}

#Replace with local server
read -p "Enter your server IP (default: 192.168.X.XXX): " SERVER_IP
SERVER_IP=${SERVER_IP:-192.168.X.XXX}

#Change to preferred ports
read -p "Enter Strapi port (default: 1338): " STRAPI_PORT
STRAPI_PORT=${STRAPI_PORT:-1338}

read -p "Enter frontend port (default: 3003): " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-3003}

read -p "Enter PostgreSQL password (default: strapi_password_change_me): " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-strapi_password_change_me}

read -p "Enter domain name (optional, press Enter to skip): " DOMAIN_NAME

echo ""
echo -e "${YELLOW}Installation Summary:${NC}"
echo "  Path: $INSTALL_PATH"
echo "  Server IP: $SERVER_IP"
echo "  Strapi: http://$SERVER_IP:$STRAPI_PORT"
echo "  Frontend: http://$SERVER_IP:$FRONTEND_PORT"
echo "  Domain: ${DOMAIN_NAME:-Not configured}"
echo ""
read -p "Continue with installation? (y/n): " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Starting installation...${NC}"

# Create directory structure
echo -e "${BLUE}[1/7]${NC} Creating directories..."
mkdir -p $INSTALL_PATH/frontend/{css,js}
cd $INSTALL_PATH

# Create nginx.conf
echo -e "${BLUE}[2/7]${NC} Creating nginx configuration..."
cat > nginx.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /strapi/ {
        proxy_pass http://resume-cms:1337/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    location /strapi/uploads/ {
        proxy_pass http://resume-cms:1337/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX_EOF

# Create docker-compose.yml
echo -e "${BLUE}[3/7]${NC} Creating Docker Compose configuration..."
cat > docker-compose.yml << COMPOSE_EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: resume-db
    environment:
      POSTGRES_DB: strapi
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: strapi_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - resume-network
    restart: unless-stopped

  strapi:
    image: strapi/strapi:latest
    container_name: resume-cms
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: strapi_password
      JWT_SECRET: your-jwt-secret
      ADMIN_JWT_SECRET: your-admin-jwt-secret
      APP_KEYS: your-app-keys
      API_TOKEN_SALT: your-api-token-salt-key
    volumes:
      - strapi_data:/srv/app
    ports:
      - "1338:1337"
    networks:
      - resume-network
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    image: nginx:alpine
    container_name: resume-frontend
    volumes:
      - /mnt/user/appdata/my-resume/frontend:/usr/share/nginx/html:ro
      - /mnt/user/appdata/my-resume/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "3003:80"
    networks:
      - resume-network
    depends_on:
      - strapi
    restart: unless-stopped

volumes:
  postgres_data:
  strapi_data:

networks:
  resume-network:
    driver: bridge
COMPOSE_EOF

# Copy frontend files
echo -e "${BLUE}[4/7]${NC} Copying frontend files..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/frontend" ]; then
    cp -r "$SCRIPT_DIR/frontend/"* $INSTALL_PATH/frontend/
    echo "Frontend files copied from package"
else
    echo "Warning: frontend folder not found in package. Skipping frontend files."
fi

# Start containers
echo -e "${BLUE}[5/7]${NC} Starting Docker containers..."
docker-compose up -d

# Wait for Strapi to be ready
echo -e "${BLUE}[6/7]${NC} Waiting for Strapi to initialize (this may take 2-3 minutes)..."
sleep 30

# Create setup instructions
echo -e "${BLUE}[7/7]${NC} Creating setup guide..."
cat > SETUP_GUIDE.md << GUIDE_EOF
# Resume Website - Setup Complete!

## Access URLs
- **Frontend**: http://$SERVER_IP:$FRONTEND_PORT
- **Strapi Admin**: http://$SERVER_IP:$STRAPI_PORT/admin

## Next Steps

### 1. Create Strapi Admin Account
Visit: http://$SERVER_IP:$STRAPI_PORT/admin
- Create your admin account
- This is a one-time setup

### 2. Create Content Types
Go to Content-Types Builder and create:

**Profile (Single Type)**
- name (Text)
- title (Text)
- bio (Rich Text)

**Skills (Collection Type)**
- name (Text)
- level (Text, optional)

**Education (Collection Type)**
- degree (Text)
- institution (Text)
- year (Text)
- description (Rich Text, optional)

**Experience (Collection Type)**
- position (Text)
- company (Text)
- period (Text)
- description (Rich Text, optional)

**Gallery (Collection Type)**
- title (Text)
- image (Media - Single)

### 3. Set Permissions
Settings → Roles → Public
Enable:
- profile: find
- skills: find
- educations: find
- experiences: find
- galleries: find

### 4. Add Content
Add your profile information, skills, education, experience, and gallery items

### 5. Configure Domain (Optional)
${DOMAIN_NAME:+Your domain: $DOMAIN_NAME}

Add to Nginx Proxy Manager:
\`\`\`
location /strapi/ {
    proxy_pass http://$SERVER_IP:$STRAPI_PORT/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}
\`\`\`

## Management Commands

### View logs
\`\`\`bash
docker logs resume-cms --tail 50
docker logs resume-frontend --tail 50
\`\`\`

### Restart services
\`\`\`bash
cd $INSTALL_PATH
docker-compose restart
\`\`\`

### Stop services
\`\`\`bash
cd $INSTALL_PATH
docker-compose down
\`\`\`

### Backup
\`\`\`bash
docker exec resume-db pg_dump -U strapi strapi > backup.sql
docker cp resume-cms:/srv/app/public/uploads ./uploads_backup
\`\`\`

## Troubleshooting

### Clear browser cache
Press Ctrl+Shift+R

### Rebuild containers
\`\`\`bash
cd $INSTALL_PATH
docker-compose down
docker-compose up -d --force-recreate
\`\`\`

### Check container status
\`\`\`bash
docker ps | grep resume
\`\`\`
GUIDE_EOF

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Installation Complete! 🎉${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit: http://$SERVER_IP:$STRAPI_PORT/admin"
echo "2. Create your admin account"
echo "3. Follow SETUP_GUIDE.md for content setup"
echo ""
echo -e "${BLUE}Quick commands:${NC}"
echo "  View logs: docker logs resume-cms --tail 50"
echo "  Restart: cd $INSTALL_PATH && docker-compose restart"
echo ""
echo -e "Setup guide saved to: ${GREEN}$INSTALL_PATH/SETUP_GUIDE.md${NC}"
