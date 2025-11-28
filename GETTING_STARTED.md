# 🚀 Getting Started - Flashcard App

Bu dokümanda projeyi local'de ve Docker ile çalıştırma adımları anlatılmıştır.

## 📋 Ön Koşullar

### Minimum Gereksinimler
- Node.js 20+
- npm 10+
- Docker & Docker Compose (Docker ile çalışmak için)

### Kurulum Kontrol
```bash
# Node.js/npm versiyonu kontrol
node --version  # v20.x.x
npm --version   # 10.x.x

# Docker kontrol
docker --version
docker-compose --version
```

## 🐳 Docker ile Başlangıç (Önerilen - 2 dakika)

En kolay yol! Bir komutla tüm sistem ayağa kalkıyor.

### 1. Repository'yi klonla
```bash
git clone <repo-url>
cd flashcard-app
```

### 2. Docker servisleri başlat
```bash
docker-compose up -d
```

**Neler olur:**
- PostgreSQL database (5432)
- Backend API (5000)
- Frontend app (3000)

### 3. Tarayıcında aç
```
http://localhost:3000
```

### 4. Testler
```bash
# Health check
curl http://localhost:5000/api/health
# Response: {"status":"Backend is running"}

# Database kontrol
docker-compose exec postgres psql -U flashcard_user -d flashcard_db -c "\dt"
```

### 5. Durdur / Temizle
```bash
# Sadece durdur
docker-compose stop

# Restart
docker-compose start

# Tümüyle kaldır
docker-compose down

# Volume ile tümüyle kaldır (DB silinecek)
docker-compose down -v
```

### Logs İzlemek
```bash
# Tüm servislerin logs
docker-compose logs -f

# Sadece backend
docker-compose logs -f backend

# Sadece frontend
docker-compose logs -f frontend

# Sadece database
docker-compose logs -f postgres
```

## 👨‍💻 Manuel Development Setup

Docker kullanmak istemiyorsan bu yol.

### Backend Kurulumu

#### 1. PostgreSQL Kur
Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

