# AWS EC2 + Docker Hub Deployment Guide

Flashcard uygulamasını AWS EC2 sunucusunda Docker ile çalıştırma ve DevOps öğrenme rehberi.

## Deployment Akışı

```
Local Development (docker-compose)
         ↓
GitHub Push (main branch)
         ↓
GitHub Actions (Build Docker images)
         ↓
Docker Hub Push (Image storage)
         ↓
EC2 Instance (Docker Pull + Run)
         ↓
Production App (3000/5000)
```

## Ön Koşullar

- AWS Account (Free Tier uygun - t2.micro)
- Docker Hub Account (Free)
- GitHub Repository
- AWS CLI yüklü (local machine'da)

---

## ADIM 1: Docker Hub Account Oluştur

1. https://hub.docker.com/ → Sign Up
2. Docker Hub Username oluştur (örn: `ugurtiras`)
3. Access Token oluştur:
   - Account Settings → Security → New Access Token
   - Token ismini gir: `github-actions`
   - Copy & save the token (sonra göremeyeceksin!)

---

## ADIM 2: AWS RDS PostgreSQL Database Oluştur

### AWS Console'dan:

1. **RDS Dashboard** → **Create Database**
2. **PostgreSQL** seç, **Free Tier** check
3. Konfigürasyon:
   ```
   DB instance identifier:  flashcard-db
   Master username:         dbadmin
   Master password:         StrongPassword123!@#
   DB name:                 flashcard_db
   Storage:                 20 GB
   Publicly accessible:     Yes (EC2'den connect için)
   ```
4. **Create Database** → ~5 dakika beklé

### Database Endpoint Notu
Oluştuktan sonra:
- **Endpoint**: `flashcard-db.xxxxx.eu-west-1.rds.amazonaws.com` (kopyala!)
- **Port**: 5432
- **Database**: flashcard_db
- **User**: dbadmin
- **Password**: StrongPassword123!@#

---

## ADIM 3: RDS Security Group Ayarla

EC2'nin database'e erişebilmesi için:

1. RDS Instance → **Connectivity & security**
2. **Security groups** bölümünde → VPC security group aç
3. **Inbound rules** → **Edit**:
   ```
   Type:        PostgreSQL
   Source:      Custom → EC2 Security Group ID gir
   (veya 0.0.0.0/0 test için, production'da değiştir)
   ```
4. Save rules

---

## ADIM 4: GitHub Secrets Ayarla

CI/CD'nin Docker Hub'a push etmesi için:

1. GitHub Repo → **Settings** → **Secrets and variables** → **Actions**
2. Şu secrets'ları ekle:

   | Secret Name | Value |
   |---|---|
   | `DOCKERHUB_USERNAME` | Docker Hub username (ugurtiras) |
   | `DOCKERHUB_TOKEN` | Docker Hub access token |

---

## ADIM 5: GitHub Actions CI/CD Pipeline Oluştur

`.github/workflows/docker-hub.yml` dosyasını oluştur:

```yaml
name: Build and Push to Docker Hub

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/flashcard-backend:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/flashcard-backend:${{ github.sha }}

      - name: Build and Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/flashcard-frontend:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/flashcard-frontend:${{ github.sha }}

      - name: Deployment Info
        run: |
          echo "✅ Images pushed to Docker Hub!"
          echo "Backend:  docker.io/${{ secrets.DOCKERHUB_USERNAME }}/flashcard-backend:latest"
          echo "Frontend: docker.io/${{ secrets.DOCKERHUB_USERNAME }}/flashcard-frontend:latest"
          echo "Now pull on EC2 and restart containers"
```

---

## ADIM 6: EC2 Instance Oluştur ve Docker Kur

### EC2 Instance Launch

1. **EC2 Dashboard** → **Launch Instance**
2. Konfigürasyon:
   ```
   AMI:              Ubuntu 24.04 LTS (free tier)
   Instance Type:    t2.micro (1 GB RAM)
   Key Pair:         Yeni key oluştur (flashcard-key.pem)
   Security Group:   
     - SSH (22):     0.0.0.0/0 → kendi IP'den kısıtla!
     - HTTP (80):    0.0.0.0/0
     - HTTPS (443):  0.0.0.0/0
     - TCP (3000):   0.0.0.0/0 (Frontend)
     - TCP (5000):   0.0.0.0/0 (Backend)
   Storage:          20 GB
   ```

### EC2'ye SSH Bağlan

```bash
chmod 600 flashcard-key.pem
ssh -i flashcard-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Docker Kur

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Logout ve login yap
exit
ssh -i flashcard-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## ADIM 7: EC2'de docker-compose.yml Oluştur

EC2'de:

```bash
mkdir -p /home/ubuntu/flashcard-app
cd /home/ubuntu/flashcard-app
```

`docker-compose.yml` oluştur:

```yaml
version: '3.8'

services:
  backend:
    image: ugurtiras/flashcard-backend:latest
    container_name: flashcard-backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://dbadmin:StrongPassword123!@#@flashcard-db.xxxxx.eu-west-1.rds.amazonaws.com:5432/flashcard_db
      JWT_SECRET: your_super_secret_jwt_key_12345
    restart: always

  frontend:
    image: ugurtiras/flashcard-frontend:latest
    container_name: flashcard-frontend
    ports:
      - "3000:5173"
    environment:
      VITE_API_URL: http://<EC2_PUBLIC_IP>:5000/api
    restart: always
    depends_on:
      - backend
```

**NOT:** Şu yerleri değiştir:
- `ugurtiras` → Senin Docker Hub username'in
- `StrongPassword123!@#` → RDS password'ün
- `flashcard-db.xxxxx.eu-west-1.rds.amazonaws.com` → RDS endpoint'in
- `<EC2_PUBLIC_IP>` → EC2'nin public IP adresi

---

## ADIM 8: Containers'ı Çalıştır

EC2'de:

```bash
# Docker Hub'dan images'ları indir
docker-compose pull

# Containers'ı başlat
docker-compose up -d

# Status kontrol et
docker-compose ps

# Logs kontrol et
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## ADIM 9: Health Check

```bash
# Backend health
curl http://<EC2_PUBLIC_IP>:5000/api/health

# Frontend
curl http://<EC2_PUBLIC_IP>:3000/

# Browser'da test
# Frontend: http://<EC2_PUBLIC_IP>:3000
# Backend: http://<EC2_PUBLIC_IP>:5000/api/health
```

---

## ADIM 10: Otomatik Update Script

EC2'de `/home/ubuntu/deploy.sh` oluştur:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Flashcard App..."
cd /home/ubuntu/flashcard-app

# Images'ı indir
echo "📥 Pulling latest images..."
docker-compose pull

# Containers'ı restart et
echo "🔄 Restarting containers..."
docker-compose down
docker-compose up -d

echo "✅ Deployment complete!"
docker-compose ps
```

Çalıştırabilir yap:
```bash
chmod +x /home/ubuntu/deploy.sh
```

---

## ADIM 11: Cron Job ile Otomatik Deploy (Opsiyonel)

Her 15 dakika images'ı kontrol et ve otomatik update et:

```bash
crontab -e

# Aşağıdaki satırı ekle:
*/15 * * * * /home/ubuntu/deploy.sh >> /home/ubuntu/deploy.log 2>&1
```

Otomatik deploy aktif!

---

## ADIM 12: GitHub Push ve Deploy

Local machine'dan:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions otomatik olarak:
1. ✅ Backend image build
2. ✅ Frontend image build
3. ✅ Docker Hub push

EC2'de manual update:
```bash
./deploy.sh
```

Veya cron job zaten otomatik yapıyor.

---

## 🔍 DevOps Komutları

### EC2'de Logs Görüntüle

```bash
# Backend logs
docker logs -f flashcard-backend

# Frontend logs
docker logs -f flashcard-frontend

# System resources
top
df -h
docker stats
```

### Database Connection Test

```bash
# RDS'ye bağlan
psql -h flashcard-db.xxxxx.rds.amazonaws.com \
  -U dbadmin \
  -d flashcard_db \
  -c "SELECT version();"
```

### Container Yönetimi

```bash
# Restart
docker-compose restart

# Logs (tail)
docker-compose logs -f

# Stop
docker-compose down

# Remove volumes (⚠️ Dikkat!)
docker-compose down -v
```

---

## 💰 AWS Free Tier Maliyeti

| Hizmet | Saat/Ay | Bedava | 
|--------|---------|--------|
| EC2 t2.micro | 750 | ✅ 12 ay |
| RDS PostgreSQL | 750 | ✅ 12 ay |
| Data Transfer | 100 GB | ✅ 12 ay |
| **Total** | - | **$0/month** |

---

## ⚠️ Production Checklist

- [ ] JWT_SECRET random ve güçlü (128+ char)
- [ ] Database password güçlü
- [ ] EC2 Security Group restrictive (SSH: sadece kendi IP)
- [ ] RDS publicAccessible = false (production'da)
- [ ] Backup strategy (RDS auto-backup enable)
- [ ] Monitoring setup (CloudWatch)
- [ ] Error logging
- [ ] API rate limiting

---

## 🆘 Troubleshooting

### Container çalışmıyor

```bash
docker logs flashcard-backend
docker logs flashcard-frontend

# Restart
docker-compose restart
```

### Database bağlanamıyor

```bash
# RDS Security Group kontrol et (inbound rule EC2'nin SG'sini kapsıyor mu?)
# Database endpoint doğru mu?
# Password doğru mu?

# Test et
psql -h <RDS_ENDPOINT> -U dbadmin -d flashcard_db -c "SELECT 1;"
```

### Images eski kaldı

```bash
docker-compose pull
docker-compose down
docker-compose up -d
```

### EC2 SSH bağlanamıyorum

```bash
# Key permissions
chmod 600 flashcard-key.pem

# Verbose output
ssh -vvv -i flashcard-key.pem ubuntu@<IP>

# Security Group kontrol et (SSH port 22 açık mı?)
```

---

## 📚 Öğreneceklerin

Bu deployment ile DevOps bilgisi kazanacaksın:

- ✅ Docker containerization
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Container registry (Docker Hub)
- ✅ Cloud infrastructure (AWS EC2, RDS)
- ✅ Infrastructure management
- ✅ Deployment automation
- ✅ Monitoring & logging basics
- ✅ Security best practices

---

## 🎓 Sonraki Adımlar

1. **Reverse Proxy**: Nginx ile load balancing
2. **SSL/TLS**: Let's Encrypt certificates
3. **Kubernetes**: Docker Swarm veya K8s
4. **Infrastructure as Code**: Terraform
5. **Monitoring**: Prometheus + Grafana
6. **Logging**: ELK Stack

---

**Başarılar! DevOps journey'ine hoş geldin! 🚀**
