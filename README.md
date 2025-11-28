# Flashcard App

Anki benzeri kelime öğrenme uygulaması. React + Node.js + PostgreSQL + Docker.

## 🎯 Özellikler

- ✅ Kullanıcı kayıt ve login (JWT authentication)
- ✅ Kelime listeleri oluşturma
- ✅ Kelime kartları yönetimi (Ön yüz: kelime + örnek, Arka yüz: çeviri)
- ✅ Quiz modu - kartları çevirerek öğrenme
- ✅ Mobil responsive tasarım
- ✅ Docker ve docker-compose desteği
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ PostgreSQL veritabanı

## 📋 Teknoloji Stack

### Backend
- Node.js + Express.js
- TypeScript
- JWT Authentication
- bcryptjs (Password hashing)
- PostgreSQL
- pg (PostgreSQL client)

### Frontend
- React 19
- TypeScript
- Vite
- Axios (API calls)
- Zustand (State management)
- CSS3 (Responsive design)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS Free Tier deployment (RDS, AppRunner/ECS)

## 🚀 Hızlı Başlangıç

### Docker ile (Önerilen)

```bash
docker-compose up -d
```

Ardından açın:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- PostgreSQL: localhost:5432

### Manuel Kurulum

#### Backend

```bash
cd backend
cp .env.example .env
# .env dosyasını düzenle
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📁 Proje Yapısı

```
flashcard-app/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── migrations/      # Veritabanı tabloları
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── db.ts            # PostgreSQL bağlantısı
│   │   └── index.ts         # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                # React + Vite UI
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── store/           # Zustand store (Auth)
│   │   ├── api/             # API client
│   │   └── main.tsx         # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── .github/workflows/       # GitHub Actions CI/CD
├── docker-compose.yml       # Multi-container setup
└── .gitignore
```

## 🔐 Veritabanı Şeması

### Users
- `id` (PK)
- `username` (UNIQUE)
- `email` (UNIQUE)
- `password` (hashed)
- `created_at`

### Word Lists
- `id` (PK)
- `user_id` (FK)
- `title`
- `description`
- `created_at`, `updated_at`

### Cards
- `id` (PK)
- `list_id` (FK)
- `front` (Kelime/İfade)
- `front_example` (Kullanım örneği)
- `back` (Çeviri/Tanım)
- `created_at`, `updated_at`

### Quiz Progress
- `id` (PK)
- `user_id` (FK)
- `list_id` (FK)
- `card_id` (FK)
- `correct` (bool)
- `created_at`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kayıt
- `POST /api/auth/login` - Giriş

### Word Lists
- `GET /api/wordlists` - Tüm listeler
- `GET /api/wordlists/:id` - Liste detayı + kartlar
- `POST /api/wordlists` - Liste oluştur
- `PUT /api/wordlists/:id` - Liste güncelle
- `DELETE /api/wordlists/:id` - Liste sil

### Cards
- `POST /api/cards` - Kart ekle
- `PUT /api/cards/:id` - Kart güncelle
- `DELETE /api/cards/:id` - Kart sil

*Tüm endpoints (auth hariç) JWT token gerektirir: `Authorization: Bearer <token>`*

## 🔄 CI/CD Pipeline

GitHub Actions otomatik olarak:
1. Push veya PR olunca test çalıştırır
2. Backend ve frontend build eder
3. main/develop branch'e push'da Docker image oluşturur
4. GitHub Container Registry'ye push eder

`.github/workflows/ci-cd.yml` dosyasında tanımlıdır.

## ☁️ AWS Deployment

### Hazırlık
1. **RDS PostgreSQL** - AWS Free Tier DB oluştur
2. **ECR** - Docker image'ları kaydet
3. **AppRunner veya ECS** - Container'ları deploy et
4. **IAM Roles** - Uygun izinleri ayarla

### Steps (Yakında detaylı docs)
```bash
# AWS CLI yapılandırması
aws configure

# ECR'a push
aws ecr get-login-password | docker login --username AWS ...
docker push <ecr-uri>/flashcard-backend:latest
```

## 🛠 Development

### Backend
```bash
cd backend
npm run dev        # Geliştirme modu (ts-node + nodemon)
npm run build      # Production build
npm start          # Production çalış
```

### Frontend
```bash
cd frontend
npm run dev        # Geliştirme modu
npm run build      # Production build
npm run preview    # Build preview
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/flashcard_db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (.env) - Opsiyonel
```
VITE_API_URL=http://localhost:5000/api
```

## 📚 DevOps Öğrenme Noktaları

Bu proje aracılığıyla öğreneceklerin:
- ✅ Docker containerization
- ✅ Docker Compose multi-container orchestration
- ✅ GitHub Actions CI/CD automation
- ✅ PostgreSQL veritabanı yönetimi
- ✅ JWT authentication
- ✅ TypeScript type safety
- ✅ Production-ready code structure
- ✅ Cloud deployment (AWS)

## 📄 Lisans

MIT

## 👨‍💻 Geliştirici

DevOps öğrenme projesi - 2025