macOS (Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

Windows:
- [PostgreSQL installer](https://www.postgresql.org/download/windows/) indir ve kur
- psql komut satırını aç

#### 2. Database Oluştur
```bash
# PostgreSQL'e bağlan
psql -U postgres

# SQL komutları:
CREATE USER flashcard_user WITH PASSWORD 'flashcard_password';
CREATE DATABASE flashcard_db OWNER flashcard_user;
GRANT ALL PRIVILEGES ON DATABASE flashcard_db TO flashcard_user;
\q
```

#### 3. Backend Dependencies
```bash
cd backend
cp .env.example .env
# .env dosyasını kontrol et
npm install
```

#### 4. Backend Çalıştır
```bash
# Development mode (auto-reload)
npm run dev

# veya Production build
npm run build
npm start
```

Backend şimdi **http://localhost:5000** adresinde çalışıyor.

### Frontend Kurulumu

#### 1. Dependencies
```bash
cd frontend
npm install
```

#### 2. Development Server
```bash
npm run dev
```

Frontend şimdi **http://localhost:3000** adresinde çalışıyor.

#### 3. Production Build
```bash
npm run build
npm run preview
```

## 🧪 Uygulama Test Etme

### 1. Kayıt Ol
Frontend'e git → Register
- Username: `testuser`
- Email: `test@example.com`
- Password: `password123`

### 2. Giriş Yap
- Email: `test@example.com`
- Password: `password123`

### 3. Kelime Listesi Oluştur
- "Create New List" butonuna tıkla
- Title: `English Vocabulary`
- Description: `Daily English words`

### 4. Kart Ekle
- "Open" butonuyla listeyi aç
- "Add Card" butonuna tıkla
- Front (Word): `Serendipity`
- Usage Example: `Finding happiness by serendipity`
- Back (Translation): `Beklenilmeden güzel bir şeyin başına gelmesi`

### 5. Quiz Modu
- Kartı görüntülemek için kartın üzerine tıkla (flip)
- Ön yüz: İngilizce kelime
- Arka yüz: Türkçe çeviri

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000                                                              # Server port
DATABASE_URL=postgresql://user:pass@host:5432/dbname                 # DB connection
JWT_SECRET=your_super_secret_random_string_change_in_production      # JWT secret
NODE_ENV=development                                                  # development|production
```

### Frontend (.env.local) - Opsiyonel
```env
VITE_API_URL=http://localhost:5000/api  # Backend API URL
```

## 📁 Project Yapısı

```
flashcard-app/
├── backend/
│   ├── src/
│   │   ├── migrations/init.ts       # Database tabloları oluştur
│   │   ├── routes/
│   │   │   ├── auth.ts              # Login/Register
│   │   │   ├── wordlists.ts         # CRUD operations
│   │   │   └── cards.ts             # Card management
│   │   ├── middleware/auth.ts       # JWT verification
│   │   ├── db.ts                    # PostgreSQL connection
│   │   └── index.ts                 # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx            # Login page
│   │   │   ├── Register.tsx         # Register page
│   │   │   └── Dashboard.tsx        # Main dashboard
│   │   ├── components/
│   │   │   └── WordListView.tsx     # Flashcard quiz
│   │   ├── store/authStore.ts       # Zustand auth state
│   │   ├── api/client.ts            # Axios config
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── .github/workflows/
│   └── ci-cd.yml                    # GitHub Actions pipeline
├── docker-compose.yml               # Local development
├── README.md                        # Project overview
├── AWS_DEPLOYMENT.md                # AWS deployment guide
└── .gitignore
```

## 🐛 Troubleshooting

### Backend sorunları

**Error: "Cannot connect to database"**
```bash
# Database running mı kontrol et
docker-compose ps postgres
# veya manuel ise:
psql -U flashcard_user -d flashcard_db
```

**Error: "Port 5000 already in use"**
```bash
# Port kullanan process bul
lsof -i :5000
# veya docker-compose.yml'de port değiştir
```

**TypeScript errors**
```bash
cd backend
npm run build  # Compilation errors kontrol
```

### Frontend sorunları

**Error: "API connection failed"**
- Backend running mı? `curl http://localhost:5000/api/health`
- .env'de doğru API URL mı?
- CORS enabled mi?

**Error: "Cannot login"**
- Backend logs kontrol: `docker-compose logs backend`
- Token geçerli mi?
- Database'de user var mı?

### Database sorunları

**Error: "PostgreSQL connection refused"**
```bash
# Docker ile
docker-compose logs postgres

# Manual ise postgres service kontrol
sudo systemctl status postgresql
sudo systemctl start postgresql
```

**Error: "Permission denied for database"**
```bash
# Permissions reset
psql -U postgres
ALTER DATABASE flashcard_db OWNER TO flashcard_user;
GRANT ALL PRIVILEGES ON DATABASE flashcard_db TO flashcard_user;
```

## 📚 Sonraki Adımlar

1. **Git Repository Oluştur** - GitHub'a push et
2. **GitHub Actions** - CI/CD'yi çalıştırır
3. **AWS Deployment** - `AWS_DEPLOYMENT.md` oku
4. **Features Ekle**:
   - Quiz statistics & progress tracking
   - Multiple language support
   - Cloud backup
   - Mobile app (React Native)
5. **Performance** - Caching, optimization

## 🤝 Contribut Etmek

```bash
# Feature branch oluştur
git checkout -b feature/amazing-feature

# Değişiklikleri yap ve test et
npm run build
npm run dev

# Commit et
git commit -m "Add amazing feature"

# Push et
git push origin feature/amazing-feature

# Pull request oluştur
```

## 📞 Destek

Herhangi bir sorun? Kontrol listesi:

- [ ] Node.js 20+ kurulu mu?
- [ ] PostgreSQL çalışıyor mu?
- [ ] Port 3000, 5000, 5432 boş mu?
- [ ] .env dosyası doğru mu?
- [ ] `npm install` çalıştırdım mı?
- [ ] Database tabloları oluştu mu? (`\dt`)

## 📄 Lisans

MIT
