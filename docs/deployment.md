# Production Deployment Guide

DOCUVERIFY is architected for cloud-native deployment across AWS, GCP, Azure, DigitalOcean, Railway, Render, or self-hosted Docker instances.

---

## 1. Environment Configuration

### Backend `.env`
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secure_random_64_character_hex_secret_here
JWT_EXPIRES_IN=7d

# Database Configuration (MySQL 8.0)
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=doc_admin
DB_PASSWORD=YourSecureProductionPassword_2026!
DB_NAME=student_doc_verification

# CORS & Domain Origin
CLIENT_URL=https://docuverify.yourdomain.edu
```

---

## 2. Production Build Steps

### Step 1: Initialize Database Schema
```bash
# Import production MySQL schema
mysql -u doc_admin -p student_doc_verification < backend/src/seeds/schema.mysql.sql

# Seed initial verified colleges & demo users
node backend/src/seeds/seed.js
```

### Step 2: Build Frontend SPA
```bash
cd frontend
npm install
npm run build
# Distributable assets generated in frontend/dist/
```

### Step 3: Run Backend Service (PM2 / Systemd)
```bash
cd backend
npm install --production
pm2 start src/server.js --name "docuverify-api" -i max
```

---

## 3. Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name docuverify.yourdomain.edu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name docuverify.yourdomain.edu;

    ssl_certificate /etc/letsencrypt/live/docuverify.yourdomain.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docuverify.yourdomain.edu/privkey.pem;

    # Frontend Static Files
    location / {
        root /var/www/docuverify/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M;
    }
}
```
