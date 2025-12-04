# Flashcard Learning App

This project is a full-stack vocabulary learning (Flashcard) application developed with DevOps practices (Docker, AWS, CI/CD). Users can create their own word lists, memorize words, and track their progress.

## Technologies

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (pg)
- **Database:** PostgreSQL 16
- **DevOps:** Docker, Docker Compose, GitHub Actions, AWS (EC2, RDS)

## Installation (Local Development)

Follow these steps to run the project in your local environment.

### Prerequisites

- Docker and Docker Compose
- Git
- Node.js (Optional, for local development without Docker)

### 1. Clone the Project

```bash
git clone https://github.com/ugurtiras/flashcard-app.git
cd flashcard-app
```

### 2. Environment Variables (.env)

You don't need to create a `.env` file in the root directory for local development, as `docker-compose.yml` contains the necessary default values. However, you can check `backend/.env.example` for customization.

### 3. Start the Application (Docker Compose)

Start the entire application (Frontend, Backend, Database) with a single command:

```bash
docker-compose up -d --build
```

This will start:
- **Frontend:** http://localhost:5173 (or 3000)
- **Backend API:** http://localhost:5000
- **PostgreSQL:** Port 5432

### 4. View Logs

```bash
docker-compose logs -f
```

### 5. Stop the Application

```bash
docker-compose down
```



## 🔄 CI/CD Pipeline

This project is automated using GitHub Actions:
1.  **Test:** Backend and Frontend tests are executed.
2.  **Build:** Docker images are built.
3.  **Push:** Images are pushed to Docker Hub and GHCR.
4.  **Deploy:** Automatic deployment to AWS EC2 server (Only on `main` branch).

