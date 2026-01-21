# Czysty Dom 🏠 - Deployment Guide

Aplikacja do zarządzania obowiązkami domowymi - wdrożona na **Vercel** z bazą danych **Upstash Redis**.

## 🚀 Deployment na Vercel

### Krok 1: Utwórz bazę danych Upstash Redis

1. Przejdź na [console.upstash.com](https://console.upstash.com)
2. Zaloguj się (lub utwórz konto - darmowe)
3. Kliknij **"Create Database"**
4. Wybierz:
   - **Name**: `czystydom`
   - **Region**: najbliższy Twojej lokalizacji
   - **Type**: Free (256 MB)
5. Kliknij **"Create"**
6. Skopiuj:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### Krok 2: Wdrożenie na Vercel

#### Opcja A: Przez CLI

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Deploy
vercel

# Dodaj zmienne środowiskowe
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN

# Deploy produkcyjny
vercel --prod
```

#### Opcja B: Przez GitHub

1. Wypchnij kod do GitHub:
   ```bash
   git add .
   git commit -m "Add Vercel deployment"
   git push
   ```

2. Przejdź na [vercel.com](https://vercel.com)
3. Kliknij **"Import Project"**
4. Wybierz swoje repozytorium
5. Dodaj zmienne środowiskowe:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
6. Kliknij **"Deploy"**

### Krok 3: Gotowe! 🎉

Aplikacja będzie dostępna pod adresem:
```
https://twoja-nazwa-projektu.vercel.app
```

## 📋 Wymagania

- Konto Vercel (darmowe)
- Konto Upstash (darmowe)
- Git repository (GitHub/GitLab/Bitbucket)

## 🔧 Lokalne uruchamianie

```bash
# 1. Zainstaluj zależności
npm install

# 2. Utwórz plik .env (skopiuj z .env.example)
cp .env.example .env

# 3. Uzupełnij wartości w .env
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...

# 4. Uruchom aplikację
npm run dev
```

Aplikacja będzie dostępna na:
- Frontend: http://localhost:4200
- API (local): http://localhost:3000

## 🌐 Funkcjonalności

✅ Automatyczny deployment przy każdym pushu  
✅ Bezserwerowe API (Serverless Functions)  
✅ Baza danych w chmurze (Upstash Redis)  
✅ HTTPS i globalny CDN  
✅ Darmowy hosting i baza danych  
✅ Synchronizacja między urządzeniami  

## 📁 Struktura projektu

```
czystydom/
├── api/
│   ├── todos.js              # GET, POST /api/todos
│   └── todos/
│       ├── [id].js           # PUT, DELETE /api/todos/:id
│       └── [id]/
│           └── clean.js      # PATCH /api/todos/:id/clean
├── src/
│   └── app/
│       ├── app.ts
│       ├── todo.service.ts
│       └── ...
├── vercel.json               # Konfiguracja Vercel
├── .env.example              # Przykład zmiennych
└── package.json
```

## 🔐 Bezpieczeństwo

- ✅ Zmienne środowiskowe są bezpieczne w Vercel
- ✅ CORS skonfigurowany
- ✅ HTTPS automatycznie
- ⚠️ Brak autoryzacji - każdy ma dostęp do API (dodaj auth jeśli potrzeba)

## 💰 Koszty

**Całkowicie DARMOWE** dla małych aplikacji:

- **Vercel**: Darmowy tier Hobby
  - Nieograniczone deployments
  - 100 GB bandwidth/miesiąc
  - Serverless Functions
  
- **Upstash**: Darmowy tier
  - 256 MB Redis
  - 10,000 poleceń dziennie

## 🆘 Troubleshooting

**Problem**: API nie działa lokalnie  
**Rozwiązanie**: Upewnij się, że `.env` ma poprawne wartości z Upstash

**Problem**: 500 error na produkcji  
**Rozwiązanie**: Sprawdź zmienne środowiskowe w Vercel Dashboard

**Problem**: CORS errors  
**Rozwiązanie**: API functions mają już CORS - upewnij się, że używasz `/api/todos`

## 📚 Dokumentacja

- [Vercel Docs](https://vercel.com/docs)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Angular Deployment](https://angular.dev/tools/cli/deployment)